import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { API_BASE_URL } from '../config/api';
import { Play, BookOpen, Brain, MessageCircle, Loader2, CheckCircle, Sparkles, Star, User, Target, TrendingUp, Code2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from '../components/ui/theme-toggle';

const Home = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { currentUser, incrementStat } = useAuth();

  const steps = [
    { icon: Play, text: "Extracting video content" },
    { icon: Brain, text: "Analyzing with AI" },
    { icon: BookOpen, text: "Generating study materials" },
    { icon: CheckCircle, text: "Ready to learn!" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setCurrentStep(0);

    let stepInterval;
    try {
      stepInterval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < steps.length - 1) return prev + 1;
          clearInterval(stepInterval);
          return prev;
        });
      }, 1500);

      const response = await fetch(`${API_BASE_URL}/process-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || 'Failed to process video');
      }
      
      const data = await response.json();
      clearInterval(stepInterval);
      setCurrentStep(steps.length - 1);
      
      await incrementStat('videosProcessed');
      await incrementStat('studySessions');
      
      // Save to localStorage
      if (currentUser) {
        const historyKey = `svl_history_${currentUser.uid}`;
        const existingHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
        
        const newSession = {
          id: Date.now().toString(),
          userId: currentUser.uid,
          studyData: data,
          videoUrl: url.trim(),
          timestamp: new Date().toISOString()
        };
        
        existingHistory.unshift(newSession);
        localStorage.setItem(historyKey, JSON.stringify(existingHistory.slice(0, 50))); // Keep last 50
      }
      
      setTimeout(() => {
        navigate('/study', { state: { studyData: data } });
      }, 1000);

    } catch (error) {
      console.error('Error:', error);
      if (stepInterval) clearInterval(stepInterval);
      setLoading(false);
      setCurrentStep(0);
      
      let errorMessage = 'Failed to process video. ';
      if (error.message.includes('Invalid YouTube URL')) {
        errorMessage = '❌ Invalid YouTube URL. Please paste a valid YouTube video link.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = '❌ Backend not running. Please start backend: cd backend && python app.py';
      } else if (error.message.includes('transcript')) {
        errorMessage = '❌ Video has no captions. Try Khan Academy, TED-Ed, or Crash Course videos.';
      } else {
        errorMessage += error.message;
      }
      
      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-yellow-200/30 to-amber-200/30 dark:from-slate-700/20 dark:to-slate-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-orange-200/30 to-yellow-200/30 dark:from-slate-600/20 dark:to-slate-700/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-amber-200/20 to-yellow-200/20 dark:from-slate-700/10 dark:to-slate-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Floating Stars */}
        {[...Array(6)].map((_, i) => (
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
      <header className="border-b border-border bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-violet-600 dark:to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
                SVL
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => navigate('/learn')} 
                className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 dark:from-purple-600 dark:to-indigo-600 dark:hover:from-purple-700 dark:hover:to-indigo-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Learn</span>
              </Button>
              <Button 
                onClick={() => navigate('/code-roadmap')} 
                className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 dark:from-purple-600 dark:to-indigo-600 dark:hover:from-purple-700 dark:hover:to-indigo-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
              >
                <Code2 className="w-4 h-4" />
                <span className="hidden sm:inline">Code</span>
              </Button>
              <ThemeToggle />
              <Button 
                onClick={() => navigate('/profile')} 
                variant="ghost" 
                className="flex items-center gap-2 hover:scale-105 transition-all group relative hover:bg-muted"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-violet-600 dark:to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="hidden sm:inline font-medium text-slate-700 dark:text-slate-200">{currentUser?.displayName || 'Profile'}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-purple-900/30 dark:to-indigo-900/30 text-yellow-800 dark:text-purple-600 text-sm font-medium mb-6 shadow-lg hover:shadow-xl transition-shadow">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Learning Platform
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Transform <span className="bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-purple-500 dark:to-indigo-400 bg-clip-text text-transparent">ANY Educational Video</span> into Interactive Learning
            </h2>
            <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
              Share any study-related video and instantly generate AI-powered flashcards, quizzes, and personalized tutoring.
            </p>
            <p className="text-lg text-muted-foreground/70 mb-12">
              📚 Physics • Chemistry • Biology • Math • Computer Science • Any Subject!
            </p>
          </div>

          {/* Video Input Form */}
          <Card className="max-w-2xl mx-auto mb-16 shadow-2xl border-0 bg-card/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300 hover:scale-105">
            <CardHeader>
              <CardTitle className="text-left text-2xl bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">🚀 Get Started</CardTitle>
              <CardDescription className="text-left text-base">
                Paste ANY educational video URL - Works with all subjects instantly!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="url"
                  placeholder="🎓 Paste any educational video URL (Physics, Math, Science, etc.)..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                  className="text-lg py-6 border-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 border-slate-300 dark:border-slate-600 hover:border-yellow-500 dark:hover:border-purple-500 focus:border-yellow-600 dark:focus:border-purple-600 transition-colors"
                />
                <Button 
                  type="submit" 
                  disabled={loading || !url.trim()}
                  className="w-full py-6 text-lg bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 dark:from-purple-600 dark:to-indigo-600 dark:hover:from-purple-700 dark:hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Interactive Study Materials
                    </>
                  )}
                </Button>
                {!loading && (
                  <p className="text-sm text-muted-foreground text-center mt-3">
                    ✨ Instant AI-powered flashcards, quizzes & tutor for any video
                  </p>
                )}
              </form>

              {/* Processing Steps */}
              {loading && (
                <div className="mt-8 space-y-4">
                  {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep;
                    
                    return (
                      <div key={index} className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isCompleted ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                          isActive ? 'bg-yellow-100 dark:bg-purple-900/30 text-yellow-600 dark:text-purple-400' : 
                          'bg-muted text-muted-foreground'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`transition-colors ${
                          isCompleted ? 'text-green-600 dark:text-green-400' :
                          isActive ? 'text-yellow-600 dark:text-purple-400' : 
                          'text-muted-foreground'
                        }`}>
                          {step.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">Everything you need to learn effectively</h3>
            <p className="text-xl text-muted-foreground">Comprehensive study tools powered by advanced AI</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-2xl transition-all duration-300 border-0 bg-card/80 backdrop-blur-sm hover:scale-105 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">Study Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Comprehensive summaries and detailed explanations of key concepts</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-2xl transition-all duration-300 border-0 bg-card/80 backdrop-blur-sm hover:scale-105 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">Smart Flashcards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Interactive flashcards with spaced repetition and memory games</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-2xl transition-all duration-300 border-0 bg-card/80 backdrop-blur-sm hover:scale-105 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">Practice Quizzes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Adaptive quizzes with instant feedback and detailed explanations</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-2xl transition-all duration-300 border-0 bg-card/80 backdrop-blur-sm hover:scale-105 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">AI Tutor</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">24/7 AI tutor for personalized help and concept clarification</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>



      {/* How it Works */}
      <section id="how-it-works" className="py-20 bg-muted/30 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">How SVL Works</h3>
            <p className="text-xl text-muted-foreground">Simple steps to transform any video into a complete learning experience</p>
          </div>

          <div className="space-y-12">
            {[
              { step: "01", title: "Paste Video URL", desc: "Simply paste any YouTube educational video link", color: "from-yellow-500 to-orange-500 dark:from-purple-500 dark:to-indigo-500" },
              { step: "02", title: "AI Analysis", desc: "Our AI extracts key concepts and generates study materials", color: "from-blue-500 to-cyan-500" },
              { step: "03", title: "Interactive Learning", desc: "Study with flashcards, take quizzes, and chat with AI tutor", color: "from-green-500 to-emerald-500" },
              { step: "04", title: "Track Progress", desc: "Monitor your learning journey and improve over time", color: "from-orange-500 to-red-500" }
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-8 hover:scale-105 transition-transform duration-300">
                <div className="flex-shrink-0">
                  <div className={`w-16 h-16 bg-gradient-to-r ${item.color} text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg hover:shadow-xl transition-shadow`}>
                    {item.step}
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-foreground mb-2">{item.title}</h4>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-background/80 backdrop-blur-sm border-t border-border py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-purple-600 dark:to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">SVL</span>
            </div>
            <p className="text-muted-foreground">© 2025 SVL Smart Video Learner.</p>
          </div>
          
          
        </div>
      </footer>
    </div>
  );
};

export default Home;