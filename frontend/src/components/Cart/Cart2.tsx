import { Link } from "react-router-dom";
import { Novel } from "../../utils/types";
import formatDate from "../../utils/formatDate";
import { getImageUrl } from "../../utils/constvar";
import { motion } from "framer-motion";
import { Book, Clock, ChevronRight } from "lucide-react";
import { cn } from "../../utils/cn";

const Cart2 = ({ novel }: { novel: Novel }) => {
    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="group relative"
        >
            <Link
                to={`/novel/${novel._id}`}
                className="flex gap-4 glass p-3 rounded-2xl items-center overflow-hidden border border-white/10 hover:border-primary/50 transition-all duration-300 shadow-xl"
            >
                <div className="relative w-24 h-32 flex-shrink-0 perspective-1000">
                    <motion.div
                        whileHover={{ rotateY: -15, rotateX: 5 }}
                        className="w-full h-full preserve-3d transition-transform duration-500"
                    >
                        <img
                            className="w-full h-full object-cover rounded-xl shadow-2xl"
                            src={getImageUrl(novel.image)}
                            alt={novel.title}
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl pointer-events-none" />
                    </motion.div>
                </div>

                <div className="flex flex-col gap-3 flex-grow text-right" dir="rtl">
                    <div className="space-y-1">
                        <h3 className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                            {novel.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[10px] text-foreground/50">
                            <Clock className="w-3 h-3" />
                            <span>{novel.createdAt ? formatDate(new Date(novel.createdAt)) : "غير متوفر"}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {novel.chapter_info?.lastThreeChapters.map((chapter) => (
                            <Link
                                key={chapter.chapterId}
                                to={`/novel/${novel._id}/${chapter.chapterId}`}
                                className="px-2 py-0.5 text-[10px] border border-white/5 bg-white/5 rounded-full hover:bg-primary hover:text-white transition-colors flex items-center gap-1"
                            >
                                <Book className="w-2.5 h-2.5" />
                                <span>فصل {chapter.chapterNumber}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-5 h-5 text-primary" />
                </div>
            </Link>
        </motion.div>
    );
}

export default Cart2;