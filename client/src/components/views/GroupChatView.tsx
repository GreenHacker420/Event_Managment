import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../../store/useAppStore";
import { useChannelStore } from "../../store/useChannelStore";
import { Send, ArrowLeft, Users, RefreshCw } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { messagesApi } from "../../lib/api";
import { connectSocket, joinRoom, leaveRoom, sendMessage as socketSendMessage, getSocket } from "../../lib/socket";

export function GroupChatView() {
  const { setCursorVariant, activeEventId, user } = useAppStore();
  const { channels } = useChannelStore();
  const queryClient = useQueryClient();
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [realtimeMessages, setRealtimeMessages] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedChannel = channels.find(c => c.id === selectedTeam);

  const { data: initialMessages = [], refetch } = useQuery({
    queryKey: ['messages', activeEventId, selectedTeam],
    queryFn: () => activeEventId ? messagesApi.getAll(activeEventId, selectedTeam || undefined) : Promise.resolve([]),
    enabled: !!activeEventId && !!selectedTeam,
  });

  useEffect(() => {
    if (selectedTeam && activeEventId) {
      const socket = connectSocket();
      const roomId = selectedTeam || activeEventId;
      joinRoom(roomId);

      socket.on('new-message', (msg: any) => {
        setRealtimeMessages(prev => [...prev, msg]);
      });

      socket.on('user-typing', ({ user: typingUser }: any) => {
        setTypingUsers(prev => prev.includes(typingUser.name) ? prev : [...prev, typingUser.name]);
      });

      socket.on('user-stop-typing', ({ user: typingUser }: any) => {
        setTypingUsers(prev => prev.filter(u => u !== typingUser.name));
      });

      return () => {
        leaveRoom(roomId);
        socket.off('new-message');
        socket.off('user-typing');
        socket.off('user-stop-typing');
      };
    }
  }, [selectedTeam, activeEventId]);

  useEffect(() => {
    setRealtimeMessages([]);
  }, [selectedTeam]);

  const allMessages = [...initialMessages, ...realtimeMessages];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [allMessages, selectedTeam]);

  const sendMessage = useCallback(() => {
    if (!inputText.trim() || !selectedTeam || !activeEventId || !user) return;
    
    socketSendMessage({
      eventId: activeEventId,
      channelId: selectedTeam,
      content: inputText.trim(),
      user: { id: user.id || '', name: user.name || '', image: user.image },
    });
    setInputText("");
  }, [inputText, selectedTeam, activeEventId, user]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Team Selection View
  if (!selectedTeam) {
    return (
      <div className="min-h-screen w-full p-8 md:p-12 md:pl-32 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <header className="mb-12">
            <h2 className="text-6xl font-serif font-bold text-[#1a1a1a] mb-4">
              Team Chat
            </h2>
            <p className="text-xl font-hand text-[#1a1a1a]/60">
              Select a team to start chatting.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {channels.map((channel, index) => (
              <motion.div
                key={channel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedTeam(channel.id)}
                className={`p-6 rounded-2xl border-2 border-[var(--color-ink)]/20 hover:border-[var(--color-ink)] cursor-pointer transition-all hover:shadow-[4px_4px_0px_var(--color-ink)] ${channel.color}/20`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-full ${channel.color} border-2 border-[var(--color-ink)] flex items-center justify-center`}>
                    <Users size={24} className="text-[var(--color-ink)]" />
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-[var(--color-ink)]">{channel.name}</h3>
                    <p className="font-hand text-[var(--color-ink)]/60">{channel.description}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm font-hand text-[var(--color-ink)]/50">
                  <Users size={14} />
                  {channel.subgroups.reduce((acc, s) => acc + s.members, 0)} members
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-8 md:p-12 md:pl-32 max-w-5xl mx-auto flex flex-col">
      <header className="mb-4">
        <button
          onClick={() => setSelectedTeam(null)}
          className="flex items-center gap-2 font-hand text-[var(--color-ink)]/60 hover:text-[var(--color-ink)] mb-4 transition-colors"
        >
          <ArrowLeft size={20} /> Back to teams
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full ${selectedChannel?.color} border-2 border-[var(--color-ink)] flex items-center justify-center`}>
              <Users size={20} className="text-[var(--color-ink)]" />
            </div>
            <div>
              <h2 className="text-4xl font-serif font-bold text-[#1a1a1a]">
                {selectedChannel?.name}
              </h2>
              <p className="font-hand text-[#1a1a1a]/60">
                {selectedChannel?.subgroups.reduce((acc, s) => acc + s.members, 0)} members
              </p>
            </div>
          </div>
          <button onClick={() => refetch()} className="p-2 hover:bg-black/5 rounded-full">
            <RefreshCw size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 bg-[#1a1a1a]/5 rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden min-h-[500px]">
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(#1a1a1a 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

        <div className="flex-1 overflow-y-auto space-y-6 pr-4">
          {allMessages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center h-full min-h-[300px]">
              <p className="font-hand text-xl text-[#1a1a1a]/40 text-center">
                No messages yet.<br />Start the conversation!
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {allMessages.map((msg: any) => {
                const isMe = msg.userId === user?.id || msg.userEmail === user?.email;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-end gap-3 ${isMe ? 'justify-end' : ''}`}
                  >
                    {!isMe && (
                      msg.userImage ? (
                        <img src={msg.userImage} alt="" className="w-10 h-10 rounded-full border-2 border-[var(--color-ink)]" />
                      ) : (
                        <div className={`w-10 h-10 rounded-full ${selectedChannel?.color} border-2 border-[var(--color-ink)] flex items-center justify-center font-bold font-serif text-sm`}>
                          {(msg.userName || "?")?.[0]?.toUpperCase()}
                        </div>
                      )
                    )}
                    <div className={`max-w-md ${isMe
                      ? 'bg-[var(--color-ink)] text-[var(--color-paper)] rounded-2xl rounded-br-none'
                      : 'bg-white rounded-2xl rounded-bl-none border border-[#1a1a1a]/10'
                      } p-4 shadow-sm`}>
                      {!isMe && <p className="text-xs font-bold mb-1">{msg.userName}</p>}
                      <p className="font-hand text-lg">{msg.content}</p>
                      <p className={`text-xs mt-1 ${isMe ? 'text-white/50' : 'text-[#1a1a1a]/40'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {isMe && (
                      user?.image ? (
                        <img src={user.image} alt="" className="w-10 h-10 rounded-full border-2 border-[var(--color-ink)]" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[var(--color-accent)] border-2 border-[var(--color-ink)] flex items-center justify-center font-bold font-serif text-sm">
                          {user?.name?.[0]?.toUpperCase() || "Y"}
                        </div>
                      )
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        {typingUsers.length > 0 && (
          <div className="px-4 py-2 text-sm font-hand text-[var(--color-ink)]/50 italic">
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </div>
        )}

        <div className="mt-6 relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="w-full bg-white rounded-full py-4 px-8 pr-16 font-hand text-xl border-2 border-[#1a1a1a]/10 focus:border-[#1a1a1a] focus:outline-none shadow-sm transition-colors"
            onMouseEnter={() => setCursorVariant("text")}
            onMouseLeave={() => setCursorVariant("default")}
          />
          <button
            onClick={sendMessage}
            disabled={!inputText.trim()}
            className="absolute right-2 top-2 w-12 h-12 bg-[#1a1a1a] rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform disabled:opacity-50 disabled:hover:scale-100"
            onMouseEnter={() => setCursorVariant("hover")}
            onMouseLeave={() => setCursorVariant("default")}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
