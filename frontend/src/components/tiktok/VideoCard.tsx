import { useState, useRef, useEffect, useContext } from 'react';
import { AuthContext } from '../../store/context';
import { FaHeart, FaCommentDots, FaShare, FaTrash, FaMusic } from 'react-icons/fa';
import CommentSection from './CommentSection';
import { apiUrl, urlimage } from '../../utils/constvar';

interface VideoCardProps {
    video: any;
    onStatsChange: () => void;
}

const VideoCard = ({ video, onStatsChange }: VideoCardProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const ctx = useContext(AuthContext);
    const token = ctx?.token;
    const user = ctx?.user;

    // Check if current user liked it
    const hasLiked = user && video.likes?.includes((user as any)._id);

    useEffect(() => {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.6
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    videoRef.current?.play().catch(e => console.log('Auto-play prevented:', e));
                    setIsPlaying(true);
                } else {
                    videoRef.current?.pause();
                    if (videoRef.current) {
                        videoRef.current.currentTime = 0;
                    }
                    setIsPlaying(false);
                }
            });
        }, options);

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => {
            if (videoRef.current) observer.unobserve(videoRef.current);
        };
    }, []);

    const togglePlay = () => {
        if (isPlaying) {
            videoRef.current?.pause();
            setIsPlaying(false);
        } else {
            videoRef.current?.play().catch(e => console.log('Auto-play prevented:', e));
            setIsPlaying(true);
        }
    };

    const handleLike = async () => {
        if (!token) return alert('يرجى تسجيل الدخول أولاً');

        try {
            const validToken = (await ctx?.CheckAccessToken()) as string;
            if (!validToken) return;

            const res = await fetch(`${apiUrl}/video/${video._id}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${validToken}`
                }
            });
            if (res.ok) {
                onStatsChange(); // Refresh stats
            }
        } catch (error) {
            console.error('Error liking video:', error);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('هل أنت متأكد من حذف هذا الفيديو؟')) return;

        try {
            const validToken = (await ctx?.CheckAccessToken()) as string;
            if (!validToken) return;

            const res = await fetch(`${apiUrl}/video/${video._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${validToken}`
                }
            });
            if (res.ok) {
                onStatsChange();
            }
        } catch (error) {
            console.error('Delete error', error);
        }
    };

    return (
        <div className="h-full w-full snap-start relative bg-black flex items-center justify-center">
            {/* Video Element */}
            <video
                ref={videoRef}
                src={`${apiUrl}${video.videoUrl}`}
                className="h-full w-full object-contain"
                loop
                playsInline
                onClick={togglePlay}
            ></video>

            {/* Play/Pause Overlay Indicator */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2"></div>
                    </div>
                </div>
            )}

            {/* Side Tools */}
            <div className="absolute bottom-20 left-4 flex flex-col gap-6 items-center">
                <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-gray-800">
                    <img src={video.user?.image ? video.user.image : `${urlimage}/images.png`}
                        alt="user"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/images.png'; }} />
                </div>

                <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
                    <div className={`p-3 rounded-full bg-gray-800/60 backdrop-blur-sm transition-transform group-hover:scale-110 ${hasLiked ? 'text-red-500' : 'text-white'}`}>
                        <FaHeart size={24} />
                    </div>
                    <span className="text-sm font-semibold text-white drop-shadow-md">{video.likes?.length || 0}</span>
                </button>

                <button onClick={() => setShowComments(true)} className="flex flex-col items-center gap-1 group">
                    <div className="p-3 rounded-full bg-gray-800/60 backdrop-blur-sm text-white transition-transform group-hover:scale-110">
                        <FaCommentDots size={24} />
                    </div>
                    <span className="text-sm font-semibold text-white drop-shadow-md">{video.comments?.length || 0}</span>
                </button>

                <button className="flex flex-col items-center gap-1 group">
                    <div className="p-3 rounded-full bg-gray-800/60 backdrop-blur-sm text-white transition-transform group-hover:scale-110">
                        <FaShare size={24} />
                    </div>
                    <span className="text-sm font-semibold text-white drop-shadow-md">مشاركة</span>
                </button>

                {user && ((user as any)._id === video.user?._id || user.role === 'admin') && (
                    <button onClick={handleDelete} className="flex flex-col items-center gap-1 mt-4 group">
                        <div className="p-3 rounded-full bg-red-500/80 backdrop-blur-sm text-white transition-transform group-hover:scale-110">
                            <FaTrash size={18} />
                        </div>
                    </button>
                )}
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-0 w-full p-4 pb-6 pt-20 bg-gradient-to-t from-black/80 to-transparent flex flex-col gap-2 pointer-events-none" dir="rtl">
                <h3 className="text-lg font-bold text-white drop-shadow-md">@{video.user?.username || 'user'}</h3>
                <p className="text-sm text-gray-200 drop-shadow-md max-w-[80%] line-clamp-2 leading-relaxed">
                    {video.description}
                </p>
                <div className="flex items-center gap-2 mt-2 text-white/80 animate-pulse">
                    <FaMusic size={12} />
                    <span className="text-xs">الصوت الأصلي - {video.user?.nickname || video.user?.username}</span>
                </div>
            </div>

            {/* Comments Drawer */}
            {showComments && (
                <CommentSection
                    videoId={video._id}
                    comments={video.comments}
                    onClose={() => setShowComments(false)}
                    onCommentAdded={onStatsChange}
                />
            )}
        </div>
    );
};

export default VideoCard;
