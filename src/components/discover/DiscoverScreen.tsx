/**
 * TwinLink - Discover Screen
 * Tinder-style card swiping for matching with profiles
 */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { X, Star, Heart, MapPin, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDiscoveryStore, useMatchStore } from '../../lib/store';
import type { User } from '../../types';

const SWIPE_THRESHOLD = 100;
const SWIPE_VELOCITY = 500;

export default function DiscoverScreen() {
  const { profiles, currentIndex, nextProfile, likeProfile, dislikeProfile, superLikeProfile, initializeDemoProfiles } = useDiscoveryStore();
  const { matches } = useMatchStore();
  const [direction, setDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const controls = useAnimation();

  // Initialize profiles on mount
  useEffect(() => {
    if (profiles.length === 0) {
      initializeDemoProfiles();
    }
  }, [profiles.length, initializeDemoProfiles]);

  const currentProfile = profiles[currentIndex];

  const handleDragEnd = useCallback((_: unknown, info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }) => {
    const offsetX = info.offset.x;
    const offsetY = info.offset.y;
    const velocityX = info.velocity.x;
    const velocityY = info.velocity.y;

    if (offsetY < -SWIPE_THRESHOLD || velocityY < -SWIPE_VELOCITY) {
      // Super like (swipe up)
      setDirection('up');
      controls.start({ y: -500, opacity: 0, transition: { duration: 0.3 } });
      setTimeout(() => {
        superLikeProfile();
        setDirection(null);
        setShowInfo(false);
        setCurrentPhotoIndex(0);
        controls.set({ x: 0, y: 0, opacity: 1, rotate: 0 });
      }, 300);
    } else if (offsetX > SWIPE_THRESHOLD || velocityX > SWIPE_VELOCITY) {
      // Like (swipe right)
      setDirection('right');
      controls.start({ x: 500, opacity: 0, transition: { duration: 0.3 } });
      setTimeout(() => {
        likeProfile();
        setDirection(null);
        setShowInfo(false);
        setCurrentPhotoIndex(0);
        controls.set({ x: 0, y: 0, opacity: 1, rotate: 0 });
      }, 300);
    } else if (offsetX < -SWIPE_THRESHOLD || velocityX < -SWIPE_VELOCITY) {
      // Dislike (swipe left)
      setDirection('left');
      controls.start({ x: -500, opacity: 0, transition: { duration: 0.3 } });
      setTimeout(() => {
        dislikeProfile();
        setDirection(null);
        setShowInfo(false);
        setCurrentPhotoIndex(0);
        controls.set({ x: 0, y: 0, opacity: 1, rotate: 0 });
      }, 300);
    } else {
      // Snap back
      controls.start({ x: 0, y: 0, rotate: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  }, [controls, likeProfile, dislikeProfile, superLikeProfile]);

  const handleAction = useCallback((action: 'like' | 'dislike' | 'superlike') => {
    if (action === 'like') {
      controls.start({ x: 500, opacity: 0, transition: { duration: 0.3 } });
      setTimeout(() => {
        likeProfile();
        setShowInfo(false);
        setCurrentPhotoIndex(0);
        controls.set({ x: 0, y: 0, opacity: 1, rotate: 0 });
      }, 300);
    } else if (action === 'dislike') {
      controls.start({ x: -500, opacity: 0, transition: { duration: 0.3 } });
      setTimeout(() => {
        dislikeProfile();
        setShowInfo(false);
        setCurrentPhotoIndex(0);
        controls.set({ x: 0, y: 0, opacity: 1, rotate: 0 });
      }, 300);
    } else {
      controls.start({ y: -500, opacity: 0, transition: { duration: 0.3 } });
      setTimeout(() => {
        superLikeProfile();
        setShowInfo(false);
        setCurrentPhotoIndex(0);
        controls.set({ x: 0, y: 0, opacity: 1, rotate: 0 });
      }, 300);
    }
  }, [controls, likeProfile, dislikeProfile, superLikeProfile]);

  const nextPhoto = useCallback(() => {
    if (currentProfile && currentPhotoIndex < currentProfile.photos.length - 1) {
      setCurrentPhotoIndex(prev => prev + 1);
    }
  }, [currentProfile, currentPhotoIndex]);

  const prevPhoto = useCallback(() => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(prev => prev - 1);
    }
  }, [currentPhotoIndex]);

  if (!currentProfile) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4">
          <Heart className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-xl font-bold mb-2">No more profiles</h2>
        <p className="text-white/50 mb-6">You've seen everyone for now. Check back later!</p>
        <button
          onClick={() => {
            initializeDemoProfiles();
            setCurrentPhotoIndex(0);
          }}
          className="btn-primary"
        >
          Refresh Profiles
        </button>

        {matches.length > 0 && (
          <div className="mt-8">
            <p className="text-white/50 text-sm mb-3">Your matches ({matches.length})</p>
            <div className="flex gap-2 justify-center">
              {matches.slice(0, 5).map(match => (
                <img
                  key={match.id}
                  src={match.user.avatar}
                  alt={match.user.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between p-4 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className="font-bold text-gradient">TwinLink</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="status-dot-online" />
          <span className="text-xs text-white/50">Online</span>
        </div>
      </div>

      {/* Card Stack */}
      <div className="flex-1 flex items-center justify-center px-4 pb-4">
        <div className="relative w-full max-w-sm aspect-[3/4.5]">
          <AnimatePresence mode="popLayout">
            {/* Next card (preview) */}
            {profiles[currentIndex + 1] && (
              <motion.div
                key={`next-${profiles[currentIndex + 1].id}`}
                className="absolute inset-0 rounded-3xl overflow-hidden bg-dark-surface"
                style={{ scale: 0.95, y: 10 }}
              >
                <img
                  src={profiles[currentIndex + 1].photos[0]}
                  alt={profiles[currentIndex + 1].name}
                  className="w-full h-full object-cover opacity-50"
                />
              </motion.div>
            )}

            {/* Current card */}
            <motion.div
              key={currentProfile.id}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.8}
              onDragEnd={handleDragEnd}
              animate={controls}
              style={{ x, y, rotate, opacity }}
              className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing"
              whileTap={{ cursor: 'grabbing' }}
            >
              {/* Photo */}
              <div className="relative w-full h-full">
                <img
                  src={currentProfile.photos[currentPhotoIndex]}
                  alt={currentProfile.name}
                  className="w-full h-full object-cover"
                  draggable={false}
                />

                {/* Photo Navigation */}
                {currentProfile.photos.length > 1 && (
                  <>
                    <button
                      onClick={prevPhoto}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 backdrop-blur-sm
                        hover:bg-black/50 transition-colors"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={nextPhoto}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 backdrop-blur-sm
                        hover:bg-black/50 transition-colors"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                    {/* Photo indicators */}
                    <div className="absolute top-4 left-4 right-4 flex gap-1">
                      {currentProfile.photos.map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i === currentPhotoIndex ? 'bg-white' : 'bg-white/30'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Like/Dislike stamps */}
                <motion.div
                  style={{ opacity: useTransform(x, [0, 150], [0, 1]) }}
                  className="absolute top-8 left-8 border-4 border-emerald-400 rounded-xl px-4 py-2 rotate-[-15deg]"
                >
                  <span className="text-emerald-400 font-bold text-2xl uppercase tracking-wider">LIKE</span>
                </motion.div>
                <motion.div
                  style={{ opacity: useTransform(x, [0, -150], [0, 1]) }}
                  className="absolute top-8 right-8 border-4 border-red-400 rounded-xl px-4 py-2 rotate-[15deg]"
                >
                  <span className="text-red-400 font-bold text-2xl uppercase tracking-wider">NOPE</span>
                </motion.div>

                {/* Profile Info */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {currentProfile.name}, {currentProfile.age}
                      </h2>
                      <div className="flex items-center gap-1 text-white/70 text-sm mt-1">
                        <MapPin className="w-4 h-4" />
                        <span>{currentProfile.distance}</span>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-400 text-sm mt-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>Online</span>
                      </div>

                      {/* Bio */}
                      <p className="text-white/70 text-sm mt-2 line-clamp-2">
                        {currentProfile.bio}
                      </p>

                      {/* Interests */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {currentProfile.interests.map(interest => (
                          <span
                            key={interest}
                            className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/80"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Info button */}
                    <button
                      onClick={() => setShowInfo(!showInfo)}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                      aria-label="Show more info"
                    >
                      <Info className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4 p-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleAction('dislike')}
          className="w-14 h-14 rounded-full bg-dark-surface border border-red-500/30 flex items-center justify-center
            hover:bg-red-500/10 transition-colors shadow-lg"
          aria-label="Dislike"
        >
          <X className="w-7 h-7 text-red-400" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleAction('superlike')}
          className="w-12 h-12 rounded-full bg-dark-surface border border-blue-400/30 flex items-center justify-center
            hover:bg-blue-400/10 transition-colors shadow-lg"
          aria-label="Super like"
        >
          <Star className="w-6 h-6 text-blue-400" fill="currentColor" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleAction('like')}
          className="w-14 h-14 rounded-full bg-dark-surface border border-emerald-500/30 flex items-center justify-center
            hover:bg-emerald-500/10 transition-colors shadow-lg"
          aria-label="Like"
        >
          <Heart className="w-7 h-7 text-emerald-400" fill="currentColor" />
        </motion.button>
      </div>
    </div>
  );
}
