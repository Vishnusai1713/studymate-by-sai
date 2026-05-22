import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SUBJECTS, type Subject } from "@/lib/ai-prompts";
import { Markdown } from "@/components/markdown";
import { generateNotes } from "@/lib/notes.functions";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/notes")({
  head: () => ({ meta: [{ title: "Notes Generator — Sai's StudyMate AI" }] }),
  component: NotesPage,
});

interface Note { id: string; topic: string; subject: string; content: string; created_at: string }

function NotesPage() {
  const generate = useServerFn(generateNotes);
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState<Subject>("General Knowledge");
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState<{ topic: string; subject: string; content: string } | null>(null);
  const [history, setHistory] = useState<Note[]>([]);

  const loadHistory = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data } = await supabase
      .from("notes")
      .select("id, topic, subject, content, created_at")
      .eq("user_id", u.user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setHistory((data ?? []) as Note[]);
  };

  useEffect(() => { loadHistory(); }, []);

  const onGenerate = async () => {
    const t = topic.trim();
    if (!t) return;
    setLoading(true);
    setCurrent(null);
    try {
      const result = await generate({ data: { topic: t, subject } });
      setCurrent({ topic: t, subject, content: result.content });

      const { data: u } = await supabase.auth.getUser();
      if (u.user) {
        const { data } = await supabase
          .from("notes")
          .insert({ user_id: u.user.id, topic: t, subject, content: result.content })
          .select("id, topic, subject, content, created_at")
          .single();
        if (data) setHistory((h) => [data as Note, ...h]);
      }
      toast.success("Notes generated!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate notes");
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id: string) => {
    await supabase.from("notes").delete().eq("id", id);
    setHistory((h) => h.filter((x) => x.id !== id));
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold">
          AI <span className="text-gradient">Notes Generator</span>
        </h1>
        <p className="mt-2 text-muted-foreground">Turn any topic into exam-ready notes in seconds.</p>
      </div>

      {/* Generator */}
      <div className="mt-8 glass-strong rounded-2xl p-5">
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Topic</span>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") onGenerate(); }}
            placeholder="e.g. 'Linked lists', 'Photosynthesis', 'Newton's laws'"
            className="mt-1 w-full rounded-lg bg-input border border-border px-3 py-2.5 text-sm outline-none focus:border-neon-purple focus:ring-2 focus:ring-ring/30 transition"
          />
        </label>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {SUBJECTS.map((s) => (
            <button
              key={s}
              onClick={() => setSubject(s)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition",
                subject === s ? "bg-brand-gradient text-primary-foreground" : "glass text-muted-foreground hover:text-foreground",
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <button
          onClick={onGenerate}
          disabled={loading || !topic.trim()}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-primary-foreground glow-purple disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Generating..." : "Generate notes"}
        </button>
      </div>

      {/* Current result */}
      {current && (
        <div className="mt-8 glass rounded-2xl p-6">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{current.subject}</div>
          <Markdown content={current.content} />
        </div>
      )}

      {/* History */}
      <div className="mt-10">
        <h2 className="font-display text-xl font-semibold">Your saved notes</h2>
        {history.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No saved notes yet.</p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {history.map((n) => (
              <details key={n.id} className="glass rounded-xl p-4 group">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{n.topic}</p>
                    <p className="text-xs text-muted-foreground">{n.subject} · {new Date(n.created_at).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={(e) => { e.preventDefault(); deleteNote(n.id); }}
                    className="text-muted-foreground hover:text-destructive p-1"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </summary>
                <div className="mt-3 pt-3 border-t border-border/40">
                  <Markdown content={n.content} />
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
