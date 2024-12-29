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
          className="w-full h-[300px] flex flex-col items-center justify-center space-y-4 bg-stash-gray hover:bg-stash-gray-dark border-2 border-dashed border-gray-300 rounded-lg transition-colors"
        >
          <Plus size={48} className="text-gray-400" />
          <div className="text-xl font-semibold">
            Add<br />your Stuff
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[425px] p-4 md:p-6">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <AddProductForm />
      </DialogContent>
    </Dialog>
  );
};

export default AddStuffCard;