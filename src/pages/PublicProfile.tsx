import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PublicProfileContent from "@/components/public/PublicProfileContent";

const PublicProfile = () => {
  const { username } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    const initializeProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!username) {
          setError("Username is required");
          return;
        }

        // First, set the username parameter for RLS policies
        const { error: paramError } = await supabase.rpc('set_request_parameter', {
          name: 'username',
          value: username
        });

        if (paramError) {
          console.error('Error setting username parameter:', paramError);
          throw paramError;
        }

        // Fetch the profile data
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
          setError(`Profile "${username}" not found`);
          return;
        }

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
        console.error("Error initializing profile:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    initializeProfile();
  }, [username]);

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

  return (
    <PublicProfileContent
      username={username}
      viewCount={viewCount}
    />
  );
};

export default PublicProfile;