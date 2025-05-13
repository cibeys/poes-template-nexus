
import { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusCircle, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BlogPost } from "@/types/supabase-custom";
import { Profile } from "@/types/supabase-custom";
import { Link, useNavigate } from "react-router-dom";

export default function AdminBlogPosts() {
  const [posts, setPosts] = useState<(BlogPost & { author?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          author:author_id(id, full_name, username, avatar_url)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // @ts-ignore - We know the structure from our join
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Failed to load blog posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const updatePostStatus = async (id: string, status: 'draft' | 'published' | 'archived') => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      setPosts(posts.map(post => 
        post.id === id ? { ...post, status } : post
      ));
      
      toast({
        title: "Status updated",
        description: `Post status changed to ${status}`
      });
    } catch (error) {
      console.error("Error updating post status:", error);
      toast({
        title: "Error",
        description: "Failed to update post status",
        variant: "destructive"
      });
    }
  };
  
  const deletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setPosts(posts.filter(post => post.id !== id));
      
      toast({
        title: "Post deleted",
        description: "The post has been permanently deleted"
      });
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive"
      });
    }
  };
  
  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blog Posts</h1>
          <p className="text-muted-foreground">
            Manage all blog posts across the site
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/admin/blog-posts/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              className="pl-8" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No posts found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>A list of all blog posts</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>{post.author?.full_name || post.author?.username || 'Unknown'}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          post.status === "published" ? "default" :
                          post.status === "draft" ? "secondary" : "destructive"
                        }
                      >
                        {post.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{post.view_count || 0}</TableCell>
                    <TableCell>{new Date(post.created_at || '').toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/dashboard/admin/blog-posts/edit/${post.id}`)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => updatePostStatus(post.id, "published")}
                          >
                            Publish
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => updatePostStatus(post.id, "draft")}
                          >
                            Mark as Draft
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => updatePostStatus(post.id, "archived")}
                            className="text-red-600"
                          >
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deletePost(post.id)}
                            className="text-red-600"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
