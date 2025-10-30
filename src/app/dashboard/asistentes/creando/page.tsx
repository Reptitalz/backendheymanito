
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
        <div className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden bg-background">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 z-0">
                 <div
                    className="absolute bottom-0 left-0 right-0 animated-gradient"
                    style={{
                        height: `${progress}%`,
                        transition: 'height 0.1s linear',
                    }}
                ></div>
            </div>

            {/* Content */}
            <motion.div
                className="relative z-10 flex flex-col items-center justify-center text-center text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Bot className="h-16 w-16 mb-4 animate-bounce" />
                <h1 className="text-4xl font-bold font-headline mb-2 flex items-center gap-3">
                    Generando Bot
                    <Sparkles className="h-8 w-8 animate-ping" />
                </h1>
                <p className="text-lg text-white/80">
                    Estamos configurando tu nuevo asistente. ¡Espera un momento!
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
            </motion.div>
        </div>
    );
}

