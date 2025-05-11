
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Check, AlertCircle, Youtube, Instagram, Facebook, TikTok, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/common/components/layouts/MainLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import VideoDownloaderDetail from '@/modules/tools/components/VideoDownloaderDetail';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

export default function VideoDownloader() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState("youtube");
  const { toast } = useToast();

  // Mock video details - in a real app, this would come from an API
  const videoDetail = {
    videoId: "dQw4w9WgXcQ",
    title: "Rick Astley - Never Gonna Give You Up (Official Music Video)",
    thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    description: "Official music video for Rick Astley - Never Gonna Give You Up\n\nListen to Rick Astley: https://RickAstley.lnk.to/_listenYD\n\nSubscribe to the official Rick Astley YouTube channel: https://RickAstley.lnk.to/subscribeYD\n\nFollow Rick Astley:\nFacebook: https://RickAstley.lnk.to/followFI\nTwitter: https://RickAstley.lnk.to/followTI\nInstagram: https://RickAstley.lnk.to/followII\nWebsite: https://RickAstley.lnk.to/followWI\nSpotify: https://RickAstley.lnk.to/followSI\n\nLyrics:\nNever gonna give you up\nNever gonna let you down\nNever gonna run around and desert you\nNever gonna make you cry\nNever gonna say goodbye\nNever gonna tell a lie and hurt you\n\n#RickAstley #NeverGonnaGiveYouUp #OfficialMusicVideo",
    channelName: "Rick Astley",
    channelAvatar: "https://yt3.googleusercontent.com/ytc/APkrFKZnwjqJUcS-5U_djTK3OqWrCzlwyHeqzVAHjJ1M=s176-c-k-c0x00ffffff-no-rj",
    duration: "3:32",
    views: "1.2B",
    publishDate: "Oct 25, 2009",
    formats: [
      { quality: "1080p", format: "MP4", size: "128MB", url: "#" },
      { quality: "720p", format: "MP4", size: "64MB", url: "#" },
      { quality: "480p", format: "MP4", size: "32MB", url: "#" },
      { quality: "360p", format: "MP4", size: "24MB", url: "#" },
      { quality: "Audio only", format: "MP3", size: "3.4MB", url: "#" },
    ]
  };

  const platformDetails = {
    youtube: {
      name: "YouTube",
      icon: <Youtube className="h-5 w-5 text-red-600" />,
      placeholder: "https://www.youtube.com/watch?v=...",
      color: "bg-red-50 dark:bg-red-950/30",
      textColor: "text-red-600 dark:text-red-400",
    },
    instagram: {
      name: "Instagram",
      icon: <Instagram className="h-5 w-5 text-pink-600" />,
      placeholder: "https://www.instagram.com/p/...",
      color: "bg-pink-50 dark:bg-pink-950/30",
      textColor: "text-pink-600 dark:text-pink-400",
    },
    facebook: {
      name: "Facebook",
      icon: <Facebook className="h-5 w-5 text-blue-600" />,
      placeholder: "https://www.facebook.com/watch/?v=...",
      color: "bg-blue-50 dark:bg-blue-950/30", 
      textColor: "text-blue-600 dark:text-blue-400",
    },
    tiktok: {
      name: "TikTok",
      icon: <TikTok className="h-5 w-5 text-black dark:text-white" />,
      placeholder: "https://www.tiktok.com/@user/video/...",
      color: "bg-gray-50 dark:bg-gray-800",
      textColor: "text-black dark:text-white",
    }
  };

  type PlatformKey = keyof typeof platformDetails;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a valid video URL",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setError(null);
    
    // In a real implementation, this would call a backend service
    try {
      // Simulate API call to process video
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Validate URL based on selected platform
      const platform = platformDetails[selectedPlatform as PlatformKey];
      
      if (url.includes(selectedPlatform)) {
        setShowDetail(true);
      } else {
        setError(`Invalid URL. Please enter a valid ${platform.name} URL.`);
      }
    } catch (error) {
      setError("Failed to process the video. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    setShowDetail(false);
    setUrl("");
  };

  // Show detail page if a video is selected
  if (showDetail) {
    return (
      <MainLayout>
        <VideoDownloaderDetail 
          {...videoDetail} 
          onBack={handleGoBack}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8 md:py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">Video Downloader</h1>
          
          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-center text-2xl">
                <Download className="mr-2 h-6 w-6" />
                Download Videos from Popular Platforms
              </CardTitle>
              <CardDescription className="text-center">
                Download videos from YouTube, Facebook, Instagram, or TikTok
              </CardDescription>
            </CardHeader>
            
            <Tabs defaultValue="youtube" value={selectedPlatform} onValueChange={setSelectedPlatform} className="w-full">
              <div className="px-6">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="youtube" className="flex items-center justify-center">
                    <Youtube className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">YouTube</span>
                  </TabsTrigger>
                  <TabsTrigger value="instagram" className="flex items-center justify-center">
                    <Instagram className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Instagram</span>
                  </TabsTrigger>
                  <TabsTrigger value="facebook" className="flex items-center justify-center">
                    <Facebook className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Facebook</span>
                  </TabsTrigger>
                  <TabsTrigger value="tiktok" className="flex items-center justify-center">
                    <TikTok className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">TikTok</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              {Object.entries(platformDetails).map(([key, platform]) => (
                <TabsContent key={key} value={key} className="space-y-4">
                  <div className={`rounded-lg p-4 ${platform.color}`}>
                    <div className="flex items-center mb-2">
                      {platform.icon}
                      <h3 className={`ml-2 font-semibold ${platform.textColor}`}>
                        {platform.name} Video Downloader
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Paste your {platform.name} video link below to download.
                    </p>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
            
            <form onSubmit={handleSubmit}>
              <CardContent>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="url"
                      placeholder={platformDetails[selectedPlatform as PlatformKey]?.placeholder || "Enter video URL..."}
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="pl-9"
                      disabled={loading}
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <motion.div
                          className="mr-2 h-4 w-4 rounded-full border-2 border-t-transparent"
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Analyze
                      </>
                    )}
                  </Button>
                </div>

                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </form>
            
            <CardFooter className="flex flex-col space-y-4 border-t pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                <div className="flex flex-col items-center text-center p-3">
                  <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3 mb-2">
                    <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm">No registration required</span>
                </div>
                <div className="flex flex-col items-center text-center p-3">
                  <div className="rounded-full bg-green-100 dark:bg-green-900 p-3 mb-2">
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm">Multiple platforms</span>
                </div>
                <div className="flex flex-col items-center text-center p-3">
                  <div className="rounded-full bg-amber-100 dark:bg-amber-900 p-3 mb-2">
                    <Check className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-sm">HD quality available</span>
                </div>
                <div className="flex flex-col items-center text-center p-3">
                  <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-3 mb-2">
                    <Check className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-sm">Fast downloading</span>
                </div>
              </div>
              
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                Supported platforms: YouTube, Facebook, Instagram, TikTok. Please respect copyrights and terms of service of each platform.
              </p>
            </CardFooter>
          </Card>
          
          <div className="mt-10 space-y-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center">How to Download Videos</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mb-2">
                    <span className="font-bold text-primary">1</span>
                  </div>
                  <CardTitle>Copy the Video URL</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    Find the video you want to download and copy the URL from your browser's address bar.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mb-2">
                    <span className="font-bold text-primary">2</span>
                  </div>
                  <CardTitle>Paste and Analyze</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    Paste the URL into the input field above, select the platform, and click "Analyze" to process the video.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mb-2">
                    <span className="font-bold text-primary">3</span>
                  </div>
                  <CardTitle>Choose and Download</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    Select your preferred quality and format, then click the "Download" button to save the video.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
