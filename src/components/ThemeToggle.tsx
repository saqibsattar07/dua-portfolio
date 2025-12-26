import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-8 rounded-full glass-card p-1 transition-all duration-500 hover:glow-effect group"
      aria-label="Toggle theme"
    >
      <div
        className={`absolute w-6 h-6 rounded-full gradient-bg transition-all duration-500 ease-out flex items-center justify-center ${
          theme === "dark" ? "translate-x-6" : "translate-x-0"
        }`}
      >
        {theme === "dark" ? (
          <Moon className="w-4 h-4 text-primary-foreground" />
        ) : (
          <Sun className="w-4 h-4 text-primary-foreground" />
        )}
      </div>
    </button>
  );
}
