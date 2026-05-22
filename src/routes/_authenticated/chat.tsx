import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Copy, Check, Plus, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SUBJECTS, type Subject } from "@/lib/ai-prompts";
import { Markdown } from "@/components/markdown";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => ({ meta: [{ title: "AI Chat — Sai's StudyMate AI" }] }),
  validateSearch: (s: Record<string, unknown>) => ({ chat: typeof s.chat === "string" ? s.chat : undefined }),
  component: ChatPage,
});

interface Chat { id: string; title: string; subject: string; updated_at: string }
interface Msg { id: string; role: "user" | "assistant"; content: string }

function ChatPage() {
  const { chat: initialChatId } = Route.useSearch();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeId, setActiveId] = useState<string | null>(initialChatId ?? null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [subject, setSubject] = useState<Subject>("General Knowledge");
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load chats
  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase
        .from("chats")
        .select("id, title, subject, updated_at")
        .eq("user_id", u.user.id)
        .order("updated_at", { ascending: false });
      setChats((data ?? []) as Chat[]);
    })();
  }, []);

  // Load messages
  useEffect(() => {
    if (!activeId) { setMessages([]); return; }
    (async () => {
      const { data } = await supabase
        .from("messages")
        .select("id, role, content")
        .eq("chat_id", activeId)
        .order("created_at", { ascending: true });
      setMessages((data ?? []) as Msg[]);
      const c = chats.find((x) => x.id === activeId);
      if (c) setSubject(c.subject as Subject);
    })();
  }, [activeId, chats]);

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const newChat = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data, error } = await supabase
      .from("chats")
      .insert({ user_id: u.user.id, title: "New chat", subject })
      .select("id, title, subject, updated_at")
      .single();
    if (error || !data) { toast.error(error?.message ?? "Failed"); return; }
    setChats((c) => [data as Chat, ...c]);
    setActiveId(data.id);
    setMessages([]);
  };

  const deleteChat = async (id: string) => {
    await supabase.from("chats").delete().eq("id", id);
    setChats((c) => c.filter((x) => x.id !== id));
    if (activeId === id) { setActiveId(null); setMessages([]); }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || streaming) return;

    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;

    // Ensure chat exists
    let chatId = activeId;
    let isNewChat = false;
    if (!chatId) {
      const title = text.slice(0, 60);
      const { data, error } = await supabase
        .from("chats")
        .insert({ user_id: u.user.id, title, subject })
        .select("id, title, subject, updated_at")
        .single();
      if (error || !data) { toast.error("Could not start chat"); return; }
      chatId = data.id;
      setActiveId(chatId);
      setChats((c) => [data as Chat, ...c]);
      isNewChat = true;
    } else if (messages.length === 0) {
      // first message in empty chat → rename
      await supabase.from("chats").update({ title: text.slice(0, 60) }).eq("id", chatId);
      setChats((c) => c.map((x) => x.id === chatId ? { ...x, title: text.slice(0, 60) } : x));
    }

    setInput("");

    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", content: text };
    const assistantMsg: Msg = { id: crypto.randomUUID(), role: "assistant", content: "" };
    setMessages((m) => [...m, userMsg, assistantMsg]);

    // Persist user message
    await supabase.from("messages").insert({
      chat_id: chatId, user_id: u.user.id, role: "user", content: text,
    });

    setStreaming(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;

      const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));

      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ messages: history, subject }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast.error("Rate limit hit. Please slow down a bit.");
        else if (resp.status === 402) toast.error("AI credits exhausted. Add funds in Settings → Workspace → Usage.");
        else toast.error("AI request failed");
        setMessages((m) => m.filter((x) => x.id !== assistantMsg.id));
        setStreaming(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let full = "";
      let done = false;

      while (!done) {
        const { value, done: d } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              full += delta;
              setMessages((m) => m.map((x) => x.id === assistantMsg.id ? { ...x, content: full } : x));
            }
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }

      // Persist assistant message
      await supabase.from("messages").insert({
        chat_id: chatId, user_id: u.user.id, role: "assistant", content: full,
      });
      await supabase.from("chats").update({ updated_at: new Date().toISOString() }).eq("id", chatId);

      if (isNewChat) {
        setChats((c) => {
          const i = c.findIndex((x) => x.id === chatId);
          if (i < 0) return c;
          const updated = { ...c[i], updated_at: new Date().toISOString() };
          return [updated, ...c.slice(0, i), ...c.slice(i + 1)];
        });
      }
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong");
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-0px)] md:h-screen">
      {/* Chat list */}
      <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-border/40 p-3">
        <button
          onClick={newChat}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand-gradient px-3 py-2.5 text-sm font-medium text-primary-foreground glow-purple"
        >
          <Plus className="h-4 w-4" /> New chat
        </button>
        <div className="mt-4 flex-1 overflow-y-auto scroll-thin space-y-1">
          {chats.length === 0 && (
            <p className="text-xs text-muted-foreground px-2 py-3">No chats yet</p>
          )}
          {chats.map((c) => (
            <div
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={cn(
                "group flex items-center justify-between gap-2 cursor-pointer rounded-lg px-3 py-2 text-sm transition",
                activeId === c.id ? "bg-white/10" : "hover:bg-white/5",
              )}
            >
              <div className="min-w-0">
                <p className="truncate">{c.title}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{c.subject}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); deleteChat(c.id); }}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                aria-label="Delete chat"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Conversation */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header / subject selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 p-4">
          <div>
            <h2 className="font-display text-lg font-semibold">AI Study Chat</h2>
            <p className="text-xs text-muted-foreground">Ask anything. The tutor adapts to your subject.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {SUBJECTS.map((s) => (
              <button
                key={s}
                onClick={() => setSubject(s)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition",
                  subject === s
                    ? "bg-brand-gradient text-primary-foreground"
                    : "glass text-muted-foreground hover:text-foreground",
                )}
              >
                {s}
              </button>
            ))}
            <button onClick={newChat} className="lg:hidden ml-1 rounded-lg glass p-2" aria-label="New chat">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-thin px-4 md:px-8 py-6">
          {messages.length === 0 ? (
            <EmptyState onPick={(q) => setInput(q)} />
          ) : (
            <div className="max-w-3xl mx-auto space-y-5">
              {messages.map((m) => (
                <MessageBubble key={m.id} msg={m} streaming={streaming && m === messages[messages.length - 1] && m.role === "assistant" && m.content === ""} />
              ))}
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-border/40 p-4">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-end gap-2 glass-strong rounded-2xl p-2 focus-within:ring-2 focus-within:ring-ring/30 transition">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
                }}
                rows={1}
                placeholder="Ask me anything — e.g. 'Explain recursion with an example'"
                className="flex-1 bg-transparent resize-none px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground max-h-40"
              />
              <button
                onClick={send}
                disabled={streaming || !input.trim()}
                className="grid h-10 w-10 place-items-center rounded-xl bg-brand-gradient text-primary-foreground disabled:opacity-40 transition-transform hover:scale-105"
                aria-label="Send"
              >
                {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-2 text-[10px] text-center text-muted-foreground">
              StudyMate may make mistakes. Always double-check important info.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg, streaming }: { msg: Msg; streaming: boolean }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";

  const copy = async () => {
    await navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-brand-gradient px-4 py-2.5 text-sm text-primary-foreground whitespace-pre-wrap">
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="h-8 w-8 shrink-0 rounded-lg bg-brand-gradient grid place-items-center text-xs font-bold">S</div>
      <div className="group flex-1 min-w-0">
        <div className="rounded-2xl rounded-bl-sm glass px-4 py-3">
          {streaming ? (
            <div>
              <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
            </div>
          ) : (
            <Markdown content={msg.content} />
          )}
        </div>
        {!streaming && msg.content && (
          <button
            onClick={copy}
            className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (q: string) => void }) {
  const suggestions = [
    "Explain Big O notation with examples",
    "What is the difference between TCP and UDP?",
    "Help me understand Newton's laws of motion",
    "Give me 5 tips to improve my essay writing",
  ];
  return (
    <div className="h-full grid place-items-center text-center">
      <div className="max-w-xl">
        <Logo size={64} />
        <h3 className="mt-5 font-display text-2xl font-semibold">
          Hi! I'm <span className="text-gradient">StudyMate</span>.
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Ask me anything about your studies — I'll explain in simple English.
        </p>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => onPick(s)}
              className="text-left glass rounded-xl px-4 py-3 text-sm hover:bg-white/10 transition"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
