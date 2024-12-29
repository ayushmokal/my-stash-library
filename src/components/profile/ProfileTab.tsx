import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileTabProps {
  userEmail: string;
  username: string;
  setUsername: (username: string) => void;
  isLoading: boolean;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const ProfileTab = ({ 
  userEmail, 
  username, 
  setUsername, 
  isLoading, 
  onCancel, 
  onSubmit 
}: ProfileTabProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={userEmail} disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          placeholder="Choose a username"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
          disabled={isLoading}
        />
        <p className="text-sm text-muted-foreground">
          This will be your custom URL: mystash.tech/{username}
        </p>
      </div>
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !username}>
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default ProfileTab;