import { createContext, useContext, useEffect, type ReactNode } from 'react';

const DarkModeContext = createContext<undefined>(undefined);

export function DarkModeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Apply system preference on mount
    const applySystemPreference = () => {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const root = document.documentElement;
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applySystemPreference();

    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <DarkModeContext.Provider value={undefined}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
}
