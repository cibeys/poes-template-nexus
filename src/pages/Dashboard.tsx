
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
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
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
        
        {/* Admin only routes */}
        {isAdmin ? (
          <>
            <Route path="/admin/blog-posts" element={<AdminBlogPosts />} />
            <Route path="/admin/templates" element={<AdminTemplates />} />
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
