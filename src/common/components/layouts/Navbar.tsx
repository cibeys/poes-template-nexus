
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, LogIn, UserCircle, Download, MessageSquare, Wrench } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

interface NavbarProps {
  onToggleSidebar: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user, profile, signOut, isAdmin } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

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

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };
  
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  const navItems = [
    { title: 'Home', path: '/' },
    { title: 'Blog', path: '/blog' },
    { title: 'Templates', path: '/templates' },
    { 
      title: 'Tools', 
      path: '/tools',
      icon: <Wrench className="inline-block mr-1 h-4 w-4" />
    },
    { 
      title: 'Downloader', 
      path: '/video-downloader',
      icon: <Download className="inline-block mr-1 h-4 w-4" /> 
    },
    { 
      title: 'AI Chat', 
      path: '/ai-chat',
      icon: <MessageSquare className="inline-block mr-1 h-4 w-4" /> 
    },
    { title: 'About', path: '/about' }
  ];

  const fadeInVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-md"
          : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={onToggleSidebar}
            className="lg:hidden mr-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </motion.button>
          <Link to="/" className="flex items-center space-x-2">
            <motion.span 
              className="font-bold text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              TANOELUIS
            </motion.span>
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          {navItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link 
                to={item.path} 
                className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors flex items-center"
              >
                {item.icon && item.icon}
                {item.title}
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          {/* Removed theme switcher dropdown */}

          {user ? (
            <DropdownMenu open={isUserDropdownOpen} onOpenChange={setIsUserDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 rounded-full flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || ''} />
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/tools">Tools</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/video-downloader">Video Downloader</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/ai-chat">AI Chat</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/chat">Support Chat</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/admin/blog-posts">Admin</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleSignOut}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="default" size="sm" asChild>
                <Link to="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
            </motion.div>
          )}
        </div>
      </nav>
    </motion.header>
  );
}
