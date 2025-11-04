
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Server, Smartphone, CheckCircle2, AlertTriangle, XCircle, Loader, Beaker } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

type Status = 'online' | 'degraded' | 'offline' | 'loading';

const statusConfig: Record<Status, { text: string; color: string; icon: React.ElementType }> = {
    loading: { text: 'Verificando...', color: 'text-yellow-500', icon: Loader },
    online: { text: 'Operativo', color: 'text-green-500', icon: CheckCircle2 },
    degraded: { text: 'Atención Requerida', color: 'text-yellow-500', icon: AlertTriangle },
    offline: { text: 'Fuera de Línea', color: 'text-red-500', icon: XCircle },
};

const StatusCard = ({ title, status, description, icon: Icon }: { title: string; status: Status; description: string, icon: React.ElementType }) => {
    const config = statusConfig[status];
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Icon className="h-8 w-8 text-muted-foreground" />
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>Estado actual del servicio.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-3">
                    <config.icon className={cn("h-6 w-6", config.color, status === 'loading' && 'animate-spin')} />
                    <span className={cn("text-lg font-semibold", config.color)}>{config.text}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{description}</p>
            </CardContent>
        </Card>
    )
}

export default function DiagnosticsPage() {
    const [frontendStatus, setFrontendStatus] = useState<Status>('online'); // Frontend is online if page loads
    const [gatewayStatus, setGatewayStatus] = useState<Status>('loading');
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    
    // El gateway ahora no tiene un estado "general", sino por asistente.
    // Para esta página, simplemente verificaremos si el servicio de Cloud Run responde.
    const gatewayUrl = 'https://servidormanito-722319793837.europe-west1.run.app';

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                // Frontend is implicitly 'online'
                setFrontendStatus('online');

                // We just ping the root of the gateway to see if the service is up.
                const response = await fetch(`${gatewayUrl}/`);
                if (response.ok) {
                   setGatewayStatus('online');
                } else {
                   throw new Error('Network response was not ok');
                }
            } catch (error) {
                console.error("Failed to fetch gateway status:", error);
                setGatewayStatus('offline');
            } finally {
                setLastUpdated(new Date().toLocaleString());
            }
        };

        fetchStatus();
        const intervalId = setInterval(fetchStatus, 30000); // Poll every 30 seconds

        return () => clearInterval(intervalId);
    }, []);
    
    const getGatewayDescription = () => {
        switch (gatewayStatus) {
            case 'online': return "El servicio del Gateway en Cloud Run está en línea y respondiendo. El estado de cada bot individual se puede ver en la sección 'Mis Asistentes'.";
            case 'offline': return "No se puede establecer comunicación con el servicio del Gateway en Cloud Run. El servicio podría estar caído o experimentando problemas.";
            case 'loading': return "Verificando la disponibilidad del servicio del Gateway...";
            default: return "Estado desconocido.";
        }
    }

    const getFrontendDescription = () => {
        return "La aplicación principal (Next.js) está funcionando correctamente y respondiendo a las solicitudes, ya que esta página se ha cargado.";
    }

    return (
        <div className="flex flex-col gap-4">
            <header>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline flex items-center gap-3">
                    <Activity className="h-8 w-8 text-primary" />
                    Diagnóstico del Sistema
                </h1>
                <p className="text-muted-foreground text-sm">
                    Un resumen del estado de los servicios principales.
                    {lastUpdated && ` (Última actualización: ${lastUpdated})`}
                </p>
            </header>

            <div className="grid md:grid-cols-2 gap-6 pt-4">
                <StatusCard 
                    title="Frontend (App)" 
                    status={frontendStatus} 
                    description={getFrontendDescription()}
                    icon={Server}
                />
                <StatusCard 
                    title="Gateway (Cloud Run)" 
                    status={gatewayStatus}
                    description={getGatewayDescription()}
                    icon={Smartphone}
                />
            </div>
             <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Nota sobre el Estado del Gateway</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        El estado "Operativo" del Gateway solo confirma que el servicio principal está en línea. Dado que ahora el sistema maneja múltiples bots, el estado de conexión de cada bot individual (Conectado, Desconectado, Necesita QR) se muestra directamente en la tarjeta de cada asistente en la sección <Link href="/dashboard/asistentes" className="text-primary underline">Mis Asistentes</Link>.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
