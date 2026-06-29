import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Bot, User, Loader2, Sparkles, MessageCircle, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  onDelta: (t: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    onError(data.error || "Failed to get AI response");
    return;
  }

  if (!resp.body) {
    onError("No response body");
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, idx);
      buf = buf.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") {
        onDone();
        return;
      }
      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {
        buf = line + "\n" + buf;
        break;
      }
    }
  }
  onDone();
}

const AiChat = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");

    const userMsg: Msg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    await streamChat({
      messages: [...messages, userMsg],
      onDelta: upsert,
      onDone: () => setIsLoading(false),
      onError: (msg) => {
        setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ ${msg}` }]);
        setIsLoading(false);
      },
    });
  };

  return (
    <div className="h-screen bg-background flex text-foreground">
      {/* Left Conversations Sidebar */}
      <div className="w-[350px] border-r border-border hidden md:flex flex-col">
        <div className="h-[75px] border-b border-border flex items-center justify-between px-6 pt-4">
           <h2 className="text-xl font-bold">{profile?.username || "Messages"}</h2>
           <button><Edit className="w-6 h-6 text-foreground" /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
           <div className="p-4 font-semibold text-lg">Messages</div>
           <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 cursor-pointer">
              <div className="w-14 h-14 rounded-full gradient-bg flex items-center justify-center shrink-0">
                <Bot className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="font-semibold truncate">SafeGram AI</div>
                <div className="text-muted-foreground text-sm truncate">
                   {messages.length > 0 ? messages[messages.length - 1].content : "Ask me anything..."}
                </div>
              </div>
           </div>
        </div>
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative">
        <header className="h-[75px] border-b border-border flex items-center justify-between px-6 pt-4 shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
             </div>
             <div>
                <h3 className="font-semibold">SafeGram AI</h3>
                <p className="text-xs text-muted-foreground">Active Now</p>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="h-24 w-24 rounded-full border-2 border-border flex items-center justify-center">
                <MessageCircle className="h-12 w-12 text-foreground" />
              </div>
              <h2 className="text-xl font-bold">Your AI Assistant</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Ask me about online safety, cyberbullying prevention, or anything else.
              </p>
              <Button onClick={() => setInput("What is cyberbullying?")} variant="secondary" className="mt-4 rounded-xl">
                 Ask about cyberbullying
              </Button>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="h-7 w-7 rounded-full gradient-bg flex items-center justify-center shrink-0 mt-auto mb-1">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted border-transparent"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex gap-2 justify-start">
              <div className="h-7 w-7 rounded-full gradient-bg flex items-center justify-center shrink-0 mt-auto mb-1">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2 border border-border rounded-full pl-4 pr-1 py-1"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message..."
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 h-10 px-0"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              variant="ghost"
              className="text-primary font-semibold rounded-full hover:bg-transparent"
            >
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AiChat;
