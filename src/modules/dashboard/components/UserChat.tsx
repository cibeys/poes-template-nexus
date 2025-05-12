import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "@/modules/templates/types";
import { motion } from "framer-motion";

export default function UserChat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Use an RPC to get messages
        const { data, error } = await supabase
          .rpc('get_user_messages', { user_id_param: user.id });

        if (error) throw error;

        setMessages(data as ChatMessage[]);
        
        // Mark messages as read
        const unreadMessageIds = data
          .filter((msg: ChatMessage) => !msg.is_read && msg.admin_id)
          .map((msg: ChatMessage) => msg.id);
          
        if (unreadMessageIds.length > 0) {
          await supabase
            .rpc('mark_user_messages_as_read', { message_ids: unreadMessageIds });
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
    
    // Set up real-time subscription
    const channel = supabase
      .channel('user-chat')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `admin_id=eq.${user?.id}` },
        payload => {
          // Add the new message to the state
          // @ts-ignore
          setMessages(prev => [...prev, payload.new as ChatMessage]);
          
          // Mark the message as read
          if (payload.new && payload.new.id) {
            supabase
              .rpc('mark_user_messages_as_read', { message_ids: [payload.new.id] })
              .then();
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !user) return;
    
    try {
      // Use an RPC to send message
      const { data, error } = await supabase
        .rpc('send_user_message', {
          message_text: message.trim(),
          from_user_id: user.id
        });
        
      if (error) throw error;
      
      // Add message to state with optimistic update
      const optimisticMessage: ChatMessage = {
        id: Date.now().toString(),
        user_id: user.id,
        message: message.trim(),
        is_read: false,
        created_at: new Date().toISOString()
      };

      setMessages([...messages, optimisticMessage]);
      setMessage("");
      
    } catch (error: any) {
      console.error("Error sending message:", error.message);
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "A";
    return name.split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Chat with Support</h1>
      <p className="text-muted-foreground">
        Need help? Chat with our support team here
      </p>
      
      <Card className="rounded-md border shadow-sm">
        <CardHeader className="border-b">
          <CardTitle>Support Chat</CardTitle>
        </CardHeader>
        <div className="flex flex-col h-[500px]">
          {/* Messages */}
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
            </div>
          ) : (
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="font-medium text-lg">Welcome to Support Chat!</h3>
                  <p className="text-muted-foreground mt-2">
                    Send a message to start a conversation with our support team.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${
                        msg.user_id === user?.id ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.user_id !== user?.id && (
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={msg.user?.avatar_url} />
                          <AvatarFallback>{getInitials(msg.user?.full_name || "Admin")}</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.user_id === user?.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p>{msg.message}</p>
                        <p className={`text-xs mt-1 text-right ${
                          msg.user_id === user?.id
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}>
                          {new Date(msg.created_at).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>
          )}

          {/* Message input */}
          <form onSubmit={handleSendMessage} className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button type="submit" disabled={!message.trim()}>
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
