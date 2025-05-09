
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Layout, Users, Eye, Tag, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function DashboardOverview() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    postCount: 0,
    templateCount: 0,
    userCount: 0,
    viewCount: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get user's own post count
        const { data: userPosts, error: userPostsError } = await supabase
          .from("blog_posts")
          .select("id")
          .eq("author_id", user?.id);
        
        if (userPostsError) throw userPostsError;
        
        if (isAdmin) {
          // Get all posts count
          const { count: postCount, error: postError } = await supabase
            .from("blog_posts")
            .select("*", { count: "exact", head: true });
          
          // Get templates count
          const { count: templateCount, error: templateError } = await supabase
            .from("templates")
            .select("*", { count: "exact", head: true });
          
          // Get users count
          const { count: userCount, error: userError } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true });
          
          // Get total view count
          const { data: viewData, error: viewError } = await supabase
            .from("blog_posts")
            .select("view_count");
          
          if (postError) throw postError;
          if (templateError) throw templateError;
          if (userError) throw userError;
          if (viewError) throw viewError;
          
          const totalViews = viewData?.reduce((sum, post) => sum + (post.view_count || 0), 0) || 0;
          
          setStats({
            postCount: postCount || 0,
            templateCount: templateCount || 0,
            userCount: userCount || 0,
            viewCount: totalViews
          });
        } else {
          setStats({
            postCount: userPosts?.length || 0,
            templateCount: 0,
            userCount: 0,
            viewCount: 0
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    
    fetchStats();
  }, [user, isAdmin]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          {isAdmin ? "Welcome to your admin dashboard" : "Welcome to your dashboard"}
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isAdmin ? "Total Posts" : "Your Posts"}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.postCount}</div>
            <p className="text-xs text-muted-foreground">
              {isAdmin ? "All blog posts" : "Your blog posts"}
            </p>
          </CardContent>
        </Card>
        
        {isAdmin && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Templates</CardTitle>
                <Layout className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.templateCount}</div>
                <p className="text-xs text-muted-foreground">Available templates</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.userCount}</div>
                <p className="text-xs text-muted-foreground">Registered users</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.viewCount}</div>
                <p className="text-xs text-muted-foreground">Total blog views</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Shortcuts to common actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {isAdmin ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <a href="/dashboard/admin/blog-posts" className="p-2 bg-primary/10 rounded-md hover:bg-primary/20 transition-colors flex items-center">
                    <FileText className="h-4 w-4 mr-2" /> Manage Posts
                  </a>
                  <a href="/dashboard/admin/templates" className="p-2 bg-primary/10 rounded-md hover:bg-primary/20 transition-colors flex items-center">
                    <Layout className="h-4 w-4 mr-2" /> Manage Templates
                  </a>
                  <a href="/dashboard/admin/categories" className="p-2 bg-primary/10 rounded-md hover:bg-primary/20 transition-colors flex items-center">
                    <Tag className="h-4 w-4 mr-2" /> Manage Categories
                  </a>
                  <a href="/dashboard/admin/users" className="p-2 bg-primary/10 rounded-md hover:bg-primary/20 transition-colors flex items-center">
                    <Users className="h-4 w-4 mr-2" /> Manage Users
                  </a>
                </div>
              </>
            ) : (
              <>
                <a href="/dashboard/posts" className="p-2 bg-primary/10 rounded-md hover:bg-primary/20 transition-colors flex items-center">
                  <FileText className="h-4 w-4 mr-2" /> Your Posts
                </a>
                <a href="/dashboard/profile" className="p-2 bg-primary/10 rounded-md hover:bg-primary/20 transition-colors flex items-center">
                  <User className="h-4 w-4 mr-2" /> Update Profile
                </a>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Here's what you can do</CardDescription>
          </CardHeader>
          <CardContent>
            {isAdmin ? (
              <p>As an administrator, you have access to all features of the platform. You can manage users, blog posts, templates, and categories. Use the sidebar to navigate to different sections.</p>
            ) : (
              <p>Welcome to your dashboard! Here you can manage your profile and blog posts. Use the sidebar to navigate to different sections.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
