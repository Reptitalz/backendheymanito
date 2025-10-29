

'use client';

import { useState, useEffect } from 'react';
import { Bot, MessageSquare, Mic, AudioLines, BrainCircuit, Check, X, FileText, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from '@/components/ui/input';

type ProcessStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
type ProcessStep = {
    id: number;
    name: string;
    status: ProcessStatus;
    log: string;
    icon: React.ElementType;
};
type AssistantActivity = {
    assistantId: string;
    assistantName: string;
    userName: string;
    lastActivity: string;
    processes: ProcessStep[];
};

const initialAssistants: AssistantActivity[] = [
    { assistantId: "asst_1", assistantName: "Asistente de Ventas", userName: "Juan Pérez", lastActivity: "Ahora mismo", processes: [] },
    { assistantId: "asst_3", assistantName: "Recordatorios de Citas", userName: "Ana Martínez", lastActivity: "Hace 2 minutos", processes: [] },
    { assistantId: "asst_6", assistantName: "Gestor de Pedidos", userName: "Carlos Sánchez", lastActivity: "Hace 5 minutos", processes: [] },
];

const processTemplates: Omit<ProcessStep, 'id' | 'status' | 'log'>[] = [
    { name: "Mensaje de voz recibido", icon: Mic },
    { name: "Transcribiendo audio...", icon: AudioLines },
    { name: "Analizando texto...", icon: FileText },
    { name: "Generando respuesta IA...", icon: BrainCircuit },
    { name: "Enviando respuesta...", icon: MessageSquare },
];

// Component for the circular status indicator with icon
const StatusIcon = ({ status, icon: Icon }: { status: ProcessStatus, icon: React.ElementType }) => {
    const baseClasses = "flex items-center justify-center h-10 w-10 rounded-full text-white transition-all transform hover:scale-110";
    
    if (status === 'in_progress') {
        return (
            <div className={cn(baseClasses, "bg-blue-500 relative")}>
                <Icon className="h-5 w-5 z-10" />
                <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping"></div>
            </div>
        );
    }
    if (status === 'completed') {
        return (
            <div className={cn(baseClasses, "bg-green-500")}>
                <Icon className="h-5 w-5" />
                 <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-white flex items-center justify-center">
                    <Check className="h-3 w-3 text-green-600"/>
                </div>
            </div>
        );
    }
    if (status === 'failed') {
        return (
            <div className={cn(baseClasses, "bg-destructive")}>
                 <Icon className="h-5 w-5" />
                 <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-white flex items-center justify-center">
                    <X className="h-3 w-3 text-destructive"/>
                </div>
            </div>
        );
    }
    return (
        <div className={cn(baseClasses, "bg-gray-400")}>
            <Icon className="h-5 w-5" />
        </div>
    );
};

export default function MonitorPage() {
    const [activities, setActivities] = useState<AssistantActivity[]>(initialAssistants);
    const [searchTerm, setSearchTerm] = useState('');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const interval = setInterval(() => {
            setActivities(prevActivities => {
                const randomAssistantIndex = Math.floor(Math.random() * prevActivities.length);
                
                return prevActivities.map((activity, index) => {
                    if (index === randomAssistantIndex) {
                         const currentProcesses = [...activity.processes];

                        // If it's the start of a new chain or the last one completed/failed, reset and start over
                        if (currentProcesses.length === 0 || 
                            currentProcesses[currentProcesses.length - 1].status === 'completed' || 
                            currentProcesses[currentProcesses.length - 1].status === 'failed') {
                            
                            const newProcess: ProcessStep = {
                                ...processTemplates[0],
                                id: 0, // Reset id
                                status: 'in_progress',
                                log: "Recibiendo paquete de audio..."
                            };
                            return { ...activity, lastActivity: "Ahora mismo", processes: [newProcess] };
                        }
                        
                        // If there's a process in progress, advance it
                        const currentProcessIndex = currentProcesses.findIndex(p => p.status === 'in_progress');
                        if (currentProcessIndex !== -1) {
                             const shouldFail = Math.random() < 0.05; // 5% chance to fail

                             // Complete current step
                             currentProcesses[currentProcessIndex] = {
                                 ...currentProcesses[currentProcessIndex],
                                 status: 'completed',
                                 log: currentProcesses[currentProcessIndex].log + " -> ¡Completado!"
                             };

                             // Start next step if not the end
                             if (currentProcessIndex < processTemplates.length - 1) {
                                 const nextStepTemplate = processTemplates[currentProcessIndex + 1];
                                 currentProcesses.push({
                                     ...nextStepTemplate,
                                     id: currentProcesses.length,
                                     status: shouldFail ? 'failed' : 'in_progress',
                                     log: shouldFail ? 'Error: Fallo en la red' : `Iniciando ${nextStepTemplate.name.toLowerCase()}`
                                 });
                             }
                            
                             return { ...activity, processes: currentProcesses };
                        }
                    }
                    // Update last activity time for others
                    if (activity.lastActivity === "Ahora mismo") return {...activity, lastActivity: "Hace 1 minuto" };
                    return activity;
                });
            });
        }, 2500); // Update every 2.5 seconds

        return () => clearInterval(interval);
    }, []);
    
    const filteredActivities = activities.filter(activity =>
        activity.assistantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.userName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isClient) return null;

    return (
        <div className="flex flex-col h-full">
            <header className="flex items-center gap-4 mb-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline flex items-center gap-3">
                        <BrainCircuit className="h-8 w-8 text-primary" />
                        Monitor del Cerebro
                    </h1>
                    <p className="text-muted-foreground text-sm">Visualización en tiempo real de los procesos de la IA.</p>
                </div>
            </header>
            
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nombre de asistente o propietario..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto">
                <AnimatePresence>
                    {filteredActivities.map((activity) => (
                        <motion.div key={activity.assistantId} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <Bot className="h-5 w-5" /> {activity.assistantName}
                                            </CardTitle>
                                            <CardDescription>
                                                Propietario: {activity.userName} <Badge variant="secondary" className="ml-2">{activity.lastActivity}</Badge>
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-2">
                                    <div className="relative">
                                        {activity.processes.length > 0 ? (
                                            <>
                                                <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gray-200 -translate-y-1/2"></div>
                                                <div className="relative flex justify-between items-center">
                                                    <AnimatePresence>
                                                        {activity.processes.map((process) => (
                                                            <motion.div
                                                                key={process.id}
                                                                layout
                                                                initial={{ opacity: 0, scale: 0.5 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.5 }}
                                                                transition={{ duration: 0.3 }}
                                                            >
                                                                <Popover>
                                                                    <PopoverTrigger asChild>
                                                                        <button>
                                                                            <StatusIcon status={process.status} icon={process.icon} />
                                                                        </button>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className="w-80">
                                                                        <div className="grid gap-4">
                                                                            <div className="space-y-2">
                                                                                <h4 className="font-medium leading-none">{process.name}</h4>
                                                                                <p className="text-sm text-muted-foreground font-mono">
                                                                                    {process.log}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </PopoverContent>
                                                                </Popover>
                                                            </motion.div>
                                                        ))}
                                                    </AnimatePresence>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center text-muted-foreground py-8">
                                                <p>Esperando actividad...</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
