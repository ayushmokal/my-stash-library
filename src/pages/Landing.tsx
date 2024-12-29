import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Landing = () => {
  const [username, setUsername] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const navigate = useNavigate();

  const handleUsernameCheck = async () => {
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }

    setIsChecking(true);
    try {
      const { data: existingUser, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (existingUser) {
        toast.error("This username is already taken");
        return;
      }

      navigate("/auth", { state: { username } });
    } catch (error: any) {
      console.error("Username check error:", error);
      toast.error(error.message || "Failed to check username");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#E5DEFF] via-[#F1F0FB] to-white">
      {/* Banner Section */}
      <div className="w-full py-12 mb-8 text-center">
        <h1 className="text-4xl font-bold text-[#1A1F2C] mb-2">My Stash</h1>
        <p className="text-[#1A1F2C]/80">Organize and share your favorite products</p>
      </div>

      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">First, claim your unique link</h2>
          <p className="text-muted-foreground">The good ones are still available!</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground whitespace-nowrap">mystash.me/</span>
            <Input
              type="text"
              placeholder="your-name"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              className="bg-white"
            />
          </div>

          <Button
            onClick={handleUsernameCheck}
            disabled={isChecking}
            className="w-full bg-black hover:bg-gray-800 text-white"
          >
            {isChecking ? "Checking..." : "Grab my Link"}
          </Button>

          <div className="text-center">
            <span className="text-sm text-muted-foreground">
              or{" "}
              <button
                onClick={() => navigate("/auth")}
                className="text-blue-600 hover:underline"
              >
                log in
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;