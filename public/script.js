import "./matrix.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Interfaz de Yuki lista.");

  const messages = document.getElementById("messages");

  // === ÁREA DE TIPEO CON CURSOR ===
  const typingBox = document.createElement("div");
  typingBox.id = "typing-area";
  typingBox.innerHTML = `<span id="typing-text"></span><span class="cursor"></span>`;
  messages.appendChild(typingBox);

  const typingText = document.getElementById("typing-text");
  const cursor = document.querySelector(".cursor");

  // === FUNCIÓN DE TIPEO NATURAL ===
  async function typeMessage(element, message) {
    element.innerHTML = "";
    cursor.style.opacity = 0; // Ocultar cursor durante escritura

    for (let i = 0; i < message.length; i++) {
      element.innerHTML += message[i];
      const delay = 40 + Math.random() * 60;
      await new Promise((r) => setTimeout(r, delay));
      if (Math.random() < 0.02) {
        await new Promise((r) => setTimeout(r, 400 + Math.random() * 300));
      }
    }

    cursor.style.opacity = 1; // Mostrar cursor al final
  }

  // === FUNCIÓN PARA AÑADIR MENSAJES ===
  function addMessage(sender, text) {
    const div = document.createElement("div");
    div.classList.add("message");

    if (sender.toLowerCase() === "tú" || sender.toLowerCase() === "tu") {
      div.classList.add("user-message");
    } else {
      div.classList.add("yuki-message");
    }

    div.textContent = `${sender}: ${text}`;
    messages.appendChild(div);

    div.style.opacity = 0;
    setTimeout(() => (div.style.opacity = 1), 50);
    messages.scrollTop = messages.scrollHeight;
  }

  // === INDICADOR DE "PENSANDO" ===
  function showThinkingCursor() {
    const thinking = document.createElement("div");
    thinking.classList.add("thinking-indicator");
    thinking.innerHTML = `<span class="thinking-cursor">_</span>`;
    messages.appendChild(thinking);
    messages.scrollTop = messages.scrollHeight;
    return thinking;
  }

  // === NUEVA FUNCIÓN DE VOZ USANDO HUGGING FACE ===
  async function playYukiVoice(text) {
    try {
      const response = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        console.error("⚠️ Error al generar voz:", await response.text());
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (err) {
      console.error("❌ Error al reproducir la voz de Yuki:", err);
    }
  }

  // === FUNCIÓN PRINCIPAL DE ENVÍO ===
  async function sendMessage() {
    const userInput = document.getElementById("user-input");
    const message = userInput.value.trim();
    if (!message) return;

    addMessage("Tú", message);
    userInput.value = "";

    const thinkingCursor = showThinkingCursor();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      thinkingCursor.remove();

      const yukiResponse = document.createElement("div");
      yukiResponse.classList.add("yuki-message");
      messages.appendChild(yukiResponse);

      await typeMessage(yukiResponse, `YUKI.N> ${data.reply}`);

      // 🔊 Reproduce la voz desde Hugging Face
      await playYukiVoice(data.reply);

      messages.scrollTop = messages.scrollHeight;
    } catch (error) {
      console.error("❌ Error en /api/chat:", error);
      if (thinkingCursor) thinkingCursor.remove();
      addMessage(
        "YUKI.N>",
        "Error crítico. No hay enlace con la red de datos.",
      );
    }
  }

  // Hacer disponible la función al botón
  window.sendMessage = sendMessage;
});
