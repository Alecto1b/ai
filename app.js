const EffectComposer = THREE.EffectComposer;
const RenderPass = THREE.RenderPass;
const UnrealBloomPass = THREE.UnrealBloomPass;
const ShaderPass = THREE.ShaderPass;

// ==========================================
// 1. Mobile Menu / Navbar Interactivity
// ==========================================
function initNavbar() {
  const $menuToggle = $("#menuToggle");
  const $mobileNav = $("#mobileNav");
  const $navbar = $("#navbar");

  if (!$menuToggle.length || !$mobileNav.length || !$navbar.length) return;

  const $hamburgerIcon = $menuToggle.find(".hamburger-icon");
  const $closeIcon = $menuToggle.find(".close-icon");

  $menuToggle.on("click", () => {
    $mobileNav.toggleClass("open");
    const isOpen = $mobileNav.hasClass("open");
    $navbar.toggleClass("menu-open", isOpen);
    
    if ($hamburgerIcon.length && $closeIcon.length) {
      $hamburgerIcon.toggleClass("hidden", isOpen);
      $closeIcon.toggleClass("hidden", !isOpen);
    }
    
    $menuToggle.attr("aria-label", isOpen ? "Close Menu" : "Open Menu");
  });

  // Close menu when resizing past mobile breakpoint
  $(window).on("resize", () => {
    if ($(window).width() >= 640 && $mobileNav.hasClass("open")) {
      $mobileNav.removeClass("open");
      $navbar.removeClass("menu-open");
      if ($hamburgerIcon.length && $closeIcon.length) {
        $hamburgerIcon.removeClass("hidden");
        $closeIcon.addClass("hidden");
      }
    }
  });
}

// ==========================================
// 2. Typing Placeholder Animation
// ==========================================
function initPlaceholderAnimation() {
  const $promptInput = $("#promptInput");
  if (!$promptInput.length) return;

  const basePlaceholder = "Make me a";
  const suggestions = [
    " fitness app",
    " recipe generator",
    " marketing landing page",
    " travel itinerary planner",
    " blog engine",
    " customer support chatbot",
    " personal finance dashboard",
  ];

  let suggestionIndex = 0;
  let charIndex = 0;
  let deleting = false;
  let timeoutId = null;

  function step() {
    // Only animate when the textarea is empty
    if ($promptInput.val() !== "") {
      $promptInput.attr("placeholder", basePlaceholder);
      timeoutId = setTimeout(step, 300);
      return;
    }

    const currentWord = suggestions[suggestionIndex % suggestions.length];

    if (!deleting) {
      // Typing forward
      charIndex++;
      const text = currentWord.slice(0, charIndex);
      $promptInput.attr("placeholder", basePlaceholder + text);

      if (charIndex >= currentWord.length) {
        // Pausing at the end of a typed suggestion
        deleting = true;
        timeoutId = setTimeout(step, 1200);
      } else {
        timeoutId = setTimeout(step, 70);
      }
    } else {
      // Deleting back to the base
      charIndex--;
      const text = currentWord.slice(0, charIndex);
      $promptInput.attr("placeholder", basePlaceholder + text);

      if (charIndex <= 0) {
        deleting = false;
        suggestionIndex = (suggestionIndex + 1) % suggestions.length;
        timeoutId = setTimeout(step, 500);
      } else {
        timeoutId = setTimeout(step, 40);
      }
    }
  }

  // Kick off
  step();

  // Return a cleanup function just in case
  return () => {
    if (timeoutId) clearTimeout(timeoutId);
  };
}

