import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Login = () => {
  const { user, loading, signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/feed");
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (isSignUp) {
      if (!username.trim() || !displayName.trim()) {
        toast.error("Username and display name are required");
        setSubmitting(false);
        return;
      }
      const { error } = await signUp(email, password, username.trim(), displayName.trim());
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Account created! Signing you in...");
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          toast.error("Account created but could not auto sign-in. Please sign in manually.");
          setIsSignUp(false);
        }
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
      }
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[350px] space-y-4">
        {/* Main Card */}
        <div className="bg-card border border-border p-8 pb-6 flex flex-col items-center text-center">
          <h1 className="text-4xl font-bold font-['Space_Grotesk'] mb-4">SafeGram</h1>
          <p className="text-muted-foreground text-sm font-semibold mb-6 flex flex-col items-center">
            Sign in to see photos and videos from your friends.
          </p>

          <form onSubmit={handleSubmit} className="w-full space-y-2">
            {isSignUp && (
              <>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="bg-muted/30 h-10 text-xs border-border"
                  required
                />
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Full Name"
                  className="bg-muted/30 h-10 text-xs border-border"
                  required
                />
              </>
            )}
            
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="bg-muted/30 h-10 text-xs border-border"
              required
            />

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="bg-muted/30 h-10 text-xs border-border pr-10"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-xs hover:text-foreground"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <Button
              type="submit"
              disabled={submitting || !email || !password || (isSignUp && (!username || !displayName))}
              className="w-full h-8 mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm rounded-lg"
            >
              {submitting ? "Please wait..." : isSignUp ? "Sign up" : "Log in"}
            </Button>
          </form>

          {!isSignUp && (
            <>
              <div className="flex items-center w-full my-4">
                <div className="flex-1 h-[1px] bg-border"></div>
                <span className="px-4 text-xs font-semibold text-muted-foreground uppercase">or</span>
                <div className="flex-1 h-[1px] bg-border"></div>
              </div>

              <button className="text-[#385185] font-semibold text-sm flex items-center gap-2 mb-4">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5.01 3.66 9.15 8.44 9.9v-7.01h-2.54V12.06h2.54v-2.18c0-2.52 1.5-3.9 3.77-3.9 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7.01C18.34 21.2 22 17.06 22 12.06c0-5.53-4.5-10.02-10-10.02z"/></svg>
                Log in with Facebook
              </button>

              <button className="text-xs text-[#00376b] hover:text-[#00376b]/80">
                Forgot password?
              </button>
            </>
          )}

          {isSignUp && (
             <p className="text-xs text-muted-foreground mt-4 px-2">
               By signing up, you agree to our Terms, Data Policy and Cookies Policy.
             </p>
          )}
        </div>

        {/* Toggle Card */}
        <div className="bg-card border border-border p-5 text-center text-sm">
          {isSignUp ? (
            <p>
              Have an account?{" "}
              <button onClick={() => setIsSignUp(false)} className="text-primary font-semibold hover:text-primary/80">
                Log in
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{" "}
              <button onClick={() => setIsSignUp(true)} className="text-primary font-semibold hover:text-primary/80">
                Sign up
              </button>
            </p>
          )}
        </div>
        
        {/* SafeGram Badge */}
        <div className="flex flex-col items-center pt-4">
           <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold px-3 py-1.5 rounded-full border border-border/50">
             <Shield className="h-3.5 w-3.5" />
             <span>AI-Powered Moderation</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
