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
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 space-y-8 max-w-7xl mx-auto px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight">{username}'s stash</h1>
          <p className="mt-2 text-muted-foreground">Check out my favorite products</p>
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
                {categoryProducts.map((product) => (
                  <PublicProductCard key={product.id} product={product} />
                ))}
              </CategorySection>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PublicProfileContent;