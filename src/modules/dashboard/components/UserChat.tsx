
import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, BotIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage, typedRpc } from "@/types/supabase-custom";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function UserChat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [adminTyping, setAdminTyping] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        // Get messages for the current user
        const { data, error } = await typedRpc(
          supabase,
          'get_user_messages',
          { user_id_param: user.id }
        );

        if (error) throw error;

        if (Array.isArray(data)) {
          setMessages(data);
          
          // Mark user's messages as read
          const unreadMessages = data
            ?.filter(msg => !msg.is_read && msg.admin_id)
            .map(msg => msg.id) || [];
            
          if (unreadMessages.length > 0) {
            await typedRpc(
              supabase,
              'mark_user_messages_as_read',
              { message_ids: unreadMessages }
            );
          }
          
          // Count unread messages
          const count = await fetchUnreadCount();
          setUnreadCount(count);
        }
      } catch (error: any) {
        console.error("Error fetching messages:", error.message);
        toast({
          title: "Error fetching messages",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    
    // Set up real-time subscription for new messages
    const channel = supabase
      .channel(`user-chat-${user.id}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `user_id=eq.${user.id}` },
        payload => {
          // @ts-ignore
          const newMessage = payload.new as ChatMessage;
          
          // Only add the message if it has an admin_id (from admin to user)
          if (newMessage && newMessage.admin_id) {
            setMessages(prev => [...prev, newMessage]);
            setAdminTyping(false);
            
            // Mark as read
            typedRpc(
              supabase,
              'mark_user_messages_as_read',
              { message_ids: [newMessage.id] }
            ).then();
          }
        }
      )
      .subscribe();
      
    // Simulate admin typing
    const typingInterval = setInterval(() => {
      const shouldShowTyping = Math.random() > 0.7;
      if (shouldShowTyping && messages.length > 0 && messages[messages.length - 1]?.user_id === user.id) {
        setAdminTyping(true);
        setTimeout(() => setAdminTyping(false), 3000);
      }
    }, 10000);
    
    return () => {
      supabase.removeChannel(channel);
      clearInterval(typingInterval);
    };
  }, [user?.id, toast]);

  // Fetch unread count
  const fetchUnreadCount = async (): Promise<number> => {
    if (!user) return 0;
    
    try {
      const { data, error } = await typedRpc(
        supabase,
        'count_unread_user_messages',
        { user_id: user.id }
      );
      
      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return 0;
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !user) return;
    
    try {
      // Use an RPC to send a message
      const { data, error } = await typedRpc(
        supabase,
        'send_user_message',
        {
          message_text: message.trim(),
          from_user_id: user.id
        }
      );
        
      if (error) throw error;
      
      // Add message to state with optimistic update
      const optimisticMessage: ChatMessage = {
        id: Date.now().toString(),
        user_id: user.id,
        admin_id: null,
        message: message.trim(),
        created_at: new Date().toISOString(),
        is_read: false,
        updated_at: new Date().toISOString()
      };

      setMessages([...messages, optimisticMessage]);
      setMessage("");
      
      // Show typing indicator after user sends a message
      setTimeout(() => {
        setAdminTyping(true);
        setTimeout(() => setAdminTyping(false), Math.random() * 3000 + 2000);
      }, 1000);
      
    } catch (error: any) {
      console.error("Error sending message:", error.message);
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Chat Support</h1>
        <p className="text-muted-foreground">
          Chat with our support team
        </p>
      </div>
      
      <Card className="rounded-md border shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/50">
          <CardTitle className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>CS</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center">
                Support Team
                {unreadCount > 0 && (
                  <Badge className="ml-2" variant="destructive">{unreadCount}</Badge>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                {messages.length > 0 
                  ? `Last message: ${formatTime(messages[messages.length - 1].created_at)}`
                  : 'Start a conversation'
                }
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <div className="h-[500px] flex flex-col">
          <ScrollArea className="flex-grow p-4">
            <div className="space-y-4">
              {messages.length === 0 && !loading ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-12">
                  <BotIcon className="h-16 w-16 text-muted-foreground/40 mb-4" />
                  <h3 className="text-lg font-medium">No messages yet</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mt-2">
                    Send a message to start a conversation with our support team.
                  </p>
                </div>
              ) : loading ? (
                <div className="flex justify-center items-center h-96">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${
                      !msg.admin_id ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        !msg.admin_id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p>{msg.message}</p>
                      <p className={`text-xs mt-1 text-right ${
                        !msg.admin_id
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
              
              {/* Admin typing indicator */}
              {adminTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-150"></div>
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-300"></div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <form onSubmit={handleSendMessage} className="p-4 border-t bg-background">
            <div className="flex space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={!message.trim()} 
                className="hover-glow"
              >
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
