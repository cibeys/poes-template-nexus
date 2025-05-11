
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Layout, Users, Eye, Tag, User, ArrowUp, ArrowDown, Activity } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from "recharts";

export default function DashboardOverview() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    postCount: 0,
    templateCount: 0,
    userCount: 0,
    viewCount: 0
  });

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

  const [activityData, setActivityData] = useState([
    { user: 'Anni Kim', action: 'Created a new post', time: '2 minutes ago', icon: FileText },
    { user: 'Tomás Santos', action: 'Updated their profile', time: '15 minutes ago', icon: User },
    { user: 'Robert Chen', action: 'Downloaded a template', time: '1 hour ago', icon: Layout },
    { user: 'Elena Petrova', action: 'Added a new comment', time: '3 hours ago', icon: Activity },
    { user: 'Mohammed Ali', action: 'Registered an account', time: '5 hours ago', icon: User },
  ]);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

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
            <div className="text-2xl font-bold">{stats.postCount}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-500">12%</span>
              <span className="ml-1">from last month</span>
            </div>
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
                <div className="text-2xl font-bold">{stats.templateCount}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">8%</span>
                  <span className="ml-1">from last month</span>
                </div>
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
                <div className="text-2xl font-bold">{stats.userCount}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">18%</span>
                  <span className="ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Views</CardTitle>
                <div className="p-2 bg-primary/10 rounded-full">
                  <Eye className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.viewCount}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
                  <span className="text-red-500">4%</span>
                  <span className="ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card className="hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                <div className="p-2 bg-primary/10 rounded-full">
                  <Eye className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">254</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">12%</span>
                  <span className="ml-1">from last week</span>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </motion.div>
      
      {isAdmin && (
        <motion.div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" variants={item}>
          <Card className="md:col-span-2 hover:shadow-md transition-all">
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
  
          <Card className="hover:shadow-md transition-all">
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
        </motion.div>
      )}
      
      <motion.div className="grid gap-4 md:grid-cols-2" variants={item}>
        <Card className="col-span-1 hover:shadow-md transition-all">
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
        
        <Card className="col-span-1 hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions on the platform</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[300px] overflow-auto">
            <div className="space-y-4">
              {activityData.map((activity, i) => (
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
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div variants={item} className="grid gap-4 md:grid-cols-1">
        <Card className="hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Shortcuts to common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {isAdmin ? (
                <>
                  <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:bg-primary/5">
                    <FileText className="h-5 w-5 text-primary" />
                    <span>Create Post</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:bg-primary/5">
                    <Layout className="h-5 w-5 text-primary" />
                    <span>Add Template</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:bg-primary/5">
                    <Tag className="h-5 w-5 text-primary" />
                    <span>Manage Tags</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:bg-primary/5">
                    <Users className="h-5 w-5 text-primary" />
                    <span>User Roles</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:bg-primary/5">
                    <FileText className="h-5 w-5 text-primary" />
                    <span>New Post</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:bg-primary/5">
                    <User className="h-5 w-5 text-primary" />
                    <span>Edit Profile</span>
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
