import { useNavigate } from "react-router-dom";
import { Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicProductCard from "./PublicProductCard";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface PublicProfileContentProps {
  username: string | null;
  viewCount: number;
}

const PublicProfileContent = ({
  username,
  viewCount,
}: PublicProfileContentProps) => {
  const navigate = useNavigate();
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

  // Fetch user ID for the given username
  const { data: userData } = useQuery({
    queryKey: ["public-user", username],
    queryFn: async () => {
      if (!username) throw new Error("Username is required");

      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!username,
  });

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["public-categories", username],
    queryFn: async () => {
      if (!username) throw new Error("Username is required");

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!username && isParamSet,
  });

  const { data: products = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ["public-products", username],
    queryFn: async () => {
      if (!username || !userData?.id) throw new Error("Username and user ID are required");

      // Fetch products from public-profiles storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from("public-profiles")
        .list(userData.id);

      if (storageError) {
        console.error("Error fetching from storage:", storageError);
      }

      // Fetch products from database
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Merge storage data with database data
      const productsWithPublicUrls = data.map(product => {
        if (product.image_url) {
          const fileName = product.image_url.split('/').pop();
          const storageFile = storageData?.find(file => file.name === fileName);
          if (storageFile) {
            const { data: { publicUrl } } = supabase.storage
              .from("public-profiles")
              .getPublicUrl(`${userData.id}/${fileName}`);
            return { ...product, image_url: publicUrl };
          }
        }
        return product;
      });

      return productsWithPublicUrls || [];
    },
    enabled: !!username && isParamSet && !!userData?.id,
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{username}'s stash</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Check out my favorite products
            </p>
            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span className="text-sm">{viewCount} views</span>
            </div>
          </div>
          <Button 
            onClick={() => navigate("/auth")}
            className="mt-4 sm:mt-0"
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Your Own Stash
          </Button>
        </header>

        <div className="space-y-8">
          {categories.map((category) => {
            const categoryProducts = products.filter(
              (product) => product.category_id === category.id
            );

            if (categoryProducts.length === 0) {
              return null;
            }

            return (
              <div key={category.id} className="space-y-4">
                <div className="flex items-center justify-between px-4 py-2 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">{category.name}</h2>
                    <span className="px-2 py-1 text-xs rounded-full bg-secondary">
                      {categoryProducts.length} items
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryProducts.map((product) => (
                    <PublicProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PublicProfileContent;