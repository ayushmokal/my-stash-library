import { Skeleton } from "@/components/ui/skeleton";

const ProductSkeleton = () => {
  return (
    <div className="relative group">
      <div className="overflow-hidden rounded-lg border bg-card">
        <Skeleton className="aspect-square w-full" />
        <div className="p-3 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;