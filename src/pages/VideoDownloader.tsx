
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
import { Download, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/common/components/layouts/MainLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function VideoDownloader() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    title: string;
    formats: {quality: string, url: string}[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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
    setResult(null);
    
    // In a real implementation, this would call a backend service
    // For demo purposes, we'll simulate a response
    try {
      // Simulate API call to process video
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock response data
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        setResult({
          title: "Sample YouTube Video",
          formats: [
            { quality: "720p", url: "#" },
            { quality: "480p", url: "#" },
            { quality: "360p", url: "#" }
          ]
        });
      } else {
        setError("Unsupported URL. Currently only YouTube links are supported.");
      }
    } catch (error) {
      setError("Failed to process the video. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (quality: string) => {
    toast({
      title: "Download started",
      description: `Downloading ${result?.title} in ${quality}`,
    });
    // In a real app, this would trigger the actual download
  };

  return (
    <MainLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Video Downloader</h1>
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Download Videos from Various Platforms</CardTitle>
            <CardDescription>
              Enter a video URL from YouTube, Facebook, Instagram, or TikTok
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="flex space-x-2">
                <Input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1"
                  disabled={loading}
                />
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
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

              {result && (
                <div className="mt-6 space-y-4">
                  <h3 className="font-semibold text-lg">{result.title}</h3>
                  <div className="grid gap-2">
                    {result.formats.map((format, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-md">
                        <span>{format.quality}</span>
                        <Button 
                          size="sm" 
                          onClick={() => handleDownload(format.quality)}
                          variant="outline"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </form>
          <CardFooter className="flex justify-between border-t pt-4 text-sm text-muted-foreground">
            <p>Supported platforms: YouTube, Facebook, Instagram, TikTok</p>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}
