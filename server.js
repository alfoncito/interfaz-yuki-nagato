import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const app = express();
app.use(express.json());
app.use("/assets", express.static("public"));

app.get("/", async (req, res) => {
  res.sendFile(path.join(import.meta.dirname, "index.html"));
});

// 🧠 PRIMER ENDPOINT → ChatGPT (texto)
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Eres Yuki Nagato de Haruhi Suzumiya. Hablas con calma, precisión y lógica impecable. Tu tono es sereno, pausado y analítico.",
          },
          { role: "user", content: message },
        ],
      }),
    });

    const data = await response.json();
    res.json({ reply: data.choices[0].message.content });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error al conectar con OpenAI");
  }
});

// 🟣 SEGUNDO ENDPOINT → ElevenLabs (voz)
// ⚠️ ESTE VA JUSTO DEBAJO DEL PRIMERO, Y ANTES DEL app.listen()
app.post("/api/tts", async (req, res) => {
  const { text } = req.body;

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(buffer);
  } catch (error) {
    console.error("❌ Error en test-voice:", error);
    res.status(500).send("Error en la prueba de voz");
  }
});

// 🔊 Endpoint de prueba de voz
app.get("/test-voice", async (req, res) => {
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: "Hola, soy Yuki Nagato. Esta es una prueba de voz.",
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error detallado de ElevenLabs:", errorText);
      throw new Error(errorText);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(buffer);
  } catch (error) {
    console.error("❌ Error en test-voice:", error);
    res.status(500).send(`Error en la prueba de voz: ${error.message}`);
  }
});

// 🚀 Finalmente, el servidor escucha aquí (NO toques esto)
app.listen(3000, () =>
  console.log("Servidor corriendo en http://localhost:3000"),
);
