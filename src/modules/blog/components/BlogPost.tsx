import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Tag, Clock, Eye } from "lucide-react";
import CodeBlock from "./CodeBlock";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<any | null>(null);
  const [author, setAuthor] = useState<any | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        setLoading(true);
        
        // Fetch the blog post
        const { data: postData, error: postError } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("slug", slug)
          .single();
        
        if (postError) throw postError;
        
        if (postData) {
          setPost(postData);
          
          // Update view count
          await supabase
            .from("blog_posts")
            .update({ view_count: (postData.view_count || 0) + 1 })
            .eq("id", postData.id);
          
          // Fetch author details
          if (postData.author_id) {
            const { data: authorData } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", postData.author_id)
              .single();
            
            setAuthor(authorData);
          }
          
          // Fetch categories
          const { data: categoryRelations } = await supabase
            .from("post_categories")
            .select("category_id")
            .eq("post_id", postData.id);
          
          if (categoryRelations && categoryRelations.length > 0) {
            const categoryIds = categoryRelations.map(rel => rel.category_id);
            const { data: categoryData } = await supabase
              .from("categories")
              .select("*")
              .in("id", categoryIds);
            
            setCategories(categoryData || []);
          }
        }
      } catch (error) {
        console.error("Error fetching blog post:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (slug) {
      fetchBlogPost();
    }
  }, [slug]);

  // Function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric", 
      month: "long", 
      day: "numeric"
    });
  };

  // Function to estimate read time
  const estimateReadTime = (content: string) => {
    if (!content) return "1 min read";
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  // Function to render content with code blocks
  const renderContent = (content: string) => {
    if (!content) return null;

    // Split content on code blocks
    const parts = content.split(/```([\s\S]*?)```/);
    
    return parts.map((part, index) => {
      // If index is odd, it's a code block
      if (index % 2 === 1) {
        // Extract language and code
        const firstLineBreak = part.indexOf('\n');
        const language = firstLineBreak > 0 ? part.substring(0, firstLineBreak).trim() : '';
        const code = firstLineBreak > 0 ? part.substring(firstLineBreak + 1) : part;
        
        return <CodeBlock key={index} language={language} code={code} />;
      }
      
      // Otherwise it's regular text, render with paragraphs
      return (
        <div key={index} className="prose dark:prose-invert max-w-none">
          {part.split('\n\n').map((paragraph, pIndex) => (
            <p key={pIndex}>{paragraph}</p>
          ))}
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <div className="flex items-center space-x-4 mb-8">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-60 w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold">Blog post not found</h1>
          <p className="mt-4 text-muted-foreground">
            The blog post you are looking for does not exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Featured image */}
        {post.featured_image && (
          <div className="mb-8 overflow-hidden rounded-lg shadow-md">
            <img 
              src={post.featured_image} 
              alt={post.title} 
              className="w-full h-auto object-cover"
            />
          </div>
        )}
        
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{post.title}</h1>
        
        {/* Meta information */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {/* Author */}
              {author && (
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={author.avatar_url} alt={author.full_name || author.username} />
                    <AvatarFallback>
                      {(author.full_name || author.username || "").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{author.full_name || author.username}</span>
                </div>
              )}
              
              {/* Date */}
              {post.publish_date && (
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formatDate(post.publish_date)}</span>
                </div>
              )}
              
              {/* Read time */}
              <div className="flex items-center text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                <span>{estimateReadTime(post.content)}</span>
              </div>
              
              {/* View count */}
              <div className="flex items-center text-muted-foreground">
                <Eye className="h-4 w-4 mr-1" />
                <span>{post.view_count || 0} views</span>
              </div>
            </div>
            
            {/* Categories */}
            {categories.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <div 
                    key={category.id}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs flex items-center"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {category.name}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Excerpt */}
        {post.excerpt && (
          <div className="mb-6">
            <p className="text-lg text-muted-foreground italic leading-relaxed">
              {post.excerpt}
            </p>
            <Separator className="my-6" />
          </div>
        )}
        
        {/* Content */}
        <article className="prose dark:prose-invert max-w-none">
          {renderContent(post.content || "")}
        </article>
      </div>
    </div>
  );
}
