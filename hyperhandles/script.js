// HyperHandles: spatial social interface prototype
// Beginner-friendly: plain JS + canvas + localStorage

const STORAGE_KEY = "hyperhandles-items-v1";
const USER_ID = "me-user-node";

const canvas = document.getElementById("spaceCanvas");
const ctx = canvas.getContext("2d");

const creatorInput = document.getElementById("creatorInput");
const seedBtn = document.getElementById("seedBtn");
const bloomBtn = document.getElementById("bloomBtn");
const pruneBtn = document.getElementById("pruneBtn");
const selectedInfo = document.getElementById("selectedInfo");
const hoverTip = document.getElementById("hoverTip");

const state = {
  items: [], // Each object: id, text/image, embedding, x, y
  selectedId: null,
  hoveredId: null,
  showLinks: true,
  camera: {
    x: 0,
    y: 0,
    zoom: 1,
    targetX: 0,
    targetY: 0,
    targetZoom: 1,
  },
  pan: {
    active: false,
    startScreenX: 0,
    startScreenY: 0,
    startCamX: 0,
    startCamY: 0,
  },
  mouse: {
    x: 0,
    y: 0,
  },
  frameCount: 0,
};

let saveTimer = null;
let inputTimer = null;

function requestSave() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveItems();
    saveTimer = null;
  }, 180);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function uid() {
  return `item_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

// Simple deterministic-ish embedding from text + a little noise.
function embeddingFromText(text, dimensions = 8) {
  const values = [];
  let seed = 0;
  for (let i = 0; i < text.length; i += 1) {
    seed += text.charCodeAt(i) * (i + 1);
  }

  for (let i = 0; i < dimensions; i += 1) {
    const v = Math.sin(seed * (i + 1) * 0.013) + Math.cos(seed * (i + 2) * 0.007);
    const noise = (Math.random() - 0.5) * 0.24;
    values.push(v + noise);
  }

  return values;
}

function randomEmbedding(min = 5, max = 10) {
  const d = Math.floor(min + Math.random() * (max - min + 1));
  return Array.from({ length: d }, () => (Math.random() - 0.5) * 2);
}

// UMAP-like simplification: map embedding dimensions into x/y.
function embeddingToPosition(embedding) {
  const half = Math.floor(embedding.length / 2);
  const left = embedding.slice(0, half);
  const right = embedding.slice(half);
  const avgLeft = left.reduce((a, b) => a + b, 0) / Math.max(1, left.length);
  const avgRight = right.reduce((a, b) => a + b, 0) / Math.max(1, right.length);

  const spread = 680;
  return {
    x: avgLeft * spread,
    y: avgRight * spread,
  };
}

function inferType(text) {
  const lower = text.toLowerCase();
  if (lower.includes("image") || lower.includes("photo") || lower.includes("visual")) {
    return "image";
  }
  return "text";
}

function moodFromEmbedding(embedding) {
  const score = embedding.reduce((a, b) => a + b, 0) / embedding.length;
  if (score > 0.2) return "bright";
  if (score < -0.2) return "deep";
  return "neutral";
}

function createItem({ id = uid(), text = "", image = null, embedding = randomEmbedding(), isUser = false }) {
  const pos = embeddingToPosition(embedding);
  return {
    id,
    text,
    image,
    embedding,
    x: pos.x,
    y: pos.y,
    targetX: pos.x,
    targetY: pos.y,
    type: image ? "image" : inferType(text),
    mood: moodFromEmbedding(embedding),
    radius: isUser ? 17 : 12 + Math.random() * 6,
    isUser,
    driftPhase: Math.random() * Math.PI * 2,
    driftSpeed: 0.00015 + Math.random() * 0.00022,
    driftRadius: 0.8 + Math.random() * 2.2,
  };
}

function saveItems() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
}

function loadItems() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;

    state.items = parsed.slice(-280).map((item) => ({
      ...item,
      targetX: typeof item.targetX === "number" ? item.targetX : item.x,
      targetY: typeof item.targetY === "number" ? item.targetY : item.y,
      radius: typeof item.radius === "number" ? item.radius : 14,
      isUser: item.id === USER_ID || !!item.isUser,
      type: item.type || (item.image ? "image" : "text"),
      mood: item.mood || "neutral",
      driftPhase: typeof item.driftPhase === "number" ? item.driftPhase : Math.random() * Math.PI * 2,
      driftSpeed: typeof item.driftSpeed === "number" ? item.driftSpeed : 0.00015 + Math.random() * 0.00022,
      driftRadius: typeof item.driftRadius === "number" ? item.driftRadius : 0.8 + Math.random() * 2.2,
    }));
  } catch (_err) {
    state.items = [];
  }
}

function ensureUserNode() {
  let user = state.items.find((item) => item.id === USER_ID);

  if (!user) {
    user = createItem({
      id: USER_ID,
      text: "I am exploring idea-space",
      embedding: embeddingFromText("I am exploring idea-space"),
      isUser: true,
    });
    state.items.push(user);
  }

  creatorInput.value = user.text || "";
}

function simulatedContentText() {
  const starts = ["A post about", "A tiny thought on", "A sketch of", "A remix of", "An idea around"];
  const mids = ["ocean dreams", "community", "glitch art", "quiet mornings", "future cities", "memories"];
  const ends = ["with bright mood", "in mixed tones", "for curious people", "for playful minds", "with visual notes"];
  return `${randomFrom(starts)} ${randomFrom(mids)} ${randomFrom(ends)}`;
}

function addSimulatedItem() {
  const asImage = Math.random() > 0.6;

  if (asImage) {
    const hue = Math.floor(Math.random() * 360);
    const imageToken = `generated-visual-h${hue}`;
    const text = `Simulated visual card ${Math.floor(Math.random() * 999)}`;
    const embedding = randomEmbedding();
    state.items.push(
      createItem({
        text,
        image: imageToken,
        embedding,
      })
    );
    return;
  }

  const text = simulatedContentText();
  const embedding = embeddingFromText(text, 8);
  state.items.push(createItem({ text, embedding }));
}

function worldToScreen(x, y) {
  return {
    x: (x - state.camera.x) * state.camera.zoom + canvas.width / 2,
    y: (y - state.camera.y) * state.camera.zoom + canvas.height / 2,
  };
}

function screenToWorld(x, y) {
  return {
    x: (x - canvas.width / 2) / state.camera.zoom + state.camera.x,
    y: (y - canvas.height / 2) / state.camera.zoom + state.camera.y,
  };
}

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function nearestItems(item, count = 4) {
  return state.items
    .filter((it) => it.id !== item.id)
    .map((it) => ({ it, d: distance(item, it) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, count)
    .map((entry) => entry.it);
}

function itemById(id) {
  return state.items.find((item) => item.id === id) || null;
}

function colorForItem(item) {
  if (item.isUser) return "#ff2b7f";
  if (item.type === "image") return "#ff314f";
  return "#b31256";
}

function drawGrid() {
  if (state.items.length > 180) return;
  const spacing = 120 * state.camera.zoom;
  if (spacing < 30) return;

  ctx.save();
  ctx.strokeStyle = "rgba(255, 95, 150, 0.09)";
  ctx.lineWidth = 1;

  const offsetX = ((-state.camera.x * state.camera.zoom) % spacing + spacing) % spacing;
  const offsetY = ((-state.camera.y * state.camera.zoom) % spacing + spacing) % spacing;

  for (let x = offsetX; x < canvas.width; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = offsetY; y < canvas.height; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  ctx.restore();
}

function drawLeaf(x, y, angle, size) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = "rgba(116, 212, 128, 0.75)";
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 1.25, size * 0.68, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawConnections(t) {
  if (!state.showLinks) return;
  if (state.items.length > 120) return;
  if (state.frameCount % 2 !== 0) return;

  ctx.save();
  ctx.strokeStyle = "rgba(86, 170, 108, 0.35)";
  ctx.lineWidth = 1.4;

  for (let i = 0; i < state.items.length; i += 1) {
    const maxJ = Math.min(state.items.length, i + 18);
    for (let j = i + 1; j < maxJ; j += 1) {
      const a = state.items[i];
      const b = state.items[j];

      const d = distance(a, b);
      if (d > 230) continue;

      const sa = worldToScreen(a.x, a.y);
      const sb = worldToScreen(b.x, b.y);
      const alpha = clamp(0.2 - d / 1300, 0.03, 0.2);
      const dx = sb.x - sa.x;
      const dy = sb.y - sa.y;
      const angle = Math.atan2(dy, dx);
      const dist = Math.hypot(dx, dy);
      const bend = Math.sin(t * 0.001 + i * 0.7 + j * 0.4) * 6;
      const midX = (sa.x + sb.x) * 0.5 - Math.sin(angle) * bend;
      const midY = (sa.y + sb.y) * 0.5 + Math.cos(angle) * bend;
      ctx.strokeStyle = `rgba(86, 170, 108, ${alpha + 0.05})`;

      ctx.beginPath();
      ctx.moveTo(sa.x, sa.y);
      ctx.quadraticCurveTo(midX, midY, sb.x, sb.y);
      ctx.stroke();

      // Small leaves along the vine.
      if (dist > 55) {
        const t1 = 0.48;
        const lx1 = (1 - t1) * (1 - t1) * sa.x + 2 * (1 - t1) * t1 * midX + t1 * t1 * sb.x;
        const ly1 = (1 - t1) * (1 - t1) * sa.y + 2 * (1 - t1) * t1 * midY + t1 * t1 * sb.y;
        drawLeaf(lx1, ly1, angle + Math.PI / 2.3, 4.4);
      }
    }
  }

  ctx.restore();
}

function drawFlower(p, radius, color, selected) {
  ctx.save();
  ctx.translate(p.x, p.y);

  // Five petals around center.
  for (let i = 0; i < 5; i += 1) {
    const a = (i / 5) * Math.PI * 2;
    const px = Math.cos(a) * radius * 0.62;
    const py = Math.sin(a) * radius * 0.62;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(px, py, radius * 0.62, radius * 0.4, a, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 200, 220, 0.35)";
    ctx.beginPath();
    ctx.ellipse(px - radius * 0.12, py - radius * 0.09, radius * 0.22, radius * 0.14, a, 0, Math.PI * 2);
    ctx.fill();
  }

  // Flower center.
  ctx.fillStyle = "#ffd6e8";
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.33, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.beginPath();
  ctx.arc(-radius * 0.09, -radius * 0.09, radius * 0.1, 0, Math.PI * 2);
  ctx.fill();

  if (selected) {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, radius + 7, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawNodes(t) {
  const useShadows = state.items.length < 90;
  for (const item of state.items) {
    const p = worldToScreen(item.x, item.y);
    if (p.x < -120 || p.x > canvas.width + 120 || p.y < -120 || p.y > canvas.height + 120) continue;

    const base = colorForItem(item);
    const pulse = 1 + Math.sin(t * 0.001 + item.radius) * 0.05;
    const r = item.radius * state.camera.zoom * pulse;

    ctx.save();
    if (useShadows) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = base;
    }

    drawFlower(p, r, base, state.selectedId === item.id);

    ctx.restore();
  }
}

function drawSelectionNeighbors() {
  const selected = itemById(state.selectedId);
  if (!selected) return;

  const near = nearestItems(selected, 5);
  const ps = worldToScreen(selected.x, selected.y);

  ctx.save();
  ctx.strokeStyle = "rgba(255, 220, 240, 0.45)";
  ctx.lineWidth = 1.6;

  for (const n of near) {
    const pn = worldToScreen(n.x, n.y);
    ctx.beginPath();
    ctx.moveTo(ps.x, ps.y);
    ctx.lineTo(pn.x, pn.y);
    ctx.stroke();
  }

  ctx.restore();
}

function pickNode(screenX, screenY) {
  const world = screenToWorld(screenX, screenY);

  for (let i = state.items.length - 1; i >= 0; i -= 1) {
    const item = state.items[i];
    const d = Math.hypot(world.x - item.x, world.y - item.y);
    if (d <= item.radius + 6 / state.camera.zoom) return item;
  }
  return null;
}

function updateHoverTip() {
  const item = itemById(state.hoveredId);
  if (!item) {
    hoverTip.classList.add("hidden");
    return;
  }

  const p = worldToScreen(item.x, item.y);
  hoverTip.classList.remove("hidden");
  hoverTip.style.left = `${state.mouse.x + 14}px`;
  hoverTip.style.top = `${state.mouse.y + 14}px`;
  const content = item.text || item.image || "(empty)";
  hoverTip.textContent = content.slice(0, 120);

  if (p.x < -80 || p.x > canvas.width + 80 || p.y < -80 || p.y > canvas.height + 80) {
    hoverTip.classList.add("hidden");
  }
}

function updateInfoPanel() {
  const item = itemById(state.selectedId);
  if (!item) {
    selectedInfo.innerHTML = "<strong>No flower selected</strong><p>Click any flower to inspect it.</p>";
    return;
  }

  const content = item.text || item.image || "(empty)";
  const role = item.isUser ? "You" : "Simulated content";
  const embeddingPreview = item.embedding.slice(0, 6).map((v) => v.toFixed(2)).join(", ");

  selectedInfo.innerHTML = `
    <strong>${role}</strong>
    <p><b>Type:</b> ${item.type}</p>
    <p><b>Mood:</b> ${item.mood}</p>
    <p><b>Content:</b> ${content}</p>
    <p><b>Embedding:</b> [${embeddingPreview}${item.embedding.length > 6 ? ", ..." : ""}]</p>
    <p><b>Position:</b> (${item.x.toFixed(1)}, ${item.y.toFixed(1)})</p>
  `;
}

function smoothStep() {
  // Smooth camera transitions
  state.camera.x += (state.camera.targetX - state.camera.x) * 0.16;
  state.camera.y += (state.camera.targetY - state.camera.y) * 0.16;
  state.camera.zoom += (state.camera.targetZoom - state.camera.zoom) * 0.18;

  const t = performance.now();

  // Smooth node transitions to target positions
  for (const item of state.items) {
    // Very slow stroll motion on top of embedding position.
    const driftX = Math.cos(t * item.driftSpeed + item.driftPhase) * item.driftRadius;
    const driftY = Math.sin(t * item.driftSpeed * 0.9 + item.driftPhase * 1.1) * item.driftRadius;

    item.x += (item.targetX - item.x) * 0.1;
    item.y += (item.targetY - item.y) * 0.1;

    item.x += driftX * 0.01;
    item.y += driftY * 0.01;
  }
}

function animate(t) {
  state.frameCount += 1;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawGrid();
  drawConnections(t);
  drawSelectionNeighbors();
  drawNodes(t);

  smoothStep();
  updateHoverTip();

  requestAnimationFrame(animate);
}

function resetView() {
  state.camera.targetX = 0;
  state.camera.targetY = 0;
  state.camera.targetZoom = 1;
}

function updateUserPositionFromText(persist = true) {
  const text = creatorInput.value.trim();
  const user = itemById(USER_ID);
  if (!user) return;

  const fallback = text || "I am exploring idea-space";
  const embedding = embeddingFromText(fallback, 8);
  const pos = embeddingToPosition(embedding);

  user.text = fallback;
  user.embedding = embedding;
  user.type = inferType(fallback);
  user.mood = moodFromEmbedding(embedding);
  user.targetX = pos.x;
  user.targetY = pos.y;

  state.selectedId = user.id;
  updateInfoPanel();
  if (persist) requestSave();
}

// --- Interaction handlers ---
canvas.addEventListener("pointerdown", (e) => {
  const x = e.clientX;
  const y = e.clientY;

  state.mouse.x = x;
  state.mouse.y = y;

  const hit = pickNode(x, y);
  if (hit) {
    state.selectedId = hit.id;
    updateInfoPanel();
    return;
  }

  state.selectedId = null;
  updateInfoPanel();

  // Start panning when clicking empty space.
  state.pan.active = true;
  state.pan.startScreenX = x;
  state.pan.startScreenY = y;
  state.pan.startCamX = state.camera.targetX;
  state.pan.startCamY = state.camera.targetY;
});

canvas.addEventListener("pointermove", (e) => {
  state.mouse.x = e.clientX;
  state.mouse.y = e.clientY;

  if (state.pan.active) {
    const dx = e.clientX - state.pan.startScreenX;
    const dy = e.clientY - state.pan.startScreenY;
    state.camera.targetX = state.pan.startCamX - dx / state.camera.zoom;
    state.camera.targetY = state.pan.startCamY - dy / state.camera.zoom;
  }

  const hit = pickNode(e.clientX, e.clientY);
  state.hoveredId = hit ? hit.id : null;
});

canvas.addEventListener("pointerup", () => {
  state.pan.active = false;
});

canvas.addEventListener("pointerleave", () => {
  state.pan.active = false;
  state.hoveredId = null;
});

canvas.addEventListener("wheel", (e) => {
  e.preventDefault();

  const zoomFactor = e.deltaY > 0 ? 0.92 : 1.08;
  const worldBefore = screenToWorld(e.clientX, e.clientY);

  state.camera.targetZoom = clamp(state.camera.targetZoom * zoomFactor, 0.35, 3.4);

  // Keep cursor anchored while zooming.
  const worldAfter = screenToWorld(e.clientX, e.clientY);
  const fixX = worldBefore.x - worldAfter.x;
  const fixY = worldBefore.y - worldAfter.y;
  state.camera.targetX -= fixX;
  state.camera.targetY -= fixY;
}, { passive: false });

creatorInput.addEventListener("input", () => {
  if (inputTimer) clearTimeout(inputTimer);
  inputTimer = setTimeout(() => {
    updateUserPositionFromText(false);
  }, 120);
});

creatorInput.addEventListener("change", () => {
  updateUserPositionFromText(true);
});

seedBtn.addEventListener("click", () => {
  const n = 6;
  for (let i = 0; i < n; i += 1) addSimulatedItem();
  requestSave();
});

bloomBtn.addEventListener("click", () => {
  state.showLinks = !state.showLinks;
  bloomBtn.classList.toggle("active", state.showLinks);
});

pruneBtn.addEventListener("click", () => {
  state.items = state.items.filter((item) => item.id === USER_ID);
  state.selectedId = null;
  requestSave();
  updateInfoPanel();
});

// Double-click empty canvas to re-center view quickly.
canvas.addEventListener("dblclick", () => {
  resetView();
});

// --- Initial boot ---
loadItems();
ensureUserNode();
updateInfoPanel();
requestAnimationFrame(animate);
