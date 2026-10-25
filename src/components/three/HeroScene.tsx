"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";
import { useRouter } from "next/navigation";
import { BookModel } from "./BookModel";

export function HeroScene() {
  const router = useRouter();

  const handleBookClick = (title: string) => {
    router.push(`/catalog?query=${encodeURIComponent(title)}`);
  };

  return (
    <div className="w-full h-full min-h-[380px] rounded-3xl overflow-hidden bg-gradient-to-b from-card via-background to-card border border-border/80 shadow-inner relative">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 2]} // Cap pixel ratio at 2 for performance
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 8, 5]} intensity={1.3} castShadow />
        <directionalLight position={[0, 0, 6]} intensity={0.9} />
        <pointLight position={[-4, 3, 2]} intensity={0.8} color="#d4af37" />

        <Suspense fallback={null}>
          <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.4}>
            {/* Book 1: Dune (Terracotta/Amber) */}
            <BookModel
              position={[-2.4, 0.2, 0]}
              rotation={[0.08, 0.35, -0.04]}
              color="#993617"
              title="Dune"
              author="Frank Herbert"
              subtitle="The Sci-Fi Epic"
              emblem="dune"
              onClick={() => handleBookClick("Dune")}
            />

            {/* Book 2: 1984 (Midnight Navy) */}
            <BookModel
              position={[-0.8, -0.1, 0.3]}
              rotation={[-0.04, 0.12, 0.04]}
              color="#131d2e"
              title="1984"
              author="George Orwell"
              subtitle="Dystopian Classic"
              emblem="1984"
              onClick={() => handleBookClick("1984")}
            />

            {/* Book 3: Sapiens (Warm Cognac) */}
            <BookModel
              position={[0.8, 0.25, -0.2]}
              rotation={[0.08, -0.2, -0.04]}
              color="#78350f"
              title="Sapiens"
              author="Yuval N. Harari"
              subtitle="History of Humankind"
              emblem="sapiens"
              onClick={() => handleBookClick("Sapiens")}
            />

            {/* Book 4: Foundation (Deep Imperial Emerald) */}
            <BookModel
              position={[2.4, -0.2, 0.1]}
              rotation={[-0.08, -0.35, 0.08]}
              color="#064e3b"
              title="Foundation"
              author="Isaac Asimov"
              subtitle="Galactic Empire"
              emblem="foundation"
              onClick={() => handleBookClick("Foundation")}
            />
          </Float>
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
          rotateSpeed={0.5}
        />
      </Canvas>

      {/* Subtle overlay hint */}
      <div className="absolute bottom-3 right-4 text-[10px] text-muted-foreground/80 pointer-events-none">
        Interactive 3D Books • Click to inspect
      </div>
    </div>
  );
}

export default HeroScene;
