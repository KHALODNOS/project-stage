import { Link } from "react-router-dom";
import "./style.css"
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Novel } from "../../utils/types";
import { getImageUrl } from "../../utils/constvar";

const Cart3 = ({ novel }: { novel: Novel }) => {
    return (
        <div className="cart flex gap-[15px] bg-[#879bb024] px-2.5 py-[5px] rounded-[5px]">
            <div className="image w-[60%] s:w-[45%] sm:w-[60%]">
                <img className='w-full rounded-[5px] aspect-[1/1.5] object-cover 2xl:aspect-[1/1.3]' src={getImageUrl(novel.image)} alt="" loading="lazy" />
            </div>
            <Link to={`/novel/${novel._id}`} className="Info   text-[color:var(--color-text)] text-sm flex flex-col justify-center text-white gap-2.5 w-full ">
                <Link to={`/novel/${novel._id}`} className="title font-medium text-[var(--color-text)]" title={novel.title}>
                    {novel.title ? (() => {
                        if (novel.title.length > 20) {
                            const lastSpaceIndex = novel.title.substring(0, 20).lastIndexOf(' ')
                            return novel.title.substring(0, lastSpaceIndex) + '...';
                        }
                        else {
                            return novel.title
                        }
                    })() : "N/A"}
                </Link>
                <div className="chapters flex flex-col gap-2.5">
                    {novel.chapter_info?.lastThreeChapters.map((chapter) => (
                        <div className="chapter-info text-[13px] flex justify-between">
                            <Link to={`/novel/${novel._id}/${chapter.chapterId}`} className="chapter tag">{chapter.chapterNumber}</Link>
                            <div className="time text-[#888]">
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
