
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Users, FileText, Layout, User, 
  LogOut, Menu, X, ChevronDown, Tag, Settings, MessageCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeCustomizerProvider, useThemeCustomizer } from "@/contexts/ThemeContext";
import ThemeCustomizer from "@/modules/dashboard/components/ThemeCustomizer";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayoutContent = ({ children }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, profile, signOut, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleCustomizer } = useThemeCustomizer();
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Get unread messages count
  useEffect(() => {
    if (!user) return;
    
    const fetchUnreadCount = async () => {
      try {
        if (isAdmin) {
          // For admin, count all unread messages from users
          const { data, error } = await supabase
            .from('chat_messages')
            .select('id', { count: 'exact' })
            .is('admin_id', null)
            .eq('is_read', false);
            
          if (error) throw error;
          setUnreadCount(data?.length || 0);
        } else {
          // For regular users, count unread messages from admins
          const { data, error } = await supabase
            .from('chat_messages')
            .select('id', { count: 'exact' })
            .eq('user_id', user.id)
            .is('admin_id', 'not.null')
            .eq('is_read', false);
            
          if (error) throw error;
          setUnreadCount(data?.length || 0);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };
    
    fetchUnreadCount();
    
    // Set up real-time listener
    const channel = supabase
      .channel('chat-unread')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        payload => {
          fetchUnreadCount();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin]);
  
  const handleSignOut = async () => {
    const success = await signOut();
    if (success) {
      navigate("/");
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Set initial state

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-900 transition-transform duration-300 shadow-lg lg:relative lg:shadow-none ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-20"
        }`}
      >
        <div className="flex items-center justify-between h-16 p-4 border-b">
          <Link to="/dashboard" className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {isSidebarOpen ? "POES Admin" : "P"}
          </Link>
          <button 
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="p-4">
            <nav className="space-y-2">
              <Link 
                to="/dashboard" 
                className={`flex items-center p-2 rounded-lg ${
                  isActiveRoute("/dashboard") 
                    ? "bg-primary/10 text-primary dark:bg-primary/20" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <LayoutDashboard size={20} />
                {isSidebarOpen && <span className="ml-3">Dashboard</span>}
              </Link>
              
              <Link 
                to="/dashboard/profile" 
                className={`flex items-center p-2 rounded-lg ${
                  isActiveRoute("/dashboard/profile") 
                    ? "bg-primary/10 text-primary dark:bg-primary/20" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <User size={20} />
                {isSidebarOpen && <span className="ml-3">Profile</span>}
              </Link>
              
              <Link 
                to="/dashboard/posts" 
                className={`flex items-center p-2 rounded-lg ${
                  isActiveRoute("/dashboard/posts") 
                    ? "bg-primary/10 text-primary dark:bg-primary/20" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <FileText size={20} />
                {isSidebarOpen && <span className="ml-3">My Posts</span>}
              </Link>
              
              <Link 
                to="/dashboard/chat" 
                className={`flex items-center p-2 rounded-lg ${
                  isActiveRoute("/dashboard/chat") 
                    ? "bg-primary/10 text-primary dark:bg-primary/20" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <MessageCircle size={20} />
                {isSidebarOpen && (
                  <div className="ml-3 flex-1 flex justify-between items-center">
                    <span>{isAdmin ? "Support Chat" : "Chat with Support"}</span>
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-2">{unreadCount}</Badge>
                    )}
                  </div>
                )}
                {!isSidebarOpen && unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">{unreadCount}</Badge>
                )}
              </Link>
              
              {isAdmin && (
                <>
                  <Separator className="my-4" />
                  
                  <div className={`text-sm text-gray-500 ${!isSidebarOpen && 'hidden'}`}>Admin</div>
                  
                  <Link 
                    to="/dashboard/admin/blog-posts" 
                    className={`flex items-center p-2 rounded-lg ${
                      isActiveRoute("/dashboard/admin/blog-posts") 
                        ? "bg-primary/10 text-primary dark:bg-primary/20" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <FileText size={20} />
                    {isSidebarOpen && <span className="ml-3">All Blog Posts</span>}
                  </Link>
                  
                  <Link 
                    to="/dashboard/admin/templates" 
                    className={`flex items-center p-2 rounded-lg ${
                      isActiveRoute("/dashboard/admin/templates") 
                        ? "bg-primary/10 text-primary dark:bg-primary/20" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Layout size={20} />
                    {isSidebarOpen && <span className="ml-3">Templates</span>}
                  </Link>
                  
                  <Link 
                    to="/dashboard/admin/categories" 
                    className={`flex items-center p-2 rounded-lg ${
                      isActiveRoute("/dashboard/admin/categories") 
                        ? "bg-primary/10 text-primary dark:bg-primary/20" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Tag size={20} />
                    {isSidebarOpen && <span className="ml-3">Categories</span>}
                  </Link>
                  
                  <Link 
                    to="/dashboard/admin/users" 
                    className={`flex items-center p-2 rounded-lg ${
                      isActiveRoute("/dashboard/admin/users") 
                        ? "bg-primary/10 text-primary dark:bg-primary/20" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Users size={20} />
                    {isSidebarOpen && <span className="ml-3">Users</span>}
                  </Link>
                </>
              )}
            </nav>
          </div>
        </ScrollArea>
      </aside>
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b dark:border-gray-800 px-4 flex items-center justify-between">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu size={20} />
          </Button>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={toggleCustomizer}
              title="Customize Theme"
            >
              <Settings size={18} />
            </Button>

            <Link to="/" className="text-sm hover:underline hidden md:inline-block">
              View Site
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || ''} />
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-950">
          {children}
        </main>
      </div>
      
      {/* Theme Customizer */}
      <ThemeCustomizer />
    </div>
  );
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ThemeCustomizerProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </ThemeCustomizerProvider>
  );
}
