
import BlogList from "../modules/blog/components/BlogList";
import MainLayout from "../common/components/layouts/MainLayout";

export default function Blog() {
  return (
    <MainLayout>
      <div className="bg-gray-50 dark:bg-gray-900/50 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Blog</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Stay updated with our latest insights and tutorials
          </p>
        </div>
      </div>
      <BlogList />
    </MainLayout>
  );
}
