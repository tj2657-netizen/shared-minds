import * as THREE from "three";
import { OrbitControls } from "https://unpkg.com/three@0.165.0/examples/jsm/controls/OrbitControls.js";

// -----------------------------
// 1) Scene setup
// -----------------------------
const root = document.getElementById("scene-root");

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0d1520, 5, 100);

// One place to tweak the overall feel of the scene.
const MOOD = {
	baseFog: 0x0d1520,
	floor: 0x101923,
	ambientIntensity: 0.75,
	keyIntensity: 1.2,
	fillIntensity: 0.7,
};

const camera = new THREE.PerspectiveCamera(
	60,
	window.innerWidth / window.innerHeight,
	0.1,
	100
);
camera.position.set(0, 2.8, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
root.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = false;
controls.minDistance = 3;
controls.maxDistance = 50;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI;
controls.enableZoom = true;
controls.zoomSpeed = 1.2;
controls.rotateSpeed = 0.8;
controls.panSpeed = 0.8;

const ambientLight = new THREE.AmbientLight(0xa8c8ff, MOOD.ambientIntensity);
scene.add(ambientLight);

const skyLight = new THREE.HemisphereLight(0x8eb8ff, 0x0d1420, 0.55);
scene.add(skyLight);

const keyLight = new THREE.DirectionalLight(0xfef7de, MOOD.keyIntensity);
keyLight.position.set(8, 10, 6);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x7cc5ff, MOOD.fillIntensity);
fillLight.position.set(-7, 3, -4);
scene.add(fillLight);

const rimLight = new THREE.PointLight(0x89d7ff, 0.8, 28, 2);
rimLight.position.set(0, 4, -10);
scene.add(rimLight);

// Use the user's photo as a "memory wall" in the distance.
const textureLoader = new THREE.TextureLoader();
const memoryWall = new THREE.Mesh(
	new THREE.PlaneGeometry(90, 80),
	new THREE.MeshBasicMaterial({ color: 0x1a2633 })
);
memoryWall.position.set(0, 2, -28);
memoryWall.rotation.y = 0;
scene.add(memoryWall);

// Second photo, positioned to the right of the creature space.
const memoryWall2 = new THREE.Mesh(
	new THREE.PlaneGeometry(90, 80),
	new THREE.MeshBasicMaterial({
		color: 0x1a2a3a,
		transparent: true,
		opacity: 1.0,
		side: THREE.DoubleSide,
	})
);
memoryWall2.position.set(24.2, 2, 14);
memoryWall2.rotation.y = -2.094;
scene.add(memoryWall2);

// Third photo, positioned to the left of the creature space.
const memoryWall3 = new THREE.Mesh(
	new THREE.PlaneGeometry(90, 80),
	new THREE.MeshBasicMaterial({
		color: 0x1a2a3a,
		transparent: true,
		opacity: 1.0,
		side: THREE.DoubleSide,
	})
);
memoryWall3.position.set(-24.2, 2, 14);
memoryWall3.rotation.y = 2.094;
scene.add(memoryWall3);

textureLoader.load(
	"./background.jpg",
	(texture) => {
		texture.colorSpace = THREE.SRGBColorSpace;
		texture.minFilter = THREE.LinearFilter;
		texture.magFilter = THREE.LinearFilter;
		memoryWall.material = new THREE.MeshBasicMaterial({ map: texture });

		// Sample one pixel so fog and floor can softly harmonize with the photo.
		const sampleCanvas = document.createElement("canvas");
		sampleCanvas.width = 1;
		sampleCanvas.height = 1;
		const sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });
		sampleCtx.drawImage(texture.image, 0, 0, 1, 1);
		const [r, g, b] = sampleCtx.getImageData(0, 0, 1, 1).data;
		const base = new THREE.Color(r / 255, g / 255, b / 255);
		const fogColor = base.clone().lerp(new THREE.Color(0x08111a), 0.62);
		scene.fog.color.copy(fogColor);
		floor.material.color.copy(fogColor.clone().multiplyScalar(0.72));
		ambientLight.color.copy(base.clone().lerp(new THREE.Color(0xb4d0ff), 0.55));
	},
	undefined,
	() => {
		// Fallback keeps scene usable even when image is missing.
		memoryWall.material = new THREE.MeshBasicMaterial({ color: 0x223347 });
		scene.fog.color.setHex(MOOD.baseFog);
	}
);

