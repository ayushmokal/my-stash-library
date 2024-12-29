import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ProductPreviewProps {
  name: string;
  brand?: string;
  imageUrl?: string;
  affiliateLink?: string;
}

const ProductPreview = ({ name, brand, imageUrl, affiliateLink }: ProductPreviewProps) => {
  if (!name || !imageUrl) return null;

  return (
    <Card className="overflow-hidden">
      <div className="aspect-square relative">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={name}
            className="object-cover w-full h-full"
          />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold">{name}</h3>
        {brand && <p className="text-sm text-muted-foreground">{brand}</p>}
      </div>
    </Card>
  );
};

export default ProductPreview;