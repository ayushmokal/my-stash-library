import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface AuthFormProps {
  initialUsername?: string;
}

const AuthForm = ({ initialUsername = "" }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(!!initialUsername);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Sign up flow
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', initialUsername)
          .maybeSingle();

        if (existingProfile) {
          toast.error("This username is already taken. Please choose another one.");
          setIsLoading(false);
          return;
        }

        const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: initialUsername,
            },
          },
        });

        if (signUpError) {
          if (signUpError.message === "User already registered") {
            toast.error("This email is already registered. Please sign in instead.", {
              duration: 5000,
              action: {
                label: "Sign In",
                onClick: () => setIsSignUp(false),
              },
            });
            setIsLoading(false);
            return;
          }
          throw signUpError;
        }

        // Update profile with username immediately after signup
        if (signUpData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ username: initialUsername })
            .eq('id', signUpData.user.id);

          if (profileError) {
            console.error("Error updating profile:", profileError);
            toast.error("Failed to set username");
            return;
          }
        }

        toast.success("Successfully signed up! Check your email for confirmation.");
        navigate("/dashboard");
      } else {
        // Sign in flow
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          if (signInError.message === "Email not confirmed") {
            toast.error("Please confirm your email address before signing in. Check your inbox for the confirmation link.", {
              duration: 5000,
            });
            setIsLoading(false);
            return;
          }
          throw signInError;
        }

        toast.success("Successfully signed in!");
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to authenticate");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">My stash</h1>
        {initialUsername ? (
          <>
            <h2 className="text-2xl font-semibold">Now, create your account</h2>
            <p className="text-muted-foreground">mystash.tech/{initialUsername} is yours!</p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold">
              {isSignUp ? "Create your account" : "Sign in to your account"}
            </h2>
            {!isSignUp && (
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button
                  onClick={() => setIsSignUp(true)}
                  className="text-primary hover:underline font-medium"
                >
                  Create one
                </button>
              </p>
            )}
            {isSignUp && (
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  onClick={() => setIsSignUp(false)}
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            )}
          </>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-white"
          disabled={isLoading}
        />
        
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-white"
          disabled={isLoading}
        />

        <Button 
          type="submit"
          className="w-full bg-black hover:bg-gray-800 text-white"
          disabled={isLoading}
        >
          {isSignUp ? "Create Account" : "Sign In"}
        </Button>
      </form>
    </div>
  );
};

export default AuthForm;