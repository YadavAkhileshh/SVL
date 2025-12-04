import React, { useState, useEffect } from 'react';
import { Loader2, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const SummarySection = ({ videoId }) => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSummary = async () => {
    if (!videoId) {
      setError('Invalid video ID');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:8000/api/learn/summary?video_id=${videoId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to generate summary');
      }
      
      const data = await response.json();
      if (data && data.summary) {
        setSummary(data.summary);
      } else {
        throw new Error('No summary received');
      }
    } catch (err) {
      console.error('Summary error:', err);
      setError(err.message || 'Failed to generate summary. The video might not have captions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (videoId) {
      fetchSummary();
    }
  }, [videoId]);

  return (
    <div className="p-4">
      {!summary && !loading && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
          <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">Video Summary</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Get an AI-generated summary of this video
          </p>
          <Button onClick={fetchSummary} className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 dark:from-purple-600 dark:to-indigo-600 dark:hover:from-purple-700 dark:hover:to-indigo-700 text-white shadow-lg">
            Generate Summary
          </Button>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-yellow-600 dark:text-purple-400" />
          <p className="text-slate-600 dark:text-slate-400">Generating summary...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg p-4 mb-4 border border-red-200 dark:border-red-800">
            <p className="font-semibold mb-2">Error</p>
            <p className="text-sm">{error}</p>
          </div>
          <Button onClick={fetchSummary} variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
            Try Again
          </Button>
        </div>
      )}

      {summary && (
        <div className="prose dark:prose-invert max-w-none">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
              <FileText className="w-5 h-5 text-yellow-600 dark:text-purple-400" />
              Video Summary
            </h3>
            <div className="text-slate-700 dark:text-slate-300">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {summary}
              </ReactMarkdown>
            </div>
          </div>
          <div className="mt-4 text-center">
            <Button onClick={fetchSummary} variant="outline" size="sm" className="border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
              Regenerate Summary
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummarySection;
