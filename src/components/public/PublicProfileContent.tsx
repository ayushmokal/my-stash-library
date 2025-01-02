import { useNavigate } from "react-router-dom";
import { Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicProductCard from "./PublicProductCard";
import CategorySection from "../stash/CategorySection";

interface PublicProfileContentProps {
  username: string | null;
  categories: any[];
  products: any[];
  viewCount: number;
}

const PublicProfileContent = ({
  username,
  categories,
  products,
  viewCount,
}: PublicProfileContentProps) => {
  const navigate = useNavigate();

  if (!username) {
    return null;
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
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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