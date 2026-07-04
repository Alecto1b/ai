# 🌊 Cumlaude AI Assistant

An advanced, interactive AI Assistant platform featuring a premium WebGL-powered 3D wave background, client-side session persistence, and secure local API proxy capabilities.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla%20%7C%20jQuery-yellow.svg)](#)
[![3D Graphics](https://img.shields.io/badge/3D%20Graphics-Three.js-orange.svg)](#)
[![Animation](https://img.shields.io/badge/Animation-GSAP-green.svg)](#)
[![Backend](https://img.shields.io/badge/Proxy%20Server-Python%203-blue.svg)](#)

---

## 🚀 Key Features

* **3D WebGL Wave Simulation**: Powered by **Three.js** with sophisticated post-processing pipelines, including `UnrealBloomPass`, custom `FilmGrainShader` noise, and `LuminosityHighPassShader` for glowing aesthetics.
* **Fluid Keyframe Animations**: Wave motion, transitions, and camera focal animations managed dynamically via **GSAP**.
* **NVIDIA NIM AI Integration**: Streamed AI responses powered by `deepseek-ai/deepseek-v4-flash` (with automated fallback to `meta/llama-3.1-8b-instruct`).
* **Multi-Mode Reasoning**:
  * **Standard Mode**: General chat interactions with real-time text streaming.
  * **Planning Mode**: Detailed structured planning for complex developer tasks.
  * **Deep Research**: Comprehensive analysis and structured inquiries.
* **Session Persistence & History**: Local conversation caching via browser `localStorage` displayed in either a responsive sliding sidebar or a central modal drawer.
* **UX Micro-animations**: Interactive prompt typing suggestions, border glow gradients, and responsive navigation menus.
* **CORS Proxy Backend**: Built-in multi-threaded Python server that serves project assets and proxies requests to `integrate.api.nvidia.com` to prevent browser CORS exceptions.

---

## 🛠️ Architecture & Tech Stack

* **Frontend**:
  * Semantic HTML5 & CSS3 Custom Properties (Glassmorphism & dark-theme design tokens)
  * Vanilla JS / jQuery 3.6.0 (DOM control, event handling, AJAX orchestration)
  * Three.js (WebGL renderer)
  * GSAP (GreenSock Animation Platform)
* **Backend**:
  * Python 3 (`http.server` & `socketserver.ThreadingMixIn` proxy wrapper)
* **AI Engine**:
  * NVIDIA NIM Serverless APIs

---

## 📁 Repository Structure

```text
├── .vscode/
│   └── launch.json        # Debugger and compound configurations for VS Code
├── index.html             # Main frontend entry point
├── style.css              # Styling sheet (layout, variables, animations)
├── app.js                 # Frontend application driver and NIM API client
├── server.py              # Local python proxy server
└── README.md              # Documentation (this file)
