import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../store/context';
import { FaArrowLeft, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import VideoCard from '../components/tiktok/VideoCard';
import { User } from '../utils/types';
import { apiUrl } from '../utils/constvar';

interface Video {
    _id: string;
    videoUrl: string;
    description: string;
    user: {
        _id: string;
        username: string;
        image: string;
        nickname: string;
    } | User;
    likes: string[];
    comments: any[];
}

const TikTokPage = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [description, setDescription] = useState('');
    const ctx = useContext(AuthContext);
    const token = ctx?.token;

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const response = await fetch(`${apiUrl}/video`);
            if (response.ok) {
                const data = await response.json();
                setVideos(data);
            }
        } catch (error) {
            console.error('Error fetching videos:', error);
        }
    };

    const handleUploadClick = () => {
        setIsUploading(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploadFile(e.target.files[0]);
        }
    };

    const handleUploadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadFile) return;

        const validToken = await ctx?.CheckAccessToken();
        if (!validToken) return;

        const formData = new FormData();
        formData.append('video', uploadFile);
        formData.append('description', description);

        try {
            const response = await fetch(`${apiUrl}/video`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${validToken}`
                },
                body: formData
            });

            if (response.ok) {
                setIsUploading(false);
                setUploadFile(null);
                setDescription('');
                fetchVideos(); // Refresh list
            }
        } catch (error) {
            console.error('Error uploading video:', error);
        }
    };

    return (
        <div className="fixed inset-0 z-[10000] bg-black text-white font-sans overflow-hidden">
            {/* Header / Nav overlay */}
            <div className="absolute top-0 w-full z-10 flex justify-between items-center p-4 bg-gradient-to-b from-black/60 to-transparent">
                <Link to="/" className="text-white hover:text-gray-300 transition block bg-black/30 p-2 rounded-full backdrop-blur-sm">
                    <FaArrowLeft size={20} />
                </Link>
                <div className="flex gap-4 font-bold text-lg drop-shadow-md">
                    <span className="text-gray-400">متابعة</span>
                    <span className="text-white">لك</span>
                </div>
                {token && (
                    <button
                        onClick={handleUploadClick}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 px-4 rounded-full font-bold flex items-center gap-2 transition"
                    >
                        <FaPlus size={14} /> إضافة
                    </button>
                )}
            </div>

            {/* Video Feed */}
            <div className="h-full w-full flex justify-center bg-zinc-950">
                <div className="h-full w-full max-w-[450px] snap-y snap-mandatory overflow-y-scroll no-scrollbar shadow-[0_0_100px_rgba(0,0,0,0.8)] relative z-0">
                    {videos.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-400 flex-col gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                            <p>جاري تحميل الفيديوهات...</p>
                        </div>
                    ) : (
                        videos.map(video => (
                            <VideoCard key={video._id} video={video} onStatsChange={fetchVideos} />
                        ))
                    )}
                </div>
            </div>

            {/* Upload Modal */}
            {isUploading && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-700 p-6 rounded-2xl w-full max-w-md" dir="rtl">
                        <h2 className="text-2xl font-bold mb-6 text-white text-center">نشر فيديو جديد</h2>

                        <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-gray-400 mb-2">اختر فيديو</label>
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={handleFileChange}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 mb-2">الوصف</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                                    rows={3}
                                    placeholder="اكتب وصفاً للفيديو..."
                                ></textarea>
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button
                                    type="submit"
                                    disabled={!uploadFile}
                                    className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-xl transition disabled:opacity-50"
                                >
                                    نشر الفيديو
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsUploading(false)}
                                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-xl transition"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default TikTokPage;
