import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { ThemeToggle } from '../components/ui/theme-toggle';
import { ArrowLeft, User, Mail, Calendar, Trophy, Brain, CheckCircle, Zap, LogOut, Edit2, Save, History as HistoryIcon, Sparkles, Flame, Award, TrendingUp, BookOpen, Code } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const { currentUser, userProfile, logout, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  useEffect(() => {
    const lastActiveDate = userProfile?.lastActive ? new Date(userProfile.lastActive) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (lastActiveDate) {
      lastActiveDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - lastActiveDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        setCurrentStreak(userProfile?.currentStreak || 1);
      } else if (diffDays === 1) {
        setCurrentStreak((userProfile?.currentStreak || 0) + 1);
      } else {
        setCurrentStreak(1);
      }
    } else {
      setCurrentStreak(1);
    }
    
    setLongestStreak(userProfile?.longestStreak || 0);
  }, [userProfile]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout');
    }
  };

  const handleSave = async () => {
    try {
      await updateUserProfile({ displayName });
      setEditing(false);
    } catch (error) {
      console.error('Failed to update profile');
    }
  };

  const stats = [
    { label: 'Videos Processed', value: userProfile?.videosProcessed || 0, icon: Brain },
    { label: 'Quizzes Completed', value: userProfile?.quizzesTaken || 0, icon: CheckCircle },
    { label: 'Flashcards Mastered', value: userProfile?.flashcardsStudied || 0, icon: Zap },
    { label: 'Study Sessions', value: userProfile?.studySessions || 0, icon: BookOpen },
    { label: 'Current Streak', value: currentStreak, icon: Flame, suffix: ' days' },
    { label: 'Longest Streak', value: longestStreak, icon: Trophy, suffix: ' days' }
  ];

  const achievements = [
    { title: 'First Steps', desc: 'Process your first video', icon: '🎯', unlocked: (userProfile?.videosProcessed || 0) >= 1, progress: Math.min(100, ((userProfile?.videosProcessed || 0) / 1) * 100) },
    { title: 'Getting Started', desc: 'Complete 5 quizzes', icon: '📝', unlocked: (userProfile?.quizzesTaken || 0) >= 5, progress: Math.min(100, ((userProfile?.quizzesTaken || 0) / 5) * 100) },
    { title: 'Dedicated Learner', desc: '10 study sessions', icon: '📚', unlocked: (userProfile?.studySessions || 0) >= 10, progress: Math.min(100, ((userProfile?.studySessions || 0) / 10) * 100) },
    { title: 'Flashcard Pro', desc: 'Master 50 flashcards', icon: '🎴', unlocked: (userProfile?.flashcardsStudied || 0) >= 50, progress: Math.min(100, ((userProfile?.flashcardsStudied || 0) / 50) * 100) },
    { title: 'Video Expert', desc: 'Process 10 videos', icon: '🎥', unlocked: (userProfile?.videosProcessed || 0) >= 10, progress: Math.min(100, ((userProfile?.videosProcessed || 0) / 10) * 100) },
    { title: 'Quiz Champion', desc: 'Complete 20 quizzes', icon: '🏆', unlocked: (userProfile?.quizzesTaken || 0) >= 20, progress: Math.min(100, ((userProfile?.quizzesTaken || 0) / 20) * 100) },
    { title: '10 Day Streak', desc: 'Study for 10 consecutive days', icon: '🔥', unlocked: currentStreak >= 10 || longestStreak >= 10, progress: Math.min(100, (Math.max(currentStreak, longestStreak) / 10) * 100) },
    { title: '50 Day Streak', desc: 'Study for 50 consecutive days', icon: '⚡', unlocked: currentStreak >= 50 || longestStreak >= 50, progress: Math.min(100, (Math.max(currentStreak, longestStreak) / 50) * 100) },
    { title: '100 Day Streak', desc: 'Study for 100 consecutive days', icon: '💎', unlocked: currentStreak >= 100 || longestStreak >= 100, progress: Math.min(100, (Math.max(currentStreak, longestStreak) / 100) * 100) }
  ];

  const totalAchievements = achievements.length;
  const unlockedAchievements = achievements.filter(a => a.unlocked).length;
  const achievementProgress = Math.round((unlockedAchievements / totalAchievements) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-violet-600 dark:to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">My Profile</h1>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="outline" onClick={handleLogout} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-violet-600 dark:to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  
                  {editing ? (
                    <div className="space-y-3">
                      <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="text-center" />
                      <div className="flex gap-2">
                        <Button onClick={handleSave} className="flex-1">
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button onClick={() => setEditing(false)} variant="outline" className="flex-1">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold mb-1">{currentUser?.displayName || 'User'}</h2>
                      <Button onClick={() => setEditing(true)} variant="ghost" size="sm">
                        <Edit2 className="w-3 h-3 mr-1" />
                        Edit Name
                      </Button>
                    </>
                  )}

                  <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{currentUser?.email}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {new Date(userProfile?.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl mt-6 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={() => navigate('/')} className="w-full justify-start bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-violet-600 dark:to-purple-600 hover:scale-105 transition-transform shadow-lg">
                  <Brain className="w-4 h-4 mr-2" />
                  Process New Video
                </Button>
                <Button onClick={() => navigate('/learn')} className="w-full justify-start bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 hover:scale-105 transition-transform shadow-lg text-white">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Learning Roadmap
                </Button>
                <Button onClick={() => navigate('/code-roadmap')} className="w-full justify-start bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 hover:scale-105 transition-transform shadow-lg text-white">
                  <Code className="w-4 h-4 mr-2" />
                  Code Roadmap
                </Button>
                <Button onClick={() => navigate('/history')} className="w-full justify-start bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 hover:scale-105 transition-transform shadow-lg text-white">
                  <HistoryIcon className="w-4 h-4 mr-2" />
                  View History
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="border-0 shadow-2xl mb-6 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-yellow-600 dark:text-purple-400" />
                  Learning Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.map((stat, index) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                      <Card className="border-0 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-slate-800 dark:to-slate-700 hover:shadow-lg transition-all hover:scale-105">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-violet-600 dark:to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                              <stat.icon className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-2xl font-bold">{stat.value}{stat.suffix || ''}</p>
                          </div>
                          <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-600 dark:text-purple-400" />
                      Achievements
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {unlockedAchievements} of {totalAchievements} unlocked ({achievementProgress}%)
                    </CardDescription>
                  </div>
                  <div className="text-3xl font-bold text-yellow-600 dark:text-purple-400">{unlockedAchievements}/{totalAchievements}</div>
                </div>
                <div className="mt-4">
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-violet-600 dark:to-purple-600 transition-all duration-500" style={{ width: `${achievementProgress}%` }} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement, index) => (
                    <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03, duration: 0.3 }}
                      className={`relative p-4 rounded-xl border transition-all duration-300 ${achievement.unlocked ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 border-yellow-400 dark:border-yellow-600 shadow-md hover:shadow-lg hover:-translate-y-1' : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700 opacity-70'}`}>
                      {achievement.unlocked && (
                        <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-purple-600 dark:to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className="text-3xl mb-3">{achievement.icon}</div>
                      <h4 className="font-bold text-sm mb-1 text-foreground">{achievement.title}</h4>
                      <p className="text-xs text-muted-foreground mb-3">{achievement.desc}</p>
                      <div className="space-y-1">
                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-700 ease-out ${achievement.unlocked ? 'bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-purple-600 dark:to-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`} style={{ width: `${achievement.progress}%` }} />
                        </div>
                        <p className="text-xs font-medium text-muted-foreground text-right">{Math.round(achievement.progress)}%</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
