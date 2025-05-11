
import React from 'react';
import { Calculator, Thermometer, MapPin, Clock, Gamepad2, CloudRain, FileText, KeySquare, Zap, Box, Type } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const tools = [
  {
    id: 'calculator',
    title: 'Calculator',
    description: 'Basic and scientific calculator for your calculations',
    icon: <Calculator className="h-10 w-10 text-primary" />,
    path: '/tools/calculator'
  },
  {
    id: 'weather',
    title: 'Weather Checker',
    description: 'Check current weather conditions in any city',
    icon: <CloudRain className="h-10 w-10 text-primary" />,
    path: '/tools/weather'
  },
  {
    id: 'location',
    title: 'Location Finder',
    description: 'Find and track locations on an interactive map',
    icon: <MapPin className="h-10 w-10 text-primary" />,
    path: '/tools/location'
  },
  {
    id: 'typing-speed',
    title: 'Typing Speed Test',
    description: 'Test and improve your typing speed and accuracy',
    icon: <KeySquare className="h-10 w-10 text-primary" />,
    path: '/tools/typing-speed'
  },
  {
    id: 'text-cleaner',
    title: 'Text Cleaner',
    description: 'Clean and transform text with various operations',
    icon: <Type className="h-10 w-10 text-primary" />,
    path: '/tools/text-cleaner'
  },
  {
    id: 'slot-game',
    title: 'Mini Slot Game',
    description: 'Play a fun slot machine game with beautiful animations',
    icon: <Gamepad2 className="h-10 w-10 text-primary" />,
    path: '/tools/slot-game'
  },
  {
    id: 'timer',
    title: 'Pomodoro Timer',
    description: 'Stay productive with this customizable pomodoro timer',
    icon: <Clock className="h-10 w-10 text-primary" />,
    path: '/tools/timer'
  },
  {
    id: 'unit-converter',
    title: 'Unit Converter',
    description: 'Convert between different units of measurement',
    icon: <Thermometer className="h-10 w-10 text-primary" />,
    path: '/tools/converter'
  },
  {
    id: 'qr-generator',
    title: 'QR Code Generator',
    description: 'Generate QR codes for links, text, and more',
    icon: <Zap className="h-10 w-10 text-primary" />,
    path: '/tools/qr-code'
  },
  {
    id: '3d-viewer',
    title: '3D Model Viewer',
    description: 'View and interact with 3D models in your browser',
    icon: <Box className="h-10 w-10 text-primary" />,
    path: '/tools/3d-viewer'
  }
];

export default function ToolsGrid() {
  const navigate = useNavigate();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {tools.map((tool) => (
          <motion.div key={tool.id} variants={item}>
            <Card className="hover:shadow-lg transition-all hover:scale-102 h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xl font-bold">{tool.title}</CardTitle>
                {tool.icon}
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                  {tool.description}
                </CardDescription>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                  onClick={() => navigate(tool.path)}
                >
                  Open Tool
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
