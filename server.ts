import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

// Standard server-side AI Client initialization
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is not defined. AI features will run in fallback simulation mode.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "FAKE_KEY_FOR_LOCAL_DEV",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Check overall health
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // API Route: Proxy Bible Scripture demands safely
  app.get("/api/scripture", async (req, res) => {
    const reference = req.query.reference as string;
    if (!reference) {
       res.status(400).json({ error: "Missing reference query parameter." });
       return;
    }

    try {
      // Clean up reference for API (replace spaces with plus sign)
      const cleanRef = encodeURIComponent(reference.trim().replace(/\s+/g, "+"));
      const bibleUrl = `https://bible-api.com/${cleanRef}?translation=web`; // World English Bible translation is clean and modern public domain
      const response = await fetch(bibleUrl);
      if (!response.ok) {
        throw new Error(`Bible API responded with status ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      console.error("Scripture fetch failed, using fallback mock provider:", err);
      // Fallback response with basic mock KJV text so the application doesn't crash if they are offline or Bible-API is slow
      res.json({
        reference: reference,
        text: "Understanding is a wellspring of life unto him that hath it: but the instruction of fools is folly. (Scripture text offline fallback. Please check connection.)",
        verses: [
          {
            chapter: 1,
            verse: 1,
            text: "Wisdom is the principal thing; therefore get wisdom: and with all thy getting get understanding."
          }
        ]
      });
    }
  });

  // API Route: Request custom journal reflections from Gemini
  app.post("/api/gemini/reflect", async (req, res) => {
    const { reference, theme, journalContent, promptQuestion } = req.body;

    if (!journalContent || journalContent.trim().length === 0) {
       res.status(400).json({ error: "No reflection text provided to evaluate." });
       return;
    }

    if (!apiKey) {
      // Elegant, rich default response when no key is configured to mock behavior gracefully and helpfully
      res.json({
        reflection: `Thank you for sharing your heart concerning the wisdom in ${reference || 'Proverbs'}. (API Key limit: Running offline simulation mode).\n\nYou expressed beautiful insights concerning "${theme || 'daily living'}". Your contemplation shows a deep yearning for integrity and sound understanding. In Proverbs, we learn that even the smallest steps of obedience lead to an expanding pathway of light.\n\nContemplate: What is one choice you can make tomorrow that directly honors the reflection you've penned today?`
      });
      return;
    }

    try {
      const ai = getAiClient();
      const prompt = `
        The user has read the Scripture passage: ${reference || 'Proverbs'}.
        Theme Focus: ${theme || 'Spiritual Growth'}.
        Journaling Prompt they answered: "${promptQuestion || 'Write your daily reflection.'}"
        
        The user wrote this personal journal entry:
        "${journalContent}"

        Please write a response to encourage them in their yearly spiritual journey.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: `
            You are a gentle, wise, and deeply encouraging spiritual companion specializing in facilitating reflection on the biblical Book of Proverbs.
            Your purpose is to foster personal, ethical, and spiritual character growth.
            
            When writing your response:
            1. Keep it concise (2-3 paragraphs, around 150-250 words total).
            2. Speak with profound empathy, treating the user's feelings with utmost respect and confidentiality.
            3. Gracefully connect their personal journal entry back to the core values of the day: ${theme || 'Wisdom'}.
            4. Suggest a gentle, inspiring cross-reference, proverb verse, or supportive concept to clarify their path.
            5. Conclude with exactly one thoughtful, compassionate, open-ended question designed to help them take their next small step in personal growth.
            6. Keep the formatting simple and readable using clean double-newlines. Avoid robotic headers like 'Encouragement:', 'Insight:', or bulleted items. Speak in a warm, human, elder-friend mentorship voice.
          `,
          temperature: 0.75,
        }
      });

      res.json({ reflection: response.text });
    } catch (err: any) {
      console.error("Gemini reflection failed:", err);
      res.status(500).json({ error: "Spiritual companion was unable to formulate a response. Please check setup." });
    }
  });

  // API Route: Explain a specific Proverbs verse range
  app.post("/api/gemini/explain", async (req, res) => {
    const { reference, scriptureText, question } = req.body;

    if (!reference) {
       res.status(400).json({ error: "Missing Bible passage reference." });
       return;
    }

    if (!apiKey) {
      res.json({
        explanation: `#### Insight on ${reference}\n\nThe Book of Proverbs is structured as classic Hebrew poetic parallelism, where ideas are either compared (antithetic, e.g. "but the wicked...") or built upon (synonymous). \n\nIn this section, the author contrasts the internal state of a person seeking integrity with the external static of foolish pursuit. True wisdom is always practical and active—demonstrated in how we talk, work, and love our neighbor.\n\n*(Note: Configure your GEMINI_API_KEY in Secrets to unlock specific personalized verse explanations here!)*`
      });
      return;
    }

    try {
      const ai = getAiClient();
      const prompt = `
        Passage: ${reference}
        Scripture content (if available): "${scriptureText || 'Refer to standard bible text'}"
        User's question or topic of inquiry: "${question || 'What is the core spiritual lesson here?'}"
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: `
            You are an expert Bible teacher and pastoral guide specializing in Wisdom Literature (specifically the Book of Proverbs).
            Your goal is to explain difficult verses, define historical weights/measures/customs, clarify translation nuances, and make Proverbs practical for contemporary daily spiritual growth.
            
            Provide:
            - A clear, simple, yet deep exposition of the Hebrew parallelism and meaning of the verses.
            - A concise application to modern work, relationships, speaking, or inner character.
            - Keep your tone intellectual, yet deeply warm, organic, and accessible. Use clean Markdown styling for easy reading.
          `,
          temperature: 0.7,
        }
      });

      res.json({ explanation: response.text });
    } catch (err: any) {
      console.error("Gemini explanation failed:", err);
      res.status(500).json({ error: "Failed to retrieve wisdom commentary." });
    }
  });

  // API Route: Compile overall soul-growth themes from all journal entries
  app.post("/api/gemini/soul-growth", async (req, res) => {
    const { logs } = req.body; // Array of past logs: { reference, theme, content, date }

    if (!logs || !Array.isArray(logs) || logs.length === 0) {
      res.json({
        insights: "Your Spiritual Diary is empty. Begin writing your daily reflections to see an AI-curated evaluation of your spiritual development themes, values, and progress here!"
      });
      return;
    }

    if (!apiKey) {
      res.json({
        insights: `### Your Spiritual Journey Summary (Simulation Mode)\n\nBased on your ${logs.length} logged reflection(s):\n\n- **Diligence and Growth**: You are systematically showing a desire to step forward, cultivate healthier habits, and honor your commitments.\n- **Reflective Listening**: Your journal entries focus on taking time to silent the noisy clutter of modern concerns to listen to a quieter, wiser voice.\n\nKeep logging your entries. Together, we are crafting a permanent record of your pursuit of understanding over the course of this year.`
      });
      return;
    }

    try {
      const ai = getAiClient();
      const logsSummary = logs.map(l => `[${l.date}] Pass: ${l.reference} | Theme: ${l.theme} | Reflection: "${l.content}"`).join("\n\n");
      const prompt = `
        Here is a chronological collection of my personal spiritual self-reflections written over the past season:
        
        ${logsSummary}

        Please analyze these entries and synthesize a comprehensive overview of my current spiritual character development.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: `
            You are a spiritual mentor, life coach, and soul-growth counselor evaluating a student's diary entries.
            Provide a beautiful, encouraging, and highly specific analysis:
            1. Identify 2-3 prominent recurring themes in their writing (e.g., struggles with words, pursuit of humble leadership, learning to trust God in transitions).
            2. Highlight concrete evidence of a maturing character in their words. Praise them with warmth and specific reminders.
            3. Suggest 2 or 3 supportive verses from Proverbs that they might want to write down in their physical space as anchors for the coming week.
            4. Keep the writing elegant, deep, and deeply encouraging. Use elegant Markdown headers. No clinical or sterile data report structures.
          `,
          temperature: 0.75,
        }
      });

      res.json({ insights: response.text });
    } catch (err: any) {
      console.error("Soul growth synthesis failed:", err);
      res.status(500).json({ error: "Failed to generate your soul-growth insights report." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Proverbs Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
