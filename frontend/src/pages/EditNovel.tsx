import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import {
    Image as ImageIcon,
    Feather,
    Star,
    Save,
    ArrowRight,
    PlusCircle
} from 'lucide-react';
import { Novel } from '../utils/types';
import { urlimage } from "../utils/constvar.ts"
import useHttp from '../hooks/usehttp';
import { ToastContext } from "../components/message/ToastManager";
import Loader from '../components/Loader.tsx';
import { GlassCard } from '../components/ui/GlassCard';
import { cn } from '../utils/cn';

const genreOptions = [
    { label: 'الفانتازيا', value: 'الفانتازيا' }, { label: 'الخيال العلمي', value: 'الخيال العلمي' },
    { label: 'الغموض', value: 'الغموض' }, { label: 'الإثارة', value: 'الإثارة' },
    { label: 'الرومانسية', value: 'الرومانسية' }, { label: 'الغرب الأمريكي', value: 'الغرب الأمريكي' },
    { label: 'ديستوبيا', value: 'ديستوبيا' }, { label: 'المعاصرة', value: 'المعاصرة' },
    { label: 'التاريخية', value: 'التاريخية' }, { label: 'الرعب', value: 'الرعب' },
    { label: 'المغامرة', value: 'المغامرة' }, { label: 'الشباب', value: 'الشباب' },
    { label: 'الأطفال', value: 'الأطفال' }, { label: 'الجريمة', value: 'الجريمة' },
    { label: 'الدراما', value: 'الدراما' }, { label: 'الخوارق', value: 'الخوارق' },
    { label: 'الكوميديا', value: 'الكوميديا' }, { label: 'الحرب', value: 'الحرب' },
    { label: 'الأساطير', value: 'الأساطير' }, { label: 'السيرة الذاتية', value: 'السيرة الذاتية' }
];

const statusOptions = [
    { label: 'متوقفة', value: 'متوقفة' },
    { label: 'مستمرة', value: 'مستمرة' },
    { label: 'مكتملة', value: 'مكتملة' }
];

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: currentYear - 1599 }, (_, i) => ({
    label: (1600 + i).toString(),
    value: 1600 + i,
}));

const customSelectStyles = {
    control: (base: any) => ({
        ...base,
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '1rem',
        padding: '0.2rem',
        color: 'white',
        boxShadow: 'none',
        '&:hover': {
            border: '1px solid rgba(93, 163, 151, 0.5)',
        }
    }),
    menu: (base: any) => ({
        ...base,
        background: '#1a1a1a',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '1rem',
        overflow: 'hidden'
    }),
    option: (base: any, state: any) => ({
        ...base,
        background: state.isSelected ? '#5da397' : state.isFocused ? 'rgba(93, 163, 151, 0.1)' : 'transparent',
        color: state.isSelected ? 'white' : '#ccc',
        cursor: 'pointer'
    }),
    singleValue: (base: any) => ({ ...base, color: 'white' }),
    multiValue: (base: any) => ({
        ...base,
        background: 'rgba(93, 163, 151, 0.2)',
        borderRadius: '0.5rem',
    }),
    multiValueLabel: (base: any) => ({ ...base, color: '#5da397', fontWeight: 'bold' }),
};

