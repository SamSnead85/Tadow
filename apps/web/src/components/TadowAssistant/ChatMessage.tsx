import { motion } from 'framer-motion';
import type { ChatMessage as ChatMessageType } from '@/types';

interface ChatMessageProps {
    message: ChatMessageType;
    onOptionSelect?: (value: string) => void;
}

export function ChatMessage({ message, onOptionSelect }: ChatMessageProps) {
    const isAssistant = message.role === 'assistant';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}
        >
            <div className={`max-w-[80%] ${isAssistant ? 'mr-12' : 'ml-12'}`}>
                {/* Message Bubble */}
                <div className={isAssistant ? 'chat-bubble-assistant' : 'chat-bubble-user'}>
                    <p className="text-base leading-relaxed">{message.content}</p>
                </div>

                {/* Options (for assistant messages with choices) */}
                {isAssistant && message.options && message.options.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                        className="mt-4 flex flex-wrap gap-2"
                    >
                        {message.options.map((option) => (
                            <motion.button
                                key={option.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onOptionSelect?.(option.value)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 
                           bg-white border border-noir-200 rounded-xl
                           text-noir-700 font-medium text-sm
                           transition-all duration-200
                           hover:border-tadow-400 hover:bg-tadow-50 hover:text-tadow-700
                           focus:outline-none focus:ring-2 focus:ring-tadow-500/20"
                            >
                                {option.icon && <span className="text-lg">{option.icon}</span>}
                                {option.label}
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
