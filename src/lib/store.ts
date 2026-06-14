/**
 * TwinLink - Global State Management (Zustand)
 * Centralized state for auth, chats, messages, matches, and settings
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  User,
  Chat,
  Message,
  Match,
  AuthState,
  AppSettings,
  LoginCredentials,
  RegisterCredentials,
  MessageStatus,
  Reaction,
} from '../types';
import { generateId, formatLastSeen } from '../utils';

// ─── Auth Store ───────────────────────────────────────────────────────────────

interface AuthStore extends AuthState {
  pendingEmail: string | null;
  pendingUserId: string | null;
  requiresVerification: boolean;
  token: string | null;

  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendCode: (email: string) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  clearError: () => void;
  clearVerification: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      pendingEmail: null,
      pendingUserId: null,
      requiresVerification: false,
      token: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null, requiresVerification: false });
        try {
          // In production, this calls your backend API
          // For demo, simulate the flow
          await new Promise(resolve => setTimeout(resolve, 1000));

          if (credentials.email === 'demo@twinlink.com' && credentials.password === 'demo123') {
            const user: User = {
              id: 'current-user',
              name: 'Alex Johnson',
              age: 28,
              email: credentials.email,
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
              bio: 'Coffee lover ☕ | Travel enthusiast ✈️ | Looking for someone to explore the city with',
              distance: '0 miles',
              isOnline: true,
              lastSeen: new Date(),
              interests: ['Travel', 'Coffee', 'Photography', 'Hiking', 'Music'],
              photos: [
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face',
              ],
              job: 'Software Engineer',
              location: 'San Francisco, CA',
            };
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false,
              requiresVerification: false,
              pendingEmail: null,
              token: 'demo-jwt-token',
            });
          } else {
            throw new Error('Invalid email or password');
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false 
          });
        }
      },

      register: async (credentials) => {
        set({ isLoading: true, error: null, requiresVerification: false });
        try {
          await new Promise(resolve => setTimeout(resolve, 1500));

          set({
            pendingEmail: credentials.email,
            pendingUserId: generateId(),
            requiresVerification: true,
            isLoading: false,
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false 
          });
        }
      },

      verifyEmail: async (email, code) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));

          if (code.length !== 6 || !/^\d{6}$/.test(code)) {
            throw new Error('Invalid verification code');
          }

          const user: User = {
            id: 'current-user',
            name: 'New User',
            age: 25,
            email: email,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent('New User')}&background=random`,
            bio: 'New to TwinLink!',
            distance: '0 miles',
            isOnline: true,
            lastSeen: new Date(),
            interests: [],
            photos: [],
          };

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            requiresVerification: false,
            pendingEmail: null,
            pendingUserId: null,
            token: 'verified-jwt-token',
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Verification failed',
            isLoading: false,
          });
        }
      },

      resendCode: async (email) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          set({ isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to resend code',
            isLoading: false,
          });
        }
      },

      googleLogin: async (googleToken: string) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));

          // In production, verify token with backend
          // For demo, create user from Google data
          const user: User = {
            id: 'google-user',
            name: 'Google User',
            age: 25,
            email: 'user@gmail.com',
            avatar: 'https://ui-avatars.com/api/?name=Google+User&background=random',
            bio: 'Signed in with Google',
            distance: '0 miles',
            isOnline: true,
            lastSeen: new Date(),
            interests: [],
            photos: [],
          };

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            token: googleToken,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Google login failed',
            isLoading: false,
          });
        }
      },

      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false, 
          error: null,
          requiresVerification: false,
          pendingEmail: null,
          pendingUserId: null,
          token: null,
        });
        useChatStore.getState().clearChats();
        useMatchStore.getState().clearMatches();
      },

      updateUser: (updates) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updates } });
        }
      },

      clearError: () => set({ error: null }),

      clearVerification: () => set({ 
        requiresVerification: false, 
        pendingEmail: null, 
        pendingUserId: null 
      }),
    }),
    {
      name: 'twinlink-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        token: state.token,
      }),
    }
  )
);

// ─── Chat Store ───────────────────────────────────────────────────────────────

interface ChatStore {
  chats: Chat[];
  activeChatId: string | null;
  isLoading: boolean;
  error: string | null;

  setActiveChat: (chatId: string | null) => void;
  sendMessage: (chatId: string, content: string, type?: Message['type']) => Promise<void>;
  receiveMessage: (message: Message) => void;
  updateMessageStatus: (messageId: string, status: MessageStatus) => void;
  addReaction: (messageId: string, emoji: string) => void;
  removeReaction: (messageId: string, emoji: string) => void;
  editMessage: (messageId: string, newContent: string) => void;
  deleteMessage: (messageId: string) => void;
  setTyping: (chatId: string, isTyping: boolean, userId?: string) => void;
  markAsRead: (chatId: string) => void;
  pinChat: (chatId: string) => void;
  muteChat: (chatId: string) => void;
  clearChats: () => void;
  initializeDemoChats: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [],
      activeChatId: null,
      isLoading: false,
      error: null,

      setActiveChat: (chatId) => {
        set({ activeChatId: chatId });
        if (chatId) {
          get().markAsRead(chatId);
        }
      },

      sendMessage: async (chatId, content, type = 'text') => {
        const messageId = generateId();
        const newMessage: Message = {
          id: messageId,
          chatId,
          senderId: 'current-user',
          content: content.trim(),
          timestamp: new Date(),
          status: 'sending',
          type,
        };

        set(state => ({
          chats: state.chats.map(chat => {
            if (chat.id === chatId) {
              return {
                ...chat,
                messages: [...chat.messages, newMessage],
                lastMessage: newMessage,
                updatedAt: new Date(),
              };
            }
            return chat;
          }),
        }));

        await new Promise(resolve => setTimeout(resolve, 500));
        get().updateMessageStatus(messageId, 'sent');

        await new Promise(resolve => setTimeout(resolve, 800));
        get().updateMessageStatus(messageId, 'delivered');

        await new Promise(resolve => setTimeout(resolve, 1500));
        get().updateMessageStatus(messageId, 'read');

        setTimeout(() => {
          get().simulateReply(chatId);
        }, 3000);
      },

      simulateReply: (chatId: string) => {
        const chat = get().chats.find(c => c.id === chatId);
        if (!chat) return;

        const otherUser = chat.participants.find(p => p.id !== 'current-user');
        if (!otherUser) return;

        const replies = [
          "That sounds amazing! Tell me more about it.",
          "Haha, I totally agree! 😄",
          "I'd love to do that sometime!",
          "Wow, that's really interesting!",
          "Same here! We should plan something together.",
          "Really? That's so cool!",
          "I'm free this weekend if you want to meet up!",
          "Thanks for sharing that with me! 💕",
        ];

        const replyMessage: Message = {
          id: generateId(),
          chatId,
          senderId: otherUser.id,
          content: replies[Math.floor(Math.random() * replies.length)],
          timestamp: new Date(),
          status: 'read',
          type: 'text',
        };

        set(state => ({
          chats: state.chats.map(c => {
            if (c.id === chatId) {
              return {
                ...c,
                messages: [...c.messages, replyMessage],
                lastMessage: replyMessage,
                updatedAt: new Date(),
                unreadCount: c.id === get().activeChatId ? 0 : c.unreadCount + 1,
              };
            }
            return c;
          }),
        }));
      },

      receiveMessage: (message) => {
        set(state => ({
          chats: state.chats.map(chat => {
            if (chat.id === message.chatId) {
              const isActive = chat.id === get().activeChatId;
              return {
                ...chat,
                messages: [...chat.messages, message],
                lastMessage: message,
                updatedAt: new Date(),
                unreadCount: isActive ? 0 : chat.unreadCount + 1,
              };
            }
            return chat;
          }),
        }));
      },

      updateMessageStatus: (messageId, status) => {
        set(state => ({
          chats: state.chats.map(chat => ({
            ...chat,
            messages: chat.messages.map(msg =>
              msg.id === messageId ? { ...msg, status } : msg
            ),
          })),
        }));
      },

      addReaction: (messageId, emoji) => {
        set(state => ({
          chats: state.chats.map(chat => ({
            ...chat,
            messages: chat.messages.map(msg => {
              if (msg.id === messageId) {
                const reactions = msg.reactions || [];
                const existingIndex = reactions.findIndex(
                  r => r.userId === 'current-user' && r.emoji === emoji
                );
                if (existingIndex >= 0) {
                  return {
                    ...msg,
                    reactions: reactions.filter((_, i) => i !== existingIndex),
                  };
                }
                return {
                  ...msg,
                  reactions: [...reactions, { emoji, userId: 'current-user' }],
                };
              }
              return msg;
            }),
          })),
        }));
      },

      removeReaction: (messageId, emoji) => {
        set(state => ({
          chats: state.chats.map(chat => ({
            ...chat,
            messages: chat.messages.map(msg => {
              if (msg.id === messageId && msg.reactions) {
                return {
                  ...msg,
                  reactions: msg.reactions.filter(
                    r => !(r.userId === 'current-user' && r.emoji === emoji)
                  ),
                };
              }
              return msg;
            }),
          })),
        }));
      },

      editMessage: (messageId, newContent) => {
        set(state => ({
          chats: state.chats.map(chat => ({
            ...chat,
            messages: chat.messages.map(msg =>
              msg.id === messageId
                ? { ...msg, content: newContent, edited: true, editedAt: new Date() }
                : msg
            ),
          })),
        }));
      },

      deleteMessage: (messageId) => {
        set(state => ({
          chats: state.chats.map(chat => ({
            ...chat,
            messages: chat.messages.filter(msg => msg.id !== messageId),
          })),
        }));
      },

      setTyping: (chatId, isTyping, userId) => {
        set(state => ({
          chats: state.chats.map(chat =>
            chat.id === chatId
              ? { ...chat, isTyping, typingUserId: isTyping ? userId : undefined }
              : chat
          ),
        }));
      },

      markAsRead: (chatId) => {
        set(state => ({
          chats: state.chats.map(chat =>
            chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
          ),
        }));
      },

      pinChat: (chatId) => {
        set(state => ({
          chats: state.chats.map(chat =>
            chat.id === chatId ? { ...chat, isPinned: !chat.isPinned } : chat
          ),
        }));
      },

      muteChat: (chatId) => {
        set(state => ({
          chats: state.chats.map(chat =>
            chat.id === chatId ? { ...chat, isMuted: !chat.isMuted } : chat
          ),
        }));
      },

      clearChats: () => set({ chats: [], activeChatId: null }),

      initializeDemoChats: () => {
        const demoUsers: User[] = [
          {
            id: 'user-sarah',
            name: 'Sarah',
            age: 24,
            email: 'sarah@example.com',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
            bio: 'Coffee lover ☕ | Travel enthusiast ✈️ | Looking for someone to explore the city with',
            distance: '2 miles away',
            isOnline: true,
            lastSeen: new Date(),
            interests: ['Travel', 'Coffee', 'Photography'],
            photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop&crop=face'],
          },
          {
            id: 'user-jessica',
            name: 'Jessica',
            age: 26,
            email: 'jessica@example.com',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
            bio: 'Art lover 🎨 | Yoga instructor 🧘‍♀️ | Cat mom 🐱',
            distance: '5 miles away',
            isOnline: false,
            lastSeen: new Date(Date.now() - 3600000),
            interests: ['Art', 'Yoga', 'Animals'],
            photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face'],
          },
          {
            id: 'user-emma',
            name: 'Emma',
            age: 23,
            email: 'emma@example.com',
            avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=face',
            bio: 'Foodie 🍕 | Hiker 🥾 | Always up for an adventure',
            distance: '1 mile away',
            isOnline: true,
            lastSeen: new Date(),
            interests: ['Food', 'Hiking', 'Adventure'],
            photos: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&crop=face'],
          },
        ];

        const demoMessages: Record<string, Message[]> = {
          'chat-sarah': [
            {
              id: generateId(),
              chatId: 'chat-sarah',
              senderId: 'user-sarah',
              content: 'Hey! How are you?',
              timestamp: new Date(Date.now() - 86400000),
              status: 'read',
              type: 'text',
            },
            {
              id: generateId(),
              chatId: 'chat-sarah',
              senderId: 'current-user',
              content: "I'm great! Just got back from hiking 🥾",
              timestamp: new Date(Date.now() - 85000000),
              status: 'read',
              type: 'text',
            },
            {
              id: generateId(),
              chatId: 'chat-sarah',
              senderId: 'user-sarah',
              content: 'That sounds amazing! Where did you go?',
              timestamp: new Date(Date.now() - 84000000),
              status: 'read',
              type: 'text',
            },
            {
              id: generateId(),
              chatId: 'chat-sarah',
              senderId: 'current-user',
              content: 'Mount Tamalpais! The view was incredible',
              timestamp: new Date(Date.now() - 83000000),
              status: 'read',
              type: 'text',
            },
          ],
          'chat-jessica': [
            {
              id: generateId(),
              chatId: 'chat-jessica',
              senderId: 'user-jessica',
              content: 'Love your profile! 💕',
              timestamp: new Date(Date.now() - 172800000),
              status: 'read',
              type: 'text',
            },
          ],
          'chat-emma': [
            {
              id: generateId(),
              chatId: 'chat-emma',
              senderId: 'user-emma',
              content: 'Are you free this weekend?',
              timestamp: new Date(Date.now() - 259200000),
              status: 'read',
              type: 'text',
            },
          ],
        };

        const chats: Chat[] = demoUsers.map((user, index) => {
          const chatId = `chat-${user.id.replace('user-', '')}`;
          const messages = demoMessages[chatId] || [];
          const lastMessage = messages[messages.length - 1];

          return {
            id: chatId,
            participants: [user, {
              id: 'current-user',
              name: 'Alex Johnson',
              age: 28,
              email: 'demo@twinlink.com',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
              bio: 'Coffee lover ☕ | Travel enthusiast ✈️',
              distance: '0 miles',
              isOnline: true,
              lastSeen: new Date(),
              interests: ['Travel', 'Coffee', 'Photography'],
              photos: [],
            }],
            messages,
            unreadCount: index === 0 ? 0 : 1,
            lastMessage,
            isTyping: false,
            isPinned: index === 0,
            isMuted: false,
            createdAt: new Date(Date.now() - 604800000),
            updatedAt: lastMessage?.timestamp || new Date(),
          };
        });

        set({ chats });
      },
    }),
    {
      name: 'twinlink-chats',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ chats: state.chats }),
    }
  )
);

// ─── Match Store ──────────────────────────────────────────────────────────────

interface MatchStore {
  matches: Match[];
  currentProfileIndex: number;

  addMatch: (match: Match) => void;
  removeMatch: (matchId: string) => void;
  setCurrentProfileIndex: (index: number) => void;
  clearMatches: () => void;
  initializeDemoMatches: () => void;
}

export const useMatchStore = create<MatchStore>()(
  persist(
    (set, get) => ({
      matches: [],
      currentProfileIndex: 0,

      addMatch: (match) => {
        set(state => ({
          matches: [match, ...state.matches],
        }));
      },

      removeMatch: (matchId) => {
        set(state => ({
          matches: state.matches.filter(m => m.id !== matchId),
        }));
      },

      setCurrentProfileIndex: (index) => set({ currentProfileIndex: index }),

      clearMatches: () => set({ matches: [], currentProfileIndex: 0 }),

      initializeDemoMatches: () => {
        const demoMatches: Match[] = [
          {
            id: 'match-sarah',
            user: {
              id: 'user-sarah',
              name: 'Sarah',
              age: 24,
              email: 'sarah@example.com',
              avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
              bio: 'Coffee lover ☕ | Travel enthusiast ✈️',
              distance: '2 miles away',
              isOnline: true,
              lastSeen: new Date(),
              interests: ['Travel', 'Coffee', 'Photography'],
              photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop&crop=face'],
            },
            matchedAt: new Date(Date.now() - 86400000),
          },
          {
            id: 'match-jessica',
            user: {
              id: 'user-jessica',
              name: 'Jessica',
              age: 26,
              email: 'jessica@example.com',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
              bio: 'Art lover 🎨 | Yoga instructor 🧘‍♀️',
              distance: '5 miles away',
              isOnline: false,
              lastSeen: new Date(Date.now() - 3600000),
              interests: ['Art', 'Yoga', 'Animals'],
              photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face'],
            },
            matchedAt: new Date(Date.now() - 172800000),
          },
          {
            id: 'match-emma',
            user: {
              id: 'user-emma',
              name: 'Emma',
              age: 23,
              email: 'emma@example.com',
              avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=face',
              bio: 'Foodie 🍕 | Hiker 🥾 | Always up for an adventure',
              distance: '1 mile away',
              isOnline: true,
              lastSeen: new Date(),
              interests: ['Food', 'Hiking', 'Adventure'],
              photos: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&crop=face'],
            },
            matchedAt: new Date(Date.now() - 259200000),
          },
        ];
        set({ matches: demoMatches });
      },
    }),
    {
      name: 'twinlink-matches',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ matches: state.matches }),
    }
  )
);

// ─── Settings Store ───────────────────────────────────────────────────────────

interface SettingsStore {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  notifications: true,
  soundEnabled: true,
  showReadReceipts: true,
  showTypingIndicators: true,
  fontSize: 'medium',
  language: 'en',
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,

      updateSettings: (newSettings) => {
        set(state => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      resetSettings: () => set({ settings: defaultSettings }),
    }),
    {
      name: 'twinlink-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ─── Discovery Store ──────────────────────────────────────────────────────────

interface DiscoveryStore {
  profiles: User[];
  currentIndex: number;

  nextProfile: () => void;
  likeProfile: () => void;
  dislikeProfile: () => void;
  superLikeProfile: () => void;
  resetProfiles: () => void;
  initializeDemoProfiles: () => void;
}

export const useDiscoveryStore = create<DiscoveryStore>()(
  (set, get) => ({
    profiles: [],
    currentIndex: 0,

    nextProfile: () => {
      set(state => ({ currentIndex: state.currentIndex + 1 }));
    },

    likeProfile: () => {
      const { profiles, currentIndex } = get();
      const profile = profiles[currentIndex];
      if (profile) {
        const match: Match = {
          id: `match-${profile.id}`,
          user: profile,
          matchedAt: new Date(),
          isNew: true,
        };
        useMatchStore.getState().addMatch(match);
      }
      set(state => ({ currentIndex: state.currentIndex + 1 }));
    },

    dislikeProfile: () => {
      set(state => ({ currentIndex: state.currentIndex + 1 }));
    },

    superLikeProfile: () => {
      const { profiles, currentIndex } = get();
      const profile = profiles[currentIndex];
      if (profile) {
        const match: Match = {
          id: `match-${profile.id}`,
          user: profile,
          matchedAt: new Date(),
          isNew: true,
        };
        useMatchStore.getState().addMatch(match);
      }
      set(state => ({ currentIndex: state.currentIndex + 1 }));
    },

    resetProfiles: () => set({ currentIndex: 0 }),

    initializeDemoProfiles: () => {
      const demoProfiles: User[] = [
        {
          id: 'profile-1',
          name: 'Sarah',
          age: 24,
          email: 'sarah@example.com',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop&crop=face',
          bio: 'Coffee lover ☕ | Travel enthusiast ✈️ | Looking for someone to explore the city with',
          distance: '2 miles away',
          isOnline: true,
          lastSeen: new Date(),
          interests: ['Travel', 'Coffee', 'Photography'],
          photos: [
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop&crop=face',
          ],
        },
        {
          id: 'profile-2',
          name: 'Jessica',
          age: 26,
          email: 'jessica@example.com',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face',
          bio: 'Art lover 🎨 | Yoga instructor 🧘‍♀️ | Cat mom 🐱',
          distance: '5 miles away',
          isOnline: false,
          lastSeen: new Date(Date.now() - 3600000),
          interests: ['Art', 'Yoga', 'Animals'],
          photos: [
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop&crop=face',
          ],
        },
        {
          id: 'profile-3',
          name: 'Emma',
          age: 23,
          email: 'emma@example.com',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&crop=face',
          bio: 'Foodie 🍕 | Hiker 🥾 | Always up for an adventure',
          distance: '1 mile away',
          isOnline: true,
          lastSeen: new Date(),
          interests: ['Food', 'Hiking', 'Adventure'],
          photos: [
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=600&fit=crop&crop=face',
          ],
        },
        {
          id: 'profile-4',
          name: 'Olivia',
          age: 25,
          email: 'olivia@example.com',
          avatar: 'https://images.unsplash.com/photo-1523264939339-c89f9dadde2e?w=400&h=600&fit=crop&crop=face',
          bio: 'Bookworm 📚 | Wine enthusiast 🍷 | Dog lover 🐕',
          distance: '3 miles away',
          isOnline: true,
          lastSeen: new Date(),
          interests: ['Reading', 'Wine', 'Dogs'],
          photos: [
            'https://images.unsplash.com/photo-1523264939339-c89f9dadde2e?w=400&h=600&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face',
          ],
        },
        {
          id: 'profile-5',
          name: 'Sophia',
          age: 27,
          email: 'sophia@example.com',
          avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=600&fit=crop&crop=face',
          bio: 'Musician 🎸 | Dancer 💃 | Night owl 🦉',
          distance: '8 miles away',
          isOnline: false,
          lastSeen: new Date(Date.now() - 7200000),
          interests: ['Music', 'Dancing', 'Nightlife'],
          photos: [
            'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=600&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=600&fit=crop&crop=face',
          ],
        },
      ];
      set({ profiles: demoProfiles, currentIndex: 0 });
    },
  })
);

// ─── UI Store ─────────────────────────────────────────────────────────────────

interface UIStore {
  isMobileMenuOpen: boolean;
  activeTab: 'discover' | 'messages' | 'matches' | 'profile';
  showEmojiPicker: boolean;
  showAttachmentMenu: boolean;
  selectedMessageId: string | null;
  isEditingMessage: boolean;

  setMobileMenuOpen: (open: boolean) => void;
  setActiveTab: (tab: UIStore['activeTab']) => void;
  setShowEmojiPicker: (show: boolean) => void;
  setShowAttachmentMenu: (show: boolean) => void;
  setSelectedMessageId: (id: string | null) => void;
  setIsEditingMessage: (editing: boolean) => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  isMobileMenuOpen: false,
  activeTab: 'discover',
  showEmojiPicker: false,
  showAttachmentMenu: false,
  selectedMessageId: null,
  isEditingMessage: false,

  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setShowEmojiPicker: (show) => set({ showEmojiPicker: show }),
  setShowAttachmentMenu: (show) => set({ showAttachmentMenu: show }),
  setSelectedMessageId: (id) => set({ selectedMessageId: id }),
  setIsEditingMessage: (editing) => set({ isEditingMessage: editing }),
}));
