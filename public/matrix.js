// matrix.js — versión "Yuki Data Flow"
const canvas = document.getElementById("matrixBackground");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789アイウエオカキクケコΣΩΔλπβΦΨΞ";
const fontSize = 16;
const particles = [];
const maxParticles = 120; // cantidad de caracteres visibles
const yukiColor = "#C5A3FF"; // tono lavanda claro
const fadeSpeed = 0.02; // velocidad del desvanecimiento

// Cada partícula representa un carácter en pantalla
class Particle {
  constructor(x, y, char) {
    this.x = x;
    this.y = y;
    this.char = char;
    this.alpha = Math.random(); // opacidad inicial
    this.fadeIn = Math.random() > 0.5; // dirección del brillo
    this.speed = 0.15 + Math.random() * 0.25; // velocidad de caída (nieve)
    this.size = fontSize + Math.random() * 4;
  }

  update() {
    // Fase 1: respiración (parpadeo)
    if (this.fadeIn) {
      this.alpha += fadeSpeed;
      if (this.alpha >= 1) this.fadeIn = false;
    } else {
      this.alpha -= fadeSpeed;
      if (this.alpha <= 0.1) this.fadeIn = true;
    }

    // Fase 2: caída suave (como nieve)
    this.y += this.speed;
    if (this.y > canvas.height) {
      this.y = -fontSize;
      this.x = Math.random() * canvas.width;
      this.char = letters.charAt(Math.floor(Math.random() * letters.length));
    }
  }

  draw() {
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = yukiColor;
    ctx.font = `${this.size}px monospace`;
    ctx.fillText(this.char, this.x, this.y);
    ctx.globalAlpha = 1;
  }
}

// Crear partículas iniciales
for (let i = 0; i < maxParticles; i++) {
  const x = Math.random() * canvas.width;
  const y = Math.random() * canvas.height;
  const char = letters.charAt(Math.floor(Math.random() * letters.length));
  particles.push(new Particle(x, y, char));
}

function animate() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let p of particles) {
    p.update();
    p.draw();
  }

  requestAnimationFrame(animate);
}

animate();

// Reajuste al cambiar tamaño de ventana
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

