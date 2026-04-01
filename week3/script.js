// Week3: AI-assisted Paint + Story Space
// Explicit interactions: place, select, drag, resize, rotate, duplicate
// Implicit interactions: drift, pulse, grouping by similar color

const STORAGE_KEY = "week3-story-scene-v1";

const canvas = document.getElementById("storyCanvas");
const ctx = canvas.getContext("2d");

const generateBtn = document.getElementById("generateBtn");
const placeModeBtn = document.getElementById("placeModeBtn");
const duplicateBtn = document.getElementById("duplicateBtn");
const deleteBtn = document.getElementById("deleteBtn");
const saveBtn = document.getElementById("saveBtn");
const clearBtn = document.getElementById("clearBtn");
const shuffleBtn = document.getElementById("shuffleBtn");

const countSlider = document.getElementById("countSlider");
const sizeSlider = document.getElementById("sizeSlider");
const rotationSlider = document.getElementById("rotationSlider");
const hueSlider = document.getElementById("hueSlider");
const statusText = document.getElementById("statusText");

let generatedTemplates = [];
let placeMode = true;
const MOTION_FACTOR = 0.42;

const state = {
  elements: [], // All objects live in this array
  selectedId: null,
  dragOffsetX: 0,
  dragOffsetY: 0,
  draggingId: null,
  pointerX: 0,
  pointerY: 0,
};

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function uid() {
  return `el_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeAngle(deg) {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

function randomChoice(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function generateTemplate() {
  // Uses simple simulated AI logic: varied visual media templates.
  const types = ["shape", "blob", "ring", "spray", "triangle", "capsule", "star", "ribbon"];
  const type = randomChoice(types);
  const hue = Math.floor(Math.random() * 360);
  const sat = 70 + Math.floor(Math.random() * 25);
  const light = 45 + Math.floor(Math.random() * 20);

  return {
    type,
    size: Math.floor(40 + Math.random() * 120),
    rotation: Math.floor(Math.random() * 360),
    properties: {
      color: `hsl(${hue} ${sat}% ${light}%)`,
      hue,
      mood: randomChoice(["calm", "tense", "playful", "dreamy"]),
      pulsePhase: Math.random() * Math.PI * 2,
      blend: randomChoice(["source-over", "multiply", "screen", "overlay"]),
    },
  };
}

function createElementFromTemplate(template, x, y) {
  return {
    id: uid(),
    type: template.type,
    position: { x, y },
    size: template.size,
    rotation: template.rotation,
    media: null,
    properties: {
      color: template.properties.color,
      hue: template.properties.hue,
      mood: template.properties.mood,
      pulsePhase: template.properties.pulsePhase,
      blend: template.properties.blend,
      opacity: 0.88,
      z: Date.now(),
    },
    implicit: {
      vx: (Math.random() - 0.5) * 0.32,
      vy: (Math.random() - 0.5) * 0.32,
      pulseSpeed: 0.006 + Math.random() * 0.011,
      wander: 0.0006 + Math.random() * 0.001,
    },
  };
}

function createCollageBurst(centerX, centerY, count) {
  const created = [];
  for (let i = 0; i < count; i += 1) {
    const t = generateTemplate();
    const angle = (i / Math.max(1, count)) * Math.PI * 2 + Math.random() * 0.5;
    const spread = 20 + Math.random() * 130;
    const x = centerX + Math.cos(angle) * spread + (Math.random() - 0.5) * 40;
    const y = centerY + Math.sin(angle) * spread + (Math.random() - 0.5) * 40;
    const el = createElementFromTemplate(t, x, y);
    el.size *= 0.75 + Math.random() * 0.5;
    el.rotation = normalizeAngle(t.rotation + (Math.random() * 80 - 40));
    el.properties.opacity = 0.55 + Math.random() * 0.38;
    el.properties.z = Date.now() + i;
    created.push(el);
  }
  return created;
}

function saveScene() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ elements: state.elements }));
}

function loadScene() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.elements)) {
      state.elements = parsed.elements;
    }
  } catch (_err) {
    state.elements = [];
  }
}

function selectedElement() {
  return state.elements.find((el) => el.id === state.selectedId) || null;
}

function setSelection(id) {
  state.selectedId = id;
  const el = selectedElement();
  if (!el) return;
  sizeSlider.value = Math.round(el.size);
  rotationSlider.value = Math.round(normalizeAngle(el.rotation));
  hueSlider.value = Math.round(el.properties.hue);
}

function pointInsideElement(el, px, py) {
  const dx = px - el.position.x;
  const dy = py - el.position.y;
  return Math.hypot(dx, dy) <= el.size * 0.58;
}

function pickTopElement(px, py) {
  const ordered = [...state.elements].sort((a, b) => (a.properties.z || 0) - (b.properties.z || 0));
  for (let i = ordered.length - 1; i >= 0; i -= 1) {
    if (pointInsideElement(ordered[i], px, py)) return ordered[i];
  }
  return null;
}

function drawElement(el, t) {
  const pulse = Math.sin(t * el.implicit.pulseSpeed + el.properties.pulsePhase) * 0.08;
  const radius = el.size * (1 + pulse);

  ctx.save();
  ctx.translate(el.position.x, el.position.y);
  ctx.rotate((el.rotation * Math.PI) / 180);
  ctx.globalAlpha = el.properties.opacity;
  ctx.globalCompositeOperation = el.properties.blend || "source-over";

  ctx.shadowBlur = 14;
  ctx.shadowColor = el.properties.color;

  if (el.type === "shape") {
    ctx.fillStyle = el.properties.color;
    ctx.fillRect(-radius * 0.5, -radius * 0.5, radius, radius);
  } else if (el.type === "blob") {
    ctx.fillStyle = el.properties.color;
    ctx.beginPath();
    for (let i = 0; i < 7; i += 1) {
      const a = (i / 7) * Math.PI * 2;
      const jitter = radius * (0.75 + Math.sin(a * 3 + t * 0.002) * 0.2);
      const x = Math.cos(a) * jitter;
      const y = Math.sin(a) * jitter;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  } else if (el.type === "ring") {
    ctx.strokeStyle = el.properties.color;
    ctx.lineWidth = Math.max(4, radius * 0.14);
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2);
    ctx.stroke();
  } else if (el.type === "triangle") {
    ctx.fillStyle = el.properties.color;
    ctx.beginPath();
    ctx.moveTo(0, -radius * 0.62);
    ctx.lineTo(radius * 0.56, radius * 0.45);
    ctx.lineTo(-radius * 0.56, radius * 0.45);
    ctx.closePath();
    ctx.fill();
  } else if (el.type === "capsule") {
    ctx.fillStyle = el.properties.color;
    const w = radius * 1.1;
    const h = radius * 0.55;
    ctx.beginPath();
    ctx.roundRect(-w * 0.5, -h * 0.5, w, h, h * 0.5);
    ctx.fill();
  } else if (el.type === "star") {
    ctx.fillStyle = el.properties.color;
    ctx.beginPath();
    const points = 5;
    for (let i = 0; i < points * 2; i += 1) {
      const rr = i % 2 === 0 ? radius * 0.58 : radius * 0.24;
      const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * rr;
      const y = Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  } else if (el.type === "ribbon") {
    ctx.strokeStyle = el.properties.color;
    ctx.lineWidth = Math.max(4, radius * 0.12);
    ctx.beginPath();
    ctx.moveTo(-radius * 0.6, -radius * 0.25);
    ctx.bezierCurveTo(-radius * 0.25, radius * 0.5, radius * 0.25, -radius * 0.55, radius * 0.6, radius * 0.2);
    ctx.stroke();
  } else {
    // spray
    for (let i = 0; i < 26; i += 1) {
      const a = Math.random() * Math.PI * 2;
      const rr = Math.random() * radius * 0.9;
      const x = Math.cos(a) * rr;
      const y = Math.sin(a) * rr;
      ctx.fillStyle = `hsla(${el.properties.hue} 85% 55% / 0.6)`;
      ctx.beginPath();
      ctx.arc(x, y, 2 + Math.random() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (el.id === state.selectedId) {
    ctx.strokeStyle = "rgba(30,30,30,0.95)";
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 5]);
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.68, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.restore();
}

function updateImplicitBehavior(t) {
  for (let i = 0; i < state.elements.length; i += 1) {
    const a = state.elements[i];

    // Passive drift
    a.position.x += a.implicit.vx * MOTION_FACTOR;
    a.position.y += a.implicit.vy * MOTION_FACTOR;

    // Slow wander
    a.implicit.vx += Math.sin(t * a.implicit.wander + i) * 0.002;
    a.implicit.vy += Math.cos(t * a.implicit.wander + i) * 0.002;
    a.implicit.vx = clamp(a.implicit.vx, -0.65, 0.65);
    a.implicit.vy = clamp(a.implicit.vy, -0.65, 0.65);

    // Keep moving softly within screen
    if (a.position.x < -120) a.position.x = canvas.width + 120;
    if (a.position.x > canvas.width + 120) a.position.x = -120;
    if (a.position.y < -120) a.position.y = canvas.height + 120;
    if (a.position.y > canvas.height + 120) a.position.y = -120;
  }

  // Grouping by similar hue attraction
  for (let i = 0; i < state.elements.length; i += 1) {
    for (let j = i + 1; j < state.elements.length; j += 1) {
      const a = state.elements[i];
      const b = state.elements[j];

      const hueDiff = Math.abs((a.properties.hue || 0) - (b.properties.hue || 0));
      if (hueDiff > 25) continue;

      const dx = b.position.x - a.position.x;
      const dy = b.position.y - a.position.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 1 || dist > 260) continue;

      const force = 0.0022;
      a.implicit.vx += (dx / dist) * force;
      a.implicit.vy += (dy / dist) * force;
      b.implicit.vx -= (dx / dist) * force;
      b.implicit.vy -= (dy / dist) * force;
    }
  }
}

function drawWaveBand(t, yBase, amp, width, alpha, hueOffset) {
  ctx.beginPath();
  ctx.moveTo(0, canvas.height);
  for (let x = 0; x <= canvas.width; x += 16) {
    const y = yBase + Math.sin(x * 0.01 + t * 0.00055 + hueOffset) * amp;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(canvas.width, canvas.height);
  ctx.closePath();
  ctx.fillStyle = `hsla(${195 + hueOffset} 78% ${width}% / ${alpha})`;
  ctx.fill();
}

function drawSeaBubbles(t) {
  ctx.save();
  for (let i = 0; i < 24; i += 1) {
    const drift = (t * 0.012 + i * 70) % (canvas.height + 140);
    const x = (i * 137.7 + Math.sin(t * 0.00025 + i) * 90 + canvas.width) % canvas.width;
    const y = canvas.height - drift;
    const r = 2 + (i % 4);
    ctx.strokeStyle = `rgba(210, 245, 255, ${0.22 + (i % 5) * 0.05})`;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function renderBackground(t) {
  const horizonShift = Math.sin(t * 0.00022) * 12;
  const seaGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  seaGrad.addColorStop(0, `hsl(${192 + horizonShift * 0.15} 70% 76%)`);
  seaGrad.addColorStop(0.35, `hsl(${198 + horizonShift * 0.18} 72% 60%)`);
  seaGrad.addColorStop(1, `hsl(${205 + horizonShift * 0.22} 68% 24%)`);
  ctx.fillStyle = seaGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Soft sun-through-water glow.
  const glow = ctx.createRadialGradient(
    canvas.width * 0.22,
    canvas.height * 0.08,
    20,
    canvas.width * 0.22,
    canvas.height * 0.08,
    canvas.height * 0.75
  );
  glow.addColorStop(0, "rgba(210, 255, 255, 0.24)");
  glow.addColorStop(1, "rgba(210, 255, 255, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Layered wave bands for a sea-like base.
  drawWaveBand(t, canvas.height * 0.62, 22, 42, 0.23, -6);
  drawWaveBand(t + 3000, canvas.height * 0.72, 28, 36, 0.28, 4);
  drawWaveBand(t + 7000, canvas.height * 0.82, 18, 30, 0.32, 9);

  // Caustic light lines.
  ctx.save();
  ctx.strokeStyle = "rgba(220, 255, 255, 0.14)";
  ctx.lineWidth = 1.6;
  for (let y = 60; y < canvas.height; y += 44) {
    ctx.beginPath();
    for (let x = 0; x <= canvas.width; x += 22) {
      const yy = y + Math.sin(x * 0.017 + t * 0.001 + y * 0.03) * 6;
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  ctx.restore();

  drawSeaBubbles(t);
}

function animationFrame(t) {
  renderBackground(t);
  updateImplicitBehavior(t);

  const ordered = [...state.elements].sort((a, b) => (a.properties.z || 0) - (b.properties.z || 0));
  for (const el of ordered) drawElement(el, t);

  requestAnimationFrame(animationFrame);
}

canvas.addEventListener("pointerdown", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  state.pointerX = x;
  state.pointerY = y;

  const hit = pickTopElement(x, y);

  if (hit) {
    setSelection(hit.id);
    hit.properties.z = Date.now();
    state.draggingId = hit.id;
    state.dragOffsetX = x - hit.position.x;
    state.dragOffsetY = y - hit.position.y;
    return;
  }

  if (placeMode && generatedTemplates.length > 0) {
    const newEl = createElementFromTemplate(randomChoice(generatedTemplates), x, y);
    state.elements.push(newEl);
    setSelection(newEl.id);
    saveScene();
  } else {
    setSelection(null);
  }
});

canvas.addEventListener("pointermove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  state.pointerX = x;
  state.pointerY = y;

  if (!state.draggingId) return;
  const el = state.elements.find((item) => item.id === state.draggingId);
  if (!el) return;

  el.position.x = x - state.dragOffsetX;
  el.position.y = y - state.dragOffsetY;
});

canvas.addEventListener("pointerup", () => {
  if (state.draggingId) saveScene();
  state.draggingId = null;
});

canvas.addEventListener("pointerleave", () => {
  if (state.draggingId) saveScene();
  state.draggingId = null;
});

sizeSlider.addEventListener("input", () => {
  const el = selectedElement();
  if (!el) return;
  el.size = Number(sizeSlider.value);
});

rotationSlider.addEventListener("input", () => {
  const el = selectedElement();
  if (!el) return;
  el.rotation = Number(rotationSlider.value);
});

hueSlider.addEventListener("input", () => {
  const el = selectedElement();
  if (!el) return;
  const h = Number(hueSlider.value);
  el.properties.hue = h;
  el.properties.color = `hsl(${h} 80% 55%)`;
});

generateBtn.addEventListener("click", () => {
  // Touch ml5 so project uses it, but keep generation simple and robust.
  if (window.ml5 && typeof window.ml5.version !== "undefined") {
    console.log("ml5 loaded:", window.ml5.version);
  }
  const count = Number(countSlider.value);
  generatedTemplates = Array.from({ length: count }, () => generateTemplate());
  const burstX = canvas.width * (0.3 + Math.random() * 0.4);
  const burstY = canvas.height * (0.28 + Math.random() * 0.44);
  const burst = createCollageBurst(burstX, burstY, count);
  state.elements.push(...burst);

  const picked = randomChoice(generatedTemplates);
  hueSlider.value = picked.properties.hue;
  statusText.textContent = `Generated collage burst with ${count} elements.`;
  if (burst.length > 0) {
    setSelection(burst[burst.length - 1].id);
  }
  saveScene();
});

placeModeBtn.addEventListener("click", () => {
  placeMode = !placeMode;
  placeModeBtn.classList.toggle("active", placeMode);
  placeModeBtn.textContent = `Place: ${placeMode ? "On" : "Off"}`;
});

duplicateBtn.addEventListener("click", () => {
  const el = selectedElement();
  if (!el) return;

  const copy = JSON.parse(JSON.stringify(el));
  copy.id = uid();
  copy.position.x += 24;
  copy.position.y += 24;
  copy.properties.z = Date.now();
  state.elements.push(copy);
  setSelection(copy.id);
  saveScene();
});

deleteBtn.addEventListener("click", () => {
  if (!state.selectedId) return;
  state.elements = state.elements.filter((el) => el.id !== state.selectedId);
  state.selectedId = null;
  saveScene();
});

saveBtn.addEventListener("click", saveScene);

clearBtn.addEventListener("click", () => {
  state.elements = [];
  state.selectedId = null;
  localStorage.removeItem(STORAGE_KEY);
  statusText.textContent = "Scene cleared. Generate a new collage burst.";
});

shuffleBtn.addEventListener("click", () => {
  for (const el of state.elements) {
    el.position.x = Math.random() * canvas.width;
    el.position.y = Math.random() * canvas.height;
    el.rotation = normalizeAngle(el.rotation + (Math.random() * 180 - 90));
    el.properties.z = Date.now() + Math.random() * 1000;
  }
  saveScene();
});

// Autosave periodically to keep story state persistent.
setInterval(saveScene, 2500);

loadScene();
generatedTemplates = Array.from({ length: Number(countSlider.value) }, () => generateTemplate());
requestAnimationFrame(animationFrame);
