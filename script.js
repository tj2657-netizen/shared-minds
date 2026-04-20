// ========== THREE.JS SETUP ==========
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x001a33, 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowShadowMap;
document.getElementById('canvas-container').appendChild(renderer.domElement);

camera.position.set(0, 5, 15);
camera.lookAt(0, 0, 0);

// ========== STATE ==========
const state = {
  autoRotate: true,
  lightingOn: true,
  fish: [],
  cameraAutoRotate: true,
  // Face detection state
  faceDetector: null,
  currentEmotion: 'neutral',
  emotionConfidence: 0,
  lastSmileTime: 0,
  lastSadTime: 0,
  emotionCooldown: 1500,
};

let lastFrameTime = Date.now();
let frameCount = 0;

// ========== FACE DETECTION & EMOTION ==========
async function setupFaceDetection() {
  const faceVideo = document.getElementById('faceVideo');
  const emotionEl = document.getElementById('emotionDisplay');
  const confidenceEl = document.getElementById('confidenceDisplay');
  const hintEl = document.getElementById('cameraHint');
  
  try {
    emotionEl.textContent = '📷 Requesting camera...';
    confidenceEl.textContent = 'Confidence: --';

    if (!window.isSecureContext && location.protocol !== 'http:') {
      emotionEl.textContent = '❌ Insecure context';
      hintEl.textContent = 'Open via http://localhost (or https). file:// and some previews block camera.';
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      emotionEl.textContent = '❌ Camera unsupported';
      hintEl.textContent = 'Use a modern browser like Chrome or Safari.';
      return;
    }

    // Request camera access
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 },
      audio: false,
    });
    
    faceVideo.srcObject = stream;
    faceVideo.play();
    hintEl.textContent = 'Camera connected. Face detection is running.';
    
    // Initialize ml5 faceapi with callback
    state.faceDetector = ml5.faceApi(faceVideo, modelLoaded);
    console.log('Loading face detection model...');
  } catch (error) {
    console.error('Face detection error:', error);
    if (error && error.name === 'NotAllowedError') {
      emotionEl.textContent = '❌ Camera denied';
      hintEl.textContent = 'Allow camera in browser site settings and macOS Privacy settings, then click Enable Camera.';
    } else if (error && error.name === 'NotFoundError') {
      emotionEl.textContent = '❌ No camera found';
      hintEl.textContent = 'Connect a webcam, then click Enable Camera.';
    } else if (error && error.name === 'NotReadableError') {
      emotionEl.textContent = '❌ Camera busy';
      hintEl.textContent = 'Another app is using the camera. Close Zoom/Meet/Photo Booth and retry.';
    } else if (error && (error.name === 'SecurityError' || error.name === 'TypeError')) {
      emotionEl.textContent = '❌ Blocked origin';
      hintEl.textContent = 'Run this on localhost or https. Camera is blocked on insecure pages.';
    } else {
      const reason = error && error.name ? error.name : 'UnknownError';
      emotionEl.textContent = '❌ Camera error';
      hintEl.textContent = `Reason: ${reason}. Check permissions, close camera apps, then click Enable Camera.`;
    }
  }
}

function modelLoaded() {
  console.log('Face model loaded!');
  startFaceDetection();
}

function startFaceDetection() {
  if (!state.faceDetector) return;
  
  // Get video element
  const video = document.getElementById('faceVideo');
  
  // Use detectSingle for better performance
  state.faceDetector.detectSingle(video, (err, results) => {
    if (err) {
      console.log('Detection error (continue)');
    }
    
    if (results && results.length > 0) {
      const face = results[0];
      
      // Extract landmarks and analyze expression
      if (face.landmarks && face.landmarks.length > 0) {
        analyzeExpression(face.landmarks);
        handleEmotionActions();
      }
    } else {
      state.currentEmotion = 'no_face';
      state.emotionConfidence = 0;
    }
    
    updateEmotionDisplay();
    
    // Continue detection
    requestAnimationFrame(() => startFaceDetection());
  });
}

