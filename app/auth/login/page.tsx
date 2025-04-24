"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthService } from "@/app/services/auth.service";
import { toast } from "sonner";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ROUTES } from "@/app/config";

// Variantes de animación
const logoVariants = {
  hidden: { 
    scale: 0.8, 
    opacity: 0, 
    rotateY: -180,
    filter: 'blur(10px)'
  },
  visible: {
    scale: 1,
    opacity: 1,
    rotateY: 0,
    filter: 'blur(0px)',
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
      duration: 1
    }
  }
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación de contraseña
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      // Limpiar cualquier dato de autenticación previo
      AuthService.clearAuth();
      
      console.log('🔐 Intentando iniciar sesión...');
      
      // Realizar el login
      const response = await AuthService.login(email, password);
      
      console.log('✅ Login exitoso, token recibido');
      
      // Guardar el token en localStorage
      AuthService.setToken(response.token);
      
      // Mostrar mensaje de éxito
      toast.success(`¡Bienvenido(a) ${response.operator.firstName || 'Usuario'}!`);
      
      // Mostrar animación antes de redirigir
      setShowSuccessAnimation(true);
      
      // Esperar un momento antes de redirigir
      setTimeout(() => {
        console.log('🔄 Redirigiendo al dashboard...');
        // Usar window.location para forzar una recarga completa
        window.location.href = ROUTES.DASHBOARD;
      }, 2000);
      
    } catch (error) {
      console.error("❌ Error de login:", error);
      
      // Mostrar mensaje de error
      toast.error(error instanceof Error ? error.message : "Credenciales incorrectas");
      
      // Limpiar cualquier dato de autenticación parcial
      AuthService.clearAuth();
      
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 via-red-500 to-red-400 p-4 overflow-hidden">
      <AnimatePresence mode="wait">
        {showSuccessAnimation ? (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          >
            {/* Fondo premium con efecto de cristal */}
            <motion.div 
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                background: 'radial-gradient(circle at center, rgba(220, 38, 38, 0.1) 0%, rgba(220, 38, 38, 0.3) 50%, rgba(220, 38, 38, 0.1) 100%)',
                backdropFilter: 'blur(30px)',
              }}
            >
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, rgba(254, 202, 202, 0.1) 0%, transparent 60%)',
                }}
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>

            <motion.div
              className="relative z-10 flex flex-col items-center justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                variants={logoVariants}
                className="relative bg-gradient-to-br from-white/10 to-transparent backdrop-blur-2xl rounded-full p-16 shadow-2xl"
                style={{
                  boxShadow: `
                    0 0 100px rgba(220, 38, 38, 0.3),
                    inset 0 0 50px rgba(254, 202, 202, 0.2),
                    0 0 20px rgba(255, 255, 255, 0.2)
                  `,
                  background: 'radial-gradient(circle at center, rgba(255,255,255,0.1), rgba(255,255,255,0.05))'
                }}
              >
                {/* Efectos de brillo premium */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'radial-gradient(circle at 50% 50%, rgba(220, 38, 38, 0.5), transparent 70%)',
                    filter: 'blur(30px)',
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Logo con animación 3D premium */}
                <motion.div
                  className="relative w-56 h-56"
                  animate={{
                    rotateY: [0, 10, 0, -10, 0],
                    rotateX: [0, 5, 0, -5, 0],
                    rotateZ: [0, 2, 0, -2, 0],
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: [0.76, 0, 0.24, 1]
                  }}
                  style={{
                    transformStyle: 'preserve-3d',
                    perspective: '1000px'
                  }}
                >
                  <Image
                    src="/LOGO-WORKEXPRESS.png"
                    alt="WorkExpress Logo"
                    fill
                    className="object-contain"
                    style={{
                      filter: 'drop-shadow(0 0 30px rgba(220, 38, 38, 0.5))'
                    }}
                    priority
                  />
                </motion.div>
              </motion.div>

              {/* Texto de bienvenida premium */}
              <motion.div
                className="text-center mt-16 relative z-20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.h2 
                  className="text-6xl font-bold mb-6"
                  style={{
                    background: 'linear-gradient(to right, #ffffff, #fecaca)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 30px rgba(255,255,255,0.3)'
                  }}
                  animate={{ 
                    textShadow: [
                      "0 0 30px rgba(255,255,255,0.3)",
                      "0 0 50px rgba(255,255,255,0.5)",
                      "0 0 30px rgba(255,255,255,0.3)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ¡Bienvenido a WorkExpress!
                </motion.h2>
                <motion.div 
                  className="flex items-center justify-center space-x-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="relative"
                    >
                      <motion.span 
                        className="absolute inset-0 bg-white rounded-full"
                        animate={{ 
                          scale: [1, 2, 1],
                          opacity: [0.5, 0, 0.5]
                        }}
                        transition={{ 
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.3
                        }}
                      />
                      <motion.span 
                        className="relative h-3 w-3 bg-white rounded-full block"
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.8, 1, 0.8]
                        }}
                        transition={{ 
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.3
                        }}
                      />
                    </motion.div>
                  ))}
                  <motion.p 
                    className="text-2xl text-white font-medium ml-3"
                    animate={{ opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      textShadow: '0 0 20px rgba(255,255,255,0.3)'
                    }}
                  >
                    Preparando tu espacio de trabajo
                  </motion.p>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-[900px] min-h-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden flex"
          >
            {/* Panel Izquierdo */}
            <div className="w-1/2 bg-red-600 p-12 flex flex-col justify-center items-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-full">
                <div className="absolute top-0 right-0 w-full h-64 bg-red-400 opacity-20 rounded-bl-full transform translate-x-1/3 -translate-y-1/4"></div>
                <div className="absolute bottom-0 left-0 w-full h-64 bg-red-300 opacity-20 rounded-tr-full transform -translate-x-1/3 translate-y-1/4"></div>
              </div>
              <div className="relative z-10 text-center flex flex-col items-center justify-center w-full">
                <div className="mb-12">
                  <div className="w-40 h-40 flex items-center justify-center mx-auto mb-8 relative">
                    <Image
                      src="/LOGO-WORKEXPRESS.png"
                      alt="WorkExpress Logo"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-2xl font-medium tracking-wide text-red-100">Portal de Operadores</h2>
                    <h1 className="text-5xl font-bold tracking-tight mb-6 text-white">WorkExpress</h1>
                  </div>
                </div>
                <p className="text-red-100 max-w-[280px] mx-auto text-sm leading-relaxed">
                  Acceso exclusivo para operadores autorizados del sistema de gestión
                </p>
              </div>
            </div>

            {/* Panel Derecho - Formulario */}
            <div className="w-1/2 p-12 flex items-center">
              <div className="max-w-md mx-auto w-full">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Acceso al Sistema</h2>
                  <p className="text-gray-500 text-sm">Ingresa tus credenciales de operador</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Correo Corporativo
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="operador@workexpress.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Contraseña
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      disabled={isLoading}
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Link
                      href="/forgot-password"
                      className="text-sm font-medium text-red-600 hover:text-red-500 transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl transition-colors text-base font-semibold shadow-lg hover:shadow-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? "Verificando..." : "Iniciar Sesión"}
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 