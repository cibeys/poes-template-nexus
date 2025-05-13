
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { Profile } from '@/types/supabase-custom';
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, options?: { full_name?: string }) => Promise<boolean>;
  signOut: () => Promise<boolean>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading, signIn, signUp: baseSignUp, signOut } = useSupabaseAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  // Enhanced signUp function that handles user metadata
  const signUp = async (email: string, password: string, options?: { full_name?: string }) => {
    try {
      // Pass email and password to the base signUp function with metadata
      return await baseSignUp(email, password, {
        full_name: options?.full_name
      });
    } catch (error) {
      console.error("Error in enhanced signUp:", error);
      return false;
    }
  };

  useEffect(() => {
    const getProfile = async () => {
      if (!user) {
        setProfile(null);
        setIsAdmin(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

        setProfile(data);
        setIsAdmin(data?.role === 'admin');
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    getProfile();
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
