"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

interface ScanAnimationProps {
  message: string;
}

const ScanAnimation = ({ message }: ScanAnimationProps) => {
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, scale: 0.98 },
        { opacity: 1, scale: 1, duration: 1, ease: "power3.out" }
      );

      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 1;
        });
      }, 30);

      return () => clearInterval(interval);
    }
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 flex items-center justify-center bg-background/95 backdrop-blur-md z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="relative w-full max-w-4xl mx-auto px-6">
        <div className="relative min-h-[500px] rounded-[48px] overflow-hidden bg-gradient-to-b from-background via-background/95 to-background border border-primary/10 shadow-2xl">
          {/* Efectos de fondo */}
          <div className="absolute inset-0">
            <motion.div
              className="absolute inset-0 opacity-30"
              animate={{
                background: [
                  "radial-gradient(circle at 30% 30%, rgba(var(--primary-rgb), 0.15) 0%, transparent 70%)",
                  "radial-gradient(circle at 70% 70%, rgba(var(--primary-rgb), 0.15) 0%, transparent 70%)",
                  "radial-gradient(circle at 30% 30%, rgba(var(--primary-rgb), 0.15) 0%, transparent 70%)"
                ]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(var(--primary-rgb),0.05),transparent_50%)] animate-pulse-slow" />
          </div>

          {/* Área de animación principal */}
          <div className="relative flex flex-col items-center justify-center min-h-[500px] p-8">
            {/* Contenedor del escáner y código */}
            <div className="relative w-[600px] h-[300px] perspective-3000">
              {/* Marco decorativo */}
              <motion.div
                className="absolute -inset-4 border border-primary/20 rounded-[32px]"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(var(--primary-rgb), 0.1)",
                    "0 0 40px rgba(var(--primary-rgb), 0.2)",
                    "0 0 20px rgba(var(--primary-rgb), 0.1)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Código de barras */}
              <div className="relative w-96 h-48 mx-auto bg-white/95 rounded-2xl shadow-2xl flex flex-col items-center justify-center p-8 transform-gpu preserve-3d hover:scale-[1.02] transition-transform duration-500">
                {/* Efecto de brillo */}
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  animate={{
                    background: [
                      "linear-gradient(45deg, transparent 0%, rgba(var(--primary-rgb), 0.1) 45%, rgba(var(--primary-rgb), 0.1) 55%, transparent 100%)"
                    ],
                    backgroundSize: "200% 200%",
                    backgroundPosition: ["-200% -200%", "200% 200%"]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />

                {/* Líneas del código de barras */}
                <div className="relative w-full h-24 flex items-center justify-between space-x-0.5">
                  {[...Array(32)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="h-full bg-black"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{
                        duration: 0.5,
                        delay: i * 0.02,
                        ease: "easeOut"
                      }}
                      style={{ 
                        width: Math.random() * 3 + 1 + 'px',
                        opacity: Math.random() * 0.5 + 0.5
                      }}
                    />
                  ))}
                </div>

                {/* Número de tracking */}
                <motion.div
                  className="mt-6 text-base text-gray-800 font-mono tracking-[0.2em] font-medium"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  WX{Math.random().toString(36).substring(2, 10).toUpperCase()}
                </motion.div>
              </div>

              {/* Escáner */}
              <motion.div
                className="absolute -right-32 top-1/2 -translate-y-1/2 w-56 h-64"
                initial={{ x: 100, opacity: 0 }}
                animate={{ 
                  x: [-150, 150],
                  opacity: 1
                }}
                transition={{
                  x: {
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                  },
                  opacity: {
                    duration: 0.5
                  }
                }}
              >
                {/* Base del escáner */}
                <div className="absolute top-0 right-0 w-24 h-56 bg-background/95 rounded-2xl border border-primary/20 shadow-lg backdrop-blur-sm">
                  {/* Detalles del escáner */}
                  <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-primary/20" />
                  <motion.div
                    className="absolute top-4 right-12 w-3 h-3 rounded-full bg-red-500/60"
                    animate={{
                      opacity: [0.4, 1, 0.4],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>

                {/* Rayo del escáner */}
                <motion.div
                  className="absolute top-1/2 right-24 w-48 h-0.5"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(var(--primary-rgb), 0.8), transparent)'
                  }}
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    boxShadow: [
                      "0 0 10px rgba(var(--primary-rgb), 0.3)",
                      "0 0 20px rgba(var(--primary-rgb), 0.6)",
                      "0 0 10px rgba(var(--primary-rgb), 0.3)"
                    ]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            </div>

            {/* Barra de progreso y texto */}
            <div className="absolute bottom-16 left-0 right-0">
              <div className="flex flex-col items-center space-y-8">
                {/* Barra de progreso */}
                <div className="w-80">
                  <div className="relative h-1 bg-primary/5 rounded-full overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-primary/30 rounded-full"
                      style={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                    {/* Efecto de brillo en la barra */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent"
                      animate={{
                        x: ['-100%', '100%']
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <motion.span
                      className="text-sm font-medium text-primary/60"
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      {progress}%
                    </motion.span>
                  </div>
                </div>

                {/* Texto dinámico */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={message}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="text-center space-y-2"
                  >
                    <motion.p
                      className="text-xl font-light tracking-wider text-primary/80"
                      animate={{
                        textShadow: [
                          "0 0 8px rgba(var(--primary-rgb), 0.3)",
                          "0 0 16px rgba(var(--primary-rgb), 0.6)",
                          "0 0 8px rgba(var(--primary-rgb), 0.3)"
                        ]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      {message}
                    </motion.p>
                    <motion.div
                      className="flex items-center justify-center gap-1 text-primary/40"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      {[...Array(3)].map((_, i) => (
                        <motion.span
                          key={i}
                          className="w-1 h-1 rounded-full bg-current"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2
                          }}
                        />
                      ))}
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ScanAnimation; 
