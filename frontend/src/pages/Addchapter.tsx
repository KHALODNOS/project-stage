import React, { useState, useEffect, useContext, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    PenTool,
    Save,
    ArrowRight,
    Maximize2,
    Minimize2,
    Hash,
    Type,
    Sparkles
} from "lucide-react";
import useHttp from "../hooks/usehttp";
import { Chapter, Novel } from "../utils/types";
import { validateObjectId } from "../utils/valideobject";
import Loader from "../components/Loader";
import { ToastContext } from "../components/message/ToastManager";
import { cn } from "../utils/cn";
import { GlassCard } from "../components/ui/GlassCard";

const AddChapter: React.FC = () => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [chapterNumber, setchapterNumber] = useState<number | "">("");
    const [isZenMode, setIsZenMode] = useState(false);

    const navigate = useNavigate();
    const { novelId } = useParams<{ novelId: string }>();
    const toast = useContext(ToastContext);

    const { sendData, isLoading, errorMessage } = useHttp();
    const [novel, setNovel] = useState<Novel | undefined>();

    useEffect(() => {
        if (!validateObjectId(novelId)) {
            navigate("/");
        } else {
            sendData<Novel>(`/novels/${novelId}`, { method: "GET" }, (data) => {
                setNovel(data);
                if (data?.chapter_info?.numberOfChapters) {
                    setchapterNumber(data.chapter_info.numberOfChapters + 1);
                } else {
                    setchapterNumber(1);
                }
            });
        }
    }, [navigate, novelId, sendData]);

    const wordCount = useMemo(() => content.trim() ? content.trim().split(/\s+/).length : 0, [content]);
    const readingTime = useMemo(() => Math.ceil(wordCount / 200), [wordCount]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const chapterData = { chapterNumber, title, content };
        try {
            await sendData<Chapter>(
                `/chapters/${novelId}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(chapterData),
                },
                () => {
                    toast?.addToast('نجاح', 'success', 'تم نشر الفصل بنجاح');
                    navigate(`/novel/${novelId}`);
                },
                undefined,
                true
            );
        } catch (error) {
            toast?.addToast('خطأ', 'error', 'فشل في نشر الفصل');
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;
    if (errorMessage) return <div className="p-20 text-center text-rose-500 font-bold">{errorMessage}</div>;

    return (
        <div className={cn(
            "min-h-screen transition-all duration-700 ease-in-out pb-20 font-NotoKufi",
            isZenMode ? "bg-[#0a0a0a]" : "bg-[#0f0f0f] pt-10"
        )} dir="rtl">
            <div className={cn(
                "max-w-7xl mx-auto px-6 space-y-10",
                isZenMode && "max-w-4xl pt-20"
            )}>
                {/* Header Section */}
                <AnimatePresence mode='wait'>
                    {!isZenMode && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex flex-col md:flex-row md:items-center justify-between gap-6"
                        >
                            <div className="space-y-2">
                                <Link to={`/novel/${novelId}`} className="flex items-center gap-2 text-primary hover:text-primary-hover transition-colors text-sm font-black uppercase tracking-tighter">
                                    <ArrowRight className="w-4 h-4" />
                                    <span>العودة للرواية</span>
                                </Link>
                                <h1 className="text-3xl md:text-5xl font-black font-elmessiri text-white">
                                    أضف فصلاً لـ <span className="text-primary italic">{novel?.title}</span>
                                </h1>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsZenMode(true)}
                                    className="flex items-center gap-3 glass px-8 py-4 rounded-2xl hover:bg-primary/20 transition-all font-black text-sm text-white group"
                                >
                                    <Maximize2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    وضع التركيز
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Form Area */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">

                    {/* Sidebar Stats */}
                    <div className={cn(
                        "lg:col-span-1 space-y-6 sticky top-10",
                        isZenMode && "hidden lg:block opacity-10 hover:opacity-100 transition-opacity duration-500"
                    )}>
                        <GlassCard className="p-8 space-y-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2 px-2">
                                    <Hash className="w-3 h-3 text-primary" />
                                    ترتيب الفصل
                                </label>
                                <input
                                    type="number"
                                    value={chapterNumber}
                                    onChange={(e) => setchapterNumber(Number(e.target.value))}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 px-6 text-2xl font-black focus:border-primary/50 outline-none transition-all text-center text-white font-mono"
                                    required
                                />
                            </div>

                            <div className="space-y-6 border-t border-white/5 pt-10">
                                <div className="group flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-2">عدد الكلمات</span>
                                    <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 group-hover:border-primary/30 transition-colors">
                                        <span className="text-2xl font-black text-white font-mono">{wordCount}</span>
                                    </div>
                                </div>
                                <div className="group flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-2">مدة القراءة</span>
                                    <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 group-hover:border-primary/30 transition-colors">
                                        <span className="text-2xl font-black text-primary font-mono">{readingTime} <small className="text-xs font-NotoKufi opacity-50">دقيقة</small></span>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-3 bg-primary text-white py-5 rounded-3xl font-black shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-lg"
                            >
                                <Save className="w-5 h-5" />
                                نشر الفصل
                            </button>
                        </GlassCard>

                        {!isZenMode && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 rounded-3xl bg-primary/5 border border-primary/20 space-y-3">
                                <div className="flex items-center gap-2 font-black text-primary text-xs uppercase underline decoration-2 underline-offset-4">
                                    <Sparkles className="w-4 h-4" />
                                    نصيحة المبدعين
                                </div>
                                <p className="text-xs text-zinc-500 leading-relaxed font-bold">
                                    "وضع التركيز" يمنحك سرعة أكبر بنسبة 40% في الكتابة. جربه الآن واستمتع بتجربة كتابة سينمائية.
                                </p>
                            </motion.div>
                        )}
                    </div>

                    {/* Editor Content */}
                    <div className={cn(
                        "lg:col-span-3 space-y-8 relative",
                        isZenMode && "lg:col-span-4"
                    )}>
                        <AnimatePresence>
                            {isZenMode && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    onClick={() => setIsZenMode(false)}
                                    className="fixed top-10 left-10 p-5 glass rounded-3xl z-[100] hover:bg-rose-500 hover:text-white text-rose-500 transition-all shadow-2xl shadow-rose-500/20"
                                >
                                    <Minimize2 className="w-6 h-6" />
                                </motion.button>
                            )}
                        </AnimatePresence>

                        <div className="space-y-6">
                            <div className="relative group">
                                <motion.div animate={{ opacity: isZenMode ? 0.3 : 1 }}>
                                    <Type className="absolute right-8 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-600 group-focus-within:text-primary transition-colors z-10" />
                                    <input
                                        type="text"
                                        placeholder="عنوان الفصل..."
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className={cn(
                                            "w-full glass border-white/10 rounded-3xl py-8 pr-16 pl-8 text-3xl font-black focus:border-primary outline-none transition-all text-white placeholder:text-zinc-700",
                                            isZenMode && "bg-transparent border-none text-5xl shadow-none text-center font-elmessiri"
                                        )}
                                        required
                                    />
                                </motion.div>
                            </div>

                            <div className="relative">
                                {!isZenMode && <PenTool className="absolute right-10 top-10 w-8 h-8 text-primary opacity-10 pointer-events-none" />}
                                <textarea
                                    placeholder="هنا تبدأ الأسطورة الجديدة..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className={cn(
                                        "w-full glass border-white/10 rounded-[60px] p-12 min-h-[700px] text-xl leading-[2] focus:border-primary outline-none transition-all font-normal text-zinc-300 shadow-2xl placeholder:opacity-20",
                                        isZenMode && "bg-transparent border-none shadow-none text-zinc-400 text-3xl leading-[2.5] max-w-4xl mx-auto block text-justify"
                                    )}
                                    required
                                ></textarea>

                                {/* Floating Progress/Word Count for Zen Mode */}
                                {isZenMode && (
                                    <motion.div
                                        initial={{ y: 50, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className="fixed bottom-12 left-1/2 -translate-x-1/2 glass px-10 py-4 rounded-full text-sm font-black z-[100] flex items-center gap-8 text-zinc-500 border-white/10"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-mono">{wordCount}</span> كلمة
                                        </div>
                                        <div className="w-[1px] h-4 bg-white/10" />
                                        <div className="flex items-center gap-2">
                                            <span className="text-primary font-mono">{readingTime}</span> دقائق قراءة
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddChapter;

