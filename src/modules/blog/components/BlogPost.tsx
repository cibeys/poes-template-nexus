
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Calendar, Eye, Clock, User, Share2, Facebook, Twitter, Linkedin, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import CodeBlock from './CodeBlock';
import { motion } from 'framer-motion';

// Define blog post interface
interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author_id: string;
  featured_image: string;
  publish_date: string;
  slug: string;
  view_count: number;
  created_at: string;
  author?: {
    full_name: string;
    username: string;
    avatar_url: string;
  };
  categories?: {
    name: string;
    slug: string;
  }[];
}

// Mock blog post data - replace with Supabase data in production
const mockBlogPost: BlogPost = {
  id: "1",
  title: "Understanding React Hooks: A Comprehensive Guide",
  content: `
  # Understanding React Hooks

  React Hooks were introduced in React 16.8 and have completely changed how we build React components. In this post, we'll explore the most common hooks and how to use them effectively.

  ## useState Hook

  The \`useState\` hook allows you to add state to your functional components. Let's see a basic example:

  \`\`\`jsx
  import React, { useState } from 'react';
  
  function Counter() {
    const [count, setCount] = useState(0);
    
    return (
      <div>
        <p>You clicked {count} times</p>
        <button onClick={() => setCount(count + 1)}>
          Click me
        </button>
      </div>
    );
  }
  \`\`\`

  ## useEffect Hook

  The \`useEffect\` hook lets you perform side effects in functional components. Here's how you might use it:

  \`\`\`jsx
  import React, { useState, useEffect } from 'react';
  
  function Example() {
    const [data, setData] = useState(null);
    
    useEffect(() => {
      const fetchData = async () => {
        const response = await fetch('https://api.example.com/data');
        const json = await response.json();
        setData(json);
      };
      
      fetchData();
    }, []); // Empty dependency array means this effect runs once on mount
    
    return (
      <div>
        {data ? (
          <p>Data loaded: {JSON.stringify(data)}</p>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    );
  }
  \`\`\`

  ## useContext Hook

  The \`useContext\` hook allows you to access context data without wrapping your components in context consumers.

  \`\`\`jsx
  import React, { useContext } from 'react';
  import { ThemeContext } from './theme-context';
  
  function ThemedButton() {
    const theme = useContext(ThemeContext);
    
    return (
      <button style={{ background: theme.background, color: theme.foreground }}>
        Styled by theme context!
      </button>
    );
  }
  \`\`\`

  ## useReducer Hook

  The \`useReducer\` hook is an alternative to \`useState\` when you have complex state logic:

  \`\`\`jsx
  import React, { useReducer } from 'react';
  
  // Reducer function
  function counterReducer(state, action) {
    switch (action.type) {
      case 'increment':
        return { count: state.count + 1 };
      case 'decrement':
        return { count: state.count - 1 };
      default:
        throw new Error();
    }
  }
  
  function Counter() {
    const [state, dispatch] = useReducer(counterReducer, { count: 0 });
    
    return (
      <div>
        Count: {state.count}
        <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
        <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      </div>
    );
  }
  \`\`\`

  ## Custom Hooks

  One of the great features of hooks is the ability to create your own custom hooks:

  \`\`\`jsx
  import { useState, useEffect } from 'react';

  function useWindowSize() {
    const [windowSize, setWindowSize] = useState({
      width: undefined,
      height: undefined,
    });
    
    useEffect(() => {
      function handleResize() {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
      
      window.addEventListener('resize', handleResize);
      handleResize(); // Call once to set initial size
      
      return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    return windowSize;
  }
  \`\`\`

  ## Conclusion

  React Hooks have revolutionized the way we build React components, making functional components more powerful and reducing the need for class components. By understanding and applying hooks effectively, you'll write cleaner, more maintainable React code.
  `,
  excerpt: "Learn how to effectively use React Hooks in your functional components and build cleaner React applications.",
  author_id: "1",
  featured_image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
  publish_date: "2023-05-15",
  slug: "understanding-react-hooks",
  view_count: 1240,
  created_at: "2023-05-10",
  author: {
    full_name: "Jane Smith",
    username: "janesmith",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
  },
  categories: [
    { name: "React", slug: "react" },
    { name: "JavaScript", slug: "javascript" },
    { name: "Frontend", slug: "frontend" }
  ]
};

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchBlogPost();
  }, [slug]);

  const fetchBlogPost = async () => {
    setLoading(true);
    
    try {
      // Fetch from Supabase if connected, otherwise use mock data
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select(`
            *,
            author:profiles(full_name, username, avatar_url)
          `)
          .eq('slug', slug)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setPost(data);
          // Update view count
          await supabase
            .from('blog_posts')
            .update({ view_count: (data.view_count || 0) + 1 })
            .eq('id', data.id);
          return;
        }
      } catch (dbError) {
        console.error("Database error:", dbError);
        // Fall back to mock data if database not available
      }
      
      // Use mock data if no database or for development
      setPost(mockBlogPost);
    } catch (err) {
      console.error("Error fetching blog post:", err);
      setError("Failed to load blog post");
    } finally {
      setLoading(false);
    }
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({
      title: "Link copied",
      description: "The post link has been copied to your clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <div className="flex items-center space-x-4 mb-6">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Error Loading Blog Post</h2>
        <p className="mb-6">{error}</p>
        <Button onClick={() => navigate('/blog')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Button>
      </div>
    );
  }
  
  if (!post) return null;

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Calculate reading time
  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };
  
  // Process the markdown content to render properly
  const processContent = (content: string) => {
    // Split by code blocks
    const parts = content.split(/```(\w+)?\n([\s\S]*?)```/g);
    return parts.map((part, index) => {
      // Every 3rd index is a language, and every 4th is code content
      if (index % 3 === 1) {
        return null; // Skip language identifier
      } else if (index % 3 === 2) {
        const language = parts[index - 1] || 'javascript';
        return <CodeBlock key={index} code={part} language={language} />;
      } else {
        // Process regular markdown (very basic implementation)
        return part.split('\n').map((line, lineIndex) => {
          if (line.startsWith('# ')) {
            return <h1 key={lineIndex} className="text-3xl font-bold my-6">{line.substring(2)}</h1>;
          } else if (line.startsWith('## ')) {
            return <h2 key={lineIndex} className="text-2xl font-bold my-5">{line.substring(3)}</h2>;
          } else if (line.startsWith('### ')) {
            return <h3 key={lineIndex} className="text-xl font-bold my-4">{line.substring(4)}</h3>;
          } else if (line.trim() === '') {
            return <br key={lineIndex} />;
          } else {
            return <p key={lineIndex} className="my-4 leading-relaxed">{line}</p>;
          }
        });
      }
    });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 min-h-screen pb-16">
      {/* Hero section with featured image */}
      <div className="relative w-full h-[40vh] md:h-[50vh] overflow-hidden">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <img 
          src={post.featured_image} 
          alt={post.title} 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="container px-4 text-center">
            <motion.h1 
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {post.title}
            </motion.h1>
            <motion.div 
              className="flex flex-wrap justify-center gap-2 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              {post.categories?.map(category => (
                <Badge key={category.slug} variant="secondary" className="bg-white/20 hover:bg-white/30">
                  {category.name}
                </Badge>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
      
      <motion.div 
        className="container mx-auto px-4 py-8 max-w-4xl relative z-10 -mt-20"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 md:p-10">
          {/* Post metadata */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarImage src={post.author?.avatar_url} alt={post.author?.full_name} />
                <AvatarFallback>{post.author?.full_name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{post.author?.full_name || 'Unknown Author'}</h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {post.author?.username && `@${post.author.username}`}
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(post.publish_date || post.created_at)}
              </div>
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                {post.view_count || 0} views
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {calculateReadingTime(post.content)} min read
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          {/* Post content */}
          <div className="prose dark:prose-invert prose-lg max-w-none">
            {processContent(post.content)}
          </div>
          
          <Separator className="my-8" />
          
          {/* Post footer with share buttons */}
          <div className="pt-4">
            <h4 className="text-lg font-semibold mb-4">Share this post</h4>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')}>
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`, '_blank')}>
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')}>
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
              <Button variant="outline" size="sm" onClick={copyLink}>
                {copied ? (
                  <><Check className="h-4 w-4 mr-2" /> Copied</>
                ) : (
                  <><Copy className="h-4 w-4 mr-2" /> Copy Link</>
                )}
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => navigate('/blog')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