function analyzeExpression(landmarks) {
  if (!landmarks || landmarks.length < 68) {
    state.currentEmotion = 'neutral';
    state.emotionConfidence = 0.5;
    return;
  }
  
  // Mouth landmarks (48-67)
  const mouthLeft = landmarks[48];
  const mouthRight = landmarks[54];
  const mouthTop = landmarks[62];
  const mouthBottom = landmarks[66];
  
  // Eye landmarks
  const leftEye = landmarks[36];
  const rightEye = landmarks[45];
  
  // Eyebrow landmarks
  const eyebrowLeft = landmarks[21];
  const eyebrowRight = landmarks[22];
  
  if (!mouthLeft || !mouthRight || !mouthTop || !mouthBottom) {
    state.currentEmotion = 'neutral';
    state.emotionConfidence = 0.5;
    return;
  }
  
  // Calculate mouth curve (smile vs frown)
  const mouthHeight = Math.abs(mouthBottom[1] - mouthTop[1]);
  const mouthMidY = (mouthTop[1] + mouthBottom[1]) / 2;
  const cornersAvgY = (mouthLeft[1] + mouthRight[1]) / 2;
  const mouthCurve = mouthMidY - cornersAvgY; // Negative = smile, Positive = frown
  
  // Calculate eyebrow height
  const eyeY = (leftEye[1] + rightEye[1]) / 2;
  const browY = (eyebrowLeft[1] + eyebrowRight[1]) / 2;
  const browHeight = browY - eyeY; // Negative = raised, Positive = furrowed
  
  // Determine emotion
  if (mouthCurve < -1.5 || (browHeight > 5 && mouthHeight > 7)) {
    state.currentEmotion = 'happy';
    state.emotionConfidence = Math.min(1, Math.abs(mouthCurve) / 5);
  } else if (mouthCurve > 1.5 || (browHeight < -3 && mouthHeight < 5)) {
    state.currentEmotion = 'sad';
    state.emotionConfidence = Math.min(1, Math.abs(mouthCurve) / 5);
  } else {
    state.currentEmotion = 'neutral';
    state.emotionConfidence = 0.6;
  }
  
  // Ensure confidence is between 0 and 1
  state.emotionConfidence = Math.max(0.3, Math.min(1, state.emotionConfidence));
}

function updateEmotionDisplay() {
  const emotionEmoji = {
    happy: '😊',
    sad: '😢',
    neutral: '😐',
    no_face: '📷',
  };
  
  const emoji = emotionEmoji[state.currentEmotion] || '🤷';
  const confidence = Math.round(state.emotionConfidence * 100);
  
  document.getElementById('emotionDisplay').textContent = `${emoji} Emotion: ${state.currentEmotion.toUpperCase()}`;
  document.getElementById('confidenceDisplay').textContent = `Confidence: ${confidence}%`;
}

function handleEmotionActions() {
  const now = Date.now();
  
  // Spawn fish on smile
  if (state.currentEmotion === 'happy' && state.emotionConfidence > 0.5) {
    if (now - state.lastSmileTime > state.emotionCooldown) {
      createFish();
      state.lastSmileTime = now;
      console.log('😊 Smile detected! +Fish (Total: ' + state.fish.length + ')');
    }
  }
  
  // Remove fish on sad
  if (state.currentEmotion === 'sad' && state.emotionConfidence > 0.5) {
    if (now - state.lastSadTime > state.emotionCooldown && state.fish.length > 1) {
      const fishToRemove = state.fish.pop();
      scene.remove(fishToRemove.mesh);
      state.lastSadTime = now;
      console.log('😢 Sad detected! -Fish (Total: ' + state.fish.length + ')');
    }
  }
}

// ========== LIGHTING SETUP ==========
function setupLighting() {
  // Ambient light (twilight underwater)
  const ambientLight = new THREE.AmbientLight(0x1a4d6d, 0.5);
  scene.add(ambientLight);

  // Main directional light (from above-left)
  const directionalLight = new THREE.DirectionalLight(0x4db8ff, 0.8);
  directionalLight.position.set(10, 15, 10);
  directionalLight.castShadow = true;
  directionalLight.shadow.camera.left = -30;
  directionalLight.shadow.camera.right = 30;
  directionalLight.shadow.camera.top = 30;
  directionalLight.shadow.camera.bottom = -30;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);

  // Point lights (bioluminescence effect)
  const pointLight1 = new THREE.PointLight(0x00ff88, 0.6, 20);
  pointLight1.position.set(-8, 8, -5);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0x0099ff, 0.6, 20);
  pointLight2.position.set(8, 6, -8);
  scene.add(pointLight2);

  // Hemisphere light (overall underwater tone)
  const hemiLight = new THREE.HemisphereLight(0x0099cc, 0x001a33, 0.4);
  scene.add(hemiLight);
}

