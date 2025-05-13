
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from "@/common/components/ThemeProvider";
import { ThemeCustomizerProvider } from "@/contexts/ThemeContext";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import ThemeCustomizer from "@/components/ThemeCustomizer";

// Pages
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Templates from "@/pages/Templates";
import TemplateDetail from "@/pages/TemplateDetail";
import Tools from "@/pages/Tools";
import ToolsDetail from "@/pages/ToolsDetail";
import VideoDownloader from "@/pages/VideoDownloader";
import AIChat from "@/pages/AIChat";
import Games from "@/pages/Games";
import About from "@/pages/About";
import NotFound from "@/pages/NotFound";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="ui-theme">
        <ThemeCustomizerProvider>
          <AuthProvider>
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/about" element={<About />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/templates" element={<Templates />} />
                <Route path="/templates/:slug" element={<TemplateDetail />} />
                <Route path="/tools" element={<Tools />} />
                <Route path="/tools/:id" element={<ToolsDetail />} />
                <Route path="/video-downloader" element={<VideoDownloader />} />
                <Route path="/ai-chat" element={<AIChat />} />
                <Route path="/games" element={<Games />} />
                <Route path="/games/:gameId" element={<Games />} />

                {/* Protected Routes */}
                <Route path="/dashboard/*" element={<Dashboard />} />
                
                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              
              {/* Theme Customizer */}
              <ThemeCustomizer />
              
              {/* Toaster */}
              <Toaster />
            </Router>
          </AuthProvider>
        </ThemeCustomizerProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
