import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Code, CheckCircle, ExternalLink, Youtube, Globe, Target, Sparkles } from 'lucide-react';
import { ThemeToggle } from '../components/ui/theme-toggle';

const CodeRoadmap = () => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [completedLevels, setCompletedLevels] = useState(new Set());

  const languages = [
    {
      id: 'python',
      name: 'Python',
      icon: '🐍',
      color: 'from-blue-500 to-cyan-500',
      topics: [
        {
          id: 'py-syntax',
          name: 'Syntax & Basics',
          levels: [
            { 
              id: 'py-s1', 
              title: 'Variables & Data Types',
              videos: ['https://www.youtube.com/results?search_query=python+variables+data+types+tutorial', 'https://www.youtube.com/results?search_query=python+basics+beginners'],
              practice: ['https://www.hackerrank.com/domains/python', 'https://leetcode.com/problemset/all/?difficulty=EASY&page=1&topicSlugs=array'],
              learning: ['https://docs.python.org/3/tutorial/', 'https://realpython.com/python-variables/', 'https://www.w3schools.com/python/']
            },
            { 
              id: 'py-s2', 
              title: 'Operators & Expressions',
              videos: ['https://www.youtube.com/results?search_query=python+operators+tutorial', 'https://www.youtube.com/results?search_query=python+expressions'],
              practice: ['https://www.hackerrank.com/domains/python', 'https://www.codewars.com/kata/search/python'],
              learning: ['https://realpython.com/python-operators-expressions/', 'https://www.programiz.com/python-programming/operators']
            },
            { 
              id: 'py-s3', 
              title: 'Control Flow (if/else/loops)',
              videos: ['https://www.youtube.com/results?search_query=python+control+flow+tutorial', 'https://www.youtube.com/results?search_query=python+loops+if+else'],
              practice: ['https://www.hackerrank.com/domains/python', 'https://exercism.org/tracks/python'],
              learning: ['https://realpython.com/python-conditional-statements/', 'https://www.programiz.com/python-programming/if-elif-else']
            },
            { 
              id: 'py-s4', 
              title: 'Functions & Scope',
              videos: ['https://www.youtube.com/results?search_query=python+functions+tutorial', 'https://www.youtube.com/results?search_query=python+scope+tutorial'],
              practice: ['https://www.hackerrank.com/domains/python', 'https://leetcode.com/problemset/all/'],
              learning: ['https://realpython.com/defining-your-own-python-function/', 'https://www.programiz.com/python-programming/function']
            },
            { 
              id: 'py-s5', 
              title: 'Modules & Packages',
              videos: ['https://www.youtube.com/results?search_query=python+modules+packages+tutorial'],
              practice: ['https://www.hackerrank.com/domains/python', 'https://www.codewars.com/kata/search/python'],
              learning: ['https://realpython.com/python-modules-packages/', 'https://docs.python.org/3/tutorial/modules.html']
            }
          ]
        },
        {
          id: 'py-ds',
          name: 'Data Structures',
          levels: [
            { id: 'py-d1', title: 'Lists & Tuples', videos: ['https://www.youtube.com/results?search_query=python+lists+tuples'], practice: ['https://leetcode.com/tag/array/', 'https://www.hackerrank.com/domains/python'], learning: ['https://realpython.com/python-lists-tuples/', 'https://www.w3schools.com/python/python_lists.asp'] },
            { id: 'py-d2', title: 'Dictionaries & Sets', videos: ['https://www.youtube.com/results?search_query=python+dictionaries+sets'], practice: ['https://leetcode.com/tag/hash-table/', 'https://www.hackerrank.com/domains/python'], learning: ['https://realpython.com/python-dicts/', 'https://www.programiz.com/python-programming/dictionary'] },
            { id: 'py-d3', title: 'Strings & Methods', videos: ['https://www.youtube.com/results?search_query=python+strings+tutorial'], practice: ['https://leetcode.com/tag/string/', 'https://www.hackerrank.com/domains/python'], learning: ['https://realpython.com/python-strings/', 'https://www.w3schools.com/python/python_strings.asp'] },
            { id: 'py-d4', title: 'List Comprehensions', videos: ['https://www.youtube.com/results?search_query=python+list+comprehensions'], practice: ['https://www.hackerrank.com/domains/python', 'https://www.codewars.com/kata/search/python'], learning: ['https://realpython.com/list-comprehension-python/', 'https://www.programiz.com/python-programming/list-comprehension'] },
            { id: 'py-d5', title: 'Iterators & Generators', videos: ['https://www.youtube.com/results?search_query=python+iterators+generators'], practice: ['https://www.hackerrank.com/domains/python', 'https://exercism.org/tracks/python'], learning: ['https://realpython.com/introduction-to-python-generators/', 'https://www.programiz.com/python-programming/generator'] },
            { id: 'py-d6', title: 'Collections Module', videos: ['https://www.youtube.com/results?search_query=python+collections+module'], practice: ['https://www.hackerrank.com/domains/python', 'https://leetcode.com/problemset/all/'], learning: ['https://realpython.com/python-collections-module/', 'https://docs.python.org/3/library/collections.html'] },
            { id: 'py-d7', title: 'Advanced Data Structures', videos: ['https://www.youtube.com/results?search_query=python+advanced+data+structures'], practice: ['https://leetcode.com/problemset/all/?difficulty=MEDIUM', 'https://www.hackerrank.com/domains/data-structures'], learning: ['https://realpython.com/python-data-structures/', 'https://www.geeksforgeeks.org/python-data-structures/'] }
          ]
        },
        {
          id: 'py-oop',
          name: 'Object-Oriented Programming',
          levels: [
            { id: 'py-o1', title: 'Classes & Objects', videos: ['https://www.youtube.com/results?search_query=python+classes+objects'], practice: ['https://www.hackerrank.com/domains/python', 'https://exercism.org/tracks/python'], learning: ['https://realpython.com/python3-object-oriented-programming/', 'https://www.programiz.com/python-programming/class'] },
            { id: 'py-o2', title: 'Inheritance', videos: ['https://www.youtube.com/results?search_query=python+inheritance'], practice: ['https://www.hackerrank.com/domains/python', 'https://www.codewars.com/kata/search/python'], learning: ['https://realpython.com/inheritance-composition-python/', 'https://www.programiz.com/python-programming/inheritance'] },
            { id: 'py-o3', title: 'Polymorphism', videos: ['https://www.youtube.com/results?search_query=python+polymorphism'], practice: ['https://www.hackerrank.com/domains/python', 'https://exercism.org/tracks/python'], learning: ['https://realpython.com/python-polymorphism/', 'https://www.programiz.com/python-programming/polymorphism'] },
            { id: 'py-o4', title: 'Encapsulation', videos: ['https://www.youtube.com/results?search_query=python+encapsulation'], practice: ['https://www.hackerrank.com/domains/python', 'https://www.codewars.com/kata/search/python'], learning: ['https://realpython.com/python-encapsulation/', 'https://www.geeksforgeeks.org/encapsulation-in-python/'] },
            { id: 'py-o5', title: 'Magic Methods', videos: ['https://www.youtube.com/results?search_query=python+magic+methods'], practice: ['https://www.hackerrank.com/domains/python', 'https://exercism.org/tracks/python'], learning: ['https://realpython.com/python-magic-methods/', 'https://www.geeksforgeeks.org/dunder-magic-methods-python/'] },
            { id: 'py-o6', title: 'Design Patterns', videos: ['https://www.youtube.com/results?search_query=python+design+patterns'], practice: ['https://www.hackerrank.com/domains/python', 'https://leetcode.com/problemset/all/'], learning: ['https://refactoring.guru/design-patterns/python', 'https://www.geeksforgeeks.org/python-design-patterns/'] }
          ]
        }
      ]
    },
    {
      id: 'javascript',
      name: 'JavaScript',
      icon: '⚡',
      color: 'from-yellow-500 to-orange-500',
      topics: [
        {
          id: 'js-fundamentals',
          name: 'JavaScript Fundamentals',
          levels: [
            { id: 'js-f1', title: 'Variables & Data Types', videos: ['https://www.youtube.com/results?search_query=javascript+variables+tutorial'], practice: ['https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', 'https://www.codewars.com/kata/search/javascript'], learning: ['https://javascript.info/variables', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide'] },
            { id: 'js-f2', title: 'Functions & Scope', videos: ['https://www.youtube.com/results?search_query=javascript+functions+scope'], practice: ['https://www.freecodecamp.org/learn/', 'https://exercism.org/tracks/javascript'], learning: ['https://javascript.info/function-basics', 'https://www.w3schools.com/js/js_functions.asp'] },
            { id: 'js-f3', title: 'Arrays & Objects', videos: ['https://www.youtube.com/results?search_query=javascript+arrays+objects'], practice: ['https://leetcode.com/problemset/all/', 'https://www.hackerrank.com/domains/tutorials/10-days-of-javascript'], learning: ['https://javascript.info/array', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array'] },
            { id: 'js-f4', title: 'DOM Manipulation', videos: ['https://www.youtube.com/results?search_query=javascript+dom+manipulation'], practice: ['https://www.freecodecamp.org/learn/', 'https://www.codewars.com/kata/search/javascript'], learning: ['https://javascript.info/document', 'https://www.w3schools.com/js/js_htmldom.asp'] },
            { id: 'js-f5', title: 'Events & Event Handling', videos: ['https://www.youtube.com/results?search_query=javascript+events'], practice: ['https://www.freecodecamp.org/learn/', 'https://exercism.org/tracks/javascript'], learning: ['https://javascript.info/events', 'https://developer.mozilla.org/en-US/docs/Web/Events'] }
          ]
        },
        {
          id: 'js-async',
          name: 'Asynchronous JavaScript',
          levels: [
            { id: 'js-a1', title: 'Callbacks', videos: ['https://www.youtube.com/results?search_query=javascript+callbacks'], practice: ['https://www.freecodecamp.org/learn/', 'https://www.codewars.com/kata/search/javascript'], learning: ['https://javascript.info/callbacks', 'https://developer.mozilla.org/en-US/docs/Glossary/Callback_function'] },
            { id: 'js-a2', title: 'Promises', videos: ['https://www.youtube.com/results?search_query=javascript+promises'], practice: ['https://www.freecodecamp.org/learn/', 'https://exercism.org/tracks/javascript'], learning: ['https://javascript.info/promise-basics', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise'] },
            { id: 'js-a3', title: 'Async/Await', videos: ['https://www.youtube.com/results?search_query=javascript+async+await'], practice: ['https://www.freecodecamp.org/learn/', 'https://www.codewars.com/kata/search/javascript'], learning: ['https://javascript.info/async-await', 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await'] },
            { id: 'js-a4', title: 'Fetch API', videos: ['https://www.youtube.com/results?search_query=javascript+fetch+api'], practice: ['https://www.freecodecamp.org/learn/', 'https://exercism.org/tracks/javascript'], learning: ['https://javascript.info/fetch', 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API'] },
            { id: 'js-a5', title: 'Error Handling', videos: ['https://www.youtube.com/results?search_query=javascript+error+handling'], practice: ['https://www.freecodecamp.org/learn/', 'https://www.codewars.com/kata/search/javascript'], learning: ['https://javascript.info/try-catch', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling'] }
          ]
        }
      ]
    }
  ];

  const toggleLevelCompletion = (levelId) => {
    setCompletedLevels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(levelId)) {
        newSet.delete(levelId);
      } else {
        newSet.add(levelId);
      }
      return newSet;
    });
  };

  const getCompletionStats = (language) => {
    if (!language) return { completed: 0, total: 0, percentage: 0 };
    const total = language.topics.reduce((sum, topic) => sum + topic.levels.length, 0);
    const completed = language.topics.reduce((sum, topic) => 
      sum + topic.levels.filter(l => completedLevels.has(l.id)).length, 0
    );
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={() => navigate('/profile')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-amber-600 dark:to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                Code Learning Roadmap
              </h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedLanguage ? (
          <div>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Choose Your Programming Language</h2>
              <p className="text-muted-foreground text-lg">Select a language to see the complete topic-based learning roadmap</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {languages.map((lang) => (
                <Card
                  key={lang.id}
                  className="border-2 border-yellow-200 dark:border-amber-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer bg-card/80 backdrop-blur-sm"
                  onClick={() => setSelectedLanguage(lang)}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`w-20 h-20 bg-gradient-to-r ${lang.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg text-4xl`}>
                      {lang.icon}
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{lang.name}</h3>
                    <p className="text-sm text-muted-foreground">{lang.topics.length} Topics • {lang.topics.reduce((sum, t) => sum + t.levels.length, 0)} Levels</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <Button variant="outline" onClick={() => { setSelectedLanguage(null); setSelectedTopic(null); }} className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Languages
              </Button>

              <Card className="border-2 border-yellow-200 dark:border-amber-700 shadow-xl bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 bg-gradient-to-r ${selectedLanguage.color} rounded-2xl flex items-center justify-center shadow-lg text-3xl`}>
                        {selectedLanguage.icon}
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{selectedLanguage.name} Learning Path</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {getCompletionStats(selectedLanguage).completed} of {getCompletionStats(selectedLanguage).total} levels completed
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                        {getCompletionStats(selectedLanguage).percentage}%
                      </div>
                      <p className="text-xs text-muted-foreground">Progress</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
                        style={{ width: `${getCompletionStats(selectedLanguage).percentage}%` }}
                      />
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>

            <div className="space-y-8">
              {selectedLanguage.topics.map((topic, topicIndex) => (
                <div key={topic.id} className="relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg text-white font-bold text-xl">
                      {topicIndex + 1}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">{topic.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {topic.levels.filter(l => completedLevels.has(l.id)).length} of {topic.levels.length} levels completed
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ml-0 sm:ml-16">
                    {topic.levels.map((level, levelIndex) => {
                      const isCompleted = completedLevels.has(level.id);
                      const isSelected = selectedTopic?.id === level.id;

                      return (
                        <Card
                          key={level.id}
                          className={`border-2 transition-all duration-300 cursor-pointer ${
                            isCompleted
                              ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-500 shadow-lg'
                              : isSelected
                              ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-500 shadow-xl scale-105'
                              : 'bg-card border-yellow-200 dark:border-amber-700 hover:border-yellow-400 hover:shadow-lg hover:scale-102'
                          }`}
                          onClick={() => setSelectedTopic(selectedTopic?.id === level.id ? null : level)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-yellow-600 dark:text-amber-400">Level {levelIndex + 1}</span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleLevelCompletion(level.id);
                                }}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                  isCompleted
                                    ? 'bg-green-500 border-green-500'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
                                }`}
                              >
                                {isCompleted && <CheckCircle className="w-4 h-4 text-white" />}
                              </button>
                            </div>
                            <h4 className="font-semibold text-sm text-foreground mb-2">{level.title}</h4>
                            {isSelected && (
                              <div className="mt-4 space-y-3 animate-in fade-in duration-300">
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Youtube className="w-4 h-4 text-red-600" />
                                    <span className="text-xs font-semibold text-foreground">Video Tutorials</span>
                                  </div>
                                  {level.videos.map((video, i) => (
                                    <a
                                      key={i}
                                      href={video}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 hover:underline mb-1"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      Tutorial {i + 1}
                                    </a>
                                  ))}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Target className="w-4 h-4 text-purple-600" />
                                    <span className="text-xs font-semibold text-foreground">Practice Sites</span>
                                  </div>
                                  {level.practice.map((site, i) => (
                                    <a
                                      key={i}
                                      href={site}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 hover:underline mb-1"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      {site.split('/')[2]}
                                    </a>
                                  ))}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Globe className="w-4 h-4 text-green-600" />
                                    <span className="text-xs font-semibold text-foreground">Learning Resources</span>
                                  </div>
                                  {level.learning.map((resource, i) => (
                                    <a
                                      key={i}
                                      href={resource}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 hover:underline mb-1"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      {resource.split('/')[2]}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {topicIndex < selectedLanguage.topics.length - 1 && (
                    <div className="ml-6 mt-4 mb-4 h-8 w-0.5 bg-gradient-to-b from-yellow-500 to-orange-500"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="border-t border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <a
            href="https://linkshala.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden group"
          >
            <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
            <Sparkles className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Powered by Linkshala</span>
          </a>
        </div>
      </footer>
    </div>
  );
};

export default CodeRoadmap;
