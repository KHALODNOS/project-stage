import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import useHttp from "../../hooks/usehttp";
import { Novel } from "../../utils/types";
import { getImageUrl } from "../../utils/constvar";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, TrendingUp, BookOpen } from "lucide-react";
import Loader from "../Loader";

const HeroCarousel = () => {
    const { sendData, isLoading } = useHttp();
    const [novels, setNovels] = useState<Novel[]>([]);

    useEffect(() => {
        sendData<Novel[]>(
            '/getnovels/popular/weekly',
            { method: 'GET' },
            (data) => {
                if (data) setNovels(data.slice(0, 10));
            }
        );
    }, [sendData]);

    if (isLoading) return <div className="h-[400px] flex items-center justify-center"><Loader smaller /></div>;

    return (
        <section className="py-10 perspective-1000 overflow-hidden">
            <div className="flex items-center gap-3 mb-8 px-6" dir="rtl">
                <TrendingUp className="text-primary w-6 h-6 animate-pulse" />
                <h2 className="text-2xl font-bold font-elmessiri">الروايات الأكثر رواجاً</h2>
            </div>

            <Swiper
                effect={"coverflow"}
                grabCursor={true}
                centeredSlides={true}
                slidesPerView={"auto"}
                coverflowEffect={{
                    rotate: 30,
                    stretch: 0,
                    depth: 200,
                    modifier: 1,
                    slideShadows: true,
                }}
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                }}
                pagination={{ clickable: true }}
                modules={[EffectCoverflow, Pagination, Autoplay]}
                className="w-full py-12"
            >
                {novels.map((novel) => (
                    <SwiperSlide key={novel._id} className="w-[280px] sm:w-[320px]">
                        <Link to={`/novel/${novel._id}`} className="block group">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="relative aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl preserve-3d"
                            >
                                <img
                                    src={getImageUrl(novel.image)}
                                    alt={novel.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />

                                {/* Overlay details */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-end gap-3 translate-z-20">
                                    <h3 className="text-lg font-bold text-white leading-tight" dir="rtl">
                                        {novel.title}
                                    </h3>
                                    <div className="flex items-center gap-4 text-xs text-white/80" dir="rtl">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                            <span>{novel.rating || "4.5"}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <BookOpen className="w-3 h-3 text-primary" />
                                            <span>{novel.totalChapters || 0} فصل</span>
                                        </div>
                                    </div>
                                    <button className="mt-2 glass py-2 rounded-xl text-white text-sm font-bold hover:bg-primary transition-colors">
                                        اقرأ الآن
                                    </button>
                                </div>

                                {/* Spine Effect */}
                                <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
                            </motion.div>
                        </Link>
                    </SwiperSlide>
                ))}
            </Swiper>

            <style>{`
        .swiper-pagination-bullet {
          @apply bg-primary/20 transition-all duration-300;
        }
        .swiper-pagination-bullet-active {
          @apply bg-primary w-6 rounded-full;
        }
      `}</style>
        </section>
    );
};

export default HeroCarousel;
