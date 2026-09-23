'use client';

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const icons = {
    light: <Sun size={18} />,
    dark: <Moon size={18} />,
    system: <Monitor size={18} />,
  };

  const themes = ["light", "dark", "system"] as const;

  const cycleTheme = () => {
    const currentIndex = themes.indexOf(theme as (typeof themes)[number]);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <button
      onClick={cycleTheme}
      aria-label="Toggle theme"
      title={`Theme: ${mounted ? theme : "system"}`}
      className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      {mounted ? icons[theme as keyof typeof icons] : <Monitor size={18} />}
    </button>
  );
};

export default ThemeToggle;