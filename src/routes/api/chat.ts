import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { SUBJECTS, systemPromptFor, type Subject } from "@/lib/ai-prompts";

// Streaming chat endpoint. Validates the bearer token using the publishable key
// (verifies via Supabase Auth) before forwarding to the Lovable AI Gateway.
export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const authHeader = request.headers.get("authorization");
          if (!authHeader?.startsWith("Bearer ")) {
            return new Response("Unauthorized", { status: 401 });
          }
          const token = authHeader.slice(7);

          const SUPABASE_URL = process.env.SUPABASE_URL;
          const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
          const apiKey = process.env.LOVABLE_API_KEY;
          if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY || !apiKey) {
            return new Response("Server not configured", { status: 500 });
          }

          const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
            auth: { persistSession: false, autoRefreshToken: false },
          });
          const { data, error } = await supabase.auth.getUser(token);
          if (error || !data.user) {
            return new Response("Unauthorized", { status: 401 });
          }

          const body = await request.json() as {
            messages?: Array<{ role: "user" | "assistant"; content: string }>;
            subject?: Subject;
          };

          const subject: Subject = SUBJECTS.includes(body.subject as Subject)
            ? (body.subject as Subject)
            : "General Knowledge";

          const messages = Array.isArray(body.messages) ? body.messages.slice(-30) : [];

          const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [
                { role: "system", content: systemPromptFor(subject) },
                ...messages,
              ],
              stream: true,
            }),
          });

          if (!resp.ok) {
            if (resp.status === 429) return new Response("Rate limit", { status: 429 });
            if (resp.status === 402) return new Response("Payment required", { status: 402 });
            return new Response("AI error", { status: 500 });
          }

          return new Response(resp.body, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
            },
          });
        } catch (e) {
          console.error(e);
          return new Response("Error", { status: 500 });
        }
      },
    },
  },
});
