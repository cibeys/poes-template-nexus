
import { ArrowLeft, Calendar, Clock, Share2, Heart, MessageSquare } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import CodeBlock from "./CodeBlock";

// Mock data for blog post
const blogPost = {
  id: 1,
  title: "Building Modern UIs with React and Tailwind CSS",
  excerpt: "Learn how to combine React and Tailwind CSS to create beautiful, responsive user interfaces for your web applications.",
  imageUrl: "https://images.unsplash.com/photo-1618761714954-0b8cd0026356?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=1470",
  category: "Frontend",
  tags: ["React", "TailwindCSS", "UI/UX"],
  readTime: "7 min read",
  date: "May 15, 2023",
  author: {
    name: "John Doe",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=1470",
    role: "Frontend Developer"
  },
  content: [
    {
      type: "paragraph",
      content: "React and Tailwind CSS have become incredibly popular tools for building modern web interfaces. React offers a component-based architecture and efficient rendering, while Tailwind provides utility classes for rapid UI development. When combined, they create a powerful workflow for building responsive and visually appealing user interfaces."
    },
    {
      type: "heading",
      content: "Setting Up Your Project"
    },
    {
      type: "paragraph",
      content: "To get started with React and Tailwind CSS, you'll need to set up your development environment. Here's how to create a new React project with Tailwind CSS integrated:"
    },
    {
      type: "code",
      language: "bash",
      content: "# Create a new React project\nnpx create-react-app my-project\ncd my-project\n\n# Install Tailwind CSS and its dependencies\nnpm install -D tailwindcss postcss autoprefixer\n\n# Generate the configuration files\nnpx tailwindcss init -p"
    },
    {
      type: "paragraph",
      content: "After initializing Tailwind CSS, you need to configure it to scan your React components for class names. Open the tailwind.config.js file and update the content array:"
    },
    {
      type: "code",
      language: "javascript",
      content: "// tailwind.config.js\nmodule.exports = {\n  content: [\n    \"./src/**/*.{js,jsx,ts,tsx}\",\n  ],\n  theme: {\n    extend: {},\n  },\n  plugins: [],\n}"
    },
    {
      type: "paragraph",
      content: "Finally, add the Tailwind directives to your CSS file (typically src/index.css):"
    },
    {
      type: "code",
      language: "css",
      content: "/* src/index.css */\n@tailwind base;\n@tailwind components;\n@tailwind utilities;"
    },
    {
      type: "heading",
      content: "Creating Components with React and Tailwind"
    },
    {
      type: "paragraph",
      content: "With our setup complete, let's create a simple component using React and Tailwind CSS. Here's an example of a card component:"
    },
    {
      type: "code",
      language: "jsx",
      content: "import React from 'react';\n\nfunction Card({ title, description, imageUrl }) {\n  return (\n    <div className=\"max-w-sm rounded overflow-hidden shadow-lg bg-white hover:shadow-xl transition-shadow duration-300\">\n      <img className=\"w-full h-48 object-cover\" src={imageUrl} alt={title} />\n      <div className=\"px-6 py-4\">\n        <h3 className=\"font-bold text-xl mb-2 text-gray-800\">{title}</h3>\n        <p className=\"text-gray-600 text-base\">{description}</p>\n      </div>\n      <div className=\"px-6 pt-4 pb-2\">\n        <button className=\"bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded\">\n          Learn More\n        </button>\n      </div>\n    </div>\n  );\n}\n\nexport default Card;"
    },
    {
      type: "paragraph",
      content: "This component uses various Tailwind utility classes for styling, such as rounded for border-radius, shadow-lg for box shadow, and text-gray-800 for text color. The hover:shadow-xl class demonstrates how you can use modifiers to add interactive styles."
    },
    {
      type: "heading",
      content: "Responsive Design with Tailwind Classes"
    },
    {
      type: "paragraph",
      content: "One of Tailwind's strengths is its approach to responsive design. You can use breakpoint prefixes like sm:, md:, lg:, and xl: to apply styles at specific screen sizes. Here's an example of a responsive grid layout:"
    },
    {
      type: "code",
      language: "jsx",
      content: "function CardGrid({ cards }) {\n  return (\n    <div className=\"grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6\">\n      {cards.map((card) => (\n        <Card key={card.id} {...card} />\n      ))}\n    </div>\n  );\n}"
    },
    {
      type: "paragraph",
      content: "This grid will have one column on small screens, two columns on SM breakpoint, three columns on MD breakpoint, and four columns on LG breakpoint. The gap-6 class adds spacing between the cards."
    },
    {
      type: "heading",
      content: "Customizing Tailwind for Your Brand"
    },
    {
      type: "paragraph",
      content: "Tailwind makes it easy to customize colors, fonts, and other design tokens to match your brand. Open tailwind.config.js and extend the theme object:"
    },
    {
      type: "code",
      language: "javascript",
      content: "// tailwind.config.js\nmodule.exports = {\n  content: [\n    \"./src/**/*.{js,jsx,ts,tsx}\",\n  ],\n  theme: {\n    extend: {\n      colors: {\n        primary: '#3B82F6',\n        secondary: '#10B981',\n        dark: '#1F2937',\n      },\n      fontFamily: {\n        sans: ['Inter', 'sans-serif'],\n        heading: ['Poppins', 'sans-serif'],\n      },\n      borderRadius: {\n        'xl': '1rem',\n        '2xl': '1.5rem',\n      },\n    },\n  },\n  plugins: [],\n}"
    },
    {
      type: "paragraph",
      content: "With these customizations, you can now use classes like text-primary, font-heading, and rounded-2xl in your components."
    },
    {
      type: "heading",
      content: "Conclusion"
    },
    {
      type: "paragraph",
      content: "The combination of React and Tailwind CSS provides a powerful toolkit for building modern UIs. React's component model pairs perfectly with Tailwind's utility-first approach, enabling rapid development without sacrificing design quality or performance. By leveraging the techniques shown in this article, you can create beautiful, responsive, and maintainable user interfaces for your web applications."
    }
  ],
  relatedPosts: [
    {
      id: 2,
      title: "Optimizing Performance in React Applications",
      excerpt: "Discover best practices for improving the performance of your React applications through code splitting and memoization.",
      imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=1470",
      slug: "/blog/optimizing-react-performance"
    },
    {
      id: 3,
      title: "Introduction to TypeScript for React Developers",
      excerpt: "A comprehensive guide to using TypeScript with React to build type-safe applications with enhanced developer experience.",
      imageUrl: "https://images.unsplash.com/photo-1562813733-b31f71025d54?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=1469",
      slug: "/blog/typescript-for-react-devs"
    }
  ]
};

