import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { VisualStyle, CameraMovement, SceneClip, CharacterVoice } from '../types';
import { Play, Square, Video, Sparkles, Smile, Flame, Wind, Eye, RefreshCw } from 'lucide-react';

interface ThreeCanvasViewerProps {
  clip: SceneClip;
  characters: CharacterVoice[];
  onRecordingComplete?: (clipId: string, videoBlob: Blob) => void;
  isBatchRendering?: boolean;
}

type CartoonEmotion = 'determined' | 'happy_laugh' | 'surprised' | 'hero_wink';

export const ThreeCanvasViewer: React.FC<ThreeCanvasViewerProps> = ({
  clip,
  characters,
  onRecordingComplete,
  isBatchRendering = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayMode, setDisplayMode] = useState<'video' | '3d'>(clip.videoUrl ? 'video' : '3d');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSize, setRecordedSize] = useState<number | null>(null);
  const [characterEmotion, setCharacterEmotion] = useState<CartoonEmotion>('determined');
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);

  useEffect(() => {
    if (clip.videoUrl) {
      setDisplayMode('video');
    }
  }, [clip.videoUrl]);

  // References to Three.js internal objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Dynamic animated Pixar cartoon objects & bones
  const cartoonRigRef = useRef<{
    rootGroup?: THREE.Group;
    bodyMesh?: THREE.Mesh;
    chassisGroup?: THREE.Group;
    spoilerGroup?: THREE.Group;
    // Facial Rig
    pupilL?: THREE.Mesh;
    pupilR?: THREE.Mesh;
    irisL?: THREE.Mesh;
    irisR?: THREE.Mesh;
    eyelidTopL?: THREE.Mesh;
    eyelidTopR?: THREE.Mesh;
    eyelidBotL?: THREE.Mesh;
    eyelidBotR?: THREE.Mesh;
    eyebrowL?: THREE.Mesh;
    eyebrowR?: THREE.Mesh;
    mouthGroup?: THREE.Group;
    mouthUpper?: THREE.Mesh;
    mouthLower?: THREE.Mesh;
    teethMesh?: THREE.Mesh;
    tongueMesh?: THREE.Mesh;
    // Wheels & Steering
    wheelFrontL?: THREE.Group;
    wheelFrontR?: THREE.Group;
    wheelBackL?: THREE.Group;
    wheelBackR?: THREE.Group;
    // Particles & FX
    smokePuffs?: THREE.Mesh[];
    speedLines?: THREE.LineSegments;
    exhaustFlames?: THREE.Mesh[];
    canyonRocks?: THREE.Group;
    checkeredFlag?: THREE.Mesh;
  }>({});

  const duration = clip.durationSeconds || 5;

  // Discrete 4-band Toon Cel Shading Texture (Disney/Pixar Style)
  const createPixarToonGradient = () => {
    const colors = new Uint8Array([
      90, 95, 120, 255,   // Deep shadow
      160, 165, 185, 255, // Soft shadow core
      225, 225, 235, 255, // Diffuse cartoon body
      255, 255, 255, 255  // Direct cartoon rim highlight
    ]);
    const gradient = new THREE.DataTexture(colors, 4, 1, THREE.RGBAFormat);
    gradient.minFilter = THREE.NearestFilter;
    gradient.magFilter = THREE.NearestFilter;
    gradient.needsUpdate = true;
    return gradient;
  };

  // Outline helper
  const addInkedOutline = (mesh: THREE.Mesh, thickness = 0.045, color = 0x090d16) => {
    const outlineMat = new THREE.MeshBasicMaterial({
      color,
      side: THREE.BackSide,
    });
    const outline = new THREE.Mesh(mesh.geometry, outlineMat);
    outline.scale.multiplyScalar(1 + thickness);
    mesh.add(outline);
  };

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = Math.round(width * 9 / 16);

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 3.0, 9.2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    const toonGradient = createPixarToonGradient();

    // Build the high-fidelity Disney/Pixar 3D World
    buildHighFidelityPixarWorld(scene, clip.style, toonGradient);

    const clock = new THREE.Clock();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime() * speedMultiplier;
      const delta = clock.getDelta() * speedMultiplier;

      updatePixarAnimationPhysics(scene, camera, clip.style, clip.cameraMovement, elapsed, delta);
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = Math.round(newWidth * 9 / 16);
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      renderer.dispose();
    };
  }, [clip.style, speedMultiplier]);

  // Builds a breathtaking Disney/Pixar/Cars 3D scene with rich environment & character
  const buildHighFidelityPixarWorld = (scene: THREE.Scene, style: VisualStyle, toonGradient: THREE.DataTexture) => {
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }
    cartoonRigRef.current = {};

    if (style === 'cars_speedway') {
      // =========================================================================
      // 🏎️ CARS 3D (Radiator Springs Canyon + Route 66 + High Energy Toon Car)
      // =========================================================================
      scene.background = new THREE.Color(0x38bdf8); // Sky blue
      scene.fog = new THREE.FogExp2(0x38bdf8, 0.012);

      // Warm Golden Sun Light (Pixar Sunset / Golden Hour)
      const sun = new THREE.DirectionalLight(0xfff7ed, 3.2);
      sun.position.set(16, 22, 14);
      sun.castShadow = true;
      sun.shadow.mapSize.width = 1024;
      sun.shadow.mapSize.height = 1024;
      scene.add(sun);

      // Blue Sky Ambient Light + Terra Cotta Ground bounce
      const hemi = new THREE.HemisphereLight(0xbae6fd, 0xd97706, 1.6);
      scene.add(hemi);

      // Dramatic Rim Light for Pixar Silhouette Separation
      const rim = new THREE.DirectionalLight(0xf43f5e, 2.4);
      rim.position.set(-14, 10, -12);
      scene.add(rim);

      // Monument Valley / Radiator Springs Red Rock Bluffs in background
      const canyonGroup = new THREE.Group();
      const rockMat = new THREE.MeshToonMaterial({
        color: 0xc2410c, // Terracotta red rock
        gradientMap: toonGradient,
      });

      for (let r = 0; r < 7; r++) {
        const height = 12 + (r % 4) * 4;
        const rockGeo = new THREE.CylinderGeometry(4 + (r % 2) * 2, 7, height, 8);
        const rock = new THREE.Mesh(rockGeo, rockMat);
        rock.position.set(-35 + r * 12, height / 2 - 2, -28 - (r % 3) * 6);
        rock.rotation.y = r * 0.7;
        addInkedOutline(rock, 0.03, 0x7c2d12);
        canyonGroup.add(rock);
      }
      scene.add(canyonGroup);
      cartoonRigRef.current.canyonRocks = canyonGroup;

      // Stylized Fluffy Pixar Clouds
      for (let c = 0; c < 5; c++) {
        const cloud = new THREE.Group();
        const cloudMat = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: toonGradient });
        const s1 = new THREE.Mesh(new THREE.SphereGeometry(2.5, 12, 12), cloudMat);
        const s2 = new THREE.Mesh(new THREE.SphereGeometry(3.6, 12, 12), cloudMat);
        s2.position.set(2.4, 0.6, 0);
        const s3 = new THREE.Mesh(new THREE.SphereGeometry(2.2, 12, 12), cloudMat);
        s3.position.set(4.8, -0.4, 0);
        cloud.add(s1, s2, s3);
        cloud.position.set(-30 + c * 16, 20 + (c % 2) * 4, -40);
        scene.add(cloud);
      }

      // Asphalt Racetrack with Cartoon Yellow Stripes
      const trackMat = new THREE.MeshToonMaterial({ color: 0x334155, gradientMap: toonGradient });
      const track = new THREE.Mesh(new THREE.PlaneGeometry(80, 100), trackMat);
      track.rotation.x = -Math.PI / 2;
      track.receiveShadow = true;
      scene.add(track);

      // Yellow Center Dash Lines
      for (let y = -45; y < 45; y += 6) {
        const line = new THREE.Mesh(
          new THREE.PlaneGeometry(0.35, 3.2),
          new THREE.MeshBasicMaterial({ color: 0xfacc15 })
        );
        line.rotation.x = -Math.PI / 2;
        line.position.set(0, 0.02, y);
        scene.add(line);
      }

      // Checkered Finish Line Banner
      const bannerGeo = new THREE.PlaneGeometry(12, 2.5, 10, 2);
      const canvasTex = document.createElement('canvas');
      canvasTex.width = 256;
      canvasTex.height = 64;
      const ctx = canvasTex.getContext('2d')!;
      const sq = 32;
      for (let x = 0; x < 256; x += sq) {
        for (let y = 0; y < 64; y += sq) {
          ctx.fillStyle = ((x / sq + y / sq) % 2 === 0) ? '#ffffff' : '#000000';
          ctx.fillRect(x, y, sq, sq);
        }
      }
      const bannerTexture = new THREE.CanvasTexture(canvasTex);
      const bannerMat = new THREE.MeshBasicMaterial({ map: bannerTexture, side: THREE.DoubleSide });
      const banner = new THREE.Mesh(bannerGeo, bannerMat);
      banner.position.set(0, 5.2, -18);
      scene.add(banner);
      cartoonRigRef.current.checkeredFlag = banner;

      // =======================================================================
      // 🏎️ THE HERO CARTOON RACER (Squash & Stretch Rig, Expressive Eyes & Mouth)
      // =======================================================================
      const rootGroup = new THREE.Group();
      const chassisGroup = new THREE.Group();
      rootGroup.add(chassisGroup);

      // High-Gloss Candy Red Paint with Toon Lighting
      const carPaint = new THREE.MeshToonMaterial({
        color: 0xef4444,
        gradientMap: toonGradient,
      });

      // Sculpted Curvaceous Body (Aerodynamic Pixar Coupe)
      const mainBodyGeo = new THREE.CylinderGeometry(1.05, 1.35, 4.4, 20);
      const bodyMesh = new THREE.Mesh(mainBodyGeo, carPaint);
      bodyMesh.rotation.x = Math.PI / 2;
      bodyMesh.rotation.y = Math.PI / 2;
      bodyMesh.scale.set(0.68, 1.25, 0.95);
      bodyMesh.position.y = 0.85;
      bodyMesh.castShadow = true;
      addInkedOutline(bodyMesh, 0.045);
      chassisGroup.add(bodyMesh);
      cartoonRigRef.current.bodyMesh = bodyMesh;

      // Cabin / Greenhouse Roof (Rounded, Soft Pixar Form)
      const cabinGeo = new THREE.SphereGeometry(1.28, 20, 20);
      const cabinMat = new THREE.MeshToonMaterial({ color: 0xdc2626, gradientMap: toonGradient });
      const cabin = new THREE.Mesh(cabinGeo, cabinMat);
      cabin.scale.set(0.9, 0.68, 1.35);
      cabin.position.set(0, 1.4, -0.32);
      addInkedOutline(cabin, 0.045);
      chassisGroup.add(cabin);

      // --- PIXAR FACIAL EXPRESSION RIG ---
      // 1. Windshield
      const windshieldGeo = new THREE.PlaneGeometry(1.36, 0.62);
      const windshieldMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const windshield = new THREE.Mesh(windshieldGeo, windshieldMat);
      windshield.position.set(0, 1.46, 0.82);
      windshield.rotation.x = -0.32;
      chassisGroup.add(windshield);

      // 2. Large Expressive Pixar Eyes (Double Iris Ring + White Catchlights!)
      const irisGeo = new THREE.CircleGeometry(0.18, 24);
      const irisMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 }); // Bright Sky Blue

      // Left Eye
      const irisL = new THREE.Mesh(irisGeo, irisMat);
      irisL.position.set(-0.36, 1.46, 0.83);
      irisL.rotation.x = -0.32;

      const pupilL = new THREE.Mesh(new THREE.CircleGeometry(0.09, 16), new THREE.MeshBasicMaterial({ color: 0x090d16 }));
      pupilL.position.z = 0.002;

      // Catchlight (Disney Soul Sparkle in Eyes!)
      const catchlightL1 = new THREE.Mesh(new THREE.CircleGeometry(0.035, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      catchlightL1.position.set(-0.04, 0.04, 0.003);
      const catchlightL2 = new THREE.Mesh(new THREE.CircleGeometry(0.018, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      catchlightL2.position.set(0.03, -0.03, 0.003);
      pupilL.add(catchlightL1, catchlightL2);
      irisL.add(pupilL);
      chassisGroup.add(irisL);

      cartoonRigRef.current.irisL = irisL;
      cartoonRigRef.current.pupilL = pupilL;

      // Right Eye
      const irisR = new THREE.Mesh(irisGeo, irisMat);
      irisR.position.set(0.36, 1.46, 0.83);
      irisR.rotation.x = -0.32;

      const pupilR = new THREE.Mesh(new THREE.CircleGeometry(0.09, 16), new THREE.MeshBasicMaterial({ color: 0x090d16 }));
      pupilR.position.z = 0.002;

      const catchlightR1 = new THREE.Mesh(new THREE.CircleGeometry(0.035, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      catchlightR1.position.set(-0.04, 0.04, 0.003);
      const catchlightR2 = new THREE.Mesh(new THREE.CircleGeometry(0.018, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      catchlightR2.position.set(0.03, -0.03, 0.003);
      pupilR.add(catchlightR1, catchlightR2);
      irisR.add(pupilR);
      chassisGroup.add(irisR);

      cartoonRigRef.current.irisR = irisR;
      cartoonRigRef.current.pupilR = pupilR;

      // 3. Eyelids (Upper and Lower for Natural Blinking)
      const eyelidMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
      const eyelidTopGeo = new THREE.PlaneGeometry(0.6, 0.32);

      const eyelidTopL = new THREE.Mesh(eyelidTopGeo, eyelidMat);
      eyelidTopL.position.set(-0.36, 1.62, 0.84);
      eyelidTopL.rotation.x = -0.32;
      chassisGroup.add(eyelidTopL);
      cartoonRigRef.current.eyelidTopL = eyelidTopL;

      const eyelidTopR = new THREE.Mesh(eyelidTopGeo, eyelidMat);
      eyelidTopR.position.set(0.36, 1.62, 0.84);
      eyelidTopR.rotation.x = -0.32;
      chassisGroup.add(eyelidTopR);
      cartoonRigRef.current.eyelidTopR = eyelidTopR;

      // 4. Expressive Eyebrows (Disney curved arches)
      const browMat = new THREE.MeshBasicMaterial({ color: 0x991b1b });
      const browGeo = new THREE.BoxGeometry(0.5, 0.06, 0.05);

      const eyebrowL = new THREE.Mesh(browGeo, browMat);
      eyebrowL.position.set(-0.36, 1.74, 0.85);
      eyebrowL.rotation.x = -0.32;
      eyebrowL.rotation.z = 0.15; // Confident slant
      chassisGroup.add(eyebrowL);
      cartoonRigRef.current.eyebrowL = eyebrowL;

      const eyebrowR = new THREE.Mesh(browGeo, browMat);
      eyebrowR.position.set(0.36, 1.74, 0.85);
      eyebrowR.rotation.x = -0.32;
      eyebrowR.rotation.z = -0.15;
      chassisGroup.add(eyebrowR);
      cartoonRigRef.current.eyebrowR = eyebrowR;

      // 5. Smiling Front Bumper Mouth Rig (Moves on speech!)
      const mouthGroup = new THREE.Group();
      mouthGroup.position.set(0, 0.58, 2.22);

      // Curved smiling lip arch
      const lipMat = new THREE.MeshBasicMaterial({ color: 0x111827 });
      const smileArch = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.06, 8, 24, Math.PI), lipMat);
      smileArch.rotation.z = Math.PI;

      // Inside of mouth (Teeth & Tongue)
      const mouthInterior = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.35), new THREE.MeshBasicMaterial({ color: 0x881337 }));
      mouthInterior.position.z = -0.01;

      const teeth = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.1, 0.02), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      teeth.position.set(0, 0.1, 0);

      const tongue = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), new THREE.MeshBasicMaterial({ color: 0xf43f5e }));
      tongue.position.set(0, -0.08, 0);

      mouthGroup.add(smileArch, mouthInterior, teeth, tongue);
      chassisGroup.add(mouthGroup);
      cartoonRigRef.current.mouthGroup = mouthGroup;
      cartoonRigRef.current.teethMesh = teeth;
      cartoonRigRef.current.tongueMesh = tongue;

      // Racing Spoiler with Lightning Decal
      const spoilerGroup = new THREE.Group();
      const spoilerWing = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.14, 0.55), carPaint);
      spoilerWing.position.set(0, 1.55, -2.15);
      addInkedOutline(spoilerWing, 0.05);

      const strutL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.3), carPaint);
      strutL.position.set(-0.7, 1.3, -2.15);
      const strutR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.3), carPaint);
      strutR.position.set(0.7, 1.3, -2.15);
      spoilerGroup.add(spoilerWing, strutL, strutR);
      chassisGroup.add(spoilerGroup);
      cartoonRigRef.current.spoilerGroup = spoilerGroup;

      // Wheels & Steering Pivots (Front steer into corners!)
      const tireMat = new THREE.MeshToonMaterial({ color: 0x111827, gradientMap: toonGradient });
      const rimMat = new THREE.MeshToonMaterial({ color: 0xfacc15, gradientMap: toonGradient }); // Yellow NASCAR rims
      const tireGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.42, 24);

      const createWheel = () => {
        const pivot = new THREE.Group();
        const tire = new THREE.Mesh(tireGeo, tireMat);
        tire.rotation.z = Math.PI / 2;
        tire.castShadow = true;
        addInkedOutline(tire, 0.04);

        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.44, 16), rimMat);
        hub.rotation.z = Math.PI / 2;
        tire.add(hub);

        pivot.add(tire);
        return pivot;
      };

      const wFL = createWheel();
      wFL.position.set(-1.28, 0.55, 1.35);
      const wFR = createWheel();
      wFR.position.set(1.28, 0.55, 1.35);
      const wBL = createWheel();
      wBL.position.set(-1.28, 0.55, -1.35);
      const wBR = createWheel();
      wBR.position.set(1.28, 0.55, -1.35);

      rootGroup.add(wFL, wFR, wBL, wBR);
      cartoonRigRef.current.wheelFrontL = wFL;
      cartoonRigRef.current.wheelFrontR = wFR;
      cartoonRigRef.current.wheelBackL = wBL;
      cartoonRigRef.current.wheelBackR = wBR;

      // Billowing Fluffy Cartoon Tire Smoke Puffs
      const smokePuffs: THREE.Mesh[] = [];
      const puffMat = new THREE.MeshToonMaterial({
        color: 0xf8fafc,
        transparent: true,
        opacity: 0.88,
        gradientMap: toonGradient,
      });

      for (let s = 0; s < 6; s++) {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(0.35 + (s % 3) * 0.1, 12, 12), puffMat);
        puff.position.set(-0.9 + (s % 2) * 1.8, 0.4, -2.5 - s * 0.8);
        addInkedOutline(puff, 0.05, 0x94a3b8);
        scene.add(puff);
        smokePuffs.push(puff);
      }
      cartoonRigRef.current.smokePuffs = smokePuffs;

      // Dynamic Speed Lines System (Anime/Disney Motion Streaks)
      const lineCount = 40;
      const linePositions = new Float32Array(lineCount * 6);
      for (let i = 0; i < lineCount * 6; i += 6) {
        const x = (Math.random() - 0.5) * 14;
        const y = Math.random() * 6;
        const z = -20 + Math.random() * 40;
        linePositions[i] = x;
        linePositions[i + 1] = y;
        linePositions[i + 2] = z;
        linePositions[i + 3] = x;
        linePositions[i + 4] = y;
        linePositions[i + 5] = z + 4; // 4m streak length
      }
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
      const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 });
      const speedLines = new THREE.LineSegments(lineGeo, lineMat);
      scene.add(speedLines);
      cartoonRigRef.current.speedLines = speedLines;

      scene.add(rootGroup);
      cartoonRigRef.current.rootGroup = rootGroup;
      cartoonRigRef.current.chassisGroup = chassisGroup;

    } else if (style === 'marvel_action') {
      // Marvel Inked Cel Superhero with dramatic comic lighting
      scene.background = new THREE.Color(0x0f172a);
      scene.fog = new THREE.FogExp2(0x0f172a, 0.02);

      const hemi = new THREE.HemisphereLight(0x38bdf8, 0x1e293b, 2.0);
      scene.add(hemi);
      const sun = new THREE.DirectionalLight(0x06b6d4, 3.5);
      sun.position.set(10, 18, 10);
      sun.castShadow = true;
      scene.add(sun);

      const rootGroup = new THREE.Group();
      const heroMat = new THREE.MeshToonMaterial({ color: 0xe11d48, gradientMap: toonGradient });
      const goldMat = new THREE.MeshToonMaterial({ color: 0xf59e0b, gradientMap: toonGradient });

      // Stylized dynamic hero torso
      const torso = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.6, 0.9), heroMat);
      torso.position.y = 2.2;
      addInkedOutline(torso, 0.05);
      rootGroup.add(torso);

      // Glowing Arc Reactor
      const reactor = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.12, 16), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
      reactor.rotation.x = Math.PI / 2;
      reactor.position.set(0, 2.4, 0.48);
      rootGroup.add(reactor);

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 0.85), heroMat);
      head.position.y = 3.4;
      addInkedOutline(head, 0.05);
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.16, 0.1), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
      visor.position.set(0, 3.42, 0.44);
      rootGroup.add(head, visor);

      scene.add(rootGroup);
      cartoonRigRef.current.rootGroup = rootGroup;
    } else {
      // Pixar Toy Story Playroom with warm wooden floor and soft playful bounce
      scene.background = new THREE.Color(0xfef08a);
      scene.fog = new THREE.Fog(0xfef08a, 20, 60);

      const hemi = new THREE.HemisphereLight(0xffedd5, 0xfde047, 1.8);
      scene.add(hemi);
      const sun = new THREE.DirectionalLight(0xffedd5, 2.8);
      sun.position.set(8, 16, 8);
      scene.add(sun);

      const rootGroup = new THREE.Group();
      const toyMat = new THREE.MeshToonMaterial({ color: 0x3b82f6, gradientMap: toonGradient });
      const skinMat = new THREE.MeshToonMaterial({ color: 0xfcd34d, gradientMap: toonGradient });

      const body = new THREE.Mesh(new THREE.SphereGeometry(0.9, 20, 20), toyMat);
      body.position.y = 1.7;
      addInkedOutline(body, 0.045);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.85, 20, 20), skinMat);
      head.position.y = 3.0;
      addInkedOutline(head, 0.045);

      // Big Pixar Eyes
      const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      eyeL.position.set(-0.28, 3.1, 0.7);
      const pupilL = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), new THREE.MeshBasicMaterial({ color: 0x1e3a8a }));
      pupilL.position.set(-0.28, 3.1, 0.86);

      const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      eyeR.position.set(0.28, 3.1, 0.7);
      const pupilR = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), new THREE.MeshBasicMaterial({ color: 0x1e3a8a }));
      pupilR.position.set(0.28, 3.1, 0.86);

      rootGroup.add(body, head, eyeL, eyeR, pupilL, pupilR);
      scene.add(rootGroup);
      cartoonRigRef.current.rootGroup = rootGroup;
    }
  };

  // Disney 12 Principles: Squash & Stretch, Anticipation, Inertia & Secondary Motion
  const updatePixarAnimationPhysics = (
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    style: VisualStyle,
    camMove: CameraMovement,
    t: number,
    delta: number
  ) => {
    // 1. Dynamic Cinematic Camera Tracking
    switch (camMove) {
      case 'hero_orbit_360': {
        const radius = 7.8;
        const angle = t * 0.55;
        camera.position.x = Math.sin(angle) * radius;
        camera.position.z = Math.cos(angle) * radius;
        camera.position.y = 2.6 + Math.sin(t * 0.8) * 0.5;
        camera.lookAt(0, 1.25, 0);
        break;
      }
      case 'cinematic_pan': {
        camera.position.x = -6 + (t * 2.8) % 12;
        camera.position.y = 2.2;
        camera.position.z = 7.2;
        camera.lookAt(0, 1.2, 0);
        break;
      }
      case 'dolly_zoom': {
        const zDist = Math.max(3.8, 9.5 - t * 0.9);
        camera.position.set(Math.sin(t * 0.5) * 0.8, 1.8, zDist);
        camera.lookAt(0, 1.3, 0);
        break;
      }
      case 'low_angle_hero': {
        // Dramatic low angle hero shot making the cartoon car look towering & epic!
        camera.position.set(Math.sin(t * 0.4) * 2.8, 0.65, 5.2);
        camera.lookAt(0, 1.8, 0);
        break;
      }
      case 'shake_impact': {
        const shake = (Math.sin(t * 30) * 0.2) * Math.max(0, 1 - (t % 2.5));
        camera.position.set(shake, 2.3 + shake * 0.5, 7.0);
        camera.lookAt(0, 1.3, 0);
        break;
      }
      case 'action_tracking':
      default: {
        camera.position.set(3.2, 2.3, 6.2);
        camera.lookAt(0, 1.2, 0);
        break;
      }
    }

    // 2. Cars 3D Character Alive Physics (Squash & Stretch, Banking into Curves, Steering)
    if (style === 'cars_speedway') {
      const chassis = cartoonRigRef.current.chassisGroup;
      const body = cartoonRigRef.current.bodyMesh;

      if (chassis && body) {
        // Steering angle oscillating (turning left and right dynamically)
        const steerAngle = Math.sin(t * 2.2) * 0.28;

        // Banking: Car chassis rolls into the turn (Secondary Action!)
        chassis.rotation.z = -steerAngle * 0.5;
        chassis.rotation.y = steerAngle * 0.6;

        // Squash and Stretch: When bouncing on the suspension
        const bounce = Math.abs(Math.sin(t * 8));
        const squashY = 1.0 - bounce * 0.08;
        const stretchX = 1.0 + bounce * 0.05;
        chassis.scale.set(stretchX, squashY, stretchX);
        chassis.position.y = bounce * 0.12;

        // Front wheels physically steer and turn!
        const wFL = cartoonRigRef.current.wheelFrontL;
        const wFR = cartoonRigRef.current.wheelFrontR;
        if (wFL && wFR) {
          wFL.rotation.y = steerAngle;
          wFR.rotation.y = steerAngle;
        }

        // All 4 wheels spin rapidly with speed
        const spinDelta = delta * 24;
        if (wFL) wFL.children[0].rotation.x += spinDelta;
        if (wFR) wFR.children[0].rotation.x += spinDelta;
        const wBL = cartoonRigRef.current.wheelBackL;
        const wBR = cartoonRigRef.current.wheelBackR;
        if (wBL) wBL.children[0].rotation.x += spinDelta;
        if (wBR) wBR.children[0].rotation.x += spinDelta;

        // Wing spoiler wobbles with aerodynamics
        const spoiler = cartoonRigRef.current.spoilerGroup;
        if (spoiler) {
          spoiler.rotation.x = Math.sin(t * 12) * 0.04;
        }

        // --- EMOTION & FACIAL RIG LOGIC ---
        const irisL = cartoonRigRef.current.irisL;
        const irisR = cartoonRigRef.current.irisR;
        const pupilL = cartoonRigRef.current.pupilL;
        const pupilR = cartoonRigRef.current.pupilR;
        const eyelidTopL = cartoonRigRef.current.eyelidTopL;
        const eyelidTopR = cartoonRigRef.current.eyelidTopR;
        const browL = cartoonRigRef.current.eyebrowL;
        const browR = cartoonRigRef.current.eyebrowR;
        const mouth = cartoonRigRef.current.mouthGroup;

        // Natural Pixar Eye Blinking (Quick snap every ~3.2 seconds)
        const blinkPhase = t % 3.2;
        const isBlink = blinkPhase > 3.05;

        if (eyelidTopL && eyelidTopR) {
          if (characterEmotion === 'hero_wink') {
            // Winking right eye
            eyelidTopL.scale.y = isBlink ? 1.0 : 0.08;
            eyelidTopR.scale.y = 1.0;
          } else if (characterEmotion === 'surprised') {
            // Wide open eyes!
            eyelidTopL.scale.y = isBlink ? 1.0 : 0.02;
            eyelidTopR.scale.y = isBlink ? 1.0 : 0.02;
          } else {
            eyelidTopL.scale.y = isBlink ? 1.0 : 0.12;
            eyelidTopR.scale.y = isBlink ? 1.0 : 0.12;
          }
        }

        // Eyebrows posing based on emotion
        if (browL && browR) {
          if (characterEmotion === 'determined') {
            browL.rotation.z = 0.28;  // Fierce racing focus
            browR.rotation.z = -0.28;
            browL.position.y = 1.70;
            browR.position.y = 1.70;
          } else if (characterEmotion === 'surprised') {
            browL.rotation.z = -0.15; // High surprised arches
            browR.rotation.z = 0.15;
            browL.position.y = 1.84;
            browR.position.y = 1.84;
          } else if (characterEmotion === 'happy_laugh') {
            browL.rotation.z = 0.1;
            browR.rotation.z = -0.1;
            browL.position.y = 1.76;
            browR.position.y = 1.76;
          }
        }

        // Eyes tracking and looking towards camera
        if (irisL && irisR) {
          const eyeLook = Math.sin(t * 2.5) * 0.08;
          irisL.position.x = -0.36 + eyeLook;
          irisR.position.x = 0.36 + eyeLook;
        }

        // Mouth articulates and talks!
        if (mouth) {
          const talkFactor = Math.abs(Math.sin(t * 10));
          mouth.scale.set(1.0 + talkFactor * 0.15, 1.0 + talkFactor * 0.35, 1.0);
        }
      }

      // 3. Smoke Particles & Speed Lines
      const puffs = cartoonRigRef.current.smokePuffs;
      if (puffs) {
        puffs.forEach((puff, idx) => {
          puff.position.z -= delta * 5.5;
          puff.position.y += delta * 1.2;
          const s = 1.0 + (Math.sin(t * 6 + idx) * 0.3);
          puff.scale.set(s, s, s);
          if (puff.position.z < -8) {
            puff.position.z = -2.4;
            puff.position.y = 0.4;
          }
        });
      }

      const speedLines = cartoonRigRef.current.speedLines;
      if (speedLines) {
        speedLines.position.z -= delta * 18;
        if (speedLines.position.z < -25) {
          speedLines.position.z = 0;
        }
      }

      // Checkered banner waving in the wind
      const banner = cartoonRigRef.current.checkeredFlag;
      if (banner && banner.geometry) {
        banner.rotation.y = Math.sin(t * 3) * 0.12;
      }
    } else if (style === 'marvel_action') {
      const root = cartoonRigRef.current.rootGroup;
      if (root) {
        root.position.y = Math.sin(t * 2) * 0.15;
        root.rotation.y = Math.sin(t * 0.7) * 0.12;
      }
    } else {
      const root = cartoonRigRef.current.rootGroup;
      if (root) {
        // Playful Toy bounce with squash and stretch
        const bounce = Math.abs(Math.sin(t * 5));
        root.position.y = bounce * 0.3;
        root.scale.set(1.0 + bounce * 0.05, 1.0 - bounce * 0.08, 1.0 + bounce * 0.05);
        root.rotation.y = Math.sin(t * 1.8) * 0.2;
      }
    }
  };

  // Record Canvas directly to WebM Video
  const recordClipVideo = useCallback(async (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        reject(new Error('Canvas non disponibile'));
        return;
      }

      const stream = canvas.captureStream(30);
      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 4500000,
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const fullBlob = new Blob(chunks, { type: 'video/webm' });
        setRecordedSize(fullBlob.size);
        setIsRecording(false);
        if (onRecordingComplete) onRecordingComplete(clip.id, fullBlob);
        resolve(fullBlob);
      };

      setIsRecording(true);
      recorder.start();

      setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, duration * 1000);
    });
  }, [clip.id, duration, onRecordingComplete]);

  // Handle Play / Preview
  const togglePlay = () => {
    if (displayMode === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
      return;
    }

    if (isPlaying) {
      setIsPlaying(false);
      setPlaybackTime(0);
    } else {
      setIsPlaying(true);
      setPlaybackTime(0);
      const timer = setInterval(() => {
        setPlaybackTime((prev) => {
          if (prev >= duration) {
            clearInterval(timer);
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      clip.videoUrl = url;
      setDisplayMode('video');
      if (onRecordingComplete) {
        onRecordingComplete(clip.id, file);
      }
    }
  };

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Hidden File Input for uploading custom AI video clips */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="video/*"
        className="hidden"
      />

      {/* Main Viewport: Video AI Player or Three.js Canvas (No Subtitles as requested) */}
      <div ref={containerRef} className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
        {displayMode === 'video' && (clip.videoUrl || '/assets/aistudio/1792678071668_6de4271a.mp4') ? (
          <video
            ref={videoRef}
            src={clip.videoUrl || '/assets/aistudio/1792678071668_6de4271a.mp4'}
            loop
            playsInline
            controls
            onTimeUpdate={() => {
              if (videoRef.current) {
                setPlaybackTime(videoRef.current.currentTime);
              }
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className={`w-full h-full object-contain bg-black transition-all duration-300 ${
              clip.colorMood === 'warm_sunset'
                ? 'sepia-[0.25] saturate-110 hue-rotate-[-10deg]'
                : clip.colorMood === 'cold_neon'
                ? 'hue-rotate-[15deg] saturate-135 contrast-115'
                : clip.colorMood === 'pastel_soft'
                ? 'brightness-110 saturate-90 contrast-95'
                : clip.colorMood === 'dark_moody'
                ? 'contrast-125 brightness-90 saturate-95'
                : clip.colorMood === 'black_white_noir'
                ? 'grayscale contrast-125'
                : ''
            }`}
          />
        ) : (
          <canvas ref={canvasRef} className="w-full h-full block" />
        )}

        {/* Live Status Indicators & Mode Switcher */}
        <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
          {/* Mode Switcher Tabs */}
          <div className="bg-slate-950/90 backdrop-blur p-1 rounded-xl border border-slate-700 flex items-center gap-1 shadow-lg">
            <button
              onClick={() => {
                setDisplayMode('video');
                if (videoRef.current && isPlaying) videoRef.current.play();
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                displayMode === 'video'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              Clip AI Video (Stile Minions / Dola AI)
            </button>
            <button
              onClick={() => {
                setDisplayMode('3d');
                if (videoRef.current) videoRef.current.pause();
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                displayMode === '3d'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Viewport 3D Dinamico
            </button>
          </div>

          {isRecording && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-red-600/90 text-white font-bold text-xs uppercase tracking-wider rounded-full animate-pulse shadow-lg">
              <span className="w-2.5 h-2.5 bg-white rounded-full"></span>
              REC ({duration}s)
            </span>
          )}
        </div>

        {/* Dynamic Animation Tuning Overlay in top right */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className="bg-slate-950/90 backdrop-blur border border-amber-500/50 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-bold flex items-center gap-1.5 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {clip.style === 'ghibli_watercolor'
              ? '🍃 Ghibli Watercolor'
              : clip.style === 'epic_anime'
              ? '🎌 Epic Anime'
              : clip.style === 'cars_speedway'
              ? '🏎️ Cars 3D'
              : clip.style === 'marvel_action'
              ? '⚡ Marvel 3D'
              : clip.style === 'pixel_voxel'
              ? '👾 Voxel 3D'
              : clip.style === 'dark_fantasy'
              ? '🏰 Dark Fantasy'
              : clip.style === 'cinematic_realism'
              ? '🎥 Cinematic 3D'
              : '🍌 Minions & Pixar 3D'}
          </span>

          {displayMode === '3d' && (
            <div className="bg-slate-950/85 backdrop-blur border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-white flex items-center gap-2 shadow-lg">
              <Smile className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={characterEmotion}
                onChange={(e) => setCharacterEmotion(e.target.value as CartoonEmotion)}
                className="bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="determined" className="bg-slate-900">🏎️ Grinta da Gara (Focus)</option>
                <option value="happy_laugh" className="bg-slate-900">😄 Risata Minions / Felice</option>
                <option value="surprised" className="bg-slate-900">😲 Fari Abbaglianti (Shock)</option>
                <option value="hero_wink" className="bg-slate-900">😉 Ka-Chow Wink (Fiero)</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Control bar */}
      <div className="p-4 bg-slate-900/95 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={togglePlay}
            disabled={isRecording}
            className={`px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 transition ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            {isPlaying ? 'Ferma Riproduzione' : 'Riproduci Scena'}
          </button>

          {displayMode === '3d' && (
            <button
              onClick={() => recordClipVideo()}
              disabled={isRecording || isBatchRendering}
              className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold text-sm rounded-xl flex items-center gap-2 transition shadow-lg disabled:opacity-50"
            >
              <Video className="w-4 h-4" />
              {isRecording ? 'Registrazione in corso...' : `Registra Clip (.webm - ${duration}s)`}
            </button>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition border border-slate-700"
            title="Importa clip video generata con Dola AI, Kling, Wan 2.1 o RunWay"
          >
            <Video className="w-3.5 h-3.5 text-cyan-400" />
            Carica Clip AI (.mp4)
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          {displayMode === 'video' ? (
            <span className="bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Video AI HD • Stile Pixar 3D Attivo
            </span>
          ) : (
            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <Wind className="w-3.5 h-3.5 text-indigo-400" />
              <span>Velocità:</span>
              <select
                value={speedMultiplier}
                onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
                className="bg-transparent text-white font-bold cursor-pointer focus:outline-none"
              >
                <option value={0.75} className="bg-slate-900">0.75x Lento</option>
                <option value={1.0} className="bg-slate-900">1.0x Normale</option>
                <option value={1.25} className="bg-slate-900">1.25x Dinamico</option>
                <option value={1.5} className="bg-slate-900">1.5x Turbo Speed</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
