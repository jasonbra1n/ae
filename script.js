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
let leftOscillator = audioContext.createOscillator();
let rightOscillator = audioContext.createOscillator();
let leftGainNode = audioContext.createGain();
let rightGainNode = audioContext.createGain();
let leftPanner = audioContext.createStereoPanner();
let rightPanner = audioContext.createStereoPanner();
let leftLFO = audioContext.createOscillator();
let rightLFO = audioContext.createOscillator();

// Setup left oscillator
leftOscillator.type = 'sine';
leftOscillator.frequency.setValueAtTime(77, audioContext.currentTime);
leftGainNode.gain.setValueAtTime(0, audioContext.currentTime); // Ensure gain starts at 0
leftPanner.pan.setValueAtTime(-1, audioContext.currentTime); // Fully left
leftOscillator.connect(leftGainNode).connect(leftPanner).connect(audioContext.destination);

// Setup right oscillator
rightOscillator.type = 'sine';
rightOscillator.frequency.setValueAtTime(117, audioContext.currentTime);
rightGainNode.gain.setValueAtTime(0, audioContext.currentTime); // Ensure gain starts at 0
rightPanner.pan.setValueAtTime(1, audioContext.currentTime); // Fully right
rightOscillator.connect(rightGainNode).connect(rightPanner).connect(audioContext.destination);

// Setup LFOs for binaural effect
leftLFO.type = 'sine';
leftLFO.frequency.setValueAtTime(40, audioContext.currentTime);
const leftLFOGain = audioContext.createGain();
leftLFOGain.gain.setValueAtTime(0.5, audioContext.currentTime);
leftLFO.connect(leftLFOGain).connect(leftGainNode.gain);

rightLFO.type = 'sine';
rightLFO.frequency.setValueAtTime(40, audioContext.currentTime);
const rightLFOGain = audioContext.createGain();
rightLFOGain.gain.setValueAtTime(-0.5, audioContext.currentTime);
rightLFO.connect(rightLFOGain).connect(rightGainNode.gain);

// Start oscillators and LFOs after a delay to ensure silence on load
setTimeout(() => {
    leftOscillator.start();
    rightOscillator.start();
    leftLFO.start();
    rightLFO.start();
}, 100);

// Animation loop
function animate() {
    const now = performance.now();
    const deltaTime = Math.min((now - lastFrameTime) / 1000, 0.1);
    lastFrameTime = now;

    if (!isDragging) {
        spinVelocity *= 0.95; // Friction to slow down
        velX *= 0.9;
        velY *= 0.9;
        posX = Math.max(50, Math.min(window.innerWidth - 50, posX + velX));
        posY = Math.max(66, Math.min(window.innerHeight - 66, posY + velY));
        if (Math.abs(spinVelocity) < 0.1) spinVelocity = 0;
        rotateZ += spinVelocity * deltaTime * 60;

        // Update pitch and binaural frequency as egg slows
        adjustDragPitch(spinVelocity);
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
    oscillator.connect(gainNode).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
}

function startDragSound() {
    const fadeInDuration = 0.02; // 20ms fade-in
    leftGainNode.gain.cancelScheduledValues(audioContext.currentTime);
    rightGainNode.gain.cancelScheduledValues(audioContext.currentTime);
    leftGainNode.gain.setValueAtTime(leftGainNode.gain.value, audioContext.currentTime);
    rightGainNode.gain.setValueAtTime(rightGainNode.gain.value, audioContext.currentTime);
    leftGainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + fadeInDuration);
    rightGainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + fadeInDuration);
}

function adjustDragPitch(velocity) {
    const speed = Math.abs(velocity);
    const minBeatFreq = 2;
    const maxBeatFreq = 40;
    const beatFrequency = minBeatFreq + (maxBeatFreq - minBeatFreq) * (speed / 100); // Varies 2-40 Hz
    const pitchFactor = Math.max(0.5, Math.min(2, (speed / 100) + 0.5)); // Pitch range
    const baseCarrier = 77 * pitchFactor;

    leftOscillator.frequency.setValueAtTime(baseCarrier, audioContext.currentTime);
    rightOscillator.frequency.setValueAtTime(baseCarrier + beatFrequency, audioContext.currentTime);
    leftLFO.frequency.setValueAtTime(beatFrequency, audioContext.currentTime);
    rightLFO.frequency.setValueAtTime(beatFrequency, audioContext.currentTime);
}

function stopDragSound() {
    const fadeOutDuration = 0.5; // 500ms fade-out
    leftGainNode.gain.cancelScheduledValues(audioContext.currentTime);
    rightGainNode.gain.cancelScheduledValues(audioContext.currentTime);
    leftGainNode.gain.setValueAtTime(leftGainNode.gain.value, audioContext.currentTime);
    rightGainNode.gain.setValueAtTime(rightGainNode.gain.value, audioContext.currentTime);
    leftGainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + fadeOutDuration);
    rightGainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + fadeOutDuration);

    // Ensure gain stays at 0
    setTimeout(() => {
        leftGainNode.gain.setValueAtTime(0, audioContext.currentTime);
        rightGainNode.gain.setValueAtTime(0, audioContext.currentTime);
    }, fadeOutDuration * 1000);
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
    if (navigator.vibrate) navigator.vibrate([200, 50, 200, 50, 200]);
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
        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
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
        egg.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        if (navigator.vibrate) navigator.vibrate(0);
    }
}

// Event listeners (unchanged)
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
