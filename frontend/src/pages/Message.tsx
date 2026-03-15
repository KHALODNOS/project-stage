import React, { useEffect, useState, useContext, useRef } from "react";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  SendHorizontal,
  Smile,
  Users,
  Hash,
  Sidebar as SidebarIcon,
  MessageSquare,
  Circle,
  MoreVertical,
  Paperclip,
  Plus,
  X
} from "lucide-react";
import { AuthContext } from "../store/context";
import { apiUrl, urlimage } from "../utils/constvar";
import { cn } from "../utils/cn";
import Loader from "../components/Loader";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Reaction {
  userId: string;
  emoji: string;
}

interface MessageType {
  _id: string;
  sender: string;
  senderNickname: string;
  senderImage: string;
  senderRole: "admin" | "translator" | "user";
  text: string;
  reactions?: Reaction[];
  createdAt?: string;
}

interface OnlineUser {
  userId: string;
  nickname: string;
  image: string;
  role: string;
  socketId: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

const formatTime = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDate = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "اليوم";
  if (d.toDateString() === yesterday.toDateString()) return "بالأمس";
  return d.toLocaleDateString('ar-EG', { month: "short", day: "numeric" });
};

const ROLE_META: Record<string, { label: string; color: string; bg: string }> = {
  admin: { label: "مدير", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
  translator: { label: "مترجم", color: "text-sage-500", bg: "bg-sage-500/10 border-sage-500/20" },
  user: { label: "عضو", color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/20" },
};

const avatarFallback = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "?")}&background=random&color=fff&bold=true`;

const getSocketUrl = () => {
  try {
    return new URL(apiUrl).origin;
  } catch {
    return apiUrl;
  }
};

const groupByDate = (messages: MessageType[]) => {
  const groups: { date: string; messages: MessageType[] }[] = [];
  for (const m of messages) {
    const d = formatDate(m.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.date === d) {
      last.messages.push(m);
    } else {
      groups.push({ date: d, messages: [m] });
    }
  }
  return groups;
};

// ─── Component ────────────────────────────────────────────────────────────────

const Message: React.FC = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const [text, setText] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [emojiPickerFor, setEmojiPickerFor] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const user = auth?.user;
  const token = auth?.token;
  const myId = String((user as any)?._id ?? user?.id ?? "");

  // Auth guard
  useEffect(() => {
    if (!auth?.loading && !user) navigate("/login");
  }, [user, auth?.loading, navigate]);

  // Fetch history
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    axios
      .get<MessageType[]>(`${apiUrl}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => { setMessages(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  // Socket lifecycle
  useEffect(() => {
    if (!token) return;
    if (socketRef.current) { socketRef.current.disconnect(); socketRef.current = null; }

    const socket = io(getSocketUrl(), {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect_error", (err) => console.error("Socket:", err.message));
    socket.on("getOnlineUsers", (users: OnlineUser[]) => setOnlineUsers(users));
    socket.on("getMessage", (msg: MessageType) => setMessages((p) => [...p, msg]));
    socket.on("updateMessage", (upd: MessageType) =>
      setMessages((p) => p.map((m) => (m._id === upd._id ? upd : m)))
    );

    return () => { socket.disconnect(); socketRef.current = null; };
  }, [token]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim() || !socketRef.current) return;
    socketRef.current.emit("sendMessage", { text: text.trim() });
    setText("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const react = (messageId: string, emoji: string) => {
    socketRef.current?.emit("reactMessage", { messageId, emoji });
    setEmojiPickerFor(null);
  };

  if (auth?.loading) return <div className="h-[80vh] flex items-center justify-center"><Loader /></div>;
  if (!user) return null;

  const grouped = groupByDate(messages);

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-[#0d0d14] font-NotoKufi" dir="rtl" onClick={() => setEmojiPickerFor(null)}>

      {/* ═══ SIDEBAR ═══ */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="hidden lg:flex flex-col border-l border-white/5 bg-[#0a0a0f] overflow-hidden"
          >
            <div className="p-6 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xl font-black text-white font-elmessiri">المجتمع</h3>
                <div className="p-2 glass rounded-lg text-primary">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">غرفة الدردشة العامة</p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-4 px-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">متصل الآن — {onlineUsers.length}</span>
                </div>
                <div className="space-y-1">
                  {onlineUsers.length === 0 ? (
                    <p className="text-center py-10 text-zinc-700 text-sm italic">لا يوجد أحد متصل</p>
                  ) : (
                    onlineUsers.map((u) => (
                      <div key={u.socketId} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/[0.03] transition-all group">
                        <div className="relative">
                          <img
                            src={u.image ? `${urlimage}/${u.image}` : avatarFallback(u.nickname)}
                            alt={u.nickname}
                            className="w-10 h-10 rounded-xl object-cover border border-white/10 group-hover:border-primary/50 transition-colors"
                            onError={(e) => ((e.target as HTMLImageElement).src = avatarFallback(u.nickname))}
                          />
                          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0a0a0f] rounded-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-zinc-300 truncate">{u.nickname}</p>
                          <span className={cn(
                            "inline-block text-[9px] font-black px-2 py-0.5 rounded-md border",
                            ROLE_META[u.role]?.bg || ROLE_META.user.bg,
                            ROLE_META[u.role]?.color || ROLE_META.user.color
                          )}>
                            {ROLE_META[u.role]?.label || u.role}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Current User Card */}
            <div className="p-4 bg-white/[0.03] border-t border-white/5 flex items-center gap-3">
              <div className="relative">
                <img
                  src={user.image ? `${urlimage}/${user.image}` : avatarFallback(user.nickname)}
                  alt={user.nickname}
                  className="w-11 h-11 rounded-xl object-cover border-2 border-primary shadow-lg shadow-primary/20"
                  onError={(e) => ((e.target as HTMLImageElement).src = avatarFallback(user.nickname))}
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#0a0a0f] rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white truncate">{user.nickname}</p>
                <span className="text-[10px] text-primary font-bold opacity-70">أنت (@{user.username})</span>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ═══ MAIN CHAT AREA ═══ */}
      <main className="flex-1 flex flex-col relative bg-[#0d0d14]">

        {/* Top Glass Bar */}
        <header className="h-20 flex items-center justify-between px-6 glass sticky top-0 z-20 border-b border-white/5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2.5 glass rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all hidden lg:block"
            >
              <SidebarIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 px-3 py-1.5 glass rounded-2xl bg-primary/5 border-primary/20">
              <div className="p-2 bg-primary rounded-lg text-white">
                <Hash className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-black text-white leading-tight">الدردشة العامة</h2>
                <p className="text-[10px] text-primary font-bold uppercase tracking-widest">{onlineUsers.length} متصل الآن</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2.5 glass rounded-xl text-zinc-400 hover:text-white transition-all">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-10 space-y-8 custom-scrollbar scroll-smooth">
          {loading ? (
            <div className="h-full flex items-center justify-center"><Loader /></div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-20">
              <MessageSquare className="w-20 h-20 text-zinc-500" />
              <p className="text-xl font-black">لا توجد رسائل بعد</p>
            </div>
          ) : (
            grouped.map((group) => (
              <div key={group.date} className="space-y-8">
                <div className="flex items-center gap-4 text-center">
                  <div className="h-px bg-white/5 flex-1" />
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-4 py-1.5 glass rounded-full">{group.date}</span>
                  <div className="h-px bg-white/5 flex-1" />
                </div>

                {group.messages.map((m, idx) => {
                  const isOwn = m.sender === myId;
                  const rm = ROLE_META[m.senderRole] || ROLE_META.user;
                  const reactionCounts = (m.reactions ?? []).reduce<Record<string, number>>((acc, r) => {
                    acc[r.emoji] = (acc[r.emoji] ?? 0) + 1;
                    return acc;
                  }, {});

                  return (
                    <motion.div
                      key={m._id}
                      initial={{ opacity: 0, x: isOwn ? 20 : -20, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className={cn(
                        "flex items-end gap-3 max-w-[85%] md:max-w-[70%]",
                        isOwn ? "flex-row-reverse self-end mr-auto" : "self-start ml-auto"
                      )}
                    >
                      {/* Avatar */}
                      {!isOwn && (
                        <img
                          src={m.senderImage ? `${urlimage}/${m.senderImage}` : avatarFallback(m.senderNickname)}
                          alt={m.senderNickname}
                          className="w-10 h-10 rounded-2xl object-cover border border-white/10 shrink-0"
                          onError={(e) => ((e.target as HTMLImageElement).src = avatarFallback(m.senderNickname))}
                        />
                      )}

                      <div className={cn("flex flex-col gap-2", isOwn ? "items-end" : "items-start")}>
                        {/* Meta Info */}
                        {!isOwn && (
                          <div className="flex items-center gap-2 mb-1 px-1">
                            <span className="text-sm font-black text-zinc-400">{m.senderNickname}</span>
                            <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded border opacity-70", rm.bg, rm.color)}>
                              {rm.label}
                            </span>
                          </div>
                        )}

                        {/* Bubble Wrapper */}
                        <div className="relative group">
                          <div className={cn(
                            "relative px-5 py-3 rounded-3xl shadow-2xl",
                            isOwn
                              ? "bg-primary text-white rounded-br-none"
                              : "bg-white/[0.05] border border-white/5 backdrop-blur-md text-zinc-200 rounded-bl-none"
                          )}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
                            <div className={cn(
                              "text-[9px] mt-2 opacity-50 font-bold",
                              isOwn ? "text-white" : "text-zinc-500 text-left"
                            )}>
                              {formatTime(m.createdAt)}
                            </div>
                          </div>

                          {/* Quick Actions (Floating) */}
                          <div className={cn(
                            "absolute top-0 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10",
                            isOwn ? "left-full ml-2" : "right-full mr-2"
                          )}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEmojiPickerFor(emojiPickerFor === m._id ? null : m._id);
                              }}
                              className="p-2 glass rounded-xl text-zinc-500 hover:text-primary hover:bg-white/10"
                            >
                              <Smile className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Emoji Picker Overlay */}
                          <AnimatePresence>
                            {emojiPickerFor === m._id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                                onClick={(e) => e.stopPropagation()}
                                className={cn(
                                  "absolute bottom-full mb-3 p-2 glass rounded-2xl border border-white/10 z-[100] flex gap-2 shadow-2xl",
                                  isOwn ? "left-0" : "right-0"
                                )}
                              >
                                {EMOJIS.map((em) => (
                                  <button
                                    key={em}
                                    onClick={() => react(m._id, em)}
                                    className="text-xl hover:scale-125 transition-transform"
                                  >
                                    {em}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Reactions Chips */}
                        {Object.keys(reactionCounts).length > 0 && (
                          <div className={cn("flex flex-wrap gap-1.5 mt-1 animate-in zoom-in-50", isOwn ? "justify-end" : "justify-start")}>
                            {Object.entries(reactionCounts).map(([emoji, count]) => (
                              <button
                                key={emoji}
                                onClick={(e) => { e.stopPropagation(); react(m._id, emoji); }}
                                className="flex items-center gap-1.5 px-2 py-1 glass rounded-full border border-white/5 text-xs hover:bg-white/10 transition-colors"
                              >
                                <span>{emoji}</span>
                                <span className="font-bold text-zinc-500">{count}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* ═══ INPUT AREA (Sticky Footer) ═══ */}
        <div className="p-4 md:p-6 glass border-t border-white/5 bg-white/[0.02] backdrop-blur-xl">
          <div className="max-w-5xl mx-auto flex items-end gap-3">
            <div className="flex-1 relative group">
              <div className="absolute right-4 bottom-4 p-2 text-zinc-600 group-focus-within:text-primary transition-colors">
                <Plus className="w-5 h-5" />
              </div>
              <textarea
                ref={inputRef as any}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown as any}
                placeholder="اكتب رسالة..."
                rows={1}
                maxLength={1000}
                className="w-full bg-[#13131f] border border-white/10 rounded-[28px] py-4 pr-12 pl-14 text-zinc-200 text-sm focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all resize-none max-h-40 font-medium"
                style={{ minHeight: '56px' }}
              />
              <div className="absolute left-4 bottom-4 flex gap-2 text-zinc-500">
                <button className="hover:text-primary transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
                <button className="hover:text-primary transition-colors">
                  <Smile className="w-5 h-5" />
                </button>
              </div>
              {text.length > 800 && (
                <span className="absolute -top-6 left-4 text-[10px] font-black text-rose-500 uppercase tracking-widest">{text.length}/1000</span>
              )}
            </div>

            <button
              onClick={sendMessage}
              disabled={!text.trim()}
              className={cn(
                "p-4 rounded-3xl transition-all shadow-2xl",
                text.trim()
                  ? "bg-primary text-white shadow-primary/30 hover:scale-105 active:scale-95"
                  : "bg-white/5 text-zinc-700 cursor-not-allowed"
              )}
            >
              <SendHorizontal className="w-6 h-6 rotate-180" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Message;
