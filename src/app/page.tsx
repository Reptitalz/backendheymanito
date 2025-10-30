

import Link from 'next/link'
import { ArrowRight, CheckCircle2, MessageSquare, Zap, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AnimatedHeadline } from '@/components/layout/AnimatedHeadline'
import { WaterAnimation } from '@/components/layout/WaterAnimation'

export default function Home() {
  const plans = [
    {
      name: "Gratuito",
      price: "$0",
      period: "/mes",
      description: "Para empezar a explorar.",
      features: ["500 Mensajes/mes", "1 Asistente", "Soporte básico"],
      cta: "Empezar Gratis",
    },
    {
      name: "Manito Pro",
      price: "$810",
      period: "MXN/mes",
      description: "Para negocios en crecimiento.",
      features: ["5,000 Mensajes/mes", "3 Asistentes", "Integraciones y API", "Soporte prioritario"],
      cta: "Mejorar a Pro",
      popular: true,
    },
    {
      name: "Manito Empresa",
      price: "A medida",
      period: "",
      description: "Soluciones para grandes volúmenes.",
      features: ["Créditos personalizados", "Asistentes ilimitados", "Soporte dedicado 24/7", "Funciones avanzadas"],
      cta: "Contactar Ventas",
    },
  ];

  const features = [
    {
      icon: <Zap className="w-8 h-8 text-primary" />,
      title: "Configuración Instantánea",
      description: "Conecta tu número de WhatsApp y empieza a automatizar conversaciones en minutos.",
    },
    {
      icon: <Bot className="w-8 h-8 text-primary" />,
      title: "Asistentes Inteligentes",
      description: "Crea flujos de conversación avanzados que entienden y responden a tus clientes de forma natural.",
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-primary" />,
      title: "Modelo de Créditos Simple",
      description: "Con nuestro sistema de créditos (1 crédito = 1000 mensajes), solo pagas por lo que usas. Sin sorpresas.",
    },
  ];

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      <div className="relative">
        <div className="absolute inset-0 bg-gray-900 overflow-hidden">
        </div>
        <Header />
        <main className="relative z-10">
          <section className="relative pt-48 pb-32 text-center text-white overflow-hidden">
            <div className="absolute inset-0 z-0">
                <WaterAnimation progress={100} />
            </div>
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
        <div className="absolute bottom-0 left-0 right-0 h-40">
           <WaterAnimation progress={25} isFlipped={true} />
        </div>
      </div>

      <section id="features" className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">La plataforma que tu negocio necesita</h2>
            <p className="text-muted-foreground text-lg mb-12">
              Todo lo que necesitas para llevar la comunicación con tus clientes al siguiente nivel.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center shadow-md hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="font-headline">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

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

      <Footer />
    </div>
  )
}
