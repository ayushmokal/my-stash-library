import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import ProfileTab from "./ProfileTab";
import AppearanceTab from "./AppearanceTab";

interface ProfileSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail: string;
}

const ProfileSettings = ({ open, onOpenChange, userEmail }: ProfileSettingsProps) => {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentUsername, setCurrentUsername] = useState("");
  const [themeColor, setThemeColor] = useState("#6B4E9B");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [layoutStyle, setLayoutStyle] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!open) return;
        
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('username, theme_color, background_color, layout_style')
            .eq('id', user.id)
            .maybeSingle();
          
          if (error) {
            console.error('Error fetching profile:', error);
            toast.error("Failed to load profile");
            return;
          }

          if (profile) {
            setUsername(profile.username || "");
            setCurrentUsername(profile.username || "");
            setThemeColor(profile.theme_color || "#6B4E9B");
            setBackgroundColor(profile.background_color || "#FFFFFF");
            setLayoutStyle(profile.layout_style as "grid" | "list" || "grid");
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
        .update({ 
          username,
          theme_color: themeColor,
          background_color: backgroundColor,
          layout_style: layoutStyle
        })
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
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <ProfileTab
              userEmail={userEmail}
              username={username}
              setUsername={setUsername}
              isLoading={isLoading}
              onCancel={() => onOpenChange(false)}
              onSubmit={handleUpdateProfile}
            />
          </TabsContent>
          <TabsContent value="appearance">
            <AppearanceTab
              themeColor={themeColor}
              setThemeColor={setThemeColor}
              backgroundColor={backgroundColor}
              setBackgroundColor={setBackgroundColor}
              layoutStyle={layoutStyle}
              setLayoutStyle={setLayoutStyle}
              isLoading={isLoading}
              onCancel={() => onOpenChange(false)}
              onSubmit={handleUpdateProfile}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileSettings;