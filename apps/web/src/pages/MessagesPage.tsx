import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import {
    Search, Send, Image, MoreVertical, ArrowLeft,
    Check, CheckCheck, DollarSign, X
} from 'lucide-react';
import { Conversation, Message } from '../types/marketplace';
import {
    getConversations, getConversationMessages, sendMessage
} from '../services/messaging';
import { getCurrentUser, getUserById, getListingById } from '../services/userVerification';

export default function MessagesPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const conversationId = searchParams.get('id');

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const currentUser = getCurrentUser();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const allConversations = getConversations();
        setConversations(allConversations);

        if (conversationId) {
            const conv = allConversations.find((c: Conversation) => c.id === conversationId);
            if (conv) {
                setActiveConversation(conv);
                setMessages(getConversationMessages(conversationId));
            }
        }
    }, [conversationId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!newMessage.trim() || !activeConversation || !currentUser) return;

        const msg = sendMessage(activeConversation.id, currentUser.id, newMessage.trim());
        setMessages(prev => [...prev, msg]);
        setNewMessage('');
    };

    const handleSelectConversation = (conv: Conversation) => {
        setActiveConversation(conv);
        setSearchParams({ id: conv.id });
        setMessages(getConversationMessages(conv.id));
    };

    const filteredConversations = conversations.filter(conv => {
        if (!searchQuery) return true;
        const otherUserId = conv.participants.find(p => p !== currentUser?.id);
        const otherUser = otherUserId ? getUserById(otherUserId) : null;
        return otherUser?.displayName.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col lg:flex-row">
            {/* Conversation List */}
            <div className={`w-full lg:w-80 border-r border-zinc-800 flex flex-col ${activeConversation ? 'hidden lg:flex' : 'flex'
                }`}>
                <div className="p-4 border-b border-zinc-800">
                    <h1 className="text-xl font-bold text-white mb-4">Messages</h1>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search conversations..."
                            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:border-amber-500 focus:outline-none"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.length === 0 ? (
                        <div className="p-8 text-center text-zinc-500">
                            <p>No conversations yet</p>
                            <p className="text-sm mt-1">Start by messaging a seller</p>
                        </div>
                    ) : (
                        filteredConversations.map(conv => (
                            <ConversationItem
                                key={conv.id}
                                conversation={conv}
                                isActive={activeConversation?.id === conv.id}
                                currentUserId={currentUser?.id}
                                onClick={() => handleSelectConversation(conv)}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${activeConversation ? 'flex' : 'hidden lg:flex'
                }`}>
                {activeConversation ? (
                    <>
                        <ChatHeader
                            conversation={activeConversation}
                            currentUserId={currentUser?.id}
                            onBack={() => {
                                setActiveConversation(null);
                                setSearchParams({});
                            }}
                        />

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map(msg => (
                                <MessageBubble
                                    key={msg.id}
                                    message={msg}
                                    isOwn={msg.senderId === currentUser?.id}
                                />
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 border-t border-zinc-800">
                            <div className="flex gap-2">
                                <button className="p-2 text-zinc-500 hover:text-white">
                                    <Image className="w-5 h-5" />
                                </button>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleSend()}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-white focus:border-amber-500 focus:outline-none"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!newMessage.trim()}
                                    className="p-2 bg-amber-500 text-zinc-900 rounded-full disabled:opacity-50"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-zinc-500">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
                                <Send className="w-8 h-8" />
                            </div>
                            <p>Select a conversation</p>
                            <p className="text-sm">or start a new one from a listing</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SUBCOMPONENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function ConversationItem({
    conversation,
    isActive,
    currentUserId,
    onClick
}: {
    conversation: Conversation;
    isActive: boolean;
    currentUserId?: string;
    onClick: () => void;
}) {
    const otherUserId = conversation.participants.find(p => p !== currentUserId);
    const otherUser = otherUserId ? getUserById(otherUserId) : null;
    const listing = conversation.listingId ? getListingById(conversation.listingId) : null;
    const unreadCount = currentUserId ? (conversation.unreadCount[currentUserId] || 0) : 0;

    return (
        <button
            onClick={onClick}
            className={`w-full p-4 flex gap-3 text-left border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors ${isActive ? 'bg-zinc-900' : ''
                }`}
        >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                {otherUser?.displayName.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <span className="font-medium text-white truncate">
                        {otherUser?.displayName || 'Unknown'}
                    </span>
                    {conversation.lastMessage && (
                        <span className="text-xs text-zinc-500">
                            {formatTime(conversation.lastMessage.createdAt)}
                        </span>
                    )}
                </div>
                {listing && (
                    <p className="text-xs text-amber-400 truncate">{listing.title}</p>
                )}
                <p className="text-sm text-zinc-500 truncate">
                    {conversation.lastMessage?.content || 'No messages yet'}
                </p>
            </div>
            {unreadCount > 0 && (
                <span className="w-5 h-5 bg-amber-500 text-zinc-900 text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                </span>
            )}
        </button>
    );
}

function ChatHeader({
    conversation,
    currentUserId,
    onBack
}: {
    conversation: Conversation;
    currentUserId?: string;
    onBack: () => void;
}) {
    const otherUserId = conversation.participants.find(p => p !== currentUserId);
    const otherUser = otherUserId ? getUserById(otherUserId) : null;
    const listing = conversation.listingId ? getListingById(conversation.listingId) : null;

    return (
        <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
            <button onClick={onBack} className="lg:hidden text-zinc-400">
                <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold">
                {otherUser?.displayName.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-white">{otherUser?.displayName || 'Unknown'}</p>
                {listing && (
                    <Link to={`/listing/${listing.id}`} className="text-xs text-amber-400 hover:underline truncate block">
                        {listing.title} - ${listing.price}
                    </Link>
                )}
            </div>
            <button className="text-zinc-400 hover:text-white">
                <MoreVertical className="w-5 h-5" />
            </button>
        </div>
    );
}

function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
    if (message.type === 'offer') {
        return <OfferBubble message={message} isOwn={isOwn} />;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
        >
            <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${isOwn
                ? 'bg-amber-500 text-zinc-900 rounded-br-md'
                : 'bg-zinc-800 text-white rounded-bl-md'
                }`}>
                <p>{message.content}</p>
                <div className={`flex items-center gap-1 mt-1 text-xs ${isOwn ? 'text-zinc-700' : 'text-zinc-500'
                    }`}>
                    <span>{formatTime(message.createdAt)}</span>
                    {isOwn && (
                        message.read
                            ? <CheckCheck className="w-3 h-3" />
                            : <Check className="w-3 h-3" />
                    )}
                </div>
            </div>
        </motion.div>
    );
}

function OfferBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
    // In production, fetch offer details
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
        >
            <div className="max-w-[75%] p-4 bg-zinc-800 border border-zinc-700 rounded-xl">
                <div className="flex items-center gap-2 text-amber-400 mb-2">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-medium">Offer Made</span>
                </div>
                <p className="text-white">{message.content}</p>
                {!isOwn && (
                    <div className="flex gap-2 mt-3">
                        <button className="flex-1 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium">
                            Accept
                        </button>
                        <button className="flex-1 py-2 bg-zinc-700 text-white rounded-lg text-sm">
                            Counter
                        </button>
                        <button className="py-2 px-3 border border-zinc-600 text-zinc-400 rounded-lg text-sm">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

function formatTime(date: Date | string): string {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return d.toLocaleDateString([], { weekday: 'short' });
    } else {
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
}
