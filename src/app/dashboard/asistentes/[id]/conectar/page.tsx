
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import QRCode from 'qrcode';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Laptop, PowerOff, Trash2, Wifi, WifiOff, QrCode as QrCodeIcon } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

const GATEWAY_URL = 'https://servidormanito-722319793837.europe-west1.run.app';

type GatewayStatus = 'loading' | 'qr' | 'connected' | 'disconnected' | 'error' | 'not_found';

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
    const [gatewayStatus, setGatewayStatus] = useState<GatewayStatus>('loading');
    const [qrCodeValue, setQrCodeValue] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState("Inicializando conexión...");
    
    useEffect(() => {
        if (!assistantId) return;

        const pollStatus = async () => {
            try {
                // Call the gateway directly
                const statusRes = await fetch(`${GATEWAY_URL}/status?assistantId=${assistantId}`);
                if (!statusRes.ok) throw new Error('Failed to fetch status from gateway');
                const { status } = await statusRes.json();
                
                setGatewayStatus(status);

                if (status === 'qr') {
                    setLoadingMessage("¡Escanea el código para conectar!");
                    if (!qrCodeValue) {
                        // Fetch QR directly from the gateway
                        const qrRes = await fetch(`${GATEWAY_URL}/qr?assistantId=${assistantId}`);
                        if (!qrRes.ok) throw new Error('Failed to fetch QR from gateway');
                        const { qr } = await qrRes.json();
                        
                        if (qr) {
                            setQrCodeValue(qr);
                            if (canvasRef.current) {
                                QRCode.toCanvas(canvasRef.current, qr, { width: 256, errorCorrectionLevel: 'H' }, (error) => {
                                    if (error) console.error("Error generating QR code canvas:", error);
                                });
                            }
                        }
                    }
                } else if (status === 'connected') {
                    setLoadingMessage("¡Conectado! Redirigiendo...");
                    setTimeout(() => {
                        router.push('/dashboard/asistentes');
                    }, 2000);
                } else if (status === 'not_found') {
                    setLoadingMessage("Asistente no encontrado en el gateway. Esperando sincronización...");
                } else {
                     setLoadingMessage("Esperando conexión del gateway...");
                }

            } catch (error) {
                console.error("Error polling gateway status:", error);
                setGatewayStatus('error');
                setLoadingMessage("Error de conexión. Verifica la consola.");
            }
        };

        const intervalId = setInterval(pollStatus, 3000);

        // Run once immediately
        pollStatus();

        return () => clearInterval(intervalId);

    }, [assistantId, router, qrCodeValue]);


    const getTitle = () => {
        if (isAssistantLoading) return <Skeleton className="h-6 w-48" />;
        if (assistant) return `Conectar: ${assistant.name}`;
        return "Conectar Asistente";
    }

    const renderStatusContent = () => {
        if (qrCodeValue) {
             return (
                <>
                    <canvas ref={canvasRef} className="rounded-lg" />
                    <p className="text-xs text-muted-foreground text-center max-w-xs pt-4">
                        Abre WhatsApp en tu teléfono, ve a `Configuración` {'>'} `Dispositivos vinculados` y escanea el código.
                    </p>
                </>
            );
        }

        switch (gatewayStatus) {
            case 'loading':
            case 'disconnected':
            case 'not_found':
                return (
                    <div className="flex flex-col items-center gap-4 text-muted-foreground w-64 text-center">
                         <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
                        <p className="text-sm font-semibold">{loadingMessage}</p>
                        <Progress value={50} className="w-full h-2 animate-pulse" />
                    </div>
                );
            case 'connected':
                 return (
                    <div className="flex flex-col items-center gap-4 text-green-600">
                        <Wifi className="h-24 w-24 animate-pulse" />
                        <p className="font-semibold text-lg">{loadingMessage}</p>
                    </div>
                );
            case 'error':
                 return (
                    <div className="flex flex-col items-center gap-4 text-destructive">
                        <WifiOff className="h-24 w-24" />
                        <p className="font-semibold text-lg">{loadingMessage}</p>
                        <p className="text-xs text-center max-w-xs">No se pudo comunicar con el servidor del gateway. Puede estar reiniciándose o tener un problema. Inténtalo de nuevo en unos minutos.</p>
                    </div>
                );
            default:
                return (
                     <div className="flex flex-col items-center gap-4 text-muted-foreground w-56">
                        <Progress value={50} className="w-full h-2 animate-pulse" />
                        <p className="text-xs text-center">{loadingMessage}</p>
                    </div>
                );
        }
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
                                Gestiona la conexión de tu asistente con WhatsApp.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-6 gap-4 min-h-[320px]">
                    {renderStatusContent()}
                </CardContent>
            </Card>
        </div>
    );
}
