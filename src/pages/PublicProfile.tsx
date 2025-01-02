import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import PublicProfileContent from "@/components/public/PublicProfileContent";
import { Product, Category } from "@/types/product";

const PublicProfile = () => {
  const { username } = useParams();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    const initializeProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Fetching profile for username:', username);
        
        if (!username) {
          setError("Username is required");
          return;
        }

        // Set the username parameter
        const { error: paramError } = await supabase.rpc('set_request_parameter', {
          name: 'username',
          value: username
        });

        if (paramError) {
          console.error('Error setting username parameter:', paramError);
          throw paramError;
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", username)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          throw profileError;
        }
        
        if (!profileData) {
          console.log('No profile found for username:', username);
          setError(`Profile "${username}" not found`);
          return;
        }

        console.log('Found profile:', profileData);
        setUserId(profileData.id);

        // Increment view count
        const { error: incrementError } = await supabase.rpc('increment_profile_views', {
          profile_id_param: profileData.id
        });

        if (incrementError) {
          console.error('Error incrementing view count:', incrementError);
        }

        // Fetch view count
        const { data: viewData, error: viewError } = await supabase
          .from('profile_views')
          .select('view_count')
          .eq('profile_id', profileData.id)
          .single();

        if (!viewError && viewData) {
          setViewCount(viewData.view_count || 0);
        }

      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    initializeProfile();
  }, [username]);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["public-categories", userId, username],
    queryFn: async () => {
      if (!userId || !username) throw new Error("Profile not initialized");

      // Set the parameter before querying
      await supabase.rpc('set_request_parameter', {
        name: 'username',
        value: username
      });

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }

      return data;
    },
    enabled: !!userId && !!username,
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["public-products", userId, username],
    queryFn: async () => {
      if (!userId || !username) throw new Error("Profile not initialized");

      // Set the parameter before querying
      await supabase.rpc('set_request_parameter', {
        name: 'username',
        value: username
      });

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching products:", error);
        throw error;
      }

      return data;
    },
    enabled: !!userId && !!username,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

  if (!userId || !username) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Profile not found</p>
      </div>
    );
  }

  return (
    <PublicProfileContent
      username={username}
      categories={categories}
      products={products}
      viewCount={viewCount}
    />
  );
};

export default PublicProfile;