document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Página cargada completamente.");

  async function sendMessage() {
  const input = document.getElementById("user-input");
  const message = input.value.trim();
  if (!message) return;

  addMessage("Tú", message);
  input.value = "";

  // 🟣 Mostrar animación de "Yuki escribiendo"
  const typingIndicator = document.createElement("div");
  typingIndicator.classList.add("typing-indicator");
  typingIndicator.innerHTML = `
    <span></span>
    <span></span>
    <span></span>
  `;
  const messages = document.getElementById("messages");
  messages.appendChild(typingIndicator);
  messages.scrollTop = messages.scrollHeight;
function typeMessage(sender, text, speed = 20) {
  const messages = document.getElementById("messages");
  const div = document.createElement("div");
  div.classList.add("yuki-message");
  div.textContent = `${sender}: `;
  messages.appendChild(div);

  let i = 0;
  function typeNext() {
    if (i < text.length) {
      div.textContent += text.charAt(i);
      i++;
      setTimeout(typeNext, speed);
      messages.scrollTop = messages.scrollHeight; // autoscroll
    }
  }
  typeNext();
}

  try {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  const data = await response.json();

  // 🔵 Eliminar animación al recibir respuesta
  typingIndicator.remove();

  // 💬 Mostrar respuesta con animación de tipeo
  typeMessage("YUKI.N>", data.reply);
} catch (error) {
  typingIndicator.remove();
  console.error("❌ Error en fetch:", error);
  addMessage("YUKI.N>", "Lo siento, no pude sincronizarme con la entidad de datos integrados.");
}

}


  window.sendMessage = sendMessage; // 👈 Esto la expone al botón del HTML

  function addMessage(sender, text) {
    const messages = document.getElementById("messages");
    const div = document.createElement("div");
    div.textContent = `${sender}: ${text}`;
    messages.appendChild(div);
  }
});
