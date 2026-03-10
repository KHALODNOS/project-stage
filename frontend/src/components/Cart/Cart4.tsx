import { Link } from 'react-router-dom';
import { TbStarFilled } from 'react-icons/tb';
import "./style.css"
import { Novel } from '../../utils/types';
import { getImageUrl } from "../../utils/constvar";

const Cart4 = ({ novel }: { novel: Novel }) => {
    return (
        <Link to={`/novel/${novel._id}`} className="cart cart4">
            <div className="image">
                <img className='w-full max-w-[130px] rounded-[5px] aspect-[1_/_1.4]' src={getImageUrl(novel.image)} alt="" loading="lazy" />
            </div>
            <div className="flex flex-col gap-1.5 w-full text-white mt-3">
                <Link to={`/novel/${novel._id}`} className="title text-sm font-medium text-[var(--color-text)]" title={novel.title}>
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
                {novel.chapter_info?.lastThreeChapters.length ? (
                    <Link to={`/novel/${novel._id}/${novel.chapter_info?.lastThreeChapters[0].chapterId}`} className="text-[var(--color-text2)]">{novel.chapter_info?.lastThreeChapters[0].chapterNumber}</Link>
                ) : ''}

                <div className="flex gap-[5px] text-[color:var(--color-text2)] font-Fira">
                    <TbStarFilled className='text-[var(--color-text2)]' />
                    <p className='text-[var(--color-text2)]'>{novel.rating}</p>
                </div>


            </div>
        </Link>
    );
}

export default Cart4;
