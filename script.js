const year = document.querySelector("#year");
if (year) {
  year.textContent = new Date().getFullYear();
}

const hero = document.querySelector(".hero");
const canvas = document.querySelector("#signal-canvas");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (hero && hasFinePointer) {
  hero.addEventListener("pointermove", (event) => {
    const bounds = hero.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    hero.style.setProperty("--cursor-x", `${x}%`);
    hero.style.setProperty("--cursor-y", `${y}%`);
  });
}

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
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function seedPoints() {
    const pointCount = width < 520 ? 18 : 34;
    points.length = 0;

    for (let index = 0; index < pointCount; index += 1) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height,
        originX: Math.random() * width,
        speed: 0.08 + Math.random() * 0.22,
        radius: 0.8 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.72 ? "coral" : "cyan",
      });
    }
  }

  function drawPoint(point, index) {
    point.y -= point.speed;
    point.x += Math.sin(point.phase + point.y * 0.006 + index) * 0.08;

    if (point.y < -16) {
      point.y = height + 16;
      point.x = Math.random() * width;
      point.originX = point.x;
    }

    if (pointer.opacity > 0.01) {
      const dx = pointer.x - point.x;
      const dy = pointer.y - point.y;
      const distance = Math.hypot(dx, dy);

      if (distance < 190 && distance > 1) {
        const pull = (1 - distance / 190) * 0.035 * pointer.opacity;
        point.x += dx * pull;
        point.y += dy * pull;
      } else {
        point.x += (point.originX - point.x) * 0.0015;
      }
    }

    context.beginPath();
    context.fillStyle =
      point.color === "coral" ? "oklch(0.58 0.19 18 / 0.52)" : "oklch(0.57 0.13 195 / 0.5)";
    context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
    context.fill();
  }

  function drawConnections() {
    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        const distance = Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y);

        if (distance < 125) {
          context.beginPath();
          context.strokeStyle = `oklch(0.38 0.055 205 / ${0.13 * (1 - distance / 125)})`;
          context.moveTo(points[i].x, points[i].y);
          context.lineTo(points[j].x, points[j].y);
          context.stroke();
        }
      }
    }
  }

  function drawPointerConnections() {
    if (pointer.opacity <= 0.01) return;

    for (const point of points) {
      const distance = Math.hypot(point.x - pointer.x, point.y - pointer.y);

      if (distance < 185) {
        context.beginPath();
        context.strokeStyle = `oklch(0.42 0.11 195 / ${
          pointer.opacity * 0.28 * (1 - distance / 185)
        })`;
        context.moveTo(pointer.x, pointer.y);
        context.lineTo(point.x, point.y);
        context.stroke();
      }
    }

    context.save();
    context.globalAlpha = pointer.opacity;
    context.strokeStyle = "oklch(0.5 0.14 195 / 0.5)";
    context.lineWidth = 1;
    context.beginPath();
    context.arc(pointer.x, pointer.y, 10, 0, Math.PI * 2);
    context.stroke();
    context.restore();
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    context.lineWidth = 1;

    pointer.x += (pointer.targetX - pointer.x) * 0.12;
    pointer.y += (pointer.targetY - pointer.y) * 0.12;
    pointer.opacity += ((pointer.active ? 1 : 0) - pointer.opacity) * 0.1;

    points.forEach(drawPoint);
    drawConnections();
    drawPointerConnections();
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

  if (hasFinePointer && hero) {
    hero.addEventListener("pointermove", (event) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.targetX = event.clientX - bounds.left;
      pointer.targetY = event.clientY - bounds.top;

      if (!pointer.active) {
        pointer.x = pointer.targetX;
        pointer.y = pointer.targetY;
      }

      pointer.active = true;
    });

    hero.addEventListener("pointerleave", () => {
      pointer.active = false;
    });
  }
}
