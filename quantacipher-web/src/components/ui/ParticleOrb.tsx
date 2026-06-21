"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

export function ParticleOrb() {
  const particles = useMemo(() => {
    const pts = [];
    const numParticles = 400; // High density for a cool effect
    const radius = 180; // Large ball
    
    // Fibonacci sphere distribution for even spread
    const phi = Math.PI * (3 - Math.sqrt(5)); 
    
    for (let i = 0; i < numParticles; i++) {
      const y = 1 - (i / (numParticles - 1)) * 2; 
      const r = Math.sqrt(1 - y * y); 
      const theta = phi * i; 
      
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      
      // Randomize size slightly for depth perception
      const size = Math.random() * 2 + 1;
      
      pts.push({
        x: x * radius,
        y: y * radius,
        z: z * radius,
        size
      });
    }
    return pts;
  }, []);

  return (
    <div className="relative w-[500px] h-[500px] flex items-center justify-center scale-75 lg:scale-100" style={{ perspective: "1000px" }}>
      {/* Intense Core Glows */}
      <div className="absolute inset-0 m-auto w-[200px] h-[200px] bg-[#C4ED5F] opacity-[0.15] blur-[100px] rounded-full" />
      <div className="absolute inset-0 m-auto w-[350px] h-[350px] bg-white opacity-[0.05] blur-[120px] rounded-full" />
      
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: 360, rotateX: 360, rotateZ: 180 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        {/* Render particles */}
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 rounded-full"
            style={{
              width: p.size,
              height: p.size,
              // Make 10% of them white/brighter, the rest the lime green accent
              backgroundColor: i % 10 === 0 ? "#ffffff" : "#C4ED5F",
              boxShadow: i % 10 === 0 ? "0 0 15px #ffffff" : "0 0 10px #C4ED5F",
              // Translate in 3D space
              transform: `translate3d(-50%, -50%, 0) translate3d(${p.x}px, ${p.y}px, ${p.z}px)`,
              // Subtle opacity variation
              opacity: Math.random() * 0.5 + 0.5
            }}
          />
        ))}

        {/* Orbiting Rings for extra sci-fi feel */}
        <motion.div 
            className="absolute top-1/2 left-1/2 w-[420px] h-[420px] rounded-full border border-[#C4ED5F]/20"
            style={{ transform: "translate3d(-50%, -50%, 0) rotateX(75deg)" }}
        />
        <motion.div 
            className="absolute top-1/2 left-1/2 w-[480px] h-[480px] rounded-full border border-white/10"
            style={{ transform: "translate3d(-50%, -50%, 0) rotateY(75deg)" }}
        />
      </motion.div>
    </div>
  );
}
