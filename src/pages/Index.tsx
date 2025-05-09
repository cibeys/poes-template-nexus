
import HeroSection from "../modules/home/components/HeroSection";
import FeaturesSection from "../modules/home/components/FeaturesSection";
import BlogPreviewSection from "../modules/home/components/BlogPreviewSection";
import TemplatePreviewSection from "../modules/home/components/TemplatePreviewSection";
import NewsletterSection from "../modules/home/components/NewsletterSection";
import MainLayout from "../common/components/layouts/MainLayout";

export default function Index() {
  return (
    <MainLayout>
      <HeroSection />
      <FeaturesSection />
      <BlogPreviewSection />
      <TemplatePreviewSection />
      <NewsletterSection />
    </MainLayout>
  );
}
