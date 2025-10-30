
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CreatingAssistantPage() {
    const router = useRouter();
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Simulate bot creation progress
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    // Add a short delay before redirecting
                    setTimeout(() => {
                        router.push('/dashboard/asistentes');
                    }, 500);
                    return 100;
                }
                return prev + 1;
            });
        }, 40); // Controls the speed of the animation

        return () => clearInterval(interval);
    }, [router]);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center w-full overflow-hidden bg-gray-900">
            {/* Animated Shapes Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute -top-1/2 -left-1/2 w-96 h-96 bg-primary/30 rounded-full filter blur-3xl opacity-50 animate-shape1"></div>
                <div className="absolute -bottom-1/2 -right-1/4 w-96 h-96 bg-accent/30 rounded-full filter blur-3xl opacity-50 animate-shape2"></div>
                <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-fuchsia-500/20 rounded-full filter blur-2xl opacity-40 animate-shape3"></div>
                <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-500/20 rounded-lg filter blur-2xl opacity-40 animate-shape4"></div>
                 <div className="absolute inset-0 bg-black/30"></div>
            </div>

            {/* Content */}
            <motion.div
                className="relative z-10 flex flex-col items-center justify-center text-center text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Bot className="h-16 w-16 mb-4 animate-bounce" />
                <h1 className="text-3xl font-bold font-headline mb-2 flex items-center gap-3">
                    Generando Bot
                    <Sparkles className="h-7 w-7 animate-ping" />
                </h1>
                <p className="text-lg text-white/80">
                    Estamos configurando tu nuevo asistente. ¡Espera un momento!
                </p>
                <div className="w-48 h-2 bg-white/20 rounded-full mt-8 overflow-hidden">
                     <div
                        className="h-full bg-white rounded-full animated-gradient"
                        style={{
                            width: `${progress}%`,
                            transition: 'width 0.1s linear',
                        }}
                    ></div>
                </div>
            </motion.div>
        </div>
    );
}
