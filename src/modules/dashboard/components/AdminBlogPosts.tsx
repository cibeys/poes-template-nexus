
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, Edit, Trash2, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function AdminBlogPosts() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from("blog_posts")
          .select("*, profiles(full_name, username)");
        
        if (statusFilter !== "all") {
          query = query.eq("status", statusFilter);
        }
        
        const { data, error } = await query.order("created_at", { ascending: false });
          
        if (error) throw error;
        setPosts(data || []);
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast({
          title: "Error",
          description: "Failed to fetch posts",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [statusFilter]);
  
  const deletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    try {
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      setPosts(posts.filter(post => post.id !== id));
      toast({
        title: "Post deleted",
        description: "The post has been successfully deleted"
      });
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete the post",
        variant: "destructive"
      });
    }
  };
  
  const updatePostStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("blog_posts")
        .update({ status })
        .eq("id", id);
        
      if (error) throw error;
      
      setPosts(posts.map(post => 
        post.id === id ? { ...post, status } : post
      ));
      
      toast({
        title: "Status updated",
        description: `Post status changed to ${status}`
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update post status",
        variant: "destructive"
      });
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'published':
        return <Badge variant="default" className="bg-green-500">Published</Badge>;
      case 'draft':
        return <Badge variant="outline" className="text-amber-500 border-amber-500">Draft</Badge>;
      case 'archived':
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.profiles?.full_name && post.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (post.profiles?.username && post.profiles.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Blog Posts</h2>
          <p className="text-muted-foreground">
            Manage all blog posts
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/admin/blog-posts/new">
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Posts</CardTitle>
          <CardDescription>
            A list of all blog posts on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select 
              value={statusFilter} 
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {loading ? (
            <div className="flex justify-center p-4">Loading...</div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No posts found.</p>
              <Button asChild className="mt-4">
                <Link to="/dashboard/admin/blog-posts/new">Create New Post</Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">{post.title}</TableCell>
                      <TableCell>
                        {post.profiles?.full_name || post.profiles?.username || "Unknown"}
                      </TableCell>
                      <TableCell>
                        <Select 
                          defaultValue={post.status} 
                          onValueChange={(value) => updatePostStatus(post.id, value)}
                        >
                          <SelectTrigger className="h-8 w-[120px]">
                            <SelectValue>
                              {getStatusBadge(post.status)}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{post.view_count || 0}</TableCell>
                      <TableCell>{new Date(post.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="icon" asChild>
                            <Link to={`/blog/${post.slug}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="outline" size="icon" asChild>
                            <Link to={`/dashboard/admin/blog-posts/edit/${post.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => deletePost(post.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