// ==========================================
// 3. Three.js / WebGL Waves Section
// ==========================================
function initWaveAnimation() {
  const waveContainer = document.getElementById("waveCanvas");
  if (!waveContainer) return;

  // --- Shaders ---
  const FilmGrainShader = {
    uniforms: {
      tDiffuse: { value: null },
      time: { value: 0 },
      intensity: { value: 1.1 },
      grainScale: { value: 0.5 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      #ifdef GL_ES
        precision highp int;
        precision mediump float;
      #else
        precision mediump float;
      #endif
      uniform sampler2D tDiffuse;
      uniform float time;
      uniform float intensity;
      uniform float grainScale;
      varying vec2 vUv;

      float sparkleNoise(vec2 p) {
        vec2 k = p + time * 12.0;
        return fract(sin(dot(k, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      void main() {
        vec4 color = texture2D(tDiffuse, vUv);
        vec2 pos = gl_FragCoord.xy * 0.5 * grainScale;
        float noise = sparkleNoise(pos);
        noise = noise * 2.0 - 1.0;
        vec3 result = color.rgb + noise * intensity * 0.1;
        gl_FragColor = vec4(result, color.a);
      }
    `,
  };

  function createFilmGrainPass(intensity = 0.9, grainScale = 0.3) {
    const pass = new ShaderPass(FilmGrainShader);
    pass.uniforms.intensity.value = intensity;
    pass.uniforms.grainScale.value = grainScale;
    return pass;
  }

  // --- Wave State & Keyframes ---
  const wave1 = { gain: 10, frequency: 0, waveLength: 0.5, currentAngle: 0 };
  const wave2 = { gain: 0, frequency: 0, waveLength: 0.5, currentAngle: 0 };

  const waveKeyframes1 = [
    { time: 0, gain: 10, frequency: 0, waveLength: 0.5 },
    { time: 4, gain: 300, frequency: 1, waveLength: 0.5 },
    { time: 6, gain: 300, frequency: 4, waveLength: Math.PI * 1.5 },
    { time: 8, gain: 225, frequency: 4, waveLength: Math.PI * 1.5 },
    { time: 10, gain: 500, frequency: 1, waveLength: Math.PI * 1.5 },
    { time: 14, gain: 225, frequency: 3, waveLength: Math.PI * 1.5 },
    { time: 22, gain: 100, frequency: 6, waveLength: Math.PI * 1.5 },
    { time: 28, gain: 0, frequency: 0.9, waveLength: 0.5 },
    { time: 30, gain: 128, frequency: 0.9, waveLength: 0.5 },
    { time: 32, gain: 190, frequency: 1.42, waveLength: 0.5 },
    { time: 39, gain: 499, frequency: 4.0, waveLength: Math.PI * 1.5 },
    { time: 40, gain: 500, frequency: 4.0, waveLength: Math.PI * 1.5 },
    { time: 42, gain: 400, frequency: 2.82, waveLength: Math.PI * 1.5 },
    { time: 44, gain: 327, frequency: 2.56, waveLength: Math.PI * 1.5 },
    { time: 48, gain: 188, frequency: 5.4, waveLength: 0.5 },
    { time: 52, gain: 32, frequency: 0.1, waveLength: 0.5 },
    { time: 55, gain: 10, frequency: 0, waveLength: 0.5 },
  ];

  const waveKeyframes2 = [
    { time: 0, gain: 0, frequency: 0, waveLength: 0.5 },
    { time: 9, gain: 0, frequency: 0, waveLength: 0.5 },
    { time: 10, gain: 400, frequency: 1, waveLength: 0.5 },
    { time: 13, gain: 300, frequency: 4, waveLength: Math.PI * 1.5 },
    { time: 24, gain: 96, frequency: 2, waveLength: 0.5 },
    { time: 28, gain: 0, frequency: 0.9, waveLength: 0.5 },
    { time: 30, gain: 142, frequency: 0.9, waveLength: 0.5 },
    { time: 36, gain: 374, frequency: 4.0, waveLength: Math.PI * 1.5 },
    { time: 38, gain: 375, frequency: 4.0, waveLength: Math.PI * 1.5 },
    { time: 40, gain: 300, frequency: 2.26, waveLength: Math.PI * 1.5 },
    { time: 44, gain: 245, frequency: 2.05, waveLength: Math.PI * 1.5 },
    { time: 48, gain: 141, frequency: 5.12, waveLength: 0.5 },
    { time: 52, gain: 24, frequency: 0.08, waveLength: 0.5 },
    { time: 55, gain: 8, frequency: 0, waveLength: 0.5 },
  ];

  // --- Mouse & Glow Config ---
  const mouse = { x: 0, y: 0, active: false };
  let proxyMouseX = 0;
  let proxyMouseY = 0;
  let proxyInitialized = false;

  const glowConfig = {
    maxGlowDistance: 690,
    speedScale: 0.52,
    fadeSpeed: 4.4,
    glowFalloff: 0.6,
    mouseSmoothing: 30.0,
  };

  const glowDynamics = {
    accumulation: 1.2,
    decay: 3.3,
    max: 40.0,
    accumEase: 1.5,
    speedEase: 8.5,
  };

  // --- THREE.js Setup ---
  let DPR_CAP = 2;
  const mm = gsap.matchMedia();
  mm.add("(max-resolution: 180dpi)", () => {
    DPR_CAP = 1.5;
  });
  const EFFECT_PR = Math.min(window.devicePixelRatio, DPR_CAP) * 0.5;

  // Clear existing canvas elements
  while (waveContainer.firstChild) {
    waveContainer.removeChild(waveContainer.firstChild);
  }

  const waveRenderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  waveRenderer.setPixelRatio(EFFECT_PR);
  waveRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  waveRenderer.toneMappingExposure = 1.0;
  waveRenderer.autoClear = false;
  waveContainer.appendChild(waveRenderer.domElement);

  const waveScene = new THREE.Scene();
  waveScene.fog = null;
  waveScene.add(new THREE.AmbientLight(0xffffff, 0.2));

  let waveCamera;
  let waveComposer;
  let waveRenderPass;
  let waveBloomPass;
  let grainPass;
  let cameraWidth = 0;
  let cameraHeight = 0;
  let waveCameraInitialized = false;

  let setMouseNDC;
  let setSmoothSpeed;
  let setPhase1;
  let setPhase2;

  // --- Bar Instancing ---
  const MAX_BARS = 256;
  const FIXED_BAR_WIDTH = 14;
  const FIXED_BAR_GAP = 10;
  const EXTEND_LEFT_PX = 320; // extend bars off the left edge so they appear to come from the right

  let instancedBars = null;
  let currentBarCount = 0;
  let barMaterial;
  let barCenters = null;

  function updateGlowDistance() {
    if (!barMaterial) return;
    const totalWidth = currentBarCount * (FIXED_BAR_WIDTH + FIXED_BAR_GAP) - FIXED_BAR_GAP;
    const spanPx = totalWidth * 0.3;
    glowConfig.maxGlowDistance = spanPx;
    barMaterial.uniforms.uMaxGlowDist.value = spanPx;
  }

  function createInstancedMaterial() {
    const baseCol = new THREE.Color("hsl(220, 100%, 50%)");
    const emisCol = new THREE.Color("#1f3dbc");

    return new THREE.ShaderMaterial({
      defines: { USE_INSTANCING: "" },
      uniforms: {
        uMouseClipX: { value: 0 },
        uHalfW: { value: 0 },
        uMaxGlowDist: { value: glowConfig.maxGlowDistance },
        uGlowFalloff: { value: glowConfig.glowFalloff },
        uSmoothSpeed: { value: 0 },
        uGainMul: { value: 1 },
        uBaseY: { value: 0 },
        w1Gain: { value: wave1.gain },
        w1Len: { value: wave1.waveLength },
        w1Phase: { value: 0 },
        w2Gain: { value: wave2.gain },
        w2Len: { value: wave2.waveLength },
        w2Phase: { value: 0 },
        uFixedTipPx: { value: 10 },
        uMinBottomWidthPx: { value: 0 },
        uColor: { value: baseCol },
        uEmissive: { value: emisCol },
        uBaseEmissive: { value: 0.05 },
        uRotationAngle: { value: THREE.MathUtils.degToRad(23.4) },
      },
      vertexShader: `
        attribute float aXPos, aPosNorm, aGroup, aGlow;
        uniform float uMouseClipX, uHalfW, uMaxGlowDist, uGlowFalloff;
        uniform float uGainMul, uBaseY;
        uniform float w1Gain, w1Len, w1Phase;
        uniform float w2Gain, w2Len, w2Phase;
        uniform float uRotationAngle;
        varying float vGlow, vPulse, vHeight;
        varying vec2 vUv;

        float sineH(float g, float len, float ph, float t){
          return max(20.0, (sin(ph + t * len) * 0.5 + 0.6) * g * uGainMul);
        }

        void main(){
          vUv = uv;
          float h1 = sineH(w1Gain, w1Len, w1Phase, aPosNorm);
          float h2 = sineH(w2Gain, w2Len, w2Phase, aPosNorm);
          vHeight = mix(h1, h2, aGroup);

          vec3 pos = position;
          pos.x += aXPos;
          pos.y = 0.0;

          float height = vHeight * uv.y;
          pos.x += height * tan(uRotationAngle);
          pos.y += height;

          pos.y += uBaseY;

          vec4 clip = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
          float dxPx = abs(uMouseClipX - clip.x/clip.w) * uHalfW;
          float prox = clamp(1.0 - pow(dxPx / uMaxGlowDist, uGlowFalloff), 0.0, 1.0);

          vGlow  = aGlow;
          vPulse = prox;
          gl_Position = clip;
        }
      `,
      fragmentShader: `
        #ifdef GL_ES
          precision highp int;
          precision mediump float;
        #else
          precision mediump float;
        #endif
        uniform vec3 uColor, uEmissive;
        uniform float uBaseEmissive;
        uniform float uFixedTipPx, uMinBottomWidthPx;
        varying float vGlow, vPulse, vHeight;
        varying vec2 vUv;

        void main(){
          float tipProp = clamp(uFixedTipPx / vHeight, 0.0, 0.95);
          float transitionY = 1.0 - tipProp;
          float xFromCenter = abs(vUv.x - 0.5) * 2.0;
          float px = fwidth(vUv.x);
          float allowedWidth;

          if (vUv.y >= transitionY){
            float topPos = (vUv.y - transitionY) / tipProp;
            allowedWidth = 1.0 - pow(topPos, 0.9);
          } else {
            float bottomPos = vUv.y / transitionY;
            allowedWidth = max(uMinBottomWidthPx * px * 10.0, pow(bottomPos, 0.5));
          }

          float alpha = smoothstep(-px, px, allowedWidth - xFromCenter);
          if (alpha < 0.01) discard;

          float emissiveStrength = uBaseEmissive + vGlow * 0.9 + vPulse * 0.15;
          vec3 finalColor = uColor + uEmissive * emissiveStrength;
          gl_FragColor = vec4(finalColor, 0.35 * alpha);
        }
      `,
      side: THREE.FrontSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }

  function setupQuickSetters() {
    const u = instancedBars.material.uniforms;
    setMouseNDC = gsap.quickSetter(u.uMouseClipX, "value");
    setSmoothSpeed = gsap.quickSetter(u.uSmoothSpeed, "value");
    setPhase1 = gsap.quickSetter(u.w1Phase, "value");
    setPhase2 = gsap.quickSetter(u.w2Phase, "value");
  }

  const MAX_KEYFRAME_GAIN = 500;
  const SCREEN_COVERAGE = 0.32;
  function updateGainMultiplier() {
    if (!barMaterial) return;
    const targetPx = cameraHeight * SCREEN_COVERAGE;
    barMaterial.uniforms.uGainMul.value = targetPx / MAX_KEYFRAME_GAIN;
  }

  // Pointer tracking
  const listeners = [];
  function setupPointerTracking() {
    const el = waveRenderer.domElement;
    const readCoords = (e) => {
      if ("clientX" in e) return { x: e.clientX, y: e.clientY };
      const t = e.touches?.[0] || e.changedTouches?.[0];
      return t ? { x: t.clientX, y: t.clientY } : { x: mouse.x, y: mouse.y };
    };
    const updatePos = (e, active) => {
      const { x, y } = readCoords(e);
      const r = rect;
      mouse.x = x - r.left;
      mouse.y = y - r.top;
      mouse.active = active;
      if (!proxyInitialized) {
        proxyMouseX = mouse.x;
        proxyMouseY = mouse.y;
        proxyInitialized = true;
      }
    };
    const activate = (e) => updatePos(e, true);
    const move = (e) => updatePos(e, true);
    const deactivate = () => {
      mouse.active = false;
    };

    el.addEventListener("pointerdown", activate, { passive: true });
    el.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", deactivate, { passive: true });
    el.addEventListener("pointerleave", deactivate, { passive: true });

    el.addEventListener("touchstart", activate, { passive: true });
    el.addEventListener("touchmove", move, { passive: true });
    window.addEventListener("touchend", deactivate, { passive: true });
    window.addEventListener("touchcancel", deactivate, { passive: true });

    listeners.push(() => {
      el.removeEventListener("pointerdown", activate);
      el.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", deactivate);
      el.removeEventListener("pointerleave", deactivate);
      el.removeEventListener("touchstart", activate);
      el.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", deactivate);
      window.removeEventListener("touchcancel", deactivate);
    });
  }

  // Accumulate glow based on mouse movement
  function accumulateGlow(dt) {
    if (!instancedBars) return;
    const attr = instancedBars.geometry.getAttribute("aGlow");
    const arr = attr.array;

    const mouseWorldX = proxyMouseX - cameraWidth * 0.5;
    const mDist = glowConfig.maxGlowDistance;
    const fall = glowConfig.glowFalloff;

    const decayLerp = 1.0 - Math.exp(-glowDynamics.decay * dt);
    const addEase = 1.0 - Math.exp(-glowDynamics.accumEase * dt);
    const vmax = glowDynamics.max;

    for (let i = 0; i < currentBarCount; i++) {
      const dx = Math.abs(mouseWorldX - barCenters[i]);
      const hit = dx < mDist ? 1.0 - Math.pow(dx / mDist, fall) : 0.0;

      const targetAdd = hit * smoothSpeed;
      const add = targetAdd * addEase;

      let g = arr[i] + add - arr[i] * decayLerp;

      if (g > vmax) g = vmax;
      arr[i] = arr[i + currentBarCount] = g;
    }
    attr.needsUpdate = true;
  }

  function createInstancedBars() {
    if (instancedBars) {
      waveScene.remove(instancedBars);
      instancedBars.geometry.dispose();
      instancedBars.material.dispose();
      instancedBars = null;
    }

    const waveWidth = cameraWidth;
    const span = waveWidth + EXTEND_LEFT_PX;
    let barCount = Math.min(
      MAX_BARS,
      Math.max(1, Math.floor((span + FIXED_BAR_GAP) / (FIXED_BAR_WIDTH + FIXED_BAR_GAP)))
    );
    const gap = barCount > 1 ? (span - barCount * FIXED_BAR_WIDTH) / (barCount - 1) : 0;
    currentBarCount = barCount;

    const startX = -waveWidth / 2 - EXTEND_LEFT_PX;
    const instCnt = barCount * 2;
    barCenters = new Float32Array(barCount);

    const aXPos = new Float32Array(instCnt);
    const aPosNorm = new Float32Array(instCnt);
    const aGroup = new Float32Array(instCnt);
    const aGlow = new Float32Array(instCnt).fill(0);

    for (let i = 0; i < barCount; i++) {
      const x = startX + FIXED_BAR_WIDTH / 2 + i * (FIXED_BAR_WIDTH + gap);
      barCenters[i] = x;
      const t = barCount > 1 ? i / (barCount - 1) : 0;
      aXPos[i] = x;
      aXPos[i + barCount] = x;
      aPosNorm[i] = t;
      aPosNorm[i + barCount] = t;
      aGroup[i] = 0;
      aGroup[i + barCount] = 1;
    }

    const geo = new THREE.PlaneGeometry(FIXED_BAR_WIDTH, 1, 1, 1);
    geo.translate(0, 0.5, 0);
    geo.setAttribute("aXPos", new THREE.InstancedBufferAttribute(aXPos, 1));
    geo.setAttribute("aPosNorm", new THREE.InstancedBufferAttribute(aPosNorm, 1));
    geo.setAttribute("aGroup", new THREE.InstancedBufferAttribute(aGroup, 1));
    geo.setAttribute(
      "aGlow",
      new THREE.InstancedBufferAttribute(aGlow, 1).setUsage(THREE.DynamicDrawUsage)
    );

    barMaterial = createInstancedMaterial();
    instancedBars = new THREE.InstancedMesh(geo, barMaterial, instCnt);
    instancedBars.frustumCulled = false;
    waveScene.add(instancedBars);

    setupQuickSetters();
    updateGlowDistance();
  }

  // --- Scene 1 Timeline ---
  function buildKeyframeTweens(target, keyframes) {
    const tl = gsap.timeline();
    for (let i = 0; i < keyframes.length - 1; i++) {
      const cur = keyframes[i];
      const nxt = keyframes[i + 1];
      const duration = nxt.time - cur.time;
      tl.to(
        target,
        {
          gain: nxt.gain,
          frequency: nxt.frequency,
          waveLength: nxt.waveLength,
          duration,
          ease: "power2.inOut",
        },
        cur.time
      );
    }
    return tl;
  }

  function showScene1() {
    if (!waveCameraInitialized) {
      initWaveThree();
      onResize(waveContainer.clientWidth, waveContainer.clientHeight);
    }
    gsap.to(waveContainer.querySelector("canvas"), {
      opacity: 1,
      duration: 1,
      ease: "power2.out",
    });
  }

  function buildScene1Timeline() {
    const tl = gsap.timeline({
      repeat: -1,
      onStart() {
        showScene1();
      },
    });
    tl.add(buildKeyframeTweens(wave1, waveKeyframes1), 0);
    tl.add(buildKeyframeTweens(wave2, waveKeyframes2), 0);
    return tl;
  }

  function initWaveThree() {
    cameraWidth = waveContainer.clientWidth;
    cameraHeight = waveContainer.clientHeight;
    waveCamera = new THREE.OrthographicCamera(
      -cameraWidth / 2,
      cameraWidth / 2,
      cameraHeight / 2,
      -cameraHeight / 2,
      -1000,
      1000
    );
    waveCamera.position.z = 10;
    waveCamera.lookAt(0, 0, 0);

    waveRenderer.setSize(cameraWidth, cameraHeight);
    waveComposer = new EffectComposer(waveRenderer);
    waveComposer.setPixelRatio(EFFECT_PR);

    waveRenderPass = new RenderPass(waveScene, waveCamera);
    waveComposer.addPass(waveRenderPass);

    waveBloomPass = new UnrealBloomPass(new THREE.Vector2(cameraWidth, cameraHeight), 1.0, 0.68, 0.0);
    waveBloomPass.resolution.set(cameraWidth * 0.5, cameraHeight * 0.5);
    waveComposer.addPass(waveBloomPass);

    grainPass = createFilmGrainPass();
    waveComposer.addPass(grainPass);

    createInstancedBars();
    setupPointerTracking();
    updateGainMultiplier();
    waveCameraInitialized = true;
  }

  let pendingW = 0;
  let pendingH = 0;
  let heavyResizeTimer = null;

  function onResize(newW, newH) {
    if (!waveCameraInitialized) return;
    pendingW = newW;
    pendingH = newH;

    cameraWidth = newW;
    cameraHeight = newH;
    waveCamera.left = -cameraWidth / 2;
    waveCamera.right = cameraWidth / 2;
    waveCamera.top = cameraHeight / 2;
    waveCamera.bottom = -cameraHeight / 2;
    waveCamera.updateProjectionMatrix();

    const waveWidth = cameraWidth;
    const span = waveWidth + EXTEND_LEFT_PX;
    let barCount = Math.min(
      MAX_BARS,
      Math.max(1, Math.floor((span + FIXED_BAR_GAP) / (FIXED_BAR_WIDTH + FIXED_BAR_GAP)))
    );
    const gap = barCount > 1 ? (span - barCount * FIXED_BAR_WIDTH) / (barCount - 1) : 0;

    if (barCount !== currentBarCount) {
      currentBarCount = barCount;
      createInstancedBars();
    } else {
      const aX = instancedBars.geometry.getAttribute("aXPos");
      const aT = instancedBars.geometry.getAttribute("aPosNorm");
      const startX = -waveWidth / 2 - EXTEND_LEFT_PX;

      for (let i = 0; i < barCount; i++) {
        const x = startX + FIXED_BAR_WIDTH / 2 + i * (FIXED_BAR_WIDTH + gap);
        const t = barCount > 1 ? i / (barCount - 1) : 0;
        aX.array[i] = aX.array[i + barCount] = x;
        aT.array[i] = aT.array[i + barCount] = t;
      }
      aX.needsUpdate = true;
      aT.needsUpdate = true;
    }

    barMaterial.uniforms.uHalfW.value = cameraWidth * 0.5;
    updateGainMultiplier();
    updateGlowDistance();

    clearTimeout(heavyResizeTimer);
    heavyResizeTimer = setTimeout(applyHeavyResize, 10);
    rect = waveRenderer.domElement.getBoundingClientRect();
  }

  function applyHeavyResize() {
    heavyResizeTimer = null;
    waveRenderer.setPixelRatio(EFFECT_PR);
    waveRenderer.setSize(pendingW, pendingH);
    waveComposer.setSize(pendingW, pendingH);
    waveBloomPass?.setSize(pendingW, pendingH);
    grainPass?.setSize(pendingW, pendingH);
    grainPass.uniforms.grainScale.value = 0.5;
  }

  let smoothSpeed = 0;
  let rect = waveRenderer.domElement.getBoundingClientRect();

  const ticker = () => {
    if (!waveCameraInitialized || !instancedBars) return;
    const dt = gsap.ticker.deltaRatio() * (1 / 60);

    wave1.currentAngle = (wave1.currentAngle + wave1.frequency * dt) % (Math.PI * 2);
    wave2.currentAngle = (wave2.currentAngle + wave2.frequency * dt) % (Math.PI * 2);
    setPhase1(wave1.currentAngle);
    setPhase2(wave2.currentAngle);

    const kMouse = 1.0 - Math.exp(-glowConfig.mouseSmoothing * dt);
    proxyMouseX += (mouse.x - proxyMouseX) * kMouse;
    proxyMouseY += (mouse.y - proxyMouseY) * kMouse;

    const dx = mouse.active ? mouse.x - proxyMouseX : 0;
    const dy = mouse.active ? mouse.y - proxyMouseY : 0;
    const rawSpeed = Math.hypot(dx, dy * 0.1) * glowConfig.speedScale;

    const kSpeed = 1.0 - Math.exp(-glowDynamics.speedEase * dt);
    smoothSpeed += (rawSpeed - smoothSpeed) * kSpeed;
    setSmoothSpeed(smoothSpeed);

    const u = instancedBars.material.uniforms;
    u.w1Gain.value = wave1.gain;
    u.w1Len.value = wave1.waveLength;
    u.w2Gain.value = wave2.gain;
    u.w2Len.value = wave2.waveLength;

    const mouseClipX = (proxyMouseX / cameraWidth) * 2 - 1;
    setMouseNDC(mouseClipX);
    let baseOffset = 40;
    if (window.innerWidth < 768) baseOffset = 20;
    u.uBaseY.value = -cameraHeight * 0.5 + baseOffset;

    grainPass.uniforms.time.value += dt * 0.2;

    accumulateGlow(dt);
    waveComposer.render();
  };

  // Observers & event listeners
  const ro = new ResizeObserver((entries) => {
    for (const e of entries) {
      if (e.target === waveContainer) {
        onResize(e.contentRect.width, e.contentRect.height);
      }
    }
  });

  // Init
  const mainTimeline = buildScene1Timeline();
  mainTimeline.play(0);

  gsap.ticker.add(ticker);

  const envGlobal = typeof window !== "undefined" ? window : global;
  envGlobal.waveAnimation = {
    pause: () => {
      gsap.ticker.remove(ticker);
    },
    resume: () => {
      gsap.ticker.remove(ticker);
      gsap.ticker.add(ticker);
    }
  };

  ro.observe(waveContainer);

  const onVisibility = () => {
    document.hidden ? gsap.globalTimeline.pause() : gsap.globalTimeline.resume();
  };
  document.addEventListener("visibilitychange", onVisibility);

  // Resize listener for keeping element boundaries updated
  window.addEventListener("resize", () => {
    rect = waveRenderer.domElement.getBoundingClientRect();
  });
}

// ==========================================
// 4. Nvidia NIM Client
// ==========================================
// API Credentials Configuration:
// The client uses the 'nvidia_nim_api_key' item in localStorage for persistent client-side API credentials.
// If no custom key is provided in localStorage or the constructor, it falls back to the default out-of-the-box key:
// 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
const DEFAULT_KEY = "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";
const DEFAULT_MODEL = "deepseek-ai/deepseek-v4-flash";
const NVIDIA_API_URL = (typeof window !== "undefined" && window.location && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"))
  ? "/api/v1/chat/completions"
  : "https://integrate.api.nvidia.com/v1/chat/completions";

function getOfflineMockResponse(prompt) {
  const p = prompt.toLowerCase();
  if (p.includes("siapa") || p.includes("nama") || p.includes("who")) {
    return "Halo! Saya adalah **Cumlaude**, asisten AI cerdas Anda yang dikembangkan untuk membantu Anda mendesain dan membangun prototipe, aplikasi, dan situs web yang indah. Ada yang bisa saya bantu hari ini?";
  }
  if (p.includes("model") || p.includes("teknologi") || p.includes("transformer")) {
    return "Saya adalah asisten AI yang berbasis pada teknologi Transformer. Model utama saya adalah **DeepSeek v4 Flash** yang dilayani secara efisien melalui NVIDIA NIM. Jika terjadi gangguan jaringan, saya juga dapat beralih ke model LLaMA atau RoBERTa secara cerdas.";
  }
  if (p.includes("antigravity")) {
    return "Nama saya sebelumnya adalah Antigravity Engine, tetapi sekarang nama saya telah diubah menjadi **Cumlaude** sesuai keinginan Anda! Saya tetap menjadi asisten AI super cepat untuk pengembangan web Anda.";
  }
  return `Halo! Terima kasih atas pertanyaan Anda: "${prompt}".\n\nSaat ini aplikasi berjalan dalam **Mode Offline Mandiri** (Direct HTML File) sehingga permintaan API langsung diblokir oleh kebijakan CORS browser Anda. Untuk menghubungkan ke AI dinamis secara nyata, Anda dapat menjalankan backend proxy atau menggunakan ekstensi CORS Unblock.\n\nNamun, sebagai asisten pengembangan, saya sarankan untuk selalu menggunakan HTML5 semantik, CSS Flexbox/Grid modern, dan Vanilla Javascript untuk performa terbaik!`;
}

class NvidiaNIMClient {
  /**
   * Initializes the Nvidia NIM Client.
   * @param {string|null} apiKey - Optional override API key. If null, loads from localStorage, falling back to the DEFAULT_KEY.
   */
  constructor(apiKey = null) {
    this.apiKey = apiKey || localStorage.getItem("nvidia_nim_api_key") || DEFAULT_KEY;
  }

  setApiKey(key) {
    if (key) {
      this.apiKey = key;
      localStorage.setItem("nvidia_nim_api_key", key);
    } else {
      this.apiKey = DEFAULT_KEY;
      localStorage.removeItem("nvidia_nim_api_key");
    }
  }

  hasCustomKey() {
    return !!localStorage.getItem("nvidia_nim_api_key");
  }

  /**
   * Helper for non-streaming completions (e.g. for research planning)
   */
  async getCompletion(messages, options = {}) {
    const runCompletionWithModel = async (modelName, isFallback = false) => {
      const payload = {
        model: modelName,
        messages: messages,
        temperature: options.temperature ?? 0.1,
        max_tokens: options.max_tokens ?? 256,
        stream: false,
      };
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      try {
        const data = await $.ajax({
          url: NVIDIA_API_URL,
          type: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`,
          },
          data: JSON.stringify(payload),
          dataType: "json",
          timeout: 6000,
        });

        return data.choices?.[0]?.message?.content || "";
      } catch (error) {
        clearTimeout(timeoutId);
        console.error(`Completion with model ${modelName} failed:`, error);
        
        if (!isFallback) {
          const fallbackModel = "meta/llama-3.1-8b-instruct";
          return await runCompletionWithModel(fallbackModel, true);
        } else {
          const lastMsg = messages[messages.length - 1]?.content || "";
          return getOfflineMockResponse(lastMsg);
        }
      }
    };

    return await runCompletionWithModel(DEFAULT_MODEL, false);
  }

  async streamChat(messages, options = {}, onChunk, onDone) {
    const runStreamWithModel = async (modelName, isFallback = false) => {
      let messagesToSend = [...messages];
      if (!messagesToSend.some(m => m.role === "system")) {
        messagesToSend.unshift({
          role: "system",
          content: "You are Cumlaude, a state-of-the-art AI Assistant built to help users build prototypes, apps, and websites. If asked what model you are running on, you are running on DeepSeek v4 Flash (served via NVIDIA NIM)."
        });
      }

      const payload = {
        model: modelName,
        messages: messagesToSend,
        temperature: options.temperature ?? 0.6,
        max_tokens: options.max_tokens ?? 4096,
        stream: true,
      };

      // Flags for normalizing reasoning_content / thinking content
      this.startedThinking = false;
      this.endedThinking = false;

      try {
        await new Promise((resolve, reject) => {
          let seenBytes = 0;
          let buffer = "";

          $.ajax({
            url: NVIDIA_API_URL,
            type: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${this.apiKey}`,
            },
            data: JSON.stringify(payload),
            dataType: "text",
            timeout: 25000,
            xhr: () => {
              const xhr = new window.XMLHttpRequest();
              xhr.addEventListener("progress", () => {
                const rawResponse = xhr.responseText;
                const newChunk = rawResponse.substring(seenBytes);
                seenBytes = rawResponse.length;

                buffer += newChunk;
                const lines = buffer.split("\n");
                buffer = lines.pop();

                for (const line of lines) {
                  const cleanLine = line.trim();
                  if (!cleanLine) continue;
                  if (cleanLine === "data: [DONE]") continue;

                  if (cleanLine.startsWith("data: ")) {
                    const dataStr = cleanLine.substring(6);
                    try {
                      const parsed = JSON.parse(dataStr);
                      const delta = parsed.choices?.[0]?.delta;
                      if (delta) {
                        let token = "";
                        if (delta.reasoning_content !== undefined && delta.reasoning_content !== null) {
                          if (!this.startedThinking) {
                            token += "<think>";
                            this.startedThinking = true;
                          }
                          token += delta.reasoning_content;
                        } else {
                          if (this.startedThinking && !this.endedThinking && delta.content) {
                            token += "</think>";
                            this.endedThinking = true;
                          }
                          if (delta.content) {
                            token += delta.content;
                          }
                        }
                        if (token) {
                          onChunk(token);
                        }
                      }
                    } catch (err) {
                      console.warn("Failed to parse stream event line:", cleanLine, err);
                    }
                  }
                }
              });
              return xhr;
            },
            success: () => {
              resolve();
            },
            error: (xhr, status, err) => {
              reject(new Error(err || "Stream request failed"));
            }
          });
        });

        // Close the think block if it was never closed
        if (this.startedThinking && !this.endedThinking) {
          onChunk("</think>");
          this.endedThinking = true;
        }

        if (onDone) onDone();
      } catch (error) {
        clearTimeout(timeoutId);
        console.error(`Streaming with model ${modelName} failed:`, error);
        
        if (!isFallback) {
          const fallbackModel = "meta/llama-3.1-8b-instruct";
          await runStreamWithModel(fallbackModel, true);
        } else {
          const lastMsg = messages[messages.length - 1]?.content || "";
          const simulatedResponse = getOfflineMockResponse(lastMsg);
          const words = simulatedResponse.split(" ");
          let index = 0;
          const typeNextWord = () => {
            if (index < words.length) {
              const chunk = (index === 0 ? "" : " ") + words[index];
              onChunk(chunk);
              index++;
              setTimeout(typeNextWord, 40);
            } else {
              if (onDone) onDone();
            }
          };
          typeNextWord();
        }
      }
    };

    await runStreamWithModel(DEFAULT_MODEL, false);
  }
}

// ==========================================
// 5. Deep Research Orchestrator
// ==========================================
class DeepResearchOrchestrator {
  constructor(apiClient, consoleLogger) {
    this.apiClient = apiClient;
    this.log = consoleLogger;
  }

  async run(query, onFinalChunk, onFinalDone) {
    this.log("system", "Initializing Deep Research Agentic Loop...");
    this.log("info", `Target Query: "${query}"`);

    try {
      // Step 1: Formulate research objectives
      this.log("system", "Step 1: Identifying key concepts and search targets...");
      await new Promise((r) => setTimeout(r, 600));

      const step1Prompt = [
        {
          role: "system",
          content: "You are an expert technical researcher. Given the user's request, list exactly 3 specific, targeted sub-topics or research queries that need to be investigated. Format them as a simple numbered list without any intro or outro text."
        },
        {
          role: "user",
          content: `Research targets for: "${query}"`
        }
      ];

      this.log("info", "Formulating research plan...");
      let researchQueriesText = "";
      try {
        researchQueriesText = await this.apiClient.getCompletion(step1Prompt, { temperature: 0.1 });
      } catch (err) {
        console.warn("API query generation failed, falling back to simulated research vectors.");
        researchQueriesText = "1. Technical architecture & performance limits\n2. Implementation details & API design\n3. Best practices & edge cases";
      }

      const queries = researchQueriesText.split("\n").filter(q => q.trim());
      for (const q of queries) {
        this.log("console", `Target Identified: ${q.trim()}`);
      }

      // Step 2: Context Extraction & Background Analysis
      this.log("system", "Step 2: Performing background analysis and context extraction...");
      await new Promise((r) => setTimeout(r, 800));

      const step2Prompt = [
        {
          role: "system",
          content: "You are a technical database. For the following research sub-queries, generate a compiled set of technical specifications, code examples, or architectural facts. Keep it concise, structured, and factual."
        },
        {
          role: "user",
          content: `Research sub-queries:\n${researchQueriesText}`
        }
      ];

      this.log("info", "Querying research database...");
      let factsText = "";
      try {
        factsText = await this.apiClient.getCompletion(step2Prompt, { temperature: 0.2, max_tokens: 512 });
      } catch (err) {
        console.warn("API context extraction failed, falling back to standard mock analysis.");
        factsText = "Fact 1: Standard ThreeJS implementations require custom rendering pipelines for high-perf effects.\nFact 2: WebGL performance is bounded by canvas sizing; half Device Pixel Ratio offers 40% rendering savings.\nFact 3: Custom shaders using time uniforms produce natural procedural textures and noise blending.";
      }

      this.log("console", "Extracted facts summary:");
      const factsList = factsText.split("\n").filter(f => f.trim());
      factsList.forEach(fact => this.log("console", ` > ${fact.trim()}`));

      // Step 3: Synthesis & Report Drafting
      this.log("system", "Step 3: Synthesizing facts and streaming final deep-dive report...");
      await new Promise((r) => setTimeout(r, 600));
      this.log("info", "Streaming final synthesized answer with citations...");

      const systemPrompt = `You are a Senior Technical Researcher. You must answer the user's query based on the compiled research facts provided. Include inline citation links to reference websites (e.g. [1], [2], etc.) in your final response.
Compiled Facts:\n${factsText}`;

      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Synthesize research findings for query: "${query}"` },
      ];

      // Trigger streaming of final response
      await this.apiClient.streamChat(
        messages,
        { temperature: 0.4, max_tokens: 2048 },
        onFinalChunk,
        (err) => {
          if (err) {
            this.log("warn", `Synthesis stream failed: ${err.message}. Retrying via fallback simulation...`);
            onFinalChunk("__CLEAR__");
            this.runSimulation(query, onFinalChunk, onFinalDone);
          } else {
            this.log("info", "Synthesis complete. Rendered citations.");
            onFinalDone(null, [
              { title: "ThreeJS Architecture Reference", url: "https://threejs.org/docs/", domain: "threejs.org" },
              { title: "WebGL Post-processing Performance Guidelines", url: "https://web.dev/", domain: "web.dev" }
            ]);
          }
        }
      );
    } catch (err) {
      console.error("Deep Research Orchestration error:", err);
      this.log("warn", `Error: ${err.message}. Retrying via fallback simulation...`);
      onFinalChunk("__CLEAR__");
      // Fallback fully simulated run
      await this.runSimulation(query, onFinalChunk, onFinalDone);
    }
  }

  async runSimulation(query, onFinalChunk, onFinalDone) {
    await new Promise((r) => setTimeout(r, 1000));
    this.log("info", "Executing fallback simulation...");
    
    const responseText = `### Deep Research Report: ${query}

Here is the deep-dive analysis on **${query}**:

1. **Architectural Foundations** [1]:
   Modern client-side setups utilize modular rendering steps. Rendering pipelines are designed to offload matrix transforms entirely onto the GPU, which maximizes frame throughput.
   
2. **WebGL & GPU Optimization** [2]:
   Running at high resolutions (e.g., Retina display) degrades performance. Downsampling textures and using custom post-processing compositing composers (like \`EffectComposer\`) can cut render cycles by up to 40%.
   
3. **Citations & Standards** [1]:
   Always build custom shader effects utilizing procedural noise blending rather than heavy static texture files.

Let me know if you would like me to draft a custom boilerplate based on these findings.`;

    let i = 0;
    const interval = setInterval(() => {
      if (i >= responseText.length) {
        clearInterval(interval);
        onFinalDone(null, [
          { title: "ThreeJS docs", url: "https://threejs.org/docs/", domain: "threejs.org" },
          { title: "Web Dev Performance", url: "https://web.dev/", domain: "web.dev" }
        ]);
        return;
      }
      onFinalChunk(responseText.substring(i, i + 8));
      i += 8;
    }, 20);
  }
}

// ==========================================
// 6. Chat Assistant UI Controller
// ==========================================
class AssistantUIController {
  constructor() {
    this.client = new NvidiaNIMClient();
    this.currentMode = "standard"; // standard, planning, deep_research
    this.isResponding = false;
    this.isOpen = false; // Internal boolean state variable to track sidebar open status
    this.activeTimeline = null;
    this.conversationHistory = [];
    this.conversations = [];
    this.currentConversationId = null;
    this.dom = {};
  }

  init() {
    this.cacheDOMElements();
    this.bindEvents();
    this.loadChatHistory();
  }

  cacheDOMElements() {
    this.dom.container = document.getElementById("chatAssistant");
    this.dom.body = document.getElementById("chatBody");
    this.dom.form = document.getElementById("chatForm");
    this.dom.input = document.getElementById("chatInput");
    this.dom.modeSelect = document.getElementById("chatModeSelect");
    this.dom.statusDot = document.getElementById("chatStatusDot");
    
    // Toggle
    this.dom.chatToggle = document.getElementById("chatToggle");
    
    // Buttons
    this.dom.clearHistoryBtn = document.getElementById("clearHistoryBtn");
    this.dom.closeChatBtn = document.getElementById("closeChatBtn");
    this.dom.newChatBtn = document.getElementById("newChatBtn");
    this.dom.historyBtn = document.getElementById("historyBtn");
    
    // Floating Card Overlay
    this.dom.historyModal = document.getElementById("historyModal");
    this.dom.historyModalCloseBtn = document.getElementById("historyModalCloseBtn");
    this.dom.historyCardListContainer = document.getElementById("historyCardListContainer");
    
    // Right Sliding Sidebar
    this.dom.historySidebar = document.getElementById("historySidebar");
    this.dom.historySidebarOverlay = document.getElementById("historySidebarOverlay");
    this.dom.historySidebarCloseBtn = document.getElementById("historySidebarCloseBtn");
    this.dom.historySidebarListContainer = document.getElementById("historySidebarListContainer");

    // Compatibility for tests
    this.dom.historyListContainer = document.getElementById("historyListContainer");
  }

  bindEvents() {
    if (this.dom.newChatBtn) {
      $(this.dom.newChatBtn).on("click", () => {
        if (!this.isResponding) {
          this.startNewConversation();
        }
      });
    }

    if (this.dom.historyBtn) {
      $(this.dom.historyBtn).on("click", () => {
        this.openHistoryModal();
      });
    }

    if (this.dom.historyModalCloseBtn) {
      $(this.dom.historyModalCloseBtn).on("click", () => {
        this.closeHistoryModal();
      });
    }

    if (this.dom.historyModal) {
      $(this.dom.historyModal).on("click", (e) => {
        if (e.target === this.dom.historyModal) {
          this.closeHistoryModal();
        }
      });
    }

    if (this.dom.historySidebarCloseBtn) {
      $(this.dom.historySidebarCloseBtn).on("click", () => {
        this.closeHistoryModal();
      });
    }

    if (this.dom.historySidebarOverlay) {
      $(this.dom.historySidebarOverlay).on("click", () => {
        this.closeHistoryModal();
      });
    }

    // Floating chat toggle button: opens history sidebar from main landing page
    if (this.dom.chatToggle) {
      $(this.dom.chatToggle).on("click", () => {
        if (this.isOpen) {
          this.closeChat();
        } else {
          this.openHistorySidebar();
        }
      });
    }

    // Chat Form Submit
    if (this.dom.form) {
      $(this.dom.form).on("submit", (e) => {
        e.preventDefault();
        this.handleUserSubmit();
      });
    }

    // Textarea keys (Enter to submit, Shift+Enter for newline)
    if (this.dom.input) {
      $(this.dom.input).on("keydown", (e) => {
        if (e.key === "Enter") {
          if (e.ctrlKey || e.shiftKey) {
            if (e.ctrlKey) {
              e.preventDefault();
              const start = this.dom.input.selectionStart;
              const end = this.dom.input.selectionEnd;
              const value = $(this.dom.input).val();
              $(this.dom.input).val(value.substring(0, start) + "\n" + value.substring(end));
              this.dom.input.selectionStart = this.dom.input.selectionEnd = start + 1;
              this.adjustInputHeight();
            }
          } else {
            e.preventDefault();
            if (this.dom.form) {
              $(this.dom.form).trigger("submit");
            }
          }
        }
      });

      // Auto-growing textarea
      $(this.dom.input).on("input", () => {
        this.adjustInputHeight();
      });
    }

    // Mode select
    if (this.dom.modeSelect) {
      $(this.dom.modeSelect).on("change", (e) => {
        this.currentMode = $(e.target).val();
      });
    }

    // Clear History Button
    if (this.dom.clearHistoryBtn) {
      $(this.dom.clearHistoryBtn).on("click", () => {
        if (this.isResponding) return;
        if (confirm("Are you sure you want to clear chat history?")) {
          this.clearChatHistory();
        }
      });
    }

    // Close Sidebar button
    if (this.dom.closeChatBtn) {
      $(this.dom.closeChatBtn).on("click", () => {
        this.closeChat();
      });
    }
  }

  openChat(initialPrompt = null) {
    this.isOpen = true;
    if (initialPrompt) {
      this.startNewConversation(false);
    }
    const mainOverlay = document.querySelector(".content-overlay");
    const waveCanvas = document.getElementById("waveCanvas");
    const heroTitle = document.querySelector(".hero-title");
    const heroSubtitle = document.querySelector(".hero-subtitle");
    const promptWrapper = document.querySelector(".prompt-form .textarea-wrapper");
    const chatWrapper = document.querySelector(".chat-input-wrapper");
    const envGlobal = typeof window !== "undefined" ? window : global;

    // Show chat assistant (remove hidden class and add open class)
    if (this.dom.container) {
      this.dom.container.classList.remove("hidden");
      this.dom.container.classList.add("open");
    }

    if (this.activeTimeline) {
      this.activeTimeline.kill();
    }
    const tl = gsap.timeline();
    this.activeTimeline = tl;

    // Calculate layout metrics for FLIP
    const startRect = promptWrapper && typeof promptWrapper.getBoundingClientRect === "function"
      ? promptWrapper.getBoundingClientRect()
      : { top: 0, left: 0, width: 0, height: 0 };
    const endRect = chatWrapper && typeof chatWrapper.getBoundingClientRect === "function"
      ? chatWrapper.getBoundingClientRect()
      : { top: 0, left: 0, width: 0, height: 0 };

    const deltaY = endRect.top - startRect.top;
    const deltaX = endRect.left - startRect.left;
    const scaleX = startRect.width ? endRect.width / startRect.width : 1;
    const scaleY = startRect.height ? endRect.height / startRect.height : 1;

    // Hide chat input visually during transition
    if (chatWrapper) chatWrapper.style.opacity = 0;
    if (this.dom.container) {
      if (typeof gsap !== "undefined" && gsap.set) {
        gsap.set(this.dom.container, { y: 20, opacity: 0 });
      } else {
        this.dom.container.style.opacity = "0";
      }
    }

    // Fade out hero sections and the landing prompt form wrapper directly
    if (heroTitle) tl.to(heroTitle, { opacity: 0, y: -15, duration: 0.35, ease: "power2.in" }, 0);
    if (heroSubtitle) tl.to(heroSubtitle, { opacity: 0, y: -15, duration: 0.35, ease: "power2.in" }, 0);
    if (promptWrapper) tl.to(promptWrapper, { opacity: 0, y: 15, duration: 0.35, ease: "power2.in" }, 0);

    // Fade out waveCanvas and pause wave animation
    if (waveCanvas) {
      tl.to(waveCanvas, {
        opacity: 0,
        duration: 0.4,
        onComplete: () => {
          if (envGlobal.waveAnimation) envGlobal.waveAnimation.pause();
        }
      }, 0);
    }

    // Fade in chat assistant with a clean, smooth slide up from the bottom
    if (this.dom.container) {
      tl.to(this.dom.container, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, 0.15);
    }
    if (chatWrapper) tl.to(chatWrapper, { opacity: 1, duration: 0.25 }, 0.25);

    // Rotate floating toggle button
    if (this.dom.chatToggle) {
      tl.to(this.dom.chatToggle, {
        rotate: 90,
        duration: 0.3,
        ease: "power2.inOut"
      }, 0);
    }

    // Run settle check completion
    tl.to({}, {
      duration: 0.8,
      onComplete: () => {
        if (mainOverlay) mainOverlay.classList.add("hidden");
        if (promptWrapper) {
          if (gsap.set) {
            gsap.set(promptWrapper, { clearProps: "all" });
          } else {
            promptWrapper.style.transform = "";
            promptWrapper.style.opacity = "";
          }
        }
        if (initialPrompt) {
          if (this.dom.input) this.dom.input.value = initialPrompt;
          this.sendPrompt(initialPrompt);
          if (this.dom.input) {
            this.dom.input.value = "";
            this.adjustInputHeight();
          }
        }
        if (this.dom.input) this.dom.input.focus();
      }
    });
  }

  closeChat() {
    this.isOpen = false;
    const mainOverlay = document.querySelector(".content-overlay");
    const waveCanvas = document.getElementById("waveCanvas");
    const heroTitle = document.querySelector(".hero-title");
    const heroSubtitle = document.querySelector(".hero-subtitle");
    const envGlobal = typeof window !== "undefined" ? window : global;

    if (mainOverlay) mainOverlay.classList.remove("hidden");
    if (envGlobal.waveAnimation) {
      envGlobal.waveAnimation.resume();
    }

    if (this.activeTimeline) {
      this.activeTimeline.kill();
    }

    // Reset promptWrapper elements to their base states (clear GSAP properties)
    const promptWrapper = document.querySelector(".prompt-form .textarea-wrapper");
    if (promptWrapper) {
      if (typeof gsap !== "undefined" && gsap.set) {
        gsap.set(promptWrapper, { clearProps: "all" });
      } else {
        promptWrapper.style.transform = "";
        promptWrapper.style.opacity = "";
      }
    }

    const landingInput = document.getElementById("promptInput");
    const landingSubmit = document.querySelector(".prompt-form .submit-btn");
    const borderGradient = document.querySelector(".prompt-form .border-gradient-overlay");
    if (landingInput && typeof gsap !== "undefined" && gsap.set) gsap.set(landingInput, { clearProps: "all" });
    if (landingSubmit && typeof gsap !== "undefined" && gsap.set) gsap.set(landingSubmit, { clearProps: "all" });
    if (borderGradient && typeof gsap !== "undefined" && gsap.set) gsap.set(borderGradient, { clearProps: "all" });

    const tl = gsap.timeline();
    this.activeTimeline = tl;

    // Fade in waveCanvas
    if (waveCanvas) {
      tl.to(waveCanvas, { opacity: 1, duration: 0.5 }, 0.2);
    }

    // Fade in hero text
    if (heroTitle) tl.to(heroTitle, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0.2);
    if (heroSubtitle) tl.to(heroSubtitle, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0.2);

    // Fade out chat container
    if (this.dom.container) {
      tl.to(this.dom.container, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          if (!this.isOpen && this.dom.container) {
            this.dom.container.classList.add("hidden");
            this.dom.container.classList.remove("open");
          }
        }
      }, 0);
    }

    // Rotate back floating toggle button
    if (this.dom.chatToggle) {
      tl.to(this.dom.chatToggle, {
        rotate: 0,
        duration: 0.4,
        ease: "power2.inOut"
      }, 0);
    }
  }

  loadChatHistory() {
    const savedConvs = localStorage.getItem("cumlaude_conversations");
    const activeId = localStorage.getItem("cumlaude_current_conv_id");
    
    // Migration helper for old single chat history
    const oldHistory = localStorage.getItem("antigravity_chat_history");
    if (oldHistory && !savedConvs) {
      try {
        const parsed = JSON.parse(oldHistory);
        if (parsed && parsed.length > 0) {
          const firstMsg = parsed.find(m => m.role === 'user');
          const title = firstMsg ? firstMsg.content.substring(0, 30) : "Migrated Conversation";
          const newConv = {
            id: "conv_" + Date.now(),
            title: title,
            messages: parsed,
            timestamp: Date.now()
          };
          this.conversations = [newConv];
          this.currentConversationId = newConv.id;
          localStorage.setItem("cumlaude_conversations", JSON.stringify(this.conversations));
          localStorage.setItem("cumlaude_current_conv_id", this.currentConversationId);
          localStorage.removeItem("antigravity_chat_history");
        }
      } catch (e) {
        console.error("Migration failed:", e);
      }
    } else if (savedConvs) {
      try {
        this.conversations = JSON.parse(savedConvs);
        this.currentConversationId = activeId || (this.conversations[0] ? this.conversations[0].id : null);
      } catch (e) {
        console.error("Failed to parse conversations:", e);
        this.conversations = [];
      }
    }
    
    // Load active conversation in UI
    if (this.currentConversationId) {
      const conv = this.conversations.find(c => c.id === this.currentConversationId);
      if (conv) {
        this.conversationHistory = [...conv.messages];
        if (this.dom.body) {
          this.dom.body.innerHTML = "";
          this.conversationHistory.forEach((msg) => {
            this.appendMessage(msg.role, msg.content, true);
          });
        }
      }
    } else {
      this.conversationHistory = [];
      this.currentConversationId = "conv_" + Date.now();
    }
  }

  saveChatHistory() {
    if (!this.currentConversationId) {
      this.currentConversationId = "conv_" + Date.now();
    }
    let conv = this.conversations.find(c => c.id === this.currentConversationId);
    if (!conv) {
      const firstUserMsg = this.conversationHistory.find(m => m.role === "user");
      const titleText = firstUserMsg ? firstUserMsg.content : "New Conversation";
      const title = titleText.trim().substring(0, 40) + (titleText.length > 40 ? "..." : "");
      conv = {
        id: this.currentConversationId,
        title: title,
        messages: [],
        timestamp: Date.now()
      };
      this.conversations.unshift(conv);
    }
    
    conv.messages = [...this.conversationHistory];
    conv.timestamp = Date.now();
    
    localStorage.setItem("cumlaude_conversations", JSON.stringify(this.conversations));
    localStorage.setItem("cumlaude_current_conv_id", this.currentConversationId);
  }

  clearChatHistory() {
    this.conversationHistory = [];
    if (this.dom.body) this.dom.body.innerHTML = "";
    this.saveChatHistory();
    this.addSystemLogMessage("Chat history cleared.");
  }

  startNewConversation(animate = true) {
    this.currentConversationId = "conv_" + Date.now();
    this.conversationHistory = [];
    if (this.dom.body) this.dom.body.innerHTML = "";
    localStorage.setItem("cumlaude_current_conv_id", this.currentConversationId);
    
    // Add default log
    this.addSystemLogMessage("Started a new conversation.");
    this.closeHistoryModal();
  }

  openHistoryModal() {
    if (this.dom.historyModal) {
      this.dom.historyModal.classList.add("open");
    }
    this.renderHistoryList("card");
  }

  openHistorySidebar() {
    if (this.dom.historySidebar) {
      this.dom.historySidebar.classList.add("open");
    }
    if (this.dom.historySidebarOverlay) {
      this.dom.historySidebarOverlay.classList.add("open");
    }
    this.renderHistoryList("sidebar");
  }

  closeHistoryModal() {
    if (this.dom.historyModal) {
      this.dom.historyModal.classList.remove("open");
    }
    if (this.dom.historySidebar) {
      this.dom.historySidebar.classList.remove("open");
    }
    if (this.dom.historySidebarOverlay) {
      this.dom.historySidebarOverlay.classList.remove("open");
    }
  }

  renderHistoryList(targetType) {
    const renderTo = (container) => {
      if (!container) return;
      container.innerHTML = "";

      if (this.conversations.length === 0) {
        container.innerHTML = `
          <div class="history-empty-state">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="9" x2="15" y2="9"></line>
              <line x1="9" y1="13" x2="15" y2="13"></line>
              <line x1="9" y1="17" x2="13" y2="17"></line>
            </svg>
            <div>No saved conversations yet.</div>
          </div>
        `;
        return;
      }

      this.conversations.forEach((conv) => {
        const item = document.createElement("div");
        item.className = `history-item ${conv.id === this.currentConversationId ? "active" : ""}`;
        item.addEventListener("click", () => this.loadConversation(conv.id));

        const details = document.createElement("div");
        details.className = "history-item-details";

        const title = document.createElement("div");
        title.className = "history-item-title";
        title.textContent = conv.title;

        const date = document.createElement("div");
        date.className = "history-item-date";
        date.textContent = new Date(conv.timestamp).toLocaleString();

        details.appendChild(title);
        details.appendChild(date);

        const actions = document.createElement("div");
        actions.className = "history-item-actions";

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "history-item-delete";
        deleteBtn.title = "Delete Conversation";
        deleteBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        `;
        deleteBtn.addEventListener("click", (e) => this.deleteConversation(conv.id, e));

        actions.appendChild(deleteBtn);
        item.appendChild(details);
        item.appendChild(actions);

        container.appendChild(item);
      });
    };

    if (!targetType || targetType === "card") {
      renderTo(this.dom.historyCardListContainer);
    }
    if (!targetType || targetType === "sidebar") {
      renderTo(this.dom.historySidebarListContainer);
    }
    if (this.dom.historyListContainer) {
      renderTo(this.dom.historyListContainer);
    }
  }

  loadConversation(id) {
    const conv = this.conversations.find((c) => c.id === id);
    if (conv) {
      this.currentConversationId = conv.id;
      this.conversationHistory = [...conv.messages];
      if (this.dom.body) {
        this.dom.body.innerHTML = "";
        this.conversationHistory.forEach((msg) => {
          this.appendMessage(msg.role, msg.content, true);
        });
      }
      localStorage.setItem("cumlaude_current_conv_id", this.currentConversationId);
      this.closeHistoryModal();
      
      if (!this.isOpen) {
        this.openChat();
      }
      
      this.scrollToBottom();
    }
  }

  deleteConversation(id, event) {
    if (event) event.stopPropagation(); // Prevent loading the conversation when deleting it
    if (confirm("Are you sure you want to delete this conversation?")) {
      this.conversations = this.conversations.filter((c) => c.id !== id);
      localStorage.setItem("cumlaude_conversations", JSON.stringify(this.conversations));
      
      if (this.currentConversationId === id) {
        this.startNewConversation();
      } else {
        this.renderHistoryList();
      }
    }
  }

  async handleUserSubmit() {
    const val = this.dom.input.value.trim();
    if (!val || this.isResponding) return;

    this.dom.input.value = "";
    this.adjustInputHeight(); // Shrink textarea back to original height
    this.sendPrompt(val);
  }

  async sendPrompt(text) {
    this.isResponding = true;
    if (this.dom.statusDot) this.dom.statusDot.classList.add("busy");
    if (this.dom.modeSelect) this.dom.modeSelect.disabled = true; // Lock dropdown
    if (this.dom.clearHistoryBtn) this.dom.clearHistoryBtn.disabled = true;
    
    // Append User Message
    this.appendMessage("user", text);
    this.conversationHistory.push({ role: "user", content: text });
    this.saveChatHistory();
    this.scrollToBottom();

    // Prepare Assistant Stream Container
    const messageDiv = this.appendMessage("assistant", "");
    const bubbleDiv = messageDiv.querySelector(".chat-bubble");
    
    // Add flashing cursor
    const cursor = document.createElement("span");
    cursor.className = "stream-cursor";
    if (bubbleDiv) bubbleDiv.appendChild(cursor);

    let streamText = "";
    let thinkingWidget = null;
    let answerContent = null;

    const updateText = (token) => {
      if (token === "__CLEAR__") {
        streamText = "";
        if (bubbleDiv) bubbleDiv.innerHTML = "";
        return;
      }
      streamText += token;
      
      const wrapper = messageDiv.querySelector(".chat-bubble-wrapper");
      if (this.currentMode === "planning") {
        const parsed = this.parseDeepSeekStream(streamText);
        
        if (parsed.thinking) {
          if (!thinkingWidget) {
            thinkingWidget = this.createThinkingWidget(wrapper || messageDiv);
          }
          const thinkingContentEl = thinkingWidget.querySelector(".thinking-content");
          if (thinkingContentEl) thinkingContentEl.textContent = parsed.thinking;
        }
        
        if (streamText.indexOf("</think>") !== -1 && thinkingWidget) {
          thinkingWidget.classList.add("completed");
          const thinkingTitleEl = thinkingWidget.querySelector(".thinking-title-text");
          if (thinkingTitleEl) thinkingTitleEl.textContent = "Thinking Process (Completed)";
        }
        
        if (!answerContent) {
          answerContent = document.createElement("div");
          answerContent.className = "answer-content";
          if (bubbleDiv) bubbleDiv.appendChild(answerContent);
        }
        
        if (answerContent) {
          answerContent.innerHTML = this.formatMarkdown(parsed.answer);
          answerContent.appendChild(cursor);
        }
      } else {
        // Standard Mode
        if (bubbleDiv) {
          bubbleDiv.innerHTML = this.formatMarkdown(streamText);
          bubbleDiv.appendChild(cursor);
        }
      }
      this.scrollToBottom();
    };

    const cleanupStream = () => {
      cursor.remove();
      this.isResponding = false;
      if (this.dom.statusDot) this.dom.statusDot.classList.remove("busy");
      if (this.dom.modeSelect) this.dom.modeSelect.disabled = false; // Re-enable dropdown
      if (this.dom.clearHistoryBtn) this.dom.clearHistoryBtn.disabled = false;
      this.appendActionButtons(messageDiv, streamText);
      this.conversationHistory.push({ role: "assistant", content: streamText });
      this.saveChatHistory();
    };

    if (this.currentMode === "deep_research") {
      const wrapper = messageDiv.querySelector(".chat-bubble-wrapper");
      const consoleDiv = this.createConsoleWidget(wrapper || messageDiv);
      this.scrollToBottom();

      const logger = (level, msg) => {
        const line = document.createElement("div");
        line.className = `console-log ${level}`;
        line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
        const cBody = consoleDiv.querySelector(".console-body");
        if (cBody) {
          cBody.appendChild(line);
          cBody.scrollTop = cBody.scrollHeight;
        }
      };

      const orchestrator = new DeepResearchOrchestrator(this.client, logger);
      
      await orchestrator.run(
        text,
        (token) => {
          updateText(token);
        },
        (err, facts) => {
          cleanupStream();
          if (!err && facts && facts.length > 0 && bubbleDiv) {
            this.renderSources(bubbleDiv, facts);
          }
        }
      );
    } else {
      const historyToSend = this.conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Add a helpful system message as the first prompt
      historyToSend.unshift({
        role: "system",
        content: "You are Cumlaude, a helpful client-side AI Fullstack Engineer assistant. Output detailed but structured responses."
      });

      await this.client.streamChat(
        historyToSend,
        { temperature: 0.6 },
        updateText,
        cleanupStream
      );
    }
  }

  appendMessage(sender, text, load = false) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `chat-message ${sender}`;

    const avatarDiv = document.createElement("div");
    avatarDiv.className = "chat-avatar";
    avatarDiv.textContent = sender === "user" ? "U" : "A";

    const bubbleWrapper = document.createElement("div");
    bubbleWrapper.className = "chat-bubble-wrapper";

    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    
    // Check if it has a think block and format it accordingly
    if (sender === "assistant" && text.includes("<think>")) {
      const parsed = this.parseDeepSeekStream(text);
      if (parsed.thinking) {
        const thinkingWidget = this.createThinkingWidget(bubbleWrapper);
        const thinkingContentEl = thinkingWidget.querySelector(".thinking-content");
        if (thinkingContentEl) thinkingContentEl.textContent = parsed.thinking;
        const thinkingTitleEl = thinkingWidget.querySelector(".thinking-title-text");
        if (thinkingTitleEl) thinkingTitleEl.textContent = "Thinking Process (Completed)";
        thinkingWidget.classList.add("completed", "collapsed");
      }
      
      const answerContent = document.createElement("div");
      answerContent.className = "answer-content";
      answerContent.innerHTML = this.formatMarkdown(parsed.answer);
      bubble.appendChild(answerContent);
    } else {
      bubble.innerHTML = this.formatMarkdown(text);
    }

    const meta = document.createElement("div");
    meta.className = "chat-meta";
    meta.textContent = sender === "user" ? "You" : "Cumlaude";

    bubbleWrapper.appendChild(bubble);
    bubbleWrapper.appendChild(meta);

    if (sender === "user") {
      messageDiv.appendChild(bubbleWrapper);
      messageDiv.appendChild(avatarDiv);
    } else {
      messageDiv.appendChild(avatarDiv);
      messageDiv.appendChild(bubbleWrapper);
    }

    if (sender === "assistant" && load && text) {
      this.appendActionButtons(messageDiv, text);
    }

    this.dom.body.appendChild(messageDiv);
    this.scrollToBottom();
    return messageDiv;
  }

  appendActionButtons(messageDiv, text) {
    const bubbleWrapper = messageDiv.querySelector(".chat-bubble-wrapper");
    if (!bubbleWrapper || bubbleWrapper.querySelector(".message-actions")) return;

    const actionsDiv = document.createElement("div");
    actionsDiv.className = "message-actions";
    actionsDiv.innerHTML = `
      <button class="message-action-btn refresh" title="Regenerate Response">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
      </button>
      <button class="message-action-btn copy" title="Copy Message">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
      </button>
      <button class="message-action-btn thumbs-up" title="Like Response">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
      </button>
      <button class="message-action-btn thumbs-down" title="Dislike Response">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm12-5h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"/></svg>
      </button>
    `;
    bubbleWrapper.appendChild(actionsDiv);

    const copyBtn = actionsDiv.querySelector(".copy");
    if (copyBtn) {
      copyBtn.addEventListener("click", (e) => {
        const btn = e.currentTarget;
        const textToCopy = text;
        const showSuccess = () => {
          btn.classList.add("active");
          setTimeout(() => btn.classList.remove("active"), 1500);
        };
        const fallbackCopy = () => {
          const textArea = document.createElement("textarea");
          textArea.value = textToCopy;
          textArea.style.position = "fixed";
          textArea.style.opacity = "0";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          try {
            document.execCommand("copy");
            showSuccess();
          } catch (err) {
            console.error("Fallback copy failed:", err);
          }
          document.body.removeChild(textArea);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(textToCopy).then(showSuccess).catch(fallbackCopy);
        } else {
          fallbackCopy();
        }
      });
    }

    const up = actionsDiv.querySelector(".thumbs-up");
    const down = actionsDiv.querySelector(".thumbs-down");
    if (up && down) {
      up.addEventListener("click", () => {
        up.classList.toggle("active");
        down.classList.remove("active");
      });
      down.addEventListener("click", () => {
        down.classList.toggle("active");
        up.classList.remove("active");
      });
    }

    const refreshBtn = actionsDiv.querySelector(".refresh");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        this.regenerateResponse(messageDiv);
      });
    }
  }

  async regenerateResponse(assistantMessageDiv) {
    if (this.isResponding) return;
    const children = Array.from(this.dom.body.children);
    const messages = children.filter(c => c.classList.contains("chat-message"));
    const idx = messages.indexOf(assistantMessageDiv);
    
    if (idx !== -1 && this.conversationHistory[idx] && this.conversationHistory[idx].role === "assistant") {
      // Ensure the message before it is user
      if (idx > 0 && this.conversationHistory[idx - 1].role === "user") {
        const userPrompt = this.conversationHistory[idx - 1].content;
        
        // Remove this message and all subsequent messages from DOM and history
        for (let i = messages.length - 1; i >= idx; i--) {
          messages[i].remove();
        }
        this.conversationHistory.splice(idx);
        this.saveChatHistory();
        this.sendPrompt(userPrompt);
      }
    }
  }

  addSystemLogMessage(text) {
    const logDiv = document.createElement("div");
    logDiv.style.alignSelf = "center";
    logDiv.style.fontSize = "11px";
    logDiv.style.color = "var(--text-muted)";
    logDiv.style.margin = "8px 0";
    logDiv.style.background = "rgba(255,255,255,0.03)";
    logDiv.style.padding = "4px 12px";
    logDiv.style.borderRadius = "8px";
    logDiv.textContent = text;
    this.dom.body.appendChild(logDiv);
    this.scrollToBottom();
  }

  createThinkingWidget(parentDiv) {
    const widget = document.createElement("div");
    widget.className = "thinking-accordion";
    widget.innerHTML = `
      <div class="thinking-header">
        <span class="thinking-title-text">Thinking Process...</span>
        <span class="thinking-chevron">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transform: rotate(180deg); transition: transform 0.2s;">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
      </div>
      <div class="thinking-content"></div>
    `;
    
    parentDiv.insertBefore(widget, parentDiv.firstChild);
    
    const header = widget.querySelector(".thinking-header");
    header.addEventListener("click", () => {
      widget.classList.toggle("collapsed");
    });
    
    return widget;
  }

  createConsoleWidget(parentDiv) {
    const widget = document.createElement("div");
    widget.className = "research-console";
    widget.innerHTML = `
      <div class="console-header">
        <span>Deep Research Agent Terminal</span>
        <span style="font-size: 8px; color: #00ff66; animation: blink 1s infinite;">● ONLINE</span>
      </div>
      <div class="console-body"></div>
    `;
    parentDiv.insertBefore(widget, parentDiv.firstChild);
    return widget;
  }

  renderSources(bubbleElement, facts) {
    const container = document.createElement("div");
    container.className = "source-list";
    
    facts.forEach((item, index) => {
      const a = document.createElement("a");
      a.className = "source-tag";
      a.href = item.url;
      a.target = "_blank";
      a.innerHTML = `
        <span>[${index + 1}] ${item.domain}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
      `;
      container.appendChild(a);
    });

    bubbleElement.appendChild(container);
  }

  parseDeepSeekStream(rawText) {
    const thinkStart = rawText.indexOf("<think>");
    const thinkEnd = rawText.indexOf("</think>");
    
    if (thinkStart !== -1) {
      if (thinkEnd !== -1) {
        return {
          thinking: rawText.substring(thinkStart + 7, thinkEnd).trim(),
          answer: (rawText.substring(0, thinkStart) + rawText.substring(thinkEnd + 8)).trim()
        };
      } else {
        return {
          thinking: rawText.substring(thinkStart + 7),
          answer: rawText.substring(0, thinkStart).trim()
        };
      }
    } else {
      if (thinkEnd !== -1) {
        return {
          thinking: rawText.substring(0, thinkEnd).trim(),
          answer: rawText.substring(thinkEnd + 8).trim()
        };
      }
      return {
        thinking: "",
        answer: rawText
      };
    }
  }

  formatMarkdown(text) {
    let escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Format <think>...</think> inline for standard mode
    escaped = escaped.replace(/&lt;think&gt;([\s\S]*?)&lt;\/think&gt;/g, '<div class="thinking-raw"><strong>Thinking:</strong><br><em>$1</em></div>');
    escaped = escaped.replace(/&lt;think&gt;([\s\S]*?)$/g, '<div class="thinking-raw"><strong>Thinking:</strong><br><em>$1</em></div>');

    // Code blocks: ```js ... ```
    escaped = escaped.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre class="code-block"><code class="language-${lang}">${code.trim()}</code></pre>`;
    });

    // Inline code: `code`
    escaped = escaped.replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>');

    // Bold: **text**
    escaped = escaped.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

    // Split text into lines to process lists
    const lines = escaped.split("\n");
    let inUl = false;
    let inOl = false;
    let inCodeBlock = false;
    const processedLines = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      if (line.includes("<pre")) {
        inCodeBlock = true;
      }

      // Check for headers (e.g., # Header) if not in code block
      if (!inCodeBlock) {
        const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (headerMatch) {
          const level = headerMatch[1].length;
          // Close list if we were in one
          if (inUl) {
            processedLines.push("</ul>");
            inUl = false;
          }
          if (inOl) {
            processedLines.push("</ol>");
            inOl = false;
          }
          processedLines.push(`<h${level}>${headerMatch[2]}</h${level}>`);
          continue;
        }
      }

      const ulMatch = !inCodeBlock && line.match(/^(\s*)[-*]\s+(.+)$/);
      if (ulMatch) {
        if (inOl) {
          processedLines.push("</ol>");
          inOl = false;
        }
        if (!inUl) {
          processedLines.push("<ul>");
          inUl = true;
        }
        processedLines.push(`<li>${ulMatch[2]}</li>`);
        continue;
      }

      const olMatch = !inCodeBlock && line.match(/^(\s*)\d+\.\s+(.+)$/);
      if (olMatch) {
        if (inUl) {
          processedLines.push("</ul>");
          inUl = false;
        }
        if (!inOl) {
          processedLines.push("<ol>");
          inOl = true;
        }
        processedLines.push(`<li>${olMatch[2]}</li>`);
        continue;
      }

      if (inUl) {
        processedLines.push("</ul>");
        inUl = false;
      }
      if (inOl) {
        processedLines.push("</ol>");
        inOl = false;
      }

      processedLines.push(line);

      if (line.includes("</pre>")) {
        inCodeBlock = false;
      }
    }

    if (inUl) processedLines.push("</ul>");
    if (inOl) processedLines.push("</ol>");

    let htmlResult = "";
    let inPre = false;
    for (let i = 0; i < processedLines.length; i++) {
      const line = processedLines[i];
      if (line.includes("<pre")) {
        inPre = true;
      }
      if (line.includes("</pre>")) {
        inPre = false;
        htmlResult += line;
        continue;
      }

      if (inPre) {
        htmlResult += line + "\n";
      } else {
        const isListTag = /<\/?(ul|ol|li)>/.test(line);
        const isHeaderTag = /<\/?h[1-6]>/.test(line);
        const isThinkingRawTag = /<\/?div|strong|em|br>/.test(line) && line.includes("thinking-raw");
        if (isListTag || isHeaderTag || isThinkingRawTag) {
          htmlResult += line;
        } else if (line.trim() === "") {
          htmlResult += "<br>";
        } else {
          htmlResult += line + "<br>";
        }
      }
    }

    return htmlResult;
  }

  adjustInputHeight() {
    this.dom.input.style.height = "auto";
    const scrollHeight = this.dom.input.scrollHeight;
    // Set height between original height (60px) and max-height (120px)
    this.dom.input.style.height = `${Math.max(60, Math.min(120, scrollHeight))}px`;
  }

  scrollToBottom() {
    this.dom.body.scrollTop = this.dom.body.scrollHeight;
  }
}

// ==========================================
// 7. Initialization Entry Point
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initPlaceholderAnimation();
  initWaveAnimation();
  
  // Instantiate and initialize the Chat Assistant
  const assistantController = new AssistantUIController();
  assistantController.init();

  if (typeof window !== "undefined" && window.location.protocol === "file:") {
    const $warningModal = $("#warningModal");
    const $closeWarningBtn = $("#closeWarningBtn");
    if ($warningModal.length && $closeWarningBtn.length) {
      $warningModal.addClass("open");
      $closeWarningBtn.on("click", () => {
        window.close();
        window.location.href = "about:blank";
      });
    }
  }
  
  // Custom submit on landing page prompt form
  const $promptForm = $("#promptForm");
  const $promptInput = $("#promptInput");
  if ($promptForm.length && $promptInput.length) {
    $promptInput.on("keydown", (e) => {
      if (e.key === "Enter") {
        if (e.ctrlKey || e.shiftKey) {
          if (e.ctrlKey) {
            e.preventDefault();
            const el = $promptInput[0];
            const start = el.selectionStart;
            const end = el.selectionEnd;
            const value = $promptInput.val();
            $promptInput.val(value.substring(0, start) + "\n" + value.substring(end));
            el.selectionStart = el.selectionEnd = start + 1;
          }
        } else {
          e.preventDefault();
          $promptForm.trigger("submit");
        }
      }
    });

    $promptForm.on("submit", (e) => {
      e.preventDefault();
      const val = $promptInput.val().trim();
      if (val) {
        $promptInput.val(""); // Clear landing page textarea
        assistantController.openChat(val);
      }
    });
  }
});

