import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogOut, Trash2, ShieldCheck, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — Sai's StudyMate AI" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  const clearChats = async () => {
    if (!confirm("Delete all your chats and messages? This cannot be undone.")) return;
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    await supabase.from("chats").delete().eq("user_id", u.user.id);
    toast.success("All chats deleted");
  };

  const clearNotes = async () => {
    if (!confirm("Delete all your saved notes?")) return;
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    await supabase.from("notes").delete().eq("user_id", u.user.id);
    toast.success("All notes deleted");
  };

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <h1 className="font-display text-3xl font-bold">Settings</h1>
      <p className="mt-2 text-muted-foreground">Manage your account and data.</p>

      <div className="mt-8 space-y-4">
        <Section icon={Sparkles} title="Appearance" desc="StudyMate uses a futuristic dark theme by default for late-night study sessions." />
        <Section icon={ShieldCheck} title="Privacy" desc="Your chats and notes are private to your account. Row-level security keeps your data isolated." />

        <div className="glass rounded-2xl p-5">
          <h3 className="font-display font-semibold">Data</h3>
          <p className="mt-1 text-sm text-muted-foreground">Clean up your study history.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={clearChats} className="inline-flex items-center gap-2 rounded-lg glass px-4 py-2 text-sm hover:bg-white/10">
              <Trash2 className="h-4 w-4" /> Clear all chats
            </button>
            <button onClick={clearNotes} className="inline-flex items-center gap-2 rounded-lg glass px-4 py-2 text-sm hover:bg-white/10">
              <Trash2 className="h-4 w-4" /> Clear all notes
            </button>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="font-display font-semibold">Account</h3>
          <p className="mt-1 text-sm text-muted-foreground">Sign out of StudyMate on this device.</p>
          <button onClick={signOut} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-destructive/90 px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="glass rounded-2xl p-5 flex gap-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-gradient text-primary-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <h3 className="font-display font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}
