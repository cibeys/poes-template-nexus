
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        setLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth session error:", error.message);
        }
        
        setUser(session?.user || null);
        setLoading(false);

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, session) => {
            setUser(session?.user || null);
            setLoading(false);
          }
        );

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error("Auth initialization error:", error);
        setLoading(false);
        return () => {};
      }
    };

    getSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast({
          title: "Error signing in",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Success!",
        description: "You have been signed in.",
      });
      return true;
    } catch (error: any) {
      console.error("Error signing in:", error);
      toast({
        title: "Error",
        description: error?.message || "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        toast({
          title: "Error signing up",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Success!",
        description: "Check your email to confirm your account.",
      });
      return true;
    } catch (error: any) {
      console.error("Error signing up:", error);
      toast({
        title: "Error",
        description: error?.message || "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Error signing out",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Success!",
        description: "You have been signed out.",
      });
      return true;
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: error?.message || "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut
  };
}
