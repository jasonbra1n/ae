const egg = document.getElementById('egg');
let isDragging = false;
let spinVelocity = 0;
let rotateX = 0;
let rotateZ = 0;
let posX = window.innerWidth / 2;
let posY = window.innerHeight / 2;
let velX = 0;
let velY = 0;
let lastFrameTime = performance.now();

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let leftOscillator = null;
let rightOscillator = null;
let leftGainNode = null;
let rightGainNode = null;
let leftPanner = null;
let rightPanner = null;
let leftLFO = null;
let rightLFO = null;

// Create cosmic particles
for (let i = 0; i < 80; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    const size = Math.random() * 2 + 1;
    Object.assign(particle.style, {
        width: `${size}px`,
        height: `${size}px`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 4}s`
    });
    document.body.appendChild(particle);
}

function animate() {
    const now = performance.now();
    const deltaTime = Math.min((now - lastFrameTime) / 1000, 0.1);
    lastFrameTime = now;

    if (!isDragging) {
        spinVelocity *= 0.95;
        velX *= 0.9;
        velY *= 0.9;
        posX = Math.max(50, Math.min(window.innerWidth - 50, posX + velX));
        posY = Math.max(66, Math.min(window.innerHeight - 66, posY + velY));
        if (Math.abs(spinVelocity) < 0.1) spinVelocity = 0;
        rotateZ += spinVelocity * deltaTime * 60;
    }

    egg.style.left = `${posX}px`;
    egg.style.top = `${posY}px`;
    egg.style.transform = `translate(-50%, -50%) rotateZ(${rotateZ}deg) rotateX(${rotateX}deg)`;
    requestAnimationFrame(animate);
}
animate();

let lastMouseX, lastMouseY, startX, startY, initialPosX, initialPosY;

function playTapSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
}

function startDragSound() {
    if (!leftOscillator) {
        // Left oscillator (carrier frequency: 77 Hz)
        leftOscillator = audioContext.createOscillator();
        leftGainNode = audioContext.createGain();
        leftPanner = audioContext.createStereoPanner();
        leftOscillator.type = 'sine';
        leftOscillator.frequency.setValueAtTime(77, audioContext.currentTime);
        leftGainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        leftPanner.pan.setValueAtTime(-1, audioContext.currentTime); // Fully left
        leftOscillator.connect(leftGainNode).connect(leftPanner).connect(audioContext.destination);

        // Right oscillator (carrier + beat frequency: 77 + 40 = 117 Hz)
        rightOscillator = audioContext.createOscillator();
        rightGainNode = audioContext.createGain();
        rightPanner = audioContext.createStereoPanner();
        rightOscillator.type = 'sine';
        rightOscillator.frequency.setValueAtTime(117, audioContext.currentTime);
        rightGainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        rightPanner.pan.setValueAtTime(1, audioContext.currentTime); // Fully right
        rightOscillator.connect(rightGainNode).connect(rightPanner).connect(audioContext.destination);

        // Panning oscillation with LFO-like effect using OscillatorNode
        leftLFO = audioContext.createOscillator();
        leftLFO.type = 'sine';
        leftLFO.frequency.setValueAtTime(40, audioContext.currentTime); // Beat frequency: 40 Hz
        const leftLFOGain = audioContext.createGain();
        leftLFOGain.gain.setValueAtTime(0.5, audioContext.currentTime); // Depth of oscillation
        leftLFO.connect(leftLFOGain).connect(leftGainNode.gain);
        leftGainNode.gain.setValueAtTime(0.5, audioContext.currentTime); // Base gain

        rightLFO = audioContext.createOscillator();
        rightLFO.type = 'sine';
        rightLFO.frequency.setValueAtTime(40, audioContext.currentTime);
        const rightLFOGain = audioContext.createGain();
        rightLFOGain.gain.setValueAtTime(-0.5, audioContext.currentTime); // Inverted for right
        rightLFO.connect(rightLFOGain).connect(rightGainNode.gain);
        rightGainNode.gain.setValueAtTime(0.5, audioContext.currentTime); // Base gain

        leftOscillator.start();
        rightOscillator.start();
        leftLFO.start();
        rightLFO.start();
    }
}

function adjustDragPitch(velocity) {
    if (leftOscillator && rightOscillator) {
        // Calculate pitch factor based on drag velocity (faster = higher pitch)
        const pitchFactor = Math.max(0.5, Math.min(2, (Math.abs(velocity) / 100) + 0.5));
        
        // Base frequencies with pitch fluctuation
        const baseCarrier = 77 * pitchFactor;
        const beatFrequency = 40; // Fixed beat frequency
        
        leftOscillator.frequency.setValueAtTime(baseCarrier, audioContext.currentTime);
        rightOscillator.frequency.setValueAtTime(baseCarrier + beatFrequency, audioContext.currentTime);
        
        // Adjust LFO frequency to match beat frequency (panning rate remains 40 Hz)
        leftLFO.frequency.setValueAtTime(beatFrequency, audioContext.currentTime);
        rightLFO.frequency.setValueAtTime(beatFrequency, audioContext.currentTime);
    }
}

function stopDragSound() {
    if (leftOscillator) {
        // Increase fade-out duration to 0.3 seconds for smoother transition
        leftGainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
        rightGainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
        leftOscillator.stop(audioContext.currentTime + 0.3);
        rightOscillator.stop(audioContext.currentTime + 0.3);
        leftLFO.stop(audioContext.currentTime + 0.3);
        rightLFO.stop(audioContext.currentTime + 0.3);
        
        leftOscillator = null;
        rightOscillator = null;
        leftGainNode = null;
        rightGainNode = null;
        leftPanner = null;
        rightPanner = null;
        leftLFO = null;
        rightLFO = null;
    }
}

function handleStart(x, y) {
    isDragging = true;
    playTapSound();
    startDragSound();
    adjustDragPitch(velX);
    lastMouseX = x;
    lastMouseY = y;
    startX = x;
    startY = y;
    initialPosX = posX;
    initialPosY = posY;
    egg.style.transition = 'none';
    
    if (navigator.vibrate) {
        navigator.vibrate([200, 50, 200, 50, 200]);
    }
}

function handleMove(x, y) {
    if (isDragging) {
        const deltaX = x - startX;
        const deltaY = y - startY;
        posX = initialPosX + deltaX;
        posY = initialPosY + deltaY;
        const spinDelta = x - lastMouseX;
        spinVelocity = spinDelta * 0.5;
        rotateZ += spinDelta * 0.3;
        velX = (x - lastMouseX) * 2;
        velY = (y - lastMouseY) * 2;
        adjustDragPitch(velX);
        lastMouseX = x;
        lastMouseY = y;
        
        if (navigator.vibrate) {
            navigator.vibrate([50, 50, 50]);
        }
    } else {
        const targetX = x - window.innerWidth / 2;
        const targetY = y - window.innerHeight / 2;
        rotateZ = targetX * 0.03;
        rotateX = -targetY * 0.03;
    }
}

function handleEnd() {
    if (isDragging) {
        isDragging = false;
        stopDragSound();
        // Remove playTapSound() from here
        egg.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        if (navigator.vibrate) {
            navigator.vibrate(0);
        }
    }
}

// Event listeners
egg.addEventListener('mousedown', (e) => handleStart(e.clientX, e.clientY));
document.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
document.addEventListener('mouseup', handleEnd);

egg.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
    e.preventDefault();
}, { passive: false });

document.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
    e.preventDefault();
}, { passive: false });

document.addEventListener('touchend', handleEnd);

window.addEventListener('resize', () => {
    if (!isDragging) {
        posX = window.innerWidth / 2;
        posY = window.innerHeight / 2;
    }
});