// ========== CAVE CREATION ==========
function createCave() {
  // Main cave chamber (large sphere carved out)
  const caveGeometry = new THREE.IcosahedronGeometry(20, 5);
  const caveMaterial = new THREE.MeshPhongMaterial({
    color: 0x1a1a1a,
    shininess: 10,
    map: createCaveTexture(),
  });
  const cave = new THREE.Mesh(caveGeometry, caveMaterial);
  cave.receiveShadow = true;
  scene.add(cave);

  // Large rocks (stalagmites/stalactites)
  createRock(0, -12, 0, 3, 8, 3, 0x333333);
  createRock(8, -8, 8, 2.5, 6, 2.5, 0x2a2a2a);
  createRock(-8, -8, 8, 2.5, 6, 2.5, 0x303030);
  createRock(-10, 10, -5, 2, 7, 2, 0x252525);
  createRock(10, 10, -5, 2, 7, 2, 0x2d2d2d);
  createRock(0, 8, 12, 3, 5, 3, 0x1f1f1f);
}

function createRock(x, y, z, scaleX, scaleY, scaleZ, color) {
  const geometry = new THREE.IcosahedronGeometry(1, 3);
  const material = new THREE.MeshPhongMaterial({
    color,
    shininess: 5,
  });
  const rock = new THREE.Mesh(geometry, material);
  rock.scale.set(scaleX, scaleY, scaleZ);
  rock.position.set(x, y, z);
  rock.castShadow = true;
  rock.receiveShadow = true;
  
  // Random distortion for natural look
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const rand = Math.random();
    positions.array[i * 3] += (rand - 0.5) * 0.3;
    positions.array[i * 3 + 1] += (rand - 0.5) * 0.3;
    positions.array[i * 3 + 2] += (rand - 0.5) * 0.3;
  }
  positions.needsUpdate = true;

  scene.add(rock);
}

// ========== AQUATIC PLANTS ==========
function createAquaticPlants() {
  // Seaweed-like plants
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const x = Math.cos(angle) * 12;
    const z = Math.sin(angle) * 12;
    createSeaweed(x, -10, z);
  }

  // Moss coverage on rocks
  createMossCoverage();

  // Underwater grass
  createUndergroundGrass();
}

function createSeaweed(x, y, z) {
  const segments = 8;
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(x, y, z),
    new THREE.Vector3(x + (Math.random() - 0.5) * 2, y + 4, z + (Math.random() - 0.5) * 2),
    new THREE.Vector3(x + (Math.random() - 0.5) * 3, y + 8, z + (Math.random() - 0.5) * 3),
    new THREE.Vector3(x + (Math.random() - 0.5) * 2, y + 10, z + (Math.random() - 0.5) * 2),
  ]);

  const points = curve.getPoints(segments);
  const geometry = new THREE.TubeGeometry(
    new THREE.LineCurve3(points[0], points[points.length - 1]),
    1,
    0.15,
    6,
    false
  );

  const material = new THREE.MeshPhongMaterial({ color: 0x2d5a3d });
  const seaweed = new THREE.Mesh(geometry, material);
  seaweed.castShadow = true;
  seaweed.receiveShadow = true;
  scene.add(seaweed);

  // Store for animation
  seaweed.userData.baseX = x;
  seaweed.userData.baseZ = z;
  seaweed.userData.time = Math.random() * Math.PI * 2;
}

function createMossCoverage() {
  // Add multiple small green meshes as moss
  for (let i = 0; i < 20; i++) {
    const geometry = new THREE.SphereGeometry(0.3, 4, 4);
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(0.35, 0.7, 0.35),
    });
    const moss = new THREE.Mesh(geometry, material);
    
    // Random position on cave surface
    const angle = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const radius = 19; // Just inside cave sphere

    moss.position.set(
      radius * Math.sin(phi) * Math.cos(angle),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(angle)
    );

    moss.castShadow = true;
    moss.receiveShadow = true;
    scene.add(moss);
  }
}

