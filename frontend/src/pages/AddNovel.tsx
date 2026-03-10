import React, { useContext, useState, useMemo } from 'react';
import Select from 'react-select';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Image as ImageIcon,
    Book,
    Feather,
    Globe,
    Tags,
    Calendar,
    Star,
    Layers,
    Type,
    Save,
    PlusCircle,
    ArrowRight,
    CheckCircle2
} from 'lucide-react';
import useHttp from '../hooks/usehttp';
import { Novel } from '../utils/types';
import Loader from '../components/Loader';
import { ToastContext } from '../components/message/ToastManager';
import { GlassCard } from '../components/ui/GlassCard';
import { cn } from '../utils/cn';

const genreOptions = [
    { label: 'الفانتازيا', value: 'الفانتازيا' }, { label: 'الخيال العلمي', value: 'الخيال العلمي' },
    { label: 'الغموض', value: 'الغموض' }, { label: 'الإثارة', value: 'الإثارة' },
    { label: 'الرومانسية', value: 'الرومانسية' }, { label: 'الغرب الأمريكي', value: 'الغرب الأمريكي' },
    { label: 'ديستوبيا', value: 'ديستوبيا' }, { label: 'المعاصرة', value: 'المعاصرة' },
    { label: 'التاريخية', value: 'التاريخية' }, { label: 'الرعب', value: 'الرعب' },
    { label: 'المغامرة', value: 'المغامرة' }, { label: 'الشباب', value: 'الشباب' },
    { label: 'الجريمة', value: 'الجريمة' }, { label: 'الدراما', value: 'الدراما' },
    { label: 'الخوارق', value: 'الخوارق' }, { label: 'الكوميديا', value: 'الكوميديا' }
];

const statusOptions = [
    { label: 'متوقفة', value: 'متوقفة' },
    { label: 'مستمرة', value: 'مستمرة' },
    { label: 'مكتملة', value: 'مكتملة' }
];

