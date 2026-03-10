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
  MoreVertical,
  Paperclip,
  Plus
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
  translator: { label: "مترجم", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
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
    <div className="h-[calc(100vh-100px)] bg-[#0a0a0f] flex flex-col py-0 md:py-6 md:px-6 font-NotoKufi" dir="rtl" onClick={() => setEmojiPickerFor(null)}>

      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600 rounded-full blur-[120px]" />
      </div>

      <div className="flex-1 max-w-[1600px] w-full mx-auto flex overflow-hidden glass md:rounded-[2.5rem] border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] relative z-10 transition-all duration-500">

        {/* ═══ SIDEBAR ═══ */}
        <AnimatePresence mode="wait">
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="hidden lg:flex flex-col border-l border-white/5 bg-black/20 overflow-hidden"
            >
              <div className="p-8 border-b border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-black text-white font-elmessiri">المجتمع</h3>
                  <div className="p-2.5 glass rounded-xl text-primary">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">The Infinite Chat Room</p>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 scroll-thin">
                <div>
                  <div className="flex items-center gap-2 mb-6 px-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_#10b981]" />
                    <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">متصل الآن — {onlineUsers.length}</span>
                  </div>
                  <div className="space-y-2">
                    {onlineUsers.length === 0 ? (
                      <p className="text-center py-12 text-zinc-800 text-sm font-bold">لا يوجد أحد متصل...</p>
                    ) : (
                      onlineUsers.map((u) => (
                        <div key={u.socketId} className="flex items-center gap-4 p-3.5 rounded-2xl hover:bg-white/[0.05] transition-all group cursor-default">
                          <div className="relative">
                            <img
                              src={u.image ? `${urlimage}/${u.image}` : avatarFallback(u.nickname)}
                              alt={u.nickname}
                              className="w-11 h-11 rounded-2xl object-cover border-2 border-white/5 group-hover:border-primary/40 transition-all"
                              onError={(e) => ((e.target as HTMLImageElement).src = avatarFallback(u.nickname))}
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-[3px] border-[#0d0d14] rounded-full" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-zinc-100 truncate mb-1">{u.nickname}</p>
                            <span className={cn(
                              "inline-block text-[9px] font-bold px-2 py-0.5 rounded-md border",
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

              {/* Self Profile */}
              <div className="p-6 bg-black/40 border-t border-white/5 flex items-center gap-4">
                <img
                  src={user.image ? `${urlimage}/${user.image}` : avatarFallback(user.nickname)}
                  alt={user.nickname}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-primary shadow-2xl shadow-primary/20"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-white truncate">{user.nickname}</p>
                  <p className="text-[10px] text-zinc-500 font-bold">أنت (@{user.username})</p>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ═══ MAIN CHAT AREA ═══ */}
        <main className="flex-1 flex flex-col relative bg-transparent">

          {/* Integrated Header */}
          <header className="h-24 flex items-center justify-between px-8 bg-black/10 backdrop-blur-xl border-b border-white/5 z-20">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-3 glass rounded-2xl text-zinc-500 hover:text-white transition-all shadow-xl"
              >
                <SidebarIcon className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 text-primary rounded-2xl border border-primary/20">
                  <Hash className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h2 className="text-xl font-black text-white font-elmessiri">الدردشة العامة</h2>
                  <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">{onlineUsers.length} من الأعضاء متواجدون</p>
                </div>
              </div>
            </div>
            <button className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-zinc-400 hover:text-white transition-all shadow-lg">
              <MoreVertical className="w-5 h-5" />
            </button>
          </header>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto px-6 md:px-12 py-10 space-y-12 custom-scrollbar scroll-smooth">
            {loading ? (
              <div className="h-full flex items-center justify-center"><Loader /></div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-20">
                <div className="p-8 glass rounded-full">
                  <MessageSquare className="w-24 h-24 text-zinc-500" />
                </div>
                <p className="text-2xl font-black font-elmessiri">ابدأ المحادثة الآن</p>
              </div>
            ) : (
              grouped.map((group) => (
                <div key={group.date} className="space-y-10">
                  <div className="flex items-center gap-6">
                    <div className="h-px bg-gradient-to-l from-transparent to-white/5 flex-1" />
                    <span className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.3em] px-6 py-2 glass rounded-2xl border border-white/5">{group.date}</span>
                    <div className="h-px bg-gradient-to-r from-transparent to-white/5 flex-1" />
                  </div>

                  {group.messages.map((m) => {
                    const isOwn = m.sender === myId;
                    const rm = ROLE_META[m.senderRole] || ROLE_META.user;
                    const reactionCounts = (m.reactions ?? []).reduce<Record<string, number>>((acc, r) => {
                      acc[r.emoji] = (acc[r.emoji] ?? 0) + 1;
                      return acc;
                    }, {});

                    return (
                      <motion.div
                        key={m._id}
                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={cn(
                          "flex items-end gap-4 max-w-[90%] md:max-w-[75%]",
                          isOwn ? "flex-row-reverse self-end mr-auto" : "self-start ml-auto"
                        )}
                      >
                        {!isOwn && (
                          <motion.img
                            whileHover={{ scale: 1.1 }}
                            src={m.senderImage ? `${urlimage}/${m.senderImage}` : avatarFallback(m.senderNickname)}
                            alt={m.senderNickname}
                            className="w-10 h-10 rounded-2xl object-cover border border-white/10 shrink-0 shadow-xl shadow-black/40"
                            onError={(e) => ((e.target as HTMLImageElement).src = avatarFallback(m.senderNickname))}
                          />
                        )}

                        <div className={cn("flex flex-col", isOwn ? "items-end text-left" : "items-start text-right")}>
                          {!isOwn && (
                            <div className="flex items-center gap-2 mb-2 px-1">
                              <span className="text-sm font-black text-zinc-300">{m.senderNickname}</span>
                              <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-lg border", rm.bg, rm.color)}>
                                {rm.label}
                              </span>
                            </div>
                          )}

                          <div className="relative group">
                            <div className={cn(
                              "relative px-6 py-4 rounded-[1.8rem] shadow-2xl transition-all duration-300",
                              isOwn
                                ? "bg-primary text-white rounded-br-none shadow-primary/20"
                                : "glass bg-white/[0.04] border border-white/10 text-zinc-100 rounded-bl-none shadow-black/50"
                            )}>
                              <p className="text-base leading-relaxed whitespace-pre-wrap font-medium">{m.text}</p>
                              <div className={cn(
                                "text-[10px] mt-3 font-bold tracking-wider opacity-40",
                                isOwn ? "text-white text-end" : "text-zinc-500 text-start"
                              )}>
                                {formatTime(m.createdAt)}
                              </div>
                            </div>

                            {/* Floating Reaction Trigger */}
                            <div className={cn(
                              "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300",
                              isOwn ? "right-full mr-4" : "left-full ml-4"
                            )}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEmojiPickerFor(emojiPickerFor === m._id ? null : m._id);
                                }}
                                className="w-10 h-10 glass rounded-2xl flex items-center justify-center text-zinc-500 hover:text-primary hover:scale-110 active:scale-95 transition-all shadow-xl"
                              >
                                <Smile className="w-5 h-5" />
                              </button>
                            </div>

                            {/* Emoji Picker Overlay */}
                            <AnimatePresence>
                              {emojiPickerFor === m._id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.5, y: 20 }}
                                  className={cn(
                                    "absolute bottom-full mb-4 p-3 glass rounded-[2rem] border border-white/10 z-[100] flex gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.8)]",
                                    isOwn ? "left-0" : "right-0"
                                  )}
                                >
                                  {EMOJIS.map((em) => (
                                    <button
                                      key={em}
                                      onClick={() => react(m._id, em)}
                                      className="text-2xl hover:scale-150 transition-transform p-1"
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
                            <div className={cn("flex flex-wrap gap-2 mt-2", isOwn ? "justify-end" : "justify-start")}>
                              {Object.entries(reactionCounts).map(([emoji, count]) => (
                                <button
                                  key={emoji}
                                  onClick={(e) => { e.stopPropagation(); react(m._id, emoji); }}
                                  className="flex items-center gap-2 px-3 py-1.5 glass rounded-full border border-white/10 text-sm hover:bg-white/10 transition-all shadow-sm"
                                >
                                  <span>{emoji}</span>
                                  <span className="font-black text-primary text-xs">{count}</span>
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

          {/* App-like Input Section */}
          <div className="p-8 bg-black/5 flex justify-center">
            <div className="w-full max-w-4xl relative group">
              <div className="p-1 glass rounded-[2.5rem] bg-white/[0.04] border border-white/10 shadow-2xl focus-within:border-primary/50 focus-within:bg-white/[0.06] transition-all">
                <div className="flex items-end gap-2 p-2">
                  <div className="flex gap-1 mb-2">
                    <button className="p-3 text-zinc-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button className="p-3 text-zinc-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  <textarea
                    ref={inputRef as any}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown as any}
                    placeholder="اكتب رسالة للمجتمع..."
                    rows={1}
                    maxLength={1000}
                    className="flex-1 bg-transparent border-none py-4 px-4 text-zinc-100 text-sm focus:ring-0 outline-none resize-none max-h-48 font-medium h-[56px] placeholder:text-zinc-600"
                  />

                  <div className="flex items-center gap-3">
                    <button className="p-3 text-zinc-500 hover:text-white transition-all">
                      <Smile className="w-5 h-5" />
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={sendMessage}
                      disabled={!text.trim()}
                      className={cn(
                        "w-12 h-12 rounded-[1.5rem] flex items-center justify-center transition-all",
                        text.trim()
                          ? "bg-primary text-white shadow-xl shadow-primary/30"
                          : "bg-white/5 text-zinc-700 opacity-50"
                      )}
                    >
                      <SendHorizontal className="w-6 h-6 rotate-180" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Char counter */}
              <AnimatePresence>
                {text.length > 700 && (
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute -top-8 left-8 text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20"
                  >
                    {text.length} / 1000
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Message;
