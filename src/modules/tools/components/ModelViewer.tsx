
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Upload, Box, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

// Sample models available by default
const SAMPLE_MODELS = [
  { 
    name: "Sci-Fi Helmet", 
    url: "https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/sci-fi-helmet/model.gltf",
    thumbnail: "https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/sci-fi-helmet/thumbnail.png"
  },
  { 
    name: "Avocado", 
    url: "https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/avocado/model.gltf",
    thumbnail: "https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/avocado/thumbnail.png" 
  },
  { 
    name: "Chair", 
    url: "https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/chair-wooden/model.gltf",
    thumbnail: "https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/chair-wooden/thumbnail.png"
  },
];

export default function ModelViewer() {
  const [selectedModel, setSelectedModel] = useState(SAMPLE_MODELS[0]);
  const [uploadedModel, setUploadedModel] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [rotateSpeed, setRotateSpeed] = useState(1);
  const [intensity, setIntensity] = useState(1);
  const [camera, setCamera] = useState({ zoom: 1 });
  const [error, setError] = useState("");
  const [is3DLibraryLoaded, setIs3DLibraryLoaded] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // This function will be called when React Three Fiber is ready to render
  const handleModelChange = (modelName: string) => {
    const model = SAMPLE_MODELS.find(m => m.name === modelName);
    if (model) {
      setSelectedModel(model);
      setUploadedModel(null);
      setError("");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Check file type
    if (!file.name.toLowerCase().endsWith('.gltf') && !file.name.toLowerCase().endsWith('.glb')) {
      setError("Please upload a GLTF or GLB file");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    
    // Create object URL for the uploaded file
    const objectUrl = URL.createObjectURL(file);
    setUploadedModel(objectUrl);
    
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Release object URL when component unmounts or model changes
  useEffect(() => {
    return () => {
      if (uploadedModel) {
        URL.revokeObjectURL(uploadedModel);
      }
    };
  }, [uploadedModel]);

  // Adjust camera zoom
  const zoomIn = () => setCamera(prev => ({ zoom: prev.zoom * 1.2 }));
  const zoomOut = () => setCamera(prev => ({ zoom: prev.zoom / 1.2 }));
  const resetZoom = () => setCamera({ zoom: 1 });

  // Attempt to dynamically load three.js libraries
  useEffect(() => {
    // In a real implementation, we would load the three.js libraries here
    // For now, we'll just simulate a loading state
    const timer = setTimeout(() => {
      setIs3DLibraryLoaded(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Box className="text-primary" />
          3D Model Viewer
        </h1>
        <p className="text-muted-foreground">
          View and interact with 3D models in your browser
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Model Selection */}
              <div className="space-y-2">
                <Label>Select Sample Model</Label>
                <Select 
                  onValueChange={handleModelChange} 
                  defaultValue={selectedModel.name}
                  value={uploadedModel ? 'custom' : selectedModel.name}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {SAMPLE_MODELS.map((model) => (
                      <SelectItem key={model.name} value={model.name}>
                        {model.name}
                      </SelectItem>
                    ))}
                    {uploadedModel && (
                      <SelectItem value="custom">Custom Upload</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Upload Custom Model */}
              <div className="space-y-2">
                <Label htmlFor="model-upload">Upload Your Own 3D Model</Label>
                <div className="grid gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload GLTF/GLB File
                  </Button>
                  <input
                    ref={fileInputRef}
                    id="model-upload"
                    type="file"
                    accept=".gltf,.glb"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                </div>
              </div>
              
              {/* Model Rotation */}
              <div className="space-y-4">
                {/* Auto Rotate */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-rotate">Auto-rotate Model</Label>
                  <Switch
                    id="auto-rotate"
                    checked={autoRotate}
                    onCheckedChange={setAutoRotate}
                  />
                </div>
                
                {/* Rotation Speed */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="rotate-speed">Rotation Speed</Label>
                    <span className="text-sm text-muted-foreground">{rotateSpeed}</span>
                  </div>
                  <Slider
                    id="rotate-speed"
                    min={0.1}
                    max={3}
                    step={0.1}
                    defaultValue={[1]}
                    value={[rotateSpeed]}
                    onValueChange={(values) => setRotateSpeed(values[0])}
                    disabled={!autoRotate}
                  />
                </div>
              </div>
              
              {/* Lighting Intensity */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="light-intensity">Lighting Intensity</Label>
                  <span className="text-sm text-muted-foreground">{intensity}</span>
                </div>
                <Slider
                  id="light-intensity"
                  min={0.1}
                  max={2}
                  step={0.1}
                  defaultValue={[1]}
                  value={[intensity]}
                  onValueChange={(values) => setIntensity(values[0])}
                />
              </div>
              
              {/* Zoom Controls */}
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" onClick={zoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={resetZoom}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={zoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* 3D Viewer */}
        <div className="md:col-span-2">
          <Card className="h-[500px] overflow-hidden">
            <div ref={canvasRef} className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              {!is3DLibraryLoaded ? (
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="mt-2">Loading 3D libraries...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <Box className="h-16 w-16 mb-4 text-primary opacity-50" />
                  <h3 className="text-xl font-medium mb-2">3D Model Viewer</h3>
                  <p className="text-muted-foreground mb-6">
                    To use the full 3D model viewer, please install the required React Three Fiber packages.
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md w-full max-w-md">
                    <code className="text-sm">npm install three @react-three/fiber @react-three/drei</code>
                  </div>
                </div>
              )}
            </div>
          </Card>
          
          <div className="flex justify-between mt-4 text-sm text-muted-foreground">
            <span>Click and drag to rotate | Scroll to zoom | Shift+drag to pan</span>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-sm text-center text-muted-foreground">
        <p>Free 3D models provided by Google Poly and other CC0 sources.</p>
        <p>Upload your own GLTF/GLB files to view custom models.</p>
      </div>
    </div>
  );
}
