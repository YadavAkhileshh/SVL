import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, BookOpen, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import ReactMarkdown from 'react-markdown';

const ExplainPanel = ({ isOpen, onClose, term, definition }) => {
    const [explanation, setExplanation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && term) {
            fetchExplanation();
        }
    }, [isOpen, term]);

    const fetchExplanation = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('http://localhost:8000/api/explain-flashcard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    video_id: 'default',
                    term, 
                    definition 
                })
            });
            const data = await response.json();
            if (data.explanation) {
                setExplanation(data.explanation);
            } else {
                setError('Failed to generate explanation');
            }
        } catch (err) {
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setExplanation('');
        setError('');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                        onClick={handleClose}
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 bottom-0 w-full sm:w-2/3 lg:w-1/2 xl:w-2/5 bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-hidden flex flex-col"
                    >
                        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-violet-600 dark:to-purple-600 p-4 sm:p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 pr-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles className="w-5 h-5 text-white" />
                                        <h2 className="text-xl sm:text-2xl font-bold text-white">Explain</h2>
                                    </div>
                                    <p className="text-white/90 text-sm sm:text-base font-medium line-clamp-2">{term}</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={handleClose} className="text-white hover:bg-white/20 hover:text-white shrink-0">
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-4">
                                    <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
                                    <p className="text-muted-foreground text-center">Generating explanation...</p>
                                </div>
                            ) : error ? (
                                <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
                                    <CardContent className="p-4 sm:p-6">
                                        <p className="text-red-600 dark:text-red-400">{error}</p>
                                        <Button onClick={fetchExplanation} className="mt-4 bg-red-600 hover:bg-red-700">Try Again</Button>
                                    </CardContent>
                                </Card>
                            ) : explanation ? (
                                <div className="space-y-6">
                                    <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-slate-800 dark:to-slate-700">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                                <BookOpen className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                                Definition
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm sm:text-base leading-relaxed">{definition}</p>
                                        </CardContent>
                                    </Card>
                                    <div className="prose prose-sm sm:prose max-w-none dark:prose-invert">
                                        <ReactMarkdown
                                            components={{
                                                h2: ({ children }) => (
                                                    <div className="flex items-center gap-2 mt-6 mb-3">
                                                        <div className="w-1 h-6 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full" />
                                                        <h2 className="text-lg sm:text-xl font-bold m-0 bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-yellow-400 dark:to-orange-400 bg-clip-text text-transparent">{children}</h2>
                                                    </div>
                                                ),
                                                p: ({ children }) => <p className="text-sm sm:text-base leading-relaxed mb-4">{children}</p>,
                                                strong: ({ children }) => <strong className="font-bold text-yellow-600 dark:text-yellow-400">{children}</strong>,
                                                code: ({ children }) => <code className="bg-yellow-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm">{children}</code>
                                            }}
                                        >
                                            {explanation}
                                        </ReactMarkdown>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-slate-700">
                                        <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(explanation)} className="text-xs sm:text-sm hover:bg-yellow-100 dark:hover:bg-purple-900/30 hover:border-yellow-500 dark:hover:border-purple-500">Copy Text</Button>
                                        <Button variant="outline" size="sm" onClick={fetchExplanation} className="text-xs sm:text-sm hover:bg-yellow-100 dark:hover:bg-purple-900/30 hover:border-yellow-500 dark:hover:border-purple-500">Regenerate</Button>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ExplainPanel;
