import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from './button';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 relative overflow-hidden group hover:scale-110 transition-all duration-300"
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {theme === 'light' ? (
          <Moon className="h-5 w-5 text-slate-700 group-hover:text-yellow-600 transition-colors duration-300" />
        ) : (
          <Sun className="h-5 w-5 text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300" />
        )}
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};