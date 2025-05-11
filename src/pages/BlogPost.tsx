
import { Suspense } from "react";
import BlogPostComponent from "../modules/blog/components/BlogPost";
import MainLayout from "../common/components/layouts/MainLayout";
import { Skeleton } from "@/components/ui/skeleton";

export default function BlogPost() {
  return (
    <MainLayout>
      <Suspense fallback={
        <div className="container mx-auto p-6">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-[400px] w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        </div>
      }>
        <BlogPostComponent />
      </Suspense>
    </MainLayout>
  );
}
