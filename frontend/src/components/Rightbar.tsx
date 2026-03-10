import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { getImageUrl } from '../utils/constvar';
import { Novel } from '../utils/types';
import Cart1 from './Cart/Cart1';
import Popular from './Home/Popular';
import useHttp from '../hooks/usehttp';

const Rightbarlayout = () => {
    const { pathname } = useLocation();
    const isMessagesPage = pathname === "/messages";
    const isRegisterPage = pathname.toLowerCase() === "/register";

    const buttonData = [
        { id: 1, label: 'أسبوعي', value: 'weekly' },
        { id: 2, label: 'شهري', value: 'monthly' },
        { id: 3, label: 'كلي', value: 'allTime' },
    ];

    const [activeButton, setActiveButton] = useState(1);
    const [viewType, setViewType] = useState<'weekly' | 'monthly' | 'allTime'>('weekly');
    const { sendData } = useHttp();
    const [novels, setNovels] = useState<Novel[]>([]);

    useEffect(() => {
        sendData<Novel[]>(
            `/getnovels/popular/${viewType}`,
            { method: 'GET' },
            (data) => {
                if (data) setNovels(data);
            }
        );
    }, [viewType, sendData]);

    const handleClick = (id: number) => {
        setActiveButton(id);
        const type = buttonData.find(b => b.id === id)?.value as any;
        if (type) setViewType(type);
    };

    if (isMessagesPage) {
        return <Outlet />;
    }

    const PageSidebar = () => (
        <div className="rightbar bg-[color:var(--color-bg)] flex flex-col gap-[15px] pb-[30px] rounded-[5px] w-full max-w-[320px]">
            <div className="bar-simple">
                <p className="barp text-end">رائج</p>
                <hr />
            </div>
            <div className="date pad selects flex justify-around bg-[color:var(--color-bg2)] px-0 py-2.5 rounded-[5px]">
                {buttonData.map((button) => (
                    <button
                        key={button.id}
                        className={`${activeButton === button.id ? 'active bg-[#1c8b78] text-white rounded-[5px]' : ''} no-underline text-[color:var(--color-text)] px-4 py-[5px] text-sm`}
                        onClick={() => handleClick(button.id)}
                    >
                        <p>{button.label}</p>
                    </button>
                ))}
            </div>
            <div className="carts flex flex-col gap-4">
                {novels.map((novel, index) => (
                    <Link to={`/novel/${novel._id}`} key={novel.customId}>
                        <Cart1
                            title={novel.title}
                            imganime={getImageUrl(novel.image)}
                            rank={index + 1}
                            genres={novel.genres || []}
                            numberofvirws={novel.views ? (viewType === 'allTime' ? novel.views.total : novel.views[viewType]) : 0}
                        />
                        {index < novels.length - 1 && <hr />}
                    </Link>
                ))}
            </div>
        </div>
    );

    return (
        <div className="cocontainer" dir="rtl">
            <div className="doublbar flex gap-6 items-start flex-row max1092:flex-col max1092:items-stretch">
                {/* Popular on the Right in RTL (First child) */}
                {isRegisterPage && (
                    <div className="w-full max-w-[324px] bg-[color:var(--color-bg)] p-4 rounded-[5px]">
                        <Popular isSidebar={true} />
                    </div>
                )}

                {/* Main Content (Middle) */}
                <div className="grow-[2.3] min-w-0">
                    <Outlet />
                </div>

                {/* Trending on the Left in RTL (Last child) */}
                {!isMessagesPage && <PageSidebar />}
            </div>
        </div>
    );
};

export default Rightbarlayout;
