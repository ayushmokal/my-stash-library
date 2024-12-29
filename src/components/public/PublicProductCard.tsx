import { Card, CardHeader, CardTitle } from "@/components/ui/card";

interface Product {
  id: string;
  name: string;
  brand: string | null;
  image_url: string | null;
  affiliate_link: string | null;
}

interface PublicProductCardProps {
  product: Product;
}

const PublicProductCard = ({ product }: PublicProductCardProps) => {
  return (
    <Card className="group relative flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        {product.image_url && (
          <div className="aspect-square w-full overflow-hidden">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
      </div>
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl line-clamp-2">{product.name}</CardTitle>
        {product.brand && (
          <p className="text-sm text-muted-foreground line-clamp-1">{product.brand}</p>
        )}
      </CardHeader>
    </Card>
  );
};

export default PublicProductCard;