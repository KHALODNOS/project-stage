
import { Link } from 'react-router-dom';
import "./style.css"
import { Novel } from '../../utils/types';
import { getImageUrl } from "../../utils/constvar";

const Cart5 = ({ novel }: { novel: Novel }) => {
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
                {novel.genres && (<Link to="" className="chapter text-[#888]">{novel.genres[0]}</Link>)
                }

            </div>
        </Link>
    );
}

export default Cart5;
