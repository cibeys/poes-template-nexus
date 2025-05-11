
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, Trash2, RefreshCw } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

export default function TextCleaner() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('trim');

  const handleProcess = () => {
    if (!inputText) {
      toast({
        title: "Empty input",
        description: "Please enter some text to process",
        variant: "destructive"
      });
      return;
    }
    
    let result = inputText;
    
    switch (activeTab) {
      case 'trim':
        result = result.trim().replace(/\s+/g, ' ');
        break;
      case 'uppercase':
        result = result.toUpperCase();
        break;
      case 'lowercase':
        result = result.toLowerCase();
        break;
      case 'capitalize':
        result = result.replace(/\w\S*/g, txt => 
          txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
        break;
      case 'remove-numbers':
        result = result.replace(/[0-9]/g, '');
        break;
      case 'remove-special':
        result = result.replace(/[^\w\s]/gi, '');
        break;
    }
    
    setOutputText(result);
    toast({
      title: "Text processed",
      description: `Text has been ${activeTab === 'trim' ? 'trimmed' : activeTab.replace('-', ' ')}`,
    });
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Permission denied or clipboard API not available",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="shadow-lg animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Text Cleaner
        </CardTitle>
        <CardDescription>
          Clean and transform your text with various operations
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="inputText" className="text-sm font-medium mb-2 block">Input Text</label>
          <Textarea
            id="inputText"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your text here..."
            className="min-h-[120px] font-mono text-sm"
          />
        </div>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
            <TabsTrigger value="trim">Trim</TabsTrigger>
            <TabsTrigger value="uppercase">UPPERCASE</TabsTrigger>
            <TabsTrigger value="lowercase">lowercase</TabsTrigger>
            <TabsTrigger value="capitalize">Capitalize</TabsTrigger>
            <TabsTrigger value="remove-numbers">No Numbers</TabsTrigger>
            <TabsTrigger value="remove-special">No Special</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex justify-between">
          <Button 
            onClick={handleProcess} 
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Process Text
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleClear}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>
        
        <div>
          <div className="flex justify-between items-center">
            <label htmlFor="outputText" className="text-sm font-medium mb-2">Result</label>
            {outputText && (
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8" 
                onClick={copyToClipboard}
              >
                {copied ? (
                  <Check className="h-4 w-4 mr-1" />
                ) : (
                  <Copy className="h-4 w-4 mr-1" />
                )}
                {copied ? "Copied!" : "Copy"}
              </Button>
            )}
          </div>
          <Textarea
            id="outputText"
            value={outputText}
            readOnly
            placeholder="Result will appear here..."
            className="min-h-[120px] font-mono text-sm bg-muted/50"
          />
        </div>
      </CardContent>
    </Card>
  );
}
