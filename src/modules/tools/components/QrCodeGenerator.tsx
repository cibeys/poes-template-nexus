
import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Check, FileText, Link as LinkIcon, Mail, MapPin, Phone, QrCode, Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type QrType = 'url' | 'text' | 'email' | 'phone' | 'location';
type QrLevel = 'L' | 'M' | 'Q' | 'H';

export default function QrCodeGenerator() {
  const [type, setType] = useState<QrType>('url');
  const [valueText, setValueText] = useState('https://example.com');
  const [valueEmail, setValueEmail] = useState({ email: '', subject: '', body: '' });
  const [valuePhone, setValuePhone] = useState('');
  const [valueLocation, setValueLocation] = useState({ lat: '', lng: '', name: '' });
  
  const [qrSize, setQrSize] = useState<number>(200);
  const [qrLevel, setQrLevel] = useState<QrLevel>('M');
  const [qrColor, setQrColor] = useState('#000000');
  const [qrBgColor, setQrBgColor] = useState('#ffffff');
  const [qrIncludeMargin, setQrIncludeMargin] = useState<boolean>(true);
  
  const [copySuccess, setCopySuccess] = useState(false);
  
  const qrRef = useRef<HTMLDivElement>(null);

  const getQrValue = (): string => {
    switch (type) {
      case 'url':
        return valueText.startsWith('http') ? valueText : `https://${valueText}`;
      case 'text':
        return valueText;
      case 'email':
        let emailStr = `mailto:${valueEmail.email}`;
        if (valueEmail.subject) emailStr += `?subject=${encodeURIComponent(valueEmail.subject)}`;
        if (valueEmail.body) {
          emailStr += emailStr.includes('?') ? '&' : '?';
          emailStr += `body=${encodeURIComponent(valueEmail.body)}`;
        }
        return emailStr;
      case 'phone':
        return `tel:${valuePhone}`;
      case 'location':
        if (valueLocation.lat && valueLocation.lng) {
          return `geo:${valueLocation.lat},${valueLocation.lng}?q=${encodeURIComponent(valueLocation.name || `${valueLocation.lat},${valueLocation.lng}`)}`;
        } else {
          return `https://maps.google.com/maps?q=${encodeURIComponent(valueLocation.name)}`;
        }
      default:
        return valueText;
    }
  };

  const handleDownload = () => {
    const canvas = document.getElementById('qr-code') as HTMLCanvasElement;
    if (!canvas) return;
    
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `qrcode-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = url;
    link.click();
  };

  const copyQrCode = () => {
    const canvas = document.getElementById('qr-code') as HTMLCanvasElement;
    if (!canvas) return;
    
    canvas.toBlob(blob => {
      if (!blob) return;
      
      // Create a ClipboardItem with the PNG BLOB
      const item = new ClipboardItem({ 'image/png': blob });
      
      // Copy to clipboard
      navigator.clipboard.write([item])
        .then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch(err => {
          console.error('Could not copy QR code:', err);
        });
    });
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold mb-2 flex justify-center items-center gap-2">
          <QrCode className="text-primary" />
          QR Code Generator
        </h1>
        <p className="text-muted-foreground">
          Create custom QR codes for links, text, emails, and more
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* QR Settings Panel */}
        <div className="order-2 md:order-1">
          <Card>
            <CardHeader>
              <CardTitle>QR Code Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Content Type Selection */}
              <div className="space-y-2">
                <Label>Content Type</Label>
                <Tabs defaultValue={type} value={type} onValueChange={(value) => setType(value as QrType)}>
                  <TabsList className="grid grid-cols-5">
                    <TabsTrigger value="url" className="text-xs">URL</TabsTrigger>
                    <TabsTrigger value="text" className="text-xs">Text</TabsTrigger>
                    <TabsTrigger value="email" className="text-xs">Email</TabsTrigger>
                    <TabsTrigger value="phone" className="text-xs">Phone</TabsTrigger>
                    <TabsTrigger value="location" className="text-xs">Location</TabsTrigger>
                  </TabsList>

                  {/* URL Input */}
                  <TabsContent value="url" className="space-y-3 pt-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor="url">URL</Label>
                      <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-primary">
                        <div className="bg-muted px-3 py-2 rounded-l-md flex items-center">
                          <LinkIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <Input
                          id="url"
                          value={valueText}
                          onChange={(e) => setValueText(e.target.value)}
                          placeholder="Enter website URL"
                          className="border-0 focus-visible:ring-0"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Text Input */}
                  <TabsContent value="text" className="space-y-3 pt-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor="text">Text</Label>
                      <div className="flex">
                        <div className="bg-muted p-3 rounded-l-md flex items-start">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <Textarea
                          id="text"
                          value={valueText}
                          onChange={(e) => setValueText(e.target.value)}
                          placeholder="Enter your text here"
                          rows={4}
                          className="border-l-0 rounded-l-none focus-visible:ring-1 focus-visible:ring-primary"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Email Input */}
                  <TabsContent value="email" className="space-y-3 pt-3">
                    <div className="grid gap-3">
                      <div className="grid gap-1.5">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-primary">
                          <div className="bg-muted px-3 py-2 rounded-l-md flex items-center">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Input
                            id="email"
                            type="email"
                            value={valueEmail.email}
                            onChange={(e) => setValueEmail({...valueEmail, email: e.target.value})}
                            placeholder="recipient@example.com"
                            className="border-0 focus-visible:ring-0"
                          />
                        </div>
                      </div>

                      <div className="grid gap-1.5">
                        <Label htmlFor="subject">Subject (optional)</Label>
                        <Input
                          id="subject"
                          value={valueEmail.subject}
                          onChange={(e) => setValueEmail({...valueEmail, subject: e.target.value})}
                          placeholder="Email subject"
                        />
                      </div>

                      <div className="grid gap-1.5">
                        <Label htmlFor="body">Body (optional)</Label>
                        <Textarea
                          id="body"
                          value={valueEmail.body}
                          onChange={(e) => setValueEmail({...valueEmail, body: e.target.value})}
                          placeholder="Email message"
                          rows={2}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Phone Input */}
                  <TabsContent value="phone" className="space-y-3 pt-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-primary">
                        <div className="bg-muted px-3 py-2 rounded-l-md flex items-center">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <Input
                          id="phone"
                          type="tel"
                          value={valuePhone}
                          onChange={(e) => setValuePhone(e.target.value)}
                          placeholder="+1234567890"
                          className="border-0 focus-visible:ring-0"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Location Input */}
                  <TabsContent value="location" className="space-y-3 pt-3">
                    <div className="grid gap-3">
                      <div className="grid gap-1.5">
                        <Label htmlFor="location-name">Location Name</Label>
                        <div className="flex items-center border rounded-md focus-within:ring-1 focus-within:ring-primary">
                          <div className="bg-muted px-3 py-2 rounded-l-md flex items-center">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Input
                            id="location-name"
                            value={valueLocation.name}
                            onChange={(e) => setValueLocation({...valueLocation, name: e.target.value})}
                            placeholder="Central Park, New York"
                            className="border-0 focus-visible:ring-0"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="grid gap-1.5">
                          <Label htmlFor="latitude">Latitude (optional)</Label>
                          <Input
                            id="latitude"
                            value={valueLocation.lat}
                            onChange={(e) => setValueLocation({...valueLocation, lat: e.target.value})}
                            placeholder="40.7829"
                          />
                        </div>

                        <div className="grid gap-1.5">
                          <Label htmlFor="longitude">Longitude (optional)</Label>
                          <Input
                            id="longitude"
                            value={valueLocation.lng}
                            onChange={(e) => setValueLocation({...valueLocation, lng: e.target.value})}
                            placeholder="-73.9654"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* QR Style Options */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium border-b pb-1">QR Code Style</h3>
                
                {/* Size */}
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <Label htmlFor="qr-size">Size: {qrSize}×{qrSize}px</Label>
                  </div>
                  <Slider
                    id="qr-size"
                    defaultValue={[200]}
                    min={100}
                    max={400}
                    step={10}
                    value={[qrSize]}
                    onValueChange={(values) => setQrSize(values[0])}
                    className="py-2"
                  />
                </div>
                
                {/* Error Correction */}
                <div className="grid gap-1.5">
                  <Label htmlFor="qr-level">Error Correction</Label>
                  <Select value={qrLevel} onValueChange={(value) => setQrLevel(value as QrLevel)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">Low (7%)</SelectItem>
                      <SelectItem value="M">Medium (15%)</SelectItem>
                      <SelectItem value="Q">Quartile (25%)</SelectItem>
                      <SelectItem value="H">High (30%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Colors */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="qr-color">QR Color</Label>
                    <div className="flex">
                      <Input
                        id="qr-color"
                        type="color"
                        value={qrColor}
                        onChange={(e) => setQrColor(e.target.value)}
                        className="w-12 p-1 h-9"
                      />
                      <Input
                        type="text"
                        value={qrColor}
                        onChange={(e) => setQrColor(e.target.value)}
                        className="flex-1 ml-2"
                      />
                    </div>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="qr-bg-color">Background</Label>
                    <div className="flex">
                      <Input
                        id="qr-bg-color"
                        type="color"
                        value={qrBgColor}
                        onChange={(e) => setQrBgColor(e.target.value)}
                        className="w-12 p-1 h-9"
                      />
                      <Input
                        type="text"
                        value={qrBgColor}
                        onChange={(e) => setQrBgColor(e.target.value)}
                        className="flex-1 ml-2"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Include Margin */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="qr-margin">Include Margin</Label>
                  <Switch
                    id="qr-margin"
                    checked={qrIncludeMargin}
                    onCheckedChange={setQrIncludeMargin}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* QR Display Panel */}
        <div className="order-1 md:order-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Your QR Code</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <div 
                ref={qrRef} 
                className="p-4 bg-white rounded-lg flex items-center justify-center mb-5"
                style={{ width: qrSize + 20, height: qrSize + 20 }}
              >
                <QRCodeSVG
                  id="qr-code"
                  value={getQrValue()}
                  size={qrSize}
                  level={qrLevel}
                  fgColor={qrColor}
                  bgColor={qrBgColor}
                  includeMargin={qrIncludeMargin}
                />
              </div>
              
              <div className="flex gap-3 w-full">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={copyQrCode}
                >
                  {copySuccess ? (
                    <>
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    "Copy to Clipboard"
                  )}
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleDownload}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mt-6 text-sm text-center text-muted-foreground">
        <p>Scan the QR code with your mobile device to test it</p>
        <p className="mt-1">Higher error correction makes QR codes more reliable but increases density</p>
      </div>
    </div>
  );
}
