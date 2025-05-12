
import { Suspense } from "react";
import BlogPostComponent from "../modules/blog/components/BlogPost";
import MainLayout from "../common/components/layouts/MainLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function BlogPost() {
  return (
    <MainLayout>
      <Suspense fallback={
        <motion.div 
          className="container mx-auto p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-[400px] w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        </motion.div>
      }>
        <BlogPostComponent />
      </Suspense>
    </MainLayout>
  );
}
