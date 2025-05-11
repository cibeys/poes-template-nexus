
import React from 'react';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Download, ExternalLink, Share2, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

type VideoFormat = {
  quality: string;
  format: string;
  size: string;
  url: string;
};

type VideoDetailProps = {
  videoId: string;
  title: string;
  thumbnail: string;
  description: string;
  channelName: string;
  channelAvatar: string;
  duration: string;
  views: string;
  publishDate: string;
  formats: VideoFormat[];
  onBack: () => void;
};

// This would be fetched from API in a real implementation
const dummyAd = {
  image: "https://via.placeholder.com/600x100/4F46E5/FFFFFF?text=TANOELUIS",
  link: "https://tanoeluis.com",
  title: "TANOELUIS Premium Services"
};

export default function VideoDownloaderDetail({ 
  videoId, 
  title, 
  thumbnail, 
  description, 
  channelName,
  channelAvatar,
  duration,
  views,
  publishDate,
  formats,
  onBack 
}: VideoDetailProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showAd, setShowAd] = React.useState(false);
  
  const handleDownload = (format: VideoFormat) => {
    // In real implementation, this would trigger the actual download
    setShowAd(true);
    
    setTimeout(() => {
      toast({
        title: "Download started",
        description: `Downloading ${title} in ${format.quality}`,
      });
      // Here you would normally initiate the download
      
      // Simulate the download start after ad is displayed
      setTimeout(() => {
        setShowAd(false);
        window.open(format.url, '_blank');
      }, 3000);
    }, 1000);
  };
  
  const closeAd = () => {
    setShowAd(false);
  };
  
  if (showAd) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-2xl w-full"
        >
          <Card className="border-2 border-primary/50">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold">
                Your download is being prepared
              </CardTitle>
              <CardDescription className="text-center">
                Please support TANOELUIS by checking out our premium services
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative w-full overflow-hidden rounded-lg mb-6">
                <img 
                  src={dummyAd.image} 
                  alt={dummyAd.title} 
                  className="w-full h-auto object-cover hover:opacity-90 transition-opacity"
                  onClick={() => window.open(dummyAd.link, '_blank')}
                />
              </div>
              
              <div className="flex items-center justify-center w-full space-x-4">
                <motion.div 
                  className="rounded-full h-12 w-12 flex items-center justify-center bg-primary text-white"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <Download className="h-6 w-6" />
                </motion.div>
                
                <div className="h-1 flex-grow bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary" 
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3 }}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button variant="outline" onClick={closeAd}>
                Skip Ad (3s)
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Video Downloader
      </Button>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-2xl font-bold line-clamp-2">{title}</CardTitle>
              <CardDescription className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline">{duration}</Badge>
                <Badge variant="outline">{views} views</Badge>
                <Badge variant="outline">{publishDate}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img 
                  src={thumbnail} 
                  alt={title} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex items-center space-x-3 pt-2">
                <Avatar>
                  <AvatarImage src={channelAvatar} />
                  <AvatarFallback>{channelName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{channelName}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Content Creator</p>
                </div>
              </div>
              
              <div className="pt-4">
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line line-clamp-4">
                  {description}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Download Options</CardTitle>
              <CardDescription>Select your preferred format and quality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formats.map((format, index) => (
                <motion.div 
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{format.quality}</h3>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {format.format} · {format.size}
                      </div>
                    </div>
                    <Button onClick={() => handleDownload(format)} size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </motion.div>
              ))}
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(window.location.href)}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Watch Original
                </a>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">How to use</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                <li>Select your preferred video quality and format</li>
                <li>Click the download button</li>
                <li>Wait for the download to start</li>
                <li>Enjoy your video offline!</li>
              </ol>
            </CardContent>
            <CardFooter className="pt-2">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                For personal use only. Respect copyright laws and the content creator's rights.
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
