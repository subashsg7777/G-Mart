// src/components/Discount3D.jsx
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

export default function Discount3D({ size = 360 }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x00000000); // transparent

    const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(5, 5, 5);
    scene.add(dir);

    // Tag mesh
    const tagMat = new THREE.MeshStandardMaterial({ color: 0x6a0dad, roughness: 0.4, metalness: 0.2 });
    const tagGeo = new THREE.BoxGeometry(2, 1, 0.3);
    const tag = new THREE.Mesh(tagGeo, tagMat);
    scene.add(tag);

    // Load font and add text
    const loader = new FontLoader();
    loader.load('/fonts/helvetiker_bold.typeface.json', (font) => {
      const txtGeo = new TextGeometry('SALE!', {
        font,
        size: 0.35,
        height: 0.04,
        curveSegments: 8,
      });
      txtGeo.center(); // center text geometry
      const txtMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const txtMesh = new THREE.Mesh(txtGeo, txtMat);
      txtMesh.position.set(0, -0.02, 0.18);
      tag.add(txtMesh);
    });

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 3;
    controls.maxDistance = 10;

    // Animation loop
    let rafId;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      tag.rotation.y += 0.01;
      tag.rotation.x += 0.002;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize handling
    const handleResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      tag.geometry.dispose();
      tagMat.dispose();
    };
  }, [size]);

  return (
    <div
      ref={mountRef}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}
