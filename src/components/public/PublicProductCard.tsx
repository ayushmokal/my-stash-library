import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@/types/product";

interface PublicProductCardProps {
  product: Product;
}

const PublicProductCard = ({ product }: PublicProductCardProps) => {
  return (
    <Card className="group relative flex flex-col overflow-hidden bg-white hover:shadow-lg transition-shadow">
      <div className="relative">
        {product.image_url && (
          <div className="aspect-square w-full overflow-hidden">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
      <CardHeader className="space-y-1 px-4 py-3">
        <div className="text-sm text-muted-foreground">
          {product.brand && (
            <span className="mr-2">{product.brand}</span>
          )}
          {product.category_id && (
            <span className="text-muted-foreground/60">•</span>
          )}
        </div>
        <CardTitle className="text-base font-medium">{product.name}</CardTitle>
      </CardHeader>
    </Card>
  );
};

export default PublicProductCard;