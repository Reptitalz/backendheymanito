
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Sparkles, Check, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WaterAnimation } from '@/components/layout/WaterAnimation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default function CreatingAssistantPage() {
    const router = useRouter();
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [displayText, setDisplayText] = useState("Inicializando...");
    const progressIntervalRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        const statuses = [
            { p: 0, text: "Inicializando motor IA..." },
            { p: 25, text: "Configurando personalidad del bot..." },
            { p: 50, text: "Asignando habilidades..." },
            { p: 75, text: "Realizando pruebas finales..." },
            { p: 100, text: "¡Listo para la acción!" },
        ];

        progressIntervalRef.current = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev + 0.5;
                if (newProgress >= 100) {
                    if (progressIntervalRef.current) {
                        clearInterval(progressIntervalRef.current);
                    }
                    setDisplayText("¡Listo para la acción!");
                    // Wait a moment before showing completion to let the 100% register
                    setTimeout(() => {
                        setIsComplete(true);
                    }, 500);
                    return 100;
                }

                const currentStatus = statuses.find((s, i) => {
                    const nextStatus = statuses[i + 1];
                    return newProgress >= s.p && (!nextStatus || newProgress < nextStatus.p);
                });
                if (currentStatus) {
                    setDisplayText(currentStatus.text);
                }

                return newProgress;
            });
        }, 50);

        return () => {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
        }
    }, [router]);

    return (
        <>
            <div className="absolute inset-0 z-0 w-full h-full bg-gray-900">
              <WaterAnimation progress={progress} />
            </div>
            
            <AnimatePresence>
              {!isComplete && (
                <motion.div
                    className="relative z-10 flex flex-col items-center"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                >
                    <Bot className="h-16 w-16 mb-4 animate-bounce" />
                    <h1 className="text-2xl font-bold font-headline mb-2 flex items-center gap-3">
                        Generando Bot
                        <Sparkles className="h-6 w-6 animate-ping" />
                    </h1>
                    <p className="text-base text-white/80 transition-opacity duration-300">
                        {displayText}
                    </p>
                    <div className="w-48 h-2 bg-white/20 rounded-full mt-8 overflow-hidden">
                         <div
                            className="h-full bg-white rounded-full"
                            style={{
                                width: `${progress}%`,
                                transition: 'width 0.1s linear',
                            }}
                        ></div>
                    </div>
                     <p className="text-2xl font-bold mt-4 font-mono">{Math.round(progress)}%</p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
                {isComplete && (
                     <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
                        >
                            <Card className="w-full max-w-sm m-4 text-center">
                                <CardContent className="p-6">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 12 }}
                                        className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4"
                                    >
                                        <Check className="h-10 w-10 text-green-600" />
                                    </motion.div>
                                    <h2 className="text-lg font-bold font-headline mb-2">¡Asistente Creado!</h2>
                                    <p className="text-muted-foreground text-xs mb-6">
                                        Tu nuevo asistente está en la bandeja. El siguiente paso es conectarlo a WhatsApp escaneando el código QR.
                                    </p>
                                    <Button asChild size="lg" className="w-full">
                                        <Link href="/dashboard/asistentes">
                                            Ir a Mis Asistentes <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
