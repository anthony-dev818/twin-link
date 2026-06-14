/**
 * TwinLink - Settings Screen
 * App settings, preferences, and account management
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Moon, Sun, Monitor, Bell, Volume2, Eye,
  Type, Globe, Shield, HelpCircle, ChevronRight, Trash2,
  LogOut, Check
} from 'lucide-react';
import { useAuthStore, useSettingsStore } from '../../lib/store';
import { useTheme } from '../../hooks';

export default function SettingsScreen() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { settings, updateSettings, resetSettings } = useSettingsStore();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = useCallback(() => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/login');
    }
  }, [logout, navigate]);

  const handleDeleteAccount = useCallback(() => {
    if (window.confirm('This will permanently delete your account. Are you sure?')) {
      logout();
      navigate('/login');
    }
  }, [logout, navigate]);

  const settingsSections = [
    {
      title: 'Appearance',
      items: [
        {
          icon: theme === 'dark' ? Moon : Sun,
          label: 'Theme',
          value: theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'System',
          action: toggleTheme,
          type: 'toggle' as const,
        },
        {
          icon: Type,
          label: 'Font Size',
          value: settings.fontSize,
          action: () => {
            const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];
            const currentIndex = sizes.indexOf(settings.fontSize);
            updateSettings({ fontSize: sizes[(currentIndex + 1) % sizes.length] });
          },
          type: 'select' as const,
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: Bell,
          label: 'Push Notifications',
          value: settings.notifications,
          action: () => updateSettings({ notifications: !settings.notifications }),
          type: 'switch' as const,
        },
        {
          icon: Volume2,
          label: 'Sound',
          value: settings.soundEnabled,
          action: () => updateSettings({ soundEnabled: !settings.soundEnabled }),
          type: 'switch' as const,
        },
      ],
    },
    {
      title: 'Privacy',
      items: [
        {
          icon: Eye,
          label: 'Read Receipts',
          value: settings.showReadReceipts,
          action: () => updateSettings({ showReadReceipts: !settings.showReadReceipts }),
          type: 'switch' as const,
        },
        {
          icon: Monitor,
          label: 'Typing Indicators',
          value: settings.showTypingIndicators,
          action: () => updateSettings({ showTypingIndicators: !settings.showTypingIndicators }),
          type: 'switch' as const,
        },
      ],
    },
  ];

  return (
    <div className="h-full flex flex-col bg-dark overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-dark/95 backdrop-blur-sm p-4 flex items-center gap-3 border-b border-white/5">
        <button
          onClick={() => navigate('/profile')}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      {/* Settings Content */}
      <div className="p-4 space-y-6">
        {settingsSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
          >
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 px-1">
              {section.title}
            </h2>
            <div className="bg-dark-surface rounded-xl overflow-hidden">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className={`w-full flex items-center justify-between p-4 transition-colors
                      ${itemIndex < section.items.length - 1 ? 'border-b border-white/5' : ''}
                      hover:bg-white/5`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-white/50" />
                      <span className="text-sm">{item.label}</span>
                    </div>

                    {item.type === 'switch' && (
                      <div className={`w-11 h-6 rounded-full transition-colors relative ${
                        item.value ? 'bg-primary' : 'bg-white/10'
                      }`}>
                        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                          item.value ? 'translate-x-5.5' : 'translate-x-0.5'
                        }`} style={{ transform: item.value ? 'translateX(20px)' : 'translateX(2px)' }} />
                      </div>
                    )}

                    {item.type === 'toggle' && (
                      <span className="text-sm text-white/50 flex items-center gap-1">
                        {item.value}
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    )}

                    {item.type === 'select' && (
                      <span className="text-sm text-white/50 capitalize flex items-center gap-1">
                        {item.value}
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        ))}

        {/* Language */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 px-1">
            Language
          </h2>
          <div className="bg-dark-surface rounded-xl overflow-hidden">
            <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-white/50" />
                <span className="text-sm">Language</span>
              </div>
              <span className="text-sm text-white/50 flex items-center gap-1">
                English
                <ChevronRight className="w-4 h-4" />
              </span>
            </button>
          </div>
        </motion.div>

        {/* Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 px-1">
            Support
          </h2>
          <div className="bg-dark-surface rounded-xl overflow-hidden">
            <button className="w-full flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-white/50" />
                <span className="text-sm">Help Center</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/30" />
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-white/50" />
                <span className="text-sm">Privacy Policy</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/30" />
            </button>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-2"
        >
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-4 bg-dark-surface rounded-xl hover:bg-white/5 transition-colors text-red-400"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Log Out</span>
          </button>

          <button
            onClick={handleDeleteAccount}
            className="w-full flex items-center gap-3 p-4 bg-red-500/10 rounded-xl hover:bg-red-500/20 transition-colors text-red-400"
          >
            <Trash2 className="w-5 h-5" />
            <span className="text-sm font-medium">Delete Account</span>
          </button>
        </motion.div>

        {/* Reset */}
        <div className="text-center pb-8">
          <button
            onClick={() => {
              if (window.confirm('Reset all settings to default?')) {
                resetSettings();
              }
            }}
            className="text-xs text-white/30 hover:text-white/50 transition-colors"
          >
            Reset to Defaults
          </button>
          <p className="text-xs text-white/20 mt-2">TwinLink v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
