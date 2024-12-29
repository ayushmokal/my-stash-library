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

interface HeaderControlsProps {
  userEmail?: string;
  username?: string | null;
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
  const handleShare = async () => {
    try {
      if (!username) {
        toast.error("Please set a username in your profile settings first", {
          action: {
            label: "Open Settings",
            onClick: onProfileOpen,
          },
        });
        return;
      }

      const url = `${window.location.origin}/${username}`;
      await navigator.clipboard.writeText(url);
      
      toast.success("Public link copied to clipboard!", {
        description: "Share this link with anyone to show them your stash!",
      });
    } catch (error) {
      console.error('Error sharing stash:', error);
      toast.error("Failed to copy link to clipboard");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
      <Button 
        variant="outline" 
        onClick={handleShare} 
        className="w-full sm:w-auto"
      >
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