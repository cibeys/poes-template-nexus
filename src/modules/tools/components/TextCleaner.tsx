
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown, Type, Trash2, Copy, Check, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function TextCleaner() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [operation, setOperation] = useState("uppercase");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleTransform = () => {
    if (!text) {
      toast({
        title: "Empty Text",
        description: "Please enter some text to transform",
        variant: "destructive"
      });
      return;
    }

    let transformedText = "";
    switch (operation) {
      case "uppercase":
        transformedText = text.toUpperCase();
        break;
      case "lowercase":
        transformedText = text.toLowerCase();
        break;
      case "capitalize":
        transformedText = text.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        break;
      case "reverse":
        transformedText = text.split('').reverse().join('');
        break;
      case "remove-spaces":
        transformedText = text.replace(/\s+/g, '');
        break;
      case "remove-lines":
        transformedText = text.replace(/\n+/g, ' ');
        break;
      case "count":
        const chars = text.length;
        const words = text.trim().split(/\s+/).length;
        const lines = text.split('\n').length;
        transformedText = `Characters: ${chars}\nWords: ${words}\nLines: ${lines}`;
        break;
      default:
        transformedText = text;
    }

    setResult(transformedText);
    toast({
      title: "Text Transformed",
      description: `Successfully applied ${operation} operation`,
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Text has been copied to your clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy manually",
        variant: "destructive"
      });
    }
  };

  const clearText = () => {
    setText("");
    setResult("");
    toast({
      title: "Cleared",
      description: "Text fields have been cleared",
    });
  };

  return (
    <div className="container mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Type className="mr-2" /> Text Cleaner & Transformer
            </CardTitle>
            <CardDescription>
              Clean, transform, and analyze text with various operations
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="font-medium">Select Operation</label>
              <Select value={operation} onValueChange={setOperation}>
                <SelectTrigger className="w-full md:w-[300px]">
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uppercase">UPPERCASE</SelectItem>
                  <SelectItem value="lowercase">lowercase</SelectItem>
                  <SelectItem value="capitalize">Capitalize Each Word</SelectItem>
                  <SelectItem value="reverse">Reverse Text</SelectItem>
                  <SelectItem value="remove-spaces">Remove Spaces</SelectItem>
                  <SelectItem value="remove-lines">Remove Line Breaks</SelectItem>
                  <SelectItem value="count">Count Characters/Words/Lines</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="font-medium">Input Text</label>
                <Textarea 
                  placeholder="Enter your text here..." 
                  value={text} 
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[200px] resize-y"
                />
              </div>
              
              <div className="space-y-2">
                <label className="font-medium">Result</label>
                <Textarea 
                  placeholder="Transformed text will appear here..." 
                  value={result} 
                  readOnly 
                  className="min-h-[200px] resize-y bg-gray-50 dark:bg-gray-900"
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-wrap gap-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={handleTransform}
                className="bg-primary hover:bg-primary/90"
              >
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Transform
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={copyToClipboard}
                variant="secondary"
                disabled={!result}
              >
                {copied ? (
                  <><Check className="mr-2 h-4 w-4" /> Copied</>
                ) : (
                  <><Copy className="mr-2 h-4 w-4" /> Copy Result</>
                )}
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={clearText}
                variant="outline"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={() => {setText(result); setResult("");}}
                variant="ghost"
                disabled={!result}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Use Result as Input
              </Button>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
