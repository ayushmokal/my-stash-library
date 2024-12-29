import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "@/components/auth/AuthForm";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import ProfileSettings from "@/components/profile/ProfileSettings";
import AddCategoryForm from "@/components/stash/AddCategoryForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import HeaderControls from "@/components/stash/HeaderControls";
import StashContent from "@/components/stash/StashContent";

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUsername(session.user.id);
      } else {
        navigate('/auth');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUsername(session.user.id);
      } else {
        navigate('/auth');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const fetchUsername = async (userId: string) => {
    try {
      console.log('Fetching username for user:', userId);
      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching username:", error);
        return;
      }

      console.log('Profile data:', data);
      setUsername(data?.username || null);

      if (!data?.username) {
        setIsProfileOpen(true);
        toast.info("Please set your username to share your stash!");
      }
    } catch (error: any) {
      console.error("Error fetching username:", error);
    }
  };

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", session?.user?.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
        throw error;
      }

      return data;
    },
    enabled: !!session?.user?.id,
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", session?.user?.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products");
        throw error;
      }

      return data;
    },
    enabled: !!session?.user?.id,
  });

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      navigate('/auth');
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast.error(error.message || "Failed to sign out");
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <AuthForm />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">My stash</h1>
          <HeaderControls
            userEmail={session?.user?.email}
            username={username}
            onProfileOpen={() => setIsProfileOpen(true)}
            onAddCategoryOpen={() => setIsAddCategoryOpen(true)}
            onSignOut={handleSignOut}
          />
        </header>

        <ProfileSettings
          open={isProfileOpen}
          onOpenChange={setIsProfileOpen}
          userEmail={session?.user?.email}
        />

        <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
          <DialogContent className="w-[95vw] max-w-[425px] p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <AddCategoryForm />
          </DialogContent>
        </Dialog>

        <StashContent
          categories={categories}
          products={products}
          onAddCategory={() => setIsAddCategoryOpen(true)}
          isLoading={categoriesLoading || productsLoading}
        />
      </div>
    </div>
  );
};

export default Index;