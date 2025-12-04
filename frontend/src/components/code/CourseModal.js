import React, { useState } from 'react';
import { X, Play, Lock, CheckCircle, ChevronRight, Code2, Video } from 'lucide-react';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import LessonViewer from './LessonViewer';

const COURSE_STRUCTURE = {
  python: {
    beginner: [
      { id: 1, title: 'Introduction to Python', duration: '5 min', locked: false, completed: false },
      { id: 2, title: 'Variables & Data Types', duration: '8 min', locked: false, completed: false },
      { id: 3, title: 'Operators & Expressions', duration: '7 min', locked: false, completed: false },
      { id: 4, title: 'Control Flow - If/Else', duration: '10 min', locked: true, completed: false },
      { id: 5, title: 'Loops - For & While', duration: '12 min', locked: true, completed: false }
    ],
    intermediate: [
      { id: 6, title: 'Functions & Parameters', duration: '15 min', locked: true, completed: false },
      { id: 7, title: 'Lists & Tuples', duration: '12 min', locked: true, completed: false },
      { id: 8, title: 'Dictionaries & Sets', duration: '10 min', locked: true, completed: false },
      { id: 9, title: 'File Handling', duration: '14 min', locked: true, completed: false },
      { id: 10, title: 'Exception Handling', duration: '11 min', locked: true, completed: false }
    ],
    advanced: [
      { id: 11, title: 'Object-Oriented Programming', duration: '20 min', locked: true, completed: false },
      { id: 12, title: 'Decorators & Generators', duration: '18 min', locked: true, completed: false },
      { id: 13, title: 'Modules & Packages', duration: '15 min', locked: true, completed: false },
      { id: 14, title: 'Async Programming', duration: '22 min', locked: true, completed: false },
      { id: 15, title: 'Testing & Debugging', duration: '16 min', locked: true, completed: false }
    ]
  },
  javascript: {
    beginner: [
      { id: 1, title: 'JavaScript Basics', duration: '6 min', locked: false, completed: false },
      { id: 2, title: 'Variables - let, const, var', duration: '8 min', locked: false, completed: false },
      { id: 3, title: 'Data Types & Operators', duration: '9 min', locked: false, completed: false },
      { id: 4, title: 'Functions & Arrow Functions', duration: '12 min', locked: true, completed: false },
      { id: 5, title: 'Arrays & Objects', duration: '14 min', locked: true, completed: false }
    ],
    intermediate: [
      { id: 6, title: 'DOM Manipulation', duration: '16 min', locked: true, completed: false },
      { id: 7, title: 'Events & Event Listeners', duration: '13 min', locked: true, completed: false },
      { id: 8, title: 'Promises & Async/Await', duration: '18 min', locked: true, completed: false },
      { id: 9, title: 'Fetch API & AJAX', duration: '15 min', locked: true, completed: false },
      { id: 10, title: 'ES6+ Features', duration: '17 min', locked: true, completed: false }
    ],
    advanced: [
      { id: 11, title: 'Closures & Scope', duration: '19 min', locked: true, completed: false },
      { id: 12, title: 'Prototypes & Inheritance', duration: '21 min', locked: true, completed: false },
      { id: 13, title: 'Design Patterns', duration: '24 min', locked: true, completed: false },
      { id: 14, title: 'Performance Optimization', duration: '20 min', locked: true, completed: false },
      { id: 15, title: 'Testing with Jest', duration: '18 min', locked: true, completed: false }
    ]
  }
};

const CourseModal = ({ language, onClose }) => {
  const [selectedLevel, setSelectedLevel] = useState('beginner');
  const [selectedLesson, setSelectedLesson] = useState(null);
  
  const lessons = COURSE_STRUCTURE[language.id]?.[selectedLevel] || COURSE_STRUCTURE.python[selectedLevel];
  const completedCount = lessons.filter(l => l.completed).length;
  const progress = Math.round((completedCount / lessons.length) * 100);

  const handleLessonClick = (lesson) => {
    if (!lesson.locked) {
      setSelectedLesson(lesson);
    }
  };

  if (selectedLesson) {
    return <LessonViewer lesson={selectedLesson} language={language} onClose={() => setSelectedLesson(null)} />;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${language.color} dark:${language.darkColor} p-6 text-white`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <span className="text-5xl">{language.icon}</span>
              <div>
                <h2 className="text-3xl font-bold">{language.name}</h2>
                <p className="text-white/90">{language.description}</p>
              </div>
            </div>
            <Button onClick={onClose} variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Course Progress</span>
              <span>{progress}% Complete</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-white rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Level Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          {['beginner', 'intermediate', 'advanced'].map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                selectedLevel === level
                  ? 'border-b-2 border-yellow-500 dark:border-purple-500 text-yellow-600 dark:text-purple-400 bg-yellow-50 dark:bg-purple-900/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>

        {/* Lessons List */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
          <div className="space-y-3">
            {lessons.map((lesson, index) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div
                  onClick={() => handleLessonClick(lesson)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    lesson.locked
                      ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed opacity-60'
                      : lesson.completed
                      ? 'border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-900/20 cursor-pointer hover:shadow-lg'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer hover:shadow-lg hover:border-yellow-500 dark:hover:border-purple-500'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      lesson.locked
                        ? 'bg-slate-200 dark:bg-slate-700'
                        : lesson.completed
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : `bg-gradient-to-r ${language.color} dark:${language.darkColor}`
                    }`}>
                      {lesson.locked ? (
                        <Lock className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                      ) : lesson.completed ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : (
                        <Play className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {lesson.id}. {lesson.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Video className="w-4 h-4" />
                          {lesson.duration}
                        </span>
                        {lesson.completed && (
                          <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {!lesson.locked && (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CourseModal;
