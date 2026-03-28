import { useEffect, useState } from 'react';
import useHttp from '../hooks/usehttp';
import { Novel } from '../utils/types';
import Cart3 from '../components/Cart/Cart3';
import Loader from '../components/Loader';
import { Search, BookOpen, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Novels = () => {
    const { sendData, isLoading, errorMessage } = useHttp();
    const [novels, setNovels] = useState<Novel[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredNovels, setFilteredNovels] = useState<Novel[]>([]);

    useEffect(() => {
        sendData<Novel[]>('/novels/search', { method: 'GET' }, (data) => {
            setNovels(data || []);
            setFilteredNovels(data || []);
        });
    }, [sendData]);

    useEffect(() => {
        const filtered = novels.filter(n =>
            n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            n.englishName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredNovels(filtered);
    }, [searchTerm, novels]);

    return (
        <div className="min-h-screen pb-20 pt-10 px-6" dir="rtl">
            <div className="max-w-7xl mx-auto space-y-12">

                <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-border pb-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase">
                            <BookOpen className="w-4 h-4" />
                            مكتبة الروايات
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black font-elmessiri text-foreground">
                            استكشف <span className="text-primary">جميع</span> الروايات
                        </h1>
                    </div>

                    <div className="relative group w-full md:w-96">
                        <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="ابحث عن روايتك القادمة..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full glass bg-muted/50 border border-border rounded-2xl py-4 pr-14 pl-6 focus:outline-none focus:border-primary/50 transition-all text-foreground font-bold font-elmessiri"
                        />
                    </div>
                </header>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm font-bold text-muted-foreground">
                        <span className="glass px-4 py-2 rounded-xl text-primary">{filteredNovels.length} رواية</span>
                        <span className="hidden sm:inline opacity-50">تعرض أحدث الروايات المضافة</span>
                    </div>

                    <button className="flex items-center gap-2 glass px-4 py-2 rounded-xl text-sm font-bold hover:bg-accent transition-colors">
                        <SlidersHorizontal className="w-4 h-4" />
                        تصفية
                    </button>
                </div>

                {isLoading ? (
                    <div className="h-64 flex items-center justify-center">
                        <Loader />
                    </div>
                ) : errorMessage ? (
                    <div className="p-20 text-center glass rounded-3xl border-rose-500/20 text-rose-500 font-bold">
                        {errorMessage}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                    >
                        <AnimatePresence mode='popLayout'>
                            {filteredNovels.length > 0 ? (
                                filteredNovels.map((novel, index) => (
                                    <motion.div
                                        key={novel._id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Cart3 novel={novel} />
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center text-muted-foreground space-y-4">
                                    <BookOpen className="w-20 h-20 mx-auto opacity-10" />
                                    <p className="text-xl font-bold">لا توجد نتائج مطابقة لبحثك</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Novels;
