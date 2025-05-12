import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Layout, Users, Eye, Tag, User, ArrowUp, ArrowDown, Activity } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { typedRpc } from "@/types/supabase-custom";

export default function DashboardOverview() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    postCount: 0,
    templateCount: 0,
    userCount: 0,
    viewCount: 0,
    unreadMessages: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const [userChartData, setUserChartData] = useState([
    { month: 'Jan', users: 65 },
    { month: 'Feb', users: 78 },
    { month: 'Mar', users: 90 },
    { month: 'Apr', users: 81 },
    { month: 'May', users: 105 },
    { month: 'Jun', users: 118 },
  ]);

  const [blogChartData, setBlogChartData] = useState([
    { month: 'Jan', posts: 12, views: 350 },
    { month: 'Feb', posts: 15, views: 420 },
    { month: 'Mar', posts: 18, views: 580 },
    { month: 'Apr', posts: 14, views: 620 },
    { month: 'May', posts: 20, views: 750 },
    { month: 'Jun', posts: 22, views: 890 },
  ]);

  const [trafficData, setTrafficData] = useState([
    { name: 'Organic', value: 65 },
    { name: 'Direct', value: 20 },
    { name: 'Social', value: 10 },
    { name: 'Referral', value: 5 },
  ]);

  const [activityData, setActivityData] = useState<any[]>([]);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        
        // Get user's own post count or all posts if admin
        const postCountQuery = isAdmin
          ? await supabase.from("blog_posts").select("*", { count: "exact" })
          : await supabase.from("blog_posts").select("*", { count: "exact" }).eq("author_id", user?.id);
          
        if (postCountQuery.error) throw postCountQuery.error;
        
        let stats = {
          postCount: postCountQuery.count || 0,
          templateCount: 0,
          userCount: 0,
          viewCount: 0,
          unreadMessages: 0
        };
        
        // Get unread messages
        try {
          if (isAdmin) {
            const { data: unreadCount, error } = await typedRpc(supabase, 'count_unread_admin_messages');
            if (!error && unreadCount !== null) {
              stats.unreadMessages = unreadCount;
            }
          } else {
            const { data: unreadCount, error } = await typedRpc(
              supabase, 
              'count_unread_user_messages',
              { user_id: user?.id || '' }
            );
            if (!error && unreadCount !== null) {
              stats.unreadMessages = unreadCount;
            }
          }
        } catch (err) {
          console.error("Error fetching unread messages:", err);
        }
        
        if (isAdmin) {
          // Get templates count
          const templateCountQuery = await supabase.from("templates").select("*", { count: "exact" });
          if (templateCountQuery.error) throw templateCountQuery.error;
          stats.templateCount = templateCountQuery.count || 0;
          
          // Get users count
          const userCountQuery = await supabase.from("profiles").select("*", { count: "exact" });
          if (userCountQuery.error) throw userCountQuery.error;
          stats.userCount = userCountQuery.count || 0;
          
          // Get total view count
          const viewCountQuery = await supabase.from("blog_posts").select("view_count");
          if (viewCountQuery.error) throw viewCountQuery.error;
          const totalViews = viewCountQuery.data?.reduce((sum, post) => sum + (post.view_count || 0), 0) || 0;
          stats.viewCount = totalViews;
          
          // Get recent activities
          const { data: recentActivities, error: activitiesError } = await supabase
            .from("profiles")
            .select("id, full_name, username, avatar_url")
            .limit(5);
            
          if (activitiesError) throw activitiesError;
          
          if (recentActivities) {
            // Convert to activity format
            const activityTypes = [
              { action: 'created a new post', icon: FileText },
              { action: 'updated their profile', icon: User },
              { action: 'downloaded a template', icon: Layout },
              { action: 'added a new comment', icon: Activity },
              { action: 'registered an account', icon: User }
            ];
            
            const newActivityData = recentActivities.map((profile, index) => {
              const minutesAgo = Math.floor(Math.random() * 120) + 1;
              const timeAgo = minutesAgo <= 60 
                ? `${minutesAgo} minutes ago` 
                : `${Math.floor(minutesAgo / 60)} hours ago`;
                
              return {
                user: profile.full_name || profile.username || 'Anonymous User',
                action: activityTypes[index % activityTypes.length].action,
                time: timeAgo,
                icon: activityTypes[index % activityTypes.length].icon
              };
            });
            
            setActivityData(newActivityData);
          }
        }
        
        setStats(stats);
      } catch (error: any) {
        console.error("Error fetching stats:", error.message);
        toast({
          title: "Error fetching dashboard data",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchStats();
    }
  }, [user, isAdmin, toast]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      className="space-y-6" 
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item}>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          {isAdmin ? "Welcome to your admin dashboard" : "Welcome to your dashboard"}
        </p>
      </motion.div>
      
      <motion.div 
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        variants={item}
      >
        <Card className="hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isAdmin ? "Total Posts" : "Your Posts"}
            </CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <FileText className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-14 flex items-center">
                <div className="h-2 w-16 bg-muted animate-pulse rounded" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.postCount}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">12%</span>
                  <span className="ml-1">from last month</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <Activity className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-14 flex items-center">
                <div className="h-2 w-16 bg-muted animate-pulse rounded" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.unreadMessages}</div>
                <div className="flex items-center mt-1">
                  <Button variant="link" className="p-0 h-auto text-xs text-primary" asChild>
                    <Link to="/dashboard/chat">View messages</Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        {isAdmin ? (
          <>
            <Card className="hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Templates</CardTitle>
                <div className="p-2 bg-primary/10 rounded-full">
                  <Layout className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-14 flex items-center">
                    <div className="h-2 w-16 bg-muted animate-pulse rounded" />
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats.templateCount}</div>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                      <span className="text-green-500">8%</span>
                      <span className="ml-1">from last month</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Users</CardTitle>
                <div className="p-2 bg-primary/10 rounded-full">
                  <Users className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-14 flex items-center">
                    <div className="h-2 w-16 bg-muted animate-pulse rounded" />
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats.userCount}</div>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                      <span className="text-green-500">18%</span>
                      <span className="ml-1">from last month</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-all lg:col-span-4">
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New users registered over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={userChartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 0,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="users" 
                      stroke="var(--primary)" 
                      fill="var(--primary)" 
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-2 hover:shadow-md transition-all">
              <CardHeader>
                <CardTitle>Blog Post Analytics</CardTitle>
                <CardDescription>Posts and view trends</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={blogChartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 0,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" orientation="left" stroke="var(--primary)" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="posts" fill="var(--primary)" name="Posts" />
                    <Bar yAxisId="right" dataKey="views" fill="#82ca9d" name="Views" barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-2 hover:shadow-md transition-all">
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>User acquisition channels</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={trafficData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {trafficData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card className="md:col-span-2 hover:shadow-md transition-all">
              <CardHeader>
                <CardTitle>Your Activity</CardTitle>
                <CardDescription>Recent posts and interactions</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="h-8 w-8 border-t-2 border-b-2 border-primary rounded-full animate-spin" />
                  </div>
                ) : stats.postCount === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4">
                    <p className="text-muted-foreground mb-4">You haven't created any posts yet.</p>
                    <Button asChild>
                      <Link to="/dashboard/posts">Create your first post</Link>
                    </Button>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={blogChartData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 0,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="posts"
                        name="Your Posts"
                        stroke="var(--primary)"
                        activeDot={{ r: 8 }}
                      />
                      <Line type="monotone" dataKey="views" name="Views" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </>
        )}
        
        <Card className={`${isAdmin ? 'lg:col-span-4' : 'md:col-span-2'} hover:shadow-md transition-all`}>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions on the platform</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[300px] overflow-auto">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="p-2 bg-muted rounded-full w-8 h-8" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted rounded w-1/3" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                      <div className="h-3 bg-muted rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {activityData.length > 0 ? (
                  activityData.map((activity, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <activity.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{activity.user}</p>
                        <p className="text-sm text-muted-foreground">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No recent activity</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      
        <Card className={`${isAdmin ? 'lg:col-span-4' : 'md:col-span-2'} hover:shadow-md transition-all`}>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Shortcuts to common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {isAdmin ? (
                <>
                  <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:bg-primary/5" asChild>
                    <Link to="/dashboard/admin/blog-posts">
                      <FileText className="h-5 w-5 text-primary" />
                      <span>Manage Posts</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:bg-primary/5" asChild>
                    <Link to="/dashboard/admin/templates">
                      <Layout className="h-5 w-5 text-primary" />
                      <span>Manage Templates</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:bg-primary/5" asChild>
                    <Link to="/dashboard/admin/categories">
                      <Tag className="h-5 w-5 text-primary" />
                      <span>Manage Categories</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:bg-primary/5" asChild>
                    <Link to="/dashboard/admin/users">
                      <Users className="h-5 w-5 text-primary" />
                      <span>Manage Users</span>
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:bg-primary/5" asChild>
                    <Link to="/dashboard/posts">
                      <FileText className="h-5 w-5 text-primary" />
                      <span>My Posts</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:bg-primary/5" asChild>
                    <Link to="/dashboard/profile">
                      <User className="h-5 w-5 text-primary" />
                      <span>Edit Profile</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:bg-primary/5" asChild>
                    <Link to="/dashboard/chat">
                      <Activity className="h-5 w-5 text-primary" />
                      <span>Support Chat</span>
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
