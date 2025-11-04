
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';
import { Button } from '../ui/button';

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
                <Button variant="ghost" size="sm" className="flex items-center gap-2 h-auto px-2 py-1" asChild>
                    <Link href="/diagnostics">
                        <div className="relative flex h-3 w-3">
                            <span className={cn(
                                "absolute inline-flex h-full w-full rounded-full opacity-75",
                                pulse && `animate-ping ${color}`
                            )}></span>
                            <span className={cn("relative inline-flex rounded-full h-3 w-3", color)}></span>
                        </div>
                        <span className="text-sm">{label}</span>
                    </Link>
                </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
                <p>{tooltip}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
  );
};


export function SystemStatus() {
  const [frontendStatus, setFrontendStatus] = useState<Status>('online'); // Implicitly online
  const [lastUpdated, setLastUpdated] = useState<string>('');
  
  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString());
    const interval = setInterval(() => {
      setLastUpdated(new Date().toLocaleTimeString());
    }, 15000); // Poll every 15 seconds

    return () => clearInterval(interval);
  }, []);
  
  const getFrontendTooltip = () => {
    return "La aplicación web está funcionando correctamente.";
  }

  return (
    <div className="bg-gray-800/50 border-t border-gray-700/50">
        <div className="container mx-auto px-4 md:px-8 py-2 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <StatusIndicator label="Frontend" status={frontendStatus} tooltip={getFrontendTooltip()} />
            </div>
            <div className="text-xs text-gray-500">
                {lastUpdated && `Última act: ${lastUpdated}`}
            </div>
        </div>
    </div>
  );
}
