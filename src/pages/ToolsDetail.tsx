
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import MainLayout from "@/common/components/layouts/MainLayout";
import Calculator from '@/modules/tools/components/Calculator';
import TypingSpeedTest from '@/modules/tools/components/TypingSpeedTest';
import TextCleaner from '@/modules/tools/components/TextCleaner';
import WeatherChecker from '@/modules/tools/components/WeatherChecker';
import LocationFinder from '@/modules/tools/components/LocationFinder';
import SlotGame from '@/modules/tools/components/SlotGame';
import PomodoroTimer from '@/modules/tools/components/PomodoroTimer';
import UnitConverter from '@/modules/tools/components/UnitConverter';
import QrCodeGenerator from '@/modules/tools/components/QrCodeGenerator';
import ModelViewer from '@/modules/tools/components/ModelViewer';

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
      case 'weather':
        return <WeatherChecker />;
      case 'location':
        return <LocationFinder />;
      case 'slot-game':
        return <SlotGame />;
      case 'timer':
        return <PomodoroTimer />;
      case 'converter':
        return <UnitConverter />;
      case 'qr-code':
        return <QrCodeGenerator />;
      case '3d-viewer':
        return <ModelViewer />;
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
