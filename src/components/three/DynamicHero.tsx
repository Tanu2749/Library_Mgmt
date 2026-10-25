"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { SceneFallback } from "./SceneFallback";
import { SceneBoundary } from "./SceneBoundary";

// Dynamic import with SSR disabled to isolate 3D bundle and avoid hydration mismatches
const LazyHeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => <SceneFallback />,
});

/**
 * Check if the browser environment supports WebGL.
 */
function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export function DynamicHero() {
  const [shouldRender3D, setShouldRender3D] = useState<boolean | null>(null);

  useEffect(() => {
    // 1. Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // 2. Check for small mobile screens (under 768px)
    const isMobileScreen = window.innerWidth < 768;

    // 3. Check for WebGL capability
    const webGLSupported = isWebGLAvailable();

    // If reduced motion, mobile, or no WebGL -> use fallback
    if (prefersReducedMotion || isMobileScreen || !webGLSupported) {
      setShouldRender3D(false);
    } else {
      setShouldRender3D(true);
    }
  }, []);

  // During SSR or initial mount render fallback
  if (shouldRender3D === null || shouldRender3D === false) {
    return <SceneFallback />;
  }

  return (
    <SceneBoundary>
      <LazyHeroScene />
    </SceneBoundary>
  );
}
