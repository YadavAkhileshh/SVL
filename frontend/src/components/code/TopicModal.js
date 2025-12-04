import React, { useState, useEffect } from 'react';
import { X, Play, Code2, CheckCircle, ExternalLink, MessageCircle, Loader2, Youtube, Globe } from 'lucide-react';
import { Button } from '../ui/button';
import { API_BASE_URL } from '../../config/api';
import { motion } from 'framer-motion';

const TopicModal = ({ topic, language, isCompleted, onComplete, onClose }) => {
  const [resources, setResources] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('videos');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    fetchResources();
  }, [topic]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/code/get-resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: language.id,
          topic: topic.title
        })
      });

      if (!response.ok) throw new Error('Failed to fetch resources');
      const data = await response.json();
      setResources(data);
    } catch (error) {
      console.error('Error:', error);
      setResources({
        videos: [],
        practice: [],
        description: 'Failed to load resources. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setChatLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/code/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: language.id,
          topic: topic.title,
          message: userMessage
        })
      });

      if (!response.ok) throw new Error('Chat failed');
      const data = await response.json();
      setChatMessages(prev => [...prev, { type: 'bot', text: data.response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, {
        type: 'bot',
        text: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${language.color} dark:${language.darkColor} p-6 text-white`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{language.icon}</span>
              <div>
                <h2 className="text-2xl font-bold">{topic.title}</h2>
                <p className="text-white/80 text-sm">{language.name} • {topic.level}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={onComplete}
                className={`${
                  isCompleted
                    ? 'bg-white/20 hover:bg-white/30'
                    : 'bg-white text-slate-900 hover:bg-white/90'
                }`}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Completed
                  </>
                ) : (
                  'Mark Complete'
                )}
              </Button>
              <Button onClick={onClose} variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex-1 px-6 py-4 font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'videos'
                ? 'border-b-2 border-yellow-500 dark:border-purple-500 text-yellow-600 dark:text-purple-400 bg-yellow-50 dark:bg-purple-900/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Youtube className="w-4 h-4" />
            Videos
          </button>
          <button
            onClick={() => setActiveTab('practice')}
            className={`flex-1 px-6 py-4 font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'practice'
                ? 'border-b-2 border-yellow-500 dark:border-purple-500 text-yellow-600 dark:text-purple-400 bg-yellow-50 dark:bg-purple-900/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            Practice
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 px-6 py-4 font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'chat'
                ? 'border-b-2 border-yellow-500 dark:border-purple-500 text-yellow-600 dark:text-purple-400 bg-yellow-50 dark:bg-purple-900/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Ask AI
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-12 h-12 animate-spin text-yellow-600 dark:text-purple-400" />
            </div>
          ) : (
            <>
              {/* Videos Tab */}
              {activeTab === 'videos' && (
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    {resources?.description || 'Watch these curated videos to master this topic.'}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resources?.videos?.map((video, index) => (
                      <motion.a
                        key={index}
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="block group"
                      >
                        <div className="border-2 border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:border-yellow-500 dark:hover:border-purple-500 transition-all hover:shadow-xl bg-white dark:bg-slate-800">
                          <div className="aspect-video bg-slate-100 dark:bg-slate-900 flex items-center justify-center relative overflow-hidden">
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="w-16 h-16 text-white" />
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 mb-2">
                              {video.title}
                            </h3>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600 dark:text-slate-400">{video.channel}</span>
                              <ExternalLink className="w-4 h-4 text-slate-400" />
                            </div>
                          </div>
                        </div>
                      </motion.a>
                    ))}
                  </div>
                </div>
              )}

              {/* Practice Tab */}
              {activeTab === 'practice' && (
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Practice your skills with these interactive coding platforms.
                  </p>
                  <div className="space-y-4">
                    {resources?.practice?.map((site, index) => (
                      <motion.a
                        key={index}
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="block group"
                      >
                        <div className="border-2 border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:border-yellow-500 dark:hover:border-purple-500 transition-all hover:shadow-xl bg-white dark:bg-slate-800">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${language.color} dark:${language.darkColor} flex items-center justify-center`}>
                                  <Code2 className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                    {site.name}
                                  </h3>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {site.type}
                                  </p>
                                </div>
                              </div>
                              <p className="text-slate-600 dark:text-slate-400 mt-3">
                                {site.description}
                              </p>
                            </div>
                            <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-yellow-600 dark:group-hover:text-purple-400 transition-colors" />
                          </div>
                        </div>
                      </motion.a>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Tab */}
              {activeTab === 'chat' && (
                <div className="flex flex-col h-[500px]">
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {chatMessages.length === 0 && (
                      <div className="text-center text-slate-600 dark:text-slate-400 py-12">
                        <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="mb-2">Ask me anything about {topic.title}!</p>
                        <p className="text-sm">I'm here to help clarify concepts and answer your coding questions.</p>
                      </div>
                    )}
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-xl px-4 py-3 ${
                            msg.type === 'user'
                              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-purple-600 dark:to-indigo-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 flex items-center gap-2 border border-slate-200 dark:border-slate-700">
                          <Loader2 className="w-4 h-4 animate-spin text-yellow-600 dark:text-purple-400" />
                          <span className="text-sm text-slate-900 dark:text-white">Thinking...</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <form onSubmit={handleChat} className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={`Ask about ${topic.title}...`}
                      disabled={chatLoading}
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-yellow-500 dark:focus:border-purple-500 focus:outline-none"
                    />
                    <Button
                      type="submit"
                      disabled={chatLoading || !chatInput.trim()}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 dark:from-purple-600 dark:to-indigo-600 dark:hover:from-purple-700 dark:hover:to-indigo-700 text-white px-6"
                    >
                      Send
                    </Button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TopicModal;
