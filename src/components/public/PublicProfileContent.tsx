import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Eye } from "lucide-react";
import CategorySection from "../stash/CategorySection";
import PublicProductCard from "./PublicProductCard";
import { Product, Category } from "@/types/product";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PublicProfileContentProps {
  username: string;
  categories: Category[];
  products: Product[];
  userId: string;
}

const PublicProfileContent = ({ username, categories, products, userId }: PublicProfileContentProps) => {
  const navigate = useNavigate();

  const { data: viewCount = 0 } = useQuery({
    queryKey: ["profile-views", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profile_views")
        .select("view_count")
        .eq("profile_id", userId)
        .single();

      if (error) {
        console.error("Error fetching view count:", error);
        return 0;
      }

      return data?.view_count || 0;
    },
    enabled: !!userId,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">{username}'s stash</h1>
          <p className="mt-4 text-muted-foreground text-lg">Check out my favorite products</p>
          
          <div className="flex items-center justify-center gap-2 mt-4 text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span>{viewCount} views</span>
          </div>

          <Button 
            onClick={() => navigate("/auth")}
            className="mt-6"
            variant="outline"
            size="lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Your Own Stash
          </Button>
        </header>

        <div className="space-y-12">
          {categories.map((category) => {
            const categoryProducts = products.filter(
              (product) => product.category_id === category.id
            );

            if (categoryProducts.length === 0) return null;

            return (
              <CategorySection
                key={category.id}
                title={category.name}
                categoryId={category.id}
                products={categoryProducts}
                isPublicView={true}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                  {categoryProducts.map((product) => (
                    <PublicProductCard key={product.id} product={product} />
                  ))}
                </div>
              </CategorySection>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PublicProfileContent;