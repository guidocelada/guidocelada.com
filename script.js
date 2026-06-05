const year = document.querySelector("#year");
if (year) {
  year.textContent = new Date().getFullYear();
}

const canvas = document.querySelector("#signal-canvas");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (canvas && !reducedMotion) {
  const context = canvas.getContext("2d");
  const points = [];
  const pointer = {
    active: false,
    opacity: 0,
    targetX: 0,
    targetY: 0,
    x: 0,
    y: 0,
  };
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

    pointer.x += (pointer.targetX - pointer.x) * 0.14;
    pointer.y += (pointer.targetY - pointer.y) * 0.14;
    pointer.opacity += ((pointer.active ? 1 : 0) - pointer.opacity) * 0.12;

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

      if (pointer.opacity > 0.01) {
        const pointerDistance = Math.hypot(point.x - pointer.x, point.y - pointer.y);
        if (pointerDistance < 210) {
          context.beginPath();
          context.strokeStyle = `oklch(0.82 0.17 194 / ${
            pointer.opacity * 0.42 * (1 - pointerDistance / 210)
          })`;
          context.moveTo(pointer.x, pointer.y);
          context.lineTo(point.x, point.y);
          context.stroke();
        }
      }
    }

    if (pointer.opacity > 0.01) {
      context.save();
      context.globalAlpha = pointer.opacity;
      context.strokeStyle = "oklch(0.82 0.17 194 / 0.78)";
      context.lineWidth = 1;
      context.beginPath();
      context.arc(pointer.x, pointer.y, 8, 0, Math.PI * 2);
      context.stroke();
      context.beginPath();
      context.moveTo(pointer.x - 13, pointer.y);
      context.lineTo(pointer.x - 6, pointer.y);
      context.moveTo(pointer.x + 6, pointer.y);
      context.lineTo(pointer.x + 13, pointer.y);
      context.moveTo(pointer.x, pointer.y - 13);
      context.lineTo(pointer.x, pointer.y - 6);
      context.moveTo(pointer.x, pointer.y + 6);
      context.lineTo(pointer.x, pointer.y + 13);
      context.stroke();
      context.restore();
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

  if (hasFinePointer) {
    canvas.parentElement.addEventListener("pointermove", (event) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.targetX = event.clientX - bounds.left;
      pointer.targetY = event.clientY - bounds.top;

      if (!pointer.active) {
        pointer.x = pointer.targetX;
        pointer.y = pointer.targetY;
      }

      pointer.active = true;
    });

    canvas.parentElement.addEventListener("pointerleave", () => {
      pointer.active = false;
    });
  }
}
