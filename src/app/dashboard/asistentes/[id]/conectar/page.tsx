
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import QRCode from 'qrcode';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Laptop, PowerOff, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

const loadingSteps = [
    { progress: 0, message: "Inicializando..." },
    { progress: 20, message: "Estableciendo conexión segura..." },
    { progress: 50, message: "Solicitando código QR al servidor de Baileys..." },
    { progress: 80, message: "Recibiendo datos del código..." },
    { progress: 100, message: "¡Código recibido! Generando imagen..." },
];

export default function ConectarPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const router = useRouter();
    const params = useParams();
    const assistantId = params.id as string;
    
    const { user } = useUser();
    const firestore = useFirestore();

    const assistantRef = useMemoFirebase(() => {
        if (!user || !assistantId) return null;
        return doc(firestore, 'users', user.uid, 'assistants', assistantId);
    }, [user, assistantId, firestore]);

    const { data: assistant, isLoading: isAssistantLoading } = useDoc(assistantRef);

    const [status, setStatus] = useState<'loading' | 'qr_received' | 'connected' | 'error' | 'already_connected'>('loading');
    const [linkedDevices, setLinkedDevices] = useState<{id: number, name: string, lastActive: string, icon: React.ElementType}[]>([]);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingMessage, setLoadingMessage] = useState(loadingSteps[0].message);

    useEffect(() => {
        let progressInterval: NodeJS.Timeout;
        if (status === 'loading') {
            progressInterval = setInterval(() => {
                setLoadingProgress(prev => {
                    const nextProgress = prev + 2;
                    const currentStep = loadingSteps.find((step, i) => {
                        const nextStep = loadingSteps[i + 1];
                        return nextProgress >= step.progress && (!nextStep || nextProgress < nextStep.progress);
                    });
                    if (currentStep) {
                        setLoadingMessage(currentStep.message);
                    }
                    if (nextProgress >= 95) { // Stop before 100, wait for QR
                        clearInterval(progressInterval);
                        return 95;
                    }
                    return nextProgress;
                });
            }, 100);
        }
        return () => clearInterval(progressInterval);
    }, [status]);
    
    useEffect(() => {
        if (linkedDevices.length > 0) {
            setStatus('already_connected');
            return;
        }

        const clearQr = async () => {
             try {
                await fetch('/api/qr', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ qr: null }),
                });
             } catch (e) {
                console.error("Could not clear QR on init");
             }
        }
        clearQr();

        const interval = setInterval(async () => {
            try {
                const res = await fetch('/api/qr');
                if (!res.ok) throw new Error('Failed to fetch');

                const data = await res.json();

                if (data.qr) {
                    setLoadingProgress(100);
                    setLoadingMessage("¡Código recibido! Generando imagen...");
                    setStatus('qr_received');
                    if (canvasRef.current) {
                        QRCode.toCanvas(canvasRef.current, data.qr, { width: 256, errorCorrectionLevel: 'H' }, (error) => {
                            if (error) console.error("Error generating QR code canvas:", error);
                        });
                    }
                } else {
                     if (status === 'qr_received') { 
                        setStatus('connected');
                        clearInterval(interval);
                        // Simulate adding a device upon connection
                        setLinkedDevices([{ id: Date.now(), name: "Nuevo Dispositivo", lastActive: "Ahora mismo", icon: Laptop }]);
                        router.push('/dashboard/asistentes');
                    }
                }
            } catch (error) {
                console.error("Error polling for QR code:", error);
                setStatus('error');
            }
        }, 2000); 

        return () => clearInterval(interval);
    }, [router, status, linkedDevices]);

    const handleDisconnect = (deviceId: number) => {
        setLinkedDevices(devices => devices.filter(d => d.id !== deviceId));
        setStatus('loading');
        setLoadingProgress(0);
        setLoadingMessage(loadingSteps[0].message);
    }
    
    const getTitle = () => {
        if (isAssistantLoading) {
            return <Skeleton className="h-6 w-48" />;
        }
        if (assistant) {
            return `Conectar: ${assistant.name}`;
        }
        return "Conectar Asistente";
    }

    return (
        <div className="flex items-center justify-center">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <div className="flex items-center gap-4">
                         <Button variant="outline" size="icon" asChild>
                            <Link href="/dashboard/asistentes">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <CardTitle>{getTitle()}</CardTitle>
                             <CardDescription>
                                {status === 'already_connected'
                                    ? 'Gestiona la sesión activa de tu asistente.'
                                    : 'Escanea el código QR con WhatsApp para vincular un nuevo dispositivo.'
                                }
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-6 gap-4">
                    {status === 'already_connected' ? (
                        <div className="w-full text-center">
                            <Alert>
                                <AlertTitle className="flex items-center gap-2">
                                    <PowerOff className="h-5 w-5 text-primary" />
                                    Sesión Activa Detectada
                                </AlertTitle>
                                <AlertDescription>
                                    Ya hay un dispositivo conectado. Solo se permite una sesión activa a la vez. Para conectar un nuevo dispositivo, primero debes cerrar la sesión actual.
                                </AlertDescription>
                            </Alert>
                        </div>
                    ) : (
                        <>
                            <div className="h-64 w-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                                {status === 'loading' && (
                                    <div className="flex flex-col items-center gap-4 text-muted-foreground w-56">
                                        <Progress value={loadingProgress} className="w-full h-2" />
                                        <p className="text-xs text-center">{loadingMessage}</p>
                                    </div>
                                )}
                                <canvas ref={canvasRef} className={status === 'qr_received' ? 'block' : 'hidden'} />
                                 {status === 'error' && <p className="text-destructive">Error al cargar el código QR. Inténtalo de nuevo.</p>}
                                 {status === 'connected' && <p className="text-green-600">¡Conectado! Redirigiendo...</p>}
                            </div>
                             <p className="text-xs text-muted-foreground text-center max-w-xs">
                                Abre WhatsApp en tu teléfono, ve a `Configuración` {'>'} `Dispositivos vinculados` y escanea el código.
                            </p>
                        </>
                    )}
                </CardContent>
                <Separator />
                <CardFooter className="flex flex-col items-start p-6 gap-4">
                    <h3 className="font-semibold text-base">Dispositivos Vinculados</h3>
                     {linkedDevices.length > 0 ? (
                        <ul className="w-full space-y-3">
                            {linkedDevices.map(device => (
                                <li key={device.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <device.icon className="h-6 w-6 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium text-sm">{device.name}</p>
                                            <div className="text-xs text-muted-foreground">
                                               Última vez activo: <Badge variant={device.lastActive === "Ahora mismo" ? "default" : "secondary"}>{device.lastActive}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="destructive" size="sm" onClick={() => handleDisconnect(device.id)}>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Cerrar Sesión
                                    </Button>
                                </li>
                            ))}
                        </ul>
                     ) : (
                        <p className="text-sm text-muted-foreground">No hay dispositivos vinculados.</p>
                     )}
                </CardFooter>
            </Card>
        </div>
    );
}
