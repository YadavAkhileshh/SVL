import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatSection = ({ topic }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/learn/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_id: 'learn', message: userMessage })
      });

      if (!response.ok) throw new Error('Chat failed');
      
      const data = await response.json();
      setMessages(prev => [...prev, { type: 'bot', text: data.response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4">
        {messages.length === 0 && (
          <div className="text-center text-slate-600 dark:text-slate-400 py-8">
            <p className="mb-2">Ask me anything about {topic}!</p>
            <p className="text-sm">I'm here to help you understand the concepts better.</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                msg.type === 'user'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-purple-600 dark:to-indigo-600 text-white shadow-lg'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
              }`}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.text}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg px-4 py-3 flex items-center gap-2 border border-slate-200 dark:border-slate-700">
              <Loader2 className="w-4 h-4 animate-spin text-yellow-600 dark:text-purple-400" />
              <span className="text-sm text-slate-900 dark:text-white">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex gap-2">
        <Input
          type="text"
          placeholder={`Ask about ${topic}...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          className="flex-1 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
        />
        <Button type="submit" disabled={loading || !input.trim()} className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 dark:from-purple-600 dark:to-indigo-600 dark:hover:from-purple-700 dark:hover:to-indigo-700 text-white shadow-lg">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatSection;
