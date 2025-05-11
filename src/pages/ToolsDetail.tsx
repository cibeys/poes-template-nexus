
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import MainLayout from "@/common/components/layouts/MainLayout";
import Calculator from '@/modules/tools/components/Calculator';
import TypingSpeedTest from '@/modules/tools/components/TypingSpeedTest';
import TextCleaner from '@/modules/tools/components/TextCleaner';

export default function ToolsDetail() {
  const { toolId } = useParams<{ toolId: string }>();
  
  const renderToolComponent = () => {
    switch (toolId) {
      case 'calculator':
        return <Calculator />;
      case 'typing-speed':
        return <TypingSpeedTest />;
      case 'text-cleaner':
        return <TextCleaner />;
      default:
        return <Navigate to="/tools" replace />;
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4">
        {renderToolComponent()}
      </div>
    </MainLayout>
  );
}
