import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    brand: string | null;
    image_url: string | null;
    affiliate_link: string | null;
    category_id: string;
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
      // Cleanup any pending queries
      queryClient.cancelQueries({ queryKey: ["products"] });
    };
  }, [queryClient]);

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);

      if (error) throw error;

      if (product.image_url) {
        const imagePath = product.image_url.split("/").pop();
        if (imagePath) {
          const { error: storageError } = await supabase.storage
            .from("product-images")
            .remove([imagePath]);

          if (storageError) {
            console.error("Error deleting image:", storageError);
          }
        }
      }

      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete product");
    }
  };

  return (
    <>
      <Card className="group relative flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
        {user && (
          <div className="absolute top-2 right-2 z-50">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/80 backdrop-blur-sm hover:bg-white"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-[200px]"
                sideOffset={5}
              >
                <DropdownMenuItem 
                  onClick={() => setIsEditDialogOpen(true)}
                  className="cursor-pointer"
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
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
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl">{product.name}</CardTitle>
          {product.brand && (
            <p className="text-sm text-muted-foreground">{product.brand}</p>
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

      <Dialog 
        open={isEditDialogOpen} 
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            // Cleanup when dialog closes
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
            onSuccess={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductCard;