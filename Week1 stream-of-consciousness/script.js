// ============================================
// STREAM OF CONSCIOUSNESS - Visual Thoughts
// ============================================

// Canvas setup
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const thoughts = [];

// Setup canvas size
function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - document.querySelector('.control-panel').offsetHeight;
}

setupCanvas();
window.addEventListener('resize', setupCanvas);

// ============================================
// THOUGHT CLASS
// ============================================

class Thought {
    constructor(emotionalValue, intensity) {
        this.emotionalValue = emotionalValue;  // -100 to +100
        this.intensity = intensity;             // 20 to 100
        
        this.setPosition();
        
        // Visual properties
        this.baseSize = 20 + (intensity / 100) * 40;
        this.currentSize = this.baseSize;
        this.opacity = 1;
        
        // Movement
        this.vx = (Math.random() - 0.5) * (intensity / 30);
        this.vy = Math.random() * (intensity / 50) - 0.3;
        
        this.color = this.getColorFromEmotionalValue();
        
        // Lifespan - much longer to stay visible
        this.lifespan = 1200 + intensity * 10;
        this.age = 0;
        this.fadeOutStart = this.lifespan * 0.7;
    }

    setPosition() {
        // Map emotional value to x position (left=negative, right=positive)
        const xPercent = (this.emotionalValue + 100) / 200;
        this.x = xPercent * canvas.width;
        this.y = canvas.height;
    }

    getColorFromEmotionalValue() {
        if (this.emotionalValue < -50) {
            return 'hsl(260, 70%, 50%)';
        } else if (this.emotionalValue < 0) {
            return 'hsl(220, 70%, 55%)';
        } else if (this.emotionalValue < 50) {
            return 'hsl(60, 100%, 60%)';
        } else {
            return 'hsl(30, 100%, 55%)';
        }
    }

    update() {
        this.age++;
        
        // Slow fade out
        let opacity = 1;
        if (this.age > this.fadeOutStart) {
            const fadeProgress = (this.age - this.fadeOutStart) / (this.lifespan - this.fadeOutStart);
            opacity = Math.max(0, 1 - fadeProgress);
        }
        this.opacity = opacity;
        this.currentSize = this.baseSize * Math.max(0.3, opacity);
        
        // Float upward
        this.x += this.vx;
        this.y -= this.vy;
        
        // Bounce at edges
        if (this.x < 0 || this.x > canvas.width) {
            this.vx *= -0.5;
        }
        
        return this.opacity > 0;
    }

    draw() {
        if (this.opacity <= 0) return;

        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        
        // Glow
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.intensity;
        
        // Draw blob
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// ============================================
// DRAWING FUNCTIONS
// ============================================

function drawUmbrellaGuide() {
    ctx.save();
    
    const centerX = canvas.width / 2;
    const baseY = canvas.height * 0.75;
    const arcRadius = canvas.width * 0.3;
    
    // Draw umbrella arc with gradient
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    const gradient = ctx.createLinearGradient(0, baseY, canvas.width, baseY);
    gradient.addColorStop(0, 'rgba(100, 150, 255, 0.4)');
    gradient.addColorStop(0.33, 'rgba(150, 150, 200, 0.4)');
    gradient.addColorStop(0.5, 'rgba(200, 200, 150, 0.4)');
    gradient.addColorStop(0.67, 'rgba(255, 180, 100, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 120, 100, 0.4)');
    
    ctx.strokeStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, baseY - arcRadius, arcRadius, Math.PI, 0, false);
    ctx.stroke();
    
    // Draw umbrella ribs
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 6; i++) {
        const x = (canvas.width / 6) * i;
        const angle = Math.PI - (i / 6) * Math.PI;
        const arcX = centerX + Math.cos(angle) * arcRadius;
        const arcY = baseY - Math.sin(angle) * arcRadius;
        ctx.beginPath();
        ctx.moveTo(x, baseY);
        ctx.lineTo(arcX, arcY);
        ctx.stroke();
    }
    
    ctx.restore();
}

function animate() {
    // Clear with fade effect
    ctx.fillStyle = 'rgba(26, 26, 46, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw thoughts
    for (let i = thoughts.length - 1; i >= 0; i--) {
        const isAlive = thoughts[i].update();
        thoughts[i].draw();
        
        if (!isAlive) {
            thoughts.splice(i, 1);
        }
    }
    
    // Draw umbrella
    drawUmbrellaGuide();
    
    requestAnimationFrame(animate);
}

// ============================================
// EVENT HANDLERS
// ============================================

function createThought() {
    const emotionalValue = parseInt(document.getElementById('emotional-value').value);
    const intensity = parseInt(document.getElementById('intensity').value);
    
    const newThought = new Thought(emotionalValue, intensity);
    thoughts.push(newThought);
    
    console.log(`Created thought: Emotion=${emotionalValue}, Intensity=${intensity}`);
}

function createRandomThought() {
    const randomEmotion = Math.random() * 200 - 100;
    const randomIntensity = Math.random() * 80 + 20;
    
    const newThought = new Thought(randomEmotion, randomIntensity);
    thoughts.push(newThought);
    
    console.log(`Random thought: Emotion=${randomEmotion.toFixed(0)}, Intensity=${randomIntensity.toFixed(0)}`);
}

function clearAllThoughts() {
    thoughts.length = 0;
    console.log('Cleared all thoughts');
}

// ============================================
// UI EVENT LISTENERS
// ============================================

document.getElementById('emotional-value').addEventListener('input', (e) => {
    document.getElementById('emotional-display').textContent = e.target.value;
});

document.getElementById('intensity').addEventListener('input', (e) => {
    document.getElementById('intensity-display').textContent = e.target.value;
});

document.getElementById('submit-btn').addEventListener('click', createThought);
document.getElementById('random-btn').addEventListener('click', createRandomThought);
document.getElementById('clear-btn').addEventListener('click', clearAllThoughts);

// ============================================
// START
// ============================================

animate();
console.log('Stream of Consciousness started!');
