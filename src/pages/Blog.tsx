
import { useState } from "react";
import BlogList from "../modules/blog/components/BlogList";
import MainLayout from "../common/components/layouts/MainLayout";
import BlogEditor from "../modules/blog/components/BlogEditor";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Blog() {
  const [showEditor, setShowEditor] = useState(false);
  const { user } = useAuth();
  
  return (
    <MainLayout>
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/5 dark:to-accent/5 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Blog</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Stay updated with our latest insights and tutorials
            </p>
            
            {user && (
              <Button 
                onClick={() => setShowEditor(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Write a Blog Post
              </Button>
            )}
          </motion.div>
        </div>
      </div>
      
      <BlogList />
      
      {showEditor && (
        <BlogEditor onClose={() => setShowEditor(false)} />
      )}
    </MainLayout>
  );
}
