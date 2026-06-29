import { useEffect, useRef, useState } from "react";
import { Heart, Loader2, Plus, X, Upload, MessageCircle, AlertTriangle, Shield, Send, Bookmark, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAddComment } from "@/hooks/useComments";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface ReelComment {
  id: string;
  content: string;
  is_hidden: boolean;
  hidden_reason: string | null;
  created_at: string;
  profiles: { username: string; avatar_url: string | null } | null;
}

interface Reel {
  id: string;
  profile_id: string;
  media_url: string;
  media_type: string;
  caption: string | null;
  created_at: string;
  profiles: { username: string; display_name: string; avatar_url: string | null };
  reel_likes: { count: number }[];
  comments: ReelComment[];
}

const DYNAMIC_FALLBACK_REELS = [
  { url: 'https://cdn.coverr.co/videos/coverr-girl-holding-leaves-5607/1080p.mp4', caption: 'Holding autumn leaves 🍁' },
  { url: 'https://cdn.coverr.co/videos/coverr-premium-woman-thoughtfully-looks-at-the-camera-8694/1080p.mp4', caption: 'Contemplation and focus 💭' },
  { url: 'https://cdn.coverr.co/videos/coverr-girl-running-in-a-forest-3856/1080p.mp4', caption: 'Forest runner 🏃‍♀️🌲' },
  { url: 'https://cdn.coverr.co/videos/coverr-a-black-dog-playing-with-a-dry-leaf-8632/1080p.mp4', caption: 'Playful pup 🐶🍂' },
  { url: 'https://cdn.coverr.co/videos/coverr-premium-woman-posing-in-tall-grass-3985/1080p.mp4', caption: 'Standing in tall grass 🌾' },
  { url: 'https://cdn.coverr.co/videos/coverr-walking-the-dogs-in-nature-4989/1080p.mp4', caption: 'Nature walk with dogs 🐕' },
  { url: 'https://cdn.coverr.co/videos/coverr-walking-the-dogs-8369/1080p.mp4', caption: 'Daily dog walking routine 🐾' },
  { url: 'https://cdn.coverr.co/videos/coverr-woman-trains-in-the-park-9181/1080p.mp4', caption: 'Outdoor workout session 💪' },
  { url: 'https://cdn.coverr.co/videos/coverr-girl-throwing-leaves-in-the-air-4187/1080p.mp4', caption: 'Throwing leaves in autumn 🍂✨' },
  { url: 'https://cdn.coverr.co/videos/coverr-petting-the-dogs-8603/1080p.mp4', caption: 'Puppy love and pets ❤️' },
  { url: 'https://cdn.coverr.co/videos/coverr-premium-scenic-selfie-session-overlook/1080p.mp4', caption: 'Beautiful scenic overlook 🏔️' },
  { url: 'https://cdn.coverr.co/videos/coverr-the-lake-on-a-sunny-day-3051/1080p.mp4', caption: 'Sunny day by the lake ☀️🌊' },
  { url: 'https://cdn.coverr.co/videos/coverr-scenic-overlook-pit-stop/1080p.mp4', caption: 'Quick pit stop on the road 🚗' },
  { url: 'https://cdn.coverr.co/videos/coverr-girl-posing-in-a-forest-3510/1080p.mp4', caption: 'Forest portrait session 🌲' },
  { url: 'https://cdn.coverr.co/videos/coverr-premium-nature-enthusiast-exploring-woods/1080p.mp4', caption: 'Exploring deep in the woods 🗺️' },
  { url: 'https://cdn.coverr.co/videos/coverr-girl-looking-at-the-camera-4641/1080p.mp4', caption: 'A thoughtful look 👀' },
  { url: 'https://cdn.coverr.co/videos/coverr-leaves-falling-on-a-girl-1983/1080p.mp4', caption: 'Fallen leaves shower 🍁' },
  { url: 'https://cdn.coverr.co/videos/coverr-girls-collecting-fallen-leaves-3761/1080p.mp4', caption: 'Collecting autumn leaves 🍂' },
  { url: 'https://cdn.coverr.co/videos/coverr-woman-walking-along-the-meadow-3981/1080p.mp4', caption: 'Walking through meadows 🌾' },
  { url: 'https://cdn.coverr.co/videos/user-ai-generation-yzz3afL7dZHy/1080p.mp4', caption: 'AI generated dreamscape 🌌' },
  { url: 'https://cdn.coverr.co/videos/coverr-exploring-nature-with-binoculars/1080p.mp4', caption: 'Nature exploration with binoculars 🔭' },
  { url: 'https://cdn.coverr.co/videos/coverr-premium-running-in-the-forest-9481/1080p.mp4', caption: 'Running through forest trails 🏃‍♂️' },
  { url: 'https://cdn.coverr.co/videos/coverr-young-maple-trees-with-yellow-leaves-surround-a-road-6252/1080p.mp4', caption: 'Maple trees along the road 🍁' },
  { url: 'https://cdn.coverr.co/videos/coverr-beautiful-scenery-of-an-autumn-forest-4217/1080p.mp4', caption: 'Beautiful autumn forest scenery 🌲' },
  { url: 'https://cdn.coverr.co/videos/coverr-snow-in-a-winter-wonderland-2549/1080p.mp4', caption: 'Snowy winter wonderland ❄️' },
  { url: 'https://cdn.coverr.co/videos/coverr-temp-6ib4gen-2-1794977361-m-8-mp4-2364/1080p.mp4', caption: 'Cinematic nature clips 🎞️' },
  { url: 'https://cdn.coverr.co/videos/coverr-beautiful-forest-in-autumn-5508/1080p.mp4', caption: 'Foliage and forest colors 🍂' },
  { url: 'https://cdn.coverr.co/videos/coverr-holding-hands-and-running-4044/1080p.mp4', caption: 'Holding hands and running free 👫' },
  { url: 'https://cdn.coverr.co/videos/coverr-premium-woman-runs-through-a-forest-8691/1080p.mp4', caption: 'Fast paced forest run 🏃‍♀️' },
  { url: 'https://cdn.coverr.co/videos/coverr-guy-turns-on-a-shower-in-his-garden-6909/1080p.mp4', caption: 'Outdoor garden shower 🚿' },
  { url: 'https://cdn.coverr.co/videos/coverr-premium-woman-posing-in-the-glade-2546/1080p.mp4', caption: 'Posing in the glade 🍃' },
  { url: 'https://cdn.coverr.co/videos/coverr-woman-jogging-2195/1080p.mp4', caption: 'Morning jog vibes 🏃‍♀️🌅' },
  { url: 'https://cdn.coverr.co/videos/coverr-sunset-through-the-plants-8722/1080p.mp4', caption: 'Golden sunset through plants 🌅🌿' },
  { url: 'https://cdn.coverr.co/videos/coverr-close-up-of-a-couple-holding-hands-4133/1080p.mp4', caption: 'Close-up holding hands ❤️' },
  { url: 'https://cdn.coverr.co/videos/coverr-candolim-beach-7824/1080p.mp4', caption: 'Sunny day at Candolim Beach 🏖️' },
  { url: 'https://cdn.coverr.co/videos/coverr-sun-reflecting-through-a-bamboo-roof-7824/1080p.mp4', caption: 'Sunrays through bamboo roof 🎋' },
  { url: 'https://cdn.coverr.co/videos/coverr-temp-tsbkajeepdriving202505221647-mp4-3844/1080p.mp4', caption: 'Jeep driving adventure 🚙' },
  { url: 'https://cdn.coverr.co/videos/coverr-premium-woman-looking-up-at-the-trees-755/1080p.mp4', caption: 'Looking up at tall green trees 🌳' },
  { url: 'https://cdn.coverr.co/videos/coverr-premium-woman-lifting-her-hand-up-1390/1080p.mp4', caption: 'Sunlight on my face ☀️' },
  { url: 'https://cdn.coverr.co/videos/coverr-premium-walking-down-the-street-with-cowboy-boots-on-5863/1080p.mp4', caption: 'Walking in cowboy boots 👢' },
  { url: 'https://cdn.coverr.co/videos/coverr-premium-woman-lifting-her-hand-up-6198/1080p.mp4', caption: 'Reaching for the sky ☁️' },
  { url: 'https://cdn.coverr.co/videos/coverr-premium-woman-relaxing-outdoors-5601/1080p.mp4', caption: 'Relaxing in the summer breeze 🍃' },
  { url: 'https://cdn.coverr.co/videos/coverr-a-view-of-nature-4414/1080p.mp4', caption: 'Stunning view of the landscape 🏞️' },
  { url: 'https://cdn.coverr.co/videos/coverr-premium-walking-in-a-field-with-cowboy-boots-2378/1080p.mp4', caption: 'Country road walking 🌾' },
  { url: 'https://cdn.coverr.co/videos/coverr-premium-woman-posing-in-the-wind-5952/1080p.mp4', caption: 'Wind in my hair 💨' },
  { url: 'https://cdn.coverr.co/videos/coverr-premium-woman-running-and-looking-behind-her-5939/1080p.mp4', caption: 'Running and looking back 跑🏃‍♀️' },
  { url: 'https://cdn.coverr.co/videos/coverr-premium-woman-covering-her-face-from-the-sun-8412/1080p.mp4', caption: 'Shading from the bright sun 🕶️' },
  { url: 'https://cdn.coverr.co/videos/coverr-cows-in-a-field-7235/1080p.mp4', caption: 'Cows in the green pasture 🐄' },
  { url: 'https://cdn.coverr.co/videos/coverr-premium-woman-posing-in-the-forest-2997/1080p.mp4', caption: 'Deep in the quiet forest 🌲' },
  { url: 'https://cdn.coverr.co/videos/coverr-premium-woman-posing-on-a-field-7703/1080p.mp4', caption: 'Posing on the open field 🌾' }
];

