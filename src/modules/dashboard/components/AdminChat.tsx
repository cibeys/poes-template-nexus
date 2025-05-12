
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
import { ChatMessage } from "@/modules/templates/types";
import { motion } from "framer-motion";

export default function AdminChat() {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get all unique users who have sent messages
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Get all messages
        const { data, error } = await supabase
          .from('chat_messages')
          .select(`
            id, 
            user_id, 
            admin_id, 
            message, 
            is_read, 
            created_at, 
            profiles:user_id(full_name, avatar_url, username)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Get unique user IDs from messages
        const uniqueUserIds = [...new Set(data.map(msg => msg.user_id))];
        
        // Filter out the admin's own ID
        const filteredUserIds = uniqueUserIds.filter(id => id !== user?.id);
        
        if (filteredUserIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, username')
            .in('id', filteredUserIds);

          if (profilesError) throw profilesError;

          // Count unread messages for each user
          const usersWithUnreadCount = profilesData.map(profile => {
            const userMessages = data.filter(msg => msg.user_id === profile.id);
            const unreadCount = userMessages.filter(msg => !msg.is_read && !msg.admin_id).length;
            
            return {
              ...profile,
              unreadCount,
              lastMessage: userMessages[0]?.message || "",
              lastActivity: userMessages[0]?.created_at || ""
            };
          });
          
          // Sort by last activity
          usersWithUnreadCount.sort((a, b) => 
            new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
          );
          
          setUsers(usersWithUnreadCount);
          
          // Set active chat to first user if none selected
          if (!activeChat && usersWithUnreadCount.length > 0) {
            setActiveChat(usersWithUnreadCount[0].id);
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
        const { data, error } = await supabase
          .from('chat_messages')
          .select(`
            id, 
            user_id, 
            admin_id, 
            message, 
            is_read, 
            created_at, 
            profiles:user_id(full_name, avatar_url, username)
          `)
          .or(`user_id.eq.${activeChat},admin_id.eq.${activeChat}`)
          .order('created_at', { ascending: true });

        if (error) throw error;

        setMessages(data as ChatMessage[]);
        
        // Mark messages as read
        const unreadMessageIds = data
          .filter(msg => !msg.is_read && msg.user_id === activeChat && !msg.admin_id)
          .map(msg => msg.id);
          
        if (unreadMessageIds.length > 0) {
          await supabase
            .from('chat_messages')
            .update({ is_read: true, admin_id: user?.id })
            .in('id', unreadMessageIds);
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
            supabase
              .from('chat_messages')
              .update({ is_read: true, admin_id: user?.id })
              .eq('id', payload.new.id)
              .then();
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
      const newMessage = {
        user_id: user.id,
        admin_id: activeChat,
        message: message.trim(),
        is_read: false,
      };
      
      const { error } = await supabase
        .from('chat_messages')
        .insert(newMessage);
        
      if (error) throw error;
      
      // Add message to state with optimistic update
      const optimisticMessage: ChatMessage = {
        ...newMessage,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        is_read: false,
        user: {
          full_name: '',
          avatar_url: '',
          username: ''
        }
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
                          {u.unreadCount > 0 && (
                            <Badge className="ml-2">{u.unreadCount}</Badge>
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
                        {users.find(u => u.id === activeChat)?.unreadCount > 0
                          ? `${users.find(u => u.id === activeChat)?.unreadCount} unread messages`
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
