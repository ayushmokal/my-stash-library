import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CategorySection from "../stash/CategorySection";
import PublicProductCard from "./PublicProductCard";

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  brand: string | null;
  image_url: string | null;
  affiliate_link: string | null;
  category_id: string;
  user_id: string;
}

interface PublicProfileContentProps {
  username: string;
  categories: Category[];
  products: Product[];
}

const PublicProfileContent = ({ username, categories, products }: PublicProfileContentProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 space-y-8 max-w-7xl mx-auto px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight">{username}'s stash</h1>
          <p className="mt-2 text-muted-foreground">Check out my favorite products</p>
          
          <Button 
            onClick={() => navigate("/auth")}
            className="mt-6"
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Your Own Stash
          </Button>
        </header>

        <div className="space-y-16">
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
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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