import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from './ChatMessage';
import { questions, personaDescriptions } from './questions';
import type { ChatMessage as ChatMessageType, QuestionnaireAnswers, Persona } from '@/types';
import { determinePersona } from '@/utils/recommendations';

export function ChatInterface() {
    const navigate = useNavigate();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<ChatMessageType[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Partial<QuestionnaireAnswers>>({});
    const [isTyping, setIsTyping] = useState(false);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Send first question on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            sendAssistantMessage(questions[0]);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const sendAssistantMessage = (question: typeof questions[0]) => {
        setIsTyping(true);

        setTimeout(() => {
            const newMessage: ChatMessageType = {
                id: `msg-${Date.now()}`,
                role: 'assistant',
                content: question.text,
                timestamp: new Date(),
                options: question.options,
            };
            setMessages(prev => [...prev, newMessage]);
            setIsTyping(false);
        }, 800);
    };

    const handleOptionSelect = (value: string) => {
        const currentQuestion = questions[currentQuestionIndex];

        // Add user's response
        const selectedOption = currentQuestion.options.find(o => o.value === value);
        const userMessage: ChatMessageType = {
            id: `msg-${Date.now()}-user`,
            role: 'user',
            content: selectedOption?.label || value,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);

        // Store the answer
        const newAnswers = { ...answers, [currentQuestion.key]: value };
        setAnswers(newAnswers);

        // Check if we have more questions
        if (currentQuestionIndex < questions.length - 1) {
            const nextIndex = currentQuestionIndex + 1;
            setCurrentQuestionIndex(nextIndex);

            setTimeout(() => {
                sendAssistantMessage(questions[nextIndex]);
            }, 500);
        } else {
            // All questions answered - show persona and navigate
            handleComplete(newAnswers as QuestionnaireAnswers);
        }
    };

    const handleComplete = (finalAnswers: QuestionnaireAnswers) => {
        setIsTyping(true);

        const persona = determinePersona(finalAnswers);
        const personaInfo = personaDescriptions[persona];

        setTimeout(() => {
            const summaryMessage: ChatMessageType = {
                id: `msg-${Date.now()}-summary`,
                role: 'assistant',
                content: `Perfect! Based on your answers, you're ${personaInfo.emoji} **${personaInfo.name}**.\n\n${personaInfo.description}\n\nLet me find the best laptops for you...`,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, summaryMessage]);
            setIsTyping(false);

            // Navigate to results after a short delay
            setTimeout(() => {
                navigate('/results', {
                    state: {
                        persona,
                        answers: finalAnswers
                    }
                });
            }, 2000);
        }, 1000);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-gradient-to-b from-white to-noir-50">
            {/* Chat Header */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-noir-100 bg-white/80 backdrop-blur-sm">
                <div className="container-narrow">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-verity-100 flex items-center justify-center">
                            <span className="text-verity-600 font-display font-bold">V</span>
                        </div>
                        <div>
                            <h2 className="font-semibold text-noir-900">Verity Assistant</h2>
                            <p className="text-sm text-noir-500">Your AI Decision Concierge</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto smooth-scroll hide-scrollbar px-6 py-8">
                <div className="container-narrow space-y-6">
                    <AnimatePresence>
                        {messages.map((message) => (
                            <ChatMessage
                                key={message.id}
                                message={message}
                                onOptionSelect={handleOptionSelect}
                            />
                        ))}
                    </AnimatePresence>

                    {/* Typing Indicator */}
                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex justify-start"
                        >
                            <div className="chat-bubble-assistant flex items-center gap-1">
                                <motion.span
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="w-2 h-2 bg-noir-400 rounded-full"
                                />
                                <motion.span
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                                    className="w-2 h-2 bg-noir-400 rounded-full"
                                />
                                <motion.span
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                                    className="w-2 h-2 bg-noir-400 rounded-full"
                                />
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-6 py-4 border-t border-noir-100 bg-white/80 backdrop-blur-sm">
                <div className="container-narrow">
                    <p className="text-center text-sm text-noir-400">
                        Powered by Verity AI • No ads, no sponsored content
                    </p>
                </div>
            </div>
        </div>
    );
}
