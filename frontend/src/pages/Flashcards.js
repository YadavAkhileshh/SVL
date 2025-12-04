import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { API_BASE_URL } from '../config/api';
import { ArrowLeft, RotateCcw, ChevronLeft, ChevronRight, List, Layers, Gamepad2, Trophy, Sparkles, Star, CheckCircle, MessageCircle, Zap, Target, Award, Brain, Flame, Plus, Loader2, User } from 'lucide-react';
import { ThemeToggle } from '../components/ui/theme-toggle';
import { useAuth } from '../contexts/AuthContext';
import MemoryGame from './MemoryGame';
import SpeedQuiz from './SpeedQuiz';
import TypeAnswer from './TypeAnswer';
import ExplainPanel from '../components/ExplainPanel';

const Flashcards = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const studyData = location.state?.studyData;
  const { currentUser } = useAuth();

  const [mode, setMode] = useState('deck');
  const [currentCard, setCurrentCard] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [flashcards, setFlashcards] = useState(studyData?.flashcards || []);
  const [gameCards, setGameCards] = useState([]);
  const [matches, setMatches] = useState([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [mastered, setMastered] = useState([]);
  const [streak, setStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [studyTime, setStudyTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [lastGenerated, setLastGenerated] = useState(0);
  const [listView, setListView] = useState('grid');
  const [gameStyle, setGameStyle] = useState('drag');
  const [activeGameMode, setActiveGameMode] = useState('drag');

  // Explain Panel State
  const [explainOpen, setExplainOpen] = useState(false);
  const [explainTerm, setExplainTerm] = useState('');
  const [explainDefinition, setExplainDefinition] = useState('');

  useEffect(() => {
    if (studyData?.flashcards) {
      setFlashcards(studyData.flashcards);
    }
  }, [studyData]);

  useEffect(() => {
    if (mode === 'game' && flashcards.length > 0) {
      initializeGame();
    }
  }, [mode]);

  useEffect(() => {
    if (mode === 'game' && flashcards.length > 0) {
      initializeGame();
    }
  }, [flashcards.length]);

  useEffect(() => {
    let timer;
    if (mode === 'deck' && !isPaused) {
      timer = setInterval(() => setStudyTime(prev => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [mode, isPaused]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (mode === 'deck') {
        if (e.key === 'ArrowLeft') prevCard();
        if (e.key === 'ArrowRight') nextCard();
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          setFlipped(!flipped);
        }
        if (e.key === 'm' || e.key === 'M') markAsMastered();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [mode, flipped, currentCard]);

  const generateMoreFlashcards = async () => {
    setGenerating(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/generate-flashcards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_id: studyData.video_id,
          count: 5
        })
      });

      if (response.status === 429) {
        const data = await response.json();
        setError(data.detail);
        setTimeout(() => setError(''), 5000);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setFlashcards(prev => [...prev, ...data.flashcards]);
        setLastGenerated(Date.now());
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      } else {
        setError('Failed to generate flashcards. Please try again.');
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
      setError('Network error. Please check your connection.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setGenerating(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const markAsMastered = () => {
    if (!mastered.includes(currentCard)) {
      setMastered([...mastered, currentCard]);
      setStreak(streak + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  };

  const handleExplain = (term, definition) => {
    setExplainTerm(term);
    setExplainDefinition(definition);
    setExplainOpen(true);
  };

  if (!studyData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle>No Study Data Found</CardTitle>
            <CardDescription>Please process a video first</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full bg-gradient-to-r from-yellow-500 to-orange-500">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initializeGame = () => {
    const totalCards = Math.min(6, flashcards.length);
    const cards = flashcards.slice(0, totalCards);
    const gameData = [];

    cards.forEach((card, index) => {
      gameData.push({ id: `term-${index}-${Date.now()}`, type: 'term', content: card.term, matchId: index });
      gameData.push({ id: `def-${index}-${Date.now()}`, type: 'definition', content: card.definition, matchId: index });
    });

    setGameCards(gameData.sort(() => Math.random() - 0.5));
    setMatches([]);
    setGameComplete(false);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const sourceId = result.draggableId;
    const destId = result.destination.droppableId;

    if (destId === 'cards') return;

    const sourceCard = gameCards.find(c => c.id === sourceId);
    const destCard = gameCards.find(c => c.id === destId);

    if (sourceCard && destCard && sourceCard.matchId === destCard.matchId && sourceCard.type !== destCard.type) {
      setMatches(prev => [...prev, sourceCard.matchId]);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1000);

      if (matches.length + 1 === Math.min(6, flashcards.length)) {
        setGameComplete(true);
      }
    }
  };

  const nextCard = () => {
    setCurrentCard((prev) => (prev + 1) % flashcards.length);
    setFlipped(false);
  };

  const prevCard = () => {
    setCurrentCard((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    setFlipped(false);
  };

  const renderListMode = () => (
    <div>
      <div className="mb-4 flex justify-end gap-2">
        <Button
          variant={listView === 'grid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setListView('grid')}
          className={listView === 'grid' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : ''}
        >
          Grid View
        </Button>
        <Button
          variant={listView === 'table' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setListView('table')}
          className={listView === 'table' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : ''}
        >
          Table View
        </Button>
      </div>

      {listView === 'grid' ? (
        <div className="space-y-4">
          {flashcards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group">
                <CardContent className="p-4 sm:p-6">
                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="group-hover:scale-105 transition-transform">
                      <h4 className="font-semibold mb-2 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent text-sm sm:text-base">Term</h4>
                      <p className="text-sm sm:text-base">{card.term}</p>
                    </div>
                    <div className="group-hover:scale-105 transition-transform">
                      <h4 className="font-semibold mb-2 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent text-sm sm:text-base">Definition</h4>
                      <p className="text-sm sm:text-base">{card.definition}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                    <Button
                      onClick={() => handleExplain(card.term, card.definition)}
                      size="sm"
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Explain in Detail
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">#</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Term</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Definition</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold w-20">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {flashcards.map((card, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-b border-gray-100 hover:bg-yellow-50/50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-yellow-600 dark:text-yellow-400">{index + 1}</td>
                      <td className="px-4 py-3 text-sm font-semibold">{card.term}</td>
                      <td className="px-4 py-3 text-sm">{card.definition}</td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          onClick={() => handleExplain(card.term, card.definition)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                          title="Explain in detail"
                        >
                          <MessageCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderDeckMode = () => {
    const card = flashcards[currentCard];
    const isMastered = mastered.includes(currentCard);
    const progress = ((currentCard + 1) / flashcards.length) * 100;

    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-4 sm:mb-6 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
            <CardContent className="p-3 sm:p-4 text-center">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-yellow-600" />
              <div className="text-lg sm:text-2xl font-bold">{currentCard + 1}/{flashcards.length}</div>
              <div className="text-xs">Progress</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10">
            <CardContent className="p-3 sm:p-4 text-center">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-green-600" />
              <div className="text-lg sm:text-2xl font-bold">{mastered.length}</div>
              <div className="text-xs">Mastered</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500/10 to-red-500/10">
            <CardContent className="p-3 sm:p-4 text-center">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-orange-600" />
              <div className="text-lg sm:text-2xl font-bold">{streak}</div>
              <div className="text-xs">Streak</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
            <CardContent className="p-3 sm:p-4 text-center">
              <Brain className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-blue-600" />
              <div className="text-lg sm:text-2xl font-bold">{formatTime(studyTime)}</div>
              <div className="text-xs">Time</div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-4 sm:mb-6">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={prevCard} className="hover:scale-110 transition-transform">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={nextCard} className="hover:scale-110 transition-transform">
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant={isPaused ? "default" : "outline"}
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
              className="hover:scale-110 transition-transform"
            >
              {isPaused ? '▶️ Resume' : '⏸️ Pause'}
            </Button>
          </div>
          <div className="hidden sm:block text-xs sm:text-sm text-muted-foreground">
            ← → navigate • Space flip • M master
          </div>
        </div>

        <div className="perspective-1000 mb-4 sm:mb-6">
          <Card
            className={`relative h-64 sm:h-96 cursor-pointer transition-all duration-700 border-0 shadow-2xl hover:shadow-3xl ${flipped ? 'rotate-y-180' : ''
              } ${isMastered ? 'ring-4 ring-green-500' : ''}`}
            style={{
              transformStyle: 'preserve-3d',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
            onClick={() => setFlipped(!flipped)}
          >
            <CardContent
              className="absolute inset-0 h-full flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-yellow-50 to-orange-50 backface-hidden"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-2 rounded-full bg-yellow-500/20 mb-4 sm:mb-6">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
                  <span className="text-xs sm:text-sm font-medium text-yellow-700">Term</span>
                </div>
                <p className="text-xl sm:text-3xl font-bold mb-2 sm:mb-4">{card.term}</p>
                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Tap to reveal</span>
                </div>
              </div>
            </CardContent>

            <CardContent
              className="absolute inset-0 h-full flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-orange-50 to-yellow-50 backface-hidden"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-2 rounded-full bg-orange-500/20 mb-4 sm:mb-6">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
                  <span className="text-xs sm:text-sm font-medium text-orange-700">Definition</span>
                </div>
                <p className="text-base sm:text-xl font-medium leading-relaxed">{card.definition}</p>
              </div>
            </CardContent>

            {isMastered && (
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
                <div className="bg-green-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-bounce">
                  <CheckCircle className="w-3 h-3" />
                  Mastered!
                </div>
              </div>
            )}
          </Card>
        </div>

        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-10%',
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${2 + Math.random()}s`
                }}
              >
                <Star className="w-4 h-4 text-yellow-400" />
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
          <Button
            onClick={() => setFlipped(!flipped)}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:scale-105 transition-transform shadow-lg"
            size="lg"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Flip Card
          </Button>
          <Button
            onClick={markAsMastered}
            variant={isMastered ? "outline" : "default"}
            className={isMastered ? "" : "bg-gradient-to-r from-green-500 to-emerald-500 hover:scale-105 transition-transform shadow-lg"}
            size="lg"
            disabled={isMastered}
          >
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            {isMastered ? "Mastered" : "Mark Mastered"}
          </Button>
          <Button
            onClick={() => handleExplain(flashcards[currentCard].term, flashcards[currentCard].definition)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 transition-transform shadow-lg"
            size="lg"
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Explain
          </Button>
        </div>
      </div>
    );
  };

  const renderGameMode = () => {
    const GameNavigation = () => (
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        <Button
          onClick={() => setActiveGameMode('drag')}
          variant={activeGameMode === 'drag' ? 'default' : 'outline'}
          size="sm"
          className={activeGameMode === 'drag' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : ''}
        >
          Drag & Drop
        </Button>
        <Button
          onClick={() => setActiveGameMode('memory')}
          variant={activeGameMode === 'memory' ? 'default' : 'outline'}
          size="sm"
          className={activeGameMode === 'memory' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}
        >
          Memory Match
        </Button>
        <Button
          onClick={() => setActiveGameMode('speed')}
          variant={activeGameMode === 'speed' ? 'default' : 'outline'}
          size="sm"
          className={activeGameMode === 'speed' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : ''}
        >
          Speed Quiz
        </Button>
        <Button
          onClick={() => setActiveGameMode('type')}
          variant={activeGameMode === 'type' ? 'default' : 'outline'}
          size="sm"
          className={activeGameMode === 'type' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : ''}
        >
          Type Answer
        </Button>
        <Button
          onClick={() => navigate('/study', { state: { studyData } })}
          variant="outline"
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Study
        </Button>
      </div>
    );

    return (
      <div>
        <GameNavigation />
        {activeGameMode === 'memory' && <MemoryGame flashcards={flashcards} onBack={() => setActiveGameMode('drag')} />}
        {activeGameMode === 'speed' && <SpeedQuiz flashcards={flashcards} onBack={() => setActiveGameMode('drag')} />}
        {activeGameMode === 'type' && <TypeAnswer flashcards={flashcards} onBack={() => setActiveGameMode('drag')} />}
        {activeGameMode === 'drag' && renderDragDropGame()}
      </div>
    );
  };

  const renderDragDropGame = () => (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="max-w-6xl mx-auto">
        {gameComplete ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <Card className="text-center border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-500 mx-auto mb-4 animate-bounce" />
                <h3 className="text-xl sm:text-2xl font-bold mb-2">Congratulations!</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-6">You matched all cards!</p>
                <Button onClick={initializeGame} className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:scale-105 transition-transform shadow-lg">
                  Play Again
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Drag & Drop Matching Game</h3>
              <p className="text-sm sm:text-base text-muted-foreground">Drag terms to their definitions</p>
              <div className="mt-2 text-sm">
                Matches: {matches.length} / {Math.min(6, flashcards.length)}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <Droppable droppableId="cards">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                    <h4 className="font-semibold text-center mb-3 text-sm sm:text-base">Terms</h4>
                    {gameCards.filter(c => c.type === 'term').map((card, index) => {
                      const isMatched = matches.includes(card.matchId);
                      if (isMatched) return null;

                      return (
                        <Draggable key={card.id} draggableId={card.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <Card className={`cursor-move transition-all duration-300 border-2 ${snapshot.isDragging
                                ? 'shadow-2xl scale-105 border-yellow-400 bg-yellow-50'
                                : 'shadow-lg hover:shadow-xl border-yellow-200 bg-white'
                                }`}>
                                <CardContent className="p-3 sm:p-4">
                                  <p className="text-xs sm:text-sm font-medium text-center">{card.content}</p>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              <div className="space-y-3">
                <h4 className="font-semibold text-center mb-3 text-sm sm:text-base">Definitions</h4>
                {gameCards.filter(c => c.type === 'definition').map((card) => {
                  const isMatched = matches.includes(card.matchId);

                  return (
                    <Droppable key={card.id} droppableId={card.id}>
                      {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.droppableProps}>
                          <Card className={`min-h-[80px] transition-all duration-300 border-2 ${isMatched
                            ? 'bg-green-100 border-green-400 shadow-lg'
                            : snapshot.isDraggingOver
                              ? 'bg-orange-50 border-orange-400 shadow-xl scale-105'
                              : 'bg-white border-orange-200 shadow-lg'
                            }`}>
                            <CardContent className="p-3 sm:p-4 flex items-center justify-center min-h-[80px]">
                              {isMatched ? (
                                <div className="text-center">
                                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-2" />
                                  <p className="text-xs sm:text-sm font-medium text-green-700">Matched!</p>
                                </div>
                              ) : (
                                <p className="text-xs sm:text-sm text-center">{card.content}</p>
                              )}
                            </CardContent>
                          </Card>
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </DragDropContext>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-yellow-200/30 to-amber-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-orange-200/30 to-yellow-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/study', { state: { studyData } })} className="hover:scale-105 transition-transform">
                <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">Flashcards</h1>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/test', { state: { studyData } })} className="hover:scale-105 transition-transform hidden sm:flex">
                <CheckCircle className="w-4 h-4 mr-2" />
                Quiz
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/tutor', { state: { studyData } })} className="hover:scale-105 transition-transform hidden sm:flex">
                <MessageCircle className="w-4 h-4 mr-2" />
                AI Tutor
              </Button>
              <Button
                onClick={() => navigate('/profile')}
                variant="ghost"
                size="sm"
                className="hover:scale-105 transition-all group"
              >
                <div className="w-7 h-7 bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-violet-600 dark:to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all">
                  <User className="w-3 h-3 text-white" />
                </div>
              </Button>
              <ThemeToggle />
            </div>
          </div>

          <div className="flex items-center justify-between pb-4">
            <div className="flex space-x-1 sm:space-x-2">
              <Button
                variant={mode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('list')}
                className={`transition-all text-xs sm:text-sm ${mode === 'list' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 scale-105' : 'hover:scale-105'}`}
              >
                <List className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">List</span>
              </Button>
              <Button
                variant={mode === 'deck' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('deck')}
                className={`transition-all text-xs sm:text-sm ${mode === 'deck' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 scale-105' : 'hover:scale-105'}`}
              >
                <Layers className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Deck</span>
              </Button>
              <Button
                variant={mode === 'game' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('game')}
                className={`transition-all text-xs sm:text-sm ${mode === 'game' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 scale-105' : 'hover:scale-105'}`}
              >
                <Gamepad2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Game</span>
              </Button>
            </div>

            <div className="flex flex-col items-end gap-1">
              <Button
                onClick={generateMoreFlashcards}
                disabled={generating}
                size="sm"
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-lg hover:scale-105 transition-all text-xs sm:text-sm font-semibold"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                    <span className="hidden sm:inline">Generating...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Generate +5</span>
                    <span className="sm:hidden">+5</span>
                  </>
                )}
              </Button>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-600 font-medium"
                >
                  {error}
                </motion.p>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 relative z-10">
        <Card className="mb-4 sm:mb-8 border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent text-lg sm:text-xl">{studyData.topic}</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {flashcards.length} flashcards • {mode === 'list' ? 'List View' : mode === 'deck' ? 'Deck View' : 'Drag & Drop Game'}
            </CardDescription>
          </CardHeader>
        </Card>

        {mode === 'list' && renderListMode()}
        {mode === 'deck' && renderDeckMode()}
        {mode === 'game' && renderGameMode()}
      </div>

      {/* Explain Panel */}
      <ExplainPanel
        isOpen={explainOpen}
        onClose={() => setExplainOpen(false)}
        term={explainTerm}
        definition={explainDefinition}
        videoId={studyData?.video_id || ''}
        topic={studyData?.topic || ''}
      />
    </div>
  );
};

export default Flashcards;
