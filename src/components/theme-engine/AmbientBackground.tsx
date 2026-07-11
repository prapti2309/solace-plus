"use client";

import React from "react";
import { motion } from "framer-motion";
import { useEmotionTheme } from "@/contexts/ThemeContext";

export const AmbientBackground: React.FC = () => {
  const { reducedMotion } = useEmotionTheme();

  const blob1Variants = {
    animate: {
      x: [0, 80, -40, 0],
      y: [0, -100, 60, 0],
      scale: [1, 1.2, 0.85, 1],
      transition: {
        duration: 35,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
    },
    static: {
      x: 0,
      y: 0,
      scale: 1,
    },
  };

  const blob2Variants = {
    animate: {
      x: [0, -100, 50, 0],
      y: [0, 80, -90, 0],
      scale: [1, 0.9, 1.15, 1],
      transition: {
        duration: 40,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
    },
    static: {
      x: 0,
      y: 0,
      scale: 1,
    },
  };

  const blob3Variants = {
    animate: {
      x: [0, 50, -80, 0],
      y: [0, -50, 70, 0],
      scale: [1, 1.1, 0.9, 1],
      transition: {
        duration: 30,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
    },
    static: {
      x: 0,
      y: 0,
      scale: 1,
    },
  };

  return (
    <div className="fixed inset-0 -z-50 h-full w-full overflow-hidden bg-mood-bg-start transition-colors duration-[2500ms] ease-out">
      {/* Background radial glow */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none transition-all duration-[2500ms]"
        style={{
          background: "radial-gradient(circle at 50% 50%, var(--mood-glow), transparent 60%)"
        }}
      />

      {/* Layered animating light blobs */}
      <div className="absolute inset-0 filter blur-[120px] pointer-events-none opacity-45">
        {/* Blob 1 - Accent primary */}
        <motion.div
          variants={blob1Variants}
          animate={reducedMotion ? "static" : "animate"}
          className="absolute -top-[10%] left-[10%] h-[500px] w-[500px] rounded-full mix-blend-screen transition-all duration-[2500ms]"
          style={{
            background: "radial-gradient(circle, var(--mood-accent) 0%, rgba(255,255,255,0) 70%)"
          }}
        />

        {/* Blob 2 - Glow color */}
        <motion.div
          variants={blob2Variants}
          animate={reducedMotion ? "static" : "animate"}
          className="absolute top-[40%] -right-[10%] h-[600px] w-[600px] rounded-full mix-blend-screen transition-all duration-[2500ms]"
          style={{
            background: "radial-gradient(circle, var(--mood-glow) 0%, rgba(255,255,255,0) 70%)"
          }}
        />

        {/* Blob 3 - Muted contrast */}
        <motion.div
          variants={blob3Variants}
          animate={reducedMotion ? "static" : "animate"}
          className="absolute -bottom-[20%] left-[20%] h-[550px] w-[550px] rounded-full mix-blend-screen transition-all duration-[2500ms]"
          style={{
            background: "radial-gradient(circle, var(--mood-accent) 0%, rgba(255,255,255,0) 70%)"
          }}
        />
      </div>

      {/* Noise/grain texture layer for premium tactile look */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
    </div>
  );
};
