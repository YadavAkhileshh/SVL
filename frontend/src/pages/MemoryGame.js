import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Trophy, RotateCcw, Clock, Target, CheckCircle, Zap } from 'lucide-react';

const MemoryGame = ({ flashcards, onBack }) => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [bestScore, setBestScore] = useState(null);

  useEffect(() => {
    initializeGame();
  }, [flashcards]);

  useEffect(() => {
    if (!gameWon && cards.length > 0) {
      const timer = setInterval(() => setTime(t => t + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [gameWon, cards]);

  useEffect(() => {
    if (matched.length === cards.length / 2 && cards.length > 0) {
      setGameWon(true);
    }
  }, [matched, cards]);

  const initializeGame = () => {
    const pairCount = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8;
    const gameCards = flashcards.slice(0, pairCount);
    const cardPairs = [];
    
    gameCards.forEach((card, idx) => {
      cardPairs.push({ id: `term-${idx}`, content: card.term, pairId: idx });
      cardPairs.push({ id: `def-${idx}`, content: card.definition, pairId: idx });
    });
    
    setCards(cardPairs.sort(() => Math.random() - 0.5));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setTime(0);
    setGameWon(false);
  };

  const handleCardClick = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(cards[index].pairId)) return;
    
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);
    
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      
      if (cards[first].pairId === cards[second].pairId) {
        setTimeout(() => {
          setMatched([...matched, cards[first].pairId]);
          setFlipped([]);
        }, 600);
      } else {
        setTimeout(() => setFlipped([]), 1200);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (gameWon) {
    return (
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center relative">
        {/* Confetti Effect */}
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -20, x: Math.random() * window.innerWidth, opacity: 1 }}
              animate={{ y: window.innerHeight, opacity: 0 }}
              transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5 }}
              className="absolute"
            >
              <div className={`w-3 h-3 ${
                ['bg-yellow-400', 'bg-orange-400', 'bg-green-400', 'bg-blue-400', 'bg-purple-400'][Math.floor(Math.random() * 5)]
              } rounded-full`} />
            </motion.div>
          ))}
        </div>
        
        <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: 3 }}
            >
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-2xl font-bold mb-2">🎉 Congratulations! 🎉</h3>
            <p className="text-muted-foreground mb-4">You completed the memory game!</p>
            <div className="flex justify-center gap-8 mb-6">
              <div>
                <div className="text-3xl font-bold text-yellow-600">{moves}</div>
                <div className="text-sm text-gray-600">Moves</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600">{formatTime(time)}</div>
                <div className="text-sm text-gray-600">Time</div>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={initializeGame} className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:scale-105 transition-transform">
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
              <Button onClick={onBack} variant="outline" className="hover:scale-105 transition-transform">
                Back to Flashcards
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-2 border-blue-200 dark:border-blue-700 rounded-lg">
        <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2">🎴 How to Play Memory Match:</h3>
        <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">Click cards to flip them. Find matching pairs of terms and definitions. Match all pairs to win!</p>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant={difficulty === 'easy' ? 'default' : 'outline'}
            onClick={() => { setDifficulty('easy'); initializeGame(); }}
            className="text-xs"
          >
            Easy (4 pairs)
          </Button>
          <Button 
            size="sm" 
            variant={difficulty === 'medium' ? 'default' : 'outline'}
            onClick={() => { setDifficulty('medium'); initializeGame(); }}
            className="text-xs"
          >
            Medium (6 pairs)
          </Button>
          <Button 
            size="sm" 
            variant={difficulty === 'hard' ? 'default' : 'outline'}
            onClick={() => { setDifficulty('hard'); initializeGame(); }}
            className="text-xs"
          >
            Hard (8 pairs)
          </Button>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 px-4 py-2 rounded-lg shadow-sm">
            <Target className="w-4 h-4 text-yellow-600" />
            <span className="font-semibold">{moves} Moves</span>
          </div>
          <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 px-4 py-2 rounded-lg shadow-sm">
            <Clock className="w-4 h-4 text-orange-600" />
            <span className="font-semibold">{formatTime(time)}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 px-4 py-2 rounded-lg shadow-sm">
            <Trophy className="w-4 h-4 text-green-600" />
            <span className="font-semibold">{matched.length}/{cards.length / 2}</span>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={initializeGame} className="hover:scale-105 transition-transform">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className={`grid gap-4 ${
        difficulty === 'easy' ? 'grid-cols-2 sm:grid-cols-4' :
        difficulty === 'medium' ? 'grid-cols-3 sm:grid-cols-4' :
        'grid-cols-4'
      }`}>
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index) || matched.includes(card.pairId);
          const isMatched = matched.includes(card.pairId);
          
          return (
            <motion.div
              key={card.id}
              whileHover={{ scale: isMatched ? 1 : 1.05 }}
              whileTap={{ scale: isMatched ? 1 : 0.95 }}
              animate={isMatched ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
              transition={{ duration: 0.5 }}
            >
              <Card
                className={`h-36 cursor-pointer transition-all duration-500 relative border-2 ${
                  isFlipped ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 border-yellow-300 dark:border-yellow-700' : 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 border-blue-200 dark:border-slate-500'
                } ${isMatched ? 'ring-4 ring-green-500 shadow-xl shadow-green-500/50 border-green-400' : ''} ${
                  !isFlipped && !isMatched ? 'hover:shadow-xl hover:border-purple-400 dark:hover:border-purple-500' : ''
                }`}
                onClick={() => handleCardClick(index)}
              >
                <CardContent className="h-full flex items-center justify-center p-2">
                  {isFlipped ? (
                    <>
                      <p className="text-sm text-center font-medium line-clamp-5 px-2">{card.content}</p>
                      {isMatched && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 200 }}
                          className="absolute top-2 right-2 bg-green-500 rounded-full p-1"
                        >
                          <CheckCircle className="w-5 h-5 text-white" />
                        </motion.div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Zap className="w-8 h-8 text-purple-500 dark:text-purple-400" />
                      <div className="text-xs font-semibold text-purple-600 dark:text-purple-400">?</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default MemoryGame;
