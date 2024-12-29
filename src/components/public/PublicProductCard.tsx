import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { Product } from "@/types/product";

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
      {product.affiliate_link && (
        <CardContent>
          <a
            href={product.affiliate_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            Buy now <ExternalLink className="ml-1 h-4 w-4" />
          </a>
        </CardContent>
      )}
    </Card>
  );
};

export default PublicProductCard;