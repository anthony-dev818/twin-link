/**
 * TwinLink - Utility Functions
 * Helper functions for formatting, validation, and data manipulation
 */

import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import DOMPurify from 'dompurify';
import type { Message, User, Chat } from '../types';

/**
 * Format message timestamp for display
 */
export function formatMessageTime(date: Date): string {
  if (isToday(date)) {
    return format(date, 'h:mm a');
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  return format(date, 'MMM d');
}

/**
 * Format full timestamp for message details
 */
export function formatFullTimestamp(date: Date): string {
  return format(date, 'MMM d, yyyy h:mm a');
}

/**
 * Format relative time (e.g., "2 minutes ago")
 */
export function formatRelativeTime(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Format last seen time
 */
export function formatLastSeen(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return format(date, 'MMM d');
}

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Get avatar color based on user ID (consistent colors)
 */
export function getAvatarColor(userId: string): string {
  const colors = [
    'bg-pink-500',
    'bg-purple-500',
    'bg-indigo-500',
    'bg-blue-500',
    'bg-cyan-500',
    'bg-teal-500',
    'bg-emerald-500',
    'bg-rose-500',
  ];
  const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
}

/**
 * Sort chats by last message timestamp
 */
export function sortChatsByRecent(chats: Chat[]): Chat[] {
  return [...chats].sort((a, b) => {
    const aTime = a.lastMessage?.timestamp || a.updatedAt;
    const bTime = b.lastMessage?.timestamp || b.updatedAt;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });
}

/**
 * Filter chats by search query
 */
export function filterChats(chats: Chat[], query: string): Chat[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return chats;

  return chats.filter(chat => {
    const otherUser = chat.participants.find(p => p.id !== 'current-user');
    if (!otherUser) return false;

    const matchesName = otherUser.name.toLowerCase().includes(lowerQuery);
    const matchesMessage = chat.messages.some(m => 
      m.content.toLowerCase().includes(lowerQuery)
    );

    return matchesName || matchesMessage;
  });
}

/**
 * Check if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return 'weak';
  if (score <= 4) return 'medium';
  return 'strong';
}

/**
 * Scroll to bottom of element smoothly
 */
export function scrollToBottom(element: HTMLElement | null): void {
  if (element) {
    element.scrollTo({
      top: element.scrollHeight,
      behavior: 'smooth',
    });
  }
}
