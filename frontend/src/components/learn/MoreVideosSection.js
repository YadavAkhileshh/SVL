import React, { useState, useEffect } from 'react';
import { ExternalLink, Video } from 'lucide-react';

const VideoCard = ({ link, index }) => {
  const [title, setTitle] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideoInfo = async () => {
      try {
        const videoId = link.split('v=')[1]?.split('&')[0];
        if (!videoId) {
          setTitle(`Video ${index + 1}`);
          setLoading(false);
          return;
        }

        setThumbnail(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
        
        // Fetch title using noembed API
        const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
        const data = await response.json();
        setTitle(data.title || `Video ${index + 1}`);
      } catch (error) {
        console.error('Error fetching video info:', error);
        setTitle(`Video ${index + 1}`);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoInfo();
  }, [link, index]);

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white dark:bg-slate-800">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-48 bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
            <Video className="w-12 h-12 text-slate-400 dark:text-slate-500" />
          </div>
        )}
        <div className="p-4">
          <h4 className="font-semibold text-sm line-clamp-2 text-slate-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-purple-400 transition-colors">
            {loading ? 'Loading...' : title}
          </h4>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-600 dark:text-slate-400">
            <ExternalLink className="w-3 h-3" />
            <span>Watch on YouTube</span>
          </div>
        </div>
      </div>
    </a>
  );
};

const MoreVideosSection = ({ links }) => {
  if (!links || links.length === 0) {
    return (
      <div className="text-center py-12 text-slate-600 dark:text-slate-400">
        <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p>No additional videos available</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
        <Video className="w-5 h-5 text-yellow-600 dark:text-purple-400" />
        More Videos on This Topic
      </h3>
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6" style={{ minWidth: 'max-content' }}>
          {links.map((link, index) => (
            <div key={index} className="w-80 flex-shrink-0">
              <VideoCard link={link} index={index} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoreVideosSection;