function createUndergroundGrass() {
  // Create dense grass patches on the cave floor
  const grassGroup = new THREE.Group();
  
  // Multiple patches of grass
  for (let patchIdx = 0; patchIdx < 12; patchIdx++) {
    const patchX = (Math.random() - 0.5) * 24;
    const patchZ = (Math.random() - 0.5) * 24;
    
    // Create individual grass blades within each patch
    for (let i = 0; i < 15; i++) {
      const offsetX = (Math.random() - 0.5) * 2;
      const offsetZ = (Math.random() - 0.5) * 2;
      const grassX = patchX + offsetX;
      const grassZ = patchZ + offsetZ;
      
      const blade = createGrassBlade(grassX, -11.5, grassZ, i + patchIdx * 15);
      grassGroup.add(blade);
    }
  }
  
  scene.add(grassGroup);
}

function createGrassBlade(x, y, z, id) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  
  // Main blade geometry
  const bladeGeometry = new THREE.PlaneGeometry(0.15, 1.2, 1, 8);
  
  // Bend the blade naturally
  const positions = bladeGeometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const yVal = positions.getY(i);
    positions.setX(i, positions.getX(i) + yVal * 0.1);
  }
  positions.needsUpdate = true;
  
  // Use double-sided rendering for thin meshes
  const bladeMaterial = new THREE.MeshPhongMaterial({
    color: new THREE.Color().setHSL(0.32 + Math.random() * 0.08, 0.85, 0.35 + Math.random() * 0.15),
    shininess: 20,
    emissive: 0x1a3a1a,
    side: THREE.DoubleSide,
  });
  
  const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
  blade.castShadow = true;
  blade.receiveShadow = true;
  blade.rotation.z = Math.random() * Math.PI * 2;
  
  // Store animation data
  blade.userData.swayId = id;
  blade.userData.baseRotationZ = blade.rotation.z;
  blade.userData.swayAmount = 0.3 + Math.random() * 0.4;
  blade.userData.swaySpeed = 0.5 + Math.random() * 0.5;
  
  group.add(blade);
  
  // Add secondary blades for density
  for (let s = 0; s < 2; s++) {
    const secondaryGeometry = new THREE.PlaneGeometry(0.1, 0.9, 1, 6);
    const secondaryPositions = secondaryGeometry.attributes.position;
    for (let i = 0; i < secondaryPositions.count; i++) {
      const yVal = secondaryPositions.getY(i);
      secondaryPositions.setX(i, secondaryPositions.getX(i) + yVal * 0.08);
    }
    secondaryPositions.needsUpdate = true;
    
    const secondaryMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(0.34 + Math.random() * 0.06, 0.8, 0.32 + Math.random() * 0.12),
      shininess: 15,
      emissive: 0x0a2a0a,
      side: THREE.DoubleSide,
    });
    
    const secondaryBlade = new THREE.Mesh(secondaryGeometry, secondaryMaterial);
    secondaryBlade.castShadow = true;
    secondaryBlade.receiveShadow = true;
    secondaryBlade.rotation.z = Math.random() * Math.PI * 2;
    secondaryBlade.position.x = (Math.random() - 0.5) * 0.2;
    secondaryBlade.position.y = (Math.random() - 0.5) * 0.3;
    
    secondaryBlade.userData.swayId = id + 1000 + s;
    secondaryBlade.userData.baseRotationZ = secondaryBlade.rotation.z;
    secondaryBlade.userData.swayAmount = 0.2 + Math.random() * 0.3;
    secondaryBlade.userData.swaySpeed = 0.6 + Math.random() * 0.4;
    
    group.add(secondaryBlade);
  }
  
  return group;
}

// ========== FISH ==========
function createFish() {
  // 20% chance to spawn a seahorse instead
  const isSeahorse = Math.random() < 0.2;
  const mesh = isSeahorse ? createSeahorseM() : createFishMesh();
  
  const fish = {
    mesh: mesh,
    x: (Math.random() - 0.5) * 20,
    y: (Math.random() - 0.5) * 16 - 2,
    z: (Math.random() - 0.5) * 16,
    vx: (Math.random() - 0.5) * (isSeahorse ? 0.01 : 0.05),
    vy: (Math.random() - 0.5) * (isSeahorse ? 0.008 : 0.02),
    vz: (Math.random() - 0.5) * (isSeahorse ? 0.01 : 0.05),
    time: 0,
    isSeahorse: isSeahorse,
  };

  fish.mesh.position.set(fish.x, fish.y, fish.z);
  scene.add(fish.mesh);
  state.fish.push(fish);
  return fish;
}

