import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Heart, MessageCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useProfiles } from "@/hooks/useProfiles";
import { usePosts } from "@/hooks/usePosts";

const SearchPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: profiles } = useProfiles();
  const { data: posts } = usePosts();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!authLoading && !user) navigate("/");
  }, [user, authLoading, navigate]);

  const filteredProfiles = useMemo(() => {
    if (!query.trim() || !profiles) return [];
    const q = query.toLowerCase();
    return profiles.filter(
      (p) =>
        p.username.toLowerCase().includes(q) ||
        p.display_name.toLowerCase().includes(q)
    );
  }, [profiles, query]);

  const filteredPosts = useMemo(() => {
    if (!query.trim() || !posts) return posts || [];
    const q = query.toLowerCase();
    return posts.filter(
      (p) =>
        p.caption?.toLowerCase().includes(q) ||
        p.profiles?.username?.toLowerCase().includes(q)
    );
  }, [posts, query]);

  return (
    <div className="min-h-screen bg-background pt-10 pb-20 flex justify-center">
      <div className="w-full max-w-[935px] px-4">
        <div className="mb-8 relative max-w-[500px] mx-auto">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
           <Input
             value={query}
             onChange={(e) => setQuery(e.target.value)}
             placeholder="Search users or hashtags..."
             className="pl-12 h-12 bg-muted/50 rounded-xl text-md border-transparent focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all"
           />
        </div>

        {query.trim() && filteredProfiles.length > 0 && (
          <div className="mb-10 max-w-[500px] mx-auto">
            <h3 className="font-semibold text-muted-foreground mb-4 px-2">Users</h3>
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              {filteredProfiles.map((p, idx) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/profile/${p.id}`)}
                  className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50 transition-colors ${idx !== filteredProfiles.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <Avatar className="h-12 w-12 ring-1 ring-border">
                    <AvatarImage src={p.avatar_url || ""} />
                    <AvatarFallback className="bg-muted text-xs">
                      {p.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-sm truncate">{p.username}</span>
                    <span className="text-muted-foreground text-sm truncate">{p.display_name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-1 md:gap-4 mt-6">
          {filteredPosts.map((post) => (
            <div key={post.id} className="aspect-square relative group cursor-pointer overflow-hidden bg-muted rounded-sm md:rounded-lg">
              <img src={post.image_url} alt={post.caption || ""} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6 text-white font-semibold">
                 <span className="flex items-center gap-1.5"><Heart className="w-6 h-6 fill-white" /> {post.likes?.[0]?.count || 0}</span>
                 <span className="flex items-center gap-1.5"><MessageCircle className="w-6 h-6 fill-white" /> {post.comments?.length || 0}</span>
              </div>
            </div>
          ))}
          {filteredPosts.length === 0 && (
             <div className="col-span-3 text-center py-20 text-muted-foreground">
                No posts found.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
