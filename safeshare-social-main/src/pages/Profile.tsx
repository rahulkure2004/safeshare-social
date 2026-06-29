import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Grid3X3, Settings, Loader2, Trash2, Bookmark, UserSquare, Clapperboard, Heart, MessageCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Profile as ProfileType, Post } from "@/types";
import { toast } from "sonner";

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile: authProfile, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "reels" | "saved" | "tagged">("posts");
  const fileRef = useRef<HTMLInputElement>(null);

  const profileId = id || user?.id;
  const isOwnProfile = user?.id === profileId;

  const fetchData = async () => {
    if (!profileId) return;
    setLoading(true);
    const [profileRes, postsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", profileId).single(),
      supabase
        .from("posts")
        .select("*, profiles (*), comments (*, profiles (*)), likes (count)")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false }),
    ]);
    setProfile(profileRes.data as ProfileType | null);
    setPosts((postsRes.data as unknown as Post[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
      return;
    }
    fetchData();
  }, [profileId, authLoading, user, navigate]);

  const handleEdit = async () => {
    if (!user) return;
    setSaving(true);
    try {
      let avatar_url = profile?.avatar_url || null;
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("avatars").upload(path, avatarFile, { upsert: true });
        if (upErr) throw upErr;
        avatar_url = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
      }
      const { error } = await supabase
        .from("profiles")
        .update({
          username: editUsername.trim(),
          display_name: editName.trim(),
          bio: editBio.trim() || null,
          avatar_url,
        })
        .eq("id", user.id);
      if (error) throw error;
      toast.success("Profile updated!");
      setEditOpen(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      await fetchData();
    } catch (e: any) {
      toast.error(e.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-10 pb-20 flex justify-center">
      <div className="w-full max-w-[935px] px-4">
        {/* Profile Header */}
        <header className="flex flex-col md:flex-row gap-8 md:gap-24 mb-12 items-center md:items-start md:px-10">
          {/* Avatar */}
          <div className="shrink-0 flex justify-center">
            <div className="w-[150px] h-[150px] rounded-full overflow-hidden border border-border p-1">
               <img src={profile.avatar_url || "/placeholder.svg"} className="w-full h-full rounded-full object-cover" />
            </div>
          </div>
          
          {/* Info */}
          <div className="flex-1 flex flex-col gap-4 max-w-full">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <h1 className="text-xl font-medium">{profile.username}</h1>
              <div className="flex items-center gap-2">
                {isOwnProfile ? (
                  <>
                    <Dialog open={editOpen} onOpenChange={(o) => {
                      setEditOpen(o);
                      if (o) {
                        setEditName(profile.display_name);
                        setEditUsername(profile.username);
                        setEditBio(profile.bio || "");
                        setAvatarPreview(profile.avatar_url || null);
                        setAvatarFile(null);
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="secondary" className="font-semibold px-4 h-8 text-sm bg-secondary/50 hover:bg-secondary/70">
                          Edit profile
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                          <DialogTitle>Edit Profile</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex flex-col items-center gap-2">
                            <Avatar className="h-20 w-20 ring-2 ring-primary/30">
                              <AvatarImage src={avatarPreview || ""} />
                              <AvatarFallback>{editUsername.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <label className="text-xs text-primary cursor-pointer hover:underline">
                              Change avatar
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (!f) return;
                                if (f.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return; }
                                setAvatarFile(f);
                                setAvatarPreview(URL.createObjectURL(f));
                              }} />
                            </label>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm text-muted-foreground font-medium">Username</label>
                            <Input value={editUsername} onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} className="bg-muted/50" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm text-muted-foreground font-medium">Display Name</label>
                            <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="bg-muted/50" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm text-muted-foreground font-medium">Bio</label>
                            <Textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} className="bg-muted/50 resize-none" rows={3} maxLength={200} />
                          </div>
                          <Button onClick={handleEdit} disabled={saving || !editName.trim() || !editUsername.trim()} className="w-full gradient-bg text-primary-foreground">
                            {saving ? "Saving..." : "Save"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="secondary" className="font-semibold px-4 h-8 text-sm bg-secondary/50 hover:bg-secondary/70">
                      View archive
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 ml-1" onClick={async () => {
                      if (confirm("Log out of SafeGram?")) {
                        await signOut();
                        navigate("/");
                      }
                    }}>
                      <Settings className="w-5 h-5" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button className="font-semibold px-6 h-8 text-sm bg-primary text-primary-foreground hover:bg-primary/90">
                      Follow
                    </Button>
                    <Button variant="secondary" className="font-semibold px-4 h-8 text-sm bg-secondary/50 hover:bg-secondary/70">
                      Message
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="hidden md:flex gap-10">
              <p><span className="font-semibold">{posts.length}</span> posts</p>
              <p><span className="font-semibold">0</span> followers</p>
              <p><span className="font-semibold">0</span> following</p>
            </div>

            <div className="text-center md:text-left mt-2 md:mt-0">
              <h2 className="font-semibold text-sm">{profile.display_name}</h2>
              {profile.bio && <p className="text-sm whitespace-pre-wrap">{profile.bio}</p>}
            </div>
            
            {/* Mobile Stats */}
            <div className="flex md:hidden justify-around border-t border-border pt-3 mt-4 text-sm w-full">
               <div className="flex flex-col items-center"><span className="font-semibold">{posts.length}</span> <span className="text-muted-foreground">posts</span></div>
               <div className="flex flex-col items-center"><span className="font-semibold">0</span> <span className="text-muted-foreground">followers</span></div>
               <div className="flex flex-col items-center"><span className="font-semibold">0</span> <span className="text-muted-foreground">following</span></div>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="border-t border-border flex justify-center gap-12 text-[12px] font-semibold tracking-widest uppercase">
          <button
            className={`flex items-center gap-2 h-[52px] border-t-2 -mt-[1px] transition-colors ${activeTab === 'posts' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('posts')}
          >
            <Grid3X3 className="w-4 h-4" /> Posts
          </button>
          <button
             className={`flex items-center gap-2 h-[52px] border-t-2 -mt-[1px] transition-colors ${activeTab === 'reels' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
             onClick={() => setActiveTab('reels')}
          >
            <Clapperboard className="w-4 h-4" /> Reels
          </button>
          {isOwnProfile && (
            <button
               className={`flex items-center gap-2 h-[52px] border-t-2 -mt-[1px] transition-colors ${activeTab === 'saved' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
               onClick={() => setActiveTab('saved')}
            >
              <Bookmark className="w-4 h-4" /> Saved
            </button>
          )}
          <button
             className={`flex items-center gap-2 h-[52px] border-t-2 -mt-[1px] transition-colors ${activeTab === 'tagged' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
             onClick={() => setActiveTab('tagged')}
          >
            <UserSquare className="w-4 h-4" /> Tagged
          </button>
        </div>

        {/* Grid */}
        <div className="mt-2">
          {activeTab === 'posts' && (
            posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                 <div className="w-16 h-16 rounded-full border-2 border-muted-foreground flex items-center justify-center mb-4">
                    <Grid3X3 className="w-8 h-8" />
                 </div>
                 <h2 className="text-3xl font-bold text-foreground mb-4">No Posts Yet</h2>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1 md:gap-4">
                {posts.map((post) => (
                  <div key={post.id} className="aspect-square relative group cursor-pointer overflow-hidden bg-muted">
                    <img src={post.image_url} alt={post.caption || ""} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-semibold">
                      <span className="flex items-center gap-1.5"><Heart className="w-5 h-5 fill-white" /> {post.likes?.[0]?.count || 0}</span>
                      <span className="flex items-center gap-1.5"><MessageCircle className="w-5 h-5 fill-white" /> {post.comments?.length || 0}</span>
                    </div>
                    {isOwnProfile && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!confirm("Delete this post?")) return;
                          const { error } = await supabase.from("posts").delete().eq("id", post.id);
                          if (error) return toast.error(error.message);
                          toast.success("Post deleted");
                          setPosts((prev) => prev.filter((p) => p.id !== post.id));
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
          
          {activeTab !== 'posts' && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
               <h2 className="text-2xl font-bold text-foreground mb-2">No Content</h2>
               <p>When you have {activeTab}, they will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