function createFishMesh() {
  const group = new THREE.Group();
  
  const bodyColor = Math.random();
  const bodyHue = (bodyColor * 0.3 + 0.05); // Reds, oranges, yellows
  const bodySaturation = 0.7 + Math.random() * 0.3;
  const bodyLightness = 0.35 + Math.random() * 0.25;
  const bodyMat = new THREE.Color().setHSL(bodyHue, bodySaturation, bodyLightness);
  
  // Main body (ellipsoid)
  const bodyGeometry = new THREE.IcosahedronGeometry(0.45, 4);
  const bodyMaterial = new THREE.MeshPhongMaterial({
    color: bodyMat,
    shininess: 80,
    emissive: new THREE.Color().setHSL(bodyHue, bodySaturation * 0.3, bodyLightness * 0.1),
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.castShadow = true;
  body.scale.set(1.2, 0.65, 0.5);
  group.add(body);
  
  // Belly (white/light colored)
  const bellyGeometry = new THREE.PlaneGeometry(1.0, 0.5);
  const bellyMaterial = new THREE.MeshPhongMaterial({
    color: 0xf5f5f5,
    shininess: 60,
    side: THREE.DoubleSide,
  });
  const belly = new THREE.Mesh(bellyGeometry, bellyMaterial);
  belly.position.z = 0.28;
  belly.scale.set(1.2, 0.65, 1);
  group.add(belly);
  
  // Back stripe (darker)
  const stripeGeometry = new THREE.PlaneGeometry(0.3, 0.5);
  const stripeMaterial = new THREE.MeshPhongMaterial({
    color: new THREE.Color().setHSL(bodyHue, bodySaturation, bodyLightness * 0.5),
    side: THREE.DoubleSide,
  });
  const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
  stripe.position.z = -0.28;
  stripe.scale.set(1.2, 0.65, 1);
  group.add(stripe);

  // Dorsal fin (top)
  const dorsalGeometry = new THREE.ConeGeometry(0.25, 0.6, 8);
  const dorsalMaterial = new THREE.MeshPhongMaterial({
    color: new THREE.Color().setHSL((bodyHue + 0.15) % 1, bodySaturation, bodyLightness),
    shininess: 40,
    side: THREE.DoubleSide,
  });
  const dorsal = new THREE.Mesh(dorsalGeometry, dorsalMaterial);
  dorsal.position.set(0, 0.5, 0);
  dorsal.rotation.z = Math.PI;
  dorsal.castShadow = true;
  group.add(dorsal);

  // Pectoral fins (sides)
  const pectoralGeometry = new THREE.ConeGeometry(0.2, 0.4, 6);
  const pectoralMaterial = new THREE.MeshPhongMaterial({
    color: new THREE.Color().setHSL((bodyHue + 0.25) % 1, bodySaturation * 0.8, bodyLightness + 0.1),
    shininess: 30,
    side: THREE.DoubleSide,
  });
  
  const pectoralLeft = new THREE.Mesh(pectoralGeometry, pectoralMaterial);
  pectoralLeft.position.set(-0.2, 0, 0.4);
  pectoralLeft.rotation.z = Math.PI / 2;
  pectoralLeft.castShadow = true;
  group.add(pectoralLeft);
  
  const pectoralRight = new THREE.Mesh(pectoralGeometry, pectoralMaterial);
  pectoralRight.position.set(-0.2, 0, -0.4);
  pectoralRight.rotation.z = Math.PI / 2;
  pectoralRight.castShadow = true;
  group.add(pectoralRight);

  // Anal fin (bottom front)
  const analGeometry = new THREE.ConeGeometry(0.15, 0.4, 6);
  const analMaterial = new THREE.MeshPhongMaterial({
    color: new THREE.Color().setHSL((bodyHue + 0.1) % 1, bodySaturation, bodyLightness),
    shininess: 25,
    side: THREE.DoubleSide,
  });
  const anal = new THREE.Mesh(analGeometry, analMaterial);
  anal.position.set(0, -0.45, 0);
  anal.castShadow = true;
  group.add(anal);

  // Tail (split fin)
  const tailTopGeometry = new THREE.ConeGeometry(0.2, 0.6, 8);
  const tailMaterial = new THREE.MeshPhongMaterial({
    color: new THREE.Color().setHSL((bodyHue - 0.1 + 1) % 1, bodySaturation, bodyLightness),
    shininess: 50,
    side: THREE.DoubleSide,
  });
  
  const tailTop = new THREE.Mesh(tailTopGeometry, tailMaterial);
  tailTop.position.set(-0.7, 0.2, 0);
  tailTop.rotation.z = Math.PI / 4;
  tailTop.castShadow = true;
  group.add(tailTop);
  
  const tailBottom = new THREE.Mesh(tailTopGeometry, tailMaterial);
  tailBottom.position.set(-0.7, -0.2, 0);
  tailBottom.rotation.z = -Math.PI / 4;
  tailBottom.castShadow = true;
  group.add(tailBottom);

  // Eyes
  const eyeGeometry = new THREE.SphereGeometry(0.1, 12, 12);
  const eyeMaterial = new THREE.MeshPhongMaterial({
    color: 0x000000,
    shininess: 100,
  });
  
  const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
  eye1.position.set(0.45, 0.2, 0.35);
  eye1.scale.set(0.8, 0.9, 0.8);
  group.add(eye1);

  const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
  eye2.position.set(0.45, 0.2, -0.35);
  eye2.scale.set(0.8, 0.9, 0.8);
  group.add(eye2);
  
  // Eye highlights
  const highlightGeometry = new THREE.SphereGeometry(0.04, 8, 8);
  const highlightMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
  
  const highlight1 = new THREE.Mesh(highlightGeometry, highlightMaterial);
  highlight1.position.set(0.52, 0.25, 0.35);
  group.add(highlight1);
  
  const highlight2 = new THREE.Mesh(highlightGeometry, highlightMaterial);
  highlight2.position.set(0.52, 0.25, -0.35);
  group.add(highlight2);
  
  // Mouth
  const mouthGeometry = new THREE.SphereGeometry(0.08, 8, 8);
  const mouthMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
  const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
  mouth.position.set(0.6, 0.05, 0);
  mouth.scale.set(0.7, 0.6, 0.6);
  group.add(mouth);

  return group;
}

function createSeahorseM() {
  const group = new THREE.Group();
  
  const bodyColor = 0.55 + Math.random() * 0.1; // Cyan-green range
  const bodySaturation = 0.6;
  const bodyLightness = 0.4 + Math.random() * 0.2;
  const bodyMat = new THREE.Color().setHSL(bodyColor, bodySaturation, bodyLightness);
  
  // Seahorse body segments
  const segmentCount = 8;
  for (let i = 0; i < segmentCount; i++) {
    const segmentGeometry = new THREE.IcosahedronGeometry(0.15 - i * 0.01, 3);
    const segmentMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(bodyColor + i * 0.02, bodySaturation, bodyLightness - i * 0.03),
      shininess: 60,
    });
    const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
    segment.position.set(-i * 0.35, 0, 0);
    segment.scale.set(1, 0.7, 0.7);
    segment.castShadow = true;
    group.add(segment);
  }
  
  // Head
  const headGeometry = new THREE.IcosahedronGeometry(0.25, 4);
  const headMaterial = new THREE.MeshPhongMaterial({
    color: new THREE.Color().setHSL(bodyColor - 0.05, bodySaturation, bodyLightness + 0.2),
    shininess: 70,
  });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.set(0.5, 0.3, 0);
  head.scale.set(1.1, 1.2, 0.9);
  head.castShadow = true;
  group.add(head);
  
  // Snout
  const snoutGeometry = new THREE.ConeGeometry(0.08, 0.4, 8);
  const snoutMaterial = new THREE.MeshPhongMaterial({
    color: new THREE.Color().setHSL(bodyColor, bodySaturation, bodyLightness - 0.1),
    shininess: 40,
  });
  const snout = new THREE.Mesh(snoutGeometry, snoutMaterial);
  snout.position.set(0.85, 0.35, 0);
  snout.rotation.z = Math.PI / 2;
  snout.castShadow = true;
  group.add(snout);
  
  // Curved tail (prehensile)
  const tailCurvePoints = [
    new THREE.Vector3(-3, 0, 0),
    new THREE.Vector3(-2.5, 0.3, 0.2),
    new THREE.Vector3(-2, 0.5, 0.5),
    new THREE.Vector3(-1.5, 0.6, 0.8),
    new THREE.Vector3(-1, 0.5, 1),
    new THREE.Vector3(-0.5, 0.2, 1.1),
  ];
  const tailCurve = new THREE.CatmullRomCurve3(tailCurvePoints);
  const tailGeometry = new THREE.TubeGeometry(tailCurve, 10, 0.1, 6, false);
  const tailMaterial = new THREE.MeshPhongMaterial({
    color: new THREE.Color().setHSL(bodyColor + 0.1, bodySaturation * 0.8, bodyLightness),
    shininess: 50,
  });
  const tail = new THREE.Mesh(tailGeometry, tailMaterial);
  tail.castShadow = true;
  group.add(tail);
  
  // Dorsal fin
  const dorsalGeometry = new THREE.ConeGeometry(0.15, 0.5, 8);
  const dorsalMaterial = new THREE.MeshPhongMaterial({
    color: new THREE.Color().setHSL((bodyColor + 0.15) % 1, bodySaturation, bodyLightness),
    side: THREE.DoubleSide,
  });
  const dorsal = new THREE.Mesh(dorsalGeometry, dorsalMaterial);
  dorsal.position.set(0, 0.4, 0);
  dorsal.rotation.z = Math.PI;
  dorsal.castShadow = true;
  group.add(dorsal);
  
  // Eyes
  const eyeGeometry = new THREE.SphereGeometry(0.08, 10, 10);
  const eyeMaterial = new THREE.MeshPhongMaterial({
    color: 0x000000,
    shininess: 100,
  });
  
  const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
  eye1.position.set(0.75, 0.45, 0.15);
  group.add(eye1);
  
  const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
  eye2.position.set(0.75, 0.45, -0.15);
  group.add(eye2);

  return group;
}

