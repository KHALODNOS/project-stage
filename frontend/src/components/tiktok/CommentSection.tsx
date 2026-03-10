import { useState, useContext } from 'react';
import { AuthContext } from '../../store/context';
import { FaTimes, FaPaperPlane } from 'react-icons/fa';
import { apiUrl, urlimage } from '../../utils/constvar';

interface CommentSectionProps {
    videoId: string;
    comments: any[];
    onClose: () => void;
    onCommentAdded: () => void;
}

const CommentSection = ({ videoId, comments, onClose, onCommentAdded }: CommentSectionProps) => {
    const [text, setText] = useState('');
    const ctx = useContext(AuthContext);
    const token = ctx?.token;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || !token) return;

        setIsSubmitting(true);
        try {
            const validToken = (await ctx?.CheckAccessToken()) as string;
            if (!validToken) {
                setIsSubmitting(false);
                return;
            }

            const res = await fetch(`${apiUrl}/video/${videoId}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${validToken}`
                },
                body: JSON.stringify({ text })
            });

            if (res.ok) {
                setText('');
                onCommentAdded();
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="absolute inset-0 z-40 bg-black/40 backdrop-blur-[2px] flex items-end justify-center sm:items-center">
            {/* Click away dismiss */}
            <div className="absolute inset-0" onClick={onClose}></div>

            <div className="relative w-full sm:max-w-md h-[70%] sm:h-[80%] bg-gray-900 rounded-t-3xl sm:rounded-3xl flex flex-col animate-slide-up shadow-2xl border border-gray-800" dir="rtl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <span className="font-bold text-lg text-white">{comments?.length || 0} تعليقات</span>
                    <button onClick={onClose} className="p-2 bg-gray-800 text-gray-400 rounded-full hover:bg-gray-700 hover:text-white transition">
                        <FaTimes size={16} />
                    </button>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 no-scrollbar">
                    {comments && comments.length > 0 ? (
                        comments.map((comment, idx) => (
                            <div key={idx} className="flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden flex-shrink-0">
                                    <img src={comment.user?.image ? comment.user.image : `${urlimage}/images.png`}
                                        alt="user"
                                        className="w-full h-full object-cover"
                                        onError={(e) => { (e.target as HTMLImageElement).src = '/images.png'; }} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-gray-300">
                                        {comment.user?.username || 'Unknown'}
                                        <span className="text-xs text-gray-500 ml-2 mr-2 font-normal">
                                            {new Date(comment.createdAt).toLocaleDateString('ar')}
                                        </span>
                                    </span>
                                    <p className="text-md text-white mt-1 break-words">{comment.text}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                            لا توجد تعليقات بعد. كن أول من يعلق!
                        </div>
                    )}
                </div>

                {/* Comment Input */}
                <div className="p-4 bg-gray-900 border-t border-gray-800">
                    {token ? (
                        <form onSubmit={handleSubmit} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={text}
                                onChange={e => setText(e.target.value)}
                                placeholder="إضافة تعليق..."
                                className="flex-1 bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-full px-4 py-3 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
                            />
                            <button
                                type="submit"
                                disabled={!text.trim() || isSubmitting}
                                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white p-3 rounded-full flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FaPaperPlane size={16} className="rtl:rotate-180" />
                            </button>
                        </form>
                    ) : (
                        <div className="text-center p-3 text-sm text-red-400 bg-red-500/10 rounded-xl border border-red-500/20">
                            يجب تسجيل الدخول لإضافة تعليق
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes slide-up {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
};

export default CommentSection;
