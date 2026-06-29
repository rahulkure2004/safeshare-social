import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePosts } from "@/hooks/usePosts";
import { useProfiles } from "@/hooks/useProfiles";
import { useReels } from "@/hooks/useReels";
import { PostCard } from "@/components/PostCard";
import { ReelFeedCard } from "@/components/ReelFeedCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { data: posts, isLoading: postsLoading } = usePosts();
  const { data: profiles, isLoading: profilesLoading } = useProfiles();
  const { data: reels, isLoading: reelsLoading } = useReels();

  const feed = [
    ...(posts || []).map((p: any) => ({ kind: "post" as const, item: p, created_at: p.created_at }))
  ].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  
  const { user, profile: currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  const isLoading = postsLoading || profilesLoading || reelsLoading || authLoading;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Find some suggested profiles (excluding the current user)
  const suggestedProfiles = profiles?.filter(p => p.id !== currentUser?.id).slice(0, 5) || [];

  return (
    <div className="flex justify-center max-w-[1024px] mx-auto pt-8 px-4">
      {/* Main Feed */}
      <div className="w-full max-w-[630px] flex flex-col gap-6 pb-20">
        {/* Stories Section (Mock) */}
        <div className="w-full bg-card rounded-xl border border-border p-4 flex gap-4 overflow-x-auto no-scrollbar">
          {currentUser && (
            <div className="flex flex-col items-center gap-1 cursor-pointer shrink-0">
              <div className="relative">
                <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-fuchsia-600">
                  <div className="w-full h-full rounded-full border-2 border-background overflow-hidden">
                    <img src={currentUser.avatar_url || "/placeholder.svg"} className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center border-2 border-background text-xs font-bold">
                  +
                </div>
              </div>
              <span className="text-xs text-muted-foreground">Your story</span>
            </div>
          )}
          {suggestedProfiles.map(p => (
            <div key={p.id} className="flex flex-col items-center gap-1 cursor-pointer shrink-0">
              <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-fuchsia-600">
                <div className="w-full h-full rounded-full border-2 border-background overflow-hidden">
                  <img src={p.avatar_url || "/placeholder.svg"} className="w-full h-full object-cover" />
                </div>
              </div>
              <span className="text-xs w-16 truncate text-center">{p.username}</span>
            </div>
          ))}
        </div>

        {/* Feed Posts */}
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="flex items-center gap-3 p-4">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              </div>
              <Skeleton className="aspect-square w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))
        ) : (
          currentUser ? feed.map((entry) =>
            entry.kind === "post"
              ? <PostCard key={`p-${entry.item.id}`} post={entry.item} currentUser={currentUser} />
              : <ReelFeedCard key={`r-${entry.item.id}`} reel={entry.item} currentUser={currentUser} />
          ) : null
        )}
      </div>

      {/* Right Sidebar Suggestions */}
      <div className="hidden lg:block w-[320px] pl-10 pr-4 shrink-0">
        <div className="sticky top-10 space-y-6">
          {currentUser && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate(`/profile/${currentUser.id}`)}>
                <img
                  src={currentUser.avatar_url || "/placeholder.svg"}
                  alt={currentUser.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-sm hover:text-muted-foreground transition-colors">{currentUser.username}</p>
                  <p className="text-sm text-muted-foreground">{currentUser.display_name}</p>
                </div>
              </div>
              <button className="text-xs font-semibold text-primary hover:text-foreground transition-colors">Switch</button>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-muted-foreground">Suggested for you</p>
              <button className="text-xs font-semibold hover:text-muted-foreground transition-colors">See All</button>
            </div>
            
            <div className="space-y-4">
              {suggestedProfiles.map(p => (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/profile/${p.id}`)}>
                    <img
                      src={p.avatar_url || "/placeholder.svg"}
                      alt={p.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-sm hover:text-muted-foreground transition-colors">{p.username}</p>
                      <p className="text-xs text-muted-foreground">Suggested for you</p>
                    </div>
                  </div>
                  <button className="text-xs font-semibold text-primary hover:text-foreground transition-colors">Follow</button>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-muted-foreground space-y-4">
            <p>© 2026 SafeGram inspired by Instagram Web</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