function updateFish() {
  state.fish.forEach((fish, index) => {
    // Boundary check with wrapping
    if (fish.x > 20) fish.x = -20;
    if (fish.x < -20) fish.x = 20;
    if (fish.z > 20) fish.z = -20;
    if (fish.z < -20) fish.z = 20;
    if (fish.y > 10) fish.vy *= -1;
    if (fish.y < -14) fish.vy *= -1;

    // Update position
    fish.x += fish.vx;
    fish.y += fish.vy;
    fish.z += fish.vz;

    // Slight random wandering
    fish.vx += (Math.random() - 0.5) * 0.002;
    fish.vy += (Math.random() - 0.5) * 0.001;
    fish.vz += (Math.random() - 0.5) * 0.002;

    // Speed limit
    const speed = Math.sqrt(fish.vx ** 2 + fish.vy ** 2 + fish.vz ** 2);
    if (speed > 0.08) {
      fish.vx = (fish.vx / speed) * 0.08;
      fish.vy = (fish.vy / speed) * 0.08;
      fish.vz = (fish.vz / speed) * 0.08;
    }

    // Update mesh position
    fish.mesh.position.set(fish.x, fish.y, fish.z);

    // Rotate fish to face direction of movement
    const direction = new THREE.Vector3(fish.vx, fish.vy, fish.vz);
    if (direction.length() > 0) {
      const angle = Math.atan2(fish.vz, fish.vx);
      fish.mesh.rotation.y = angle;
    }

    fish.time += 0.05;
  });
}

