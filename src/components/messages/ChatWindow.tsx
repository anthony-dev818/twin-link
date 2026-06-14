/**
 * TwinLink - Chat Window
 * Individual chat conversation with messages, typing indicators, emoji picker, attachments
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Phone, Video, MoreVertical, Send, Smile, Paperclip,
  Check, CheckCheck, Clock, Edit3, Trash2, Copy, X, Image, File,
  Mic, MapPin, ChevronDown
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { useChatStore, useAuthStore, useUIStore } from '../../lib/store';
import { useTypingIndicator, useAutoScroll, useClickOutside, useKeyboardShortcut } from '../../hooks';
import { formatMessageTime, formatFullTimestamp, sanitizeInput, truncateText } from '../../utils';
import type { Message } from '../../types';

export default function ChatWindow() {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { chats, sendMessage, editMessage, deleteMessage, addReaction, setActiveChat } = useChatStore();
  const { user } = useAuthStore();
  const { showEmojiPicker, setShowEmojiPicker, selectedMessageId, setSelectedMessageId } = useUIStore();

  const [inputValue, setInputValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const [showMessageMenu, setShowMessageMenu] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const attachmentRef = useRef<HTMLDivElement>(null);
  const messageMenuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chat = chats.find(c => c.id === chatId);
  const otherUser = chat?.participants.find(p => p.id !== user?.id);

  const { isTyping, handleTyping } = useTypingIndicator(chatId || '', 2000);
  const { scrollRef, handleScroll, scrollToBottom } = useAutoScroll(chat?.messages.length);

  // Close emoji picker when clicking outside
  useClickOutside(emojiPickerRef, () => setShowEmojiPicker(false));
  useClickOutside(attachmentRef, () => setShowAttachments(false));
  useClickOutside(messageMenuRef, () => setShowMessageMenu(null));

  // Set active chat on mount
  useEffect(() => {
    if (chatId) {
      setActiveChat(chatId);
    }
    return () => setActiveChat(null);
  }, [chatId, setActiveChat]);

  // Keyboard shortcut: Escape to close chat
  useKeyboardShortcut('Escape', () => {
    navigate('/messages');
  });

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || !chatId) return;

    const content = sanitizeInput(inputValue.trim());
    setInputValue('');
    setReplyingTo(null);

    await sendMessage(chatId, content);
    scrollToBottom();
  }, [inputValue, chatId, sendMessage, scrollToBottom]);

  const handleEdit = useCallback((message: Message) => {
    setIsEditing(true);
    setEditValue(message.content);
    setSelectedMessageId(message.id);
    setShowMessageMenu(null);
    inputRef.current?.focus();
  }, [setSelectedMessageId]);

  const handleSaveEdit = useCallback(() => {
    if (selectedMessageId && editValue.trim()) {
      editMessage(selectedMessageId, sanitizeInput(editValue.trim()));
    }
    setIsEditing(false);
    setEditValue('');
    setSelectedMessageId(null);
  }, [selectedMessageId, editValue, editMessage, setSelectedMessageId]);

  const handleDelete = useCallback((messageId: string) => {
    if (window.confirm('Delete this message?')) {
      deleteMessage(messageId);
    }
    setShowMessageMenu(null);
  }, [deleteMessage]);

  const handleEmojiSelect = useCallback((emojiData: { emoji: string }) => {
    setInputValue(prev => prev + emojiData.emoji);
    inputRef.current?.focus();
  }, []);

  const handleReaction = useCallback((messageId: string, emoji: string) => {
    addReaction(messageId, emoji);
    setShowMessageMenu(null);
  }, [addReaction]);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setShowMessageMenu(null);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isEditing) {
        handleSaveEdit();
      } else {
        handleSend();
      }
    }
    if (e.key === 'Escape' && isEditing) {
      setIsEditing(false);
      setEditValue('');
      setSelectedMessageId(null);
    }
  }, [isEditing, handleSend, handleSaveEdit, setSelectedMessageId]);

  // Handle file upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && chatId) {
      // In production, upload to server and get URL
      // For now, create a local URL
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith('image/') ? 'image' : 'file';
      sendMessage(chatId, `Sent ${type === 'image' ? 'an image' : 'a file'}`, type);
    }
    setShowAttachments(false);
  }, [chatId, sendMessage]);

  if (!chat || !otherUser) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/40">Chat not found</p>
          <button
            onClick={() => navigate('/messages')}
            className="mt-4 btn-primary text-sm"
          >
            Back to Messages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-dark">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-3 border-b border-white/5 bg-dark-card/50 backdrop-blur-sm">
        <button
          onClick={() => navigate('/messages')}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors lg:hidden"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* User Info */}
        <div className="relative">
          <img
            src={otherUser.avatar}
            alt={otherUser.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          {otherUser.isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-dark rounded-full flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-sm truncate">{otherUser.name}</h2>
          <p className="text-xs text-white/50">
            {chat.isTyping 
              ? 'typing...' 
              : otherUser.isOnline 
                ? 'Online' 
                : `Last seen ${formatFullTimestamp(new Date(otherUser.lastSeen)).split(',')[0]}`
            }
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-lg hover:bg-white/5 transition-colors" aria-label="Voice call">
            <Phone className="w-5 h-5 text-white/60" />
          </button>
          <button className="p-2 rounded-lg hover:bg-white/5 transition-colors" aria-label="Video call">
            <Video className="w-5 h-5 text-white/60" />
          </button>
          <button className="p-2 rounded-lg hover:bg-white/5 transition-colors" aria-label="More options">
            <MoreVertical className="w-5 h-5 text-white/60" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3 pb-24"
      >
        {/* Date separator */}
        <div className="flex items-center justify-center">
          <span className="text-xs text-white/30 bg-dark-surface px-3 py-1 rounded-full">
            Today
          </span>
        </div>

        <AnimatePresence>
          {chat.messages.map((message, index) => {
            const isMine = message.senderId === user?.id;
            const showAvatar = !isMine && (
              index === 0 || 
              chat.messages[index - 1]?.senderId !== message.senderId
            );

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-end gap-2 max-w-[80%] ${isMine ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  {!isMine && showAvatar && (
                    <img
                      src={otherUser.avatar}
                      alt={otherUser.name}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0 mb-1"
                    />
                  )}
                  {!isMine && !showAvatar && <div className="w-8" />}

                  {/* Message Bubble */}
                  <div className="relative group">
                    <div
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setShowMessageMenu(message.id);
                      }}
                      className={`relative px-4 py-2.5 rounded-2xl ${
                        isMine
                          ? 'bg-primary text-white rounded-tr-sm'
                          : 'bg-dark-surface text-white rounded-tl-sm'
                      } ${message.status === 'sending' ? 'opacity-70' : ''}`}
                    >
                      {/* Reply indicator */}
                      {message.replyTo && (
                        <div className={`text-xs mb-1 pb-1 border-b ${
                          isMine ? 'border-white/20 text-white/60' : 'border-white/10 text-white/40'
                        }`}>
                          Replying to message
                        </div>
                      )}

                      {/* Message content */}
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

                      {/* Edited indicator */}
                      {message.edited && (
                        <span className="text-[10px] opacity-50 ml-1">(edited)</span>
                      )}

                      {/* Timestamp & Status */}
                      <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : ''}`}>
                        <span className="text-[10px] opacity-50">
                          {formatMessageTime(new Date(message.timestamp))}
                        </span>
                        {isMine && (
                          <span className="opacity-60">
                            {message.status === 'sending' && <Clock className="w-3 h-3" />}
                            {message.status === 'sent' && <Check className="w-3 h-3" />}
                            {message.status === 'delivered' && <CheckCheck className="w-3 h-3" />}
                            {message.status === 'read' && <CheckCheck className="w-3 h-3 text-blue-300" />}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Reactions */}
                    {message.reactions && message.reactions.length > 0 && (
                      <div className={`flex gap-1 mt-1 ${isMine ? 'justify-end' : ''}`}>
                        {message.reactions.map((reaction, i) => (
                          <button
                            key={i}
                            onClick={() => handleReaction(message.id, reaction.emoji)}
                            className="text-xs bg-dark-surface border border-white/10 rounded-full px-1.5 py-0.5 hover:bg-white/5"
                          >
                            {reaction.emoji}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Message Menu */}
                    <AnimatePresence>
                      {showMessageMenu === message.id && (
                        <motion.div
                          ref={messageMenuRef}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute z-20 bg-dark-surface border border-white/10 rounded-xl shadow-xl py-1 min-w-[140px]"
                          style={{ 
                            [isMine ? 'right' : 'left']: 0,
                            bottom: '100%',
                            marginBottom: 4
                          }}
                        >
                          {/* Quick reactions */}
                          <div className="flex gap-1 px-2 py-1 border-b border-white/5">
                            {['❤️', '👍', '😂', '😮', '😢', '😡'].map(emoji => (
                              <button
                                key={emoji}
                                onClick={() => handleReaction(message.id, emoji)}
                                className="p-1 hover:bg-white/5 rounded transition-colors text-lg"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>

                          {isMine && (
                            <button
                              onClick={() => handleEdit(message)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Edit
                            </button>
                          )}
                          <button
                            onClick={() => handleCopy(message.content)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5"
                          >
                            <Copy className="w-3.5 h-3.5" /> Copy
                          </button>
                          {isMine && (
                            <button
                              onClick={() => handleDelete(message.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {chat.isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-end gap-2"
            >
              <img
                src={otherUser.avatar}
                alt={otherUser.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="bg-dark-surface rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-white/40 animate-typing" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-white/40 animate-typing" style={{ animationDelay: '200ms' }} />
                  <div className="w-2 h-2 rounded-full bg-white/40 animate-typing" style={{ animationDelay: '400ms' }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reply Banner */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-dark-surface/50 border-t border-white/5 px-4 py-2 flex items-center gap-2"
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs text-primary font-medium">Replying to</p>
              <p className="text-sm text-white/60 truncate">{truncateText(replyingTo.content, 50)}</p>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="p-1 rounded hover:bg-white/5"
            >
              <X className="w-4 h-4 text-white/40" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Banner */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-primary/10 border-t border-primary/20 px-4 py-2 flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary">Editing message</span>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditValue('');
                setSelectedMessageId(null);
              }}
              className="ml-auto p-1 rounded hover:bg-white/5"
            >
              <X className="w-4 h-4 text-white/40" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="p-3 border-t border-white/5 bg-dark-card/50 backdrop-blur-sm sticky bottom-0">
        <div className="flex items-end gap-2">
          {/* Attachment Button */}
          <div className="relative" ref={attachmentRef}>
            <button
              onClick={() => setShowAttachments(!showAttachments)}
              className="p-2.5 rounded-xl hover:bg-white/5 transition-colors flex-shrink-0"
              aria-label="Attachments"
            >
              <Paperclip className="w-5 h-5 text-white/50" />
            </button>

            <AnimatePresence>
              {showAttachments && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full left-0 mb-2 bg-dark-surface border border-white/10 rounded-xl shadow-xl p-2 min-w-[180px]"
                >
                  <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                    <Image className="w-5 h-5 text-primary" />
                    <span className="text-sm text-white/80">Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                  <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                    <File className="w-5 h-5 text-blue-400" />
                    <span className="text-sm text-white/80">Document</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors">
                    <Mic className="w-5 h-5 text-red-400" />
                    <span className="text-sm text-white/80">Voice</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors">
                    <MapPin className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm text-white/80">Location</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Emoji Button */}
          <div className="relative" ref={emojiPickerRef}>
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2.5 rounded-xl hover:bg-white/5 transition-colors flex-shrink-0"
              aria-label="Emoji picker"
            >
              <Smile className="w-5 h-5 text-white/50" />
            </button>

            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-0 mb-2 z-30"
                >
                  <EmojiPicker
                    onEmojiClick={handleEmojiSelect}
                    width={320}
                    height={400}
                    theme="dark"
                    skinTonesDisabled
                    searchPlaceholder="Search emoji..."
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Text Input */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={isEditing ? editValue : inputValue}
              onChange={(e) => {
                if (isEditing) {
                  setEditValue(e.target.value);
                } else {
                  setInputValue(e.target.value);
                  handleTyping();
                }
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (isEditing) {
                  setEditValue(inputValue);
                }
              }}
              placeholder={isEditing ? 'Edit message...' : 'Type a message...'}
              className="w-full bg-dark-surface border border-white/10 rounded-xl px-4 py-3 pr-10
                text-sm text-white placeholder-white/30 outline-none transition-all
                focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
              aria-label={isEditing ? 'Edit message' : 'Type a message'}
            />
            {isEditing && (
              <button
                onClick={handleSaveEdit}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Send Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isEditing ? handleSaveEdit : handleSend}
            disabled={isEditing ? !editValue.trim() : !inputValue.trim()}
            className="p-3 rounded-xl gradient-primary flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed
              hover:shadow-lg hover:shadow-primary/25 transition-all"
            aria-label={isEditing ? 'Save edit' : 'Send message'}
          >
            <Send className="w-5 h-5 text-white" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
