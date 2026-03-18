// ─── frontend/src/hooks/useAuth.ts ───
// Authentication hook — manages Google sign-in and session

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface Profile {
  id: string;
  role: "cook" | "household";
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  cuisines?: string[];
  availability?: Record<string, string[]>;
  price_range?: string;
  service_radius_km?: number;
  rating?: number;
  reviews_count?: number;
  verified?: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile from database
  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setProfile(data as Profile);
    }
    return data;
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // Google sign-in
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error) throw error;
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  // Create profile
  const createProfile = async (data: Partial<Profile>) => {
    if (!user) throw new Error("Not authenticated");
    const { data: profile, error } = await supabase
      .from("profiles")
      .insert({ id: user.id, email: user.email, avatar_url: user.user_metadata?.avatar_url, ...data })
      .select()
      .single();
    if (error) throw error;
    setProfile(profile as Profile);
    return profile;
  };

  // Update profile
  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) throw new Error("Not authenticated");
    const { data: updated, error } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", user.id)
      .select()
      .single();
    if (error) throw error;
    setProfile(updated as Profile);
    return updated;
  };

  // Delete account
  const deleteAccount = async () => {
    const res = await fetch("/api/profile", { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete account");
    await signOut();
  };

  return {
    user, profile, loading,
    signInWithGoogle, signOut,
    createProfile, updateProfile, deleteAccount,
    refreshProfile: () => user && fetchProfile(user.id),
  };
}
