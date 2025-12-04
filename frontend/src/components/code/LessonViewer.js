import React, { useState } from 'react';
import { X, Play, Code2, CheckCircle, ArrowRight, ArrowLeft, Lightbulb } from 'lucide-react';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '../../contexts/ThemeContext';

const LESSON_CONTENT = {
  1: {
    title: 'Introduction to Python',
    videoId: 'rfscVS0vtbw',
    steps: [
      {
        type: 'explanation',
        content: 'Python is a high-level, interpreted programming language known for its simplicity and readability.',
        highlight: 'Perfect for beginners!'
      },
      {
        type: 'code',
        code: `# Your first Python program
print("Hello, World!")`,
        explanation: 'The print() function displays text on the screen.'
      },
      {
        type: 'interactive',
        question: 'What will this code output?',
        code: `print("Python is awesome!")`,
        options: ['Python is awesome!', 'print("Python is awesome!")', 'Error', 'Nothing'],
        correct: 0
      },
      {
        type: 'visualization',
        title: 'How Python Executes Code',
        steps: [
          { label: 'Write Code', description: 'You write Python code in .py files' },
          { label: 'Interpreter', description: 'Python interpreter reads your code' },
          { label: 'Execute', description: 'Code runs line by line' },
          { label: 'Output', description: 'Results are displayed' }
        ]
      }
    ]
  },
  2: {
    title: 'Variables & Data Types',
    videoId: 'Z1Yd7upQsXY',
    steps: [
      {
        type: 'explanation',
        content: 'Variables store data values. Python has several data types: integers, floats, strings, and booleans.',
        highlight: 'No need to declare types!'
      },
      {
        type: 'code',
        code: `# Different data types
name = "Alice"      # String
age = 25           # Integer
height = 5.6       # Float
is_student = True  # Boolean`,
        explanation: 'Python automatically determines the data type.'
      },
      {
        type: 'interactive',
        question: 'Which is a valid variable name?',
        options: ['my_variable', '2nd_variable', 'my-variable', 'my variable'],
        correct: 0
      },
      {
        type: 'visualization',
        title: 'Memory Allocation',
        steps: [
          { label: 'Variable Created', description: 'name = "Alice"' },
          { label: 'Memory Allocated', description: 'Space reserved in RAM' },
          { label: 'Value Stored', description: '"Alice" stored at memory address' },
          { label: 'Reference Created', description: 'Variable points to memory' }
        ]
      }
    ]
  }
};

const LessonViewer = ({ lesson, language, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const { theme } = useTheme();
  
  const content = LESSON_CONTENT[lesson.id] || LESSON_CONTENT[1];
  const step = content.steps[currentStep];
  const isLastStep = currentStep === content.steps.length - 1;

  const handleNext = () => {
    if (currentStep < content.steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handleAnswerSelect = (index) => {
    setSelectedAnswer(index);
    setShowResult(true);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${language.color} dark:${language.darkColor} p-4 text-white flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{language.icon}</span>
            <div>
              <h2 className="text-xl font-bold">{content.title}</h2>
              <p className="text-sm text-white/80">Step {currentStep + 1} of {content.steps.length}</p>
            </div>
          </div>
          <Button onClick={onClose} variant="ghost" size="sm" className="text-white hover:bg-white/20">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-slate-200 dark:bg-slate-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / content.steps.length) * 100}%` }}
            className={`h-full bg-gradient-to-r ${language.color} dark:${language.darkColor}`}
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Explanation Step */}
              {step.type === 'explanation' && (
                <div className="max-w-3xl mx-auto">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded-r-lg mb-6">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-lg text-slate-900 dark:text-white leading-relaxed">
                          {step.content}
                        </p>
                        {step.highlight && (
                          <p className="mt-3 text-blue-600 dark:text-blue-400 font-semibold">
                            💡 {step.highlight}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Video */}
                  <div className="aspect-video rounded-xl overflow-hidden shadow-2xl">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${content.videoId}`}
                      title={content.title}
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* Code Step */}
              {step.type === 'code' && (
                <div className="max-w-3xl mx-auto">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <Code2 className="w-6 h-6" />
                      Code Example
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">{step.explanation}</p>
                  </div>
                  
                  <div className="rounded-xl overflow-hidden shadow-2xl border-2 border-slate-200 dark:border-slate-700">
                    <SyntaxHighlighter
                      language="python"
                      style={theme === 'dark' ? vscDarkPlus : vs}
                      customStyle={{
                        margin: 0,
                        padding: '1.5rem',
                        fontSize: '1.1rem',
                        lineHeight: '1.6'
                      }}
                    >
                      {step.code}
                    </SyntaxHighlighter>
                  </div>
                </div>
              )}

              {/* Interactive Step */}
              {step.type === 'interactive' && (
                <div className="max-w-3xl mx-auto">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                      {step.question}
                    </h3>
                    {step.code && (
                      <div className="rounded-xl overflow-hidden shadow-lg border-2 border-slate-200 dark:border-slate-700 mb-6">
                        <SyntaxHighlighter
                          language="python"
                          style={theme === 'dark' ? vscDarkPlus : vs}
                          customStyle={{ margin: 0, padding: '1rem' }}
                        >
                          {step.code}
                        </SyntaxHighlighter>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {step.options.map((option, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={showResult}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          showResult
                            ? index === step.correct
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                              : index === selectedAnswer
                              ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                            : selectedAnswer === index
                            ? 'border-yellow-500 dark:border-purple-500 bg-yellow-50 dark:bg-purple-900/20'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-yellow-500 dark:hover:border-purple-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-slate-900 dark:text-white font-medium">{option}</span>
                          {showResult && index === step.correct && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                  
                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-6 p-4 rounded-xl ${
                        selectedAnswer === step.correct
                          ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
                          : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-500'
                      }`}
                    >
                      <p className={`font-semibold ${
                        selectedAnswer === step.correct
                          ? 'text-green-700 dark:text-green-400'
                          : 'text-red-700 dark:text-red-400'
                      }`}>
                        {selectedAnswer === step.correct ? '✅ Correct!' : '❌ Incorrect'}
                      </p>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Visualization Step */}
              {step.type === 'visualization' && (
                <div className="max-w-4xl mx-auto">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
                    {step.title}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    {step.steps.map((vizStep, index) => (
                      <React.Fragment key={index}>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.2 }}
                          className="flex-1"
                        >
                          <div className={`bg-gradient-to-br ${language.color} dark:${language.darkColor} p-6 rounded-xl shadow-xl text-white text-center`}>
                            <div className="text-3xl font-bold mb-2">{index + 1}</div>
                            <div className="font-semibold mb-2">{vizStep.label}</div>
                            <div className="text-sm text-white/80">{vizStep.description}</div>
                          </div>
                        </motion.div>
                        {index < step.steps.length - 1 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.2 + 0.1 }}
                            className="px-4"
                          >
                            <ArrowRight className="w-8 h-8 text-slate-400" />
                          </motion.div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Footer */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900 flex items-center justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <div className="flex gap-2">
            {content.steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-yellow-500 dark:bg-purple-500 w-8'
                    : index < currentStep
                    ? 'bg-green-500'
                    : 'bg-slate-300 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
          
          <Button
            onClick={isLastStep ? onClose : handleNext}
            className={`flex items-center gap-2 bg-gradient-to-r ${language.color} dark:${language.darkColor} text-white`}
          >
            {isLastStep ? 'Complete' : 'Next'}
            {!isLastStep && <ArrowRight className="w-4 h-4" />}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default LessonViewer;
