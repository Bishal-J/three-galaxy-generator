import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";

/**
 * Canvas & Scene Setup
 */
const canvas = document.querySelector("canvas.webgl") as HTMLCanvasElement;
const scene = new THREE.Scene();

/**
 * Load Star Texture
 */
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load("/textures/star.png");

/**
 * Color Themes
 */
const colorThemes: Record<
  string,
  { insideColor: string; outsideColor: string }
> = {
  "Vibrant Cosmic Glow": { insideColor: "#ff6b6b", outsideColor: "#4d4dff" },
  "Nebula Fantasy": { insideColor: "#ff66cc", outsideColor: "#6633cc" },
  "Milky Way Classic": { insideColor: "#ffffcc", outsideColor: "#9999ff" },
  "Supernova Heat": { insideColor: "#ff9900", outsideColor: "#ff3300" },
  "Chilled Space": { insideColor: "#ccffff", outsideColor: "#003366" },
  "Alien Glow": { insideColor: "#00ffcc", outsideColor: "#330066" },
};

/**
 * Galaxy Parameters
 */
type GalaxyMode =
  | "spiral"
  | "elliptical"
  | "cluster"
  | "explosion"
  | "tornado"
  | "swirl"
  | "helix"
  | "blackHole"
  | "galaxyMerge";

const parameters = {
  mode: "spiral" as GalaxyMode,
  count: 10000,
  size: 0.04,
  radius: 5,
  branches: 3,
  spin: 1,
  randomnessPower: 3,
  colorTheme: "Vibrant Cosmic Glow",
  insideColor: colorThemes["Vibrant Cosmic Glow"].insideColor,
  outsideColor: colorThemes["Vibrant Cosmic Glow"].outsideColor,
  autoRotate: true,
};

let geometry: THREE.BufferGeometry | null = null;
let material: THREE.PointsMaterial | null = null;
let points: THREE.Points | null = null;

/**
 * Galaxy Generation
 */
const generateGalaxy = () => {
  if (geometry) geometry.dispose();
  if (material) material.dispose();
  if (points) scene.remove(points);

  geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3);

  const colorInside = new THREE.Color(parameters.insideColor);
  const colorOutside = new THREE.Color(parameters.outsideColor);

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;
    let x = 0,
      y = 0,
      z = 0;
    const radius = Math.random() * parameters.radius;

    const branchAngle =
      ((i % parameters.branches) / parameters.branches) * Math.PI * 2;
    const spinAngle = radius * parameters.spin;

    const randomX =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);
    const randomY =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);
    const randomZ =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);

    switch (parameters.mode) {
      case "spiral":
        x = Math.cos(branchAngle + spinAngle) * radius + randomX;
        y = randomY;
        z = Math.sin(branchAngle + spinAngle) * radius + randomZ;
        break;
      case "elliptical":
        x = Math.cos(branchAngle) * radius * 1.2 + randomX * 0.5;
        y = randomY * 0.2;
        z = Math.sin(branchAngle) * radius * 0.8 + randomZ * 0.5;
        break;
      case "cluster":
        x = (Math.random() - 0.5) * parameters.radius * 2;
        y = (Math.random() - 0.5) * parameters.radius * 2;
        z = (Math.random() - 0.5) * parameters.radius * 2;
        break;
      case "explosion":
        x = radius * randomX;
        y = radius * randomY;
        z = radius * randomZ;
        break;
      case "tornado":
        const height = radius * 2;
        x = Math.sin(branchAngle + spinAngle) * radius;
        y = height * (i / parameters.count) - parameters.radius;
        z = Math.cos(branchAngle + spinAngle) * radius;
        break;
      case "swirl":
        const swirlFactor = Math.sin(i / 100) * 0.5;
        x =
          Math.cos(branchAngle + spinAngle + swirlFactor) * radius +
          randomX * 0.5;
        y = Math.sin(swirlFactor * 5) * 2 + randomY * 0.5;
        z =
          Math.sin(branchAngle + spinAngle + swirlFactor) * radius +
          randomZ * 0.5;
        break;
      case "helix":
        const angle = i * 0.02;
        const helixRadius = radius * 0.6;
        x = Math.cos(angle + branchAngle) * helixRadius + randomX * 0.3;
        y =
          (i / parameters.count) * parameters.radius * 4 -
          parameters.radius * 2;
        z = Math.sin(angle + branchAngle) * helixRadius + randomZ * 0.3;
        break;
      case "blackHole":
        const angleBlackHole = Math.random() * Math.PI * 2;
        x = Math.cos(angleBlackHole) * radius;
        y = Math.random() * 0.1;
        z = Math.sin(angleBlackHole) * radius;
        break;
      case "galaxyMerge":
        const mergeRadius = radius * 2;
        x = (Math.random() - 0.5) * mergeRadius;
        y = (Math.random() - 0.5) * mergeRadius;
        z = (Math.random() - 0.5) * mergeRadius;
        break;
    }

    positions[i3 + 0] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    const mixedColor = colorInside
      .clone()
      .lerp(colorOutside, radius / parameters.radius);
    colors[i3 + 0] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  material = new THREE.PointsMaterial({
    map: texture,
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  points = new THREE.Points(geometry, material);
  scene.add(points);
};

generateGalaxy();

/**
 * GUI
 */
const gui = new dat.GUI();

gui
  .add(parameters, "mode", [
    "spiral",
    "elliptical",
    "cluster",
    "explosion",
    "tornado",
    "swirl",
    "helix",
    "blackHole",
    "galaxyMerge",
  ])
  .onChange(generateGalaxy);

gui
  .add(parameters, "colorTheme", Object.keys(colorThemes))
  .onChange((value: string) => {
    parameters.insideColor = colorThemes[value].insideColor;
    parameters.outsideColor = colorThemes[value].outsideColor;
    insideColorController.setValue(parameters.insideColor);
    outsideColorController.setValue(parameters.outsideColor);
    generateGalaxy();
  });

gui
  .add(parameters, "count")
  .min(100)
  .max(20000)
  .step(100)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "size")
  .min(0.001)
  .max(0.1)
  .step(0.001)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "radius")
  .min(0.1)
  .max(20)
  .step(0.01)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "branches")
  .min(1)
  .max(10)
  .step(1)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "spin")
  .min(-5)
  .max(5)
  .step(0.001)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "randomnessPower")
  .min(1)
  .max(10)
  .step(0.001)
  .onFinishChange(generateGalaxy);

const insideColorController = gui
  .addColor(parameters, "insideColor")
  .onFinishChange(generateGalaxy);
const outsideColorController = gui
  .addColor(parameters, "outsideColor")
  .onFinishChange(generateGalaxy);

gui.add(parameters, "autoRotate");

/**
 * Resizing
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(3, 3, 3);
scene.add(camera);

/**
 * Controls
 */
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.autoRotate = parameters.autoRotate;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animation Loop
 */
const tick = () => {
  controls.autoRotate = parameters.autoRotate;
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
};

tick();
