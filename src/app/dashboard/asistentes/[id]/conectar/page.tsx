
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import QRCode from 'qrcode';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Smartphone, Laptop, Trash2, PowerOff } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const initialLinkedDevices = [
    { id: 1, name: "Chrome on Mac OS", lastActive: "Ahora mismo", icon: Laptop },
    // { id: 2, name: "iPhone 15 Pro", lastActive: "Hace 2 horas", icon: Smartphone },
];

export default function ConectarPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const router = useRouter();
    const params = useParams();
    const assistantId = params.id;
    const [status, setStatus] = useState<'loading' | 'qr_received' | 'connected' | 'error' | 'already_connected'>('loading');
    const [linkedDevices, setLinkedDevices] = useState(initialLinkedDevices);

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
        // Here you would call an API to disconnect the device
        // For simulation, we'll just remove it from the state
        setLinkedDevices(devices => devices.filter(d => d.id !== deviceId));
        setStatus('loading'); // Go back to QR polling state
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
                            <CardTitle>Conectar Asistente ({assistantId})</CardTitle>
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
                            <div className="h-64 w-64 flex items-center justify-center bg-gray-100 rounded-lg">
                                {status === 'loading' && (
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <div role="status">
                                            <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-primary" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 40.0157 91.5421 44.378 93.9676 39.0409Z" fill="currentFill"/>
                                            </svg>
                                            <span className="sr-only">Cargando...</span>
                                        </div>
                                        Esperando código QR...
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

    