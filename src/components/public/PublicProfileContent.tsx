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
          console.log('Username parameter set successfully:', username);
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

  // Fetch products
  const { data: products = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ["public-products", username],
    queryFn: async () => {
      if (!username) throw new Error("Username is required");
      console.log('Fetching products for username:', username);

      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .order('position', { ascending: true });

      if (productsError) throw productsError;
      console.log('Products data:', productsData);

      // If there are no products, return empty array
      if (!productsData) return [];

      // Get public URLs for product images
      const productsWithPublicUrls = await Promise.all(productsData.map(async (product) => {
        if (product.image_url) {
          const { data: { publicUrl } } = supabase.storage
            .from("public-profiles")
            .getPublicUrl(product.image_url);
          return { ...product, image_url: publicUrl };
        }
        return product;
      }));

      console.log('Products with public URLs:', productsWithPublicUrls);
      return productsWithPublicUrls;
    },
    enabled: !!username && isParamSet,
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