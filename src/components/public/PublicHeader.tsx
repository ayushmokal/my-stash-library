import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

interface PublicHeaderProps {
  username: string | null;
  viewCount: number;
  accentColor: string;
}

const PublicHeader = ({ username, viewCount, accentColor }: PublicHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: accentColor }}>
          {username}'s stash
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Check out my favorite products
        </p>
        <div className="flex items-center gap-2 mt-2 text-muted-foreground">
          <Eye className="h-4 w-4" />
          <span className="text-sm">{viewCount} views</span>
        </div>
      </div>
      <Button 
        onClick={() => navigate("/auth")}
        className="mt-4 sm:mt-0"
        size="sm"
        style={{ backgroundColor: accentColor }}
      >
        <Plus className="mr-2 h-4 w-4" />
        Create Your Own Stash
      </Button>
    </header>
  );
};

export default PublicHeader;