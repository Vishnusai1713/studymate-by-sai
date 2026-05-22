import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, User as UserIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — Sai's StudyMate AI" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setEmail(u.user.email ?? "");
      const { data: profile } = await supabase
        .from("profiles").select("display_name").eq("id", u.user.id).maybeSingle();
      setDisplayName(profile?.display_name ?? "");
      setLoading(false);
    })();
  }, []);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, updated_at: new Date().toISOString() })
      .eq("id", u.user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  };

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto">
      <h1 className="font-display text-3xl font-bold">Profile</h1>
      <p className="mt-2 text-muted-foreground">Manage how you appear in StudyMate.</p>

      <div className="mt-8 glass-strong rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-gradient text-primary-foreground glow-purple">
            <UserIcon className="h-7 w-7" />
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate">{displayName || "Student"}</p>
            <p className="text-sm text-muted-foreground truncate">{email}</p>
          </div>
        </div>

        <form onSubmit={save} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Display name</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={loading}
              className="mt-1 w-full rounded-lg bg-input border border-border px-3 py-2.5 text-sm outline-none focus:border-neon-purple focus:ring-2 focus:ring-ring/30 transition"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Email</span>
            <input
              value={email} disabled
              className="mt-1 w-full rounded-lg bg-input border border-border px-3 py-2.5 text-sm text-muted-foreground"
            />
          </label>
          <button
            type="submit"
            disabled={saving || loading}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-primary-foreground glow-purple disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save changes
          </button>
        </form>
      </div>
    </div>
  );
}
