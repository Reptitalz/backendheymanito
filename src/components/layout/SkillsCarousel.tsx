
'use client';

import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent } from '@/components/ui/card';
import { PhoneCall, MessageSquare, CreditCard, Receipt, Sheet, UserCheck, BrainCircuit, CalendarClock, ShoppingCart } from 'lucide-react';

const skills = [
  {
    icon: <MessageSquare className="w-7 h-7 text-primary" />,
    title: "Comunicación",
    description: "Envía y recibe mensajes de texto y voz.",
  },
  {
    icon: <PhoneCall className="w-7 h-7 text-primary" />,
    title: "Llamadas",
    description: "Realiza y recibe llamadas de voz con clientes.",
  },
  {
    icon: <CreditCard className="w-7 h-7 text-primary" />,
    title: "Pagos",
    description: "Autoriza y procesa pagos de forma segura.",
  },
  {
    icon: <Receipt className="w-7 h-7 text-primary" />,
    title: "Cobranza",
    description: "Gestiona recordatorios y procesos de cobranza.",
  },
  {
    icon: <Sheet className="w-7 h-7 text-primary" />,
    title: "Inventario",
    description: "Consulta y gestiona tu inventario desde un Google Sheet.",
  },
   {
    icon: <CalendarClock className="w-7 h-7 text-primary" />,
    title: "Agendamiento",
    description: "Agenda y confirma citas automáticamente.",
  },
  {
    icon: <ShoppingCart className="w-7 h-7 text-primary" />,
    title: "Ventas",
    description: "Guía a los clientes a través del proceso de compra.",
  },
  {
    icon: <UserCheck className="w-7 h-7 text-primary" />,
    title: "Reconocimiento",
    description: "Identifica a tus clientes para un trato personalizado.",
  },
  {
    icon: <BrainCircuit className="w-7 h-7 text-primary" />,
    title: "Memoria IA",
    description: "Aprende de cada conversación para mejorar continuamente.",
  },
];

export function SkillsCarousel() {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  return (
    <section className="py-20 md:py-24 bg-background w-full overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">
            Un Asistente <span className="text-primary">Inteligente</span> y <span className="text-accent">Versátil</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-12">
            Equipa a tu bot con una variedad de habilidades para automatizar cualquier tarea.
          </p>
        </div>
      </div>
      <Carousel
        plugins={[plugin.current]}
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {skills.concat(skills).map((skill, index) => (
            <CarouselItem key={index} className="basis-auto pl-4">
              <div className="p-1">
                <Card className="w-[240px] h-[140px] flex flex-col justify-center shadow-md hover:shadow-xl transition-shadow">
                  <CardContent className="flex items-center gap-4 p-6">
                    {skill.icon}
                    <div className='flex-1'>
                      <h3 className="font-semibold text-base">{skill.title}</h3>
                      <p className="text-sm text-muted-foreground">{skill.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
