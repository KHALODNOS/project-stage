import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { FaPaperPlane, FaRobot, FaUser, FaInfoCircle } from 'react-icons/fa';
import useHttp from '../hooks/usehttp';
import { apiUrl, getImageUrl } from '../utils/constvar';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
}

interface NovelOption {
    value: string;
    label: string;
    image?: string;
}

const ChatBot: React.FC = () => {
    const [novels, setNovels] = useState<NovelOption[]>([]);
    const [selectedNovel, setSelectedNovel] = useState<NovelOption | null>(null);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            text: 'مرحباً بك! اختر رواية من القائمة وابدأ بطرح الأسئلة حولها.',
            isUser: false,
        },
    ]);
    const [input, setInput] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { sendData, isLoading, errorMessage } = useHttp();

    // Scroll to bottom whenever messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Fetch novels for the dropdown
    useEffect(() => {
        const fetchNovels = async () => {
            try {
                const res = await axios.get(`${apiUrl}/getnovels/popular`);
                const mapped = res.data.map((n: any) => ({
                    value: n._id,
                    label: n.title || n.englishName,
                    image: n.image,
                }));
                setNovels(mapped);
            } catch (err) {
                console.error('Failed to load novels', err);
            }
        };
        fetchNovels();
    }, []);

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!input.trim()) return;
        if (!selectedNovel) {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    text: 'الرجاء اختيار رواية صالحة أولاً للاستمرار!',
                    isUser: false,
                },
            ]);
            return;
        }

        const msgText = input.trim();
        setInput('');

        // Add User Message
        const userMessage: Message = { id: Date.now().toString(), text: msgText, isUser: true };
        setMessages((prev) => [...prev, userMessage]);

        // Make API Call
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: msgText }),
        };

        await sendData<any>(
            `/search/search-chunks/${selectedNovel.value}`,
            options,
            (data) => {
                const answer = data?.answer || 'عذراً، لم أتمكن من العثور على إجابة.';
                const botMessage: Message = { id: (Date.now() + 1).toString(), text: answer, isUser: false };
                setMessages((prev) => [...prev, botMessage]);
            },
            "",
            true // Need authentication token for this endpoint!
        );
    };

    // React Select Custom Styling
    const customStyles = {
        control: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: '#1f2937',
            borderColor: state.isFocused ? '#14b8a6' : '#374151',
            color: 'white',
            boxShadow: state.isFocused ? '0 0 0 1px #14b8a6' : 'none',
            '&:hover': {
                borderColor: '#14b8a6',
            },
        }),
        singleValue: (provided: any) => ({
            ...provided,
            color: 'white',
        }),
        option: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#14b8a6' : state.isFocused ? '#374151' : '#1f2937',
            color: 'white',
            '&:active': {
                backgroundColor: '#0d9488',
            },
        }),
        menu: (provided: any) => ({
            ...provided,
            backgroundColor: '#1f2937',
            zIndex: 50,
        }),
    };

    return (
        <div className="flex flex-col h-[85vh] max-w-5xl mx-auto p-4 font-Cairo" dir="rtl">
            {/* Container Card */}
            <div className="flex flex-col bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl shadow-teal-900/20 overflow-hidden flex-1 relative">

                {/* Header */}
                <div className="px-6 py-4 bg-gray-800 border-b border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4 z-10">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center shadow-lg">
                            <FaRobot className="text-white text-2xl" />
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-lg">مساعد الذكاء الاصطناعي</h2>
                            <p className="text-gray-400 text-xs mt-0.5">اسأل أي شيء عن روايتك المفضلة</p>
                        </div>
                    </div>

                    <div className="w-full sm:w-72">
                        <Select
                            value={selectedNovel}
                            onChange={(option) => setSelectedNovel(option as NovelOption)}
                            options={novels}
                            styles={customStyles}
                            placeholder="ابحث واختر رواية..."
                            formatOptionLabel={(option: NovelOption) => (
                                <div className="flex items-center gap-2">
                                    {option.image ? (
                                        <img
                                            src={getImageUrl(option.image)}
                                            alt={option.label}
                                            className="w-6 h-8 object-cover rounded shadow-sm"
                                        />
                                    ) : <FaInfoCircle className="text-gray-400" />}
                                    <span className="truncate">{option.label}</span>
                                </div>
                            )}
                        />
                    </div>
                </div>

                {/* Error Messages */}
                {errorMessage && (
                    <div className="bg-red-500/10 border-l-4 border-red-500 text-red-500 p-3 mx-4 mt-4 rounded-md text-sm">
                        {errorMessage}
                    </div>
                )}

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar bg-gray-900/50">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.isUser ? 'justify-start' : 'justify-end'} animate-fade-in-up`}
                        >
                            <div className={`flex max-w-[85%] sm:max-w-[75%] ${msg.isUser ? 'flex-row' : 'flex-row-reverse'} items-end gap-2`}>
                                {/* Avatar */}
                                <div className={`w-8 h-8 rounded-full flex shrink-0 items-center justify-center shadow-md ${msg.isUser ? 'bg-teal-600' : 'bg-gray-700'}`}>
                                    {msg.isUser ? <FaUser className="text-white text-xs" /> : <FaRobot className="text-teal-400 text-xs" />}
                                </div>

                                {/* Bubble */}
                                <div
                                    className={`relative px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm
                    ${msg.isUser
                                            ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-tr-none'
                                            : 'bg-gray-800 border border-gray-700 text-gray-200 rounded-tl-none'
                                        }
                  `}
                                >
                                    {/* Text can contain multiple lines from Gemini responses */}
                                    <div className="whitespace-pre-wrap break-words">{msg.text}</div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {isLoading && (
                        <div className="flex justify-end animate-fade-in">
                            <div className="flex flex-row-reverse items-end gap-2 max-w-[85%]">
                                <div className="w-8 h-8 rounded-full bg-gray-700 shrink-0 flex items-center justify-center shadow-md">
                                    <FaRobot className="text-teal-400 text-xs" />
                                </div>
                                <div className="px-5 py-4 bg-gray-800 border border-gray-700 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-sm">
                                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce delay-75"></span>
                                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce delay-150"></span>
                                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce delay-300"></span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} className="h-2" />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-gray-800 border-t border-gray-700">
                    <form
                        onSubmit={handleSend}
                        className="flex items-center gap-3 bg-gray-900 border border-gray-700 rounded-full p-1 pl-4 pr-1 focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-transparent transition-all shadow-inner"
                    >
                        <input
                            type="text"
                            className="flex-1 bg-transparent border-none text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-0 py-2.5 rtl:text-right"
                            placeholder="اكتب رسالتك الذكية هنا..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                            dir="auto"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="w-10 h-10 shrink-0 bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 text-white rounded-full flex items-center justify-center transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-md"
                        >
                            <FaPaperPlane className="text-sm -ml-1 mt-0.5" />
                        </button>
                    </form>
                </div>

            </div>

            {/* Global minimal CSS for animations */}
            <style>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out forwards;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #374151;
          border-radius: 10px;
        }
      `}</style>
        </div>
    );
};

export default ChatBot;
