import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { API_BASE_URL } from '../config/api';
import { Search, Loader2, BookOpen, X, MessageCircle, FileText, Video, ArrowLeft, CheckCircle, Target, TrendingUp, Sparkles } from 'lucide-react';
import { ThemeToggle } from '../components/ui/theme-toggle';
import VideoModal from '../components/learn/VideoModal';

const Learn = () => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [modalContent, setModalContent] = useState(null);
  const [completedNodes, setCompletedNodes] = useState(new Set());
  const [currentTopic, setCurrentTopic] = useState('');
  const navigate = useNavigate();

  const generateRoadmap = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    // Reset completion tracking when generating new roadmap
    setCompletedNodes(new Set());
    
    try {
      const response = await fetch(`${API_BASE_URL}/learn/generate-roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim() })
      });

      if (!response.ok) throw new Error('Failed to generate roadmap');
      
      const data = await response.json();

      // Create unique node IDs based on topic + index to prevent cross-topic completion conflicts
      const topicPrefix = topic.trim().toLowerCase().replace(/\s+/g, '-');
      const newNodes = data.map((item, index) => ({
        id: `${topicPrefix}-${index + 1}`,
        data: {
          label: (
            <div className="px-4 py-3 text-center relative">
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-purple-500 dark:to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                {index + 1}
              </div>
              <div className="font-semibold text-sm text-slate-900 dark:text-white mb-1">{item.topic}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                <Video className="w-3 h-3 inline mr-1" />
                {item.links.length} videos
              </div>
            </div>
          ),
          topic: item.topic,
          links: item.links,
          index: index,
        },
        position: { x: (index % 3) * 300 + 50, y: Math.floor(index / 3) * 180 + 50 },
        style: {
          background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)',
          border: '3px solid #f59e0b',
          borderRadius: '16px',
          padding: '0',
          width: 220,
          cursor: 'pointer',
          boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.3)',
          transition: 'all 0.3s ease',
        },
        className: 'dark:!bg-gradient-to-br dark:!from-slate-800 dark:!to-slate-700 dark:!border-purple-500 hover:scale-110 hover:shadow-2xl',
      }));

      // Create enhanced edges with animations
      const newEdges = data.slice(1).map((_, index) => ({
        id: `e${topicPrefix}-${index}-${index + 1}`,
        source: `${topicPrefix}-${index + 1}`,
        target: `${topicPrefix}-${index + 2}`,
        animated: true,
        style: { stroke: '#f59e0b', strokeWidth: 3 },
        className: 'dark:!stroke-purple-500',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#f59e0b',
          width: 20,
          height: 20,
        },
        label: `Step ${index + 1}`,
        labelStyle: { fill: '#f59e0b', fontWeight: 600, fontSize: 12 },
        labelBgStyle: { fill: '#fff', fillOpacity: 0.8 },
      }));

      setNodes(newNodes);
      setEdges(newEdges);
      setCurrentTopic(topic.trim());
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate roadmap. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const onNodeClick = useCallback((event, node) => {
    setModalContent({
      topic: node.data.topic,
      links: node.data.links,
      nodeId: node.id,
    });
  }, []);

  const markNodeComplete = (nodeId) => {
    setCompletedNodes(prev => new Set([...prev, nodeId]));
  };

  useEffect(() => {
    if (completedNodes.size > 0) {
      setNodes(nodes => nodes.map(node => ({
        ...node,
        style: {
          ...node.style,
          background: completedNodes.has(node.id) 
            ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
            : node.style.background,
          border: completedNodes.has(node.id)
            ? '3px solid #10b981'
            : node.style.border,
        }
      })));
    }
  }, [completedNodes, setNodes]);

  const closeModal = () => {
    setModalContent(null);
  };

  const resetProgress = () => {
    setCompletedNodes(new Set());
    setNodes([]);
    setEdges([]);
    setTopic('');
    setCurrentTopic('');
  };

  const progressPercentage = nodes.length > 0 ? Math.round((completedNodes.size / nodes.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button onClick={() => navigate('/')} variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-violet-600 dark:to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-violet-600 dark:to-purple-400 bg-clip-text text-transparent">
                  Learning Roadmap
                </h1>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <Card className="p-6 mb-8 shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
          <form onSubmit={generateRoadmap} className="flex gap-3">
            <Input
              type="text"
              placeholder="What do you want to learn? (e.g., Python, Machine Learning, Physics)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={loading}
              className="text-lg py-6 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 border-slate-300 dark:border-slate-600 hover:border-yellow-500 dark:hover:border-purple-500 focus:border-yellow-600 dark:focus:border-purple-600"
            />
            <Button 
              type="submit" 
              disabled={loading || !topic.trim()}
              className="px-8 py-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 dark:from-purple-600 dark:to-indigo-600 dark:hover:from-purple-700 dark:hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Learn
                </>
              )}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground mt-3 text-center">
            ✨ AI will create a personalized learning path with curated YouTube videos
          </p>
        </Card>

        {/* Progress Stats */}
        {nodes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-slate-800 dark:to-slate-700 border-0 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{nodes.length}</div>
                  <div className="text-xs text-muted-foreground">Total Topics</div>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-700 border-0 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{completedNodes.size}</div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-slate-800 dark:to-slate-700 border-0 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{progressPercentage}%</div>
                  <div className="text-xs text-muted-foreground">Progress</div>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-slate-800 dark:to-slate-700 border-0 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{currentTopic}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-[120px]">Learning</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Roadmap Visualization */}
        {nodes.length > 0 && (
          <Card className="p-4 shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Your Learning Path</h2>
                <p className="text-sm text-muted-foreground">Click on any topic to explore videos • Green = Completed</p>
              </div>
              <Button onClick={resetProgress} variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
            <div className="mb-4">
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
            <div className="h-[700px] border-2 border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-950">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                fitView
                className="bg-gradient-to-br from-yellow-50/50 to-orange-50/50 dark:from-slate-950 dark:to-slate-900"
              >
                <Background color="#94a3b8" gap={20} size={1} className="dark:!bg-slate-900" />
                <Controls className="!bg-white dark:!bg-slate-800 !border-slate-200 dark:!border-slate-700" />
                <MiniMap className="!bg-white dark:!bg-slate-800 !border-slate-200 dark:!border-slate-700" nodeColor="#f59e0b" maskColor="rgba(0, 0, 0, 0.1)" />
              </ReactFlow>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!loading && nodes.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-violet-600 dark:to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">Start Your Learning Journey</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Enter any topic above and we'll create a personalized learning roadmap with curated educational videos
            </p>
          </div>
        )}
      </div>

      {/* Video Modal */}
      {modalContent && (
        <VideoModal 
          topic={modalContent.topic}
          links={modalContent.links}
          onClose={closeModal}
          onComplete={() => markNodeComplete(modalContent.nodeId)}
        />
      )}
    </div>
  );
};

export default Learn;
