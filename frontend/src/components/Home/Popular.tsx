import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useHttp from "../../hooks/usehttp";
import { Novel } from '../../utils/types';
import Loader from "../Loader";
import Cart2 from "../Cart/Cart2";

interface PopularProps {
    isSidebar?: boolean;
}

const Popular: React.FC<PopularProps> = ({ isSidebar }) => {
    const { sendData, isLoading, errorMessage } = useHttp();
    const [novels, setNovels] = useState<Novel[]>([]);

    useEffect(() => {
        sendData<Novel[]>(
            '/getnovels/popular/weekly',
            { method: 'GET' },
            (data) => {
                if (data) setNovels(data);
            }
        );
    }, [sendData]);

    if (isLoading) return <Loader smaller={true} />;
    if (errorMessage) return <div className="text-red-500">Error: {errorMessage}</div>;

    return (
        <section className={`popular ${isSidebar ? 'px-0 py-2' : 'pad'}`} dir="rtl">
            <div className="section-title flex items-center gap-2 mb-6">
                <div className="w-1 h-6 bg-[#5da397] rounded-full"></div>
                <h2 className="text-xl font-bold text-[var(--color-text)]">الأكثر رواجاً</h2>
            </div>
            <div className={`grid gap-4 ${isSidebar ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                {novels.map((novel) => (
                    <Link to={`/novel/${novel._id}`} key={novel.customId} className="group">
                        <Cart2 novel={novel} />
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default Popular;