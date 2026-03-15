import { Link } from "react-router-dom";
import "./style.css"
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Novel } from "../../utils/types";
import { getImageUrl } from "../../utils/constvar";

const Cart3 = ({ novel }: { novel: Novel }) => {
    return (
        <div className="cart flex gap-[15px] premium-card px-2.5 py-[5px]">
            <div className="image w-[60%] s:w-[45%] sm:w-[60%] depth-3d">
                <img className='w-full rounded-[5px] aspect-[1/1.5] object-cover 2xl:aspect-[1/1.3]' src={getImageUrl(novel.image)} alt="" loading="lazy" />
            </div>
            <Link to={`/novel/${novel._id}`} className="Info text-[color:var(--color-text)] text-sm flex flex-col justify-center gap-2.5 w-full ">
                <div className="title font-bold text-foreground group-hover:text-primary transition-colors" title={novel.title}>
                    {novel.title}
                </div>
                <div className="chapters flex flex-col gap-2.5">
                    {novel.chapter_info?.lastThreeChapters.map((chapter) => (
                        <div key={chapter.chapterId} className="chapter-info text-[13px] flex justify-between items-center group/chapter">
                            <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold">فصل {chapter.chapterNumber}</span>
                            <div className="time text-muted-foreground text-[10px]">
                                {formatDistanceToNow(new Date(chapter.createdAt), { addSuffix: true, locale: ar })}
                            </div>
                        </div>
                    ))}
                </div>
            </Link>
        </div>
    );
}

export default Cart3;
