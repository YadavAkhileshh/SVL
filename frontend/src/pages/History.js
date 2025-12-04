import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { API_BASE_URL } from '../config/api';
import { ThemeToggle } from '../components/ui/theme-toggle';
import { ArrowLeft, Clock, Trash2, Play, BookOpen, Loader2, Youtube, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const History = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [currentUser]);

  const loadHistory = () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    
    try {
      const historyKey = `svl_history_${currentUser.uid}`;
      const savedHistory = localStorage.getItem(historyKey);
      
      if (savedHistory) {
        const historyData = JSON.parse(savedHistory);
        setSessions(historyData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = (sessionId) => {
    try {
      const updatedSessions = sessions.filter(s => s.id !== sessionId);
      setSessions(updatedSessions);
      
      const historyKey = `svl_history_${currentUser.uid}`;
      localStorage.setItem(historyKey, JSON.stringify(updatedSessions));
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const openSession = (session) => {
    navigate('/study', { state: { studyData: session.studyData } });
  };

  const regenerateVideo = async (videoUrl) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/process-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoUrl })
      });
      
      if (response.ok) {
        const data = await response.json();
        navigate('/study', { state: { studyData: data } });
      }
    } catch (error) {
      console.error('Error regenerating:', error);
      alert('Failed to regenerate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-yellow-200/30 to-amber-200/30 dark:from-slate-700/20 dark:to-slate-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-orange-200/30 to-yellow-200/30 dark:from-slate-600/20 dark:to-slate-700/20 rounded-full blur-3xl animate-pulse"></div>
      </div>
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
                Study History
              </h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {sessions.length === 0 ? (
          <Card className="text-center py-12 bg-card/80 backdrop-blur-sm">
            <CardContent>
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Study History Yet</h3>
              <p className="text-muted-foreground mb-4">Start processing videos to build your study history</p>
              <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-yellow-500 to-orange-500">
                Process Your First Video
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {sessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-xl transition-shadow bg-card/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{session.studyData.title}</CardTitle>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-violet-500 dark:to-purple-500 text-white px-3 py-1 rounded-full">
                            {session.studyData.topic}
                          </span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(session.timestamp).toLocaleDateString()}
                          </div>
                          <a 
                            href={`https://youtube.com/watch?v=${session.studyData.video_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:underline"
                          >
                            <Youtube className="w-4 h-4" />
                            Watch Video
                          </a>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => openSession(session)}
                          className="bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-violet-500 dark:to-purple-500"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Open
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => regenerateVideo(session.videoUrl)}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Regenerate
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteSession(session.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="font-semibold text-purple-600">{session.studyData.flashcards.length}</div>
                        <div className="text-muted-foreground">Flashcards</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="font-semibold text-green-600">{session.studyData.quiz_questions.length}</div>
                        <div className="text-muted-foreground">Questions</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="font-semibold text-blue-600">{session.studyData.key_points.length}</div>
                        <div className="text-muted-foreground">Key Points</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
