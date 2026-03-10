import { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import {
  ChevronRight,
  ChevronLeft,
  Settings,
  X,
  Type,
  Maximize2,
  Minimize2,
  BookOpen,
  Clock,
  Layout,
  MousePointer2,
  ChevronUp
} from 'lucide-react';
import useHttp from "../hooks/usehttp";
import { Chapter } from "../utils/types";
import { AuthContext } from '../store/context';
import { ToastContext } from '../components/message/ToastManager';
import ConfirmModal from '../components/Modal/ConfirmModal';
import Loader from '../components/Loader';
import { cn } from '../utils/cn';

const fonts = [
  { name: 'Amiri', label: 'الأميري (كلاسيك)' },
  { name: 'Cairo', label: 'كايرو (عصري)' },
  { name: 'Tajawal', label: 'تجول (ناعم)' },
  { name: 'Noto Naskh Arabic', label: 'نسخ (واضح)' },
  { name: 'El Messiri', label: 'المسيري (فني)' }
];

const ChapterContent = () => {
  const { chapterId, novelId } = useParams<{ chapterId: string, novelId: string }>();
  const { sendData, isLoading, errorMessage } = useHttp();
  const [chapter, setChapter] = useState<Chapter | undefined>(undefined);

  // Settings State
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem('reader-size')) || 22);
  const [fontFamily, setFontFamily] = useState(() => localStorage.getItem('reader-font') || 'Amiri');
  const [fontWeight, setFontWeight] = useState(() => Number(localStorage.getItem('reader-weight')) || 400);
  const [lineHeight, setLineHeight] = useState(() => Number(localStorage.getItem('reader-line-height')) || 1.8);
  const [showSettings, setShowSettings] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [lastViewedChapter, setLastViewedChapter] = useState<number | null>(null);
  const [hasUpdatedLastViewed, setHasUpdatedLastViewed] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const ctx = useContext(AuthContext);
  const toast = useContext(ToastContext);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Persistence
  useEffect(() => {
    localStorage.setItem('reader-size', fontSize.toString());
    localStorage.setItem('reader-font', fontFamily);
    localStorage.setItem('reader-weight', fontWeight.toString());
    localStorage.setItem('reader-line-height', lineHeight.toString());
  }, [fontSize, fontFamily, fontWeight, lineHeight]);

  const fetchChapter = useCallback(async () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    try {
      await sendData<Chapter>(
        `/chapters/${novelId}/${chapterId}`,
        { method: 'GET' },
        (data) => {
          if (data && data.chapterNumber) setChapter(data);
        }
      );
    } catch (error) {
      console.error("Error fetching chapter:", error);
    }
  }, [chapterId, novelId, sendData]);

  useEffect(() => {
    fetchChapter();
    setHasUpdatedLastViewed(false);
  }, [fetchChapter]);

  useEffect(() => {
    if (ctx?.token) {
      sendData<{ lastViewedChapter: number | null }>(
        `/users/lastViewedChapter/${novelId}`,
        { method: 'GET' },
        (data) => setLastViewedChapter(data?.lastViewedChapter as number | null),
        undefined, true
      );
    }
  }, [sendData, novelId, ctx?.token]);

  const updateLastViewedChapter = async (newChapterNumber: number, confirmed?: boolean) => {
    if (!ctx?.token || hasUpdatedLastViewed || !newChapterNumber) return;

    if (lastViewedChapter === null || newChapterNumber > lastViewedChapter || confirmed) {
      try {
        setHasUpdatedLastViewed(true);
        await sendData(
          `/users/lastViewedChapter/${novelId}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chapterNumber: newChapterNumber }),
          },
          () => setLastViewedChapter(newChapterNumber),
          undefined, true
        );
        toast?.addToast("نجاح", "success", `تم تحديث تقدمك للفصل ${newChapterNumber}`);
      } catch (error) {
        setHasUpdatedLastViewed(false);
      }
    } else if (lastViewedChapter !== newChapterNumber) {
      setShowConfirmModal(true);
    }
  };

  const handleScroll = useCallback(() => {
    setShowScrollTop(window.scrollY > 1000);
    if (!ctx?.token || hasUpdatedLastViewed || !chapter?.chapterNumber) return;
    const progress = (window.innerHeight + window.scrollY) / document.body.offsetHeight;
    if (progress > 0.8) updateLastViewedChapter(chapter.chapterNumber);
  }, [ctx?.token, hasUpdatedLastViewed, chapter]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const readingTime = useMemo(() => {
    if (!chapter?.content) return 0;
    const words = chapter.content.trim().split(/\s+/).length;
    return Math.ceil(words / 200);
  }, [chapter?.content]);

  const formatContent = (content: string) => {
    return content.split('\n').filter(p => p.trim()).map((paragraph, index) => (
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: index * 0.05 }}
        key={index}
        className="mb-8 indent-8"
      >
        {paragraph}
      </motion.p>
    ));
  };

  if (errorMessage) return <div className="min-h-screen flex items-center justify-center text-rose-500 font-bold">{errorMessage}</div>;

  return (
    <div className={cn(
      "min-h-screen transition-all duration-700 selection:bg-primary/30 selection:text-primary",
      isFocusMode ? "bg-[#0a0a0a] text-zinc-400" : "bg-[#111111] text-zinc-200"
    )}>
      {/* Scroll Progress Tube */}
      <div className="fixed top-0 left-0 right-0 h-1 z-[100] bg-white/5">
        <motion.div className="h-full bg-gradient-to-r from-primary to-emerald-400 origin-left" style={{ scaleX }} />
      </div>

      {isLoading ? <div className="h-screen flex items-center justify-center"><Loader /></div> : (
        <main className="max-w-3xl mx-auto px-6 py-20 md:py-32" dir="rtl">

          {/* Enhanced Header */}
          <header className="mb-20 space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-4 mb-4"
            >
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-primary/50" />
              <span className="text-primary font-black tracking-widest text-xs uppercase">الفصل {chapter?.chapterNumber}</span>
              <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-primary/50" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-black font-elmessiri text-center leading-[1.2] text-white"
            >
              {chapter?.title}
            </motion.h1>

            <div className="flex flex-wrap items-center justify-center gap-6 text-zinc-500 text-sm font-bold">
              <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {readingTime} دقيقة قراءة</span>
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
              <Link to={`/novel/${novelId}`} className="flex items-center gap-2 hover:text-primary transition-all">
                <BookOpen className="w-4 h-4" /> العودة للرواية
              </Link>
            </div>
          </header>

          {/* Reader Core */}
          <article
            className="reader-content leading-relaxed text-justify mb-24 transition-all duration-500"
            style={{
              fontFamily: `${fontFamily}, serif`,
              fontSize: `${fontSize}px`,
              fontWeight,
              lineHeight
            }}
          >
            {chapter && formatContent(chapter.content)}
          </article>

          {/* Premium Bottom Nav */}
          <footer className="grid grid-cols-2 gap-4 mt-20 pt-12 border-t border-white/5">
            <div className="group">
              <span className="text-[10px] uppercase tracking-widest font-black text-zinc-600 mb-2 block mr-4">السابق</span>
              {chapter?.prevChapterId ? (
                <Link
                  to={`/novel/${novelId}/${chapter.prevChapterId}`}
                  className="flex items-center justify-between p-4 md:p-6 rounded-3xl glass hover:bg-white/10 transition-all border border-white/5 group-hover:-translate-y-1"
                >
                  <ChevronRight className="w-6 h-6 text-primary" />
                  <span className="font-bold text-sm md:text-lg">الفصل السابق</span>
                </Link>
              ) : (
                <div className="p-6 rounded-3xl glass opacity-20 border border-dashed border-white/20 text-center font-bold">البداية</div>
              )}
            </div>

            <div className="group text-left">
              <span className="text-[10px] uppercase tracking-widest font-black text-zinc-600 mb-2 block ml-4">التالي</span>
              {chapter?.nextChapterId ? (
                <Link
                  to={`/novel/${novelId}/${chapter.nextChapterId}`}
                  className="flex items-center justify-between p-4 md:p-6 rounded-3xl bg-primary text-white shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all group-hover:-translate-y-1"
                >
                  <span className="font-bold text-sm md:text-lg">الفصل التالي</span>
                  <ChevronLeft className="w-6 h-6" />
                </Link>
              ) : (
                <div className="p-6 rounded-3xl glass opacity-20 border border-dashed border-white/20 text-center font-bold text-left">النهاية</div>
              )}
            </div>
          </footer>

          {/* Floating Luxury Controls */}
          <div className="fixed bottom-8 left-8 right-8 md:right-12 md:left-auto md:bottom-12 flex flex-row md:flex-col gap-4 z-[90] items-center justify-center pointer-events-none">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex md:flex-col gap-3 pointer-events-auto">
              <button
                onClick={() => setIsFocusMode(!isFocusMode)}
                className={cn(
                  "p-4 glass rounded-2xl shadow-2xl transition-all",
                  isFocusMode ? "bg-primary text-white" : "hover:bg-white/10"
                )}
                title="وضع التركيز"
              >
                {isFocusMode ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
              </button>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-4 glass rounded-2xl shadow-2xl hover:bg-white/10 transition-all"
                title="الإعدادات"
              >
                <Settings className="w-6 h-6" />
              </button>

              <AnimatePresence>
                {showScrollTop && (
                  <motion.button
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="p-4 glass rounded-2xl shadow-2xl hover:bg-primary/20 transition-all text-primary"
                  >
                    <ChevronUp className="w-6 h-6" />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Glass Settings Sidebar */}
          <AnimatePresence>
            {showSettings && (
              <>
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setShowSettings(false)}
                  className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
                />
                <motion.aside
                  initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
                  className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-[#0d0d0d] border-r border-white/5 z-[110] shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col"
                  dir="rtl"
                >
                  <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-xl font-black flex items-center gap-3">
                      <Layout className="w-6 h-6 text-primary" /> تخصيص التجربة
                    </h3>
                    <button onClick={() => setShowSettings(false)} className="p-3 glass rounded-2xl hover:bg-rose-500/20 text-rose-500 transition-all">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="flex-grow p-8 space-y-12 overflow-y-auto custom-scrollbar">
                    {/* Size Control */}
                    <section className="space-y-6">
                      <div className="flex justify-between items-center text-zinc-500 font-black text-xs uppercase tracking-widest">
                        <span>حجم الخط</span>
                        <span className="text-primary font-mono text-lg">{fontSize}px</span>
                      </div>
                      <input
                        type="range" min="16" max="42" step="1"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full h-1.5 bg-white/5 rounded-full appearance-none accent-primary cursor-pointer"
                      />
                    </section>

                    {/* Font Selector */}
                    <section className="space-y-6">
                      <div className="flex items-center gap-2 text-zinc-500 font-black text-xs uppercase tracking-widest">
                        <Type className="w-4 h-4" /> نوع الخط
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {fonts.map(f => (
                          <button
                            key={f.name}
                            onClick={() => setFontFamily(f.name)}
                            className={cn(
                              "p-5 rounded-[2rem] border transition-all text-right relative overflow-hidden group",
                              fontFamily === f.name ? "bg-primary/10 border-primary text-primary" : "bg-white/5 border-white/5 hover:border-white/20"
                            )}
                            style={{ fontFamily: f.name }}
                          >
                            <span className="text-lg font-bold">{f.label}</span>
                            {fontFamily === f.name && <div className="absolute left-6 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.5)]" />}
                          </button>
                        ))}
                      </div>
                    </section>

                    {/* Line Height & Weight */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <section className="space-y-6">
                        <span className="text-zinc-500 font-black text-[10px] uppercase tracking-widest block">ارتفاع السطر</span>
                        <div className="flex gap-2 bg-white/5 p-1 rounded-2xl">
                          {[1.6, 1.8, 2.0].map(v => (
                            <button
                              key={v} onClick={() => setLineHeight(v)}
                              className={cn("flex-1 py-3 rounded-xl text-xs font-black transition-all", lineHeight === v ? "bg-primary text-white shadow-lg" : "hover:bg-white/5")}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </section>
                      <section className="space-y-6">
                        <span className="text-zinc-500 font-black text-[10px] uppercase tracking-widest block">ثقل الخط</span>
                        <div className="flex gap-2 bg-white/5 p-1 rounded-2xl">
                          {[400, 600, 700].map(v => (
                            <button
                              key={v} onClick={() => setFontWeight(v)}
                              className={cn("flex-1 py-3 rounded-xl text-xs font-black transition-all", fontWeight === v ? "bg-primary text-white shadow-lg" : "hover:bg-white/5")}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </section>
                    </div>
                  </div>

                  <div className="p-8 border-t border-white/5">
                    <button
                      onClick={() => setShowSettings(false)}
                      className="w-full bg-white text-black font-black py-4 rounded-[2rem] hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                    >
                      <MousePointer2 className="w-5 h-5 fill-current" /> حفظ التفضيلات
                    </button>
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>
        </main>
      )}

      <ConfirmModal
        isOpen={showConfirmModal}
        onConfirm={async () => {
          setShowConfirmModal(false);
          await updateLastViewedChapter(chapter?.chapterNumber as number, true);
        }}
        onClose={() => setShowConfirmModal(false)}
        title='مزامنة التقدم'
        message={`هل ترغب في تحديث سجل قراءتك إلى الفصل ${chapter?.chapterNumber}؟ سيساعدك هذا على المتابعة من حيث توقفت.`}
      />

      <style>{`
        .reader-content ::selection {
          background: var(--color-primary);
          color: white;
        }
        .reader-content p {
          transition: color 0.5s ease;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

export default ChapterContent;