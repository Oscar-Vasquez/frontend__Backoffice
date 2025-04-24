"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { applyActionCode, getAuth } from 'firebase/auth';
import app from '../firebase/config';
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";

// Componente Fallback para Suspense
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-16 w-16 text-[#dc1431] animate-spin" />
    </div>
  );
}

// Mover la lógica principal a un componente hijo
function VerifyEmailContent() {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const searchParams = useSearchParams();
  const verificationAttempted = useRef(false);
  
  useEffect(() => {
    const verifyEmail = async () => {
      try {
        if (verificationAttempted.current) {
          console.log('🔄 Verificación ya intentada, omitiendo...');
          return;
        }
        verificationAttempted.current = true;

        const mode = searchParams.get('mode');
        const oobCode = searchParams.get('oobCode');
        
        console.log('🔍 Iniciando verificación de email con parámetros:', {
          mode,
          oobCode,
          allParams: Object.fromEntries(searchParams.entries())
        });

        if (!oobCode) {
          console.error('❌ No se encontró el código de verificación');
          setVerificationStatus('error');
          setErrorMessage('No se encontró el código de verificación');
          return;
        }

        const auth = getAuth(app);
        
        console.log('🔄 Aplicando código de verificación...');
        await applyActionCode(auth, oobCode);
        
        console.log('✅ Email verificado exitosamente');
        setVerificationStatus('success');
      } catch (error: any) {
        console.error('❌ Error al verificar email:', error);
        console.error('Detalles del error:', {
          code: error.code,
          message: error.message,
          fullError: error
        });
        
        let errorMsg = 'Error al verificar el correo electrónico. Por favor, intenta nuevamente.';
        
        switch (error.code) {
          case 'auth/invalid-action-code':
            errorMsg = 'El enlace de verificación ha expirado o ya ha sido usado. Por favor, solicita un nuevo enlace de verificación.';
            break;
          case 'auth/network-request-failed':
            errorMsg = 'Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.';
            break;
          case 'auth/invalid-email':
            errorMsg = 'El correo electrónico no es válido.';
            break;
          case 'auth/user-disabled':
            errorMsg = 'Esta cuenta ha sido deshabilitada.';
            break;
          default:
            errorMsg = `Error al verificar el correo electrónico (${error.code}). Por favor, intenta nuevamente.`;
        }
        
        setVerificationStatus('error');
        setErrorMessage(errorMsg);
      }
    };

    if (searchParams.has('oobCode')) {
      verifyEmail();
    } else {
      setVerificationStatus('error');
      setErrorMessage('Enlace de verificación inválido o incompleto');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-red-50 via-white to-red-50">
      <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-white" />

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative min-h-screen flex flex-col items-center justify-center p-4"
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-full max-w-lg"
        >
          <Card className="relative overflow-hidden p-8 shadow-xl border border-gray-100 bg-white">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="relative text-center"
            >
              <motion.h1 
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.6, type: "spring" }}
                className="text-2xl font-bold text-[#dc1431] mb-8"
              >
                WorkExpress
              </motion.h1>

              <AnimatePresence mode="wait">
                {verificationStatus === 'loading' && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <motion.h2 
                      initial={{ y: 20 }}
                      animate={{ y: 0 }}
                      className="text-3xl font-bold text-[#dc1431]"
                    >
                      Verificando tu correo
                    </motion.h2>
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="flex justify-center my-8"
                    >
                      <Loader2 className="h-16 w-16 text-[#dc1431] animate-spin" />
                    </motion.div>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-gray-900 text-lg font-medium"
                    >
                      Estamos validando tu dirección de correo electrónico...
                    </motion.p>
                  </motion.div>
                )}

                {verificationStatus === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </motion.div>

                    <motion.h2 
                      initial={{ y: 20 }}
                      animate={{ y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-3xl font-bold text-green-600"
                    >
                      ¡Verificación exitosa!
                    </motion.h2>

                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="text-gray-900 text-lg font-medium px-6"
                    >
                      Tu correo ha sido verificado. Ahora puedes disfrutar de todos los beneficios de WorkExpress.
                    </motion.p>

                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      <Link href="/login" className="block">
                        <Button className="w-full bg-[#dc1431] hover:bg-[#dc1431]/90 text-white font-semibold py-6 rounded-xl transition-all duration-300">
                          <span className="flex items-center justify-center gap-2">
                            Iniciar sesión
                            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                          </span>
                        </Button>
                      </Link>
                    </motion.div>
                  </motion.div>
                )}

                {verificationStatus === 'error' && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center"
                    >
                      <XCircle className="w-12 h-12 text-[#dc1431]" />
                    </motion.div>

                    <motion.h2 
                      initial={{ y: 20 }}
                      animate={{ y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-3xl font-bold text-[#dc1431]"
                    >
                      Error de verificación
                    </motion.h2>

                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="text-gray-900 text-lg font-medium px-6"
                    >
                      {errorMessage}
                    </motion.p>

                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      <Link href="/login" className="block">
                        <Button className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-6 rounded-xl transition-all duration-300">
                          <span className="flex items-center justify-center gap-2">
                            Volver al inicio
                            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                          </span>
                        </Button>
                      </Link>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Componente principal que envuelve el contenido con Suspense
export default function VerifyEmailPage() {
  return (
    <React.Suspense fallback={<LoadingFallback />}>
      <VerifyEmailContent />
    </React.Suspense>
  );
} 