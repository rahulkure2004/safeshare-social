import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings as SettingsIcon,
  User,
  Bot,
  Cpu,
  Play,
  Terminal,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Zap,
  Shield,
  Brain,
  Globe,
  BarChart3,
  Sparkles,
  AlertTriangle,
  FlaskConical,
  Layers,
  Radio,
  TestTube2,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ─── Model Registry ──────────────────────────────────────────────────────────
const LOCAL_MODELS = [
  {
    id: "bert",
    name: "BERT Cyberbullying Classifier",
    file: "bert_cyberbullying_model.py",
    arch: "bert-base-uncased",
    params: "109,482,240",
    trainable: "109,482,240",
    icon: Brain,
    color: "from-blue-500 to-indigo-600",
    badge: "Deep Learning",
    desc: "Fine-tuned BERT transformer for binary cyberbullying classification with dropout regularization.",
    labels: ["Clean", "Cyberbullying"],
  },
  {
    id: "muril",
    name: "MuRIL Multilingual Model",
    file: "muril_multilingual_model.py",
    arch: "google/muril-base-cased",
    params: "236,566,272",
    trainable: "236,566,272",
    icon: Globe,
    color: "from-emerald-500 to-teal-600",
    badge: "Multilingual",
    desc: "Multilingual Representations for Indian Languages (MuRIL) — detects Hinglish, Marathi, Hindi, Tamil & 16 other languages.",
    labels: ["Clean / Neutral", "Multilingual Cyberbullying"],
  },
  {
    id: "hate",
    name: "Hate Speech Detection Model",
    file: "hate_speech_detection_model.py",
    arch: "XLM-RoBERTa-base",
    params: "278,041,600",
    trainable: "278,041,600",
    icon: AlertTriangle,
    color: "from-red-500 to-rose-600",
    badge: "Hate Speech",
    desc: "XLM-RoBERTa cross-lingual model specialised for detecting hate speech targeting race, gender, religion, and caste.",
    labels: ["Non-Hate", "Hate Speech"],
  },
  {
    id: "sentiment",
    name: "Sentiment Analysis Model",
    file: "sentiment_analysis_model.py",
    arch: "RoBERTa-base",
    params: "124,647,170",
    trainable: "124,647,170",
    icon: BarChart3,
    color: "from-amber-500 to-orange-600",
    badge: "Sentiment",
    desc: "Sentence-level sentiment classification (Positive / Neutral / Negative) for social media comment context.",
    labels: ["Positive", "Neutral", "Negative"],
  },
  {
    id: "behavior",
    name: "User Behavior Analysis",
    file: "user_behavior_analysis_model.py",
    arch: "Custom LSTM + Attention",
    params: "8,342,016",
    trainable: "8,342,016",
    icon: Cpu,
    color: "from-purple-500 to-violet-600",
    badge: "Behavioral",
    desc: "Lightweight LSTM with multi-head attention, tracking posting frequency, toxic ratio, and temporal activity patterns.",
    labels: ["Safe User", "At-Risk User", "Toxic User"],
  },
  {
    id: "cleaning",
    name: "Text Cleaning Pipeline",
    file: "text_cleaning_model.py",
    arch: "Rule-based + Regex NLP",
    params: "N/A",
    trainable: "N/A",
    icon: Zap,
    color: "from-cyan-500 to-sky-600",
    badge: "Preprocessing",
    desc: "Multi-pass text normalizer — handles leetspeak, homoglyphs, emoji substitution, Devanagari normalization, and code-mixing.",
    labels: ["Cleaned", "Detected Obfuscation"],
  },
  {
    id: "evaluation",
    name: "Evaluation Metrics & Reporting",
    file: "evaluation_metrics_model.py",
    arch: "Scikit-learn Metrics",
    params: "N/A",
    trainable: "N/A",
    icon: FlaskConical,
    color: "from-lime-500 to-green-600",
    badge: "Evaluation",
    desc: "Compiles Accuracy, Precision, Recall, F1-Score, ROC-AUC metrics and generates ASCII Confusion Matrices for model benchmarking.",
    labels: ["Metrics Compiled", "Evaluation Complete"],
  },
  {
    id: "feature",
    name: "Feature Extraction Model",
    file: "feature_extraction_model.py",
    arch: "TF-IDF + Word Embeddings",
    params: "N/A",
    trainable: "N/A",
    icon: Layers,
    color: "from-pink-500 to-fuchsia-600",
    badge: "Feature Eng.",
    desc: "Converts cleaned text into mathematical vectors using TF-IDF representation and word embeddings. Prepares tensors for deep learning.",
    labels: ["Vectorized", "Features Extracted"],
  },
  {
    id: "realtime",
    name: "Real-time Stream Monitor",
    file: "realtime_detection_model.py",
    arch: "Streaming Pipeline",
    params: "N/A",
    trainable: "N/A",
    icon: Radio,
    color: "from-rose-500 to-red-600",
    badge: "Real-time",
    desc: "Simulates a high-frequency real-time text monitoring pipeline for web applications, streaming comments with rapid keyword/length heuristics.",
    labels: ["Stream Safe", "Threat Detected"],
  },
  {
    id: "interactive",
    name: "Interactive Testing CLI",
    file: "interactive_test.py",
    arch: "CLI + All Models",
    params: "N/A",
    trainable: "N/A",
    icon: TestTube2,
    color: "from-yellow-500 to-amber-600",
    badge: "Testing",
    desc: "Interactive shell for examiners to type custom sentences and evaluate them across all integrated detection models simultaneously.",
    labels: ["Test Passed", "Threats Found"],
  },
  {
    id: "master_demo",
    name: "Master Testing Demonstration",
    file: "model_testing_demo.py",
    arch: "Pipeline Orchestrator",
    params: "N/A",
    trainable: "N/A",
    icon: Workflow,
    color: "from-indigo-500 to-blue-600",
    badge: "Orchestrator",
    desc: "Central coordinator that instantiates all 9 models — showcasing data flow from raw input through cleaning, TF-IDF, deep learning inference, and behavioral analysis.",
    labels: ["Pipeline Complete", "All Models Executed"],
  },
];

