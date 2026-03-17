import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, MessageSquare } from 'lucide-react';
import { useQuery } from 'react-query';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { useSocket } from '../../context/SocketContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../api/axios.js';

const DateDivider = ({ date }) => {
  const d = new Date(date);
  const label = isToday(d) ? 'Today' : isYesterday(d) ? 'Yesterday' : format(d, 'MMM d, yyyy');
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-white/5" />
      <span className="text-[10px] text-muted px-2">{label}</span>
      <div className="flex-1 h-px bg-white/5" />
    </div>
  );
};

export default function MessagesPage() {
  const { userId: paramUserId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [activeConvId, setActiveConvId] = useState(null);
  const [activeUser, setActiveUser]     = useState(null);
  const [messages, setMessages]         = useState([]);
  const [input, setInput]               = useState('');
  const [isTyping, setIsTyping]         = useState(false);
  const typingTimer = useRef(null);
  const bottomRef   = useRef(null);

  const { data: convsData } = useQuery('conversations', () => api.get('/messages').then(r => r.data));
  const conversations = convsData?.conversations || [];

  // Load messages for active conversation
  const loadMessages = async (otherUserId) => {
    const convId = [user._id, otherUserId].sort().join('_');
    setActiveConvId(convId);
    socket?.emit('join_conversation', convId);
    socket?.emit('mark_read', convId);
    const { data } = await api.get(`/messages/${otherUserId}`);
    setMessages(data.messages);
  };

  useEffect(() => {
    if (paramUserId && user) {
      loadMessages(paramUserId);
    }
  }, [paramUserId, user]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;
    const onMsg = (msg) => {
      if (msg.conversationId === activeConvId) setMessages(prev => [...prev, msg]);
    };
    const onTyping = ({ userId }) => { if (userId !== user._id) setIsTyping(true); };
    const onStop   = () => setIsTyping(false);
    socket.on('receive_message', onMsg);
    socket.on('typing', onTyping);
    socket.on('stop_typing', onStop);
    return () => { socket.off('receive_message', onMsg); socket.off('typing', onTyping); socket.off('stop_typing', onStop); };
  }, [socket, activeConvId, user._id]);

  // Scroll to bottom
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const handleTyping = () => {
    if (!activeConvId || !activeUser) return;
    socket?.emit('typing', { conversationId: activeConvId });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => socket?.emit('stop_typing', { conversationId: activeConvId }), 1500);
  };

  const sendMessage = () => {
    if (!input.trim() || !activeConvId || !activeUser) return;
    socket?.emit('send_message', { conversationId: activeConvId, receiverId: activeUser._id, content: input.trim() });
    setMessages(prev => [...prev, { _id: Date.now().toString(), sender: { _id: user._id, name: user.name }, content: input.trim(), createdAt: new Date().toISOString(), isRead: false }]);
    setInput('');
    socket?.emit('stop_typing', { conversationId: activeConvId });
  };

  // Group messages by date
  const grouped = messages.reduce((acc, msg) => {
    const day = format(new Date(msg.createdAt), 'yyyy-MM-dd');
    (acc[day] ||= []).push(msg);
    return acc;
  }, {});

  return (
    <div className="page-container py-6">
      <h1 className="font-display font-black text-2xl mb-6">Messages</h1>
      <div className="flex gap-0 border border-white/[0.08] rounded-2xl overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>

        {/* Conversation list */}
        <div className="w-72 flex-shrink-0 border-r border-white/[0.08] flex flex-col">
          <div className="p-4 border-b border-white/[0.08]">
            <p className="text-xs font-bold text-muted uppercase tracking-wider">Conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-muted text-sm">No conversations yet</div>
            ) : conversations.map(conv => (
              <button key={conv.conversationId} onClick={() => { setActiveUser(conv.otherUser); loadMessages(conv.otherUser._id); }}
                className={`w-full text-left p-4 border-b border-white/5 hover:bg-surface2 transition-colors flex items-center gap-3
                  ${activeConvId === conv.conversationId ? 'bg-surface2' : ''}`}>
                <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm flex-shrink-0">
                  {conv.otherUser?.name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-ink truncate">{conv.otherUser?.name}</p>
                    <p className="text-[10px] text-muted flex-shrink-0 ml-2">{formatDistanceToNow(new Date(conv.lastTime), { addSuffix: false })}</p>
                  </div>
                  <p className="text-xs text-muted truncate mt-0.5">{conv.lastMessage}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="w-5 h-5 bg-accent text-bg text-[9px] font-black rounded-full flex items-center justify-center flex-shrink-0">
                    {conv.unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat window */}
        {activeUser ? (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div className="p-4 border-b border-white/[0.08] flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm">
                {activeUser.name?.[0]}
              </div>
              <div>
                <p className="font-medium text-sm">{activeUser.name}</p>
                <p className="text-xs text-muted">{socket?.connected ? 'Online' : 'Offline'}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-1">
              {Object.entries(grouped).map(([day, msgs]) => (
                <div key={day}>
                  <DateDivider date={day} />
                  {msgs.map(msg => {
                    const isMine = msg.sender?._id === user._id || msg.sender === user._id;
                    return (
                      <div key={msg._id} className={`flex mb-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                          ${isMine ? 'bg-accent text-bg rounded-br-sm' : 'bg-surface2 text-ink rounded-bl-sm'}`}>
                          <p>{msg.content}</p>
                          <p className={`text-[10px] mt-1 ${isMine ? 'text-bg/60' : 'text-muted'}`}>
                            {format(new Date(msg.createdAt), 'h:mm a')}
                            {isMine && <span className="ml-1">{msg.isRead ? '✓✓' : '✓'}</span>}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start mb-2">
                  <div className="bg-surface2 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1">
                    {[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/[0.08]">
              <div className="flex items-end gap-3 bg-surface2 rounded-xl p-3">
                <textarea value={input} onChange={e => { setInput(e.target.value); handleTyping(); }}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Type a message… (Enter to send)" rows={1}
                  className="flex-1 bg-transparent outline-none text-sm text-ink placeholder-muted resize-none max-h-28" />
                <button onClick={sendMessage} disabled={!input.trim()}
                  className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-bg transition-all hover:bg-emerald-300 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0">
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col gap-3 text-center p-8">
            <div className="w-14 h-14 bg-surface2 rounded-xl flex items-center justify-center">
              <MessageSquare size={24} className="text-muted" />
            </div>
            <p className="font-display font-bold text-base">Select a conversation</p>
            <p className="text-sm text-muted max-w-xs">Choose a conversation from the left, or message a recruiter from their job listing.</p>
          </div>
        )}
      </div>
    </div>
  );
}
