import React, { useState, useCallback } from 'react';
import ReactFlow, { Background, Controls, MiniMap, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';
import { CheckCircle, Circle, ExternalLink, Play, Code2, BookOpen } from 'lucide-react';
import { Button } from '../ui/button';
import { API_BASE_URL } from '../../config/api';
import { motion } from 'framer-motion';
import TopicModal from './TopicModal';

const LearningTree = ({ language, onBack }) => {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [completedTopics, setCompletedTopics] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const generateTree = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/code/generate-tree`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: language.id })
      });

      if (!response.ok) throw new Error('Failed to generate tree');
      const data = await response.json();

      // Create nodes with tree structure
      const newNodes = data.topics.map((topic, index) => {
        const level = topic.level; // beginner, intermediate, advanced
        const row = topic.row || 0;
        const col = topic.col || 0;
        
        return {
          id: topic.id,
          data: {
            label: (
              <div className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  {completedTopics.has(topic.id) ? (
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="font-semibold text-sm text-slate-900 dark:text-white">
                    {topic.title}
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {topic.resources?.videos || 0} videos • {topic.resources?.practice || 0} sites
                </div>
              </div>
            ),
            topic: topic
          },
          position: { x: col * 280, y: row * 150 },
          style: {
            background: completedTopics.has(topic.id) 
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : level === 'beginner'
              ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
              : level === 'intermediate'
              ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
              : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: '16px',
            padding: '0',
            width: 240,
            cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            color: 'white'
          },
          className: 'dark:!border-slate-600'
        };
      });

      // Create edges with arrows
      const newEdges = data.connections.map((conn, index) => ({
        id: `e${conn.from}-${conn.to}`,
        source: conn.from,
        target: conn.to,
        animated: true,
        style: { 
          stroke: completedTopics.has(conn.from) ? '#10b981' : '#94a3b8',
          strokeWidth: 3
        },
        markerEnd: {
          type: 'arrowclosed',
          color: completedTopics.has(conn.from) ? '#10b981' : '#94a3b8'
        }
      }));

      setNodes(newNodes);
      setEdges(newEdges);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate learning tree. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    generateTree();
  }, [language]);

  const handleNodeClick = useCallback((event, node) => {
    setSelectedTopic(node.data.topic);
  }, []);

  const handleTopicComplete = (topicId) => {
    setCompletedTopics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(topicId)) {
        newSet.delete(topicId);
      } else {
        newSet.add(topicId);
      }
      return newSet;
    });
    
    // Update node colors
    setNodes(nodes => nodes.map(node => {
      if (node.id === topicId) {
        return {
          ...node,
          style: {
            ...node.style,
            background: completedTopics.has(topicId)
              ? node.data.topic.level === 'beginner'
                ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                : node.data.topic.level === 'intermediate'
                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
              : 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
          }
        };
      }
      return node;
    }));
  };

  const totalTopics = nodes.length;
  const completedCount = completedTopics.size;
  const progress = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 dark:from-purple-500/20 dark:to-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-orange-500/20 to-amber-500/20 dark:from-indigo-500/20 dark:to-violet-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
      
      {/* Header */}
      <div className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 shadow-lg relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button onClick={onBack} variant="outline" size="sm">
              ← Back
            </Button>
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 bg-gradient-to-r ${language.color} dark:${language.darkColor} rounded-2xl flex items-center justify-center shadow-2xl animate-pulse`}>
                <span className="text-5xl">{language.icon}</span>
              </div>
              <div>
                <h2 className="text-3xl font-black bg-gradient-to-r from-yellow-600 via-orange-600 to-amber-600 dark:from-purple-400 dark:via-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                  {language.name} Learning Path
                </h2>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  🚀 Learn it. 💻 Code it. 🧠 Remember it.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="font-semibold text-slate-600 dark:text-slate-300">Your Progress</span>
              <span className="font-black text-lg bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                {completedCount}/{totalTopics} Topics ({progress}%)
              </span>
            </div>
            <div className="relative h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 relative"
              >
                <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
              </motion.div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex gap-3 text-xs font-semibold">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
              <div className="w-5 h-5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg"></div>
              <span className="text-blue-700 dark:text-blue-300">Beginner</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800">
              <div className="w-5 h-5 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg"></div>
              <span className="text-orange-700 dark:text-orange-300">Intermediate</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
              <div className="w-5 h-5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 shadow-lg"></div>
              <span className="text-red-700 dark:text-red-300">Advanced</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-green-700 dark:text-green-300">Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tree Visualization */}
      <div className="flex-1 bg-gradient-to-br from-yellow-50/50 via-orange-50/50 to-amber-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-purple-500/30 dark:border-purple-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-purple-500 dark:border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-4 border-pink-500 dark:border-pink-400 border-t-transparent rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1s'}}></div>
              </div>
              <p className="text-lg font-bold bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent mb-2">Generating learning tree...</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Creating your personalized path 🌱</p>
            </div>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            fitView
            minZoom={0.5}
            maxZoom={1.5}
          >
            <Background color="#94a3b8" gap={20} size={1} />
            <Controls className="!bg-white dark:!bg-slate-800 !border-slate-200 dark:!border-slate-700" />
            <MiniMap 
              className="!bg-white dark:!bg-slate-800 !border-slate-200 dark:!border-slate-700"
              maskColor="rgba(0, 0, 0, 0.1)"
            />
          </ReactFlow>
        )}
      </div>

      {/* Topic Modal */}
      {selectedTopic && (
        <TopicModal
          topic={selectedTopic}
          language={language}
          isCompleted={completedTopics.has(selectedTopic.id)}
          onComplete={() => handleTopicComplete(selectedTopic.id)}
          onClose={() => setSelectedTopic(null)}
        />
      )}
    </div>
  );
};

export default LearningTree;
