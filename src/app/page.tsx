

import Link from 'next/link'
import { ArrowRight, CheckCircle2, MessageSquare, Zap, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AnimatedHeadline } from '@/components/layout/AnimatedHeadline'
import { WaterAnimation } from '@/components/layout/WaterAnimation'
import { HowItWorks } from '@/components/layout/HowItWorks'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { SkillsCarousel } from '@/components/layout/SkillsCarousel'

export default function Home() {
  const plans = [
    {
      name: "Explorador",
      price: "$0",
      period: "para siempre",
      description: "Ideal para probar la plataforma.",
      features: ["1,000 créditos de bienvenida", "Asistentes ilimitados", "Soporte comunitario"],
      cta: "Empezar Gratis",
    },
    {
      name: "Manito Pro",
      price: "$450",
      period: "MXN / 5,000 créditos",
      description: "Para negocios que escalan.",
      features: ["Paquetes de créditos flexibles", "Integraciones y acceso API", "Soporte prioritario"],
      cta: "Comprar Créditos",
      popular: true,
    },
    {
      name: "Manito Empresa",
      price: "A medida",
      period: "",
      description: "Soluciones para grandes volúmenes.",
      features: ["Créditos personalizados", "Soporte dedicado 24/7", "Funciones avanzadas"],
      cta: "Contactar Ventas",
    },
  ];

  const faqItems = [
    {
        question: "¿Puedo cambiar de plan en cualquier momento?",
        answer: "¡Por supuesto! Puedes mejorar, degradar o cancelar tu plan en cualquier momento desde el panel de control. Los cambios se aplicarán al inicio de tu próximo ciclo de facturación."
    },
    {
        question: "¿Qué pasa si consumo todos mis créditos?",
        answer: "Si te quedas sin créditos, tus asistentes se pausarán temporalmente. Puedes comprar más créditos en cualquier momento para reactivarlos instantáneamente, o esperar a que tu plan se renueve."
    },
    {
        question: "¿Los asistentes pueden realizar llamadas de voz?",
        answer: "Sí, dependiendo de las habilidades que configures, tus asistentes pueden tanto recibir como realizar llamadas de voz, además de interactuar por texto y audio."
    },
    {
        question: "¿Qué se considera un 'mensaje' para el conteo de créditos?",
        answer: "Un mensaje es cualquier interacción individual, ya sea enviada o recibida por el bot. Esto incluye mensajes de texto, audios, respuestas automáticas y cualquier otra comunicación gestionada por el asistente."
    }
  ];

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      <div className="relative">
        <div className="absolute inset-0 bg-gray-900 overflow-hidden">
           <WaterAnimation progress={50} isFlipped={true}/>
        </div>
        <Header />
        <main className="relative z-10">
          <section className="relative pt-48 pb-32 text-center text-white overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter font-headline mb-4">
                Automatiza tu <AnimatedHeadline />, <br /> Conecta con tus Clientes
              </h1>
              <p className="text-lg md:text-xl max-w-3xl mx-auto text-white/80 mb-8">
                Hey Manito! es la plataforma todo-en-uno para crear y gestionar bots de WhatsApp inteligentes. Aumenta tus ventas y mejora tu soporte al cliente sin esfuerzo.
              </p>
              <Button size="lg" asChild className="bg-white text-primary hover:bg-gray-200 group shadow-lg">
                <Link href="/register">
                  Empieza Gratis <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </section>
        </main>
      </div>

      <SkillsCarousel />
      <HowItWorks />

      <section id="pricing" className="py-20 md:py-32 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">Planes para todos los tamaños</h2>
            <p className="text-muted-foreground text-lg mb-12">
              Elige el plan que se ajuste a tus necesidades.
            </p>
          </div>
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-sm mx-auto lg:max-w-none">
            {plans.map((plan) => (
              <div key={plan.name} className="pt-6">
                <Card className={plan.popular ? "border-primary border-2 relative shadow-2xl" : "shadow-md"}>
                  {plan.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Más Popular</Badge>}
                  <CardHeader>
                    <CardTitle className="font-headline">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="pt-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant={plan.popular ? "default" : "outline"}>{plan.cta}</Button>
                  </CardFooter>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">Preguntas Frecuentes</h2>
                <p className="text-muted-foreground text-lg mb-12">
                    ¿Tienes dudas? Aquí resolvemos las más comunes.
                </p>
            </div>
            <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="w-full">
                    {faqItems.map((item, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="text-lg font-semibold text-left">{item.question}</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                {item.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

