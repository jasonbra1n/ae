# Celestial Dragon Egg

Welcome to the **Celestial Dragon Egg** project! This is an interactive web-based experiment featuring a draggable, spinning egg with cosmic particles, a nebula background, and immersive audio effects. Built with vanilla JavaScript, HTML, and CSS, this project showcases dynamic movement, Web Audio API sound design, and haptic feedback for a mystical user experience. The long-term vision is to make the egg more interactive, enabling it to learn from user interactions and communicate in creative ways.

## Features

- **Interactive Egg**: Click or touch the egg to drag it across the screen. Release it to watch it spin and slow down with inertia.
- **Cosmic Visuals**:
  - 80 twinkling particles scatter across a nebula-like background with fractal noise.
  - The egg features a glowing gradient, a dragon emblem, and a pulsing shadow effect.
- **Audio Effects**:
  - A satisfying "tap" sound (800 Hz sine wave) plays when you start dragging.
  - A binaural hum (77 Hz left, 117 Hz right, 40 Hz beat) with pitch tied to drag speed plays during movement, fading out over 0.3s on release.
- **Haptic Feedback**: Vibration patterns enhance the experience on supported devices (e.g., mobile).
- **Responsive Design**: The egg centers itself on window resize when idle.

## Demo

Try it out live at [https://jasonbra1n.github.io/ae/](https://jasonbra1n.github.io/ae/).

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/jasonbra1n/ae.git
   cd ae
   ```

2. **Open the Project**:
   - Use a local web server (e.g., `live-server` via VS Code, or Python's `http.server`) since the Web Audio API requires a secure context (HTTPS or localhost).
   - Opening `index.html` directly (`file://`) won’t work for audio features.

3. **Using a Local Server**:
   - With Python:
     ```bash
     python -m http.server 8000
     ```
   - Navigate to `http://localhost:8000` in your browser.

4. **Dependencies**:
   - No external libraries—just pure JavaScript, HTML, and CSS!

## Usage

- **Files**:
  - `index.html`: The main page with the egg, nebula, and particle setup.
  - `styles.css`: Styling for the egg, particles, and background.
  - `script.js`: Logic for movement, audio, and interaction.

- **Run**: Open `index.html` via your local server. Interact with the egg by clicking or touching it:
  - Drag to move and spin it.
  - Release to hear the sound fade and see it slow down.

## How It Works

- **Visuals**:
  - **Egg**: Styled with a radial gradient (`#fff3e0` to `#ff8080`), a glowing shadow, and an SVG dragon emblem.
  - **Background**: A radial gradient (`#1a0a2a` to `#000`) with a fractal noise overlay (`nebula` class).
  - **Particles**: 80 `<div>` elements with random sizes and positions, animated with a `twinkle` keyframe.

- **Movement**: 
  - Dragging updates `posX` and `posY`, with `spinVelocity` driving rotation.
  - After release, inertia (`spinVelocity *= 0.95`) slows the egg naturally.

- **Audio**:
  - **Tap Sound**: 800 Hz sine wave with a 0.2s exponential fade-out.
  - **Drag Sound**: Binaural sine waves (77 Hz left, 117 Hz right) with a 40 Hz beat frequency. Pitch scales with drag speed (`velX`), and sound fades out over 0.3s on release.

## Code Overview

- **`index.html`**:
  - Defines the structure with a `celestial-egg` div (id `egg`), a `nebula` overlay, and an inline SVG dragon emblem.
- **`styles.css`**:
  - Styles the egg, particles, and background with gradients, shadows, and animations.
- **`script.js`**:
  - Handles egg movement (`animate` loop), particle creation, audio (`playTapSound`, `startDragSound`, `adjustDragPitch`, `stopDragSound`), and event listeners.

## Goals

The ultimate aim is to evolve the Celestial Dragon Egg into a more interactive entity:
- **Learning**: Track user interactions (e.g., drag patterns, frequency of touches) to adapt its behavior over time.
- **Communication**: Introduce visual or auditory responses—like changing colors, emitting unique sounds, or subtle animations—to "talk back" to the user based on its "learned" understanding.

## Contributing

Fork this repo and submit pull requests with enhancements! Ideas to support the goals:
- Add a pitch ramp-down as the egg slows post-release for a "settling" effect.
- Implement a memory system (e.g., via `localStorage`) to record drag patterns.
- Experiment with visual feedback (e.g., color shifts or emblem animations) to reflect the egg’s state.
- Enhance audio with dynamic binaural beats tied to learned interactions.

## License

This project is licensed under the MIT License—see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by interactive web experiments and audio-visual art.
- Powered by the Web Audio API for immersive sound design.
