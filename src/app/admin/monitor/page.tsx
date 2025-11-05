

'use client';

import { useState, useEffect } from 'react';
import { Bot, MessageSquare, Mic, AudioLines, BrainCircuit, Check, X, FileText, Search, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from '@/components/ui/input';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collectionGroup, doc, getDoc, Query } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

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

// Firestore Assistant type
interface Assistant {
  id: string;
  name: string;
  userId: string;
}

const processTemplates: Omit<ProcessStep, 'id' | 'status' | 'log'>[] = [
    { name: "Mensaje de voz recibido", icon: Mic },
    { name: "Transcribiendo audio...", icon: AudioLines },
    { name: "Analizando texto...", icon: FileText },
    { name: "Generando respuesta IA...", icon: BrainCircuit },
    { name: "Enviando respuesta...", icon: MessageSquare },
];

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
    const [activities, setActivities] = useState<AssistantActivity[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isClient, setIsClient] = useState(false);
    
    const firestore = useFirestore();
    const { user } = useUser();

    const assistantsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        // Use collectionGroup to query all 'assistants' collections across all users
        return collectionGroup(firestore, 'assistants') as Query;
    }, [firestore, user]);

    const { data: allAssistants, isLoading: isAssistantsLoading } = useCollection<Assistant>(assistantsQuery);

    // Effect to transform Firestore data into UI data
    useEffect(() => {
        if (allAssistants && firestore) {
            const fetchUserNames = async () => {
                const activitiesPromises = allAssistants.map(async (assistant) => {
                    let userName = 'Usuario Desconocido';
                    try {
                        const userDocRef = doc(firestore, 'users', assistant.userId);
                        const userDoc = await getDoc(userDocRef);
                        if (userDoc.exists()) {
                            userName = userDoc.data().displayName || 'Sin Nombre';
                        }
                    } catch (error) {
                        console.error(`Error fetching user ${assistant.userId}:`, error);
                    }
                    
                    // Check if this assistant is already in the activities state to preserve its processes
                    const existingActivity = activities.find(a => a.assistantId === assistant.id);

                    return {
                        assistantId: assistant.id,
                        assistantName: assistant.name,
                        userName: userName,
                        lastActivity: existingActivity?.lastActivity || 'Inactivo',
                        processes: existingActivity?.processes || [],
                    };
                });
                const resolvedActivities = await Promise.all(activitiesPromises);
                setActivities(resolvedActivities);
            };
            fetchUserNames();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allAssistants, firestore]);


    useEffect(() => {
        setIsClient(true);
        if (activities.length === 0) return;

        const interval = setInterval(() => {
            setActivities(prevActivities => {
                if (prevActivities.length === 0) return prevActivities;
                const randomAssistantIndex = Math.floor(Math.random() * prevActivities.length);
                
                return prevActivities.map((activity, index) => {
                    if (index === randomAssistantIndex) {
                         const currentProcesses = [...activity.processes];

                        if (currentProcesses.length === 0 || 
                            currentProcesses[currentProcesses.length - 1].status === 'completed' || 
                            currentProcesses[currentProcesses.length - 1].status === 'failed') {
                            
                            const newProcess: ProcessStep = {
                                ...processTemplates[0],
                                id: Date.now(), // Use timestamp for unique ID
                                status: 'in_progress',
                                log: "Recibiendo paquete de audio..."
                            };
                            return { ...activity, lastActivity: "Ahora mismo", processes: [newProcess] };
                        }
                        
                        const currentProcessIndex = currentProcesses.findIndex(p => p.status === 'in_progress');
                        if (currentProcessIndex !== -1) {
                             const shouldFail = Math.random() < 0.05; 

                             currentProcesses[currentProcessIndex] = {
                                 ...currentProcesses[currentProcessIndex],
                                 status: 'completed',
                                 log: currentProcesses[currentProcessIndex].log + " -> ¡Completado!"
                             };

                             if (currentProcessIndex < processTemplates.length - 1) {
                                 const nextStepTemplate = processTemplates[currentProcessIndex + 1];
                                 currentProcesses.push({
                                     ...nextStepTemplate,
                                     id: Date.now(), // Unique ID
                                     status: shouldFail ? 'failed' : 'in_progress',
                                     log: shouldFail ? 'Error: Fallo en la red' : `Iniciando ${nextStepTemplate.name.toLowerCase()}`
                                 });
                             }
                            
                             return { ...activity, processes: currentProcesses };
                        }
                    }
                    if (activity.lastActivity === "Ahora mismo") return {...activity, lastActivity: "Hace 1 minuto" };
                    return activity;
                });
            });
        }, 2500); 

        return () => clearInterval(interval);
    }, [activities.length]); // Rerun interval logic only when the number of activities changes
    
    const filteredActivities = activities.filter(activity =>
        activity.assistantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.userName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isClient) return null;

    const renderLoadingState = () => (
         <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                           <div className="flex items-center gap-2">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-1">
                                    <Skeleton className="h-5 w-40" />
                                    <Skeleton className="h-4 w-60" />
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <div className="text-center text-muted-foreground py-8">
                            <Skeleton className="h-5 w-32 mx-auto" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );

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
                {isAssistantsLoading ? renderLoadingState() : (
                    <AnimatePresence>
                        {filteredActivities.length > 0 ? filteredActivities.map((activity) => (
                            <motion.div key={activity.assistantId} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <Card>
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-4">
                                                <Bot className="h-6 w-6 text-muted-foreground" />
                                                <div>
                                                    <CardTitle className="flex items-center gap-2">
                                                        {activity.assistantName}
                                                    </CardTitle>
                                                    <CardDescription className="flex items-center gap-2 mt-1">
                                                        <User className="h-4 w-4" /> 
                                                        {activity.userName} 
                                                        <Badge variant="secondary" className="ml-2">{activity.lastActivity}</Badge>
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-2">
                                        <div className="relative">
                                            {activity.processes.length > 0 ? (
                                                <>
                                                    <div className="absolute top-1/2 left-5 right-5 h-0.5 bg-gray-200 -translate-y-1/2"></div>
                                                    <div className="relative flex justify-between items-center px-1">
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
                        )) : (
                             <Card>
                                <CardContent className="text-center text-muted-foreground p-8">
                                    No se encontraron asistentes.
                                </CardContent>
                            </Card>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
