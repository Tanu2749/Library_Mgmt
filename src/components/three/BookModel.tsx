"use client";

import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface BookModelProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  title: string;
  onClick?: () => void;
}

export function BookModel({
  position,
  rotation = [0, 0, 0],
  color = "#8b4513",
  title,
  onClick,
}: BookModelProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Floating ambient animation + hover lift
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();

    // Subtle gentle float
    meshRef.current.position.y =
      position[1] + Math.sin(t * 1.5 + position[0]) * 0.08 + (hovered ? 0.2 : 0);

    // Subtle rotation tilt
    meshRef.current.rotation.y =
      rotation[1] + Math.sin(t * 0.8 + position[2]) * 0.05 + (hovered ? 0.3 : 0);

    if (hovered) {
      meshRef.current.rotation.z = Math.sin(t * 3) * 0.02;
    }
  });

  return (
    <group
      ref={meshRef}
      position={position}
      rotation={rotation}
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      {/* Book Cover Mesh (Cover & Spine) */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.5, 2.2, 0.35]} />
        <meshStandardMaterial
          color={color}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Pages Inner Mesh (Ivory Paper) */}
      <mesh position={[0.05, 0, 0]}>
        <boxGeometry args={[1.4, 2.1, 0.3]} />
        <meshStandardMaterial
          color="#fbf7ee"
          roughness={0.9}
        />
      </mesh>

      {/* Gold Foil Spine Accent */}
      <mesh position={[-0.72, 0, 0]}>
        <boxGeometry args={[0.06, 2.15, 0.32]} />
        <meshStandardMaterial
          color="#d4af37"
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </group>
  );
}