function updateGrass() {
  // Animate grass blades with gentle swaying motion
  scene.traverse((node) => {
    if (node.userData && node.userData.swayId !== undefined) {
      const time = performance.now() * 0.001;
      const sway = Math.sin(time * node.userData.swaySpeed + node.userData.swayId) * node.userData.swayAmount;
      node.rotation.z = node.userData.baseRotationZ + sway;
    }
  });
}

function createBubbles() {
  const particlesGeometry = new THREE.BufferGeometry();
  const particleCount = 100;
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const particlesMaterial = new THREE.PointsMaterial({
    color: 0x00ffff,
    size: 0.15,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.5,
  });

  const bubbles = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(bubbles);

  // Animate bubbles
  const originalPositions = new Float32Array(positions);
  setInterval(() => {
    const positions = particlesGeometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3 + 1] += 0.02;
      if (positions[i * 3 + 1] > 12) {
        positions[i * 3 + 1] = -10;
      }
    }
    particlesGeometry.attributes.position.needsUpdate = true;
  }, 16);

  return bubbles;
}

function createCaveTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Base color
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, 256, 256);

  // Add noise for rocky texture
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const brightness = Math.random() * 60;
    ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
    ctx.fillRect(x, y, 2, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  return texture;
}

// ========== CAMERA CONTROLS ==========
let cameraRotationAngle = 0;

