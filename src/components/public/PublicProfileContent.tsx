import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PublicHeader from "./PublicHeader";
import PublicCategorySection from "./PublicCategorySection";

interface PublicProfileContentProps {
  username: string | null;
  viewCount: number;
}

const PublicProfileContent = ({
  username,
  viewCount,
}: PublicProfileContentProps) => {
  const [isParamSet, setIsParamSet] = useState(false);

  // Set the username parameter for RLS policies
  useEffect(() => {
    const setUsernameParam = async () => {
      if (username) {
        try {
          await supabase.rpc('set_request_parameter', {
            name: 'username',
            value: username
          });
          setIsParamSet(true);
        } catch (error) {
          console.error("Error setting username parameter:", error);
          setIsParamSet(false);
        }
      }
    };
    setUsernameParam();
  }, [username]);

  // Fetch profile data including theme customization
  const { data: profileData } = useQuery({
    queryKey: ["public-profile", username],
    queryFn: async () => {
      if (!username) throw new Error("Username is required");
      console.log('Fetching profile data for username:', username);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

      if (error) throw error;
      console.log('Profile data:', data);
      return data;
    },
    enabled: !!username,
  });

  // Fetch categories
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["public-categories", username],
    queryFn: async () => {
      if (!username) throw new Error("Username is required");
      console.log('Fetching categories for username:', username);

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order('created_at', { ascending: true });

      if (error) throw error;
      console.log('Categories data:', data);
      return data || [];
    },
    enabled: !!username && isParamSet,
  });

  // Fetch products with public URLs
  const { data: products = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ["public-products", username, profileData?.id],
    queryFn: async () => {
      if (!username || !profileData?.id) throw new Error("Username and profile ID are required");
      console.log('Fetching products for profile ID:', profileData.id);

      // First, fetch all products from the database
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .order('created_at', { ascending: true });

      if (productsError) throw productsError;
      console.log('Products data:', productsData);

      // Then, fetch the list of files from public-profiles storage
      const { data: storageFiles, error: storageError } = await supabase.storage
        .from("public-profiles")
        .list(profileData.id);

      if (storageError) {
        console.error("Error fetching storage files:", storageError);
        return productsData;
      }
      console.log('Storage files:', storageFiles);

      // Map products to include public URLs for images
      const productsWithPublicUrls = productsData.map(product => {
        if (product.image_url) {
          const fileName = product.image_url.split('/').pop();
          const matchingFile = storageFiles.find(file => file.name === fileName);
          
          if (matchingFile) {
            const { data: { publicUrl } } = supabase.storage
              .from("public-profiles")
              .getPublicUrl(`${profileData.id}/${fileName}`);
            console.log('Public URL for product:', publicUrl);
            return { ...product, image_url: publicUrl };
          }
        }
        return product;
      });

      console.log('Products with public URLs:', productsWithPublicUrls);
      return productsWithPublicUrls;
    },
    enabled: !!username && isParamSet && !!profileData?.id,
  });

  if (!username) {
    return null;
  }

  if (isCategoriesLoading || isProductsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading profile...</p>
      </div>
    );
  }

  const containerStyle = {
    backgroundColor: profileData?.background_color || '#FFFFFF',
    minHeight: '100vh',
  };

  const accentColor = profileData?.theme_color || '#6B4E9B';

  return (
    <div style={containerStyle}>
      <div className="container py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PublicHeader 
          username={username} 
          viewCount={viewCount} 
          accentColor={accentColor}
        />

        <div className="space-y-8">
          {categories.map((category) => {
            const categoryProducts = products.filter(
              (product) => product.category_id === category.id
            );

            return (
              <PublicCategorySection
                key={category.id}
                category={category}
                products={categoryProducts}
                accentColor={accentColor}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PublicProfileContent;