const AddNovel: React.FC = () => {
    const [step, setStep] = useState(1);
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('مستمرة');
    const [genres, setGenres] = useState<{ label: string; value: string }[]>([]);
    const [image, setImage] = useState<File | null>(null);
    const [originalLanguage, setOriginalLanguage] = useState('');
    const [dateOfPublication, setDateOfPublication] = useState<{ label: string; value: number } | null>(null);
    const [englishName, setEnglishName] = useState('');
    const [rating, setRating] = useState<number>(0);

    const toastContext = useContext(ToastContext);
    const { sendData, isLoading, errorMessage } = useHttp();

    const currentYear = new Date().getFullYear();
    const yearOptions = useMemo(() => Array.from({ length: currentYear - 1599 }, (_, i) => ({
        label: (currentYear - i).toString(),
        value: currentYear - i,
    })), [currentYear]);

    const selectStyles = {
        control: (base: any, state: any) => ({
            ...base,
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderColor: state.isFocused ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.1)',
            borderRadius: '1rem',
            padding: '4px',
            color: 'white',
            boxShadow: 'none',
            '&:hover': { borderColor: 'rgba(255, 255, 255, 0.2)' }
        }),
        menu: (base: any) => ({
            ...base,
            backgroundColor: '#1a1a1a',
            borderRadius: '1rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden'
        }),
        option: (base: any, state: any) => ({
            ...base,
            backgroundColor: state.isFocused ? 'var(--color-primary-10)' : 'transparent',
            color: 'white',
            '&:active': { backgroundColor: 'var(--color-primary)' }
        }),
        multiValue: (base: any) => ({
            ...base,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '0.5rem',
        }),
        multiValueLabel: (base: any) => ({ ...base, color: 'white' }),
        singleValue: (base: any) => ({ ...base, color: 'white' }),
        placeholder: (base: any) => ({ ...base, color: 'rgba(255, 255, 255, 0.3)' })
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setImage(e.target.files[0]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('author', author);
        formData.append('description', description);
        formData.append('status', status);
        formData.append('genres', JSON.stringify(genres.map(g => g.value)));
        formData.append('rating', rating.toString());
        formData.append('originalLanguage', originalLanguage);
        formData.append('dateOfPublication', dateOfPublication ? dateOfPublication.value.toString() : '');
        formData.append('englishName', englishName);
        if (image) formData.append('image', image);

        try {
            await sendData<Novel>('/novels', { method: 'POST', body: formData }, (data) => {
                toastContext?.addToast('نجاح', 'success', 'تم إنشاء الرواية بنجاح');
                if (data?._id) {
                    window.location.href = `/novel/${data._id}`;
                }
            }, undefined, true);
        } catch (error) {
            toastContext?.addToast('خطأ', 'error', 'فشل في إنشاء الرواية');
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;
    if (errorMessage) return <div className="p-20 text-center text-rose-500 font-bold">{errorMessage}</div>;

    return (
        <div className="min-h-screen py-10 px-6 max-w-7xl mx-auto" dir="rtl">
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase">
                            <PlusCircle className="w-4 h-4" />
                            إنشاء محتوى جديد
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black font-elmessiri leading-tight">
                            أضف <span className="text-primary">رواية</span> جديدة للمنصة
                        </h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Stepper Navigation */}
                    <div className="lg:col-span-3 space-y-4">
                        {[
                            { id: 1, title: 'المعلومات الأساسية', icon: Book },
                            { id: 2, title: 'التصنيف واللغة', icon: Tags },
                            { id: 3, title: 'الغلاف والوصف', icon: ImageIcon }
                        ].map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setStep(s.id)}
                                className={cn(
                                    "w-full flex items-center gap-4 p-5 rounded-2xl border transition-all text-right",
                                    step === s.id
                                        ? "bg-primary/10 border-primary text-primary shadow-lg shadow-primary/5"
                                        : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
                                )}
                            >
                                <div className={cn(
                                    "p-2 rounded-xl",
                                    step === s.id ? "bg-primary text-white" : "bg-white/5"
                                )}>
                                    <s.icon className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-sm">{s.title}</span>
                                {step > s.id && <CheckCircle2 className="w-4 h-4 mr-auto text-emerald-500" />}
                            </button>
                        ))}
                    </div>

                    {/* Form Content */}
                    <div className="lg:col-span-9">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-6"
                                    >
                                        <GlassCard className="p-8 space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                                        <Type className="w-4 h-4 text-primary" /> العنوان العربي
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={title}
                                                        onChange={(e) => setTitle(e.target.value)}
                                                        className="w-full glass bg-white/5 border-white/10 rounded-2xl py-4 px-6 focus:border-primary transition-all font-bold"
                                                        placeholder="ادخل عنوان الرواية..."
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                                        <Globe className="w-4 h-4 text-primary" /> العنوان الإنجليزي
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={englishName}
                                                        onChange={(e) => setEnglishName(e.target.value)}
                                                        className="w-full glass bg-white/5 border-white/10 rounded-2xl py-4 px-6 focus:border-primary transition-all font-sans"
                                                        placeholder="Novel Title in English..."
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                                        <Feather className="w-4 h-4 text-primary" /> الكاتب الأصلي
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={author}
                                                        onChange={(e) => setAuthor(e.target.value)}
                                                        className="w-full glass bg-white/5 border-white/10 rounded-2xl py-4 px-6 focus:border-primary transition-all"
                                                        placeholder="اسم المؤلف..."
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                                        <Layers className="w-4 h-4 text-primary" /> حالة الرواية
                                                    </label>
                                                    <Select
                                                        styles={selectStyles}
                                                        options={statusOptions}
                                                        value={statusOptions.find(o => o.value === status)}
                                                        onChange={(s) => setStatus(s?.value || 'مستمرة')}
                                                    />
                                                </div>
                                            </div>
                                        </GlassCard>
                                        <div className="flex justify-end">
                                            <button type="button" onClick={() => setStep(2)} className="flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                                                <span>التالي: التصنيف واللغة</span>
                                                <ArrowRight className="w-5 h-5 rotate-180" />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-6"
                                    >
                                        <GlassCard className="p-8 space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                                    <Tags className="w-4 h-4 text-primary" /> تصنيفات الرواية
                                                </label>
                                                <Select
                                                    isMulti
                                                    styles={selectStyles}
                                                    options={genreOptions}
                                                    value={genres}
                                                    onChange={(s) => setGenres(s as any)}
                                                    placeholder="اختر التصنيفات..."
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                                        <Globe className="w-4 h-4 text-primary" /> اللغة الأصلية
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={originalLanguage}
                                                        onChange={(e) => setOriginalLanguage(e.target.value)}
                                                        className="w-full glass bg-white/5 border-white/10 rounded-2xl py-4 px-6 focus:border-primary transition-all"
                                                        placeholder="الصينية، الكورية، الإنجليزية..."
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-primary" /> سنة الإصدار
                                                    </label>
                                                    <Select
                                                        styles={selectStyles}
                                                        options={yearOptions}
                                                        value={dateOfPublication}
                                                        onChange={(s) => setDateOfPublication(s)}
                                                        placeholder="اختر السنة..."
                                                    />
                                                </div>
                                            </div>
                                        </GlassCard>
                                        <div className="flex justify-between">
                                            <button type="button" onClick={() => setStep(1)} className="glass px-8 py-4 rounded-2xl font-bold opacity-50 hover:opacity-100 transition-all">السابق</button>
                                            <button type="button" onClick={() => setStep(3)} className="flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                                                <span>التالي: الغلاف والوصف</span>
                                                <ArrowRight className="w-5 h-5 rotate-180" />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-6"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            <div className="md:col-span-1">
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-4">
                                                    <ImageIcon className="w-4 h-4 text-primary" /> غلاف الرواية
                                                </label>
                                                <div className="relative aspect-[1/1.5] group perspective-1000">
                                                    <input type="file" id="image" onChange={handleFileChange} className="hidden" />
                                                    <label htmlFor="image" className="absolute inset-0 cursor-pointer overflow-hidden rounded-[2.5rem] border-4 border-dashed border-white/10 hover:border-primary/50 transition-all flex flex-col items-center justify-center gap-4 bg-white/5 group-hover:bg-primary/5">
                                                        {image ? (
                                                            <img src={URL.createObjectURL(image)} className="w-full h-full object-cover rounded-3xl" alt="Preview" />
                                                        ) : (
                                                            <div className="text-center p-8 space-y-4">
                                                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                                                    <PlusCircle className="w-8 h-8 text-muted-foreground" />
                                                                </div>
                                                                <p className="text-xs font-bold text-muted-foreground tracking-tight">اضغط لرفع صورة الغلاف</p>
                                                            </div>
                                                        )}
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="md:col-span-2 space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                                        <Feather className="w-4 h-4 text-primary" /> وصف القصة
                                                    </label>
                                                    <textarea
                                                        value={description}
                                                        onChange={(e) => setDescription(e.target.value)}
                                                        className="w-full glass bg-white/5 border-white/10 rounded-3xl p-6 min-h-[300px] text-lg leading-relaxed focus:border-primary transition-all"
                                                        placeholder="اكتب ملخصاً مشوقاً للرواية هنا..."
                                                    ></textarea>
                                                </div>

                                                <div className="space-y-4">
                                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                                        <Star className="w-4 h-4 text-yellow-400" /> تقييم افتراضي
                                                    </label>
                                                    <div className="flex gap-2">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <button
                                                                key={star}
                                                                type="button"
                                                                onClick={() => setRating(star)}
                                                                className={cn(
                                                                    "w-10 h-10 rounded-xl glass flex items-center justify-center transition-all",
                                                                    rating >= star ? "text-yellow-400 bg-yellow-400/10 shadow-lg" : "text-muted-foreground"
                                                                )}
                                                            >
                                                                <Star className={cn("w-5 h-5", rating >= star && "fill-current")} />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between pt-8">
                                            <button type="button" onClick={() => setStep(2)} className="glass px-8 py-4 rounded-2xl font-bold opacity-50 hover:opacity-100 transition-all">السابق</button>
                                            <button type="submit" className="flex items-center gap-3 bg-emerald-600 text-white px-12 py-4 rounded-2xl font-black shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all">
                                                <Save className="w-5 h-5" />
                                                نشر الرواية النهائية
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddNovel;

