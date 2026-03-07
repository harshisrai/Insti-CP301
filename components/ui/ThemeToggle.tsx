'use client';
import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = saved ? saved === 'dark' : prefersDark;
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
  };

  return (
    <button
      onClick={toggle}
      className="relative w-12 h-6 rounded-full bg-gold/20 dark:bg-gold/10 border border-gold/30 focus-visible:ring-2 ring-gold outline-none transition-colors shrink-0"
      aria-label="Toggle theme"
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-gold shadow flex items-center justify-center transition-transform ${isDark ? 'translate-x-6' : 'translate-x-0'}`}>
        {isDark ? <Moon size={12} className="text-[#0a0a0f]" /> : <Sun size={12} className="text-white" />}
      </span>
    </button>
  );
}
