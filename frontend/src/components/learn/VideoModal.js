import React, { useState } from 'react';
import { X, Video } from 'lucide-react';
import { Button } from '../ui/button';
import ChatSection from './ChatSection';
import SummarySection from './SummarySection';
import MoreVideosSection from './MoreVideosSection';

const VideoModal = ({ topic, links, onClose, onComplete }) => {
  const [activeSection, setActiveSection] = useState('chat');

  console.log('VideoModal received:', { topic, links });
  const hasVideos = links && links.length > 0;
  
  // Extract video ID from first link
  let videoId = null;
  if (hasVideos && links[0]) {
    const firstLink = links[0];
    // Check if it's a direct video link
    if (firstLink.includes('watch?v=')) {
      videoId = firstLink.split('v=')[1]?.split('&')[0];
    } else if (firstLink.includes('youtu.be/')) {
      videoId = firstLink.split('youtu.be/')[1]?.split('?')[0];
    } else if (firstLink.includes('search_query=')) {
      // It's a search URL, open it in new tab and show message
      videoId = null;
    }
  }

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
          {videoId ? (
            <div className="aspect-video w-full max-w-4xl mx-auto mb-6">
              <iframe
                className="w-full h-full rounded-lg shadow-lg"
                src={`https://www.youtube.com/embed/${videoId}`}
                title={topic}
                allowFullScreen
              />
            </div>
          ) : hasVideos && links[0] ? (
            <div className="aspect-video w-full max-w-4xl mx-auto mb-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-slate-800 dark:to-slate-700 rounded-lg flex flex-col items-center justify-center p-8 border-2 border-yellow-200 dark:border-purple-600">
              <Video className="w-20 h-20 text-yellow-600 dark:text-purple-400 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Find Videos for {topic}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-center mb-4">
                Click below to search YouTube for videos about this topic
              </p>
              <a
                href={links[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 dark:from-purple-600 dark:to-indigo-600 dark:hover:from-purple-700 dark:hover:to-indigo-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
              >
                Search YouTube Videos
              </a>
            </div>
          ) : (
            <div className="aspect-video w-full max-w-4xl mx-auto mb-6 bg-slate-100 dark:bg-slate-800 rounded-lg flex flex-col items-center justify-center">
              <Video className="w-16 h-16 text-slate-400 dark:text-slate-500 mb-4 animate-pulse" />
              <p className="text-slate-600 dark:text-slate-400 text-center px-4">
                Loading videos...
              </p>
            </div>
          )}

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
