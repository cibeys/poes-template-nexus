
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { X, ChevronDown, ChevronRight, Home, FileText, Layout, User, Heart, Download, MessageSquare, Moon, Sun, Laptop, Settings, Wrench, Gamepad } from "lucide-react";
import { useTheme } from "../ThemeProvider";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItemProps {
  icon: React.ReactNode;
  title: string;
  href: string;
  isActive: boolean;
}

interface DropdownProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function NavItem({ icon, title, href, isActive }: NavItemProps) {
  return (
    <Link
      to={href}
      className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
        isActive
          ? "bg-primary/10 text-primary dark:bg-primary/20"
          : "hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      <div>{icon}</div>
      <span>{title}</span>
    </Link>
  );
}

function Dropdown({ icon, title, children, defaultOpen = false }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="space-y-1">
      <button
        className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-3">
          <div>{icon}</div>
          <span>{title}</span>
        </div>
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      {isOpen && <div className="pl-10 pr-2 space-y-1">{children}</div>}
    </div>
  );
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const isPathActive = (path: string) => location.pathname.startsWith(path);
  const { theme, setTheme } = useTheme();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 lg:static lg:transform-none lg:transition-none lg:z-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
          <Link to="/" className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            POES
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col h-[calc(100%-64px)]">
          <nav className="p-4 space-y-2 flex-grow overflow-y-auto">
            <NavItem
              icon={<Home size={18} />}
              title="Home"
              href="/"
              isActive={isActive("/")}
            />
            
            <Dropdown
              icon={<FileText size={18} />}
              title="Blog"
              defaultOpen={location.pathname.startsWith("/blog")}
            >
              <NavItem
                icon={<FileText size={16} />}
                title="All Posts"
                href="/blog"
                isActive={isActive("/blog")}
              />
              <NavItem
                icon={<Heart size={16} />}
                title="Popular Posts"
                href="/blog/popular"
                isActive={isActive("/blog/popular")}
              />
            </Dropdown>

            <Dropdown
              icon={<Layout size={18} />}
              title="Templates"
              defaultOpen={location.pathname.startsWith("/templates")}
            >
              <NavItem
                icon={<Layout size={16} />}
                title="All Templates"
                href="/templates"
                isActive={isActive("/templates")}
              />
              <NavItem
                icon={<Heart size={16} />}
                title="Featured"
                href="/templates/featured"
                isActive={isActive("/templates/featured")}
              />
            </Dropdown>

            <Dropdown
              icon={<Wrench size={18} />}
              title="Tools"
              defaultOpen={location.pathname.startsWith("/tools")}
            >
              <NavItem
                icon={<Wrench size={16} />}
                title="All Tools"
                href="/tools"
                isActive={isActive("/tools")}
              />
            </Dropdown>

            <NavItem
              icon={<Download size={18} />}
              title="Video Downloader"
              href="/video-downloader"
              isActive={isActive("/video-downloader")}
            />

            <NavItem
              icon={<MessageSquare size={18} />}
              title="AI Chat"
              href="/ai-chat"
              isActive={isActive("/ai-chat")}
            />

            <NavItem
              icon={<Gamepad size={18} />}
              title="Games"
              href="/games"
              isActive={isPathActive("/games")}
            />

            <NavItem
              icon={<User size={18} />}
              title="About"
              href="/about"
              isActive={isActive("/about")}
            />
          </nav>

          {/* Theme switcher at the bottom */}
          <div className="p-4 border-t dark:border-gray-800">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">Theme</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex items-center justify-center p-2 rounded-md flex-1 ${
                    theme === "light" 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  title="Light mode"
                >
                  <Sun size={18} />
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex items-center justify-center p-2 rounded-md flex-1 ${
                    theme === "dark" 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  title="Dark mode"
                >
                  <Moon size={18} />
                </button>
                <button
                  onClick={() => setTheme("system")}
                  className={`flex items-center justify-center p-2 rounded-md flex-1 ${
                    theme === "system" 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  title="System preference"
                >
                  <Laptop size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
