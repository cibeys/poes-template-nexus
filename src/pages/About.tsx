
import { Link } from "react-router-dom";
import MainLayout from "../common/components/layouts/MainLayout";

export default function About() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 md:px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">About POES</h1>
        <div className="max-w-3xl">
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            POES is a premium resource hub for web developers and designers. We provide high-quality templates, in-depth blog articles, and code snippets to help you build better web applications.
          </p>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Our mission is to accelerate your development workflow with ready-to-use resources and practical knowledge. Whether you're building a personal project or working on client websites, POES has the tools and guidance you need.
          </p>
          
          <div className="my-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-3">Our Templates</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                All templates are built with modern technologies like React, TypeScript, and Tailwind CSS. They're responsive, accessible, and easy to customize.
              </p>
              <Link
                to="/templates"
                className="text-primary hover:underline"
              >
                Browse templates
              </Link>
            </div>
            
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-3">Our Blog</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Our blog features practical tutorials, best practices, and insights about web development. We focus on actionable content with real-world code examples.
              </p>
              <Link
                to="/blog"
                className="text-primary hover:underline"
              >
                Read articles
              </Link>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Have questions or suggestions? We'd love to hear from you. Contact us at <a href="mailto:info@poes.dev" className="text-primary hover:underline">info@poes.dev</a>.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
