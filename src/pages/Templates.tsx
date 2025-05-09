
import TemplateList from "../modules/templates/components/TemplateList";
import MainLayout from "../common/components/layouts/MainLayout";

export default function Templates() {
  return (
    <MainLayout>
      <div className="bg-gray-50 dark:bg-gray-900/50 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Templates</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse our collection of premium templates for your next project
          </p>
        </div>
      </div>
      <TemplateList />
    </MainLayout>
  );
}
