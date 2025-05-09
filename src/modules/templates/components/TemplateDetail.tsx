
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Download, Eye, Check, Code, Layout, Users, Clock, Calendar } from "lucide-react";

// Mock template data
const templateData = {
  id: 1,
  title: "Dashboard Pro",
  description: "Modern admin dashboard template with dark mode and responsive design.",
  longDescription: "Dashboard Pro is a comprehensive admin dashboard template designed for modern web applications. It features a clean, intuitive interface with responsive layouts that work on all devices. The template includes a dark mode toggle, interactive charts, customizable widgets, and a variety of pre-built components to accelerate your development process.",
  imageUrl: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=1480",
  previewImages: [
    "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=1480",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=1470",
    "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=1472",
  ],
  category: "Admin",
  framework: "React",
  tags: ["Dashboard", "Admin", "Dark Mode", "Responsive", "Charts", "Widgets"],
  downloads: 1250,
  featured: true,
  version: "1.2.0",
  lastUpdated: "2023-09-15",
  author: {
    name: "POES Team",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=1470",
  },
  features: [
    "Responsive design that works on all devices",
    "Dark and light mode support",
    "Interactive charts and graphs",
    "Customizable widgets and components",
    "Authentication pages (login, register, forgot password)",
    "User management interfaces",
    "Settings and configuration pages",
    "Data tables with sorting and filtering",
    "Form components with validation",
    "Notification system"
  ],
  techStack: [
    { name: "React", icon: "React" },
    { name: "TypeScript", icon: "TypeScript" },
    { name: "Tailwind CSS", icon: "TailwindCSS" },
    { name: "Recharts", icon: "Charts" }
  ],
  relatedTemplates: [
    {
      id: 2,
      title: "E-Commerce Starter",
      description: "Complete e-commerce template with product listings, cart, and checkout.",
      imageUrl: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=1470",
      slug: "/templates/ecommerce-starter"
    },
    {
      id: 5,
      title: "SaaS Landing",
      description: "High-converting SaaS landing page template with pricing tables and testimonials.",
      imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=1470",
      slug: "/templates/saas-landing"
    }
  ]
};

export default function TemplateDetail() {
  const { slug } = useParams();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // In a real app, we would fetch the template by slug
  // For now, we'll just use our mock data
  
  const handleDownload = () => {
    setIsDownloading(true);
    
    // Simulate download
    setTimeout(() => {
      setIsDownloading(false);
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <Link
        to="/templates"
        className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors mb-8"
      >
        <ArrowLeft size={16} className="mr-1" /> Back to all templates
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
            {/* Preview Image Gallery */}
            <div>
              <div className="aspect-[16/9] relative">
                <img 
                  src={templateData.previewImages[activeImageIndex]} 
                  alt={templateData.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex p-4 space-x-3 overflow-auto">
                {templateData.previewImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`w-20 h-14 rounded overflow-hidden flex-shrink-0 ${
                      index === activeImageIndex ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Description</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {templateData.longDescription}
              </p>
              
              <h3 className="text-xl font-medium mb-3">Features</h3>
              <ul className="space-y-2 mb-6">
                {templateData.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check size={18} className="mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <h3 className="text-xl font-medium mb-3">Tech Stack</h3>
              <div className="flex flex-wrap gap-3 mb-6">
                {templateData.techStack.map((tech) => (
                  <div 
                    key={tech.name}
                    className="flex items-center px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-md"
                  >
                    {tech.icon === "React" && <Code size={16} className="mr-2" />}
                    {tech.icon === "TypeScript" && <Code size={16} className="mr-2" />}
                    {tech.icon === "TailwindCSS" && <Layout size={16} className="mr-2" />}
                    {tech.icon === "Charts" && <Layout size={16} className="mr-2" />}
                    {tech.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Related Templates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templateData.relatedTemplates.map(template => (
                  <Link
                    key={template.id}
                    to={template.slug}
                    className="flex bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow group"
                  >
                    <div className="w-1/3">
                      <img 
                        src={template.imageUrl} 
                        alt={template.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-2/3 p-3">
                      <h4 className="font-medium group-hover:text-primary transition-colors">
                        {template.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden sticky top-24">
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-2">{templateData.title}</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {templateData.description}
              </p>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Category</span>
                  <span className="font-medium">{templateData.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Framework</span>
                  <span className="font-medium">{templateData.framework}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Version</span>
                  <span className="font-medium">{templateData.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Downloads</span>
                  <span className="font-medium">{templateData.downloads.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Last Updated</span>
                  <span className="font-medium flex items-center">
                    <Calendar size={14} className="mr-1" />
                    {templateData.lastUpdated}
                  </span>
                </div>
              </div>
              
              <div className="border-t dark:border-gray-700 pt-6 mb-6">
                <div className="flex items-center mb-4">
                  <img 
                    src={templateData.author.avatar}
                    alt={templateData.author.name}
                    className="w-8 h-8 rounded-full mr-3"
                  />
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Created by</span>
                    <p className="font-medium">{templateData.author.name}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={handleDownload}
                  className="w-full py-3 bg-primary text-white rounded-md flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <>
                      <Check size={18} /> Downloaded
                    </>
                  ) : (
                    <>
                      <Download size={18} /> Download Template
                    </>
                  )}
                </button>
                <a
                  href="#"
                  className="w-full py-3 border border-gray-300 dark:border-gray-700 rounded-md flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Eye size={18} /> Live Preview
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
