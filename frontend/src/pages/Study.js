import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Brain, MessageCircle, CheckCircle, ArrowLeft, Play, Sparkles, Star, User } from 'lucide-react';
import { ThemeToggle } from '../components/ui/theme-toggle';

const Study = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const studyData = location.state?.studyData;

  if (!studyData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:bg-slate-900 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-yellow-200/30 to-amber-200/30 dark:from-slate-700/20 dark:to-slate-600/20 rounded-full blur-3xl animate-pulse"></div>
        </div>
        <Card className="max-w-md border-0 shadow-2xl bg-card/80 backdrop-blur-sm relative z-10">
          <CardHeader className="text-center">
            <CardTitle>No Study Data Found</CardTitle>
            <CardDescription>Please process a video first to access study materials</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-violet-600 dark:to-purple-600 hover:scale-105 transition-transform">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const navigateToTool = (tool) => {
    navigate(`/${tool}`, { state: { studyData } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-yellow-200/30 to-amber-200/30 dark:from-slate-700/20 dark:to-slate-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-orange-200/30 to-yellow-200/30 dark:from-slate-600/20 dark:to-slate-700/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Floating Stars */}
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            <Star className="w-4 h-4 text-yellow-400/40 dark:text-slate-500/40" />
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={() => navigate('/')} className="hover:scale-105 transition-transform">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-violet-600 dark:to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">Study Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => navigate('/profile')} 
                variant="ghost" 
                size="sm"
                className="flex items-center gap-2 hover:scale-105 transition-all group"
              >
                <div className="w-7 h-7 bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-violet-600 dark:to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="hidden sm:inline text-sm font-medium">{currentUser?.displayName || 'Profile'}</span>
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Video Info */}
        <Card className="mb-8 border-0 shadow-2xl bg-card/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{studyData.title}</CardTitle>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-violet-500 dark:to-purple-500 text-white px-3 py-1 rounded-full font-medium shadow-lg">
                    {studyData.topic}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{studyData.transcript ? 'With Transcript' : 'SVL Generated'}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => window.open(`https://youtube.com/watch?v=${studyData.video_id}`, '_blank')} className="hover:scale-105 transition-transform">
                  <Play className="w-4 h-4 mr-2" />
                  Watch Video
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()} 
                  className="hover:scale-105 transition-transform bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Summary */}
            <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform shadow-lg">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                  Video Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">{studyData.video_summary}</p>
              </CardContent>
            </Card>

            {/* Detailed Explanation */}
            <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform shadow-lg">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    Comprehensive Concept Guide
                  </div>
                  <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full font-medium">Detailed</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-foreground">
                  {studyData.detailed_explanation.split('\n\n').filter(p => p.trim()).map((paragraph, index) => {
                    const text = paragraph.trim();
                    const isHeading = text.length < 100 && (text.includes(':') || text.match(/^[A-Z][^.!?]*$/));
                    
                    return (
                      <div key={index} className="relative">
                        {!isHeading && <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-purple-500 to-pink-500 rounded-full opacity-30"></div>}
                        {isHeading ? (
                          <h3 className="text-xl font-bold text-foreground mb-3 mt-6 flex items-center gap-2">
                            <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></span>
                            {text}
                          </h3>
                        ) : (
                          <p className="text-foreground leading-relaxed text-justify pl-2 text-base">
                            {text.split('**').map((part, i) => 
                              i % 2 === 1 ? <strong key={i} className="font-semibold text-purple-600 dark:text-purple-400">{part}</strong> : part
                            )}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Quick Actions */}
                <div className="mt-6 pt-6 border-t border-gray-200 flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(studyData.detailed_explanation)}
                    className="hover:scale-105 transition-transform"
                  >
                    📋 Copy Text
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.print()}
                    className="hover:scale-105 transition-transform"
                  >
                    🖨️ Print
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(studyData.topic)}`, '_blank')}
                    className="hover:scale-105 transition-transform"
                  >
                    🔍 Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Key Points */}
            <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform shadow-lg">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  Key Learning Points
                </CardTitle>
                <CardDescription>Essential concepts and insights you need to master</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {studyData.key_points.map((point, index) => {
                    const colors = [
                      'from-blue-500 to-cyan-500',
                      'from-purple-500 to-pink-500',
                      'from-green-500 to-emerald-500',
                      'from-orange-500 to-red-500',
                      'from-yellow-500 to-orange-500',
                      'from-indigo-500 to-purple-500',
                      'from-pink-500 to-rose-500',
                      'from-teal-500 to-cyan-500'
                    ];
                    return (
                      <div key={index} className="group/item hover:scale-[1.02] transition-all duration-300">
                        <Card className="border-l-4 border-0 shadow-md hover:shadow-xl transition-all bg-card" style={{ borderLeftColor: `hsl(${index * 45}, 70%, 50%)` }}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 bg-gradient-to-r ${colors[index % colors.length]} text-white rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0 shadow-lg group-hover/item:scale-110 transition-transform`}>
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <p className="text-slate-700 dark:text-slate-200 leading-relaxed text-base">{point}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Video Transcript */}
            {studyData.transcript && (
              <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform shadow-lg">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    Video Transcript
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto p-4 bg-muted/30 rounded-lg">
                    <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                      {studyData.transcript}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Learning Tools Sidebar */}
          <div className="space-y-6">
            <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Learning Tools</CardTitle>
                <CardDescription>Interactive tools to master the concepts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => navigateToTool('flashcards')} 
                  className="w-full justify-start bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 dark:from-purple-600 dark:to-indigo-600 dark:hover:from-purple-700 dark:hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  size="lg"
                >
                  <Brain className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Flashcards</div>
                    <div className="text-xs opacity-90">{studyData.flashcards.length} cards available</div>
                  </div>
                </Button>

                <Button 
                  onClick={() => navigateToTool('test')} 
                  className="w-full justify-start bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 dark:from-indigo-600 dark:to-purple-600 dark:hover:from-indigo-700 dark:hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  size="lg"
                >
                  <CheckCircle className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Practice Quiz</div>
                    <div className="text-xs opacity-90">{studyData.quiz_questions.length} questions ready</div>
                  </div>
                </Button>

                <Button 
                  onClick={() => navigateToTool('tutor')} 
                  className="w-full justify-start bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 dark:from-violet-600 dark:to-purple-600 dark:hover:from-violet-700 dark:hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  size="lg"
                >
                  <MessageCircle className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">AI Tutor</div>
                    <div className="text-xs opacity-90">Get personalized help</div>
                  </div>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm hover:shadow-2xl transition-shadow">
              <CardHeader>
                <CardTitle>Study Materials</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg hover:scale-105 transition-transform">
                  <span className="text-muted-foreground">Flashcards</span>
                  <span className="font-semibold text-yellow-600 dark:text-yellow-400">{studyData.flashcards.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg hover:scale-105 transition-transform">
                  <span className="text-muted-foreground">Quiz Questions</span>
                  <span className="font-semibold text-orange-600 dark:text-orange-400">{studyData.quiz_questions.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg hover:scale-105 transition-transform">
                  <span className="text-muted-foreground">Key Points</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">{studyData.key_points.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Study;