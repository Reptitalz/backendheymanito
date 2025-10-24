import Link from 'next/link'
import { ArrowRight, CheckCircle2, MessageSquare, Zap, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function Home() {
  const plans = [
    {
      name: "Manito Básico",
      price: "$10",
      period: "/mes",
      description: "Ideal para empezar y probar la plataforma.",
      features: ["1 Crédito (1,000 mensajes)", "1 Bot de WhatsApp", "Soporte básico"],
      cta: "Empezar ahora",
    },
    {
      name: "Manito Pro",
      price: "$45",
      period: "/mes",
      description: "Perfecto para negocios en crecimiento.",
      features: ["5 Créditos (5,000 mensajes)", "Hasta 3 Bots de WhatsApp", "Integraciones API", "Soporte prioritario"],
      cta: "Elegir Pro",
      popular: true,
    },
    {
      name: "Manito Empresa",
      price: "A medida",
      period: "",
      description: "Soluciones a medida para grandes volúmenes.",
      features: ["Créditos personalizados", "Bots ilimitados", "Soporte dedicado 24/7", "Funciones avanzadas"],
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
          <div className="absolute inset-0 z-0">
            <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/50 rounded-full filter blur-3xl opacity-70 animate-blob-1"></div>
            <div className="absolute -bottom-1/4 -right-1/4 w-2/3 h-2/3 bg-accent/50 rounded-full filter blur-3xl opacity-70 animate-blob-2"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 bg-fuchsia-500/20 rounded-full filter blur-3xl opacity-70 animate-blob-3"></div>
          </div>
        </div>
        <Header />
        <main className="relative z-10">
          <section className="pt-48 pb-32 text-center text-white">
            <div className="container mx-auto px-4">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter font-headline mb-4">
                Automatiza tu WhatsApp, <br /> Conecta con tus Clientes
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
        <div className="absolute bottom-0 left-0 right-0 h-20 text-background">
           <svg viewBox="0 0 500 30" preserveAspectRatio="none" className="w-full h-full">
            <path className="wavy-line" d="M0,10 C150,40 350,-20 500,10 L500,0 L0,0 Z" fill="hsl(var(--background))" />
          </svg>
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
              Elige el plan que se ajuste a tus necesidades. 1 crédito = 1000 mensajes.
            </p>
          </div>
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-sm mx-auto lg:max-w-none">
            {plans.map((plan) => (
              <Card key={plan.name} className={plan.popular ? "border-primary border-2 relative shadow-2xl" : "shadow-md"}>
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
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
