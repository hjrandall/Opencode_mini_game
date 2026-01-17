import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

declare global {
  interface Window {
    __AVATAR_MODEL_URI__?: string;
  }
}

type SceneState = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  root: THREE.Group;
  clock: THREE.Clock;
  resize: () => void;
  dispose: () => void;
};

function createScene(container: HTMLElement): SceneState {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
  camera.position.set(0, 0.8, 2.2);

  scene.add(new THREE.AmbientLight(0xffffff, 1.2));
  const dir = new THREE.DirectionalLight(0xffffff, 1.0);
  dir.position.set(2, 3, 4);
  scene.add(dir);

  const root = new THREE.Group();
  scene.add(root);

  const clock = new THREE.Clock();

  const resize = () => {
    const { clientWidth, clientHeight } = container;
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / Math.max(1, clientHeight);
    camera.updateProjectionMatrix();
  };

  const dispose = () => {
    renderer.dispose();
    renderer.domElement.remove();
  };

  return { renderer, scene, camera, root, clock, resize, dispose };
}

async function loadAvatar(sceneRoot: THREE.Group, modelUri: string) {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(modelUri);

  const avatar = gltf.scene;
  avatar.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.castShadow = false;
      obj.receiveShadow = false;
    }
  });

  // Auto-frame model: center + scale into a consistent size.
  const box = new THREE.Box3().setFromObject(avatar);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);

  avatar.position.sub(center);

  const maxAxis = Math.max(size.x, size.y, size.z) || 1;
  const targetSize = 1.0;
  const scale = targetSize / maxAxis;
  avatar.scale.setScalar(scale);

  sceneRoot.add(avatar);
  return avatar;
}

function start() {
  const container = document.getElementById('root');
  if (!container) return;

  const modelUri = window.__AVATAR_MODEL_URI__;
  if (!modelUri) {
    container.innerText = 'No avatar model URI provided.';
    return;
  }

  const state = createScene(container);
  state.resize();

  let avatar: THREE.Object3D | undefined;

  loadAvatar(state.root, modelUri)
    .then((obj) => {
      avatar = obj;
    })
    .catch((err) => {
      container.innerText = `Failed to load model: ${String(err)}`;
    });

  const onResize = () => state.resize();
  window.addEventListener('resize', onResize);

  const animate = () => {
    const t = state.clock.getElapsedTime();

    if (avatar) {
      avatar.rotation.y = t * 0.4;
      avatar.position.y = Math.sin(t * 1.5) * 0.08;
    }

    state.renderer.render(state.scene, state.camera);
    requestAnimationFrame(animate);
  };

  animate();

  window.addEventListener('unload', () => {
    window.removeEventListener('resize', onResize);
    state.dispose();
  });
}

start();
