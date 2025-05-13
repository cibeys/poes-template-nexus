
import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/common/components/layouts/DashboardLayout";
import DashboardOverview from "@/modules/dashboard/components/DashboardOverview";
import UserProfile from "@/modules/dashboard/components/UserProfile";
import AdminBlogPosts from "@/modules/dashboard/components/AdminBlogPosts";
import AdminTemplates from "@/modules/dashboard/components/AdminTemplates";
import AdminUsers from "@/modules/dashboard/components/AdminUsers";
import AdminCategories from "@/modules/dashboard/components/AdminCategories";
import UserPosts from "@/modules/dashboard/components/UserPosts";
import VideoDownloader from "./VideoDownloader";
import AIChat from "./AIChat";
import AdminChat from "@/modules/dashboard/components/AdminChat";
import UserChat from "@/modules/dashboard/components/UserChat";
import CrudBlogPost from "@/modules/dashboard/components/CrudBlogPost";
import CrudTemplate from "@/modules/dashboard/components/CrudTemplate";

export default function Dashboard() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<DashboardOverview />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/posts" element={<UserPosts />} />
        <Route path="/video-downloader" element={<VideoDownloader />} />
        <Route path="/ai-chat" element={<AIChat />} />
        <Route path="/chat" element={isAdmin ? <AdminChat /> : <UserChat />} />
        
        {/* Blog post crud routes */}
        <Route path="/blog/new" element={<CrudBlogPost />} />
        <Route path="/blog/edit/:id" element={<CrudBlogPost />} />
        
        {/* Admin only routes */}
        {isAdmin ? (
          <>
            <Route path="/admin/blog-posts" element={<AdminBlogPosts />} />
            <Route path="/admin/blog-posts/new" element={<CrudBlogPost />} />
            <Route path="/admin/blog-posts/edit/:id" element={<CrudBlogPost />} />
            
            <Route path="/admin/templates" element={<AdminTemplates />} />
            <Route path="/admin/templates/new" element={<CrudTemplate />} />
            <Route path="/admin/templates/edit/:id" element={<CrudTemplate />} />
            
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
          </>
        ) : null}
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
