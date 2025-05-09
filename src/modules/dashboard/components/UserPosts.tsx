
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, Edit, Trash2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function UserPosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("author_id", user?.id)
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        setPosts(data || []);
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast({
          title: "Error",
          description: "Failed to fetch your posts",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchPosts();
    }
  }, [user]);
  
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
        description: "Your post has been successfully deleted"
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Your Posts</h2>
          <p className="text-muted-foreground">
            Manage your blog posts
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/posts/new">
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Posts</CardTitle>
          <CardDescription>
            A list of all your blog posts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">Loading...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">You haven't created any posts yet.</p>
              <Button asChild className="mt-4">
                <Link to="/dashboard/posts/new">Create Your First Post</Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">{post.title}</TableCell>
                      <TableCell>{getStatusBadge(post.status)}</TableCell>
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
                            <Link to={`/dashboard/posts/edit/${post.id}`}>
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
