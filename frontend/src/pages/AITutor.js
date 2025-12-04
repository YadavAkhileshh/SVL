import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { ArrowLeft, Send, MessageCircle, Bot, User, Loader2, Sparkles, Brain, BookOpen } from 'lucide-react';
import { ThemeToggle } from '../components/ui/theme-toggle';

const AITutor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const studyData = location.state?.studyData;
  
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    `Can you explain ${studyData?.topic} in simple terms?`,
    `What are the key applications of ${studyData?.topic}?`,
    `How does ${studyData?.topic} work step-by-step?`,
    `What are common misconceptions about ${studyData?.topic}?`,
    `Show me a formula or equation for ${studyData?.topic}`,
    `Give me a real-world example of ${studyData?.topic}`,
    `What are the pros and cons of ${studyData?.topic}?`,
    `How is ${studyData?.topic} used in industry?`
  ];

  useEffect(() => {
    if (studyData) {
      setMessages([{
        type: 'bot',
        content: `Hello! I'm your AI tutor for "${studyData.topic}". I'm here to help you understand the concepts better. Feel free to ask me any questions about the topic!`,
        timestamp: new Date()
      }]);
    }
  }, [studyData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!studyData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 flex items-center justify-center">
        <Card className="max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle>No Study Data Found</CardTitle>
            <CardDescription>Please process a video first to access the AI tutor</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full bg-gradient-to-r from-yellow-500 to-orange-500">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim() || loading) return;

    const userMessage = {
      type: 'user',
      content: message.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_id: studyData.video_id,
          message: message.trim()
        })
      });

      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      
      const botMessage = {
        type: 'bot',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        type: 'bot',
        content: `I'm having trouble connecting right now. Let me help you with ${studyData.topic}. It's an important concept that involves understanding the fundamental principles and their practical applications.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderVisualization = (type, data) => {
    if (type === 'formula') {
      return (
        <div className="my-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-700">
          <div className="text-center">
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">FORMULA</div>
            <div className="text-2xl font-mono font-bold text-blue-900 dark:text-blue-100">{data}</div>
          </div>
        </div>
      );
    }
    if (type === 'steps') {
      return (
        <div className="my-4 space-y-2">
          {data.map((step, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border-l-4 border-green-500">
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</div>
              <span className="text-sm">{step}</span>
            </div>
          ))}
        </div>
      );
    }
    if (type === 'comparison') {
      return (
        <div className="my-4 grid grid-cols-2 gap-4">
          {data.map((item, i) => (
            <div key={i} className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-700">
              <div className="font-semibold text-purple-600 dark:text-purple-400 mb-2">{item.title}</div>
              <div className="text-sm">{item.description}</div>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatBotMessage = (content) => {
    // Detect and render formulas
    if (content.includes('=') && (content.includes('+') || content.includes('-') || content.includes('*') || content.includes('/'))) {
      const formulaMatch = content.match(/([A-Za-z0-9\s=+\-*/()^.]+)/g);
      if (formulaMatch) {
        const parts = content.split(formulaMatch[0]);
        return (
          <>
            {parts[0] && <p className="my-2">{parts[0]}</p>}
            {renderVisualization('formula', formulaMatch[0])}
            {parts[1] && <p className="my-2">{parts[1]}</p>}
          </>
        );
      }
    }

    // Split by double newlines for paragraphs
    const parts = content.split('\n\n');
    
    return parts.map((part, idx) => {
      // Handle bullet points
      if (part.includes('•')) {
        const lines = part.split('\n').filter(l => l.trim());
        return (
          <ul key={idx} className="space-y-2 my-3">
            {lines.map((line, i) => {
              const cleanLine = line.replace(/^•\s*/, '').trim();
              return cleanLine ? (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>{highlightKeyTerms(cleanLine)}</span>
                </li>
              ) : null;
            })}
          </ul>
        );
      }
      
      // Handle numbered lists
      if (/^\d+\./.test(part.trim())) {
        const lines = part.split('\n').filter(l => l.trim());
        return (
          <ol key={idx} className="space-y-2 my-3 list-decimal list-inside">
            {lines.map((line, i) => {
              const cleanLine = line.replace(/^\d+\.\s*/, '').trim();
              return cleanLine ? (
                <li key={i} className="ml-2">{highlightKeyTerms(cleanLine)}</li>
              ) : null;
            })}
          </ol>
        );
      }
      
      // Handle code blocks
      if (part.includes('CODE_START')) {
        const code = part.replace('CODE_START', '').replace('CODE_END', '').trim();
        return (
          <pre key={idx} className="bg-gray-900 text-green-400 p-4 rounded-lg my-3 overflow-x-auto">
            <code>{code}</code>
          </pre>
        );
      }
      
      // Regular paragraph
      return part.trim() ? (
        <p key={idx} className="my-3 leading-relaxed">
          {highlightKeyTerms(part)}
        </p>
      ) : null;
    });
  };

  const highlightKeyTerms = (text) => {
    // Highlight terms in [brackets]
    const parts = text.split(/\[([^\]]+)\]/);
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        return (
          <span key={idx} className="font-semibold text-yellow-700 bg-yellow-100 px-1 rounded">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-yellow-300/20 to-amber-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-orange-300/20 to-yellow-300/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex-shrink-0 relative z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={() => navigate('/study', { state: { studyData } })}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Study
              </Button>
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">AI Tutor</h1>
                <p className="text-sm text-slate-700 font-medium">{studyData.topic}</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex-1 flex max-w-6xl mx-auto w-full relative z-10">
        {/* Suggested Questions Sidebar */}
        <div className="w-80 border-r border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md p-6 hidden lg:block overflow-y-auto">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-yellow-600 dark:text-purple-400" />
            <h3 className="font-semibold text-slate-900 dark:text-white">Suggested Questions</h3>
          </div>
          <div className="space-y-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(question)}
                className="w-full text-left p-3 text-xs bg-white/80 dark:bg-slate-800/80 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 dark:hover:from-purple-900/30 dark:hover:to-indigo-900/30 rounded-lg transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-yellow-400 dark:hover:border-purple-500 hover:shadow-md hover:scale-[1.02]"
                disabled={loading}
              >
                {question}
              </button>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-yellow-200 dark:border-purple-700">
            <h4 className="font-semibold text-sm mb-2 text-yellow-800 dark:text-purple-300">💡 Pro Tips</h4>
            <ul className="text-xs space-y-1 text-yellow-700 dark:text-purple-200">
              <li>• Ask for formulas and equations</li>
              <li>• Request step-by-step explanations</li>
              <li>• Ask for real-world examples</li>
              <li>• Compare concepts</li>
            </ul>
          </div>

          <div className="mt-6">
            <h4 className="font-medium text-slate-900 dark:text-white mb-3 text-sm">Study Progress</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                <span className="text-slate-600 dark:text-slate-300">Flashcards</span>
                <span className="font-semibold text-purple-600 dark:text-purple-400">{studyData.flashcards.length}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                <span className="text-slate-600 dark:text-slate-300">Quiz Questions</span>
                <span className="font-semibold text-green-600 dark:text-green-400">{studyData.quiz_questions.length}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                <span className="text-slate-600 dark:text-slate-300">Key Points</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{studyData.key_points.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex space-x-3 max-w-3xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                      : 'bg-gradient-to-br from-yellow-400 to-orange-500'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Brain className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className={`rounded-2xl p-4 shadow-lg backdrop-blur-sm ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
                      : 'bg-white/90 dark:bg-slate-800/90 border border-amber-200 dark:border-purple-700'
                  }`}>
                    {message.type === 'user' ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    ) : (
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {formatBotMessage(message.content)}
                      </div>
                    )}
                    <div className={`text-xs mt-2 font-medium ${
                      message.type === 'user' ? 'text-blue-100' : 'text-slate-400'
                    }`}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
            
            {loading && (
              <div className="flex justify-start">
                <div className="flex space-x-3 max-w-3xl">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-white/90 border border-amber-200 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-yellow-600" />
                      <span className="text-slate-700 font-medium">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-amber-200 bg-white/80 backdrop-blur-md p-6">
            <div className="flex space-x-4">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask me anything about ${studyData.topic}...`}
                disabled={loading}
                className="flex-1 border-amber-200 focus:border-yellow-400 focus:ring-yellow-400"
              />
              <Button 
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || loading}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITutor;
