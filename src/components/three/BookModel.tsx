"use client";

import React, { useRef, useState, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface BookModelProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  title: string;
  author?: string;
  subtitle?: string;
  emblem?: "dune" | "1984" | "sapiens" | "foundation" | "default";
  onClick?: () => void;
}

/**
 * Adjust hex color brightness
 */
function adjustHex(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
  return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
}

/**
 * Procedural Canvas Texture generator for realistic luxury hardcover book front cover
 */
function createCoverTexture(
  title: string,
  author: string,
  subtitle: string,
  color: string,
  emblem: "dune" | "1984" | "sapiens" | "foundation" | "default"
): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 768;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // 1. Rich Deep Gradient
  const grad = ctx.createLinearGradient(0, 0, 512, 768);
  grad.addColorStop(0, adjustHex(color, 25));
  grad.addColorStop(0.5, color);
  grad.addColorStop(1, adjustHex(color, -45));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 768);

  // 2. Subtle Leather / Grain Pattern
  ctx.fillStyle = "rgba(0, 0, 0, 0.06)";
  for (let y = 0; y < 768; y += 4) {
    ctx.fillRect(0, y, 512, 1);
  }

  // 3. Left Spine Shadow
  const spineGrad = ctx.createLinearGradient(0, 0, 32, 0);
  spineGrad.addColorStop(0, "rgba(0, 0, 0, 0.7)");
  spineGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.2)");
  spineGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = spineGrad;
  ctx.fillRect(0, 0, 32, 768);

  // 4. Gold Foil Gradient
  const gold = ctx.createLinearGradient(120, 100, 400, 680);
  gold.addColorStop(0, "#fff0a3");
  gold.addColorStop(0.3, "#d4af37");
  gold.addColorStop(0.7, "#f5df88");
  gold.addColorStop(1, "#9e7713");

  // 5. Embossed Double Gold Borders
  ctx.strokeStyle = gold;
  ctx.lineWidth = 3;
  ctx.strokeRect(32, 32, 448, 704);

  ctx.strokeStyle = "rgba(212, 175, 55, 0.45)";
  ctx.lineWidth = 1;
  ctx.strokeRect(42, 42, 428, 684);

  // Corner Diamond Accents
  const corners = [
    [32, 32],
    [480, 32],
    [32, 736],
    [480, 736],
  ];
  corners.forEach(([cx, cy]) => {
    ctx.fillStyle = "#f5df88";
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  // 6. Header Tag
  ctx.fillStyle = "#eedab0";
  ctx.font = "600 12px 'Georgia', serif";
  ctx.textAlign = "center";
  ctx.fillText("ATHENAEUM CLASSICS", 256, 80);

  // Small divider
  ctx.strokeStyle = "rgba(212, 175, 55, 0.6)";
  ctx.beginPath();
  ctx.moveTo(180, 95);
  ctx.lineTo(332, 95);
  ctx.stroke();

  // 7. Emblem Artwork
  ctx.save();
  ctx.translate(256, 240);
  ctx.strokeStyle = gold;
  ctx.fillStyle = gold;

  if (emblem === "dune") {
    // Twin moons + desert dunes
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, -10, 48, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(20, -25, 20, 0, Math.PI * 2);
    ctx.fill();

    // Sand Dunes
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-50, 20);
    ctx.quadraticCurveTo(-15, 0, 15, 25);
    ctx.quadraticCurveTo(35, 10, 50, 35);
    ctx.stroke();
  } else if (emblem === "1984") {
    // Eye of surveillance
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-55, 0);
    ctx.quadraticCurveTo(0, -42, 55, 0);
    ctx.quadraticCurveTo(0, 42, -55, 0);
    ctx.stroke();

    // Iris & Pupil
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();

    // Radiating rays
    ctx.lineWidth = 1;
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
      const x1 = Math.cos(angle) * 30;
      const y1 = Math.sin(angle) * 30;
      const x2 = Math.cos(angle) * 44;
      const y2 = Math.sin(angle) * 44;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  } else if (emblem === "sapiens") {
    // Sun Compass / Tree of Knowledge
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 45, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, Math.PI * 2);
    ctx.stroke();

    // Compass Star
    ctx.beginPath();
    ctx.moveTo(0, -38);
    ctx.lineTo(8, -10);
    ctx.lineTo(38, 0);
    ctx.lineTo(8, 10);
    ctx.lineTo(0, 38);
    ctx.lineTo(-8, 10);
    ctx.lineTo(-38, 0);
    ctx.lineTo(-8, -10);
    ctx.closePath();
    ctx.fill();
  } else if (emblem === "foundation") {
    // Galactic Empire Spiral / Pillar
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 52, 22, -Math.PI / 6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, 0, 40, 16, Math.PI / 4, 0, Math.PI * 2);
    ctx.stroke();

    // Imperial Vault Monolith
    ctx.fillRect(-8, -32, 16, 64);
  } else {
    // Classic Crest
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 40, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillRect(-6, -20, 12, 40);
    ctx.fillRect(-20, -6, 40, 12);
  }
  ctx.restore();

  // 8. Main Title
  ctx.fillStyle = gold;
  ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;

  if (title.length > 9) {
    ctx.font = "bold 38px 'Georgia', serif";
  } else {
    ctx.font = "bold 52px 'Georgia', serif";
  }
  ctx.textAlign = "center";
  ctx.fillText(title.toUpperCase(), 256, 430);

  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // 9. Subtitle
  if (subtitle) {
    ctx.fillStyle = "#f5e6c8";
    ctx.font = "italic 15px 'Georgia', serif";
    ctx.fillText(subtitle, 256, 470);
  }

  // 10. Center Gold Divider
  ctx.strokeStyle = gold;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(140, 510);
  ctx.lineTo(372, 510);
  ctx.stroke();

  // Small diamond in center
  ctx.fillStyle = "#fff0a3";
  ctx.beginPath();
  ctx.arc(256, 510, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // 11. Author Name
  ctx.fillStyle = "#ffffff";
  ctx.font = "600 22px 'Georgia', serif";
  ctx.fillText(author.toUpperCase(), 256, 565);

  // 12. Bottom Release Tag
  ctx.fillStyle = "#d4af37";
  ctx.font = "11px 'Georgia', serif";
  ctx.fillText("COLLECTOR'S EDITION", 256, 680);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedural Canvas Texture generator for spine
 */
function createSpineTexture(
  title: string,
  author: string,
  color: string
): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 768;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Background
  const grad = ctx.createLinearGradient(0, 0, 128, 0);
  grad.addColorStop(0, adjustHex(color, -30));
  grad.addColorStop(0.5, color);
  grad.addColorStop(1, adjustHex(color, -40));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 768);

  const gold = "#d4af37";

  // Raised Spine Rib Bands (luxury leather binding)
  const bandPositions = [70, 200, 560, 690];
  bandPositions.forEach((y) => {
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(0, y - 2, 128, 8);
    ctx.fillStyle = gold;
    ctx.fillRect(0, y, 128, 4);
  });

  // Vertical Spine Title
  ctx.save();
  ctx.translate(64, 380);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = "#fff0a3";
  ctx.font = "bold 24px 'Georgia', serif";
  ctx.textAlign = "center";
  ctx.fillText(title.toUpperCase(), 0, 0);

  // Small author name on spine
  if (author) {
    ctx.fillStyle = "#eedab0";
    ctx.font = "14px 'Georgia', serif";
    ctx.fillText(author.split(" ").pop()?.toUpperCase() || "", 0, 26);
  }
  ctx.restore();

  // Bottom Monogram
  ctx.fillStyle = gold;
  ctx.font = "bold 16px 'Georgia', serif";
  ctx.textAlign = "center";
  ctx.fillText("A", 64, 735);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function BookModel({
  position,
  rotation = [0, 0, 0],
  color = "#8b4513",
  title,
  author = "Athenaeum",
  subtitle = "",
  emblem = "default",
  onClick,
}: BookModelProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Generate textures once per book
  const coverTexture = useMemo(
    () => createCoverTexture(title, author, subtitle, color, emblem),
    [title, author, subtitle, color, emblem]
  );

  const spineTexture = useMemo(
    () => createSpineTexture(title, author, color),
    [title, author, color]
  );

  // Clean up textures on unmount
  useEffect(() => {
    return () => {
      coverTexture?.dispose();
      spineTexture?.dispose();
    };
  }, [coverTexture, spineTexture]);

  // Floating ambient animation + hover lift
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();

    // Gentle floating motion
    meshRef.current.position.y =
      position[1] +
      Math.sin(t * 1.4 + position[0]) * 0.08 +
      (hovered ? 0.28 : 0);

    // Rotation: tilt gently, turn towards viewer on hover
    meshRef.current.rotation.y =
      rotation[1] +
      Math.sin(t * 0.7 + position[2]) * 0.04 +
      (hovered ? 0.35 : 0);

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
        if (typeof document !== "undefined") {
          document.body.style.cursor = "pointer";
        }
      }}
      onPointerOut={() => {
        setHovered(false);
        if (typeof document !== "undefined") {
          document.body.style.cursor = "auto";
        }
      }}
    >
      {/* 1. Main Hardcover Base Mesh */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.5, 2.2, 0.35]} />
        <meshStandardMaterial
          color={color}
          roughness={0.4}
          metalness={0.15}
        />
      </mesh>

      {/* 2. Front Cover Plate with Custom Artwork & Gold Foil */}
      {coverTexture && (
        <mesh position={[0, 0, 0.177]} receiveShadow>
          <planeGeometry args={[1.5, 2.2]} />
          <meshStandardMaterial
            map={coverTexture}
            roughness={0.25}
            metalness={0.2}
          />
        </mesh>
      )}

      {/* 3. Spine Cover with Vertical Gold Lettering */}
      {spineTexture && (
        <mesh position={[-0.752, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[0.35, 2.2]} />
          <meshStandardMaterial
            map={spineTexture}
            roughness={0.3}
            metalness={0.25}
          />
        </mesh>
      )}

      {/* 4. Ivory Book Pages (visible on right, top, and bottom edges) */}
      <mesh position={[0.04, 0, 0]}>
        <boxGeometry args={[1.4, 2.12, 0.3]} />
        <meshStandardMaterial
          color="#fcf8ed"
          roughness={0.9}
        />
      </mesh>

      {/* 5. Subtle Gold Edge Highlight */}
      <mesh position={[-0.74, 0, 0.17]}>
        <boxGeometry args={[0.03, 2.16, 0.02]} />
        <meshStandardMaterial
          color="#d4af37"
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </group>
  );
}