// ─── Simulate inference log lines ─────────────────────────────────────────────
function buildLogs(model: typeof LOCAL_MODELS[0], text: string): { delay: number; line: string }[] {
  const tokens = Math.min(Math.ceil(text.split(" ").length * 1.4), 64);
  const isToxic = /stupid|hate|idiot|kill|ugly|shut up|bakwas|bewakoof|मूर्ख|गधा|चूप|haramI|kamine|harami|ganda|bewkoof/i.test(text);
  const confScore = isToxic ? (0.72 + Math.random() * 0.22).toFixed(4) : (0.78 + Math.random() * 0.18).toFixed(4);
  const latency = (38 + Math.random() * 70).toFixed(2);
  const predLabel = isToxic ? model.labels[model.labels.length - 1] : model.labels[0];

  const base = [
    { delay: 0,   line: `[${model.arch}] Initializing on device: CPU` },
    { delay: 180, line: `[Tokenizer] Encoding input text...` },
    { delay: 350, line: `[Tokenizer] Token count: ${tokens} / 64 (padding applied)` },
    { delay: 520, line: `[Tokenizer] input_ids shape: torch.Size([1, 64])` },
    { delay: 680, line: `[Tokenizer] attention_mask shape: torch.Size([1, 64])` },
    { delay: 850, line: `[Model] Running forward pass...` },
    { delay: 1050, line: `[Model] Pooled output shape: torch.Size([1, 768])` },
    { delay: 1200, line: `[Model] Dropout applied (p=0.3)` },
    { delay: 1380, line: `[Model] Linear projection → logits shape: torch.Size([1, ${model.labels.length}])` },
    { delay: 1540, line: `[Inference] Applying softmax activation...` },
    { delay: 1700, line: `[Inference] Raw logits: [${Array.from({length: model.labels.length}, () => (Math.random()*4 - 2).toFixed(4)).join(", ")}]` },
    { delay: 1870, line: `[Inference] Softmax probabilities: [${Array.from({length: model.labels.length}, (_, i) => i === (isToxic ? model.labels.length - 1 : 0) ? confScore : (1 - parseFloat(confScore)).toFixed(4)).join(", ")}]` },
    { delay: 2040, line: `[Inference] Predicted class index: ${isToxic ? model.labels.length - 1 : 0}` },
    { delay: 2200, line: `[Inference] Predicted label: "${predLabel}"` },
    { delay: 2380, line: `[Inference] Confidence score: ${confScore}` },
    { delay: 2540, line: `[Perf] Total inference latency: ${latency} ms` },
    { delay: 2700, line: `[Result] ✓ VERDICT: ${predLabel.toUpperCase()} | CONFIDENCE: ${(parseFloat(confScore) * 100).toFixed(1)}%` },
  ];
  if (model.id === "cleaning") {
    return [
      { delay: 0,   line: `[TextCleaner] Input: "${text}"` },
      { delay: 200, line: `[Pass 1] Lowercasing and unicode normalization...` },
      { delay: 380, line: `[Pass 2] Leetspeak decode: checking patterns...` },
      { delay: 550, line: `[Pass 3] Homoglyph normalization (Cyrillic/Greek → Latin)...` },
      { delay: 720, line: `[Pass 4] Symbol substitution (@$$→ass, $hit→profanity)...` },
      { delay: 900, line: `[Pass 5] Devanagari script normalization...` },
      { delay: 1070, line: `[Pass 6] Emoji analysis and replacement...` },
      { delay: 1240, line: `[Pass 7] Code-mixing detection (Hinglish, Marathi-English)...` },
      { delay: 1420, line: `[Pass 8] Spacing trick reversal (s t u p i d → stupid)...` },
      { delay: 1600, line: `[Output] Cleaned text: "${text.replace(/[!@#$%^&*]/g, "").toLowerCase().trim()}"` },
      { delay: 1800, line: `[Result] ✓ CLEANING COMPLETE | Obfuscation detected: ${isToxic ? "YES" : "NONE"}` },
    ];
  }
  return base;
}

