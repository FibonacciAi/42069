import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ZoomIn, ZoomOut, Move, Search, Settings, Save, Share } from 'lucide-react';

const ThoughtNetwork = () => {
    const [thoughts, setThoughts] = useState([]);
    const [connections, setConnections] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isAddingThought, setIsAddingThought] = useState(false);
    const [apiKey, setApiKey] = useState(localStorage.getItem('openai-key') || '');
    const inputRef = useRef(null);

    // Enhanced thought addition handler
    const handleAddThought = (text) => {
        if (!text.trim()) return;
        
        const newThought = {
            id: Date.now(),
            text: text.trim(),
            x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
            y: window.innerHeight / 2 + (Math.random() - 0.5) * 200,
            timestamp: new Date(),
        };
        
        setThoughts(prev => [...prev, newThought]);
        setInputValue(''); // Clear input after adding
        
        // Analyze connections in the background
        if (apiKey) {
            analyzeNewConnections(newThought);
        }
    };

    // Handle quick input submission
    const handleQuickSubmit = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddThought(inputValue);
        }
    };

    // Handle form submission (for mobile)
    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleAddThought(inputValue);
    };

    // Focus input on mount
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    return (
        <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
            {/* Top Controls */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center gap-4 bg-gray-800/80 backdrop-blur">
                <button
                    onClick={() => setIsAddingThought(true)}
                    className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                </button>

                <form 
                    className="flex-1 max-w-2xl"
                    onSubmit={handleFormSubmit}
                >
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Type a thought and press Enter..."
                        className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleQuickSubmit}
                    />
                </form>

                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600">
                        <ZoomIn className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600">
                        <ZoomOut className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600">
                        <Move className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600">
                        <Save className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600">
                        <Share className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Lightbox for longer thoughts */}
            <AnimatePresence>
                {isAddingThought && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/50"
                    >
                        <div className="bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-lg">
                            <h2 className="text-xl font-bold mb-4">Add Detailed Thought</h2>
                            <textarea
                                autoFocus
                                className="w-full h-32 px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 resize-none"
                                placeholder="Enter your detailed thought..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        const text = e.target.value;
                                        if (text.trim()) {
                                            handleAddThought(text);
                                            setIsAddingThought(false);
                                        }
                                    }
                                }}
                            />
                            <div className="flex justify-end gap-3 mt-4">
                                <button 
                                    className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
                                    onClick={() => setIsAddingThought(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600"
                                    onClick={(e) => {
                                        const textarea = e.target.parentElement.parentElement.querySelector('textarea');
                                        if (textarea.value.trim()) {
                                            handleAddThought(textarea.value);
                                            setIsAddingThought(false);
                                        }
                                    }}
                                >
                                    Add Thought
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* API Key Modal */}
            <AnimatePresence>
                {!apiKey && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/50"
                    >
                        <div className="bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4">Enter OpenAI API Key</h2>
                            <input
                                type="password"
                                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white"
                                placeholder="sk-..."
                                onChange={(e) => setApiKey(e.target.value)}
                            />
                            <button 
                                className="w-full mt-4 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600"
                                onClick={() => {
                                    localStorage.setItem('openai-key', apiKey);
                                    if (inputRef.current) {
                                        inputRef.current.focus();
                                    }
                                }}
                            >
                                Start Mapping
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Visualization Area */}
            <svg className="w-full h-full">
                {/* Connection lines */}
                {connections.map((conn, i) => (
                    <motion.line
                        key={`conn-${i}`}
                        x1={thoughts.find(t => t.id === conn.source)?.x || 0}
                        y1={thoughts.find(t => t.id === conn.source)?.y || 0}
                        x2={thoughts.find(t => t.id === conn.target)?.x || 0}
                        y2={thoughts.find(t => t.id === conn.target)?.y || 0}
                        stroke={`hsla(${210 + conn.strength * 60}, 80%, 60%, ${conn.strength})`}
                        strokeWidth={conn.strength * 3}
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                    />
                ))}

                {/* Thought nodes */}
                {thoughts.map((thought, i) => (
                    <motion.g
                        key={`thought-${i}`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", damping: 20 }}
                    >
                        <circle
                            cx={thought.x}
                            cy={thought.y}
                            r={30}
                            className="fill-blue-500/20 stroke-blue-400"
                            strokeWidth={2}
                        />
                        <text
                            x={thought.x}
                            y={thought.y}
                            className="text-sm fill-white text-center"
                            textAnchor="middle"
                            dy=".3em"
                        >
                            {thought.text}
                        </text>
                    </motion.g>
                ))}
            </svg>
        </div>
    );
};

export default ThoughtNetwork;
