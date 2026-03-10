import { Link, useParams } from 'react-router-dom';
import { Chapter } from '../../utils/types';
import { useEffect, useState, useMemo } from 'react';
import useHttp from '../../hooks/usehttp';
import formatDate from "../../utils/formatDate";
import { motion } from 'framer-motion';
import { Search, BookOpen, User, Calendar, ArrowUpRight } from 'lucide-react';

const Chapters = () => {
  const { sendData, isLoading, errorMessage } = useHttp();
  const [chapters, setChapters] = useState<Chapter[] | undefined>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { novelId } = useParams();

  useEffect(() => {
    sendData<Chapter[]>(
      `/chapters/${novelId}`,
      { method: 'GET' },
      (data) => setChapters(data)
    );
  }, [sendData, novelId]);

  const filteredChapters = useMemo(() => {
    return chapters?.filter(ch =>
      ch.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ch.chapterNumber.toString().includes(searchTerm)
    );
  }, [chapters, searchTerm]);

  if (isLoading) return <div className="p-10 text-center text-muted-foreground font-elmessiri">جاري تحميل الفصول...</div>;
  if (errorMessage) return <div className="p-10 text-center text-rose-500">{errorMessage}</div>;

  return (
    <section className="mt-12 max-w-7xl mx-auto px-6 mb-20" dir="rtl">
      <div className="glass p-8 rounded-3xl border border-white/10 space-y-8 shadow-2xl">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <BookOpen className="text-primary w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold font-elmessiri">قائمة الفصول</h3>
            <span className="glass px-3 py-1 rounded-full text-[10px] text-muted-foreground font-mono">
              {chapters?.length || 0} فصل
            </span>
          </div>

          <div className="relative group md:w-80">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="بحث عن فصل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pr-12 pl-4 focus:outline-none focus:border-primary/50 transition-all text-sm font-medium"
            />
          </div>
        </div>

        {/* Table Header */}
        <div className="hidden md:flex items-center gap-4 px-6 py-4 bg-primary/5 rounded-2xl text-xs font-bold text-primary tracking-widest uppercase">
          <p className="w-24">الفصل</p>
          <p className="flex-grow">عنوان الفصل</p>
          <p className="w-40">المترجم</p>
          <p className="w-32">التاريخ</p>
          <p className="w-10"></p>
        </div>

        {/* Chapters List */}
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredChapters?.map((chapter, index) => (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.01 }}
              key={chapter._id}
            >
              <Link
                to={`/novel/${novelId}/${chapter._id}`}
                className="flex flex-col md:flex-row md:items-center gap-4 p-4 md:px-6 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all group"
              >
                <div className="flex items-center justify-between md:w-24">
                  <span className="text-sm font-bold text-primary">فصل {chapter.chapterNumber}</span>
                  <ArrowUpRight className="w-4 h-4 text-primary md:hidden opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="flex-grow">
                  <h4 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">
                    {chapter.title}
                  </h4>
                </div>

                <div className="flex items-center gap-6 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 w-40">
                    <User className="w-3.5 h-3.5 text-primary/50" />
                    <span>{chapter.translators}</span>
                  </div>
                  <div className="flex items-center gap-2 w-32">
                    <Calendar className="w-3.5 h-3.5 text-primary/50" />
                    <span>{formatDate(new Date(chapter.createdAt))}</span>
                  </div>
                </div>

                <div className="hidden md:block w-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="w-5 h-5 text-primary" />
                </div>
              </Link>
            </motion.div>
          ))}
          {filteredChapters?.length === 0 && (
            <div className="py-20 text-center text-muted-foreground space-y-4">
              <BookOpen className="w-12 h-12 mx-auto opacity-20" />
              <p>لم يتم العثور على فصول تطابق بحثك</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Chapters;
