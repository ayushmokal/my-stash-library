import { Button } from "@/components/ui/button";
import { Share2, Plus, User } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

interface HeaderControlsProps {
  userEmail?: string;
  username?: string;
  onProfileOpen: () => void;
  onAddCategoryOpen: () => void;
  onSignOut: () => void;
}

const HeaderControls = ({
  userEmail,
  username,
  onProfileOpen,
  onAddCategoryOpen,
  onSignOut,
}: HeaderControlsProps) => {
  const navigate = useNavigate();

  const handleShare = () => {
    if (!username) {
      toast.error("Please set a username in your profile settings first");
      return;
    }
    const url = `${window.location.origin}/${username}`;
    navigator.clipboard.writeText(url);
    toast.success("Public link copied to clipboard!", {
      description: "Share this link with anyone to show them your stash!",
    });
  };

  return (
    <div className="flex items-center gap-4">
      <Button variant="outline" onClick={handleShare}>
        <Share2 className="mr-2 h-4 w-4" />
        Share my stash
      </Button>
      <Button variant="outline" size="icon" onClick={onAddCategoryOpen}>
        <Plus className="h-6 w-6" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <User className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{userEmail}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onProfileOpen}>
            Profile Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast.info("Account settings coming soon!")}>
            Account Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onSignOut} className="text-red-600">
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default HeaderControls;