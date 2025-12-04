import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import ChatSection from './ChatSection';
import SummarySection from './SummarySection';
import MoreVideosSection from './MoreVideosSection';

const VideoModal = ({ topic, links, onClose, onComplete }) => {
  const [activeSection, setActiveSection] = useState('chat');

  if (!links || links.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-card p-8 rounded-lg max-w-md" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-xl font-bold mb-4">No Videos Available</h3>
          <p className="text-muted-foreground mb-4">No videos found for this topic. Try searching on YouTube directly.</p>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    );
  }

  const videoId = links[0]?.split('v=')[1]?.split('&')[0];

  const renderSection = () => {
    switch (activeSection) {
      case 'chat':
        return <ChatSection topic={topic} />;
      case 'summary':
        return <SummarySection videoId={videoId} />;
      case 'more-videos':
        return <MoreVideosSection links={links.slice(1)} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-end z-50" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 w-full md:w-3/4 h-full overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{topic}</h2>
          <Button onClick={onClose} variant="ghost" size="sm">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Video Player */}
        <div className="p-6">
          <div className="aspect-video w-full max-w-4xl mx-auto mb-6">
            <iframe
              className="w-full h-full rounded-lg shadow-lg"
              src={`https://www.youtube.com/embed/${videoId}`}
              title={topic}
              allowFullScreen
            />
          </div>

          {/* Section Tabs */}
          <div className="flex flex-wrap gap-2 sm:gap-4 border-b border-slate-200 dark:border-slate-700 mb-6 pb-2">
            {onComplete && (
              <Button
                onClick={() => {
                  onComplete();
                  onClose();
                }}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all"
                size="sm"
              >
                Mark Complete
              </Button>
            )}
            <button
              className={`px-4 py-3 font-medium transition-colors ${
                activeSection === 'chat'
                  ? 'border-b-2 border-yellow-500 dark:border-purple-500 text-yellow-600 dark:text-purple-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              onClick={() => setActiveSection('chat')}
            >
              Chat
            </button>
            <button
              className={`px-4 py-3 font-medium transition-colors ${
                activeSection === 'summary'
                  ? 'border-b-2 border-yellow-500 dark:border-purple-500 text-yellow-600 dark:text-purple-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              onClick={() => setActiveSection('summary')}
            >
              Summary
            </button>
            <button
              className={`px-4 py-3 font-medium transition-colors ${
                activeSection === 'more-videos'
                  ? 'border-b-2 border-yellow-500 dark:border-purple-500 text-yellow-600 dark:text-purple-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              onClick={() => setActiveSection('more-videos')}
            >
              More Videos
            </button>
          </div>

          {/* Section Content */}
          <div className="min-h-[400px]">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
