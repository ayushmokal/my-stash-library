import { ReactNode } from "react";
import CategorySection from "./CategorySection";
import AddStuffCard from "./AddStuffCard";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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

interface StashContentProps {
  categories: Category[];
  products: Product[];
  onAddCategory: () => void;
}

const StashContent = ({ categories, products, onAddCategory }: StashContentProps) => {
  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Welcome to My Stash!</h2>
        <p className="text-muted-foreground mb-8">
          Get started by creating your first category to organize your stuff.
        </p>
        <Button onClick={onAddCategory}>
          <Plus className="mr-2 h-4 w-4" />
          Create Your First Category
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {categories.map((category) => (
        <CategorySection 
          key={category.id} 
          title={category.name}
          categoryId={category.id}
        >
          {products
            .filter((product) => product.category_id === category.id)
            .map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          <AddStuffCard />
        </CategorySection>
      ))}
    </div>
  );
};

export default StashContent;