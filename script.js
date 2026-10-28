/**
 * Plant Green Inertia (PGI) - Interactive 3D & Client Scripts
 * Powered by Three.js & Vanilla 3D Animation Physics
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // ===================================================================
  // 1. THREE.JS INTERACTIVE 3D GLOBAL UNIVERSE BACKGROUND (WHOLE WEBSITE)
  // ===================================================================
  // ===================================================================
  // 1. THREE.JS INTERACTIVE 3D GLOBAL TECHNOLOGY UNIVERSE BACKGROUND
  // ===================================================================
  function initGlobal3DBackground() {
    const canvas = document.getElementById('global3DCanvas') || document.getElementById('hero3DCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x010d06, 0.0016);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 8, 42);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    // -------------------------------------------------------------
    // A. 3D HIGH-TECH NEURAL DATA NETWORK (NODES & LASER CONSTELLATION)
    // -------------------------------------------------------------
    const nodeCount = 180;
    const nodePositions = new Float32Array(nodeCount * 3);
    const nodeVelocities = [];
    const nodeColors = new Float32Array(nodeCount * 3);

    const techPalette = [
      new THREE.Color(0x4ade80), // Cyber Lime
      new THREE.Color(0x00f0ff), // Electric Cyan
      new THREE.Color(0x34d399), // Mint Neon
      new THREE.Color(0x10b981), // Pure Emerald
      new THREE.Color(0x059669)  // Deep Forest Data
    ];

    for (let i = 0; i < nodeCount; i++) {
      const idx = i * 3;
      nodePositions[idx] = (Math.random() - 0.5) * 110;
      nodePositions[idx + 1] = 50 - Math.random() * 320; // Spans vertically down the page
      nodePositions[idx + 2] = (Math.random() - 0.5) * 70;

      nodeVelocities.push({
        vx: (Math.random() - 0.5) * 0.035,
        vy: (Math.random() - 0.5) * 0.035,
        vz: (Math.random() - 0.5) * 0.035,
        baseX: nodePositions[idx],
        baseY: nodePositions[idx + 1],
        baseZ: nodePositions[idx + 2]
      });

      const col = techPalette[Math.floor(Math.random() * techPalette.length)];
      nodeColors[idx] = col.r;
      nodeColors[idx + 1] = col.g;
      nodeColors[idx + 2] = col.b;
    }

    const nodeGeom = new THREE.BufferGeometry();
    nodeGeom.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
    nodeGeom.setAttribute('color', new THREE.BufferAttribute(nodeColors, 3));

    const nodeMat = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending
    });
    const neuralNodes = new THREE.Points(nodeGeom, nodeMat);
    scene.add(neuralNodes);

    // Preallocated Laser Connection Segments Buffer
    const maxConnections = 260;
    const linePositions = new Float32Array(maxConnections * 2 * 3);
    const lineColors = new Float32Array(maxConnections * 2 * 3);
    const lineGeom = new THREE.BufferGeometry();
    lineGeom.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeom.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending
    });
    const neuralLines = new THREE.LineSegments(lineGeom, lineMat);
    scene.add(neuralLines);

    // -------------------------------------------------------------
    // B. MATRIX DATA STREAM PARTICLES (800 STREAMING BINARY CORPUSCLES)
    // -------------------------------------------------------------
    const dataParticleCount = 800;
    const dataPos = new Float32Array(dataParticleCount * 3);
    const dataCol = new Float32Array(dataParticleCount * 3);

    for (let i = 0; i < dataParticleCount; i++) {
      const idx = i * 3;
      dataPos[idx] = (Math.random() - 0.5) * 130;
      dataPos[idx + 1] = 60 - Math.random() * 340;
      dataPos[idx + 2] = (Math.random() - 0.5) * 90;

      const c = Math.random() > 0.4 ? new THREE.Color(0x4ade80) : new THREE.Color(0x00f0ff);
      dataCol[idx] = c.r;
      dataCol[idx + 1] = c.g;
      dataCol[idx + 2] = c.b;
    }

    const dataGeom = new THREE.BufferGeometry();
    dataGeom.setAttribute('position', new THREE.BufferAttribute(dataPos, 3));
    dataGeom.setAttribute('color', new THREE.BufferAttribute(dataCol, 3));

    const dataMat = new THREE.PointsMaterial({
      size: 1.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const matrixStream = new THREE.Points(dataGeom, dataMat);
    scene.add(matrixStream);

    // -------------------------------------------------------------
    // C. HERO ZONE: QUANTUM HOLOGRAPHIC TESSERACT & ENERGY CORE
    // -------------------------------------------------------------
    const heroGroup = new THREE.Group();
    heroGroup.position.set(0, 4, -10);

    // Outer Cyber Cube
    const cube1Geom = new THREE.BoxGeometry(11.5, 11.5, 11.5);
    const cube1Mat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: 0.32
    });
    const outerCube = new THREE.Mesh(cube1Geom, cube1Mat);
    heroGroup.add(outerCube);

    // Inner Cyan Quantum Cube
    const cube2Geom = new THREE.BoxGeometry(6.8, 6.8, 6.8);
    const cube2Mat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.52
    });
    const innerCube = new THREE.Mesh(cube2Geom, cube2Mat);
    heroGroup.add(innerCube);

    // Core Singularity Octahedron
    const coreGeom = new THREE.OctahedronGeometry(3.4, 0);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x4ade80,
      wireframe: true,
      transparent: true,
      opacity: 0.78
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);
    heroGroup.add(coreMesh);

    // Orbital Gyroscopic Radar Rings
    const ring1Geom = new THREE.TorusGeometry(14, 0.2, 16, 80);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      wireframe: true,
      transparent: true,
      opacity: 0.45
    });
    const ring1 = new THREE.Mesh(ring1Geom, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    heroGroup.add(ring1);

    const ring2Geom = new THREE.TorusGeometry(10.5, 0.18, 16, 80);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const ring2 = new THREE.Mesh(ring2Geom, ring2Mat);
    ring2.rotation.y = Math.PI / 4;
    heroGroup.add(ring2);

    scene.add(heroGroup);

    // -------------------------------------------------------------
    // D. SCROLL-WAYPOINT 3D CYBER ARTIFACTS (SPANNED VERTICALLY)
    // -------------------------------------------------------------
    const scrollWaypoints = [];

    // WP 1: Partners & Metrics (Y = -40) - Hexagonal Satellite Data Relay
    const wp1Group = new THREE.Group();
    wp1Group.position.set(-22, -40, -5);
    const wp1Core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(7, 1),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.32 })
    );
    const wp1Halo = new THREE.Mesh(
      new THREE.TorusGeometry(9.5, 0.22, 16, 64),
      new THREE.MeshBasicMaterial({ color: 0x4ade80, wireframe: true, transparent: true, opacity: 0.38 })
    );
    wp1Halo.rotation.x = Math.PI / 2.5;
    wp1Group.add(wp1Core);
    wp1Group.add(wp1Halo);
    scene.add(wp1Group);
    scrollWaypoints.push({ mesh: wp1Group, rotSpeedX: 0.006, rotSpeedY: 0.009 });

    // WP 2: Educational Ecosystem (Y = -85) - 3-Axis Gyroscopic Gimbal
    const wp2Group = new THREE.Group();
    wp2Group.position.set(24, -85, -6);
    const gimb1 = new THREE.Mesh(
      new THREE.TorusGeometry(8, 0.25, 16, 64),
      new THREE.MeshBasicMaterial({ color: 0x34d399, wireframe: true, transparent: true, opacity: 0.4 })
    );
    const gimb2 = new THREE.Mesh(
      new THREE.TorusGeometry(6, 0.25, 16, 64),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.45 })
    );
    gimb2.rotation.x = Math.PI / 2;
    const gimbCore = new THREE.Mesh(
      new THREE.OctahedronGeometry(3.2, 0),
      new THREE.MeshBasicMaterial({ color: 0x4ade80, wireframe: true, transparent: true, opacity: 0.6 })
    );
    wp2Group.add(gimb1);
    wp2Group.add(gimb2);
    wp2Group.add(gimbCore);
    scene.add(wp2Group);
    scrollWaypoints.push({ mesh: wp2Group, rotSpeedX: 0.008, rotSpeedY: 0.006 });

    // WP 3: 3D Printing Lab (Y = -130) - Additive Mechanical Calibration Matrix
    const wp3Group = new THREE.Group();
    wp3Group.position.set(-22, -130, -5);
    const printDodec = new THREE.Mesh(
      new THREE.DodecahedronGeometry(7.5, 1),
      new THREE.MeshBasicMaterial({ color: 0x4ade80, wireframe: true, transparent: true, opacity: 0.35 })
    );
    const printRings = new THREE.Mesh(
      new THREE.TorusGeometry(10, 0.2, 16, 64),
      new THREE.MeshBasicMaterial({ color: 0x059669, wireframe: true, transparent: true, opacity: 0.35 })
    );
    wp3Group.add(printDodec);
    wp3Group.add(printRings);
    scene.add(wp3Group);
    scrollWaypoints.push({ mesh: wp3Group, rotSpeedX: 0.005, rotSpeedY: 0.008 });

    // WP 4: Internships 3D Architecture (Y = -175) - 4-Tier Floating Isometric Slices
    const wp4Group = new THREE.Group();
    wp4Group.position.set(22, -175, -5);
    for (let i = 0; i < 4; i++) {
      const sliceGeom = new THREE.BoxGeometry(9 - i * 1.2, 0.4, 9 - i * 1.2);
      const sliceMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x4ade80 : 0x00f0ff,
        wireframe: true,
        transparent: true,
        opacity: 0.4 + i * 0.1
      });
      const slice = new THREE.Mesh(sliceGeom, sliceMat);
      slice.position.y = (i - 1.5) * 2.4;
      wp4Group.add(slice);
    }
    wp4Group.rotation.x = 0.3;
    wp4Group.rotation.y = 0.4;
    scene.add(wp4Group);
    scrollWaypoints.push({ mesh: wp4Group, rotSpeedX: 0.004, rotSpeedY: 0.007 });

    // WP 5: Founder & Courses (Y = -220) - Quantum Diamond Core
    const wp5Group = new THREE.Group();
    wp5Group.position.set(-20, -220, -6);
    const diaGeom = new THREE.OctahedronGeometry(6.5, 1);
    const diaMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.35 });
    const diaMesh = new THREE.Mesh(diaGeom, diaMat);
    const diaKnot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(5.5, 1.2, 64, 16),
      new THREE.MeshBasicMaterial({ color: 0x4ade80, wireframe: true, transparent: true, opacity: 0.3 })
    );
    wp5Group.add(diaMesh);
    wp5Group.add(diaKnot);
    scene.add(wp5Group);
    scrollWaypoints.push({ mesh: wp5Group, rotSpeedX: 0.007, rotSpeedY: 0.005 });

    // WP 6: FAQ & Contact (Y = -265) - Geodesic Neural Constellation Sphere
    const wp6 = new THREE.Mesh(
      new THREE.SphereGeometry(8.5, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x34d399, wireframe: true, transparent: true, opacity: 0.32 })
    );
    wp6.position.set(20, -265, -5);
    scene.add(wp6);
    scrollWaypoints.push({ mesh: wp6, rotSpeedX: 0.006, rotSpeedY: 0.008 });

    // -------------------------------------------------------------
    // E. 3D CYBER HORIZON MATRIX GRID (FLOOR & CEILING WAVE LATTICE)
    // -------------------------------------------------------------
    const gridCols = 36;
    const gridRows = 55;
    const terrainGeom = new THREE.PlaneGeometry(150, 240, gridCols, gridRows);
    terrainGeom.rotateX(-Math.PI / 2 + 0.18);
    terrainGeom.translate(0, -24, -38);

    const terrainMat = new THREE.MeshBasicMaterial({
      color: 0x059669,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending
    });
    const terrainMesh = new THREE.Mesh(terrainGeom, terrainMat);
    scene.add(terrainMesh);

    const posAttr = terrainGeom.attributes.position;
    const baseTerrainPositions = posAttr.array.slice();

    // -------------------------------------------------------------
    // F. MOUSE & SCROLL PARALLAX TRACKERS
    // -------------------------------------------------------------
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    document.addEventListener('mousemove', (e) => {
      targetMouseX = (e.clientX - window.innerWidth / 2) * 0.0009;
      targetMouseY = (e.clientY - window.innerHeight / 2) * 0.0009;
    });

    let currentScrollProgress = 0;
    let targetScrollProgress = 0;

    function onScroll() {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      targetScrollProgress = window.scrollY / maxScroll;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // -------------------------------------------------------------
    // G. MAIN 60FPS ANIMATION LOOP
    // -------------------------------------------------------------
    let clock = 0;

    function animate() {
      requestAnimationFrame(animate);
      clock += 0.016;

      // Mouse Smooth Interpolation (Lerp)
      mouseX += (targetMouseX - mouseX) * 0.06;
      mouseY += (targetMouseY - mouseY) * 0.06;

      // Scroll Smooth Interpolation (Lerp)
      currentScrollProgress += (targetScrollProgress - currentScrollProgress) * 0.06;

      // Camera flies vertically through 3D cyber matrix corridor
      const targetCamY = 7 - (currentScrollProgress * 270);
      camera.position.y = targetCamY;
      camera.position.x = mouseX * 18;
      camera.position.z = 42 + Math.sin(currentScrollProgress * Math.PI) * 7;
      camera.lookAt(camera.position.x * 0.35, camera.position.y - 1.2, 0);

      // Hero Tesseract Rotations
      outerCube.rotation.x += 0.004;
      outerCube.rotation.y += 0.006;
      innerCube.rotation.x -= 0.007;
      innerCube.rotation.y += 0.009;
      coreMesh.rotation.y += 0.012;
      coreMesh.rotation.z -= 0.008;
      ring1.rotation.z += 0.008;
      ring2.rotation.x += 0.009;

      // Waypoints Continuous Cyber Rotations
      scrollWaypoints.forEach(wp => {
        wp.mesh.rotation.x += wp.rotSpeedX;
        wp.mesh.rotation.y += wp.rotSpeedY;
      });

      // Drift Matrix Data Particles
      const dArr = dataGeom.attributes.position.array;
      for (let i = 1; i < dArr.length; i += 3) {
        dArr[i] -= 0.22; // stream downwards
        if (dArr[i] < targetCamY - 60) {
          dArr[i] = targetCamY + 60;
        }
      }
      dataGeom.attributes.position.needsUpdate = true;
      matrixStream.rotation.y = clock * 0.008;

      // Update High-Tech Neural Nodes & Dynamic Laser Connections
      const nPos = nodeGeom.attributes.position.array;
      for (let i = 0; i < nodeCount; i++) {
        const i3 = i * 3;
        const vel = nodeVelocities[i];
        nPos[i3] += vel.vx;
        nPos[i3 + 1] += vel.vy;
        nPos[i3 + 2] += vel.vz;

        // Bounce back near bounds
        if (Math.abs(nPos[i3] - vel.baseX) > 8) vel.vx *= -1;
        if (Math.abs(nPos[i3 + 1] - vel.baseY) > 8) vel.vy *= -1;
        if (Math.abs(nPos[i3 + 2] - vel.baseZ) > 8) vel.vz *= -1;
      }
      nodeGeom.attributes.position.needsUpdate = true;

      // Connect Nodes with Glowing Laser Line Segments
      let lineIndex = 0;
      for (let i = 0; i < nodeCount && lineIndex < maxConnections; i++) {
        const i3 = i * 3;
        // Connect only to neighboring nodes around camera range for optimum rendering
        if (Math.abs(nPos[i3 + 1] - targetCamY) > 55) continue;

        for (let j = i + 1; j < nodeCount && lineIndex < maxConnections; j++) {
          const j3 = j * 3;
          const dx = nPos[i3] - nPos[j3];
          const dy = nPos[i3 + 1] - nPos[j3 + 1];
          const dz = nPos[i3 + 2] - nPos[j3 + 2];
          const distSq = dx * dx + dy * dy + dz * dz;

          if (distSq < 225) { // within distance of 15
            const pIdx = lineIndex * 6;
            linePositions[pIdx] = nPos[i3];
            linePositions[pIdx + 1] = nPos[i3 + 1];
            linePositions[pIdx + 2] = nPos[i3 + 2];
            linePositions[pIdx + 3] = nPos[j3];
            linePositions[pIdx + 4] = nPos[j3 + 1];
            linePositions[pIdx + 5] = nPos[j3 + 2];

            const alpha = 1 - Math.sqrt(distSq) / 15;
            const cIdx = lineIndex * 6;
            lineColors[cIdx] = 0.29 * alpha;
            lineColors[cIdx + 1] = 0.87 * alpha;
            lineColors[cIdx + 2] = 0.5 * alpha;
            lineColors[cIdx + 3] = 0.0 * alpha;
            lineColors[cIdx + 4] = 0.94 * alpha;
            lineColors[cIdx + 5] = 1.0 * alpha;

            lineIndex++;
          }
        }
      }
      lineGeom.setDrawRange(0, lineIndex * 2);
      lineGeom.attributes.position.needsUpdate = true;
      lineGeom.attributes.color.needsUpdate = true;

      // Undulate Cyber Terrain Mesh Vertices
      const pArr = posAttr.array;
      for (let i = 0; i < pArr.length; i += 3) {
        const u = baseTerrainPositions[i];
        const v = baseTerrainPositions[i + 2];
        pArr[i + 1] = baseTerrainPositions[i + 1] + 
          Math.sin(u * 0.12 + clock * 1.4) * 2.2 + 
          Math.cos(v * 0.08 + clock * 1.1) * 2.2;
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    }
    animate();

    // Window Resize Handler
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  initGlobal3DBackground();

  // ===================================================================
  // 2. INTERACTIVE 3D TILT ENGINE (CARDS WITH DYNAMIC GLARE & DEPTH)
  // ===================================================================
  const tiltCards = document.querySelectorAll('.card-3d:not(.perk-3d-layer)');

  tiltCards.forEach(card => {
    // Inject dynamic glare overlay if not present
    let glare = card.querySelector('.card-glare');
    if (!glare) {
      glare = document.createElement('div');
      glare.className = 'card-glare';
      card.appendChild(glare);
    }

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 12;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025)`;

      // Specular Glare Movement
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;
      glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)`;
      glare.style.opacity = '1';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      glare.style.opacity = '0';
    });
  });

  // ===================================================================
  // 3. 3D PRINTING & ADDITIVE PROTOTYPING SIMULATION STUDIO (CONTINUOUS AUTO-PRINT)
  // ===================================================================
  const modelStack = document.getElementById('modelStack');
  const printSlider = document.getElementById('printSlider');
  const printProgressLabel = document.getElementById('printProgressLabel');
  const telemZHeight = document.getElementById('telemZHeight');
  const telemNozzleTemp = document.getElementById('telemNozzleTemp');
  const telemBedTemp = document.getElementById('telemBedTemp');
  const telemCycleCount = document.getElementById('telemCycleCount');
  const extruderGantry = document.getElementById('extruderGantry');
  const extruderToolhead = document.getElementById('extruderToolhead');
  const btnTogglePrint = document.getElementById('btnTogglePrint');
  const printerStage = document.getElementById('printerStage');
  const chamberStatusLabel = document.getElementById('chamberStatusLabel');
  const printSpeedButtons = document.querySelectorAll('.btn-print-speed');

  const TOTAL_LAYERS = 28;
  let isPrinting = true; // Auto-print active by default
  let printInterval = null;
  let currentLayer = 0;
  let printCycle = 1;
  let printDelayMs = 95; // Normal speed
  let isCoolingDown = false;

  // Generate Layer Elements with dynamic parametric geometry per cycle
  function generateModelLayers(cycleSeed = 1) {
    if (!modelStack) return;
    modelStack.innerHTML = '';
    for (let i = 0; i < TOTAL_LAYERS; i++) {
      const layer = document.createElement('div');
      layer.className = 'print-layer';
      // Vary width contour based on cycle seed for realistic different mechanical parts
      const phase = (cycleSeed % 3) * 0.8;
      const widthFactor = 62 + Math.sin(i * 0.28 + phase) * 28 + Math.cos(i * 0.15) * 8;
      layer.style.width = `${Math.max(30, Math.min(95, widthFactor))}%`;
      modelStack.appendChild(layer);
    }
  }

  function updatePrintSimulation(layerIndex) {
    if (!modelStack) return;
    const layers = modelStack.querySelectorAll('.print-layer');
    currentLayer = Math.max(0, Math.min(layerIndex, TOTAL_LAYERS));

    // Update active deposited layers
    layers.forEach((l, idx) => {
      if (idx < currentLayer) {
        l.classList.add('deposited');
      } else {
        l.classList.remove('deposited');
      }
    });

    // Update Progress Slider & Percentage Label
    const percent = Math.round((currentLayer / TOTAL_LAYERS) * 100);
    if (printSlider) printSlider.value = currentLayer;
    if (printProgressLabel) printProgressLabel.innerText = `${percent}%`;

    // Calculate Physical Z-Height (0.16mm layer height standard)
    if (telemZHeight) {
      telemZHeight.innerText = `${(currentLayer * 0.16).toFixed(2)} mm`;
    }

    // Move Extruder Gantry & Toolhead in 3D Space
    if (extruderGantry) {
      // Moves upward as layer height stacks
      const gantryTop = 190 - (currentLayer * 5.4);
      extruderGantry.style.top = `${Math.max(25, gantryTop)}px`;
    }

    if (extruderToolhead) {
      // Sweeping nozzle oscillation across build plate
      const sweepX = 18 + ((currentLayer % 2 === 0) ? (15 + (currentLayer * 4) % 60) : (75 - (currentLayer * 4) % 60));
      extruderToolhead.style.left = `${sweepX}%`;
    }

    // Dynamic Telemetry Realism Jitter
    if (telemNozzleTemp) {
      const tempJitter = (215 + (Math.random() * 0.8 - 0.4)).toFixed(1);
      telemNozzleTemp.innerText = `${tempJitter}°C`;
    }
    if (telemBedTemp) {
      const bedJitter = (60 + (Math.random() * 0.4 - 0.2)).toFixed(1);
      telemBedTemp.innerText = `${bedJitter}°C`;
    }
  }

  // Start Automatic Continuous Printing Loop
  function startContinuousAutoPrint() {
    isPrinting = true;
    if (printerStage) printerStage.classList.remove('paused');

    if (btnTogglePrint) {
      btnTogglePrint.classList.add('active');
      btnTogglePrint.classList.remove('paused');
      btnTogglePrint.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> <span>Auto-Printing Active</span>';
    }

    if (chamberStatusLabel) {
      chamberStatusLabel.innerText = 'PGI INDUSTRIAL 3D PROTOTYPING RIG • CONTINUOUS ACTIVE PRINTING';
    }

    if (printInterval) clearInterval(printInterval);

    printInterval = setInterval(() => {
      if (isCoolingDown) return;

      currentLayer++;
      updatePrintSimulation(currentLayer);

      // When print completes 100% -> cool down, clear bed, and start next cycle automatically!
      if (currentLayer >= TOTAL_LAYERS) {
        isCoolingDown = true;
        if (printProgressLabel) printProgressLabel.innerText = '100% ✓';
        if (chamberStatusLabel) {
          chamberStatusLabel.innerText = `CYCLE #${printCycle} COMPLETED • AUTO-CLEARING BED...`;
        }

        setTimeout(() => {
          if (!isPrinting) {
            isCoolingDown = false;
            return;
          }
          printCycle++;
          if (telemCycleCount) telemCycleCount.innerText = `Cycle #${printCycle}`;
          if (chamberStatusLabel) {
            chamberStatusLabel.innerText = 'PGI INDUSTRIAL 3D PROTOTYPING RIG • CONTINUOUS ACTIVE PRINTING';
          }
          generateModelLayers(printCycle);
          currentLayer = 0;
          updatePrintSimulation(0);
          isCoolingDown = false;
        }, 800);
      }
    }, printDelayMs);
  }

  // Stop / Pause Continuous Printing Loop
  function stopContinuousAutoPrint() {
    isPrinting = false;
    if (printInterval) {
      clearInterval(printInterval);
      printInterval = null;
    }

    if (printerStage) printerStage.classList.add('paused');

    if (btnTogglePrint) {
      btnTogglePrint.classList.remove('active');
      btnTogglePrint.classList.add('paused');
      btnTogglePrint.innerHTML = '<i class="fas fa-play"></i> <span>Resume Auto-Print</span>';
    }

    if (chamberStatusLabel) {
      chamberStatusLabel.innerText = 'PGI INDUSTRIAL 3D PROTOTYPING RIG • PAUSED';
    }
  }

  // Toggle button click listener
  if (btnTogglePrint) {
    btnTogglePrint.addEventListener('click', () => {
      if (isPrinting) {
        stopContinuousAutoPrint();
      } else {
        startContinuousAutoPrint();
      }
    });
  }

  // Interactive Range Slider Scrub
  if (printSlider) {
    let wasPrintingBeforeScrub = false;

    printSlider.addEventListener('input', (e) => {
      if (isPrinting) {
        wasPrintingBeforeScrub = true;
        stopContinuousAutoPrint();
      }
      updatePrintSimulation(parseInt(e.target.value, 10));
    });

    const resumeAfterScrub = () => {
      if (wasPrintingBeforeScrub) {
        wasPrintingBeforeScrub = false;
        startContinuousAutoPrint();
      }
    };

    printSlider.addEventListener('change', resumeAfterScrub);
    printSlider.addEventListener('mouseup', resumeAfterScrub);
    printSlider.addEventListener('touchend', resumeAfterScrub);
  }

  // Print Speed Controls (Precision: 180ms, Normal: 95ms, Turbo: 45ms)
  printSpeedButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      printSpeedButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const speedVal = parseInt(btn.getAttribute('data-speed'), 10) || 95;
      printDelayMs = speedVal;

      // Restart interval with new speed if actively printing
      if (isPrinting) {
        startContinuousAutoPrint();
      }
    });
  });

  // Automatically start continuous printing on initialize!
  generateModelLayers(1);
  updatePrintSimulation(0);
  startContinuousAutoPrint();

  // ===================================================================
  // 4. SCROLL 3D REVEAL SYSTEM (INTERSECTION OBSERVER)
  // ===================================================================
  const revealElements = document.querySelectorAll('.reveal-3d');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('active'));
  }

  // ===================================================================
  // 5. STICKY NAVBAR & SPY
  // ===================================================================
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.pageYOffset + 140;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // ===================================================================
  // 6. MOBILE DRAWER MENU
  // ===================================================================
  const mobileToggle = document.getElementById('mobileToggle');
  const drawerClose = document.getElementById('drawerClose');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerOverlay = document.getElementById('drawerOverlay');
  const drawerLinks = document.querySelectorAll('.drawer-links a');

  function openDrawer() {
    mobileDrawer.classList.add('active');
    drawerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    mobileDrawer.classList.remove('active');
    drawerOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (mobileToggle) mobileToggle.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);
  drawerLinks.forEach(link => link.addEventListener('click', closeDrawer));

  // ===================================================================
  // 7. COURSE CATEGORY FILTERING & MOVING STREAM CONTROLLER
  // ===================================================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const programBoxes = document.querySelectorAll('.program-moving-box, .course-card');
  const streamTrack1 = document.getElementById('streamTrack1');
  const streamTrack2 = document.getElementById('streamTrack2');
  const btnToggleStream = document.getElementById('btnToggleStream');
  const btnSpeedStream = document.getElementById('btnSpeedStream');

  // Filter Buttons Handler
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      programBoxes.forEach(box => {
        const category = box.getAttribute('data-category') || '';
        if (filterValue === 'all') {
          box.style.opacity = '1';
          box.style.filter = 'none';
          box.style.borderColor = '';
          box.style.boxShadow = '';
        } else if (category === filterValue || category.includes(filterValue)) {
          box.style.opacity = '1';
          box.style.filter = 'none';
          box.style.borderColor = 'var(--c-lime-neon)';
          box.style.boxShadow = '0 0 25px rgba(74, 222, 128, 0.55)';
        } else {
          box.style.opacity = '0.3';
          box.style.filter = 'grayscale(80%)';
          box.style.borderColor = '';
          box.style.boxShadow = '';
        }
      });
    });
  });

  // Moving Stream Pause / Play Toggle
  let isStreamPaused = false;
  if (btnToggleStream) {
    btnToggleStream.addEventListener('click', () => {
      isStreamPaused = !isStreamPaused;
      if (streamTrack1) streamTrack1.classList.toggle('is-paused', isStreamPaused);
      if (streamTrack2) streamTrack2.classList.toggle('is-paused', isStreamPaused);

      if (isStreamPaused) {
        btnToggleStream.innerHTML = '<i class="fas fa-play"></i> Resume Motion';
        btnToggleStream.classList.remove('active');
      } else {
        btnToggleStream.innerHTML = '<i class="fas fa-pause"></i> Pause Motion';
        btnToggleStream.classList.add('active');
      }
    });
  }

  // Stream Speed Controller (Normal -> Fast -> Slow)
  let speedMode = 0; // 0 = Normal, 1 = Fast, 2 = Slow
  if (btnSpeedStream) {
    btnSpeedStream.addEventListener('click', () => {
      speedMode = (speedMode + 1) % 3;
      if (speedMode === 0) {
        btnSpeedStream.innerHTML = '<i class="fas fa-bolt"></i> Speed: Normal';
        if (streamTrack1) streamTrack1.style.animationDuration = '42s';
        if (streamTrack2) streamTrack2.style.animationDuration = '46s';
      } else if (speedMode === 1) {
        btnSpeedStream.innerHTML = '<i class="fas fa-forward"></i> Speed: Fast';
        if (streamTrack1) streamTrack1.style.animationDuration = '22s';
        if (streamTrack2) streamTrack2.style.animationDuration = '24s';
      } else {
        btnSpeedStream.innerHTML = '<i class="fas fa-clock"></i> Speed: Relaxed';
        if (streamTrack1) streamTrack1.style.animationDuration = '65s';
        if (streamTrack2) streamTrack2.style.animationDuration = '70s';
      }
    });
  }

  // ===================================================================
  // 8. STATS COUNTDOWN & CONTINUOUS AUTOMATIC COUNTER ENGINE
  // ===================================================================
  const metricCards = document.querySelectorAll('.metric-card');
  const counterElements = document.querySelectorAll('.counter-val');
  const btnReplayCounters = document.getElementById('btnReplayCounters');
  const btnContinuousLoop = document.getElementById('btnContinuousLoop');
  const metricsSection = document.getElementById('impactMetrics') || document.querySelector('.metrics-section');

  function easeOutExpo(x) {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
  }

  function easeInQuad(x) {
    return x * x;
  }

  function formatMetricNumber(val, formatType) {
    const num = Math.floor(val);
    if (formatType === 'en-IN') {
      return num.toLocaleString('en-IN');
    }
    return num.toLocaleString();
  }

  const activeCardLoops = new Map(); // card -> { rafId }

  // Start continuous automatic countdown on a selected card
  function startCardContinuousCountdown(card, initialDelay = 0) {
    if (!card) return;
    const counter = card.querySelector('.counter-val');
    const progressFill = card.querySelector('.metric-progress-fill');
    if (!counter) return;

    const target = +counter.getAttribute('data-target') || 0;
    const formatType = counter.getAttribute('data-format') || 'en-IN';
    const targetProgress = progressFill ? (progressFill.getAttribute('data-progress') || '90%') : '90%';

    // Mark card as selected & actively looping
    card.classList.add('is-selected', 'is-looping');

    let state = 'up'; // 'up' -> 'peak' -> 'down' -> 'bottom'
    let phaseStart = performance.now() + initialDelay;

    function loopStep(now) {
      if (!card.classList.contains('is-looping')) return;

      if (now < phaseStart) {
        const rafId = requestAnimationFrame(loopStep);
        activeCardLoops.set(card, { rafId });
        return;
      }

      const elapsed = now - phaseStart;

      if (state === 'up') {
        const dur = 1450;
        const p = Math.min(elapsed / dur, 1);
        const eased = easeOutExpo(p);
        const currentVal = eased * target;
        counter.innerText = formatMetricNumber(currentVal, formatType);
        if (progressFill) progressFill.style.width = `calc(${targetProgress} * ${eased})`;

        if (p >= 1) {
          counter.innerText = formatMetricNumber(target, formatType);
          if (progressFill) progressFill.style.width = targetProgress;
          card.classList.add('count-complete');
          state = 'peak';
          phaseStart = now;
        }
      } else if (state === 'peak') {
        if (elapsed > 420) {
          card.classList.remove('count-complete');
          state = 'down';
          phaseStart = now;
        }
      } else if (state === 'down') {
        const dur = 1100;
        const p = Math.min(elapsed / dur, 1);
        const eased = easeInQuad(p);
        const currentVal = (1 - eased) * target;
        counter.innerText = formatMetricNumber(currentVal, formatType);
        if (progressFill) progressFill.style.width = `calc(${targetProgress} * ${1 - eased})`;

        if (p >= 1) {
          counter.innerText = '0';
          if (progressFill) progressFill.style.width = '0%';
          state = 'bottom';
          phaseStart = now;
        }
      } else if (state === 'bottom') {
        if (elapsed > 260) {
          state = 'up';
          phaseStart = now;
        }
      }

      const rafId = requestAnimationFrame(loopStep);
      activeCardLoops.set(card, { rafId });
    }

    const rafId = requestAnimationFrame(loopStep);
    activeCardLoops.set(card, { rafId });
  }

  // Stop continuous countdown on a card and restore its completed values
  function stopCardContinuousCountdown(card) {
    if (!card) return;
    card.classList.remove('is-looping', 'is-selected', 'count-complete');

    if (activeCardLoops.has(card)) {
      const handle = activeCardLoops.get(card);
      if (handle && handle.rafId) cancelAnimationFrame(handle.rafId);
      activeCardLoops.delete(card);
    }

    const counter = card.querySelector('.counter-val');
    const progressFill = card.querySelector('.metric-progress-fill');
    if (counter) {
      const target = +counter.getAttribute('data-target') || 0;
      const formatType = counter.getAttribute('data-format') || 'en-IN';
      counter.innerText = formatMetricNumber(target, formatType);
    }
    if (progressFill) {
      const targetProgress = progressFill.getAttribute('data-progress') || '90%';
      progressFill.style.width = targetProgress;
    }
  }

  // Toggle continuous countdown on a single card
  function toggleCardContinuousCountdown(card) {
    if (card.classList.contains('is-looping')) {
      stopCardContinuousCountdown(card);
    } else {
      startCardContinuousCountdown(card, 0);
    }
    syncGlobalLoopButton();
  }

  // Sync global continuous loop button state
  function syncGlobalLoopButton() {
    if (!btnContinuousLoop) return;
    const loopingCount = document.querySelectorAll('.metric-card.is-looping').length;
    if (loopingCount > 0) {
      btnContinuousLoop.classList.add('active');
      btnContinuousLoop.innerHTML = '<i class="fas fa-pause"></i> <span>⏸ Pause Continuous Countdown</span>';
    } else {
      btnContinuousLoop.classList.remove('active');
      btnContinuousLoop.innerHTML = '<i class="fas fa-sync-alt"></i> <span>⚡ Continuous Loop (All)</span>';
    }
  }

  // Toggle all cards
  function toggleAllContinuousCountdown() {
    const loopingCards = document.querySelectorAll('.metric-card.is-looping');
    if (loopingCards.length > 0) {
      // Stop all
      metricCards.forEach(card => stopCardContinuousCountdown(card));
    } else {
      // Start all with staggered wave
      metricCards.forEach((card, idx) => {
        startCardContinuousCountdown(card, idx * 180);
      });
    }
    syncGlobalLoopButton();
  }

  if (btnContinuousLoop) {
    btnContinuousLoop.addEventListener('click', toggleAllContinuousCountdown);
  }

  // Single-pass count up for initial entrance
  function animateSingleCounterOnce(counter, duration = 1800, delay = 0) {
    const target = +counter.getAttribute('data-target') || 0;
    const formatType = counter.getAttribute('data-format') || 'en-IN';
    const card = counter.closest('.metric-card');
    const progressFill = card ? card.querySelector('.metric-progress-fill') : null;
    const targetProgress = progressFill ? (progressFill.getAttribute('data-progress') || '90%') : '90%';

    counter.innerText = '0';
    if (progressFill) progressFill.style.width = '0%';

    setTimeout(() => {
      let startTime = null;

      function updateCounterFrame(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutExpo(progress);

        const currentVal = easedProgress * target;
        counter.innerText = formatMetricNumber(currentVal, formatType);

        if (progressFill) {
          progressFill.style.width = `calc(${targetProgress} * ${easedProgress})`;
        }

        if (progress < 1) {
          requestAnimationFrame(updateCounterFrame);
        } else {
          counter.innerText = formatMetricNumber(target, formatType);
          if (progressFill) progressFill.style.width = targetProgress;
          if (card) {
            card.classList.add('count-complete');
            setTimeout(() => card.classList.remove('count-complete'), 600);
          }
        }
      }

      requestAnimationFrame(updateCounterFrame);
    }, delay);
  }

  let hasRunMetricsAnimation = false;

  function runAllMetricCountersOnce() {
    counterElements.forEach((counter, idx) => {
      animateSingleCounterOnce(counter, 1900, idx * 110);
    });
  }

  // Scroll Trigger with IntersectionObserver
  if (metricsSection && 'IntersectionObserver' in window) {
    const metricsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasRunMetricsAnimation) {
          hasRunMetricsAnimation = true;
          runAllMetricCountersOnce();
        }
      });
    }, { threshold: 0.22 });
    metricsObserver.observe(metricsSection);
  } else {
    runAllMetricCountersOnce();
  }

  // Replay Button Micro-Interaction
  if (btnReplayCounters) {
    btnReplayCounters.addEventListener('click', () => {
      // If any cards are looping, stop loops first
      metricCards.forEach(card => stopCardContinuousCountdown(card));
      syncGlobalLoopButton();

      const icon = btnReplayCounters.querySelector('i');
      if (icon) icon.classList.add('fa-spin');
      runAllMetricCountersOnce();
      setTimeout(() => {
        if (icon) icon.classList.remove('fa-spin');
      }, 1000);
    });
  }

  // Whenever a card is selected (clicked / tapped), start automatic continuous countdown!
  metricCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Toggle automatic continuous countdown on this selected card
      toggleCardContinuousCountdown(card);
    });
  });

  // ===================================================================
  // 9. ANIMATED FAQ POP-UP BARS & MODAL CONTROLLER
  // ===================================================================
  const faqData = [
    {
      category: 'Experiential Pedagogy',
      catIcon: 'fa-laptop-code',
      catKey: 'learning',
      question: 'What makes Plant Green Inertia "experiential" rather than traditional training?',
      answer: 'Traditional education focuses primarily on theoretical textbook memorization. PGI reverses the model completely: 80% of our learning hours are spent building live software repositories, troubleshooting real bugs, collaborating in agile teams, and pitching directly to industry leaders.',
      takeaways: [
        '80% hands-on project creation vs 20% theory',
        'Direct code reviews and architecture teardowns by industry engineers',
        'Assessment based on live production deployments rather than written tests'
      ]
    },
    {
      category: 'Government Accreditation',
      catIcon: 'fa-award',
      catKey: 'gov',
      question: 'Are PGI internship certificates recognized by the Government and corporates?',
      answer: 'Yes, unconditionally. Plant Green Inertia is an officially recognized startup under the DPIIT (Department for Promotion of Industry and Internal Trade, Govt. of India) and the certified training partner for TN Skills (TNSDC) under the Naan Mudhalvan initiative. Our certifications feature cryptographic verification accepted by 100+ corporate hiring partners.',
      takeaways: [
        'DPIIT Govt. of India Startup Recognition Certificate',
        'Official State Partner for Tamil Nadu Naan Mudhalvan Scheme',
        'Cryptographically verifiable digital blockchain hashes'
      ]
    },
    {
      category: 'Internships & Schedules',
      catIcon: 'fa-calendar-alt',
      catKey: 'internship',
      question: 'Can college students balance the 3-Month Internship with their academic schedule?',
      answer: 'Absolutely. Our internships feature flexible hybrid evening and weekend cohorts, self-paced LMS modules, and moratorium allowances during college semester examinations to ensure zero disruption to collegiate curricula.',
      takeaways: [
        'Hybrid evening and weekend live cohort sessions',
        'Flexible moratorium periods during college semester exams',
        '24/7 access to cloud labs, code repositories, and LMS recordings'
      ]
    },
    {
      category: 'Placement & Careers',
      catIcon: 'fa-briefcase',
      catKey: 'placement',
      question: 'How does the PGI Job Portal help graduates get placed in premier enterprises?',
      answer: 'Top performers from PGI courses and internships receive verified digital badges on the PGI Career Hub. Over 100+ corporate recruiters recruit directly through our portal, bypassing generic screening tests because PGI candidates are pre-assessed on live enterprise repositories.',
      takeaways: [
        'Direct interviews with 100+ corporate recruiting partners',
        'Portfolio-first profiling showcasing GitHub repositories and live deployments',
        'Dedicated resume workshops, mock HR panels, and technical screening prep'
      ]
    },
    {
      category: 'Institutional MoUs',
      catIcon: 'fa-university',
      catKey: 'learning',
      question: 'How can colleges and universities partner with PGI for on-campus Hackathons and FDPs?',
      answer: 'Colleges can sign institutional MoUs with PGI to host Faculty Development Programs (FDPs), industry-sponsored hackathons, and state-level incubation bootcamps. Our trainers set up on-premise experiential labs and bridge the collegiate curriculum with Industry 4.0 standards.',
      takeaways: [
        'Formal Institutional MoU with customized syllabus integration',
        'On-campus 36-hour hackathons with cash prizes and startup funding',
        'Accredited Faculty Development Programs (FDPs) for engineering faculty'
      ]
    },
    {
      category: 'Incubation & Startup Mission',
      catIcon: 'fa-chart-line',
      catKey: 'incubation',
      question: 'What is the ₹100 Crore student entrepreneurship incubation program by Founder Mr. Laven Lokesh Barani?',
      answer: 'Under the visionary leadership of Mr. Laven Lokesh Barani, PGI has initiated a dedicated mission to mentor 100 student entrepreneurs from ideation to scale. We assist with product architecture, incorporation, angel pitches, and go-to-market backing with a goal of achieving a collective valuation of ₹100 Crore.',
      takeaways: [
        'Mentorship by Mr. Laven Lokesh Barani (Founder, 5+ Lakhs students trained)',
        'Direct pitches to seed angel investors and venture capital syndicates',
        'Free office incubation, legal compliance assistance, and cloud credits'
      ]
    }
  ];

  // In-Section Interactive Question Bars (Expand / Collapse)
  const faqBars = document.querySelectorAll('.faq-popup-bar');
  faqBars.forEach(bar => {
    const header = bar.querySelector('.faq-bar-header');
    if (header) {
      header.addEventListener('click', (e) => {
        // If clicking the direct pop-up button, don't toggle accordion
        if (e.target.closest('.btn-bar-popup')) return;

        const isExpanded = bar.classList.contains('expanded');
        faqBars.forEach(b => b.classList.remove('expanded'));
        if (!isExpanded) {
          bar.classList.add('expanded');
        }
      });
    }
  });

  // Animated FAQ Pop-Up Modal Bar Elements
  const faqPopupModal = document.getElementById('faqPopupModal');
  const modalFaqClose = document.getElementById('modalFaqClose');
  const modalFaqCat = document.getElementById('modalFaqCat');
  const modalFaqIndex = document.getElementById('modalFaqIndex');
  const modalFaqTitle = document.getElementById('modalFaqTitle');
  const modalFaqAnswer = document.getElementById('modalFaqAnswer');
  const modalFaqTakeaways = document.getElementById('modalFaqTakeaways');
  const btnFaqPrev = document.getElementById('btnFaqPrev');
  const btnFaqNext = document.getElementById('btnFaqNext');
  const faqReactionUp = document.getElementById('faqReactionUp');
  const faqReactionDown = document.getElementById('faqReactionDown');
  const btnLaunchFaqModal = document.getElementById('btnLaunchFaqModal');
  const btnLaunchFloatingFaq = document.getElementById('btnLaunchFloatingFaq');

  let currentFaqModalIndex = 0;

  function renderFaqModal(index) {
    if (index < 0 || index >= faqData.length) return;
    currentFaqModalIndex = index;
    const item = faqData[index];

    if (modalFaqCat) {
      modalFaqCat.innerHTML = `<i class="fas ${item.catIcon}"></i> ${item.category}`;
    }
    if (modalFaqIndex) {
      modalFaqIndex.innerText = `Question ${index + 1} of ${faqData.length}`;
    }
    if (modalFaqTitle) {
      modalFaqTitle.innerText = item.question;
    }
    if (modalFaqAnswer) {
      modalFaqAnswer.innerText = item.answer;
    }
    if (modalFaqTakeaways) {
      modalFaqTakeaways.innerHTML = item.takeaways
        .map(t => `<li><i class="fas fa-check-circle"></i> ${t}</li>`)
        .join('');
    }

    if (btnFaqPrev) btnFaqPrev.disabled = (index === 0);
    if (btnFaqNext) btnFaqNext.disabled = (index === faqData.length - 1);

    // Reset reaction buttons
    if (faqReactionUp) faqReactionUp.classList.remove('voted');
    if (faqReactionDown) faqReactionDown.classList.remove('voted');
  }

  function openFaqModal(index = 0) {
    renderFaqModal(index);
    if (faqPopupModal) {
      faqPopupModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeFaqModal() {
    if (faqPopupModal) {
      faqPopupModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Hook all pop-up buttons on page
  document.querySelectorAll('.open-faq-modal-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.getAttribute('data-index') || '0', 10);
      openFaqModal(idx);
    });
  });

  if (btnLaunchFaqModal) {
    btnLaunchFaqModal.addEventListener('click', () => openFaqModal(0));
  }

  if (btnLaunchFloatingFaq) {
    btnLaunchFloatingFaq.addEventListener('click', () => openFaqModal(0));
  }

  if (modalFaqClose) {
    modalFaqClose.addEventListener('click', closeFaqModal);
  }

  if (faqPopupModal) {
    faqPopupModal.addEventListener('click', (e) => {
      if (e.target === faqPopupModal) closeFaqModal();
    });
  }

  if (btnFaqPrev) {
    btnFaqPrev.addEventListener('click', () => {
      if (currentFaqModalIndex > 0) {
        renderFaqModal(currentFaqModalIndex - 1);
      }
    });
  }

  if (btnFaqNext) {
    btnFaqNext.addEventListener('click', () => {
      if (currentFaqModalIndex < faqData.length - 1) {
        renderFaqModal(currentFaqModalIndex + 1);
      }
    });
  }

  // Reaction Button Feedback
  if (faqReactionUp) {
    faqReactionUp.addEventListener('click', () => {
      faqReactionUp.classList.toggle('voted');
      if (faqReactionDown) faqReactionDown.classList.remove('voted');
    });
  }
  if (faqReactionDown) {
    faqReactionDown.addEventListener('click', () => {
      faqReactionDown.classList.toggle('voted');
      if (faqReactionUp) faqReactionUp.classList.remove('voted');
    });
  }

  // Keyboard navigation for Modal Pop-up (ESC, Left, Right)
  window.addEventListener('keydown', (e) => {
    if (!faqPopupModal || !faqPopupModal.classList.contains('active')) return;
    if (e.key === 'Escape') closeFaqModal();
    if (e.key === 'ArrowLeft' && currentFaqModalIndex > 0) {
      renderFaqModal(currentFaqModalIndex - 1);
    }
    if (e.key === 'ArrowRight' && currentFaqModalIndex < faqData.length - 1) {
      renderFaqModal(currentFaqModalIndex + 1);
    }
  });

  // Real-time FAQ Search Bar
  const faqSearchInput = document.getElementById('faqSearchInput');
  const faqSearchClear = document.getElementById('faqSearchClear');

  if (faqSearchInput) {
    faqSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (faqSearchClear) {
        faqSearchClear.style.display = q ? 'block' : 'none';
      }

      faqBars.forEach(bar => {
        const text = bar.innerText.toLowerCase();
        if (!q || text.includes(q)) {
          bar.style.display = 'block';
        } else {
          bar.style.display = 'none';
        }
      });
    });
  }

  if (faqSearchClear) {
    faqSearchClear.addEventListener('click', () => {
      if (faqSearchInput) {
        faqSearchInput.value = '';
        faqSearchClear.style.display = 'none';
        faqBars.forEach(bar => bar.style.display = 'block');
      }
    });
  }

  // FAQ Category Filter Pills
  const faqFilterBtns = document.querySelectorAll('.faq-filter-btn');
  faqFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      faqFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterCat = btn.getAttribute('data-faq-cat');
      if (faqSearchInput) faqSearchInput.value = '';
      if (faqSearchClear) faqSearchClear.style.display = 'none';

      faqBars.forEach(bar => {
        const barCat = bar.getAttribute('data-category');
        if (filterCat === 'all' || barCat === filterCat) {
          bar.style.display = 'block';
        } else {
          bar.style.display = 'none';
        }
      });
    });
  });

  // ===================================================================
  // 10. MODAL POPUP & INQUIRY FORM
  // ===================================================================
  const modalOverlay = document.getElementById('courseModal');
  const modalClose = document.getElementById('modalClose');
  const modalTitle = document.getElementById('modalTitle');
  const modalDuration = document.getElementById('modalDuration');
  const modalDetails = document.getElementById('modalDetails');
  const enrollBtns = document.querySelectorAll('.open-course-modal');

  enrollBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const courseName = btn.getAttribute('data-course-name') || 'Course Overview';
      const duration = btn.getAttribute('data-course-duration') || '4 Weeks';
      const desc = btn.getAttribute('data-course-desc') || 'Industry-relevant experiential curriculum.';

      if (modalTitle) modalTitle.innerText = courseName;
      if (modalDuration) modalDuration.innerText = duration;
      if (modalDetails) modalDetails.innerText = desc;

      if (modalOverlay) modalOverlay.classList.add('active');
    });
  });

  if (modalClose && modalOverlay) {
    modalClose.addEventListener('click', () => modalOverlay.classList.remove('active'));
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) modalOverlay.classList.remove('active');
    });
  }

  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Application Sent!';
        submitBtn.style.background = '#059669';

        alert('Thank you for contacting Plant Green Inertia! Our counselor will connect with you within 24 hours.');
        contactForm.reset();

        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
          submitBtn.style.background = '';
        }, 3000);
      }, 900);
    });
  }

  // ===================================================================
  // 11. 360-DEGREE FOUNDER ROTATOR CONTROLLER
  // ===================================================================
  const founder360Card = document.getElementById('founder360Card');
  const btnSpin360 = document.getElementById('btnSpin360');
  const btnAutoSpin = document.getElementById('btnAutoSpin');
  const btnFlipFace = document.getElementById('btnFlipFace');
  const rotateAngleBadge = document.getElementById('rotateAngleBadge');

  if (founder360Card) {
    let currentYAngle = 0;
    let isDragging = false;
    let startX = 0;
    let previousAngle = 0;
    let isAutoSpinning = false;

    function applyRotation(angle) {
      currentYAngle = angle;
      founder360Card.style.transform = `rotateY(${currentYAngle}deg)`;
      const normalizedAngle = ((Math.round(currentYAngle) % 360) + 360) % 360;
      if (rotateAngleBadge) {
        rotateAngleBadge.innerText = `${normalizedAngle}°`;
      }
    }

    // Mouse Drag Rotation
    founder360Card.addEventListener('mousedown', (e) => {
      if (isAutoSpinning) stopAutoSpin();
      isDragging = true;
      startX = e.clientX;
      previousAngle = currentYAngle;
      founder360Card.classList.add('is-dragging');
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - startX;
      applyRotation(previousAngle + deltaX * 0.7);
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        founder360Card.classList.remove('is-dragging');
      }
    });

    // Touch Support for Mobile
    founder360Card.addEventListener('touchstart', (e) => {
      if (isAutoSpinning) stopAutoSpin();
      isDragging = true;
      startX = e.touches[0].clientX;
      previousAngle = currentYAngle;
      founder360Card.classList.add('is-dragging');
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const deltaX = e.touches[0].clientX - startX;
      applyRotation(previousAngle + deltaX * 0.7);
    }, { passive: true });

    window.addEventListener('touchend', () => {
      if (isDragging) {
        isDragging = false;
        founder360Card.classList.remove('is-dragging');
      }
    });

    // Full 360° Cinematic Spin Button
    if (btnSpin360) {
      btnSpin360.addEventListener('click', () => {
        if (isAutoSpinning) stopAutoSpin();
        const targetAngle = currentYAngle + 360;
        founder360Card.style.transition = 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
        applyRotation(targetAngle);
        setTimeout(() => {
          founder360Card.style.transition = 'transform 0.2s ease-out';
        }, 1250);
      });
    }

    // Flip 180° Face Button
    if (btnFlipFace) {
      btnFlipFace.addEventListener('click', () => {
        if (isAutoSpinning) stopAutoSpin();
        founder360Card.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        applyRotation(currentYAngle + 180);
        setTimeout(() => {
          founder360Card.style.transition = 'transform 0.2s ease-out';
        }, 850);
      });
    }

    // Auto-Spin Continuous Toggle
    function startAutoSpin() {
      isAutoSpinning = true;
      founder360Card.classList.add('auto-spinning');
      if (btnAutoSpin) {
        btnAutoSpin.innerHTML = '<i class="fas fa-pause"></i> Pause';
        btnAutoSpin.classList.add('active');
      }
    }

    function stopAutoSpin() {
      isAutoSpinning = false;
      founder360Card.classList.remove('auto-spinning');
      if (btnAutoSpin) {
        btnAutoSpin.innerHTML = '<i class="fas fa-sync-alt"></i> Auto Spin';
        btnAutoSpin.classList.remove('active');
      }
    }

    if (btnAutoSpin) {
      btnAutoSpin.addEventListener('click', () => {
        if (isAutoSpinning) {
          stopAutoSpin();
        } else {
          startAutoSpin();
        }
      });
    }

    // Initialize auto-spin for visual impact
    startAutoSpin();
  }

  // ===================================================================
  // 12. TRAIN THE TRAINER 3D CERTIFICATE PLAQUE & BROCHURE TOGGLE
  // ===================================================================
  const btnShowCert = document.getElementById('btnShowCert');
  const btnShowBrochure = document.getElementById('btnShowBrochure');
  const trainerCertCard = document.getElementById('trainerCertCard');
  const trainerBrochureView = document.getElementById('trainerBrochureView');
  const certSealStamp = document.getElementById('certSealStamp');

  if (btnShowCert && btnShowBrochure && trainerCertCard && trainerBrochureView) {
    btnShowCert.addEventListener('click', () => {
      btnShowCert.classList.add('active');
      btnShowBrochure.classList.remove('active');
      trainerCertCard.style.display = 'block';
      trainerBrochureView.classList.remove('active');
    });

    btnShowBrochure.addEventListener('click', () => {
      btnShowBrochure.classList.add('active');
      btnShowCert.classList.remove('active');
      trainerCertCard.style.display = 'none';
      trainerBrochureView.classList.add('active');
    });
  }

  // Interactive Golden Seal Stamp Click Micro-Interaction
  if (certSealStamp) {
    certSealStamp.addEventListener('click', () => {
      certSealStamp.classList.remove('stamped');
      void certSealStamp.offsetWidth; // Trigger DOM reflow
      certSealStamp.classList.add('stamped');

      // Subtle feedback badge
      const floatBadge = document.querySelector('.cert-floating-badge.bottom-right span');
      if (floatBadge) {
        const originalText = floatBadge.innerText;
        floatBadge.innerText = '✓ Status: Verified Active';
        floatBadge.style.color = '#4ade80';
        setTimeout(() => {
          floatBadge.innerText = originalText;
          floatBadge.style.color = '';
        }, 3000);
      }
    });
  }

  // ===================================================================
  // 13. INTEGRATED EDUCATIONAL ECOSYSTEM 50% TO 100% CONTINUOUS ZOOM ENGINE
  // ===================================================================
  const ecosystemSection = document.getElementById('ecosystem');
  const ecosystemZoomRange = document.getElementById('ecosystemZoomRange');
  const zoomPercentBadge = document.getElementById('zoomPercentBadge');
  const ecosystemZoomStage = document.getElementById('ecosystemZoomStage');
  const ecosystemViewport = document.getElementById('ecosystemViewport');
  const btnZoom50 = document.getElementById('btnZoom50') || document.getElementById('btnZoom30');
  const btnZoom75 = document.getElementById('btnZoom75') || document.getElementById('btnZoom65');
  const btnZoom100 = document.getElementById('btnZoom100');
  const btnAutoZoomPulse = document.getElementById('btnAutoZoomPulse');

  // Target selectors & Speed controls
  const btnSelectEcosystem = document.getElementById('btnSelectEcosystem');
  const btnSelectLMS = document.getElementById('btnSelectLMS');
  const btnSelectCareerHub = document.getElementById('btnSelectCareerHub');
  const speedButtons = document.querySelectorAll('.btn-speed-pill');

  // Cards & Card-level buttons
  const lmsCard = document.getElementById('lmsEcosystemCard');
  const jobCard = document.getElementById('jobEcosystemCard');
  const btnCardZoomLMS = document.getElementById('btnCardZoomLMS');
  const btnCardZoomJob = document.getElementById('btnCardZoomJob');

  if (ecosystemZoomStage && ecosystemZoomRange && zoomPercentBadge) {
    let currentTarget = 'stage'; // 'stage' | 'lms' | 'job'
    let isPulsing = false;
    let pulseRafId = null;
    let cycleDurationMs = 3200;
    let pulseStartTime = 0;

    // Manual zoom scale factor (50% -> 100%)
    function setEcosystemZoom(percent, syncSlider = true) {
      const clamped = Math.max(50, Math.min(100, Math.round(percent)));

      // If user manually operates slider or preset buttons, stop continuous pulse
      if (isPulsing) {
        stopContinuousZoom();
      }

      if (syncSlider && ecosystemZoomRange) {
        ecosystemZoomRange.value = clamped;
      }

      if (zoomPercentBadge) {
        zoomPercentBadge.innerText = clamped + '%';
      }

      const scale = clamped / 100;
      ecosystemZoomStage.style.transform = `scale(${scale})`;

      // Dynamically adapt viewport minimum height for proportional fit
      if (ecosystemViewport) {
        const minHeight = 480 + ((clamped - 50) / 50) * (640 - 480);
        ecosystemViewport.style.minHeight = `${Math.round(minHeight)}px`;
      }

      // Update preset buttons state
      if (btnZoom50) btnZoom50.classList.toggle('active', clamped === 50);
      if (btnZoom75) btnZoom75.classList.toggle('active', clamped >= 70 && clamped <= 80);
      if (btnZoom100) btnZoom100.classList.toggle('active', clamped === 100);
    }

    // Telemetry ticker for real-time percentage and slider tracking
    function updateLiveTelemetry(now) {
      if (!isPulsing) return;
      if (!pulseStartTime) pulseStartTime = now;
      const elapsed = now - pulseStartTime;
      const progress = (Math.sin((elapsed / cycleDurationMs) * Math.PI * 2 - Math.PI / 2) + 1) / 2;
      const currentPercent = Math.round(50 + progress * 50);

      if (currentTarget === 'stage') {
        if (ecosystemZoomRange) ecosystemZoomRange.value = currentPercent;
        if (zoomPercentBadge) zoomPercentBadge.innerText = currentPercent + '%';
        if (ecosystemViewport) {
          const minH = 480 + ((currentPercent - 50) / 50) * (640 - 480);
          ecosystemViewport.style.minHeight = `${Math.round(minH)}px`;
        }
      } else if (currentTarget === 'lms') {
        if (zoomPercentBadge) zoomPercentBadge.innerText = `LMS: ${currentPercent}%`;
      } else if (currentTarget === 'job') {
        if (zoomPercentBadge) zoomPercentBadge.innerText = `Job: ${currentPercent}%`;
      }

      pulseRafId = requestAnimationFrame(updateLiveTelemetry);
    }

    // Start Continuous Zoom on selected target (50% ⟷ 100%)
    function startContinuousZoom(target = currentTarget) {
      currentTarget = target;
      isPulsing = true;
      pulseStartTime = 0;

      // Reset all animations first
      ecosystemZoomStage.classList.remove('pulsing-zoom');
      if (lmsCard) lmsCard.classList.remove('is-continuous-zooming', 'is-selected');
      if (jobCard) jobCard.classList.remove('is-continuous-zooming', 'is-selected');

      // Update target pill buttons
      if (btnSelectEcosystem) btnSelectEcosystem.classList.toggle('active', target === 'stage');
      if (btnSelectLMS) btnSelectLMS.classList.toggle('active', target === 'lms');
      if (btnSelectCareerHub) btnSelectCareerHub.classList.toggle('active', target === 'job');

      if (target === 'stage') {
        ecosystemZoomStage.style.transform = '';
        ecosystemZoomStage.classList.add('pulsing-zoom');
      } else if (target === 'lms' && lmsCard) {
        ecosystemZoomStage.style.transform = 'scale(1)';
        if (ecosystemViewport) ecosystemViewport.style.minHeight = '640px';
        lmsCard.classList.add('is-continuous-zooming', 'is-selected');
      } else if (target === 'job' && jobCard) {
        ecosystemZoomStage.style.transform = 'scale(1)';
        if (ecosystemViewport) ecosystemViewport.style.minHeight = '640px';
        jobCard.classList.add('is-continuous-zooming', 'is-selected');
      }

      // Update Auto-zoom button state
      if (btnAutoZoomPulse) {
        btnAutoZoomPulse.classList.add('active');
        btnAutoZoomPulse.innerHTML = '<i class="fas fa-pause"></i> <span>⏸ Pause Continuous Zoom</span>';
      }

      // Clear preset button active states during continuous zoom
      [btnZoom50, btnZoom75, btnZoom100].forEach(btn => btn && btn.classList.remove('active'));

      // Launch RAF loop for smooth synchronized telemetry
      if (pulseRafId) cancelAnimationFrame(pulseRafId);
      pulseRafId = requestAnimationFrame(updateLiveTelemetry);
    }

    // Stop Continuous Zoom
    function stopContinuousZoom() {
      isPulsing = false;
      if (pulseRafId) {
        cancelAnimationFrame(pulseRafId);
        pulseRafId = null;
      }

      ecosystemZoomStage.classList.remove('pulsing-zoom');
      if (lmsCard) lmsCard.classList.remove('is-continuous-zooming', 'is-selected');
      if (jobCard) jobCard.classList.remove('is-continuous-zooming', 'is-selected');

      if (btnAutoZoomPulse) {
        btnAutoZoomPulse.classList.remove('active');
        btnAutoZoomPulse.innerHTML = '<i class="fas fa-sync-alt"></i> <span>⚡ Continuous Zoom (50% ⟷ 100%)</span>';
      }

      // Restore current slider value
      const currentVal = parseInt(ecosystemZoomRange.value, 10) || 100;
      setEcosystemZoom(currentVal, true);
    }

    // Toggle continuous zoom
    function toggleContinuousZoom(target = currentTarget) {
      if (isPulsing && currentTarget === target) {
        stopContinuousZoom();
      } else {
        startContinuousZoom(target);
      }
    }

    // Target Selection Pills Click Handlers
    if (btnSelectEcosystem) {
      btnSelectEcosystem.addEventListener('click', () => {
        startContinuousZoom('stage');
      });
    }

    if (btnSelectLMS) {
      btnSelectLMS.addEventListener('click', () => {
        startContinuousZoom('lms');
      });
    }

    if (btnSelectCareerHub) {
      btnSelectCareerHub.addEventListener('click', () => {
        startContinuousZoom('job');
      });
    }

    // Interactive Card Click Selection
    function setupCardSelection(card, targetName, toggleBtn) {
      if (!card) return;

      card.addEventListener('click', (e) => {
        // Allow external links to open without interference
        if (e.target.closest('a') || e.target.closest('.btn-primary') || e.target.closest('.btn-outline')) {
          return;
        }

        // Toggle continuous zoom on selected card
        if (card.classList.contains('is-continuous-zooming')) {
          stopContinuousZoom();
        } else {
          startContinuousZoom(targetName);
        }
      });

      if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (card.classList.contains('is-continuous-zooming')) {
            stopContinuousZoom();
          } else {
            startContinuousZoom(targetName);
          }
        });
      }
    }

    setupCardSelection(lmsCard, 'lms', btnCardZoomLMS);
    setupCardSelection(jobCard, 'job', btnCardZoomJob);

    // Speed Control Buttons (Fast: 2s, Normal: 3.2s, Smooth: 5s)
    speedButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        speedButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const speedStr = btn.getAttribute('data-speed') || '3.2s';
        if (ecosystemSection) {
          ecosystemSection.style.setProperty('--zoom-cycle-duration', speedStr);
        }

        // Update RAF duration
        if (speedStr.includes('2s')) cycleDurationMs = 2000;
        else if (speedStr.includes('5s')) cycleDurationMs = 5000;
        else cycleDurationMs = 3200;

        pulseStartTime = 0; // Smooth restart phase
      });
    });

    // Slider input event (realtime manual continuous scaling)
    ecosystemZoomRange.addEventListener('input', (e) => {
      setEcosystemZoom(parseFloat(e.target.value), false);
    });

    // Preset buttons (50%, 75%, 100%)
    if (btnZoom50) {
      btnZoom50.addEventListener('click', () => setEcosystemZoom(50, true));
    }
    if (btnZoom75) {
      btnZoom75.addEventListener('click', () => setEcosystemZoom(75, true));
    }
    if (btnZoom100) {
      btnZoom100.addEventListener('click', () => setEcosystemZoom(100, true));
    }

    // Auto-pulse button
    if (btnAutoZoomPulse) {
      btnAutoZoomPulse.addEventListener('click', () => {
        toggleContinuousZoom(currentTarget);
      });
    }

    // Scroll-triggered interactive zoom entrance effect
    let hasTriggeredEntrance = false;
    if (ecosystemSection && 'IntersectionObserver' in window) {
      const zoomObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasTriggeredEntrance) {
            hasTriggeredEntrance = true;
            // Start continuous zoom automatically on entrance for instant engagement!
            startContinuousZoom('stage');
            zoomObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.25 });
      zoomObserver.observe(ecosystemSection);
    }
  }

  // ===================================================================
  // 14. INTERACTIVE 3D LAYER ARCHITECTURE: 3-MONTH IMMERSIVE INTERNSHIP
  // ===================================================================
  function initInternship3DLayers() {
    const stage = document.getElementById('internship3DStage');
    const deck = document.getElementById('perks3DDeck');
    const btnStack = document.getElementById('btnMode3DStack');
    const btnGrid = document.getElementById('btnMode3DGrid');
    const btnExplode = document.getElementById('btnMode3DExplode');
    const layers = deck ? deck.querySelectorAll('.perk-3d-layer') : [];

    if (!deck) return;

    let currentMode = 'mode-stack'; // Default mode
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;
    let animFrameId = null;

    // View Mode Switcher
    function setDeckMode(mode) {
      currentMode = mode;
      deck.classList.remove('mode-stack', 'mode-grid', 'mode-explode');
      deck.classList.add(mode);

      // Sync active state on buttons
      if (btnStack) btnStack.classList.toggle('active', mode === 'mode-stack');
      if (btnGrid) btnGrid.classList.toggle('active', mode === 'mode-grid');
      if (btnExplode) btnExplode.classList.toggle('active', mode === 'mode-explode');

      // Clear any leftover inline transforms
      deck.style.transform = '';
      targetRotX = 0;
      targetRotY = 0;
      currentRotX = 0;
      currentRotY = 0;
    }

    if (btnStack) btnStack.addEventListener('click', () => setDeckMode('mode-stack'));
    if (btnGrid) btnGrid.addEventListener('click', () => setDeckMode('mode-grid'));
    if (btnExplode) btnExplode.addEventListener('click', () => setDeckMode('mode-explode'));

    // Layer Click / Selection interaction
    layers.forEach((layer) => {
      layer.addEventListener('click', () => {
        const wasFocused = layer.classList.contains('is-focused');
        layers.forEach(l => l.classList.remove('is-focused'));
        if (!wasFocused) {
          layer.classList.add('is-focused');
        }
      });
    });

    // 3D Parallax Tilt for the Deck on cursor movement
    function renderDeckTilt() {
      // Lerp for smooth damping
      currentRotX += (targetRotX - currentRotX) * 0.12;
      currentRotY += (targetRotY - currentRotY) * 0.12;

      if (currentMode === 'mode-stack') {
        deck.style.transform = `perspective(1200px) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg)`;
      } else if (currentMode === 'mode-explode') {
        const baseRotX = 8;
        const baseRotY = -4;
        deck.style.transform = `perspective(1200px) rotateX(${(baseRotX + currentRotX).toFixed(2)}deg) rotateY(${(baseRotY + currentRotY).toFixed(2)}deg)`;
      } else {
        deck.style.transform = `perspective(1200px) rotateX(${(currentRotX * 0.45).toFixed(2)}deg) rotateY(${(currentRotY * 0.45).toFixed(2)}deg)`;
      }

      if (Math.abs(targetRotX - currentRotX) > 0.01 || Math.abs(targetRotY - currentRotY) > 0.01) {
        animFrameId = requestAnimationFrame(renderDeckTilt);
      } else {
        animFrameId = null;
      }
    }

    if (stage) {
      stage.addEventListener('mousemove', (e) => {
        const rect = stage.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        targetRotX = ((y - centerY) / centerY) * -7;
        targetRotY = ((x - centerX) / centerX) * 8.5;

        if (!animFrameId) {
          animFrameId = requestAnimationFrame(renderDeckTilt);
        }
      });

      stage.addEventListener('mouseleave', () => {
        targetRotX = 0;
        targetRotY = 0;
        if (!animFrameId) {
          animFrameId = requestAnimationFrame(renderDeckTilt);
        }
      });
    }
  }

  initInternship3DLayers();
});
