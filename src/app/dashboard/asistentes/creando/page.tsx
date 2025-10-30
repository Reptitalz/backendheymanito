
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CreatingAssistantPage() {
    const router = useRouter();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [progress, setProgress] = useState(0);
    const [displayText, setDisplayText] = useState("Inicializando...");

    // Animation settings
    const waveAmplitude = 10;
    const waveFrequency = 0.01;
    const waveSpeed = 0.05;

    useEffect(() => {
        const statuses = [
            { p: 0, text: "Inicializando motor IA..." },
            { p: 25, text: "Configurando personalidad del bot..." },
            { p: 50, text: "Asignando habilidades..." },
            { p: 75, text: "Realizando pruebas finales..." },
            { p: 100, text: "¡Listo para la acción!" },
        ];

        const progressInterval = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev + 0.5;
                if (newProgress >= 100) {
                    clearInterval(progressInterval);
                    setTimeout(() => {
                        router.push('/dashboard/asistentes');
                    }, 1000);
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
        }, 50); // Adjust speed of progress

        return () => clearInterval(progressInterval);
    }, [router]);


    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let waveOffset = 0;
        let animationFrameId: number;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const draw = () => {
            if (!canvasRef.current) return;
            const computedStyle = getComputedStyle(document.documentElement);
            const primaryColor = computedStyle.getPropertyValue('--primary').trim();
            const accentColor = computedStyle.getPropertyValue('--accent').trim();

            const CW = canvas.width;
            const CH = canvas.height;

            // 1. Clear the Canvas
            ctx.clearRect(0, 0, CW, CH);

            // 2. Draw the Water
            const waterHeight = CH * (progress / 100);
            const waterY = CH - waterHeight;

            // Create a gradient for the water
            const gradient = ctx.createLinearGradient(0, waterY, 0, CH);
            gradient.addColorStop(0, `hsla(${primaryColor.split(' ').join(', ')}, 0.8)`);
            gradient.addColorStop(0.5, `hsla(${accentColor.split(' ').join(', ')}, 0.6)`);
            gradient.addColorStop(1, `hsla(${primaryColor.split(' ').join(', ')}, 0.8)`);
            
            ctx.beginPath();
            ctx.moveTo(0, CH);
            ctx.lineTo(0, waterY);

            for (let x = 0; x <= CW; x += 1) {
                const y = waterY + waveAmplitude * Math.sin(x * waveFrequency + waveOffset);
                ctx.lineTo(x, y);
            }

            ctx.lineTo(CW, CH);
            ctx.closePath();
            
            ctx.fillStyle = gradient;
            ctx.fill();

            // Draw a second, slightly offset wave for depth
            ctx.beginPath();
             ctx.moveTo(0, CH);
            ctx.lineTo(0, waterY);
            for (let x = 0; x <= CW; x += 1) {
                const y = waterY + (waveAmplitude * 1.2) * Math.sin(x * (waveFrequency * 0.8) + waveOffset + 2);
                ctx.lineTo(x, y);
            }
            ctx.lineTo(CW, CH);
            ctx.closePath();
            
            ctx.fillStyle = `hsla(${primaryColor.split(' ').join(', ')}, 0.3)`;
            ctx.fill();

            waveOffset += waveSpeed;
            animationFrameId = requestAnimationFrame(draw);
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        draw();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [progress]);

    return (
        <>
            <canvas ref={canvasRef} className="fixed inset-0 z-0 w-full h-full bg-gray-900"></canvas>
            
            <motion.div
                className="relative z-10 flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
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
                        className="h-full bg-white rounded-full animated-gradient"
                        style={{
                            width: `${progress}%`,
                            transition: 'width 0.1s linear',
                        }}
                    ></div>
                </div>
                 <p className="text-2xl font-bold mt-4 font-mono">{Math.round(progress)}%</p>
            </motion.div>
        </>
    );
}
