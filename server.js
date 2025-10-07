// ─── Importaciones y configuración ───────────────────────────────
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from 'path';

dotenv.config();

const app = express();
app.use(express.json());
app.use("/assets", express.static(path.join(process.cwd(), "public")));

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY; // 🔑 Nueva API key
let chatHistory = [];

app.get("/", (req, res) => {
  try {
    res.sendFile(path.join(process.cwd(), "index.html"));
  } catch (e) {
    res.send("Error al cargar la pagina");
  }
});

// ─── CHAT ─────────────────────────────────────────────────────────
app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;
  chatHistory.push({ role: "user", content: userMessage });
  if (chatHistory.length > 6) chatHistory = chatHistory.slice(-6);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Eres Yuki Nagato. Responde con lógica, calma y sin exageraciones.`,
          },
          ...chatHistory,
        ],
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Error: no hay respuesta.";
    chatHistory.push({ role: "assistant", content: reply });
    res.json({ reply });
  } catch (error) {
    console.error("❌ Error /api/chat:", error);
    res.status(500).json({ error: "Error al conectar con OpenAI" });
  }
});

// ─── VOZ (ElevenLabs) ─────────────────────────────────────────────
app.post("/api/voice", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).send("Falta texto para sintetizar.");

  // 🔊 Cambia este voice_id por la voz que prefieras
  // Ejemplos de voces: Rachel, Bella, Domi, Elli, Josh, Arnold
  const voice_id = "21m00Tcm4TlvDq8ikWAM"; // "Rachel" (neutral, clara)

  try {
    console.log("🗣️ Solicitando voz a ElevenLabs...");

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}/stream`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          "Accept": "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          voice_settings: {
            stability: 0.4,
            similarity_boost: 0.8,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Error HTTP ${response.status}: ${err}`);
    }

    const audioBuffer = await response.arrayBuffer();
    res.set("Content-Type", "audio/mpeg");
    res.send(Buffer.from(audioBuffer));

    console.log("✅ Voz generada correctamente por ElevenLabs.");
  } catch (error) {
    console.error("❌ Error al generar la voz:", error);
    res.status(500).send("Error generando voz con ElevenLabs");
  }
});

// ─── Iniciar servidor ───────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Servidor activo en http://localhost:${PORT}`)
);
