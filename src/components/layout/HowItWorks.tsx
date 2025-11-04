
'use client';

import { motion } from 'framer-motion';
import { Wand2, QrCode, Rocket } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const steps = [
    {
        icon: <Wand2 className="w-10 h-10 text-primary" />,
        title: "1. Crea y Personaliza",
        description: "Define la personalidad y habilidades de tu bot. ¿Será un vendedor o un agente de soporte? ¡Tú decides!",
    },
    {
        icon: <QrCode className="w-10 h-10 text-primary" />,
        title: "2. Conecta con WhatsApp",
        description: "Escanea un simple código QR desde tu teléfono. En segundos, tu asistente estará vinculado y listo para la acción.",
    },
    {
        icon: <Rocket className="w-10 h-10 text-primary" />,
        title: "3. ¡Lanza y Monitorea!",
        description: "Activa tu bot y observa en tiempo real cómo interactúa con tus clientes. Ajusta y mejora su rendimiento sobre la marcha.",
    },
];

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.3,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 10
        }
    },
};

const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.2, delayChildren: 0.2 } },
};

const Shape = ({ className }: { className: string }) => (
    <div className={`absolute rounded-full filter blur-2xl -z-10 ${className}`}></div>
);

export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-20 md:py-32 bg-background relative overflow-hidden">
            <Shape className="w-64 h-64 bg-primary/20 top-20 left-10 animate-shape1" />
            <Shape className="w-72 h-72 bg-accent/20 bottom-10 right-20 animate-shape2" />
            <Shape className="w-48 h-48 bg-primary/10 top-1/2 left-1/3 animate-shape3" />
            <Shape className="w-56 h-56 bg-accent/10 bottom-1/4 right-1/2 animate-shape4" />

            <div className="container mx-auto px-4 relative z-10">
                <motion.div 
                    className="text-center max-w-3xl mx-auto mb-16"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.5 }}
                    variants={textVariants}
                >
                    <motion.h2 variants={textVariants} className="text-3xl md:text-4xl font-bold font-headline mb-4">
                        Tu Aventura IA en 3 simples pasos
                    </motion.h2>
                    <motion.p variants={textVariants} className="text-muted-foreground text-lg">
                        Lanzar tu propio asistente de WhatsApp nunca fue tan fácil.
                    </motion.p>
                </motion.div>
                
                <motion.div 
                    className="grid md:grid-cols-3 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            variants={cardVariants}
                        >
                            <Card className="text-center h-full shadow-lg hover:shadow-primary/20 transition-shadow duration-300 bg-card/80 backdrop-blur-sm border-border/50 overflow-hidden flex flex-col">
                                <CardHeader className="items-center">
                                    <motion.div 
                                      className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4 animate-float"
                                      style={{animationDelay: `${index * 0.3}s`}}
                                    >
                                        {step.icon}
                                    </motion.div>
                                    <CardTitle className="font-headline text-2xl">{step.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col">
                                    <p className="text-muted-foreground mb-4">{step.description}</p>
                                    <div className="flex-grow mt-4 h-32 bg-muted/50 rounded-lg flex items-center justify-center">
                                        <span className="text-xs text-muted-foreground italic">Canvas para animación</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
