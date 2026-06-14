/**
 * TwinLink - Messages Screen
 * Chat list with search, unread counts, and online status
 */

import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MoreVertical, Pin, BellOff, Trash2, CheckCheck, Check } from 'lucide-react';
import { useChatStore, useAuthStore } from '../../lib/store';
import { useSearch, useMediaQuery } from '../../hooks';
import { formatMessageTime, truncateText } from '../../utils';
import type { Chat } from '../../types';

export default function MessagesScreen() {
  const navigate = useNavigate();
  const { chats, activeChatId, setActiveChat, pinChat, muteChat } = useChatStore();
  const { user } = useAuthStore();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [contextMenu, setContextMenu] = useState<{ chatId: string; x: number; y: number } | null>(null);

  // Search functionality
  const { query, setQuery, results: filteredChats, isSearching } = useSearch(
    chats,
    (chat, q) => {
      const otherUser = chat.participants.find(p => p.id !== user?.id);
      if (!otherUser) return false;
      return (
        otherUser.name.toLowerCase().includes(q.toLowerCase()) ||
        chat.messages.some(m => m.content.toLowerCase().includes(q.toLowerCase()))
      );
    },
    300
  );

  // Sort chats: pinned first, then by most recent
  const sortedChats = useMemo(() => {
    const chatsToSort = query.trim() ? filteredChats : chats;
    return [...chatsToSort].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      const aTime = a.lastMessage?.timestamp || a.updatedAt;
      const bTime = b.lastMessage?.timestamp || b.updatedAt;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
  }, [chats, filteredChats, query]);

  const handleChatClick = useCallback((chatId: string) => {
    setActiveChat(chatId);
    navigate(`/messages/${chatId}`);
  }, [setActiveChat, navigate]);

  const handleContextMenu = useCallback((e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    setContextMenu({ chatId, x: e.clientX, y: e.clientY });
  }, []);

  const handlePin = useCallback(() => {
    if (contextMenu) {
      pinChat(contextMenu.chatId);
      setContextMenu(null);
    }
  }, [contextMenu, pinChat]);

  const handleMute = useCallback(() => {
    if (contextMenu) {
      muteChat(contextMenu.chatId);
      setContextMenu(null);
    }
  }, [contextMenu, muteChat]);

  // Get other participant in chat
  const getOtherUser = (chat: Chat) => {
    return chat.participants.find(p => p.id !== user?.id);
  };

  // Get message status icon
  const getStatusIcon = (chat: Chat) => {
    if (!chat.lastMessage) return null;
    if (chat.lastMessage.senderId !== user?.id) return null;

    switch (chat.lastMessage.status) {
      case 'sending':
        return <Check className="w-3.5 h-3.5 text-white/30" />;
      case 'sent':
        return <Check className="w-3.5 h-3.5 text-white/50" />;
      case 'delivered':
        return <CheckCheck className="w-3.5 h-3.5 text-white/50" />;
      case 'read':
        return <CheckCheck className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-dark">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Messages</h1>
          <div className="flex items-center gap-2">
            <div className="status-dot-online" />
            <span className="text-xs text-white/50">Online</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full bg-dark-surface border border-white/5 rounded-xl pl-10 pr-4 py-2.5
              text-sm text-white placeholder-white/30 outline-none transition-all
              focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
            aria-label="Search messages"
          />
          {isSearching && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {sortedChats.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-white/20" />
            </div>
            <p className="text-white/40 text-sm">
              {query.trim() ? 'No chats found' : 'No messages yet'}
            </p>
            {query.trim() && (
              <button
                onClick={() => setQuery('')}
                className="mt-2 text-primary text-sm hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            <AnimatePresence>
              {sortedChats.map((chat, index) => {
                const otherUser = getOtherUser(chat);
                if (!otherUser) return null;

                const isActive = activeChatId === chat.id;
                const hasUnread = chat.unreadCount > 0;

                return (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleChatClick(chat.id)}
                    onContextMenu={(e) => handleContextMenu(e, chat.id)}
                    className={`flex items-center gap-3 p-4 cursor-pointer transition-all duration-200
                      ${isActive ? 'bg-primary/10' : 'hover:bg-white/5'}
                      ${hasUnread ? 'bg-white/[0.02]' : ''}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`Chat with ${otherUser.name}`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={otherUser.avatar}
                        alt={otherUser.name}
                        className="w-12 h-12 rounded-full object-cover"
                        loading="lazy"
                      />
                      {otherUser.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-dark rounded-full flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        </div>
                      )}
                      {chat.isPinned && (
                        <div className="absolute -top-1 -left-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <Pin className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-semibold text-sm truncate ${hasUnread ? 'text-white' : 'text-white/80'}`}>
                          {otherUser.name}
                        </h3>
                        <span className="text-xs text-white/30 flex-shrink-0 ml-2">
                          {chat.lastMessage && formatMessageTime(new Date(chat.lastMessage.timestamp))}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        {getStatusIcon(chat)}
                        <p className={`text-sm truncate ${hasUnread ? 'text-white/80 font-medium' : 'text-white/40'}`}>
                          {chat.lastMessage 
                            ? truncateText(chat.lastMessage.content, 40)
                            : 'Start a conversation...'
                          }
                        </p>
                      </div>
                    </div>

                    {/* Unread Badge */}
                    {hasUnread && (
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">
                          {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                        </span>
                      </div>
                    )}

                    {/* Muted indicator */}
                    {chat.isMuted && (
                      <BellOff className="w-4 h-4 text-white/20 flex-shrink-0" />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setContextMenu(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ top: contextMenu.y, left: contextMenu.x }}
              className="fixed z-50 bg-dark-surface border border-white/10 rounded-xl shadow-xl py-1 min-w-[160px]"
            >
              <button
                onClick={handlePin}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 transition-colors"
              >
                <Pin className="w-4 h-4" />
                {chats.find(c => c.id === contextMenu.chatId)?.isPinned ? 'Unpin' : 'Pin'}
              </button>
              <button
                onClick={handleMute}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 transition-colors"
              >
                <BellOff className="w-4 h-4" />
                {chats.find(c => c.id === contextMenu.chatId)?.isMuted ? 'Unmute' : 'Mute'}
              </button>
              <div className="h-px bg-white/5 my-1" />
              <button
                onClick={() => setContextMenu(null)}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Chat
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
