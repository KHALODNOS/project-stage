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
  ChevronUp,
  Bookmark
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
  const [savedScrollPosition, setSavedScrollPosition] = useState<number>(0);
  const [hasRestoredScroll, setHasRestoredScroll] = useState(false);
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
  }, [fetchChapter]);

  useEffect(() => {
    if (ctx?.token) {
      sendData<{ lastViewedChapter: number | null, scrollPosition: number }>(
        `/users/lastViewedChapter/${novelId}`,
        { method: 'GET' },
        (data) => {
            setLastViewedChapter(data?.lastViewedChapter as number | null);
            setSavedScrollPosition(data?.scrollPosition || 0);
        },
        undefined, true
      );
    }
  }, [sendData, novelId, ctx?.token]);

  const updateLastViewedChapter = async (newChapterNumber: number, confirmed?: boolean, scrollPos: number = 0) => {
    if (!ctx?.token || !newChapterNumber) return;

    if (lastViewedChapter === null || newChapterNumber > lastViewedChapter || confirmed || scrollPos > 0) {
      try {
        await sendData(
          `/users/lastViewedChapter/${novelId}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chapterNumber: newChapterNumber, scrollPosition: scrollPos }),
          },
          () => {
              setLastViewedChapter(newChapterNumber);
              if (scrollPos > 0) setSavedScrollPosition(scrollPos);
          },
          undefined, true
        );
        if (scrollPos > 0) {
            toast?.addToast("تم الحفظ", "success", "تم حفظ مكان توقفك بنجاح");
        } else {
            toast?.addToast("نجاح", "success", `تم تحديث تقدمك للفصل ${newChapterNumber}`);
        }
      } catch (error) {
        // Error handled by useHttp
      }
    } else if (lastViewedChapter !== newChapterNumber) {
      setShowConfirmModal(true);
    }
  };

  const handleBookmark = () => {
      const scrollPos = window.scrollY / (document.body.offsetHeight - window.innerHeight);
      if (chapter?.chapterNumber) {
          updateLastViewedChapter(chapter.chapterNumber, true, scrollPos);
      }
  };

  useEffect(() => {
      if (savedScrollPosition > 0 && !hasRestoredScroll && chapter?.chapterNumber === lastViewedChapter) {
          const timeout = setTimeout(() => {
              const targetY = savedScrollPosition * (document.body.offsetHeight - window.innerHeight);
              window.scrollTo({ top: targetY, behavior: 'smooth' });
              setHasRestoredScroll(true);
              toast?.addToast("مرحباً بك مجدداً", "success", "تمت استعادة مكان توقفك الأخير");
          }, 1000);
          return () => clearTimeout(timeout);
      }
  }, [savedScrollPosition, hasRestoredScroll, chapter, lastViewedChapter, toast]);

  const handleScroll = useCallback(() => {
    setShowScrollTop(window.scrollY > 1000);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const readingTime = useMemo(() => {
    if (!chapter?.content) return 0;
    const words = chapter.content.trim().split(/\s+/).length;
    return Math.ceil(words / 200);
  }, [chapter?.content]);

  const isRTL = useMemo(() => {
    if (!chapter?.content) return true;
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u0590-\u05FF]/;
    return arabicRegex.test(chapter.content.slice(0, 500));
  }, [chapter?.content]);

  const formatContent = (content: string) => {
    return content.split('\n').filter(p => p.trim()).map((paragraph, index) => (
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: index * 0.05 }}
        key={index}
        className={cn(
            "mb-8",
            isRTL ? "indent-8" : "indent-0"
        )}
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
        <main className="max-w-3xl mx-auto px-6 py-20 md:py-32" dir={isRTL ? "rtl" : "ltr"}>

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
            className={cn(
                "reader-content leading-relaxed mb-24 transition-all duration-500 relative",
                isRTL ? "text-justify" : "text-left"
            )}
            style={{
              fontFamily: isRTL ? `${fontFamily}, serif` : 'inherit',
              fontSize: `${fontSize}px`,
              fontWeight,
              lineHeight
            }}
          >
            {chapter && formatContent(chapter.content)}
            
            {/* End of Chapter Mark */}
            <motion.div 
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               className="flex flex-col items-center gap-6 mt-32 py-10"
            >
                <div className="w-16 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent rounded-full" />
                <span className="text-zinc-600 font-elmessiri text-lg font-bold">انتهى الفصل {chapter?.chapterNumber}</span>
                
                <button 
                  onClick={handleBookmark}
                  className="flex items-center gap-3 px-8 py-4 glass rounded-full border-primary/20 hover:bg-primary/10 transition-all text-primary font-bold group"
                >
                    <Bookmark className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    ضع علامة هنا للعودة لاحقاً
                </button>

                <div className="flex gap-2">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-primary/20" />
                    ))}
                </div>
            </motion.div>
          </article>

          {/* Premium Navigation Footer */}
          <footer className="mt-20 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Previous Chapter */}
              <div className="group">
                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-600 mb-3 block mr-4">الفصل السابق</span>
                {chapter?.prevChapterId ? (
                  <Link
                    to={`/novel/${novelId}/${chapter.prevChapterId}`}
                    className="flex items-center justify-between p-6 rounded-[2.5rem] glass hover:bg-white/10 transition-all border border-white/5 hover:border-primary/20 hover:-translate-y-1 shadow-2xl"
                  >
                    <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-primary/20 transition-colors">
                        <ChevronRight className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-right">
                        <span className="block text-xs text-zinc-500 font-bold mb-1">الرجوع إلى</span>
                        <span className="font-bold text-lg md:text-xl">الفصل السابق</span>
                    </div>
                  </Link>
                ) : (
                  <div className="p-8 rounded-[2.5rem] glass opacity-30 border border-dashed border-white/20 text-center font-bold flex items-center justify-center gap-3">
                    <X className="w-5 h-5 opacity-20" /> البداية الأولى
                  </div>
                )}
              </div>

              {/* Next Chapter */}
              <div className="group text-left">
                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-600 mb-3 block ml-4">الفصل التالي</span>
                {chapter?.nextChapterId ? (
                  <Link
                    to={`/novel/${novelId}/${chapter.nextChapterId}`}
                    onClick={() => {
                        if (chapter?.chapterNumber) updateLastViewedChapter(chapter.chapterNumber);
                    }}
                    className="flex items-center justify-between p-6 rounded-[2.5rem] bg-gradient-to-br from-primary to-emerald-600 text-white shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98] transition-all hover:-translate-y-1"
                  >
                    <div className="text-left">
                        <span className="block text-xs text-white/70 font-bold mb-1">الانتقال إلى</span>
                        <span className="font-bold text-lg md:text-xl">الفصل التالي</span>
                    </div>
                    <div className="p-3 bg-white/20 rounded-2xl group-hover:bg-white/30 transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </div>
                  </Link>
                ) : (
                  <div className="p-8 rounded-[2.5rem] glass opacity-30 border border-dashed border-white/20 text-center font-bold flex items-center justify-center gap-3">
                    تمت قراءة الجميع <Settings className="w-5 h-5 opacity-20" />
                  </div>
                )}
              </div>
            </div>

            {/* Novel Info Shortcut */}
            <Link 
                to={`/novel/${novelId}`}
                className="flex items-center justify-center gap-3 py-6 glass rounded-[2.5rem] border-white/5 hover:bg-white/5 transition-all group"
            >
                <BookOpen className="w-5 h-5 text-zinc-500 group-hover:text-primary transition-colors" />
                <span className="text-sm font-bold text-zinc-500 group-hover:text-white transition-colors">العودة إلى فهرس الرواية الرئيسي</span>
            </Link>
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
                onClick={handleBookmark}
                className="p-4 glass rounded-2xl shadow-2xl hover:bg-white/10 transition-all text-emerald-400"
                title="حفظ علامة التوقف"
              >
                <Bookmark className="w-6 h-6" />
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