const SEED_USERS = [
  { username: "sarah_designs", display_name: "Sarah Chen", avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop" },
  { username: "alex_captures", display_name: "Alex Rivera", avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop" },
  { username: "foodie_emma", display_name: "Emma Wilson", avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop" },
  { username: "tech_raj", display_name: "Raj Patel", avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop" },
  { username: "maya_art", display_name: "Maya Johnson", avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop" }
];

const Reels = () => {
  const { user } = useAuth();
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const fetchReels = async (isInitial = true) => {
    if (isInitial) setLoading(true);
    const { data } = await supabase
      .from("reels")
      .select("*, profiles(*), reel_likes(count), comments(*, profiles(*))")
      .order("created_at", { ascending: false });
    
    // Filter out known broken 0-byte uploaded video
    const dbReels = (data as any || []).filter((r: any) => 
      r.media_url && !r.media_url.includes("1779698604139.mp4")
    );

    // Track URLs already loaded from DB to prevent duplicates
    const loadedUrls = new Set(dbReels.map((r: any) => r.media_url));

    const finalReels = [...dbReels];

    // Guarantee at least 50 unique reels by dynamically filling from fallback pool
    let fallbackIndex = 0;
    while (finalReels.length < 50 && fallbackIndex < DYNAMIC_FALLBACK_REELS.length) {
      const fallback = DYNAMIC_FALLBACK_REELS[fallbackIndex];
      if (!loadedUrls.has(fallback.url)) {
        const userProfile = SEED_USERS[fallbackIndex % SEED_USERS.length];
        
        finalReels.push({
          id: `fallback-reel-${fallbackIndex}`,
          profile_id: `fallback-user-${fallbackIndex % SEED_USERS.length}`,
          media_url: fallback.url,
          media_type: 'video',
          caption: fallback.caption,
          created_at: new Date(Date.now() - fallbackIndex * 3600000).toISOString(),
          profiles: {
            username: userProfile.username,
            display_name: userProfile.display_name,
            avatar_url: userProfile.avatar_url
          },
          reel_likes: [{ count: Math.floor(Math.random() * 150) + 12 }],
          comments: []
        });
        loadedUrls.add(fallback.url);
      }
      fallbackIndex++;
    }

    setReels(finalReels);
    if (user) {
      const { data: likes } = await supabase.from("reel_likes").select("reel_id").eq("profile_id", user.id);
      setLikedIds(new Set((likes || []).map((l: any) => l.reel_id)));
    }
    if (isInitial) setLoading(false);
  };

  useEffect(() => { fetchReels(true); }, [user]);

  useEffect(() => {
    const channel = supabase
      .channel("reel-comments-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "comments" }, () => fetchReels(false))
      .on("postgres_changes", { event: "*", schema: "public", table: "reel_likes" }, () => fetchReels(false))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const toggleLike = async (reelId: string) => {
    if (!user) { toast.error("Sign in to like"); return; }
    const liked = likedIds.has(reelId);
    const next = new Set(likedIds);
    if (liked) {
      next.delete(reelId);
      await supabase.from("reel_likes").delete().eq("reel_id", reelId).eq("profile_id", user.id);
    } else {
      next.add(reelId);
      await supabase.from("reel_likes").insert({ reel_id: reelId, profile_id: user.id });
    }
    setLikedIds(next);
    fetchReels();
  };

  return (
    <div className="h-screen w-full flex justify-center bg-background">
      <div className="relative h-full w-full max-w-[450px] sm:py-4">
        {user && (
          <div className="absolute top-6 right-4 z-50">
             <CreateReelDialog onCreated={fetchReels} />
          </div>
        )}
        <div className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar sm:rounded-xl sm:border border-border bg-black">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          ) : reels.length === 0 ? (
            <div className="h-full flex items-center justify-center text-white/50">
              No reels yet. Be the first!
            </div>
          ) : (
            reels.map((reel) => (
              <div key={reel.id} className="h-full w-full snap-start relative">
                <ReelItem
                  reel={reel}
                  liked={likedIds.has(reel.id)}
                  onLike={() => toggleLike(reel.id)}
                  currentUserId={user?.id}
                  onCommentAdded={() => fetchReels(false)}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

function ReelItem({ reel, liked, onLike, currentUserId, onCommentAdded }: {
  reel: Reel; liked: boolean; onLike: () => void; currentUserId?: string; onCommentAdded?: () => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const addComment = useAddComment();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (videoRef.current) {
            videoRef.current.play().catch(console.error);
            setIsPlaying(true);
          }
        } else {
          if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        }
      },
      { threshold: 0.6 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [reel.media_type]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment.mutate(
      { reelId: reel.id, content: commentText.trim() },
      { 
        onSuccess: () => {
          setCommentText("");
          if (onCommentAdded) {
            onCommentAdded();
          }
        }
      }
    );
  };

  const FALLBACK_VIDEOS = [
    "https://res.cloudinary.com/demo/video/upload/dog.mp4",
    "https://res.cloudinary.com/demo/video/upload/elephants.mp4",
    "https://res.cloudinary.com/demo/video/upload/sea_turtle.mp4",
    "https://media.w3.org/2010/05/sintel/trailer.mp4",
    "https://vjs.zencdn.net/v/oceans.mp4",
    "https://www.w3schools.com/html/mov_bbb.mp4"
  ];

  const fallbackIndex = reel.id.charCodeAt(0) % FALLBACK_VIDEOS.length;
  const safeMediaUrl = reel.media_url.includes("commondatastorage.googleapis.com") 
    ? FALLBACK_VIDEOS[fallbackIndex] 
    : reel.media_url;

  return (
    <div ref={containerRef} className="h-full w-full relative bg-black group overflow-hidden">
      {/* Video/Image Content */}
      <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={togglePlay}>
        {reel.media_type === "video" ? (
          <>
            {isVideoLoading && !hasError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                <Loader2 className="h-8 w-8 animate-spin text-white/50" />
              </div>
            )}
            {hasError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10 text-destructive">
                <AlertTriangle className="h-8 w-8 mb-2" />
                <span className="text-sm font-semibold">Video unavailable</span>
              </div>
            )}
            <video
              ref={videoRef}
              src={safeMediaUrl}
              loop
              muted // Muted by default to allow autoplay
              playsInline
              preload="auto"
              onCanPlay={() => setIsVideoLoading(false)}
              onLoadedData={() => setIsVideoLoading(false)}
              onPlaying={() => setIsVideoLoading(false)}
              onError={() => { setIsVideoLoading(false); setHasError(true); }}
              className={`w-full h-full object-cover transition-opacity duration-500 ${isVideoLoading ? "opacity-0" : "opacity-100"}`}
            />
          </>
        ) : (
          <img src={safeMediaUrl} alt={reel.caption || ""} className="w-full h-full object-cover" />
        )}
      </div>

      {/* Overlay Gradient for Text Readability */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

      {/* Right Side Actions Overlay */}
      <div className="absolute right-4 bottom-20 flex flex-col items-center gap-6 z-10">
        <button onClick={onLike} className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity">
          <div className="p-2 bg-black/20 rounded-full backdrop-blur-sm">
            <Heart className={`h-7 w-7 ${liked ? "fill-red-500 text-red-500" : "text-white"}`} />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-md">{reel.reel_likes?.[0]?.count || 0}</span>
        </button>

        <button onClick={() => setShowComments(true)} className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity">
          <div className="p-2 bg-black/20 rounded-full backdrop-blur-sm">
            <MessageCircle className="h-7 w-7 text-white" />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-md">{(reel.comments || []).length}</span>
        </button>

        <button className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity" onClick={() => toast("Share feature coming soon!")}>
          <div className="p-2 bg-black/20 rounded-full backdrop-blur-sm">
            <Send className="h-7 w-7 text-white -rotate-12" />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-md">Share</span>
        </button>

        <button className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity">
          <div className="p-2 bg-black/20 rounded-full backdrop-blur-sm">
            <MoreHorizontal className="h-7 w-7 text-white" />
          </div>
        </button>
        
        <div className="mt-4 w-8 h-8 rounded-md border-2 border-white overflow-hidden bg-muted">
           <img src={reel.profiles?.avatar_url || "/placeholder.svg"} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Bottom Info Overlay */}
      <div className="absolute bottom-4 left-4 right-20 z-10">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-9 w-9 ring-2 ring-white/50 cursor-pointer">
            <AvatarImage src={reel.profiles?.avatar_url || ""} />
            <AvatarFallback>{reel.profiles?.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-sm drop-shadow-md hover:underline cursor-pointer">
              {reel.profiles?.username}
            </span>
            <span className="text-white/80 text-xs font-semibold px-2 py-0.5 rounded border border-white/50 hover:bg-white/20 transition-colors cursor-pointer">
              Follow
            </span>
          </div>
        </div>
        
        {reel.caption && (
          <p className="text-white text-sm drop-shadow-md line-clamp-2 pr-4">
            {reel.caption}
          </p>
        )}
      </div>
      
      {/* Comments Overlay */}
      <div 
        className={`absolute inset-x-0 bottom-0 bg-background z-50 rounded-t-xl flex flex-col shadow-2xl border-t border-border transition-all duration-300 ease-in-out ${
          showComments ? "h-[60%] translate-y-0" : "h-[60%] translate-y-full"
        }`}
      >
        <div className="p-3 border-b border-border flex items-center justify-between shrink-0 relative bg-background rounded-t-xl">
          <h3 className="text-sm font-semibold mx-auto">Comments</h3>
          <button onClick={() => setShowComments(false)} className="absolute right-4 p-1.5 hover:bg-muted rounded-full transition-colors">
             <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
          {(reel.comments || []).length === 0 ? (
             <div className="text-center text-muted-foreground mt-10">No comments yet.</div>
          ) : (
             [...(reel.comments || [])]
             .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
             .map(c => {
               if (c.is_hidden) {
                 return (
                   <div key={c.id} className="border-2 border-destructive rounded-lg bg-destructive/10 p-3 space-y-1.5 mt-2">
                     <div className="flex items-center gap-2">
                       <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                       <span className="text-xs font-bold text-destructive uppercase tracking-wide">
                         Flagged by AI
                       </span>
                     </div>
                     <div className="flex gap-2 text-sm">
                       <Avatar className="h-6 w-6 mt-0.5 shrink-0">
                         <AvatarImage src={c.profiles?.avatar_url || ""} />
                         <AvatarFallback>{c.profiles?.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                       </Avatar>
                       <div className="min-w-0">
                         <p>
                           <span className="font-semibold mr-1.5 text-destructive">{c.profiles?.username}</span>
                           <span className="italic text-destructive/70 line-through">{c.content}</span>
                         </p>
                         {c.hidden_reason && (
                           <div className="mt-1">
                             <span className="bg-destructive text-destructive-foreground text-[10px] px-2 py-0.5 rounded font-semibold">
                               {c.hidden_reason}
                             </span>
                           </div>
                         )}
                         <p className="text-xs text-destructive/50 mt-1">
                           {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                         </p>
                       </div>
                     </div>
                   </div>
                 );
               }
               
               return (
                 <div key={c.id} className="flex gap-3 text-sm mt-2">
                   <Avatar className="h-8 w-8 shrink-0">
                     <AvatarImage src={c.profiles?.avatar_url || ""} />
                     <AvatarFallback>{c.profiles?.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                   </Avatar>
                   <div>
                     <p>
                       <span className="font-semibold mr-2">{c.profiles?.username}</span>
                       {c.content}
                     </p>
                     <p className="text-xs text-muted-foreground mt-1">
                       {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                     </p>
                   </div>
                 </div>
               );
             })
          )}
        </div>
        <div className="p-3 border-t border-border shrink-0 bg-background">
          <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <Input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 rounded-full bg-muted/50 border-transparent h-9 px-4 text-sm focus-visible:ring-1 focus-visible:ring-primary"
            />
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              disabled={!commentText.trim() || addComment.isPending}
              className="text-primary font-semibold text-sm hover:bg-transparent"
            >
              {addComment.isPending ? "..." : "Post"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function CreateReelDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const isVideo = f.type.startsWith("video/") || f.name.match(/\.(mp4|webm|ogg|mov)$/i);
    const isImage = f.type.startsWith("image/") || f.name.match(/\.(jpeg|jpg|gif|png|webp)$/i);
    if (!isVideo && !isImage) {
      toast.error("Pick a video or image"); return;
    }
    if (f.size > 50 * 1024 * 1024) { toast.error("Max 50MB"); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const isVideo = file.type.startsWith("video/") || file.name.match(/\.(mp4|webm|ogg|mov)$/i);
      const media_type = isVideo ? "video" : "image";
      
      const { error: upErr } = await supabase.storage.from("reels").upload(path, file, {
        contentType: file.type || (isVideo ? "video/mp4" : "image/jpeg"),
        cacheControl: "3600",
        upsert: false
      });
      if (upErr) throw upErr;
      const url = supabase.storage.from("reels").getPublicUrl(path).data.publicUrl;
      const { error } = await supabase.from("reels").insert({
        profile_id: user.id, media_url: url, media_type, caption: caption.trim() || null,
      });
      if (error) throw error;
      toast.success("Reel posted!");
      setOpen(false); setFile(null); setPreview(null); setCaption("");
      onCreated();
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally { setUploading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md">
          <Plus className="h-4 w-4 mr-1" /> Create Reel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Create Reel</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <input ref={fileRef} type="file" accept="video/*,image/*" onChange={onPick} className="hidden" />
          {preview ? (
            <div className="relative rounded-lg overflow-hidden bg-black aspect-[9/16] max-h-[50vh] mx-auto w-auto flex justify-center">
              {(file?.type.startsWith("video/") || file?.name.match(/\.(mp4|webm|ogg|mov)$/i)) ? (
                <video src={preview} controls className="max-w-full h-full object-contain" />
              ) : (
                <img src={preview} className="max-w-full h-full object-contain" alt="" />
              )}
              <button onClick={() => { setFile(null); setPreview(null); if (fileRef.current) fileRef.current.value=""; }}
                className="absolute top-2 right-2 bg-background/80 rounded-full p-1.5"><X className="h-4 w-4" /></button>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()}
              className="w-full max-w-[250px] mx-auto aspect-[9/16] rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Upload className="h-10 w-10" />
              <span className="text-sm text-center px-4">Click to upload video or image</span>
            </button>
          )}
          <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Write a caption..." className="bg-muted/50 resize-none" rows={2} maxLength={300} />
          <Button onClick={submit} disabled={!file || uploading} className="w-full gradient-bg text-primary-foreground">
            {uploading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Uploading...</> : "Share Reel"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default Reels;