textureLoader.load(
	"./background2.jpg",
	(texture) => {
		texture.colorSpace = THREE.SRGBColorSpace;
		texture.minFilter = THREE.LinearFilter;
		texture.magFilter = THREE.LinearFilter;
		memoryWall2.material = new THREE.MeshBasicMaterial({
			map: texture,
			transparent: true,
			opacity: 1.0,
			side: THREE.DoubleSide,
		});
	},
	undefined,
	() => {
		// Fallback colored panel.
		memoryWall2.material = new THREE.MeshBasicMaterial({
			color: 0x1a2a3a,
			transparent: true,
			opacity: 0.45,
			side: THREE.DoubleSide,
		});
	}
);

textureLoader.load(
	"./background3.jpg",
	(texture) => {
		texture.colorSpace = THREE.SRGBColorSpace;
		texture.minFilter = THREE.LinearFilter;
		texture.magFilter = THREE.LinearFilter;
		memoryWall3.material = new THREE.MeshBasicMaterial({
			map: texture,
			transparent: true,
			opacity: 1.0,
			side: THREE.DoubleSide,
		});
	},
	undefined,
	() => {
		// Fallback colored panel.
		memoryWall3.material = new THREE.MeshBasicMaterial({
			color: 0x1a2a3a,
			transparent: true,
			opacity: 0.45,
			side: THREE.DoubleSide,
		});
	}
);

// A soft floor helps depth perception and anchors movement.
const floor = new THREE.Mesh(
	new THREE.CircleGeometry(18, 48),
	new THREE.MeshStandardMaterial({
		color: MOOD.floor,
		roughness: 0.95,
		metalness: 0.05,
		transparent: true,
		opacity: 0.88,
	})
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2.8;
scene.add(floor);

function createAtmosphere(count) {
	const geometry = new THREE.BufferGeometry();
	const positions = new Float32Array(count * 3);
	const scales = new Float32Array(count);

	for (let i = 0; i < count; i += 1) {
		const i3 = i * 3;
		positions[i3] = randomRange(-18, 18);
		positions[i3 + 1] = randomRange(-2, 10);
		positions[i3 + 2] = randomRange(-20, 10);
		scales[i] = randomRange(0.4, 1.6);
	}

	geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
	geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));

	const material = new THREE.PointsMaterial({
		color: 0xcfefff,
		size: 0.08,
		transparent: true,
		opacity: 0.38,
		depthWrite: false,
		blending: THREE.AdditiveBlending,
	});

	const points = new THREE.Points(geometry, material);
	return points;
}

const atmosphere = createAtmosphere(360);
scene.add(atmosphere);

// -----------------------------
// 2) Object creation
// -----------------------------
const creatures = [];
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredCreature = null;

function randomRange(min, max) {
	return min + Math.random() * (max - min);
}

