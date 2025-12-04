import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Trophy, CheckCircle, XCircle, Target, ArrowRight } from 'lucide-react';

const TypeAnswer = ({ flashcards, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    setQuestions(flashcards.slice(0, 8));
  }, [flashcards]);

  const checkAnswer = () => {
    const correctAnswer = questions[currentQuestion].definition.toLowerCase();
    const userAnswerLower = userAnswer.toLowerCase().trim();
    
    // Check if answer contains key words or is similar
    const correctWords = correctAnswer.split(' ').filter(w => w.length > 3);
    const userWords = userAnswerLower.split(' ');
    const matchCount = correctWords.filter(word => userWords.some(uw => uw.includes(word) || word.includes(uw))).length;
    
    const correct = matchCount >= Math.ceil(correctWords.length * 0.5) || userAnswerLower === correctAnswer;
    
    setIsCorrect(correct);
    setShowFeedback(true);
    if (correct) setScore(score + 1);
  };

  const handleNext = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setUserAnswer('');
      setShowFeedback(false);
      setIsCorrect(false);
    } else {
      setGameOver(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !showFeedback && userAnswer.trim()) {
      checkAnswer();
    } else if (e.key === 'Enter' && showFeedback) {
      handleNext();
    }
  };

  const resetGame = () => {
    setCurrentQuestion(0);
    setUserAnswer('');
    setScore(0);
    setGameOver(false);
    setShowFeedback(false);
    setIsCorrect(false);
  };

  if (gameOver) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4 animate-bounce" />
            <h3 className="text-2xl font-bold mb-2">Type Answer Complete!</h3>
            <p className="text-muted-foreground mb-4">You got {score} out of {questions.length} correct</p>
            <div className="text-5xl font-bold text-yellow-600 mb-6">{percentage}%</div>
            <div className="flex gap-3 justify-center">
              <Button onClick={resetGame} className="bg-gradient-to-r from-yellow-500 to-orange-500">
                Play Again
              </Button>
              <Button onClick={onBack} variant="outline">
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
        <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-lg shadow-sm">
          <Target className="w-4 h-4 text-yellow-600" />
          <span className="font-semibold">{score} / {questions.length}</span>
        </div>
        <div className="text-sm text-gray-600">
          Question {currentQuestion + 1} / {questions.length}
        </div>
      </div>

      <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6 space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">Define this term:</h4>
            <h3 className="text-2xl font-bold text-center py-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
              {question.term}
            </h3>
          </div>

          <div>
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your answer here..."
              disabled={showFeedback}
              className="text-lg p-4"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-2">Press Enter to submit</p>
          </div>

          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg ${
                isCorrect ? 'bg-green-100 border-2 border-green-500' : 'bg-red-100 border-2 border-red-500'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {isCorrect ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-700">Correct!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-red-700">Not quite right</span>
                  </>
                )}
              </div>
              <div className="text-sm">
                <strong>Correct answer:</strong> {question.definition}
              </div>
            </motion.div>
          )}

          <div className="flex justify-end">
            {!showFeedback ? (
              <Button
                onClick={checkAnswer}
                disabled={!userAnswer.trim()}
                className="bg-gradient-to-r from-yellow-500 to-orange-500"
              >
                Check Answer
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-yellow-500 to-orange-500"
              >
                Next Question
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TypeAnswer;
