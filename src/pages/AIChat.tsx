
import React, { useState, useRef, useEffect } from 'react';
import { 
  Card, 
  CardContent,
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/common/components/layouts/MainLayout";
import { ScrollArea } from "@/components/ui/scroll-area";

type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export default function AIChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: 'Hello! I am an AI assistant here to help you. Ask me anything!',
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage = {
      role: 'user' as const,
      content: input.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    
    // Simulate AI response (in a real app, this would call an API)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const aiResponse = {
        role: 'assistant' as const,
        content: getSimulatedResponse(input.trim()),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get a response from the AI.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Simple simulation of AI responses for demo purposes
  const getSimulatedResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      return "Hello there! How can I assist you today?";
    } else if (lowerInput.includes('help')) {
      return "I'm here to help! You can ask me questions about our services, products, or general information.";
    } else if (lowerInput.includes('time') || lowerInput.includes('date')) {
      return `The current time is ${new Date().toLocaleTimeString()} and the date is ${new Date().toLocaleDateString()}.`;
    } else {
      return "That's an interesting question. In a fully implemented system, I would provide a helpful answer using a language model. How else can I assist you?";
    }
  };
  
  return (
    <MainLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">AI Chat Assistant</h1>
        <Card className="w-full max-w-3xl mx-auto h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bot className="mr-2 h-5 w-5" />
              AI Assistant
            </CardTitle>
            <CardDescription>
              Ask questions and get instant answers
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {messages.map((message, i) => (
                  <div 
                    key={i} 
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`flex max-w-[80%] ${
                        message.role === 'user' 
                          ? 'flex-row-reverse items-end' 
                          : 'items-start'
                      }`}
                    >
                      {message.role !== 'system' && (
                        <Avatar className={`h-8 w-8 ${message.role === 'user' ? 'ml-2' : 'mr-2'}`}>
                          {message.role === 'user' ? (
                            <AvatarFallback>U</AvatarFallback>
                          ) : (
                            <>
                              <AvatarImage src="/placeholder.svg" />
                              <AvatarFallback>AI</AvatarFallback>
                            </>
                          )}
                        </Avatar>
                      )}
                      
                      <div 
                        className={`rounded-lg p-3 ${
                          message.role === 'system'
                            ? 'bg-muted text-center w-full'
                            : message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {message.content}
                        <div className="text-xs opacity-50 mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>
          
          <CardFooter className="pt-2">
            <form onSubmit={handleSend} className="w-full flex gap-2">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="flex-1"
              />
              <Button type="submit" disabled={loading || !input.trim()}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}
