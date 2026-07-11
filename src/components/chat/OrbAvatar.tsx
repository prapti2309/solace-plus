"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEmotionTheme } from "@/contexts/ThemeContext";

interface OrbAvatarProps {
  status: "idle" | "listening" | "reflecting" | "understanding" | "thinking" | "speaking";
  size?: "sm" | "md" | "lg";
}

export const OrbAvatar: React.FC<OrbAvatarProps> = ({ status, size = "md" }) => {
  const { reducedMotion } = useEmotionTheme();

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-32 h-32",
    lg: "w-48 h-48",
  };

  const ringSizes = {
    sm: "w-20 h-20",
    md: "w-40 h-40",
    lg: "w-60 h-60",
  };

  // Determine animations based on status
  const getOrbAnimation = () => {
    if (reducedMotion) return {};

    switch (status) {
      case "listening":
        return {
          scale: [1, 1.08, 1],
          boxShadow: [
            "0 0 30px 10px rgba(var(--mood-accent-rgb), 0.3)",
            "0 0 50px 20px rgba(var(--mood-accent-rgb), 0.5)",
            "0 0 30px 10px rgba(var(--mood-accent-rgb), 0.3)",
          ],
          transition: {
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut" as const,
          },
        };
      case "reflecting":
      case "understanding":
      case "thinking":
        return {
          scale: [1, 0.95, 1.02, 1],
          rotate: [0, 180, 360],
          boxShadow: [
            "0 0 30px 15px rgba(var(--mood-accent-rgb), 0.3)",
            "0 0 45px 25px rgba(var(--mood-glow), 0.4)",
            "0 0 30px 15px rgba(var(--mood-accent-rgb), 0.3)",
          ],
          transition: {
            duration: 3,
            repeat: Infinity,
            ease: "linear" as const,
          },
        };
      case "speaking":
        return {
          scale: [1, 1.15, 0.98, 1.12, 1],
          boxShadow: [
            "0 0 40px 15px rgba(var(--mood-accent-rgb), 0.4)",
            "0 0 70px 30px rgba(var(--mood-glow), 0.6)",
            "0 0 40px 15px rgba(var(--mood-accent-rgb), 0.4)",
          ],
          transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut" as const,
          },
        };
      case "idle":
      default:
        return {
          y: [0, -6, 0],
          scale: [1, 1.03, 1],
          boxShadow: [
            "0 0 25px 5px rgba(var(--mood-accent-rgb), 0.2)",
            "0 0 35px 12px rgba(var(--mood-accent-rgb), 0.35)",
            "0 0 25px 5px rgba(var(--mood-accent-rgb), 0.2)",
          ],
          transition: {
            y: { duration: 5, repeat: Infinity, ease: "easeInOut" as const },
            scale: { duration: 6, repeat: Infinity, ease: "easeInOut" as const },
            boxShadow: { duration: 6, repeat: Infinity, ease: "easeInOut" as const },
          },
        };
    }
  };


  return (
    <div className="relative flex items-center justify-center">
      {/* Outer soundwave ripple rings when speaking or listening */}
      <AnimatePresence>
        {(status === "speaking" || status === "listening") && !reducedMotion && (
          <>
            <motion.div
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 1.8, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" as const }}
              className={`absolute rounded-full pointer-events-none border border-mood-accent/30 ${ringSizes[size]}`}
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0.4 }}
              animate={{ scale: 2.2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.5, delay: 0.6, repeat: Infinity, ease: "easeOut" as const }}
              className={`absolute rounded-full pointer-events-none border border-mood-glow/20 ${ringSizes[size]}`}
            />
          </>
        )}
      </AnimatePresence>

      {/* Orbiting particles for thinking/reflecting */}
      {["reflecting", "understanding", "thinking"].includes(status) && !reducedMotion && (
        <div className={`absolute ${ringSizes[size]} animate-spin-slow pointer-events-none`}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-mood-accent shadow-[0_0_8px_var(--mood-accent)]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-mood-glow shadow-[0_0_10px_var(--mood-glow)]" />
        </div>
      )}

      {/* Main Orb Body */}
      <motion.div
        animate={getOrbAnimation()}
        className={`relative rounded-full glass-panel flex items-center justify-center overflow-hidden transition-all duration-[2500ms] cursor-pointer ${sizeClasses[size]}`}
        style={{
          background: "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(0, 0, 0, 0.4) 100%)",
          border: "1.5px solid rgba(255, 255, 255, 0.15)",
        }}
      >
        {/* Internal Glowing Core */}
        <div 
          className="absolute inset-2 rounded-full opacity-70 filter blur-md transition-all duration-[2500ms] ease-out"
          style={{
            background: "radial-gradient(circle at 45% 45%, var(--mood-accent) 0%, var(--mood-glow) 60%, transparent 100%)"
          }}
        />

        {/* Highlight sheen layer (simulating 3D glass sphere) */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 45%, rgba(0, 0, 0, 0.2) 80%, rgba(255, 255, 255, 0.05) 100%)"
          }}
        />
        
        {/* Soft floating internal blob */}
        {!reducedMotion && (
          <motion.div
            animate={{
              x: [0, 8, -6, 0],
              y: [0, -8, 5, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut" as const
            }}
            className="absolute inset-6 rounded-full opacity-40 mix-blend-overlay filter blur-sm"
            style={{
              background: "radial-gradient(circle, #ffffff 0%, transparent 60%)"
            }}
          />
        )}
      </motion.div>
    </div>
  );
};
