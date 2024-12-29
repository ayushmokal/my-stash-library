import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AddProductForm from "./AddProductForm";

const AddStuffCard = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full aspect-square flex flex-col items-center justify-center space-y-4 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
        >
          <Plus size={24} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-600">Add Item</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[425px] p-4 md:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <AddProductForm />
      </DialogContent>
    </Dialog>
  );
};

export default AddStuffCard;