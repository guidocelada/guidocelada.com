const year = document.querySelector("#year");
if (year) {
  year.textContent = new Date().getFullYear();
}

const canvas = document.querySelector("#signal-canvas");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canvas && !reducedMotion) {
  const context = canvas.getContext("2d");
  const points = [];
  let width = 0;
  let height = 0;
  let animationFrame = 0;

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function seedPoints() {
    const pointCount = width < 520 ? 28 : 56;
    points.length = 0;
    for (let index = 0; index < pointCount; index += 1) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: 0.22 + Math.random() * 0.85,
        radius: 1 + Math.random() * 2.4,
        hue: Math.random() > 0.62 ? "accent" : "primary",
      });
    }
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    context.lineWidth = 1;

    for (let i = 0; i < points.length; i += 1) {
      const point = points[i];
      point.y -= point.speed;
      point.x += Math.sin((point.y + i * 12) * 0.012) * 0.25;

      if (point.y < -20) {
        point.y = height + 20;
        point.x = Math.random() * width;
      }

      context.beginPath();
      context.fillStyle =
        point.hue === "accent" ? "oklch(0.78 0.15 194 / 0.8)" : "oklch(0.65 0.21 13.5 / 0.72)";
      context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
      context.fill();

      for (let j = i + 1; j < points.length; j += 1) {
        const next = points[j];
        const distance = Math.hypot(point.x - next.x, point.y - next.y);
        if (distance < 150) {
          context.beginPath();
          context.strokeStyle = `oklch(0.78 0.15 194 / ${0.22 * (1 - distance / 150)})`;
          context.moveTo(point.x, point.y);
          context.lineTo(next.x, next.y);
          context.stroke();
        }
      }
    }

    animationFrame = window.requestAnimationFrame(draw);
  }

  resize();
  seedPoints();
  draw();

  window.addEventListener("resize", () => {
    window.cancelAnimationFrame(animationFrame);
    resize();
    seedPoints();
    draw();
  });
}
