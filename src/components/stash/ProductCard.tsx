import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import EditProductForm from "./EditProductForm";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ProductMenu from "./ProductMenu";
import ProductImage from "./ProductImage";
import ProductActions from "./ProductActions";
import { copyToPublicStorage, deleteFromStorage } from "@/utils/storage";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    brand: string | null;
    image_url: string | null;
    affiliate_link: string | null;
    category_id: string;
    position: number;
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
      queryClient.cancelQueries({ queryKey: ["products"] });
    };
  }, [queryClient]);

  useEffect(() => {
    if (product.image_url && user) {
      copyToPublicStorage(product.image_url, user.id);
    }
  }, [product.image_url, user]);

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);

      if (error) throw error;

      if (product.image_url && user) {
        const imagePath = product.image_url.split("/").pop();
        if (imagePath) {
          await deleteFromStorage(imagePath, user.id);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete product");
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="group relative flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
        {user && (
          <>
            <div className="absolute top-2 right-2 z-50">
              <ProductMenu
                onEdit={() => setIsEditDialogOpen(true)}
                onDelete={handleDelete}
              />
            </div>
            <div 
              className="absolute top-2 left-2 z-50 cursor-move touch-none"
              {...attributes}
              {...listeners}
            >
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/80 backdrop-blur-sm hover:bg-white"
              >
                <GripVertical className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
        
        <ProductImage imageUrl={product.image_url} name={product.name} />
        
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl line-clamp-2">{product.name}</CardTitle>
          {product.brand && (
            <p className="text-sm text-muted-foreground line-clamp-1">{product.brand}</p>
          )}
        </CardHeader>

        <ProductActions affiliateLink={product.affiliate_link} />
      </Card>

      <Dialog 
        open={isEditDialogOpen} 
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            queryClient.invalidateQueries({ queryKey: ["products"] });
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <EditProductForm
            product={product}
            onSuccess={() => {
              setIsEditDialogOpen(false);
              if (product.image_url && user) {
                copyToPublicStorage(product.image_url, user.id);
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductCard;