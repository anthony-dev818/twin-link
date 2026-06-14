/**
 * TwinLink - Matches Screen
 * Shows all matched/liked users with grid layout
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, MapPin, Clock } from 'lucide-react';
import { useMatchStore, useChatStore } from '../../lib/store';
import { formatRelativeTime } from '../../utils';

export default function MatchesScreen() {
  const navigate = useNavigate();
  const { matches } = useMatchStore();
  const { chats, setActiveChat } = useChatStore();

  const handleMessage = useCallback((userId: string) => {
    // Find or create chat with this user
    const existingChat = chats.find(c => 
      c.participants.some(p => p.id === userId)
    );

    if (existingChat) {
      setActiveChat(existingChat.id);
      navigate(`/messages/${existingChat.id}`);
    } else {
      // In a real app, create a new chat here
      // For now, show a toast or navigate to messages
      navigate('/messages');
    }
  }, [chats, setActiveChat, navigate]);

  if (matches.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Heart className="w-10 h-10 text-primary/50" />
        </div>
        <h2 className="text-xl font-bold mb-2">No matches yet</h2>
        <p className="text-white/50 mb-6 max-w-xs">
          Start swiping on the Discover tab to find your perfect match!
        </p>
        <button
          onClick={() => navigate('/')}
          className="btn-primary"
        >
          Start Swiping
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-dark">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <h1 className="text-xl font-bold">Your Matches</h1>
        <p className="text-sm text-white/50 mt-1">
          {matches.length} {matches.length === 1 ? 'person' : 'people'} liked you back
        </p>
      </div>

      {/* Matches Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {matches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="relative rounded-2xl overflow-hidden bg-dark-surface group cursor-pointer"
              onClick={() => handleMessage(match.user.id)}
            >
              {/* Photo */}
              <div className="aspect-[3/4] relative">
                <img
                  src={match.user.avatar}
                  alt={match.user.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* New badge */}
                {match.isNew && (
                  <div className="absolute top-3 left-3 px-2 py-0.5 bg-secondary rounded-full">
                    <span className="text-[10px] font-bold text-white">NEW</span>
                  </div>
                )}

                {/* Online status */}
                {match.user.isOnline && (
                  <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-emerald-400 border-2 border-dark" />
                )}

                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="font-semibold text-sm">{match.user.name}, {match.user.age}</h3>
                  <div className="flex items-center gap-1 text-white/50 text-xs mt-0.5">
                    <MapPin className="w-3 h-3" />
                    <span>{match.user.distance}</span>
                  </div>
                  <div className="flex items-center gap-1 text-white/30 text-xs mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>Matched {formatRelativeTime(new Date(match.matchedAt))}</span>
                  </div>
                </div>
              </div>

              {/* Message button overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity
                flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMessage(match.user.id);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-primary rounded-xl text-sm font-semibold
                    hover:bg-primary-dark transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Message
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