function createBird(index) {
	const group = new THREE.Group();

	const body = new THREE.Mesh(
		new THREE.SphereGeometry(0.18, 14, 14),
		new THREE.MeshStandardMaterial({
			color: 0xf2f5ff,
			roughness: 0.45,
			metalness: 0.15,
		})
	);
	group.add(body);

	const wingGeometry = new THREE.ConeGeometry(0.09, 0.48, 10);
	const wingMaterial = new THREE.MeshStandardMaterial({
		color: 0x8db8ff,
		roughness: 0.4,
		metalness: 0.2,
	});

	const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
	leftWing.rotation.z = Math.PI * 0.62;
	leftWing.position.set(-0.16, 0.02, 0);
	group.add(leftWing);

	const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
	rightWing.rotation.z = -Math.PI * 0.62;
	rightWing.position.set(0.16, 0.02, 0);
	group.add(rightWing);

	group.position.set(
		randomRange(-6, 6),
		randomRange(-0.2, 4.5),
		randomRange(-12, 5)
	);

	const creature = {
		type: "bird",
		mesh: group,
		velocity: new THREE.Vector3(randomRange(-0.01, 0.01), randomRange(-0.005, 0.005), randomRange(-0.01, 0.01)),
		baseScale: 1,
		hoverScale: 1.18,
		speed: randomRange(0.5, 1.1),
		hoverOffset: randomRange(0, Math.PI * 2),
		orbitRadius: randomRange(1.2, 3.4),
		orbitCenter: group.position.clone(),
		orbitAngle: randomRange(0, Math.PI * 2),
		scatterTimer: 0,
		wingLeft: leftWing,
		wingRight: rightWing,
		id: `bird-${index}`,
	};

	scene.add(group);
	creatures.push(creature);
}

function createInsect(index) {
	const group = new THREE.Group();

	const body = new THREE.Mesh(
		new THREE.CapsuleGeometry(0.08, 0.18, 4, 8),
		new THREE.MeshStandardMaterial({
			color: 0xffde8a,
			roughness: 0.35,
			metalness: 0.15,
			emissive: 0x3f2f06,
			emissiveIntensity: 0.2,
		})
	);
	body.rotation.z = Math.PI / 2;
	group.add(body);

	const wingMaterial = new THREE.MeshStandardMaterial({
		color: 0x9ee3df,
		transparent: true,
		opacity: 0.65,
		roughness: 0.2,
		metalness: 0.05,
		side: THREE.DoubleSide,
	});

	const wingGeometry = new THREE.PlaneGeometry(0.25, 0.11);
	const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
	leftWing.position.set(-0.02, 0.08, 0);
	leftWing.rotation.y = Math.PI * 0.2;
	group.add(leftWing);

	const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
	rightWing.position.set(-0.02, -0.08, 0);
	rightWing.rotation.y = -Math.PI * 0.2;
	group.add(rightWing);

	group.position.set(
		randomRange(-7, 7),
		randomRange(-1, 3.8),
		randomRange(-11, 4)
	);

	const creature = {
		type: "insect",
		mesh: group,
		velocity: new THREE.Vector3(randomRange(-0.018, 0.018), randomRange(-0.009, 0.009), randomRange(-0.018, 0.018)),
		baseScale: 1,
		hoverScale: 1.32,
		speed: randomRange(0.7, 1.4),
		hoverOffset: randomRange(0, Math.PI * 2),
		orbitRadius: randomRange(0.8, 2.1),
		orbitCenter: group.position.clone(),
		orbitAngle: randomRange(0, Math.PI * 2),
		scatterTimer: 0,
		wingLeft: leftWing,
		wingRight: rightWing,
		id: `insect-${index}`,
	};

	scene.add(group);
	creatures.push(creature);
}

for (let i = 0; i < 12; i += 1) createBird(i);
for (let i = 0; i < 24; i += 1) createInsect(i);

function createThoughtTextSprite(text, color) {
	const canvas = document.createElement("canvas");
	canvas.width = 512;
	canvas.height = 128;
	const ctx = canvas.getContext("2d");

	ctx.fillStyle = "rgba(4, 10, 17, 0.0)";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.font = "56px Georgia";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillStyle = color;
	ctx.fillText(text, canvas.width / 2, canvas.height / 2);

	const texture = new THREE.CanvasTexture(canvas);
	texture.colorSpace = THREE.SRGBColorSpace;
	const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
	const sprite = new THREE.Sprite(material);
	sprite.scale.set(4.7, 1.2, 1);
	return sprite;
}

