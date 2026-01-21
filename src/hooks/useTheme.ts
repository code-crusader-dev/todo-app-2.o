import { useState, useEffect, useCallback } from 'react';
import * as db from '@/lib/db';
import { UserPreferences } from '@/types/task';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('system');
  const [backgroundImage, setBackgroundImageState] = useState<string | undefined>();
  const [isLoaded, setIsLoaded] = useState(false);

  // Apply theme to document
  const applyTheme = useCallback((newTheme: Theme) => {
    const root = document.documentElement;
    
    if (newTheme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', systemDark);
    } else {
      root.classList.toggle('dark', newTheme === 'dark');
    }
  }, []);

  // Load preferences from IndexedDB
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const prefs = await db.getPreferences();
        setThemeState(prefs.theme || 'system');
        setBackgroundImageState(prefs.backgroundImage);
        applyTheme(prefs.theme || 'system');
        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading preferences:', error);
        setIsLoaded(true);
      }
    };
    loadPreferences();
  }, [applyTheme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    await db.updatePreferences({ theme: newTheme });
  };

  const setBackgroundImage = async (image: string | undefined) => {
    setBackgroundImageState(image);
    await db.updatePreferences({ backgroundImage: image });
  };

  const toggleTheme = async () => {
    const currentEffective = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    
    const newTheme = currentEffective === 'dark' ? 'light' : 'dark';
    await setTheme(newTheme);
  };

  const isDark = theme === 'system'
    ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    : theme === 'dark';

  return {
    theme,
    isDark,
    backgroundImage,
    isLoaded,
    setTheme,
    setBackgroundImage,
    toggleTheme,
  };
}
