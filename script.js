
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const container = document.getElementById("brain-canvas");

if (container) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    35,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
camera.position.set(0, -0.65, 6.8);
camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  container.appendChild(renderer.domElement);


scene.add(
  new THREE.HemisphereLight(0xb8f4ff, 0x30152f, 2.0)
);

// Soft cyan key light
const cyanLight = new THREE.PointLight(0x55eaff, 30, 10);
cyanLight.position.set(2.5, 2, 3);
scene.add(cyanLight);

// Burgundy fill light
const burgundyLight = new THREE.PointLight(0xb83268, 20, 10);
burgundyLight.position.set(-2.5, -1, 2);
scene.add(burgundyLight);

// Subtle rim light from behind
const rimLight = new THREE.PointLight(0x536bff, 12, 10);
rimLight.position.set(0, 2, -2);
scene.add(rimLight);


  let brain = null;
  let targetRotationX = 0;
  let targetRotationY = 0;

  const loader = new GLTFLoader();

  loader.load(
    "brain.glb",
    (gltf) => {
      brain = gltf.scene;

      const box = new THREE.Box3().setFromObject(brain);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      brain.position.sub(center);

      const maxDimension = Math.max(size.x, size.y, size.z);
      const scale = 3.05 / maxDimension;
brain.scale.setScalar(scale);

// Опускаем мозг ниже центра сцены
brain.position.y = -0.65;

scene.add(brain);
    },
    undefined,
    (error) => {
      console.error("Could not load brain.glb:", error);
      container.innerHTML =
        '<p style="color:#d9deea;padding:24px">The 3D brain could not be loaded. Check the model path and browser console.</p>';
    }
  );

  container.addEventListener("pointermove", (event) => {
    const rect = container.getBoundingClientRect();

    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    targetRotationY = (x - 0.5) * 0.5;
    targetRotationX = (y - 0.5) * 0.25;
  });

  container.addEventListener("pointerleave", () => {
    targetRotationX = 0;
    targetRotationY = 0;
  });

  const clock = new THREE.Clock();

  
function animate() {
  requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();

  if (brain) {
    // Gentle automatic rotation
    const idleRotation = Math.sin(elapsed * 0.35) * 0.12;

    brain.rotation.y +=
      (targetRotationY + idleRotation - brain.rotation.y) * 0.025;

    brain.rotation.x +=
      (targetRotationX - brain.rotation.x) * 0.025;

    // Preserve the current vertical position and gentle floating motion
    brain.position.y = -0.65 + Math.sin(elapsed * 0.8) * 0.045;
  }

  renderer.render(scene, camera);
}


  animate();

  const resizeObserver = new ResizeObserver(() => {
    const width = container.clientWidth;
    const height = container.clientHeight;

    if (!width || !height) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });

  resizeObserver.observe(container);
}
