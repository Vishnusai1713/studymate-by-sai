import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Sparkles,
  MessageSquare,
  FileText,
  GraduationCap,
  Zap,
  ShieldCheck,
  ArrowRight,
  Brain,
} from "lucide-react";
import { Logo } from "@/components/logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sai's StudyMate AI — AI Tutor for Engineering Students" },
      {
        name: "description",
        content:
          "A futuristic AI study companion that explains programming, math, physics and more in simple English. Built for engineering students.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: MessageSquare,
    title: "AI Study Chat",
    desc: "Ask anything. Get clear, step-by-step explanations like from a friendly senior.",
  },
  {
    icon: FileText,
    title: "Smart Notes Generator",
    desc: "Turn any topic into exam-ready notes with key concepts, examples & likely questions.",
  },
  {
    icon: GraduationCap,
    title: "Subject-aware Tutor",
    desc: "Programming, Math, Physics, English & GK — the AI adapts its style to your subject.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    desc: "Streaming responses powered by next-gen AI models. No waiting around.",
  },
  {
    icon: Brain,
    title: "Beginner Friendly",
    desc: "No jargon. Every concept broken down into something you actually understand.",
  },
  {
    icon: ShieldCheck,
    title: "Private & Secure",
    desc: "Your chats and notes are tied to your account with row-level security.",
  },
];

const TESTIMONIALS = [
  { name: "Aarav S.", role: "B.Tech CSE", quote: "Honestly explains operating systems better than my textbook. The notes feature is gold before exams." },
  { name: "Priya R.", role: "ECE Junior", quote: "I asked it to explain Fourier transforms like I'm 15. It actually did. Insane." },
  { name: "Rohan K.", role: "Mech Engg", quote: "Replaced 4 different YouTube playlists. The chat history makes revising super easy." },
];

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Header */}
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Logo size={38} withWordmark />
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition">Features</a>
          <a href="#testimonials" className="hover:text-foreground transition">Students</a>
          <Link to="/login" className="hover:text-foreground transition">Login</Link>
        </nav>
        <Link
          to="/signup"
          className="rounded-lg bg-brand-gradient px-4 py-2 text-sm font-medium text-primary-foreground glow-purple transition-transform hover:scale-105"
        >
          Get started
        </Link>
      </header>

      {/* Hero */}
      <section className="relative pt-12 pb-32 px-6">
        <div className="aurora" />
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-muted-foreground"
          >
            <Sparkles className="h-3.5 w-3.5 text-neon-cyan" />
            Powered by next-gen AI — built for engineering students
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-6 font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]"
          >
            Your futuristic <br />
            <span className="text-gradient">AI study mate.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
          >
            Sai's StudyMate AI explains tough engineering concepts in simple English —
            like a friendly senior who never gets tired of your questions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-wrap justify-center gap-3"
          >
            <Link
              to="/signup"
              className="group inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-6 py-3.5 text-sm font-semibold text-primary-foreground glow-purple animate-pulse-glow transition-transform hover:scale-105"
            >
              Start learning free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl glass px-6 py-3.5 text-sm font-semibold text-foreground hover:bg-white/10 transition"
            >
              I already have an account
            </Link>
          </motion.div>

          {/* Floating mock chat preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative mx-auto mt-20 max-w-3xl"
          >
            <div className="glass-strong rounded-2xl p-6 text-left shadow-[var(--shadow-elegant)]">
              <div className="flex items-center gap-2 border-b border-border/40 pb-3 mb-4">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                <span className="ml-3 text-xs text-muted-foreground">studymate.ai / chat</span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-end">
                  <div className="max-w-md rounded-2xl rounded-br-sm bg-brand-gradient px-4 py-2.5 text-sm text-primary-foreground">
                    Explain Big O notation like I'm new to coding
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="h-8 w-8 shrink-0 rounded-lg bg-brand-gradient grid place-items-center text-xs font-bold">S</div>
                  <div className="max-w-xl rounded-2xl rounded-bl-sm glass px-4 py-3 text-sm">
                    Sure! Think of Big O as a way to <b>describe how slow a recipe gets when you cook for more people</b>. If doubling the guests doubles the time, that's <code>O(n)</code>. If it stays the same, that's <code>O(1)</code>. Want a code example next?
                  </div>
                </div>
                <div className="flex gap-3 items-center text-muted-foreground">
                  <div className="h-8 w-8 shrink-0 rounded-lg bg-brand-gradient grid place-items-center text-xs font-bold">S</div>
                  <div>
                    <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
              Everything you need to <span className="text-gradient">study smarter</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              A premium toolkit, built for the way engineering students actually learn.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="group glass rounded-2xl p-6 hover:bg-white/[0.08] transition-all hover:-translate-y-1 hover:glow-purple"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-primary-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
              Loved by <span className="text-gradient">students like you</span>
            </h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="glass-strong rounded-2xl p-6">
                <p className="text-sm leading-relaxed text-foreground/90">"{t.quote}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-brand-gradient grid place-items-center text-sm font-semibold">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="relative glass-strong overflow-hidden rounded-3xl p-12 text-center">
            <div className="aurora" />
            <div className="relative z-10">
              <h2 className="font-display text-4xl md:text-5xl font-bold">
                Ready to <span className="text-gradient">level up</span> your study game?
              </h2>
              <p className="mt-4 text-muted-foreground">
                Sign up free. No credit card. Just clearer answers.
              </p>
              <Link
                to="/signup"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-7 py-3.5 text-sm font-semibold text-primary-foreground glow-purple animate-pulse-glow transition-transform hover:scale-105"
              >
                Create your free account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col md:flex-row items-center justify-between gap-4">
          <Logo size={32} withWordmark />
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Sai's StudyMate AI. Built with ❤️ for students.
          </p>
        </div>
      </footer>
    </div>
  );
}
