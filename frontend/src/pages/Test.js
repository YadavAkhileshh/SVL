import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { API_BASE_URL } from '../config/api';
import { ThemeToggle } from '../components/ui/theme-toggle';
import { ArrowLeft, Clock, CheckCircle, XCircle, RotateCcw, Trophy, Settings, Sparkles, Star, Brain, MessageCircle, Loader2, RefreshCw } from 'lucide-react';
import ExplainPanel from '../components/ExplainPanel';

const Test = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const studyData = location.state?.studyData;

  const [showSettings, setShowSettings] = useState(true);
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState('medium');
  const [questionTypes, setQuestionTypes] = useState(['multiple_choice', 'true_false']);
  const [generating, setGenerating] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState([]);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(300);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [filteredQuestions, setFilteredQuestions] = useState([]);

  // Explain Panel State
  const [explainOpen, setExplainOpen] = useState(false);
  const [explainTerm, setExplainTerm] = useState('');
  const [explainDefinition, setExplainDefinition] = useState('');

  // Instant Feedback State
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    let timer;
    if (quizStarted && !quizCompleted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizStarted, quizCompleted, timeLeft]);

  if (!studyData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center relative overflow-hidden">
        <Card className="max-w-md border-0 shadow-2xl bg-card/80 backdrop-blur-sm relative z-10">
          <CardHeader className="text-center">
            <CardTitle>No Study Data Found</CardTitle>
            <CardDescription>Please process a video first to access the quiz</CardDescription>
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startQuiz = () => {
    const questions = studyData.quiz_questions.filter(q => questionTypes.includes(q.type));
    const selected = questions.slice(0, numQuestions);
    setFilteredQuestions(selected);
    setQuizStarted(true);
    setShowSettings(false);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers({});
    setQuizCompleted(false);
    setTimeLeft(numQuestions * 60);
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);

    // Instant feedback - check if answer is correct
    const question = filteredQuestions[currentQuestion];
    let correct = false;

    if (question.type === 'true_false') {
      correct = answerIndex === (question.correct ? 0 : 1);
    } else {
      correct = answerIndex === question.correct;
    }

    setIsCorrect(correct);
    setShowFeedback(true);
  };

  const handleExplain = (question) => {
    setExplainTerm(question.question);
    setExplainDefinition(question.explanation || 'Click to see detailed explanation of this question and answer.');
    setExplainOpen(true);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer !== null) {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion]: selectedAnswer
      }));
    }

    // Reset feedback for next question
    setShowFeedback(false);
    setIsCorrect(false);

    if (currentQuestion < filteredQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(answers[currentQuestion + 1] || null);
    } else {
      handleSubmitQuiz();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setSelectedAnswer(answers[currentQuestion - 1] || null);
    }
  };

  const handleSubmitQuiz = () => {
    if (selectedAnswer !== null) {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion]: selectedAnswer
      }));
    }

    const wrong = [];
    filteredQuestions.forEach((question, index) => {
      const userAnswer = index === currentQuestion && selectedAnswer !== null ? selectedAnswer : answers[index];
      const isCorrect = question.type === 'true_false'
        ? userAnswer === (question.correct ? 0 : 1)
        : userAnswer === question.correct;
      if (!isCorrect) {
        wrong.push(index);
      }
    });
    setWrongAnswers(wrong);
    setQuizCompleted(true);
  };

  const calculateScore = () => {
    let correct = 0;
    filteredQuestions.forEach((question, index) => {
      if (question.type === 'true_false') {
        if (answers[index] === (question.correct ? 0 : 1)) correct++;
      } else {
        if (answers[index] === question.correct) correct++;
      }
    });
    return correct;
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setShowSettings(true);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers({});
    setQuizCompleted(false);
    setTimeLeft(300);
    setWrongAnswers([]);
  };

  const retryWrongAnswers = () => {
    const wrongQuestions = wrongAnswers.map(idx => filteredQuestions[idx]);
    setFilteredQuestions(wrongQuestions);
    setQuizStarted(true);
    setQuizCompleted(false);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers({});
    setTimeLeft(wrongQuestions.length * 60);
    setWrongAnswers([]);
  };

  const generateMoreQuestions = async () => {
    setGenerating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/generate-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_id: studyData.video_id,
          count: 5,
          difficulty: difficulty
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.quiz_questions && data.quiz_questions.length > 0) {
          studyData.quiz_questions = [...studyData.quiz_questions, ...data.quiz_questions];
          alert(`Generated ${data.quiz_questions.length} new ${difficulty} questions!`);
        }
      }
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setGenerating(false);
    }
  };

  if (showSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
        <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-3">
                <Button variant="ghost" onClick={() => navigate('/study', { state: { studyData } })}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Study
                </Button>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">Practice Quiz</h1>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">Quiz Settings</CardTitle>
              <CardDescription className="text-lg">{studyData.topic} • Customize your quiz experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Number of Questions</label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map(num => (
                    <Button
                      key={num}
                      variant={numQuestions === num ? 'default' : 'outline'}
                      onClick={() => setNumQuestions(num)}
                      className={numQuestions === num ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : ''}
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Difficulty Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {['easy', 'medium', 'hard'].map(level => (
                    <Button
                      key={level}
                      variant={difficulty === level ? 'default' : 'outline'}
                      onClick={() => setDifficulty(level)}
                      className={difficulty === level ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : ''}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={startQuiz}
                  disabled={questionTypes.length === 0}
                  className="w-full py-6 text-lg bg-gradient-to-r from-yellow-500 to-orange-500 hover:scale-105 transition-transform shadow-lg"
                >
                  Start Quiz
                </Button>

                <Button
                  onClick={generateMoreQuestions}
                  disabled={generating}
                  variant="outline"
                  className="w-full"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate +5 Questions
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    const score = calculateScore();
    const percentage = Math.round((score / filteredQuestions.length) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
        <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">Quiz Results</h1>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <Card className="text-center mb-8 border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Trophy className="w-10 h-10 text-white animate-bounce" />
              </div>
              <CardTitle className="text-3xl bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">Quiz Complete!</CardTitle>
              <CardDescription>You scored {score} out of {filteredQuestions.length} questions correctly</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-yellow-600 mb-4">{percentage}%</div>
              <div className="flex flex-wrap justify-center gap-3">
                <Button onClick={resetQuiz} className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:scale-105 transition-transform shadow-lg">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake Quiz
                </Button>
                {wrongAnswers.length > 0 && (
                  <Button onClick={retryWrongAnswers} className="bg-gradient-to-r from-red-500 to-orange-500 hover:scale-105 transition-transform shadow-lg">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry Wrong ({wrongAnswers.length})
                  </Button>
                )}
                <Button variant="outline" onClick={() => navigate('/study', { state: { studyData } })}>
                  Continue Studying
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const question = filteredQuestions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">Practice Quiz</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span className={timeLeft < 60 ? 'text-red-600 font-medium' : ''}>{formatTime(timeLeft)}</span>
              </div>
              <span>{currentQuestion + 1} / {filteredQuestions.length}</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Question {currentQuestion + 1}</CardTitle>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / filteredQuestions.length) * 100}%` }}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg text-foreground">{question.question}</p>

            <div className="space-y-3">
              {question.type === 'multiple_choice' && question.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrectAnswer = index === question.correct;
                const showAsCorrect = showFeedback && isCorrectAnswer;
                const showAsWrong = showFeedback && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-4 text-left rounded-lg border transition-all hover:scale-[1.02] text-foreground flex items-center justify-between ${showAsCorrect
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/30 ring-2 ring-green-500'
                      : showAsWrong
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/30 ring-2 ring-red-500'
                        : isSelected
                          ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30'
                          : 'border-border bg-card hover:bg-muted/50'
                      }`}
                  >
                    <span>{option}</span>
                    {showAsCorrect && <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />}
                    {showAsWrong && <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />}
                  </button>
                );
              })}

              {question.type === 'true_false' && ['True', 'False'].map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrectAnswer = index === (question.correct ? 0 : 1);
                const showAsCorrect = showFeedback && isCorrectAnswer;
                const showAsWrong = showFeedback && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-4 text-left rounded-lg border transition-all hover:scale-[1.02] text-foreground flex items-center justify-between ${showAsCorrect
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/30 ring-2 ring-green-500'
                      : showAsWrong
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/30 ring-2 ring-red-500'
                        : isSelected
                          ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30'
                          : 'border-border bg-card hover:bg-muted/50'
                      }`}
                  >
                    <span>{option}</span>
                    {showAsCorrect && <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />}
                    {showAsWrong && <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Feedback Message and Explain Button */}
            {showFeedback && (
              <div className="mt-4 p-4 rounded-lg border bg-card animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    {isCorrect ? (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold mb-2">
                        <CheckCircle className="w-5 h-5" />
                        Correct!
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold mb-2">
                        <XCircle className="w-5 h-5" />
                        Incorrect
                      </div>
                    )}
                    {question.explanation && (
                      <p className="text-sm text-muted-foreground">{question.explanation}</p>
                    )}
                  </div>
                  <Button
                    onClick={() => handleExplain(question)}
                    size="sm"
                    variant="outline"
                    className="shrink-0 border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                  >
                    <MessageCircle className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                    Explain
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevQuestion}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>

              <Button
                onClick={handleNextQuestion}
                disabled={selectedAnswer === null}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:scale-105 transition-transform shadow-lg"
              >
                {currentQuestion === filteredQuestions.length - 1 ? 'Submit Quiz' : 'Next Question'}
              </Button>
            </div>
          </CardContent>
        </Card>
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

export default Test;
