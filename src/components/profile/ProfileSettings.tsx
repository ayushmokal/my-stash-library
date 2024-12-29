import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProfileSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail: string;
}

const ProfileSettings = ({ open, onOpenChange, userEmail }: ProfileSettingsProps) => {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentUsername, setCurrentUsername] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!open) return; // Don't fetch if dialog is closed
        
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .maybeSingle();
          
          if (error) {
            console.error('Error fetching profile:', error);
            toast.error("Failed to load profile");
            return;
          }

          if (profile?.username) {
            setUsername(profile.username);
            setCurrentUsername(profile.username);
          }
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [open]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Check if username is already taken (if changed)
      if (username !== currentUsername) {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', username)
          .maybeSingle();

        if (existingUser) {
          toast.error("Username is already taken");
          setIsLoading(false);
          return;
        }
      }

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', user.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      setCurrentUsername(username);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
          <DialogDescription>
            Manage your profile settings and preferences.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
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
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !username}>
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileSettings;