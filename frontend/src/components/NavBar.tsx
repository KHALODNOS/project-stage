import { useContext, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Sun,
    Moon,
    Search,
    User,
    LogOut,
    Home,
    BookOpen,
    MessageSquare,
    Bot,
    Video,
    PlusCircle,
    Menu,
    X,
    Bell
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { apiUrl } from '../utils/constvar';

import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../store/context';
import useHttp from '../hooks/usehttp';
import { Novel } from "../utils/types";
import { validateObjectId } from '../utils/valideobject';
import { getImageUrl } from '../utils/constvar';
import { cn } from '../utils/cn';

const NavBar = () => {
    const { pathname } = useLocation();
    const ctx = useContext(AuthContext);
    const { sendData } = useHttp();
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('darkMode') === 'true';
    });
    const [isOpenMenu, setIsOpenMenu] = useState(false);
    const [isOpenProfile, setIsOpenProfile] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Novel[]>([]);
    const [novelId, setNovelId] = useState('');
    const [scrolled, setScrolled] = useState(false);

    const profileRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);

    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpenNotifications, setIsOpenNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const socketRef = useRef<Socket | null>(null);


    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsOpenProfile(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setSearchResults([]);
                setSearchQuery('');
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsOpenNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
    }, [isDarkMode]);

    useEffect(() => {
        const pathSegments = pathname.split('/').filter(Boolean);
        if (pathSegments.length === 2 && pathSegments[0] === 'novel' && validateObjectId(pathSegments[1])) {
            setNovelId(pathSegments[1]);
        } else {
            setNovelId('');
        }
        setIsOpenProfile(false);
        setIsOpenNotifications(false);
        setSearchResults([]);
        setSearchQuery('');
        setIsOpenMenu(false);
    }, [pathname]);

    // Notifications Logic
    useEffect(() => {
        if (ctx?.token) {
            // Fetch initial notifications
            sendData<any[]>('/notifications', { method: 'GET' }, (data) => {
                if (data) {
                    setNotifications(data);
                    // For now, let's assume all fetched are unread or just count them
                    setUnreadCount(data.length > 0 ? data.length : 0);
                }
            }, undefined, true);

            // Socket setup
            const socket = io(apiUrl, {
                auth: { token: ctx.token },
                transports: ["websocket", "polling"],
            });
            socketRef.current = socket;

            socket.on('connect', () => {
                console.log('Connected to socket for notifications');
                // Join role-based room
                socket.emit('join', ctx.user?.role);
                // Join user-specific room for private notifications
                const userId = (ctx.user as any)?._id || ctx.user?.id;
                if (userId) socket.emit('join', userId.toString());
            });

            socket.on('newNotification', (notif: any) => {
                const myId = (ctx.user as any)?._id || ctx.user?.id;
                if (notif.sender !== myId.toString()) {
                    setNotifications(prev => [notif, ...prev]);
                    setUnreadCount(prev => prev + 1);
                }
            });

            return () => {
                socket.disconnect();
                socketRef.current = null;
            };
        }
    }, [ctx?.token, ctx?.user?.role]);


    const handleDarkModeToggle = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        localStorage.setItem('darkMode', newMode.toString());
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query) {
            sendData<Novel[]>(`/novels/search/?q=${query}&type=all`, { method: 'GET' }, (data) => setSearchResults(data || []));
        } else {
            setSearchResults([]);
        }
    };

    const navLinks = [
        { name: 'الرئيسية', path: '/', icon: Home },
        { name: 'الروايات', path: '/novels', icon: BookOpen },
        { name: 'تيك توك', path: '/tiktok', icon: Video },
        ...(ctx?.token ? [{ name: 'الذكاء الاصطناعي', path: '/chatbot', icon: Bot }] : []),
        ...(ctx?.token ? [{ name: 'المحادثات', path: '/messages', icon: MessageSquare }] : []),
    ];

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 py-3",
                scrolled ? "glass m-4 rounded-2xl shadow-2xl" : "bg-transparent"
            )}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                {/* Right Side: Navigation & Logo */}
                <div className="flex items-center gap-6" dir="rtl">
                    <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-sage-500 to-sage-800 bg-clip-text text-transparent">
                        ROMAN
                    </Link>

                    <div className="hidden md:flex items-center gap-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 hover:bg-white/10 group",
                                    pathname === link.path ? "text-primary bg-white/5" : "text-foreground/70"
                                )}
                            >
                                <link.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                <span className="font-elmessiri">{link.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Left Side: Search, Theme, Profile */}
                <div className="flex items-center gap-3">
                    {/* Search Bar */}
                    <div ref={searchRef} className="relative hidden s:block">
                        <div className="flex items-center glass rounded-xl px-3 py-1.5 focus-within:ring-2 ring-primary/50 transition-all">
                            <Search className="w-4 h-4 text-foreground/50" />
                            <input
                                dir="rtl"
                                className="bg-transparent border-none outline-none px-2 w-32 md:w-48 text-sm placeholder:text-foreground/30"
                                placeholder="بحث عن رواية..."
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                        </div>

                        <AnimatePresence>
                            {searchResults.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full mt-2 left-0 right-0 glass rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto"
                                >
                                    {searchResults.map((novel) => (
                                        <Link
                                            key={novel._id}
                                            to={`/novel/${novel._id}`}
                                            className="flex items-center gap-3 p-3 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
                                            onClick={() => setSearchResults([])}
                                        >
                                            <img src={getImageUrl(novel.image)} alt={novel.title} className="w-12 h-16 object-cover rounded-lg shadow-md" />
                                            <div className="flex flex-col text-right flex-grow">
                                                <span className="text-sm font-bold truncate">{novel.title}</span>
                                                <span className="text-xs text-foreground/50 truncate">{novel.englishName}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Dark Mode Toggle */}
                    <button
                        onClick={handleDarkModeToggle}
                        className="p-2 glass rounded-xl hover:bg-white/20 transition-colors"
                        aria-label="Toggle theme"
                    >
                        {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-sage-500" />}
                    </button>

                    {/* Notifications */}
                    {ctx?.token && (
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => {
                                    setIsOpenNotifications(!isOpenNotifications);
                                    if (!isOpenNotifications) setUnreadCount(0);
                                }}
                                className="p-2 glass rounded-xl hover:bg-white/20 transition-colors relative"
                                aria-label="Notifications"
                            >
                                <Bell className="w-5 h-5 text-foreground/70" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-background animate-pulse">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            <AnimatePresence>
                                {isOpenNotifications && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                        className="absolute right-0 mt-3 w-72 glass rounded-2xl shadow-2xl py-3 overflow-hidden z-50 border border-white/10"
                                        dir="rtl"
                                    >
                                        <div className="px-4 pb-2 mb-2 border-b border-white/10 flex justify-between items-center">
                                            <span className="text-sm font-bold font-elmessiri">الاشعارات</span>
                                            <span className="text-[10px] text-foreground/40 font-bold uppercase tracking-wider">{notifications.length} تنبيه</span>
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                            {notifications.length === 0 ? (
                                                <div className="py-8 text-center text-foreground/30 flex flex-col items-center gap-2">
                                                    <Bell className="w-8 h-8 opacity-20" />
                                                    <p className="text-xs">لا توجد اشعارات حتى الآن</p>
                                                </div>
                                            ) : (
                                                notifications.map((notif, idx) => (
                                                    <div key={idx} className="px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group cursor-default">
                                                        <p className="text-xs text-foreground/80 leading-relaxed">{notif.message}</p>
                                                        <span className="text-[9px] text-foreground/30 mt-1 block">
                                                            {new Date(notif.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}


                    {/* Profile */}
                    {ctx?.token ? (
                        <div className="relative" ref={profileRef}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsOpenProfile(!isOpenProfile)}
                                className="flex items-center gap-2 glass p-1 pl-3 rounded-xl hover:bg-white/20 transition-colors"
                            >
                                <img src={`${ctx?.user?.image}`} alt="Profile" className="w-8 h-8 rounded-lg object-cover shadow-Inner" />
                                <span className="hidden lg:block text-sm font-semibold">{ctx?.user?.username}</span>
                            </motion.button>

                            <AnimatePresence>
                                {isOpenProfile && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                        className="absolute right-0 mt-3 w-48 glass rounded-2xl shadow-2xl py-2 overflow-hidden z-50"
                                        dir="rtl"
                                    >
                                        <Link to={`/profile/${ctx?.user?.username}`} className="flex items-center gap-2 px-4 py-2.5 hover:bg-white/10 transition-colors">
                                            <User className="w-4 h-4" />
                                            <span>حسابي</span>
                                        </Link>
                                        {ctx?.user?.role === "admin" && (
                                            <Link to="/addnovel" className="flex items-center gap-2 px-4 py-2.5 hover:bg-white/10 text-primary transition-colors">
                                                <PlusCircle className="w-4 h-4" />
                                                <span>إنشاء رواية</span>
                                            </Link>
                                        )}
                                        <div className="h-px bg-white/5 my-1" />
                                        <button onClick={ctx?.logout} className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-destructive/20 text-destructive transition-colors">
                                            <LogOut className="w-4 h-4" />
                                            <span>تسجيل الخروج</span>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <Link to="/login" className="flex items-center gap-2 glass px-4 py-2 rounded-xl bg-primary/20 hover:bg-primary/30 transition-all border-primary/20">
                            <User className="w-4 h-4" />
                            <span className="text-sm font-bold">دخول</span>
                        </Link>
                    )}

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 glass rounded-xl"
                        onClick={() => setIsOpenMenu(!isOpenMenu)}
                    >
                        {isOpenMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpenMenu && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden mt-4 glass rounded-2xl overflow-hidden shadow-2xl overflow-y-auto"
                        dir="rtl"
                    >
                        <div className="flex flex-col p-4 gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsOpenMenu(false)}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors"
                                >
                                    <link.icon className="w-5 h-5 text-primary" />
                                    <span className="font-bold">{link.name}</span>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

export default NavBar;