const thoughts = [
	{ label: "breathe", color: "#f3e8b7", pos: [-4.8, 3.4, -8.5] },
	{ label: "remember", color: "#a7d8ff", pos: [5.1, 1.2, -10.2] },
	{ label: "wonder", color: "#b8f0df", pos: [0.5, 4.3, -12.5] },
];

const thoughtSprites = [];

thoughts.forEach((t) => {
	const sprite = createThoughtTextSprite(t.label, t.color);
	sprite.position.set(t.pos[0], t.pos[1], t.pos[2]);
	sprite.userData.baseY = t.pos[1];
	thoughtSprites.push(sprite);
	scene.add(sprite);
});

// -----------------------------
// 3) Interaction handling
// -----------------------------
function updateMouse(event) {
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

window.addEventListener("pointermove", (event) => {
	updateMouse(event);
});

window.addEventListener("click", (event) => {
	updateMouse(event);
	raycaster.setFromCamera(mouse, camera);

	// This invisible plane gives us a stable 3D click point.
	const interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 2);
	const clickPoint = new THREE.Vector3();
	raycaster.ray.intersectPlane(interactionPlane, clickPoint);

	creatures.forEach((creature) => {
		const away = creature.mesh.position.clone().sub(clickPoint);
		away.y *= 0.8;
		if (away.lengthSq() < 0.01) away.set(randomRange(-1, 1), randomRange(-0.4, 0.8), randomRange(-1, 1));

		away.normalize().multiplyScalar(randomRange(0.3, 0.7));
		creature.velocity.add(away.multiplyScalar(0.08));
		creature.scatterTimer = 1.2;
	});
});