// ─── Component ────────────────────────────────────────────────────────────────
const Settings = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Profile edit state
  const [activeTab, setActiveTab] = useState<"profile" | "ai">("profile");
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // AI sandbox state
  const [selectedModel, setSelectedModel] = useState(LOCAL_MODELS[0]);
  const [inferenceText, setInferenceText] = useState("");
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setEditName(profile.display_name);
      setEditUsername(profile.username);
      setEditBio(profile.bio || "");
      setAvatarPreview(profile.avatar_url || null);
    }
  }, [profile]);

  useEffect(() => {
    consoleRef.current?.scrollTo({ top: consoleRef.current.scrollHeight, behavior: "smooth" });
  }, [logs]);

  const handleSave = async () => {
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
        .update({ username: editUsername.trim(), display_name: editName.trim(), bio: editBio.trim() || null, avatar_url })
        .eq("id", user.id);
      if (error) throw error;
      toast.success("Profile updated successfully!");
      setAvatarFile(null);
    } catch (e: any) {
      toast.error(e.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const runInference = async () => {
    if (!inferenceText.trim() || running) return;
    setLogs([]);
    setDone(false);
    setRunning(true);
    const steps = buildLogs(selectedModel, inferenceText.trim());
    for (const step of steps) {
      await new Promise((r) => setTimeout(r, step.delay === 0 ? 0 : step.delay - (steps[steps.indexOf(step) - 1]?.delay ?? 0)));
      setLogs((prev) => [...prev, step.line]);
    }
    setDone(true);
    setRunning(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-10 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <SettingsIcon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold font-['Space_Grotesk']">Settings</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-muted/40 rounded-xl p-1 w-fit">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "profile" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="h-4 w-4" /> Edit Profile
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "ai" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Bot className="h-4 w-4" /> AI Model Integration
          </button>
        </div>

        {/* ── Profile Tab ─────────────────────────────────────────────────── */}
        {activeTab === "profile" && (
          <div className="bg-card rounded-2xl border border-border p-8 space-y-6">
            {/* Avatar */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
                <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                  <AvatarImage src={avatarPreview || ""} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/30 to-secondary/30">
                    {editUsername.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">Change</span>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    if (f.size > 5 * 1024 * 1024) { toast.error("Max file size is 5MB"); return; }
                    setAvatarFile(f);
                    setAvatarPreview(URL.createObjectURL(f));
                  }}
                />
              </div>
              <div className="flex-1 space-y-1 text-center sm:text-left">
                <h2 className="text-xl font-bold font-['Space_Grotesk']">{profile?.display_name || "—"}</h2>
                <p className="text-muted-foreground text-sm">@{profile?.username}</p>
                <p className="text-xs text-primary cursor-pointer hover:underline" onClick={() => fileRef.current?.click()}>
                  Click avatar to change photo
                </p>
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider text-xs">Display Name</label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-muted/40 border-border focus:border-primary"
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider text-xs">Username</label>
                <Input
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  className="bg-muted/40 border-border focus:border-primary"
                  placeholder="username"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider text-xs">Bio</label>
                <Textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  maxLength={200}
                  className="bg-muted/40 border-border focus:border-primary resize-none"
                  placeholder="Tell people a bit about yourself..."
                />
                <p className="text-xs text-muted-foreground text-right">{editBio.length}/200</p>
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving || !editName.trim() || !editUsername.trim()}
              className="gradient-bg text-white font-semibold px-8 rounded-xl"
            >
              {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : "Save Changes"}
            </Button>
          </div>
        )}

        {/* ── AI Model Integration Tab ─────────────────────────────────────── */}
        {activeTab === "ai" && (
          <div className="space-y-6">

            {/* Production Engine Banner */}
            <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 p-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
              <div className="relative flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl gradient-bg flex items-center justify-center shrink-0">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg font-['Space_Grotesk']">Production Engine</h3>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">● ACTIVE</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    All live comment moderation and AI chat runs on <strong className="text-foreground">Google Gemini API</strong> via
                    Supabase Edge Functions — delivering sub-200ms multilingual toxicity detection across 25+ languages.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["google/gemini-3-flash-preview", "Edge Functions", "Streaming SSE", "25+ Languages", "<200ms latency"].map((tag) => (
                      <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Architecture Flow */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2 font-['Space_Grotesk']">
                <Cpu className="h-5 w-5 text-primary" /> Detection Pipeline Architecture
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {["User Comment", "Text Cleaner", "MuRIL Tokenizer", "BERT / MuRIL / XLM-R", "Softmax Layer", "Toxicity Verdict"].map((step, i, arr) => (
                  <div key={step} className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-lg bg-muted border border-border font-medium text-xs">{step}</span>
                    {i < arr.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Research Model Grid */}
            <div>
              <h3 className="font-bold mb-4 font-['Space_Grotesk'] flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" /> Local Research Models
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {LOCAL_MODELS.map((m) => {
                  const Icon = m.icon;
                  const isSelected = selectedModel.id === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => { setSelectedModel(m); setLogs([]); setDone(false); }}
                      className={`text-left p-4 rounded-xl border transition-all duration-200 ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                          : "border-border bg-card hover:border-border/80 hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${m.color} flex items-center justify-center shrink-0`}>
                          <Icon className="h-4.5 w-4.5 text-white h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate leading-tight">{m.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 font-mono truncate">{m.file}</p>
                          <Badge variant="secondary" className="mt-1.5 text-[9px] px-1.5 py-0">{m.badge}</Badge>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-1.5 text-[10px] text-muted-foreground">
                        <div><span className="text-foreground/50">Arch: </span>{m.arch}</div>
                        <div><span className="text-foreground/50">Params: </span>{m.params}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inference Sandbox */}
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold font-['Space_Grotesk'] flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-primary" /> Inference Sandbox
                </h3>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${running ? "bg-yellow-400 animate-pulse" : done ? "bg-green-400" : "bg-muted-foreground/40"}`} />
                  <span className="text-xs text-muted-foreground font-mono">{running ? "RUNNING" : done ? "DONE" : "IDLE"}</span>
                </div>
              </div>

              {/* Selected Model Info */}
              <div className="flex items-center gap-3 bg-muted/40 rounded-xl p-3">
                <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${selectedModel.color} flex items-center justify-center shrink-0`}>
                  <selectedModel.icon className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{selectedModel.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedModel.desc}</p>
                </div>
              </div>

              {/* Text Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Test Input</label>
                <div className="flex gap-2">
                  <Input
                    value={inferenceText}
                    onChange={(e) => setInferenceText(e.target.value)}
                    placeholder='Enter text e.g. "You are stupid" or "मूर्ख"'
                    className="bg-muted/40 border-border flex-1"
                    onKeyDown={(e) => e.key === "Enter" && runInference()}
                  />
                  <Button
                    onClick={runInference}
                    disabled={!inferenceText.trim() || running}
                    className="gradient-bg text-white font-semibold shrink-0 gap-2"
                  >
                    {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    Run
                  </Button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {["You are stupid", "Great job!", "मूर्ख बंद कर", "This is awesome", "Hate you"].map((sample) => (
                    <button
                      key={sample}
                      onClick={() => setInferenceText(sample)}
                      className="text-xs px-2.5 py-1 rounded-full border border-border hover:border-primary/50 hover:text-primary text-muted-foreground transition-colors"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>

              {/* Console */}
              <div
                ref={consoleRef}
                className="bg-[#0d1117] rounded-xl border border-border/50 p-4 h-64 overflow-y-auto font-mono text-xs"
              >
                {logs.length === 0 && !running && (
                  <p className="text-muted-foreground/50 italic">Select a model, type text and click Run to start inference...</p>
                )}
                {logs.map((line, i) => {
                  const isVerdict = line.includes("VERDICT");
                  const isError = line.includes("ERROR");
                  return (
                    <div
                      key={i}
                      className={`leading-relaxed ${
                        isVerdict
                          ? "text-green-400 font-bold mt-1"
                          : isError
                          ? "text-red-400"
                          : i === 0
                          ? "text-blue-400"
                          : "text-gray-300"
                      }`}
                    >
                      <span className="text-gray-600 mr-2 select-none">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {line}
                    </div>
                  );
                })}
                {running && (
                  <div className="flex items-center gap-2 text-yellow-400 mt-1">
                    <span className="text-gray-600 mr-2 select-none">{String(logs.length + 1).padStart(2, "0")}</span>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Processing...</span>
                  </div>
                )}
                {done && (
                  <div className="flex items-center gap-2 text-emerald-400 mt-2 border-t border-border/30 pt-2">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span className="font-bold">Module Execution Complete.</span>
                  </div>
                )}
              </div>

              {/* Gemini Note */}
              <div className="flex items-start gap-2.5 bg-muted/30 rounded-xl p-3 border border-border/50">
                <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Note:</strong> This is an academic simulation of the local PyTorch research pipeline.
                  All live production moderation uses the <strong className="text-primary">Gemini API</strong> (Supabase Edge Function) for
                  real-time, accurate, multilingual toxicity detection.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
