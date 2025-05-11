
import React from 'react';
import MainLayout from "@/common/components/layouts/MainLayout";
import ToolsGrid from "@/modules/tools/components/ToolsGrid";

export default function ToolsPage() {
  return (
    <MainLayout>
      <div className="bg-gradient-to-br from-primary/10 to-accent/5 dark:from-primary/5 dark:to-accent/5 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-fade-in">
            Interactive Tools
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl animate-fade-in delay-100">
            Explore our collection of interactive tools designed to enhance your productivity and creativity
          </p>
        </div>
      </div>
      <ToolsGrid />
    </MainLayout>
  );
}
