import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

interface ProductMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

const ProductMenu = ({ onEdit, onDelete }: ProductMenuProps) => {
  return (
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
      <DropdownMenuContent align="end" className="w-[200px]" sideOffset={5}>
        <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDelete}
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProductMenu;