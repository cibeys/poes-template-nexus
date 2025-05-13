
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";

// Define the form schema
const blogPostSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long" }),
  excerpt: z.string().min(10, { message: "Excerpt must be at least 10 characters long" }).optional(),
  content: z.string().min(50, { message: "Content must be at least 50 characters long" }),
  slug: z.string().min(3, { message: "Slug must be at least 3 characters long" })
    .regex(/^[a-z0-9-]+$/, { 
      message: "Slug can only contain lowercase letters, numbers, and hyphens" 
    }),
  featured_image: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

type BlogPostFormValues = z.infer<typeof blogPostSchema>;

export default function CrudBlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  
  // Initialize form with default values
  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      slug: "",
      featured_image: "",
      status: "draft",
    },
  });
  
  // Fetch blog post data if editing
  useEffect(() => {
    const fetchBlogPost = async () => {
      if (!id) {
        setInitialLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("id", id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          form.reset({
            title: data.title,
            excerpt: data.excerpt || "",
            content: data.content || "",
            slug: data.slug,
            featured_image: data.featured_image || "",
            status: data.status || "draft",
          });
        }
      } catch (error) {
        console.error("Error fetching blog post:", error);
        toast({
          title: "Error",
          description: "Failed to load blog post data",
          variant: "destructive"
        });
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchBlogPost();
  }, [id, form, toast]);
  
  const onSubmit = async (data: BlogPostFormValues) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to create or edit blog posts", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    
    try {
      if (id) {
        // Update existing blog post
        const { error } = await supabase
          .from("blog_posts")
          .update({
            title: data.title,
            excerpt: data.excerpt || null,
            content: data.content,
            slug: data.slug,
            featured_image: data.featured_image || null,
            status: data.status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);
          
        if (error) throw error;
        
        toast({
          title: "Blog post updated",
          description: "Your blog post has been updated successfully",
        });
      } else {
        // Create new blog post
        const { error } = await supabase
          .from("blog_posts")
          .insert({
            title: data.title,
            excerpt: data.excerpt || null,
            content: data.content,
            slug: data.slug,
            featured_image: data.featured_image || null,
            status: data.status,
            author_id: user.id,
          });
          
        if (error) throw error;
        
        toast({
          title: "Blog post created",
          description: "Your blog post has been created successfully",
        });
      }
      
      // Redirect back to blog post list
      navigate("/dashboard/admin/blog-posts");
    } catch (error: any) {
      console.error("Error saving blog post:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save blog post",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">
          {id ? "Edit Blog Post" : "Create New Blog Post"}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Blog Post Details</CardTitle>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Blog post title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="blog-post-slug" {...field} />
                      </FormControl>
                      <FormDescription>
                        Used for the URL (e.g., /blog/blog-post-slug)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excerpt</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="A short summary of your blog post..." 
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This will be displayed in blog post listings
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Write your blog post content here..." 
                        rows={10}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="featured_image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Featured Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.png" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Only published posts will be visible on the blog
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {id ? "Update Blog Post" : "Create Blog Post"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
