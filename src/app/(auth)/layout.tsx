import Link from 'next/link';
import { Bot, Users, MessageSquare, BrainCircuit } from 'lucide-react';
import { WaterAnimation } from '@/components/layout/WaterAnimation';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const features = [
    {
      icon: Users,
      title: 'Gestiona tus Clientes',
      description: 'Centraliza la información de tus contactos y leads en un solo lugar.',
    },
    {
      icon: MessageSquare,
      title: 'Automatiza Conversaciones',
      description: 'Crea asistentes que responden, venden y dan soporte 24/7.',
    },
    {
      icon: BrainCircuit,
      title: 'Inteligencia Artificial Avanzada',
      description: 'Nuestros bots entienden el contexto y aprenden para mejorar continuamente.',
    },
  ];

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center p-4 relative bg-secondary">
        <div className="absolute top-8 left-8">
            <Link href="/" className="flex items-center gap-2 text-foreground -rotate-6">
            <Bot className="h-8 w-8 text-primary" />
            <div className="flex flex-col text-xl font-bold font-headline leading-none">
                <span>Hey</span>
                <span>Manito!</span>
            </div>
            </Link>
        </div>
        {children}
      </div>
      <div className="hidden lg:flex flex-col items-center justify-center relative p-12 text-white bg-gray-900">
        <WaterAnimation progress={100} isFlipped={true}/>
        <WaterAnimation progress={50} />
        
        <div className="relative z-10 text-center">
            <h2 className="text-3xl font-bold font-headline mb-4">El Poder de la IA en tu WhatsApp</h2>
            <p className="text-white/80 mb-8 max-w-lg">
                Con Hey Manito!, transformas tu comunicación. Desde la captación de clientes hasta el soporte post-venta, nuestros asistentes inteligentes están diseñados para hacer crecer tu negocio.
            </p>
            <div className="grid grid-cols-1 gap-6 text-left">
                {features.map((feature) => (
                    <div key={feature.title} className="flex items-start gap-4 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                        <feature.icon className="h-8 w-8 text-accent shrink-0 mt-1" />
                        <div>
                            <h3 className="font-semibold">{feature.title}</h3>
                            <p className="text-sm text-white/70">{feature.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
}
