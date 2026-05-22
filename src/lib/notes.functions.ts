import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { notesPrompt, SUBJECTS, type Subject } from "./ai-prompts";

export const generateNotes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      topic: z.string().min(1).max(300),
      subject: z.enum(SUBJECTS as unknown as [Subject, ...Subject[]]),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a helpful AI tutor for engineering students. Output clean markdown only." },
          { role: "user", content: notesPrompt(data.topic, data.subject) },
        ],
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("AI gateway error", resp.status, text);
      if (resp.status === 429) throw new Error("Rate limit hit. Please try again in a moment.");
      if (resp.status === 402) throw new Error("AI credits exhausted. Add funds in Settings → Workspace → Usage.");
      throw new Error("AI request failed");
    }

    const json = await resp.json();
    const content: string = json.choices?.[0]?.message?.content ?? "";
    return { content };
  });
