
import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage, typedRpc } from "@/types/supabase-custom";
import { motion } from "framer-motion";
import { Profile } from "@/types/supabase-custom";

// Add a type for user with messages
interface UserWithMessages {
  id: string;
  full_name?: string;
  avatar_url?: string;
  username?: string;
  unread_count: number;
  lastMessage: string;
  lastActivity: string;
}

export default function AdminChat() {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<UserWithMessages[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get all unique users who have sent messages
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Get users with messages using an RPC
        const { data, error } = await typedRpc(supabase, 'get_users_with_messages');

        if (error) throw error;
        
        if (Array.isArray(data) && data.length > 0) {
          // Filter out the admin's own ID and format data
          const usersWithData = data
            ?.filter((u: any) => u.id !== user?.id)
            .map((u: any) => ({
              id: u.id,
              full_name: u.full_name || u.username || 'User',
              avatar_url: u.avatar_url,
              username: u.username,
              unread_count: u.unread_count || 0,
              lastMessage: u.last_message || "",
              lastActivity: u.last_activity || new Date().toISOString()
            })) || [];
          
          setUsers(usersWithData);
          
          // Set active chat to first user if none selected
          if (!activeChat && usersWithData.length > 0) {
            setActiveChat(usersWithData[0].id);
          }
        }
      } catch (error: any) {
        console.error("Error fetching users:", error.message);
        toast({
          title: "Error fetching users",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('chat-updates')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        payload => {
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, toast, activeChat]);

  // Load messages for the active chat
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeChat) return;
      
      try {
        // Use an RPC to get messages for this user and admin
        const { data, error } = await typedRpc(
          supabase,
          'get_chat_messages_with_user', 
          { user_id_param: activeChat }
        );

        if (error) throw error;

        if (Array.isArray(data)) {
          setMessages(data);
          
          // Mark messages as read
          const unreadMessageIds = data
            ?.filter(msg => !msg.is_read && msg.user_id === activeChat && !msg.admin_id)
            .map(msg => msg.id) || [];
            
          if (unreadMessageIds.length > 0) {
            await typedRpc(
              supabase,
              'mark_messages_as_read', 
              { 
                message_ids: unreadMessageIds, 
                admin_id_param: user?.id || '' 
              }
            );
          }
        }
        
      } catch (error: any) {
        console.error("Error fetching messages:", error.message);
        toast({
          title: "Error fetching messages",
          description: error.message,
          variant: "destructive"
        });
      }
    };

    fetchMessages();
    
    // Set up real-time subscription for new messages in this chat
    if (activeChat) {
      const channel = supabase
        .channel(`chat-${activeChat}`)
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `user_id=eq.${activeChat}` },
          payload => {
            // @ts-ignore
            setMessages(prev => [...prev, payload.new as ChatMessage]);
            
            // Mark message as read
            if (payload.new && payload.new.id) {
              typedRpc(
                supabase,
                'mark_messages_as_read', 
                { 
                  message_ids: [payload.new.id], 
                  admin_id_param: user?.id || '' 
                }
              ).then();
            }
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [activeChat, user?.id, toast]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !activeChat || !user) return;
    
    try {
      // Use an RPC to send a message
      const { data, error } = await typedRpc(
        supabase,
        'send_admin_message',
        {
          to_user_id: activeChat,
          message_text: message.trim(),
          from_admin_id: user.id
        }
      );
        
      if (error) throw error;
      
      // Add message to state with optimistic update
      const optimisticMessage: ChatMessage = {
        id: Date.now().toString(),
        user_id: user.id,
        admin_id: activeChat,
        message: message.trim(),
        created_at: new Date().toISOString(),
        is_read: false,
        updated_at: new Date().toISOString()
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
    if (!name) return "?";
    return name.split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Chat Support</h1>
      <p className="text-muted-foreground">
        Manage user messages and provide support
      </p>
      
      <Card className="rounded-md border shadow-sm">
        <div className="flex h-[600px]">
          {/* Users sidebar */}
          <div className="w-80 border-r h-full p-4 bg-muted/20">
            <h2 className="font-semibold mb-4">Recent Conversations</h2>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No conversations yet
              </div>
            ) : (
              <ScrollArea className="h-[530px]">
                <div className="space-y-2 pr-4">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className={`flex items-center space-x-3 p-3 rounded-md cursor-pointer hover:bg-muted transition-colors duration-200 ${
                        activeChat === u.id ? "bg-muted" : ""
                      }`}
                      onClick={() => setActiveChat(u.id)}
                    >
                      <Avatar>
                        <AvatarImage src={u.avatar_url} />
                        <AvatarFallback>{getInitials(u.full_name || u.username)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">{u.full_name || u.username}</p>
                          {u.unread_count > 0 && (
                            <Badge className="ml-2">{u.unread_count}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {u.lastMessage}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(u.lastActivity).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric', 
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col">
            {activeChat ? (
              <>
                {/* Chat header */}
                <div className="border-b p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={users.find(u => u.id === activeChat)?.avatar_url} />
                      <AvatarFallback>
                        {getInitials(
                          users.find(u => u.id === activeChat)?.full_name || 
                          users.find(u => u.id === activeChat)?.username || 
                          ""
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {users.find(u => u.id === activeChat)?.full_name || 
                         users.find(u => u.id === activeChat)?.username || 
                         "User"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {users.find(u => u.id === activeChat)?.unread_count > 0
                          ? `${users.find(u => u.id === activeChat)?.unread_count} unread messages`
                          : "All caught up"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
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
                </ScrollArea>

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
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