function animateCamera() {
  if (state.cameraAutoRotate) {
    cameraRotationAngle += 0.0005;
    const radius = 18;
    camera.position.x = Math.cos(cameraRotationAngle) * radius;
    camera.position.z = Math.sin(cameraRotationAngle) * radius;
    camera.lookAt(0, 2, 0);
  }
}

// Mouse controls for manual rotation
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

renderer.domElement.addEventListener('mousedown', (e) => {
  isDragging = true;
  previousMousePosition = { x: e.clientX, y: e.clientY };
  state.cameraAutoRotate = false;
});

renderer.domElement.addEventListener('mousemove', (e) => {
  if (isDragging) {
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;

    const currentPos = camera.position;
    const radius = Math.sqrt(currentPos.x ** 2 + currentPos.z ** 2);
    let angle = Math.atan2(currentPos.z, currentPos.x);
    let elevation = Math.atan2(currentPos.y, Math.sqrt(currentPos.x ** 2 + currentPos.z ** 2));

    angle += deltaX * 0.01;
    elevation += deltaY * 0.01;
    elevation = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, elevation));

    camera.position.x = radius * Math.cos(angle) * Math.cos(elevation);
    camera.position.y = radius * Math.sin(elevation);
    camera.position.z = radius * Math.sin(angle) * Math.cos(elevation);
    camera.lookAt(0, 2, 0);

    previousMousePosition = { x: e.clientX, y: e.clientY };
  }
});

renderer.domElement.addEventListener('mouseup', () => {
  isDragging = false;
});

renderer.domElement.addEventListener('wheel', (e) => {
  e.preventDefault();
  const currentRadius = camera.position.length();
  const newRadius = currentRadius + e.deltaY * 0.02;
  const clampedRadius = Math.max(8, Math.min(40, newRadius));
  
  const normalized = new THREE.Vector3().copy(camera.position).normalize();
  camera.position.multiplyScalar(clampedRadius / currentRadius);
});

// ========== UI EVENTS ==========
document.getElementById('toggleAutoRotate').addEventListener('click', () => {
  state.cameraAutoRotate = !state.cameraAutoRotate;
});

document.getElementById('toggleLighting').addEventListener('click', () => {
  state.lightingOn = !state.lightingOn;
  // Hide/show all lights by toggling visibility
  scene.traverse((node) => {
    if (node instanceof THREE.Light) {
      node.visible = state.lightingOn;
    }
  });
});

document.getElementById('spawnFish').addEventListener('click', () => {
  createFish();
});

document.getElementById('enableCamera').addEventListener('click', async () => {
  // Stop old stream before retrying permission flow.
  const faceVideo = document.getElementById('faceVideo');
  if (faceVideo.srcObject) {
    faceVideo.srcObject.getTracks().forEach((track) => track.stop());
    faceVideo.srcObject = null;
  }
  state.faceDetector = null;
  await setupFaceDetection();
});

document.getElementById('resetScene').addEventListener('click', () => {
  state.fish.forEach((f) => scene.remove(f.mesh));
  state.fish = [];
  for (let i = 0; i < 5; i++) createFish();
});

// ========== ANIMATION LOOP ==========
function animate() {
  requestAnimationFrame(animate);

  animateCamera();
  updateFish();
  updateGrass();

  renderer.render(scene, camera);

  // Update FPS counter
  frameCount++;
  const now = Date.now();
  if (now - lastFrameTime >= 1000) {
    document.getElementById('stats').textContent = `Fish: ${state.fish.length} | FPS: ${frameCount}`;
    frameCount = 0;
    lastFrameTime = now;
  }
}

// ========== WINDOW RESIZE ==========
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ========== INITIALIZATION ==========
setupLighting();
createCave();
createAquaticPlants();
createBubbles();
setupFaceDetection();

// Spawn initial fish
for (let i = 0; i < 5; i++) {
  createFish();
}

animate();
