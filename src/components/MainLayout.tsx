/**
 * TwinLink - Main Layout
 * Contains bottom navigation and renders active tab content
 */

import { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Home, Heart, MessageCircle, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore, useAuthStore, useChatStore } from '../lib/store';
import { useMediaQuery } from '../hooks';

// Tab Components
import DiscoverScreen from './discover/DiscoverScreen';
import MessagesScreen from './messages/MessagesScreen';
import MatchesScreen from './matches/MatchesScreen';
import ProfileScreen from './profile/ProfileScreen';
import SettingsScreen from './settings/SettingsScreen';
import ChatWindow from './messages/ChatWindow';

const tabs = [
  { id: 'discover' as const, label: 'Home', icon: Home, path: '/' },
  { id: 'matches' as const, label: 'Likes', icon: Heart, path: '/matches' },
  { id: 'messages' as const, label: 'Messages', icon: MessageCircle, path: '/messages' },
  { id: 'profile' as const, label: 'Account', icon: User, path: '/profile' },
];

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeTab, setActiveTab } = useUIStore();
  const { user } = useAuthStore();
  const { chats } = useChatStore();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // Calculate total unread count
  const totalUnread = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  // Sync active tab with route
  useEffect(() => {
    const path = location.pathname;
    const tab = tabs.find(t => t.path === path || path.startsWith(t.path + '/'));
    if (tab) {
      setActiveTab(tab.id);
    }
  }, [location.pathname, setActiveTab]);

  const handleTabClick = (tab: typeof tabs[0]) => {
    setActiveTab(tab.id);
    navigate(tab.path);
  };

  return (
    <div className="h-full w-full flex">
      {/* Desktop Sidebar */}
      {isDesktop && (
        <aside className="w-72 bg-dark-card border-r border-white/5 flex flex-col">
          {/* Logo */}
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="text-xl font-bold text-gradient">TwinLink</span>
          </div>

          {/* User Mini Profile */}
          {user && (
            <div className="px-4 pb-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-surface/50">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{user.name}</p>
                  <p className="text-xs text-white/50 truncate">{user.email}</p>
                </div>
                <div className="status-dot-online" />
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-primary/20 text-primary' 
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    {tab.id === 'messages' && totalUnread > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-secondary rounded-full 
                        text-[10px] font-bold flex items-center justify-center text-white">
                        {totalUnread > 9 ? '9+' : totalUnread}
                      </span>
                    )}
                  </div>
                  <span className="font-medium">{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 text-xs text-white/30 text-center">
            TwinLink v1.0.0
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<DiscoverScreen />} />
            <Route path="/matches" element={<MatchesScreen />} />
            <Route path="/messages" element={<MessagesScreen />} />
            <Route path="/messages/:chatId" element={<ChatWindow />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
          </Routes>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      {!isDesktop && (
        <nav className="absolute bottom-0 left-0 right-0 bg-dark-card/95 backdrop-blur-xl 
          border-t border-white/5 z-50">
          <div className="flex items-center justify-around py-2 px-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab)}
                  className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-all duration-200
                    ${isActive ? 'text-primary' : 'text-white/40 hover:text-white/70'}`}
                  aria-label={tab.label}
                >
                  <div className="relative">
                    <Icon 
                      className="w-5 h-5 transition-transform duration-200" 
                      strokeWidth={isActive ? 2.5 : 1.5}
                    />
                    {tab.id === 'messages' && totalUnread > 0 && (
                      <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-secondary rounded-full 
                        text-[9px] font-bold flex items-center justify-center text-white animate-pulse">
                        {totalUnread > 9 ? '9+' : totalUnread}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium">{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="mobileActiveTab"
                      className="absolute -bottom-2 w-8 h-0.5 rounded-full gradient-primary"
                    />
                  )}
                </button>
              );
            })}
          </div>
          {/* Safe area padding for mobile */}
          <div className="h-safe-area-inset-bottom" />
        </nav>
      )}
    </div>
  );
}
