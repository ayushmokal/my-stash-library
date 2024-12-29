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

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Fetching profile for username:', username);
        
        if (!username) {
          setError("Username is required");
          return;
        }

        const { error: paramError } = await supabase.rpc('set_request_parameter', {
          name: 'username',
          value: username
        });

        if (paramError) {
          console.error('Error setting username parameter:', paramError);
          throw paramError;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", username)
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile:', error);
          throw error;
        }
        
        if (!data) {
          console.log('No profile found for username:', username);
          setError(`Profile "${username}" not found`);
          return;
        }

        console.log('Found profile:', data);
        setUserId(data.id);
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchUserId();
    }
  }, [username]);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["public-categories", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["public-products", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
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
    />
  );
};

export default PublicProfile;