
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, Sun, Moon, Laptop, ChevronDown } from "lucide-react";
import { useTheme } from "../ThemeProvider";

interface NavbarProps {
  onToggleSidebar: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-md"
          : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={onToggleSidebar}
            className="lg:hidden mr-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">POES</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/blog" className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors">
            Blog
          </Link>
          <Link to="/templates" className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors">
            Templates
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
              className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle theme"
            >
              {theme === "light" && <Sun size={18} />}
              {theme === "dark" && <Moon size={18} />}
              {theme === "system" && <Laptop size={18} />}
              <ChevronDown size={16} className="ml-1" />
            </button>

            {isThemeDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-40 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5"
                onMouseLeave={() => setIsThemeDropdownOpen(false)}
              >
                <button
                  onClick={() => {
                    setTheme("light");
                    setIsThemeDropdownOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Sun size={16} className="mr-2" /> Light
                </button>
                <button
                  onClick={() => {
                    setTheme("dark");
                    setIsThemeDropdownOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Moon size={16} className="mr-2" /> Dark
                </button>
                <button
                  onClick={() => {
                    setTheme("system");
                    setIsThemeDropdownOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Laptop size={16} className="mr-2" /> System
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
