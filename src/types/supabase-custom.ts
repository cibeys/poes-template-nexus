
import type { Database } from "@/integrations/supabase/types";

// We can define custom types here that extend the auto-generated Supabase types
export type BlogPost = Database['public']['Tables']['blog_posts']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Template = Database['public']['Tables']['templates']['Row'];

// Define the ChatMessage type for our custom chat_messages table
export interface ChatMessage {
  id: string;
  user_id: string;
  admin_id: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

// Define any additional custom types as needed
