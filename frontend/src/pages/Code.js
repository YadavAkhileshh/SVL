import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ArrowLeft, Code2, Play, Star } from 'lucide-react';
import { ThemeToggle } from '../components/ui/theme-toggle';
import { motion } from 'framer-motion';
import LearningTree from '../components/code/LearningTree';

const LANGUAGES = [
  {
    id: 'python',
    name: 'Python',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
    color: 'from-blue-500 to-cyan-500',
    description: 'Learn Python from basics to advanced',
    topics: 15,
    videos: 45,
    popular: true
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
    color: 'from-yellow-500 to-orange-500',
    description: 'Master modern JavaScript & ES6+',
    topics: 18,
    videos: 54,
    popular: true
  },
  {
    id: 'java',
    name: 'Java',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
    color: 'from-red-500 to-orange-500',
    description: 'Object-oriented programming',
    topics: 16,
    videos: 48,
    popular: false
  },
  {
    id: 'cpp',
    name: 'C++',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg',
    color: 'from-blue-600 to-indigo-600',
    description: 'System programming & algorithms',
    topics: 14,
    videos: 42,
    popular: false
  },
  {
    id: 'react',
    name: 'React',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
    color: 'from-cyan-500 to-blue-500',
    description: 'Build modern web applications',
    topics: 12,
    videos: 36,
    popular: true
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
    color: 'from-green-500 to-emerald-500',
    description: 'Backend development with Node',
    topics: 13,
    videos: 39,
    popular: false
  }
];

const Code = () => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [filter, setFilter] = useState('all');

  if (selectedLanguage) {
    return <LearningTree language={selectedLanguage} onBack={() => setSelectedLanguage(null)} />;
  }

  const filteredLanguages = LANGUAGES.filter(lang => {
    if (filter === 'popular') return lang.popular;
    if (filter === 'beginner') return true; // All have beginner level
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">

      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button onClick={() => navigate('/')} variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-purple-600 dark:to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Code2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    Code Learning
                  </h1>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Learn it. Code it. Remember it.</p>
                </div>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-50 dark:bg-purple-900/20 border border-orange-200 dark:border-purple-800 mb-6">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500 dark:bg-purple-500"></span>
              </span>
              <span className="text-sm font-semibold text-orange-700 dark:text-purple-300">6 Languages • 88 Topics • 264 Videos</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
              Master <span className="bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">Programming</span>
              <br />Languages
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              🚀 Interactive learning paths • 📺 Curated video tutorials • 🎯 Practice platforms • 🤖 AI doubt solver
            </p>
          </motion.div>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center gap-3 mb-12 relative z-10">
          <Button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${filter === 'all' 
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-purple-600 dark:to-indigo-600 text-white shadow-lg' 
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            All Courses
          </Button>
          <Button
            onClick={() => setFilter('popular')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${filter === 'popular' 
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-purple-600 dark:to-indigo-600 text-white shadow-lg' 
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            <Star className="w-5 h-5 mr-2 fill-current" />
            Popular
          </Button>
          <Button
            onClick={() => setFilter('beginner')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${filter === 'beginner' 
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-purple-600 dark:to-indigo-600 text-white shadow-lg' 
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            Beginner Friendly
          </Button>
        </div>

        {/* Language Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLanguages.map((lang, index) => (
            <motion.div
              key={lang.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className="group relative overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer bg-white dark:bg-slate-800"
                onClick={() => setSelectedLanguage(lang)}
              >
                {lang.popular && (
                  <div className="absolute top-3 right-3 z-10">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-purple-600 dark:to-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                      <Star className="w-3 h-3 fill-current" />
                      Popular
                    </div>
                  </div>
                )}
                
                <div className="h-32 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center border-b border-slate-200 dark:border-slate-700">
                  <img src={lang.icon} alt={lang.name} className="w-20 h-20 group-hover:scale-110 transition-transform" />
                </div>
                
                <div className="p-5">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {lang.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {lang.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-1">
                      <Code2 className="w-4 h-4" />
                      <span>{lang.topics} Topics</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Play className="w-4 h-4" />
                      <span>{lang.videos} Videos</span>
                    </div>
                  </div>
                  
                  <Button
                    className="w-full py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 dark:from-purple-600 dark:to-indigo-600 dark:hover:from-purple-700 dark:hover:to-indigo-700 text-white transition-all shadow-md hover:shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLanguage(lang);
                    }}
                  >
                    Start Learning →
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>


      </div>

    </div>
  );
};

export default Code;
