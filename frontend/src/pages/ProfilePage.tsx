import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User as UserIcon,
    Mail,
    Calendar,
    Shield,
    Heart,
    History,
    Layout,
    PlusSquare,
    BarChart3,
    TrendingUp,
    Book
} from 'lucide-react';
import useHttp from '../hooks/usehttp';
import { Userprofile } from '../utils/types';
import Loader from '../components/Loader';
import { cn } from '../utils/cn';
import { GlassCard } from '../components/ui/GlassCard';
import { BentoGrid, BentoGridItem } from '../components/ui/BentoGrid';

const ProfilePage: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const { sendData, isLoading, errorMessage } = useHttp();
    const [userData, setUserData] = useState<Userprofile | null>(null);

    useEffect(() => {
        if (username) {
            sendData<Userprofile>(
                `/users/profile/${username}`,
                { method: 'GET' },
                (data) => setUserData(data as Userprofile)
            );
        }
    }, [username, sendData]);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;
    if (errorMessage) return <div className="min-h-screen flex items-center justify-center text-destructive">{errorMessage}</div>;
    if (!userData) return <div className="min-h-screen flex items-center justify-center">لم يتم العثور على بيانات المستخدم</div>;

    const isAdmin = userData.role === 'admin';
    const isContributor = isAdmin || userData.role === 'translator';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-background pb-20 pt-10 px-6"
            dir="rtl"
        >
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header / Command Center Title */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 overflow-hidden">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary font-mono text-sm tracking-widest">
                            <Shield className="w-4 h-4" />
                            <span>SYSTEM_ACCESS: {userData.role.toUpperCase()}</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold font-elmessiri bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">
                            {isAdmin ? 'مركز التحكم' : 'ملفي الشخصي'}
                        </h1>
                    </div>
                </div>

                <BentoGrid className="md:auto-rows-[25rem]">
                    {/* User Profile Card */}
                    <BentoGridItem
                        className="md:col-span-1 row-span-2 glass border-white/10"
                        header={
                            <div className="flex flex-col items-center gap-6 pt-6">
                                <motion.div
                                    whileHover={{ rotateY: 180 }}
                                    transition={{ duration: 0.6 }}
                                    className="relative w-40 h-52 preserve-3d"
                                >
                                    <img
                                        className="h-full w-full object-cover rounded-32 shadow-2xl backface-hidden"
                                        src={`${userData.image}`}
                                        alt={userData.username}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-primary rounded-32 rotate-y-180 backface-hidden shadow-Inner">
                                        <UserIcon className="w-16 h-16 text-white" />
                                    </div>
                                </motion.div>
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-bold">{userData.nickname}</h2>
                                    <p className="text-muted-foreground font-mono">@{userData.username}</p>
                                    <span className={cn(
                                        "px-4 py-1 rounded-full text-xs font-bold uppercase tracking-tighter",
                                        isAdmin ? "bg-yellow-500/20 text-yellow-500" : "bg-primary/20 text-primary"
                                    )}>
                                        {userData.role}
                                    </span>
                                </div>
                            </div>
                        }
                        description={
                            <div className="space-y-4 pt-6">
                                <div className="flex items-center gap-3 p-3 glass rounded-2xl">
                                    <Mail className="w-4 h-4 text-primary" />
                                    <span className="text-sm truncate">{userData.email}</span>
                                </div>
                                {userData.birthday && (
                                    <div className="flex items-center gap-3 p-3 glass rounded-2xl">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        <span className="text-sm">{new Date(userData.birthday).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        }
                    />

                    {/* Stats & Activity (Only for high engagement users/admins) */}
                    <BentoGridItem
                        className="md:col-span-2 glass border-white/10"
                        title="إحصائيات النظام"
                        icon={<BarChart3 className="w-5 h-5 text-primary" />}
                        header={
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 h-full">
                                <GlassCard className="flex flex-col items-center justify-center gap-2 bg-primary/5 hover:bg-primary/10 border-transparent">
                                    <TrendingUp className="w-8 h-8 text-primary" />
                                    <span className="text-3xl font-bold">{isContributor ? userData.ChaptersCreated.length : userData.favorite.length}</span>
                                    <span className="text-xs text-muted-foreground">{isContributor ? 'فصل منشأ' : 'رواية مفضلة'}</span>
                                </GlassCard>
                                <GlassCard className="flex flex-col items-center justify-center gap-2 bg-violet-500/5 hover:bg-violet-500/10 border-transparent">
                                    <History className="w-8 h-8 text-violet-500" />
                                    <span className="text-3xl font-bold">{userData.Lastview.length}</span>
                                    <span className="text-xs text-muted-foreground">فصل مقروء أخيراً</span>
                                </GlassCard>
                                <GlassCard className="hidden md:flex flex-col items-center justify-center gap-2 bg-emerald-500/5 hover:bg-emerald-500/10 border-transparent">
                                    <Layout className="w-8 h-8 text-emerald-500" />
                                    <span className="text-3xl font-bold">{isContributor ? userData.NovelsCreated.length : '12'}</span>
                                    <span className="text-xs text-muted-foreground">{isContributor ? 'رواية منشأة' : 'مستوى القراءة'}</span>
                                </GlassCard>
                            </div>
                        }
                    />

                    {/* Favorite Novels (Full Width) */}
                    <BentoGridItem
                        className="md:col-span-2 glass border-white/10 overflow-hidden"
                        title="المكتبة المفضلة"
                        icon={<Heart className="w-5 h-5 text-rose-500" />}
                        header={
                            <div className="flex gap-4 overflow-x-auto pb-4 pt-2 -mx-2 px-2 scrollbar-none">
                                {userData.favorite.map((novel) => (
                                    <Link
                                        to={`/novel/${novel._id}`}
                                        key={novel._id}
                                        className="relative group min-w-[120px] max-w-[120px]"
                                    >
                                        <motion.img
                                            whileHover={{ scale: 1.05, y: -5 }}
                                            src={`${novel.image || 'placeholder.svg'}`}
                                            className="w-full aspect-[3/4] object-cover rounded-2xl shadow-xl transition-all"
                                            alt={novel.title}
                                        />
                                        <div className="mt-2 text-[10px] font-bold text-center line-clamp-1 group-hover:text-primary">{novel.title}</div>
                                    </Link>
                                ))}
                                {userData.favorite.length === 0 && (
                                    <div className="w-full flex items-center justify-center text-muted-foreground h-32">
                                        لا توجد روايات مفضلة حالياً
                                    </div>
                                )}
                            </div>
                        }
                    />
                </BentoGrid>

                {/* Management Sections for Admin/Contributors */}
                <AnimatePresence>
                    {isContributor && (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <h3 className="text-2xl font-bold font-elmessiri flex items-center gap-2">
                                    <PlusSquare className="text-primary" />
                                    إدارة المحتوى المنشور
                                </h3>
                                {isAdmin && (
                                    <Link to="/addnovel" className="flex items-center gap-2 glass px-6 py-2 rounded-xl bg-primary text-white hover:shadow-primary/20 shadow-xl transition-all font-bold">
                                        <PlusSquare className="w-4 h-4" />
                                        <span>إنشاء رواية جديدة</span>
                                    </Link>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {userData.NovelsCreated.map((novel) => (
                                    <GlassCard key={novel._id} className="flex items-center gap-4 hover:border-primary/50 transition-all group">
                                        <img src={novel.image} className="w-16 h-20 rounded-xl object-cover shadow-lg" alt={novel.title} />
                                        <div className="space-y-1 flex-grow">
                                            <h4 className="font-bold group-hover:text-primary transition-colors line-clamp-1">{novel.title}</h4>
                                            <p className="text-xs text-muted-foreground">تاريخ الإنشاء: {novel.createdAt ? new Date(novel.createdAt).toLocaleDateString() : 'غير معروف'}</p>
                                            <div className="flex gap-2">
                                                <Link to={`/updatenovel/${novel._id}`} className="text-[10px] text-primary hover:underline">تعديل</Link>
                                                <Link to={`/novel/${novel._id}/addchapter`} className="text-[10px] text-emerald-500 hover:underline">إضافة فصل</Link>
                                            </div>
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>

                {/* Reading History */}
                <section className="space-y-8">
                    <h3 className="text-2xl font-bold font-elmessiri flex items-center gap-2 border-b border-white/10 pb-4">
                        <History className="text-violet-500" />
                        سجل القراءة الأخير
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {userData.Lastview.map((view, index) => (
                            <Link to={`/novel/${view.novel._id}`} key={index}>
                                <GlassCard className="flex items-center gap-4 hover:bg-white/5 transition-colors border-white/5 h-24">
                                    <img src={view.novel.image} className="w-12 h-16 rounded-lg object-cover" alt="" />
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold truncate max-w-[150px]">{view.novel.title}</h4>
                                        <p className="text-xs text-primary flex items-center gap-1">
                                            <Book className="w-3 h-3" />
                                            الفصل {view.chapterNumber}
                                        </p>
                                    </div>
                                </GlassCard>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </motion.div>
    );
};

export default ProfilePage;