window.addEventListener("resize", () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Keyboard controls for easy 360° navigation.
const keys = {};
window.addEventListener("keydown", (event) => {
	keys[event.key] = true;
});
window.addEventListener("keyup", (event) => {
	keys[event.key] = false;
});

// Store camera initial distance for smooth zoom.
let targetDistance = camera.position.length();

// -----------------------------
// 4) Animation loop
// -----------------------------
const clock = new THREE.Clock();

function animate() {
	requestAnimationFrame(animate);

	const elapsed = clock.getElapsedTime();
	const delta = Math.min(clock.getDelta(), 0.033);

	// Keep all three pictures gently alive without duplicating them.
	memoryWall2.position.y = 2 + Math.sin(elapsed * 0.55) * 0.16;
	memoryWall2.rotation.y = -2.094 + Math.sin(elapsed * 0.28) * 0.02;
	memoryWall3.position.y = 2 + Math.sin(elapsed * 0.55 + 2.1) * 0.16;
	memoryWall3.rotation.y = 2.094 + Math.sin(elapsed * 0.28 + 2.1) * 0.02;

	// Slow light pulse helps the world feel alive without being distracting.
	keyLight.intensity = MOOD.keyIntensity + Math.sin(elapsed * 0.42) * 0.08;
	fillLight.intensity = MOOD.fillIntensity + Math.cos(elapsed * 0.35) * 0.06;
	rimLight.intensity = 0.74 + Math.sin(elapsed * 0.82) * 0.11;

	const particles = atmosphere.geometry.attributes.position;
	for (let i = 0; i < particles.count; i += 1) {
		const i3 = i * 3;
		particles.array[i3 + 1] += 0.0022 + Math.sin(elapsed * 0.2 + i * 0.13) * 0.0008;
		particles.array[i3] += Math.sin(elapsed * 0.08 + i) * 0.0009;

		if (particles.array[i3 + 1] > 10) {
			particles.array[i3 + 1] = -2;
		}
	}
	particles.needsUpdate = true;

	thoughtSprites.forEach((sprite, index) => {
		sprite.position.y = sprite.userData.baseY + Math.sin(elapsed * 0.7 + index * 1.2) * 0.22;
		sprite.material.opacity = 0.7 + Math.sin(elapsed * 1.1 + index * 0.5) * 0.2;
	});

	raycaster.setFromCamera(mouse, camera);
	const intersectTargets = creatures.map((c) => c.mesh);
	const intersections = raycaster.intersectObjects(intersectTargets, true);

	hoveredCreature = null;
	if (intersections.length > 0) {
		const hit = intersections[0].object;
		hoveredCreature = creatures.find((creature) => creature.mesh === hit || creature.mesh.children.includes(hit)) || null;
	}

	creatures.forEach((creature, index) => {
		const targetScale = hoveredCreature?.id === creature.id ? creature.hoverScale : creature.baseScale;
		const currentScale = creature.mesh.scale.x;
		const nextScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.14);
		creature.mesh.scale.setScalar(nextScale);

		// Normal movement path: each creature has a personal drifting orbit.
		creature.orbitAngle += delta * creature.speed * 0.7;
		const orbitX = Math.cos(creature.orbitAngle + index * 0.11) * creature.orbitRadius;
		const orbitZ = Math.sin(creature.orbitAngle + index * 0.11) * creature.orbitRadius;
		const driftY = Math.sin(elapsed * (1.2 + creature.speed) + creature.hoverOffset) * 0.34;

		const desired = new THREE.Vector3(
			creature.orbitCenter.x + orbitX,
			THREE.MathUtils.clamp(creature.orbitCenter.y + driftY, -2, 6),
			creature.orbitCenter.z + orbitZ
		);

		const steering = desired.sub(creature.mesh.position).multiplyScalar(0.012);
		creature.velocity.add(steering);

		if (creature.scatterTimer > 0) {
			creature.scatterTimer -= delta;
		}

		// Gentle damping keeps motion smooth and organic.
		const damping = creature.scatterTimer > 0 ? 0.987 : 0.965;
		creature.velocity.multiplyScalar(damping);

		creature.mesh.position.add(creature.velocity);
		creature.mesh.lookAt(creature.mesh.position.clone().add(creature.velocity.clone().multiplyScalar(65)));

		// Animate wings differently for birds vs insects.
		if (creature.type === "bird") {
			const flap = Math.sin(elapsed * 7.4 * creature.speed + creature.hoverOffset) * 0.5;
			creature.wingLeft.rotation.y = flap;
			creature.wingRight.rotation.y = -flap;
		} else {
			const flutter = Math.sin(elapsed * 18.0 * creature.speed + creature.hoverOffset) * 0.75;
			creature.wingLeft.rotation.z = flutter;
			creature.wingRight.rotation.z = -flutter;
			creature.mesh.children[0].material.emissiveIntensity =
				0.16 + Math.sin(elapsed * 6.2 + creature.hoverOffset) * 0.09;
		}

		// Keep creatures inside a 3D pocket of space.
		creature.mesh.position.x = THREE.MathUtils.clamp(creature.mesh.position.x, -11, 11);
		creature.mesh.position.y = THREE.MathUtils.clamp(creature.mesh.position.y, -2.3, 7.5);
		creature.mesh.position.z = THREE.MathUtils.clamp(creature.mesh.position.z, -16, 8);
	});

	// Keyboard navigation for easy 360° control.
	if (keys["ArrowUp"] || keys["w"] || keys["W"]) {
		controls.rotateUp(0.05);
	}
	if (keys["ArrowDown"] || keys["s"] || keys["S"]) {
		controls.rotateUp(-0.05);
	}
	if (keys["ArrowLeft"] || keys["a"] || keys["A"]) {
		controls.rotateLeft(0.05);
	}
	if (keys["ArrowRight"] || keys["d"] || keys["D"]) {
		controls.rotateLeft(-0.05);
	}
	if (keys["+"] || keys["="]) {
		targetDistance = Math.max(controls.minDistance, targetDistance - 0.3);
	}
	if (keys["-"]) {
		targetDistance = Math.min(controls.maxDistance, targetDistance + 0.3);
	}
	controls.object.position.lerp(controls.target.clone().add(controls.object.position.clone().sub(controls.target).normalize().multiplyScalar(targetDistance)), 0.08);

	controls.update();
	renderer.render(scene, camera);
}

animate();
