/**
 * TwinLink - Custom React Hooks
 * Reusable hooks for common functionality
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore, useChatStore, useSettingsStore } from '../lib/store';
import { debounce } from '../utils';

/**
 * Hook to handle typing indicator with debounce
 */
export function useTypingIndicator(chatId: string, delay: number = 2000) {
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const { setTyping } = useChatStore();

  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      setTyping(chatId, true, 'current-user');
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      setTyping(chatId, false);
    }, delay);
  }, [chatId, delay, isTyping, setTyping]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setTyping(chatId, false);
    };
  }, [chatId, setTyping]);

  return { isTyping, handleTyping };
}

/**
 * Hook to auto-scroll to bottom of messages
 */
export function useAutoScroll(dependency: unknown) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(true);

  useEffect(() => {
    if (scrollRef.current && shouldScrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [dependency]);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      shouldScrollRef.current = isAtBottom;
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      shouldScrollRef.current = true;
    }
  }, []);

  return { scrollRef, handleScroll, scrollToBottom };
}

/**
 * Hook for online/offline status detection
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Hook for media query / responsive breakpoints
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

/**
 * Hook for keyboard shortcuts
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  modifiers?: { ctrl?: boolean; shift?: boolean; alt?: boolean }
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== key) return;

      if (modifiers?.ctrl && !e.ctrlKey && !e.metaKey) return;
      if (modifiers?.shift && !e.shiftKey) return;
      if (modifiers?.alt && !e.altKey) return;

      e.preventDefault();
      callback();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, modifiers]);
}

/**
 * Hook for click outside detection
 */
export function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T>,
  callback: () => void
) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref, callback]);
}

/**
 * Hook for file upload with preview
 */
export function useFileUpload(accept: string = 'image/*', maxSize: number = 5 * 1024 * 1024) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((selectedFile: File) => {
    setError(null);

    if (selectedFile.size > maxSize) {
      setError(`File too large. Max size: ${(maxSize / 1024 / 1024).toFixed(0)}MB`);
      return;
    }

    setFile(selectedFile);

    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  }, [maxSize]);

  const clearFile = useCallback(() => {
    setFile(null);
    setPreview(null);
    setError(null);
  }, []);

  return { file, preview, error, handleFileSelect, clearFile };
}

/**
 * Hook for search with debounce
 */
export function useSearch<T>(
  items: T[],
  searchFn: (item: T, query: string) => boolean,
  debounceMs: number = 300
) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>(items);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearch = useRef(
    debounce((searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults(items);
        setIsSearching(false);
        return;
      }

      const filtered = items.filter(item => searchFn(item, searchQuery));
      setResults(filtered);
      setIsSearching(false);
    }, debounceMs)
  ).current;

  useEffect(() => {
    setIsSearching(true);
    debouncedSearch(query);
  }, [query, items, debouncedSearch]);

  return { query, setQuery, results, isSearching };
}

/**
 * Hook for long press detection
 */
export function useLongPress(callback: () => void, ms: number = 500) {
  const [isPressing, setIsPressing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const start = useCallback(() => {
    setIsPressing(true);
    timerRef.current = setTimeout(() => {
      callback();
      setIsPressing(false);
    }, ms);
  }, [callback, ms]);

  const stop = useCallback(() => {
    setIsPressing(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  return { isPressing, start, stop };
}

/**
 * Hook for intersection observer (lazy loading)
 */
export function useInView(options?: IntersectionObserverInit) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, options);

    observer.observe(element);
    return () => observer.disconnect();
  }, [options]);

  return { ref, isInView };
}

/**
 * Hook for dark mode / theme
 */
export function useTheme() {
  const { settings, updateSettings } = useSettingsStore();
  const { theme } = settings;

  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: newTheme });
  }, [theme, updateSettings]);

  return { theme, toggleTheme, isDark: theme === 'dark' };
}
