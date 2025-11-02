
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type Status = 'online' | 'degraded' | 'offline' | 'loading';

interface StatusIndicatorProps {
  label: string;
  status: Status;
  tooltip: string;
}

const statusConfig: Record<Status, { color: string; pulse: boolean }> = {
  loading: { color: 'bg-yellow-500', pulse: true },
  online: { color: 'bg-green-500', pulse: false },
  degraded: { color: 'bg-yellow-500', pulse: false },
  offline: { color: 'bg-red-500', pulse: false },
};

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ label, status, tooltip }) => {
  const { color, pulse } = statusConfig[status];

  return (
    <TooltipProvider delayDuration={0}>
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                    <div className="relative flex h-3 w-3">
                        <span className={cn(
                            "absolute inline-flex h-full w-full rounded-full opacity-75",
                            pulse && `animate-ping ${color}`
                        )}></span>
                        <span className={cn("relative inline-flex rounded-full h-3 w-3", color)}></span>
                    </div>
                    <span className="text-sm">{label}</span>
                </div>
            </TooltipTrigger>
            <TooltipContent side="top">
                <p>{tooltip}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
  );
};


export function SystemStatus() {
  const [frontendStatus, setFrontendStatus] = useState<Status>('loading');
  const [gatewayStatus, setGatewayStatus] = useState<Status>('loading');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/status');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        
        // Frontend status
        setFrontendStatus(data.frontend === 'online' ? 'online' : 'offline');

        // Gateway status
        switch (data.gateway) {
          case 'connected':
            setGatewayStatus('online');
            break;
          case 'qr':
            setGatewayStatus('degraded');
            break;
          case 'disconnected':
          case 'error':
            setGatewayStatus('offline');
            break;
          default:
            setGatewayStatus('loading');
        }

      } catch (error) {
        console.error("Failed to fetch system status:", error);
        setFrontendStatus('offline');
        setGatewayStatus('offline');
      } finally {
        setLastUpdated(new Date().toLocaleTimeString());
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 15000); // Poll every 15 seconds

    return () => clearInterval(interval);
  }, []);
  
  const getGatewayTooltip = () => {
    switch (gatewayStatus) {
        case 'online': return "El gateway de WhatsApp está conectado y operativo.";
        case 'degraded': return "El gateway está esperando que se escanee el código QR.";
        case 'offline': return "El gateway de WhatsApp no está conectado.";
        case 'loading': return "Verificando el estado del gateway...";
        default: return "Estado desconocido.";
    }
  }
  
    const getFrontendTooltip = () => {
    switch (frontendStatus) {
        case 'online': return "La aplicación web está funcionando correctamente.";
        case 'offline': return "La aplicación web no puede conectarse al servidor.";
        case 'loading': return "Verificando el estado de la aplicación...";
        default: return "Estado desconocido.";
    }
  }


  return (
    <div className="bg-gray-800/50 border-t border-gray-700/50">
        <div className="container mx-auto px-4 md:px-8 py-2 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <StatusIndicator label="Frontend" status={frontendStatus} tooltip={getFrontendTooltip()} />
                <StatusIndicator label="Gateway" status={gatewayStatus} tooltip={getGatewayTooltip()} />
            </div>
            <div className="text-xs text-gray-500">
                {lastUpdated && `Última act: ${lastUpdated}`}
            </div>
        </div>
    </div>
  );
}
