
import React from "react"; // Add explicit React import
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./common/components/ThemeProvider";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Templates from "./pages/Templates";
import TemplateDetail from "./pages/TemplateDetail";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthProvider } from "./contexts/AuthContext";
import VideoDownloader from "./pages/VideoDownloader";
import AIChat from "./pages/AIChat";
import Tools from "./pages/Tools";
import ToolsDetail from "./pages/ToolsDetail";
import Games from "./pages/Games";

// Create the query client inside the component function
const App = () => {
  // Create a new QueryClient instance within the component
  const queryClient = new QueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/templates" element={<Templates />} />
                <Route path="/templates/:slug" element={<TemplateDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/dashboard/*" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/video-downloader" element={<VideoDownloader />} />
                <Route path="/ai-chat" element={<AIChat />} />
                <Route path="/tools" element={<Tools />} />
                <Route path="/tools/:toolId" element={<ToolsDetail />} />
                <Route path="/games" element={<Games />} />
                <Route path="/games/:gameId" element={<Games />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
