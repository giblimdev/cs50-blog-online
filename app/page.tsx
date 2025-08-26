// app/page.tsx

'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, Star, Code, BookOpen, Rocket } from "lucide-react";

export default function RootRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/public");
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <AnimatePresence>
        {/* Main logo container */}
        <motion.div
          key="main-container"
          initial={{ scale: 0.8, opacity: 0.7 }}
          animate={{ scale: 1.2, opacity: 1 }}
          exit={{ scale: 2.8, opacity: 0, transition: { duration: 0.4 } }}
          transition={{ type: "spring", stiffness: 120, damping: 20, duration: 0.8 }}
          className={cn("relative flex flex-col items-center z-10")}
        >
          {/* Central icon with explosive effect */}
          <motion.div
            key="central-icon"
            className="rounded-full bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 shadow-2xl w-32 h-32 flex items-center justify-center border-4 border-blue-300/30"
            initial={{ scale: 0.7, rotate: -20 }}
            animate={{ scale: 1.3, rotate: 10 }}
            exit={{ scale: 4.2, opacity: 0, rotate: 180, transition: { duration: 0.35 } }}
            transition={{ type: "spring", stiffness: 160, damping: 15, duration: 0.8 }}
          >
            <motion.span
              key="icon-span"
              initial={{ scale: 0.8, opacity: 0.9 }}
              animate={{ scale: 1.15, opacity: 1 }}
              exit={{ scale: 3, opacity: 0, transition: { duration: 0.3 } }}
              transition={{ delay: 0.1, duration: 0.7 }}
              className="text-white drop-shadow-2xl"
            >
              <Code className="w-16 h-16" />
            </motion.span>
          </motion.div>

          {/* Title with staggered animation */}
          <motion.h1
            key="title"
            className="mt-8 text-4xl md:text-5xl font-bold text-white drop-shadow-2xl tracking-tight"
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ y: -40, opacity: 0, scale: 1.1 }}
            transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
          >
            CS50 Blog
          </motion.h1>

          <motion.p
            key="subtitle"
            className="mt-4 text-lg md:text-xl text-blue-100/90 font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            Loading awesome content...
          </motion.p>

          {/* Loading indicator - Fixed: removed array values for spring animation */}
          <motion.div
            key="loading-indicator"
            className="mt-6 flex space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`loading-dot-${i}`}
                className="w-3 h-3 bg-blue-400 rounded-full"
                animate={{
                  scale: 1.3, // Fixed: single value instead of array
                  opacity: 1   // Fixed: single value instead of array
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  repeatType: "reverse", // Added: creates the pulsing effect
                  delay: i * 0.2,
                  ease: "easeInOut" // Changed from spring to ease for array-like behavior
                }}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* Explosive particle effects */}
        <ExplosionEffect key="explosion-effect" />
        
        {/* Background pulse effect - Fixed: removed array values */}
        <motion.div
          key="background-pulse"
          className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 4, opacity: 0.3 }} // Fixed: single values
          exit={{ scale: 6, opacity: 0 }}
          transition={{ 
            duration: 1.2, 
            repeat: Infinity, 
            repeatType: "reverse",
            repeatDelay: 0.5,
            ease: "easeInOut" // Changed from spring
          }}
        />
      </AnimatePresence>
    </div>
  );
}

// Fixed Explosive particle effect component
function ExplosionEffect() {
  const particles = [
    { id: 'particle-1', x: -150, y: -80, icon: <Sparkles className="text-yellow-400" />, delay: 0.15, size: "w-6 h-6" },
    { id: 'particle-2', x: 120, y: -120, icon: <Star className="text-indigo-300" />, delay: 0.22, size: "w-5 h-5" },
    { id: 'particle-3', x: -110, y: 100, icon: <Rocket className="text-blue-300" />, delay: 0.28, size: "w-6 h-6" },
    { id: 'particle-4', x: 140, y: 110, icon: <BookOpen className="text-cyan-400" />, delay: 0.33, size: "w-5 h-5" },
    { id: 'particle-5', x: 0, y: -160, icon: <Code className="text-white" />, delay: 0.18, size: "w-6 h-6" },
    { id: 'particle-6', x: 0, y: 140, icon: <Sparkles className="text-yellow-300" />, delay: 0.31, size: "w-5 h-5" },
    { id: 'particle-7', x: -130, y: -140, icon: <Zap className="text-purple-300" />, delay: 0.19, size: "w-6 h-6" },
    { id: 'particle-8', x: 160, y: -60, icon: <Star className="text-pink-300" />, delay: 0.25, size: "w-4 h-4" },
    { id: 'particle-9', x: -160, y: 60, icon: <Sparkles className="text-green-300" />, delay: 0.35, size: "w-5 h-5" },
    { id: 'particle-10', x: -80, y: -180, icon: <Rocket className="text-orange-300" />, delay: 0.17, size: "w-5 h-5" },
    { id: 'particle-11', x: 80, y: 160, icon: <Code className="text-teal-300" />, delay: 0.29, size: "w-6 h-6" }
  ];

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ 
            x: 0, 
            y: 0, 
            scale: 0.3, 
            opacity: 0, 
            rotate: 0 
          }}
          animate={{ 
            x: particle.x, 
            y: particle.y, 
            scale: 1.4, 
            opacity: 1,  
            rotate: 360  
          }}
          exit={{ 
            scale: 2.5, 
            opacity: 0, 
            rotate: 720,
            transition: { duration: 0.4 } 
          }}
          transition={{ 
            delay: particle.delay, 
            duration: 1.2, 
            type: "spring", 
            stiffness: 100,
            damping: 12
          }}
          className="absolute left-1/2 top-1/2 z-0"
          style={{ marginLeft: -12, marginTop: -12 }}
        >
          <span className={cn("filter drop-shadow-2xl", particle.size)}>
            {particle.icon}
          </span>
        </motion.div>
      ))}

      {Array.from({ length: 8 }, (_, i) => (
        <motion.div
          key={`sparkle-trail-${i}`}
          className="absolute left-1/2 top-1/2 w-2 h-2 bg-white rounded-full"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            x: Math.cos(i * 45 * Math.PI / 180) * 200,
            y: Math.sin(i * 45 * Math.PI / 180) * 200,
            scale: 1.5, 
            opacity: 0.8 
          }}
          transition={{
            delay: 0.1 + i * 0.05,
            duration: 1.5,
            ease: "easeOut" 
          }}
        />
      ))}
    </div>
  );
}
