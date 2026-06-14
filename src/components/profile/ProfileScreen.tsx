/**
 * TwinLink - Profile Screen
 * User profile view and editing
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Settings, MapPin, Briefcase, Heart, Camera,
  Edit3, LogOut, ChevronRight, Star, Shield
} from 'lucide-react';
import { useAuthStore } from '../../lib/store';
import { getInitials, getAvatarColor } from '../../utils';

export default function ProfileScreen() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    job: user?.job || '',
    location: user?.location || '',
  });

  const handleSave = useCallback(() => {
    updateUser({
      name: editForm.name,
      bio: editForm.bio,
      job: editForm.job,
      location: editForm.location,
    });
    setIsEditing(false);
  }, [editForm, updateUser]);

  const handleLogout = useCallback(() => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/login');
    }
  }, [logout, navigate]);

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-white/40">Please log in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-dark overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors lg:hidden"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Profile</h1>
        <button
          onClick={() => navigate('/settings')}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5 text-white/60" />
        </button>
      </div>

      {/* Profile Card */}
      <div className="px-4 pb-4">
        <div className="bg-dark-surface rounded-2xl p-6 text-center">
          {/* Avatar */}
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden mx-auto ring-4 ring-primary/20">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center text-2xl font-bold ${getAvatarColor(user.id)}`}>
                  {getInitials(user.name)}
                </div>
              )}
            </div>
            <button
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center
                shadow-lg hover:bg-primary-dark transition-colors"
              aria-label="Change photo"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
            <div className="absolute bottom-1 left-1 w-4 h-4 bg-dark rounded-full flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
          </div>

          {/* Name & Age */}
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                className="input-field text-center"
                placeholder="Your name"
              />
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                className="input-field text-center resize-none"
                rows={3}
                placeholder="Your bio"
              />
              <input
                type="text"
                value={editForm.job}
                onChange={(e) => setEditForm(prev => ({ ...prev, job: e.target.value }))}
                className="input-field text-center"
                placeholder="Job title"
              />
              <input
                type="text"
                value={editForm.location}
                onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                className="input-field text-center"
                placeholder="Location"
              />
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleSave}
                  className="btn-primary text-sm px-6"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm({
                      name: user.name,
                      bio: user.bio,
                      job: user.job || '',
                      location: user.location || '',
                    });
                  }}
                  className="btn-secondary text-sm px-6"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold">{user.name}, {user.age}</h2>
              <p className="text-white/50 text-sm mt-1">{user.email}</p>

              {/* Bio */}
              <p className="text-white/70 text-sm mt-3 max-w-xs mx-auto">{user.bio}</p>

              {/* Details */}
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {user.job && (
                  <div className="flex items-center gap-1 text-white/50 text-xs">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{user.job}</span>
                  </div>
                )}
                {user.location && (
                  <div className="flex items-center gap-1 text-white/50 text-xs">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{user.location}</span>
                  </div>
                )}
              </div>

              {/* Edit button */}
              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 flex items-center gap-2 mx-auto text-primary text-sm hover:underline"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-dark-surface rounded-xl p-4 text-center">
            <Heart className="w-5 h-5 text-secondary mx-auto mb-1" />
            <p className="text-lg font-bold">24</p>
            <p className="text-xs text-white/40">Likes</p>
          </div>
          <div className="bg-dark-surface rounded-xl p-4 text-center">
            <Star className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <p className="text-lg font-bold">12</p>
            <p className="text-xs text-white/40">Matches</p>
          </div>
          <div className="bg-dark-surface rounded-xl p-4 text-center">
            <Shield className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <p className="text-lg font-bold">100%</p>
            <p className="text-xs text-white/40">Verified</p>
          </div>
        </div>
      </div>

      {/* Interests */}
      <div className="px-4 pb-4">
        <h3 className="text-sm font-semibold text-white/60 mb-3">Interests</h3>
        <div className="flex flex-wrap gap-2">
          {user.interests.map(interest => (
            <span
              key={interest}
              className="px-3 py-1.5 bg-dark-surface rounded-full text-sm text-white/70"
            >
              {interest}
            </span>
          ))}
          <button className="px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary">
            + Add
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 pb-4 space-y-2">
        <button
          onClick={() => navigate('/settings')}
          className="w-full flex items-center justify-between p-4 bg-dark-surface rounded-xl hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-white/50" />
            <span className="text-sm">Settings</span>
          </div>
          <ChevronRight className="w-4 h-4 text-white/30" />
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-4 bg-red-500/10 rounded-xl hover:bg-red-500/20 transition-colors text-red-400"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Log Out</span>
        </button>
      </div>

      {/* Version */}
      <div className="text-center pb-8 pt-4">
        <p className="text-xs text-white/20">TwinLink v1.0.0</p>
      </div>
    </div>
  );
}
