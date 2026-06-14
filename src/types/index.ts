/**
 * TwinLink - Core Type Definitions
 * All types used across the application
 */

// User / Profile Types
export interface User {
  id: string;
  name: string;
  age: number;
  email: string;
  avatar: string;
  bio: string;
  distance: string;
  isOnline: boolean;
  lastSeen: Date;
  interests: string[];
  photos: string[];
  job?: string;
  location?: string;
  isPremium?: boolean;
}

// Message Types
export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  status: MessageStatus;
  type: MessageType;
  replyTo?: string;
  reactions?: Reaction[];
  edited?: boolean;
  editedAt?: Date;
  attachments?: Attachment[];
}

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export type MessageType = 'text' | 'image' | 'file' | 'voice' | 'location';

export interface Reaction {
  emoji: string;
  userId: string;
}

export interface Attachment {
  id: string;
  type: 'image' | 'file' | 'voice';
  url: string;
  name: string;
  size?: number;
  mimeType?: string;
}

// Chat / Conversation Types
export interface Chat {
  id: string;
  participants: User[];
  messages: Message[];
  unreadCount: number;
  lastMessage?: Message;
  isTyping: boolean;
  typingUserId?: string;
  isPinned?: boolean;
  isMuted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Match / Discovery Types
export interface Match {
  id: string;
  user: User;
  matchedAt: Date;
  isNew?: boolean;
}

export interface DiscoveryProfile {
  id: string;
  user: User;
  action?: 'like' | 'dislike' | 'superlike';
}

// Auth Types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  age: number;
  bio: string;
}

// Settings Types
export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  notifications: boolean;
  soundEnabled: boolean;
  showReadReceipts: boolean;
  showTypingIndicators: boolean;
  fontSize: 'small' | 'medium' | 'large';
  language: string;
}

// Socket Event Types
export interface SocketEvents {
  'message:send': (message: Message) => void;
  'message:receive': (message: Message) => void;
  'message:status': (data: { messageId: string; status: MessageStatus }) => void;
  'message:reaction': (data: { messageId: string; reaction: Reaction }) => void;
  'typing:start': (data: { chatId: string; userId: string }) => void;
  'typing:stop': (data: { chatId: string; userId: string }) => void;
  'user:online': (data: { userId: string }) => void;
  'user:offline': (data: { userId: string; lastSeen: Date }) => void;
  'match:new': (match: Match) => void;
}

// UI Types
export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}
