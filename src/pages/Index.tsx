
import HeroSection from "../modules/home/components/HeroSection";
import FeaturesSection from "../modules/home/components/FeaturesSection";
import BlogPreviewSection from "../modules/home/components/BlogPreviewSection";
import TemplatePreviewSection from "../modules/home/components/TemplatePreviewSection";
import NewsletterSection from "../modules/home/components/NewsletterSection";
import MainLayout from "../common/components/layouts/MainLayout";
import Hero3DScene from "../modules/home/components/3DHeroScene";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Index() {
  const isMobile = useIsMobile();
  
  return (
    <MainLayout>
      <div className="relative">
        <HeroSection />
        {!isMobile && (
          <motion.div 
            className="absolute top-0 right-0 w-1/2 h-full z-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <Hero3DScene />
          </motion.div>
        )}
      </div>
      <FeaturesSection />
      <BlogPreviewSection />
      <TemplatePreviewSection />
      <NewsletterSection />
    </MainLayout>
  );
}
