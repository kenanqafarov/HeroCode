import { useEffect, useState } from 'react';

const THEME_KEY = 'codequest-theme';

export function useTheme() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return (localStorage.getItem(THEME_KEY) ?? 'dark') === 'dark';
  });

  useEffect(() => {
    const sync = () => {
      setIsDark((localStorage.getItem(THEME_KEY) ?? 'dark') === 'dark');
    };

    // Listen for same-tab changes (dispatched manually when theme toggles)
    window.addEventListener('themechange', sync);
    // Listen for cross-tab changes
    window.addEventListener('storage', sync);

    return () => {
      window.removeEventListener('themechange', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return isDark;
}

/** Call this when toggling theme so same-tab listeners fire. */
export function setTheme(theme: 'dark' | 'light') {
  localStorage.setItem(THEME_KEY, theme);
  window.dispatchEvent(new Event('themechange'));
}