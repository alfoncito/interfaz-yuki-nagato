import "./matrix.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Interfaz de Yuki lista.");

  let messages = document.getElementById("messages"),
    typingBox = document.createElement("div"),
    cursor;

  // === ÁREA DE TIPEO CON CURSOR ===
  typingBox.id = "typing-area";
  typingBox.innerHTML = `<span id="typing-text"></span><span class="cursor"></span>`;
  messages.appendChild(typingBox);
  cursor = document.querySelector(".cursor");
  document.getElementById("user-input")?.focus();

  // === FUNCIÓN DE TIPEO NATURAL ===
  async function typeMessage(element, message) {
    element.innerHTML = "";
    cursor.style.opacity = 0; // Ocultar cursor durante escritura

    for (let i = 0; i < message.length; i++) {
      let delay = 40 + Math.random() * 60;

      element.innerHTML += message[i];
      await wait(delay);
      if (Math.random() < 0.02) {
        let longDelay = 400 + Math.random() * 300;

        await wait(longDelay);
      }
    }

    cursor.style.opacity = 1; // Mostrar cursor al final
  }

  // === FUNCIÓN PARA AÑADIR MENSAJES ===
  const renderMessage = async (sender, text, opts = {}) => {
    let { typing } = Object.assign({ typing: true }, opts),
      msgCloud = document.createElement("div");

    msgCloud.classList.add("message");
    messages.appendChild(msgCloud);
    messages.scrollTop = messages.scrollHeight;

    if (sender === "you") {
      msgCloud.classList.add("user-message");
      msgCloud.textContent = `Tú: ${text}`;
    } else {
      msgCloud.classList.add("yuki-message");
      if (typing) await typeMessage(msgCloud, `YUKI.N>: ${text}`);
      else msgCloud.textContent = `YUKI.N: ${text}`;
    }

    messages.scrollTop = messages.scrollHeight;
    msgCloud.style.opacity = 0;
    setTimeout(() => (msgCloud.style.opacity = 1), 50);
  };

  // Al cargar la página, restaurar historial
  window.addEventListener("load", () => {
    let history = getHistory();

    history.forEach((msg) =>
      renderMessage(msg.role, msg.content, { typing: false }),
    );
  });

  // === INDICADOR DE "PENSANDO" ===
  function showThinkingCursor() {
    let thinking = document.createElement("div");

    thinking.classList.add("thinking-indicator");
    thinking.innerHTML = `<span class="thinking-cursor">_</span>`;
    messages.appendChild(thinking);

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
    let userInput = document.getElementById("user-input"),
      message = userInput.value.trim(),
      thinkingCursor;

    if (!message) return;

    saveMessage("you", message);
    await renderMessage("you", message);
    thinkingCursor = showThinkingCursor();
    userInput.value = "";

    try {
      let response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat: getHistory().filter(({ error }) => error === false),
          }),
        }),
        data = await response.json();

      thinkingCursor.remove();
      if (!response.ok) throw new Error(data.error);
      saveMessage("yuki", data.reply);
      await renderMessage("yuki", data.reply);

      // 🔊 Reproduce la voz desde Hugging Face
      // await playYukiVoice(data.reply);
    } catch (err) {
      console.error("❌ Error en /api/chat:", err);
      thinkingCursor?.remove();
      historyErrorPrevLog();
      saveMessage("yuki", err.message ?? "Error", true);
      await renderMessage("yuki", err.message ?? "Error");
    }
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
});

const wait = (msTime) => {
  return new Promise((res) => {
    setTimeout(res, msTime);
  });
};

const saveMessage = (role, content, error = false) => {
  let history = getHistory();

  history.push({ role, content, error });
  sessionStorage.setItem("chatHistory", JSON.stringify(history));
};

const getHistory = () => {
  return JSON.parse(sessionStorage.getItem("chatHistory") ?? "[]");
};

const historyErrorPrevLog = () => {
  let history = getHistory(),
    lastI = history.length - 1;

  history[lastI].error = true;
  sessionStorage.setItem("chatHistory", JSON.stringify(history));
};
