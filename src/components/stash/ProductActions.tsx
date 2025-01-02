import { ExternalLink } from "lucide-react";
import { CardContent } from "@/components/ui/card";

interface ProductActionsProps {
  affiliateLink: string | null;
}

const ProductActions = ({ affiliateLink }: ProductActionsProps) => {
  if (!affiliateLink) return null;

  return (
    <CardContent>
      <a
        href={affiliateLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
      >
        Buy now <ExternalLink className="ml-1 h-4 w-4" />
      </a>
    </CardContent>
  );
};

export default ProductActions;