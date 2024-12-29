import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CategorySection from "@/components/stash/CategorySection";
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
      <div className="container py-4 md:py-8 space-y-6 md:space-y-8 mx-auto px-4">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{username}'s stash</h1>
          <p className="mt-2 text-muted-foreground">Check out my favorite products</p>
          
          <Button 
            onClick={() => navigate("/auth")}
            className="mt-4 md:mt-6"
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create your own stash
          </Button>
        </header>

        <div className="space-y-8 md:space-y-16">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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