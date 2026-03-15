import { TbStarFilled } from "react-icons/tb";
import { Rating } from 'react-simple-star-rating'
import useHttp from "../../hooks/usehttp";
import { Novel, User } from "../../utils/types";
import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getImageUrl } from "../../utils/constvar";
import ConfirmModal from '../Modal/ConfirmModal';
import { AuthContext } from "../../store/context";
import { ToastContext } from "../message/ToastManager";
import Loader from "../Loader";
import { motion } from "framer-motion";
import {
  Heart,
  Edit3,
  Trash2,
  Calendar,
  User as UserIcon,
  Globe,
  Tags,
  Share2,
  Play,
  PlusCircle
} from "lucide-react";
import { cn } from "../../utils/cn";
import { GlassCard } from "../ui/GlassCard";

const Info = () => {
  const toastContext = useContext(ToastContext);
  const { novelId } = useParams();
  const { sendData, isLoading, errorMessage } = useHttp();
  const [novel, setNovel] = useState<Novel | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const ctx = useContext(AuthContext)

  useEffect(() => {
    sendData<Novel>(
      `/novels/${novelId}`,
      { method: 'GET' },
      (data) => {
        setNovel(data);
        setIsFavorite(ctx?.user?.favorite.some(fav => fav === novelId) || false);
      }
    );
  }, [novelId, sendData, ctx?.user?.favorite]);

  useEffect(() => {
    if (ctx?.user) {
      sendData(`/novels/${novelId}/views`, { method: 'POST' }, () => { }, undefined, true);
    }
  }, [novelId, ctx?.user?.id, sendData]);

  const handleFavorite = async () => {
    if (!ctx?.user) {
      toastContext?.addToast('تنبيه', 'info', 'يرجى تسجيل الدخول أولاً');
      return;
    }
    try {
      await sendData<{ user: User }>(
        `/users/favorite/${novelId}`,
        { method: isFavorite ? 'DELETE' : 'POST' },
        (data) => {
          setIsFavorite(!isFavorite);
          if (ctx?.updateUser) ctx.updateUser(data?.user ?? {} as User);
        }, undefined, true
      );
      toastContext?.addToast(isFavorite ? 'تمت الإزالة' : 'تمت الإضافة', 'success');
    } catch (error) {
      toastContext?.addToast('خطأ', 'error');
    }
  };

  const handleDelete = async () => {
    setIsModalOpen(false);
    await sendData(`/novels/${novelId}`, { method: 'DELETE' }, undefined, "/", true);
    toastContext?.addToast('تم الحذف', 'success');
  };

  if (isLoading) return <div className="h-[60vh] flex items-center justify-center"><Loader /></div>;
  if (errorMessage) return <div className="p-20 text-center text-rose-500 font-bold">{errorMessage}</div>;

  return (
    <div className="relative min-h-[70vh] overflow-hidden" dir="rtl">
      {/* Immersive Background Blur */}
      {novel && (
        <div className="absolute inset-0 z-0">
          <img
            src={getImageUrl(novel.image)}
            className="w-full h-full object-cover scale-110 blur-3xl opacity-30 dark:opacity-20"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background to-background" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start">

          {/* 3D Book Cover */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-shrink-0 perspective-1000 group cursor-pointer"
          >
            <motion.div
              whileHover={{ rotateY: -25, rotateX: 5 }}
              className="relative w-64 h-96 sm:w-80 sm:h-[480px] preserve-3d transition-transform duration-700"
            >
              <img
                src={getImageUrl(novel?.image || '')}
                alt={novel?.title}
                className="w-full h-full object-cover rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] backface-hidden"
              />
              {/* Spine edge effect */}
              <div className="absolute top-0 right-0 bottom-0 w-8 bg-black/20 origin-right rotate-y-90 translate-x-1" />

              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
            </motion.div>
          </motion.div>

          {/* Info Details */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-grow space-y-8"
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="glass px-4 py-1.5 rounded-full text-xs font-bold text-primary uppercase tracking-widest">
                  {novel?.status || "مستمر"}
                </span>
                <div className="flex items-center">
                  {(ctx?.user?.role === "admin" || ctx?.user?.role === "translator") && (
                    <div className="flex items-center gap-2">
                      <Link to={`/novel/${novelId}/addchapter`} className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-emerald-500 hover:bg-emerald-500/10 transition-all font-bold text-sm">
                        <PlusCircle className="w-4 h-4" />
                        <span>إضافة فصل</span>
                      </Link>
                      <Link to={`/updatenovel/${novelId}`} className="p-2 glass rounded-xl text-primary hover:bg-primary/10 transition-colors">
                        <Edit3 className="w-5 h-5" />
                      </Link>
                      {ctx?.user?.role === "admin" && (
                        <button onClick={() => setIsModalOpen(true)} className="p-2 glass rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <h1 className="text-4xl md:text-6xl font-black font-elmessiri leading-tight">
                {novel?.title}
              </h1>
              <p className="text-xl text-muted-foreground font-medium font-sans italic opacity-70">
                {novel?.englishName}
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <GlassCard className="p-4 space-y-1">
                <div className="flex items-center gap-2 text-primary">
                  <UserIcon className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">المؤلف</span>
                </div>
                <p className="font-bold text-sm truncate">{novel?.author}</p>
              </GlassCard>
              <GlassCard className="p-4 space-y-1">
                <div className="flex items-center gap-2 text-sage-500">
                  <Globe className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">اللغة</span>
                </div>
                <p className="font-bold text-sm truncate">{novel?.originalLanguage}</p>
              </GlassCard>
              <GlassCard className="p-4 space-y-1">
                <div className="flex items-center gap-2 text-emerald-500">
                  <Tags className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">التصنيفات</span>
                </div>
                <p className="font-bold text-sm truncate">{novel?.genres?.slice(0, 2).join(', ')}</p>
              </GlassCard>
              <GlassCard className="p-4 space-y-1">
                <div className="flex items-center gap-2 text-orange-500">
                  <Calendar className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">الإصدار</span>
                </div>
                <p className="font-bold text-sm truncate">{novel?.dateOfPublication}</p>
              </GlassCard>
            </div>

            {/* Rating and Actions */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="glass px-6 py-2.5 rounded-2xl flex items-center gap-4">
                <Rating
                  className="mb-0"
                  fillIcon={<TbStarFilled size={22} className="text-yellow-400" />}
                  emptyIcon={<TbStarFilled size={22} className="opacity-20" />}
                  allowFraction
                  readonly
                  initialValue={novel?.rating || 0}
                />
                <span className="font-bold text-lg">{novel?.rating || "0.0"}</span>
              </div>

              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFavorite}
                  className={cn(
                    "flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold transition-all shadow-xl",
                    isFavorite ? "bg-rose-500 text-white shadow-rose-500/20" : "glass bg-primary text-white shadow-primary/20"
                  )}
                >
                  <Heart className={cn("w-5 h-5", isFavorite && "fill-current")} />
                  <span>{isFavorite ? 'في المفضلة' : 'أضف للمفضلة'}</span>
                </motion.button>

                <button className="p-4 glass rounded-2xl hover:bg-white/10 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Synopsis */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold font-elmessiri flex items-center gap-2">
                <Play className="w-5 h-5 text-primary fill-current" />
                قصة الرواية
              </h3>
              <p className="text-lg leading-relaxed text-muted-foreground font-light max-w-3xl border-r-2 border-primary/20 pr-6">
                {novel?.description}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        title="تأكيد الحذف النهائي"
        message={`هل أنت متأكد من رغبتك في حذف رواية "${novel?.title}"؟ لا يمكن التراجع عن هذا الإجراء.`}
      />
    </div>
  );
}

export default Info;

