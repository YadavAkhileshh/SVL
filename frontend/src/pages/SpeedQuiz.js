import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Trophy, Clock, Zap, Target, Flame } from 'lucide-react';

const SpeedQuiz = ({ flashcards, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameOver, setGameOver] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    generateQuestions();
  }, [flashcards]);

  useEffect(() => {
    if (timeLeft > 0 && !gameOver && !showFeedback) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showFeedback) {
      handleNext(false);
    }
  }, [timeLeft, gameOver, showFeedback]);

  const generateQuestions = () => {
    const qs = flashcards.slice(0, 10).map((card, idx) => {
      const wrongAnswers = flashcards
        .filter((_, i) => i !== idx)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(c => c.definition);
      
      const allAnswers = [card.definition, ...wrongAnswers].sort(() => Math.random() - 0.5);
      
      return {
        question: card.term,
        answers: allAnswers,
        correct: allAnswers.indexOf(card.definition)
      };
    });
    
    setQuestions(qs);
  };

  const handleAnswer = (index) => {
    setSelectedAnswer(index);
    setShowFeedback(true);
    const isCorrect = index === questions[currentQuestion].correct;
    if (isCorrect) {
      setScore(score + 1);
      setStreak(streak + 1);
    } else {
      setStreak(0);
    }
    setTimeout(() => handleNext(isCorrect), 800);
  };

  const handleNext = (wasCorrect) => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(15);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      setGameOver(true);
    }
  };

  const resetGame = () => {
    generateQuestions();
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(15);
    setGameOver(false);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setStreak(0);
  };

  if (gameOver) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
        <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4 animate-bounce" />
            <h3 className="text-2xl font-bold mb-2">Speed Quiz Complete!</h3>
            <p className="text-muted-foreground mb-4">You answered {score} out of {questions.length} correctly</p>
            <div className="text-5xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-6">{percentage}%</div>
            <div className="flex gap-3 justify-center">
              <Button onClick={resetGame} className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:scale-105 transition-transform">
                <Zap className="w-4 h-4 mr-2" />
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

  if (questions.length === 0) return null;

  const question = questions[currentQuestion];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 px-4 py-2 rounded-lg shadow-sm">
            <Target className="w-4 h-4 text-yellow-600" />
            <span className="font-semibold">{score} / {questions.length}</span>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm transition-all ${
            timeLeft <= 5 ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse' : 'bg-white/80 dark:bg-slate-800/80'
          }`}>
            <Clock className="w-4 h-4" />
            <span className="font-semibold">{timeLeft}s</span>
          </div>
          <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 px-4 py-2 rounded-lg shadow-sm">
            <Flame className={`w-4 h-4 ${streak > 2 ? 'text-orange-600 animate-pulse' : 'text-gray-400'}`} />
            <span className="font-semibold">🔥 {streak}</span>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          Question {currentQuestion + 1} / {questions.length}
        </div>
      </div>

      <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-6 text-center">{question.question}</h3>
          
          <div className="space-y-3">
            {question.answers.map((answer, index) => {
              const isCorrect = index === question.correct;
              const isSelected = selectedAnswer === index;
              
              let bgColor = 'bg-white dark:bg-slate-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20';
              if (showFeedback) {
                if (isCorrect) bgColor = 'bg-green-100 dark:bg-green-900/30 border-green-500';
                else if (isSelected) bgColor = 'bg-red-100 dark:bg-red-900/30 border-red-500';
              }
              
              return (
                <button
                  key={index}
                  onClick={() => !showFeedback && handleAnswer(index)}
                  disabled={showFeedback}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${bgColor} ${
                    !showFeedback ? 'hover:scale-[1.02] cursor-pointer' : 'cursor-not-allowed'
                  }`}
                >
                  {answer}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpeedQuiz;
