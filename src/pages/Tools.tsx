
import React from 'react';
import MainLayout from "@/common/components/layouts/MainLayout";
import ToolsGrid from "@/modules/tools/components/ToolsGrid";
import { motion } from "framer-motion";

export default function Tools() {
  return (
    <MainLayout>
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/5 dark:to-accent/5">
        <div className="container mx-auto py-12 px-4 text-center">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Useful Tools
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Discover our collection of free tools to boost your productivity and enhance your digital experience.
          </motion.p>
        </div>
      </div>
      
      <div className="container mx-auto py-12 px-4">
        <ToolsGrid />
      </div>
    </MainLayout>
  );
}
