import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, FileText, Sparkles, TrendingUp, ArrowRight, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Sai's StudyMate AI" }] }),
  component: DashboardPage,
});

interface Stats {
  chats: number;
  notes: number;
  messages: number;
  name: string | null;
}
interface RecentChat { id: string; title: string; subject: string; updated_at: string }
interface RecentNote { id: string; topic: string; subject: string; created_at: string }

function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ chats: 0, notes: 0, messages: 0, name: null });
  const [chats, setChats] = useState<RecentChat[]>([]);
  const [notes, setNotes] = useState<RecentNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return;

      const [{ data: profile }, { count: chatCount }, { count: noteCount }, { count: msgCount }, recentChats, recentNotes] = await Promise.all([
        supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
        supabase.from("chats").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("notes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("messages").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("chats").select("id, title, subject, updated_at").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(5),
        supabase.from("notes").select("id, topic, subject, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
      ]);

      setStats({
        chats: chatCount ?? 0,
        notes: noteCount ?? 0,
        messages: msgCount ?? 0,
        name: profile?.display_name ?? user.email?.split("@")[0] ?? "Student",
      });
      setChats((recentChats.data ?? []) as RecentChat[]);
      setNotes((recentNotes.data ?? []) as RecentNote[]);
      setLoading(false);
    })();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm text-muted-foreground">{greeting},</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold mt-1">
          <span className="text-gradient">{stats.name ?? "Student"}</span> 👋
        </h1>
        <p className="mt-2 text-muted-foreground">Ready to learn something new today?</p>
      </motion.div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard icon={MessageSquare} label="Chats" value={stats.chats} loading={loading} />
        <StatCard icon={FileText} label="Notes saved" value={stats.notes} loading={loading} />
        <StatCard icon={TrendingUp} label="Messages exchanged" value={stats.messages} loading={loading} />
      </div>

      {/* Quick actions */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <ActionCard
          to="/chat"
          icon={Sparkles}
          title="Start a new chat"
          desc="Ask any concept — get a friendly, simple explanation."
          cta="New chat"
        />
        <ActionCard
          to="/notes"
          icon={BookOpen}
          title="Generate notes"
          desc="Type a topic, get exam-ready notes in seconds."
          cta="Generate notes"
        />
      </div>

      {/* Recent */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Panel title="Recent chats" empty="No chats yet — start your first one!" items={chats.length} link={{ to: "/chat", label: "Open chat" }}>
          {chats.map((c) => (
            <Link key={c.id} to="/chat" search={{ chat: c.id } as never} className="block rounded-lg p-3 hover:bg-white/[0.04] transition">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.subject}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{relTime(c.updated_at)}</span>
              </div>
            </Link>
          ))}
        </Panel>

        <Panel title="Recent notes" empty="No notes yet — generate your first one." items={notes.length} link={{ to: "/notes", label: "Open notes" }}>
          {notes.map((n) => (
            <div key={n.id} className="block rounded-lg p-3 hover:bg-white/[0.04] transition">
              <p className="text-sm font-medium truncate">{n.topic}</p>
              <p className="text-xs text-muted-foreground">{n.subject} · {relTime(n.created_at)}</p>
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, loading }: { icon: React.ElementType; label: string; value: number; loading: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-gradient text-primary-foreground">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-4 text-3xl font-display font-bold">
        {loading ? <span className="inline-block h-8 w-12 rounded bg-white/5 animate-pulse" /> : value}
      </div>
    </motion.div>
  );
}

function ActionCard({ to, icon: Icon, title, desc, cta }: { to: string; icon: React.ElementType; title: string; desc: string; cta: string }) {
  return (
    <Link to={to} className="group glass-strong rounded-2xl p-6 hover:bg-white/[0.08] transition-all hover:-translate-y-0.5">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-primary-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      <div className="mt-4 inline-flex items-center gap-1.5 text-sm text-neon-cyan group-hover:gap-2 transition-all">
        {cta} <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  );
}

function Panel({ title, children, empty, items, link }: { title: string; children: React.ReactNode; empty: string; items: number; link: { to: string; label: string } }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold">{title}</h3>
        <Link to={link.to} className="text-xs text-neon-cyan hover:underline">{link.label}</Link>
      </div>
      <div className="mt-3 divide-y divide-border/40">
        {items === 0 ? (
          <p className="py-6 text-sm text-center text-muted-foreground">{empty}</p>
        ) : children}
      </div>
    </div>
  );
}

function relTime(iso: string) {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