const EditNovel: React.FC = () => {
    const { novelId } = useParams<{ novelId: string }>();
    const navigate = useNavigate();
    const [novelData, setNovelData] = useState<Novel | undefined>();
    console.log(novelData); // Temporary log to suppress unused variable warning if still needed or just remove it if really not needed
    const [customId, setCustomId] = useState('');
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [publisher, setPublisher] = useState('');
    const [translators, setTranslators] = useState<{ label: string; value: string }[]>([]);
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('مستمرة');
    const [genres, setGenres] = useState<{ label: string; value: string }[]>([]);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [rating, setRating] = useState<number>(0);
    const [numberOfReaders, setNumberOfReaders] = useState<number>(0);
    const [numberOfAllChapters, setnumberOfAllChapters] = useState<number>(0);
    const [originalLanguage, setOriginalLanguage] = useState('');
    const [dateOfPublication, setDateOfPublication] = useState<{ label: string; value: number } | null>(null);
    const [englishName, setEnglishName] = useState('');
    const [currentImage, setCurrentImage] = useState<string | null>(null);

    const { sendData, isLoading, errorMessage } = useHttp();
    const toast = useContext(ToastContext);

    useEffect(() => {
        const fetchNovelData = async () => {
            try {
                sendData<Novel>(
                    `/novels/${novelId}`,
                    { method: "GET" },
                    (novel) => {
                        if (novel) {
                            setNovelData(novel);
                            setCustomId(novel.customId || '');
                            setTitle(novel.title);
                            setAuthor(novel.author);
                            setPublisher(novel.publisher || '');
                            setTranslators(novel.translators?.map((t: string) => ({ label: t, value: t })) || []);
                            setDescription(novel.description || '');
                            setStatus(novel.status || "مستمرة");
                            setGenres(novel.genres?.map((g: string) => ({ label: g, value: g })) || []);
                            setRating(novel.rating || 0);
                            setNumberOfReaders(novel.numberOfReaders || 0);
                            setnumberOfAllChapters(novel.numberOfAllChapters || 0);
                            setOriginalLanguage(novel.originalLanguage);
                            setDateOfPublication({ label: novel.dateOfPublication.toString(), value: novel.dateOfPublication });
                            setEnglishName(novel.englishName || '');
                            setCurrentImage(novel.image || null);
                        }
                    }
                )
            } catch (error) {
                console.error('Error:', error);
            }
        };
        fetchNovelData();
    }, [novelId, sendData]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('customId', customId);
        formData.append('title', title);
        formData.append('author', author);
        formData.append('publisher', publisher);
        formData.append('translators', JSON.stringify(translators.map((translator) => translator.value)));
        formData.append('description', description);
        formData.append('status', status);
        formData.append('genres', JSON.stringify(genres.map((genre) => genre.value)));
        formData.append('rating', rating.toString());
        formData.append('numberOfReaders', numberOfReaders.toString());
        formData.append('numberOfAllChapters', numberOfAllChapters.toString());
        formData.append('originalLanguage', originalLanguage);
        formData.append('dateOfPublication', dateOfPublication ? dateOfPublication.value.toString() : '');
        formData.append('englishName', englishName);
        if (image) formData.append('image', image);

        try {
            await sendData<Novel>(
                `/novels/${novelId}`,
                { method: "PUT", body: formData },
                () => {
                    toast?.addToast('نجاح', 'success', 'تم تحديث الرواية بنجاح');
                    navigate(`/novel/${novelId}`);
                },
                undefined,
                true
            )
        } catch (error) {
            toast?.addToast('خطأ', 'error', 'حدث خطأ أثناء تحديث الرواية');
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;
    if (errorMessage) return <div className="min-h-screen flex items-center justify-center text-rose-500 font-bold">{errorMessage}</div>;

    return (
        <div dir="rtl" className="min-h-screen pb-20 px-4 pt-10 font-NotoKufi bg-[#0f0f0f] text-zinc-300">
            <div className="max-w-6xl mx-auto space-y-10">

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-primary font-bold">
                            <Feather className="w-5 h-5" />
                            <span className="text-sm tracking-widest uppercase">تحديث الرواية</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-white font-elmessiri">{title}</h1>
                    </div>
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-6 py-3 glass rounded-2xl hover:bg-white/5 transition-all w-fit font-bold">
                        <ArrowRight className="w-5 h-5" /> رجوع
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar: Cover & Quick Actions */}
                    <div className="space-y-8">
                        <GlassCard className="p-6 text-center space-y-6">
                            <h3 className="text-lg font-bold flex items-center justify-center gap-2 text-white">
                                <ImageIcon className="w-5 h-5 text-primary" /> غلاف الرواية
                            </h3>

                            <div className="relative group mx-auto w-full aspect-[2/3] rounded-3xl overflow-hidden border-2 border-white/5 bg-white/5 hover:border-primary/50 transition-all duration-500 shadow-2xl">
                                <img
                                    src={imagePreview || (currentImage ? `${urlimage}/${currentImage}` : '')}
                                    alt="Cover Preview"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                                    <PlusCircle className="w-12 h-12 text-white mb-2" />
                                    <span className="text-xs text-white font-black uppercase tracking-tighter">تغيير الغلاف</span>
                                    <input type="file" onChange={handleFileChange} className="hidden" />
                                </label>
                            </div>

                            <div className="pt-4 space-y-4">
                                <div className="text-[10px] uppercase font-black text-zinc-600 tracking-widest text-center">التقييم</div>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star} type="button"
                                            onClick={() => setRating(star)}
                                            className={cn(
                                                "flex-1 py-3 rounded-xl border transition-all",
                                                rating >= star ? "bg-yellow-500/10 border-yellow-500/50 text-yellow-500" : "bg-white/5 border-white/5 text-zinc-600"
                                            )}
                                        >
                                            <Star className={cn("w-4 h-4 mx-auto", rating >= star && "fill-current")} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </GlassCard>

                        <button type="submit" className="w-full bg-primary text-white font-black py-5 rounded-3xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                            <Save className="w-6 h-6" /> حفظ التعديلات
                        </button>
                    </div>

                    {/* Main Content: Info Form */}
                    <div className="lg:col-span-2 space-y-8">
                        <GlassCard className="p-8 space-y-10">
                            {/* Section 1: Basic Info */}
                            <section className="space-y-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-3 border-r-4 border-primary pr-4">
                                    المعلومات الأساسية
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs text-zinc-500 font-bold uppercase tracking-widest px-2">عنوان الرواية</label>
                                        <input
                                            type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all text-white font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-zinc-500 font-bold uppercase tracking-widest px-2">العنوان بالإنجليزية</label>
                                        <input
                                            type="text" value={englishName} onChange={(e) => setEnglishName(e.target.value)} required
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all text-white font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-zinc-500 font-bold uppercase tracking-widest px-2">الكاتب</label>
                                        <input
                                            type="text" value={author} onChange={(e) => setAuthor(e.target.value)} required
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all text-white font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-zinc-500 font-bold uppercase tracking-widest px-2">اللغة الأصلية</label>
                                        <input
                                            type="text" value={originalLanguage} onChange={(e) => setOriginalLanguage(e.target.value)} required
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all text-white font-bold"
                                        />
                                    </div>
                                </div>
                            </section>

                            <div className="h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />

                            {/* Section 2: Details */}
                            <section className="space-y-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-3 border-r-4 border-primary pr-4">
                                    تفاصيل إضافية
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs text-zinc-500 font-bold uppercase tracking-widest px-2">سنة النشر</label>
                                        <Select
                                            styles={customSelectStyles} options={yearOptions} value={dateOfPublication}
                                            onChange={(s) => setDateOfPublication(s as any)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-zinc-500 font-bold uppercase tracking-widest px-2">الحالة</label>
                                        <Select
                                            styles={customSelectStyles} options={statusOptions}
                                            value={statusOptions.find(o => o.value === status)}
                                            onChange={(s) => setStatus(s?.value || '')}
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs text-zinc-500 font-bold uppercase tracking-widest px-2">التصنيفات</label>
                                        <Select
                                            isMulti styles={customSelectStyles} options={genreOptions} value={genres}
                                            onChange={(s) => setGenres(s as any)}
                                        />
                                    </div>
                                </div>
                            </section>

                            <div className="h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />

                            {/* Section 3: Description */}
                            <section className="space-y-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-3 border-r-4 border-primary pr-4">
                                    قصة الرواية
                                </h3>
                                <textarea
                                    value={description} onChange={(e) => setDescription(e.target.value)}
                                    rows={8}
                                    className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 focus:ring-2 focus:ring-primary/50 outline-none transition-all text-zinc-200 leading-relaxed resize-none"
                                    placeholder="اكتب وصفاً جذاباً للرواية..."
                                />
                            </section>
                        </GlassCard>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditNovel;
