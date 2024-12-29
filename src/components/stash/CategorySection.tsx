import { ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

interface CategorySectionProps {
  title: string;
  categoryId: string;
  children: ReactNode;
  products: Array<{ id: string; position: number; category_id: string; name: string; user_id: string }>;
  isPublicView?: boolean;
}

export const CategorySection = ({ title, categoryId, children, products, isPublicView = false }: CategorySectionProps) => {
  const queryClient = useQueryClient();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Category deleted successfully");
    } catch (error: any) {
      console.error("Error deleting category:", error);
      toast.error(error.message || "Failed to delete category");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = products.findIndex((item) => item.id === active.id);
    const newIndex = products.findIndex((item) => item.id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const newOrder = arrayMove(products, oldIndex, newIndex);
    
    try {
      const updates = newOrder.map((item, index) => ({
        id: item.id,
        position: index + 1,
        category_id: item.category_id,
        name: item.name,
        user_id: item.user_id
      }));

      const { error } = await supabase
        .from('products')
        .upsert(updates, { onConflict: 'id' });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product order updated");
    } catch (error: any) {
      console.error("Error updating positions:", error);
      toast.error("Failed to update product order");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  };

  return (
    <section className="w-full space-y-4 animate-fade-in">
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-stash-gray rounded-lg">
        <h2 className="text-xl sm:text-2xl font-semibold">{title}</h2>
        {!isPublicView && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-100">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="w-[95vw] max-w-[425px] p-4 sm:p-6">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Category</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this category? This will also remove all products in this category.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={products} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {children}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  );
};

export default CategorySection;