export default function BlogPost() {
  const { slug } = useParams();
  
  // In a real app, we would fetch the post by slug
  // For now, we'll just use our mock data
  
  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <Link
          to="/blog"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" /> Back to all articles
        </Link>
        
        <div className="flex items-center space-x-3">
          <button
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Share article"
          >
            <Share2 size={18} />
          </button>
          <button
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Like article"
          >
            <Heart size={18} />
          </button>
        </div>
      </div>
      
      <article>
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2.5 py-0.5 bg-primary/10 dark:bg-primary/20 text-primary text-sm font-medium rounded-full">
              {blogPost.category}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {blogPost.title}
          </h1>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <img
                src={blogPost.author.avatarUrl}
                alt={blogPost.author.name}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {blogPost.author.name}
                </p>
                <p className="text-sm">{blogPost.author.role}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center">
                <Calendar size={16} className="mr-1" />
                <span className="text-sm">{blogPost.date}</span>
              </div>
              <div className="flex items-center">
                <Clock size={16} className="mr-1" />
                <span className="text-sm">{blogPost.readTime}</span>
              </div>
            </div>
          </div>
        </header>
        
        <div className="mb-10">
          <div className="rounded-lg overflow-hidden mb-8">
            <img
              src={blogPost.imageUrl}
              alt={blogPost.title}
              className="w-full h-auto object-cover"
            />
          </div>
          
          <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-semibold prose-a:text-primary">
            {blogPost.content.map((block, index) => {
              switch (block.type) {
                case "paragraph":
                  return <p key={index}>{block.content}</p>;
                case "heading":
                  return <h2 key={index} className="text-2xl font-bold mt-10 mb-4">{block.content}</h2>;
                case "code":
                  return <CodeBlock key={index} language={block.language} code={block.content} />;
                default:
                  return null;
              }
            })}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-8">
          {blogPost.tags.map(tag => (
            <Link 
              key={tag} 
              to={`/blog/tag/${tag.toLowerCase()}`}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
        
        <div className="border-t dark:border-gray-800 pt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Related Articles</h3>
            <Link
              to="/blog"
              className="text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogPost.relatedPosts.map(post => (
              <Link 
                key={post.id} 
                to={post.slug}
                className="flex bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all group"
              >
                <div className="w-1/3">
                  <img 
                    src={post.imageUrl} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-2/3 p-4">
                  <h4 className="font-medium text-lg mb-1 group-hover:text-primary transition-colors">
                    {post.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        <div className="border-t dark:border-gray-800 mt-12 pt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Discussion</h3>
            <span className="text-sm text-gray-600 dark:text-gray-400">2 comments</span>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <form className="mb-8">
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <MessageSquare size={18} /> Leave a comment
              </h4>
              <textarea
                placeholder="Share your thoughts..."
                rows={4}
                className="w-full p-3 border dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-primary dark:bg-gray-800 mb-3"
              ></textarea>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </article>
    </div>
  );
}
