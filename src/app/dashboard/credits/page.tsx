
'use client';

import { PlusCircle, MoreHorizontal, Bot, MessageSquare, Clock, Sparkles, CreditCard, ShoppingCart, Activity, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export default function CreditsPage() {
    const usage = {
        creditsUsed: 46.8,
        totalCredits: 100,
        cycleEndDate: "30 de Julio, 2024",
    };

    const percentageUsed = (usage.creditsUsed / usage.totalCredits) * 100;

    const history = [
        { id: "H-001", date: "15 de Junio, 2024", description: "Recarga de 10 créditos", amount: "-$85.00", status: "Completado" },
        { id: "H-002", date: "1 de Junio, 2024", description: "Inicio de ciclo", amount: "+50 créditos", status: "Completado" },
        { id: "H-003", date: "28 de Mayo, 2024", description: "Uso de Asistente de Ventas", amount: "-2.3 créditos", status: "Facturado" },
    ];
    
    const plans = [
        {
          name: "Gratuito",
          price: "$0",
          period: "/mes",
          description: "Para empezar a explorar.",
          features: ["500 Mensajes/mes", "1 Asistente", "Soporte básico"],
          cta: "Plan Actual",
          disabled: true,
          variant: "secondary"
        },
        {
          name: "Manito Pro",
          price: "$810",
          period: "MXN/mes",
          description: "Para negocios en crecimiento.",
          features: ["5,000 Mensajes/mes", "3 Asistentes", "Integraciones y API", "Soporte prioritario"],
          cta: "Mejorar a Pro",
          popular: true,
          variant: "default"
        },
        {
          name: "Manito Empresa",
          price: "A medida",
          period: "",
          description: "Soluciones para grandes volúmenes.",
          features: ["Créditos personalizados", "Asistentes ilimitados", "Soporte dedicado 24/7", "Funciones avanzadas"],
          cta: "Contactar Ventas",
          variant: "outline"
        },
      ];

    return (
        <>
            <div className="flex flex-col items-start gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Créditos y Facturación</h1>
                    <p className="text-sm text-muted-foreground">Gestiona tus créditos, revisa tu historial y compra más.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 pt-4">
                <Card className="lg:col-span-4">
                    <CardHeader className="pb-2">
                        <CardDescription>Créditos Usados este Ciclo</CardDescription>
                        <CardTitle className="text-4xl">{usage.creditsUsed.toFixed(1)} / {usage.totalCredits} K</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground">
                            Tu ciclo se renueva el {usage.cycleEndDate}.
                        </div>
                        <Progress value={percentageUsed} className="mt-2" />
                    </CardContent>
                    <CardFooter>
                       <Dialog>
                            <DialogTrigger asChild>
                                <Button className="btn-shiny animated-gradient text-white font-bold w-full sm:w-auto">
                                    <span className="btn-shiny-content flex items-center">
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        Comprar más créditos
                                    </span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="w-screen h-screen max-w-none sm:rounded-none flex flex-col">
                                <DialogHeader className="text-center pt-8">
                                    <DialogTitle className="text-3xl">Elige tu Plan</DialogTitle>
                                    <DialogDescription>
                                        Selecciona el plan que mejor se adapte a tus necesidades.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="flex-1 flex items-center justify-center py-4">
                                   <Carousel
                                        opts={{
                                            align: "center",
                                            loop: true,
                                        }}
                                        className="w-full max-w-4xl"
                                    >
                                        <CarouselContent>
                                            {plans.map((plan) => (
                                                <CarouselItem key={plan.name} className="sm:basis-1/2 md:basis-1/3">
                                                    <div className="p-1 h-full pt-4">
                                                        <Card className={`h-full flex flex-col ${plan.popular ? "border-primary border-2 relative shadow-lg" : ""}`}>
                                                             {plan.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Recomendado</Badge>}
                                                            <CardHeader>
                                                                <CardTitle className="font-headline">{plan.name}</CardTitle>
                                                                <CardDescription>{plan.description}</CardDescription>
                                                                <div className="pt-4">
                                                                    <span className="text-4xl font-bold">{plan.price}</span>
                                                                    <span className="text-muted-foreground">{plan.period}</span>
                                                                </div>
                                                            </CardHeader>
                                                            <CardContent className="flex-1">
                                                                <ul className="space-y-3">
                                                                    {plan.features.map(feature => (
                                                                        <li key={feature} className="flex items-center gap-2">
                                                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                                            <span>{feature}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </CardContent>
                                                            <CardFooter>
                                                                <Button 
                                                                    className="w-full" 
                                                                    variant={plan.variant as any}
                                                                    disabled={plan.disabled}
                                                                >
                                                                    {plan.cta}
                                                                </Button>
                                                            </CardFooter>
                                                        </Card>
                                                    </div>
                                                </CarouselItem>
                                            ))}
                                        </CarouselContent>
                                        <CarouselPrevious />
                                        <CarouselNext />
                                    </Carousel>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </CardFooter>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Resumen de Cuenta</CardTitle>
                        <CardDescription>
                            Información sobre tu plan y facturación.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Plan Actual</span>
                            <span className="font-semibold">Gratuito</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Próximo Pago</span>
                            <span className="font-semibold">$0.00</span>
                        </div>
                         <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Método de Pago</span>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm">Añadir Método</Button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="justify-start">
                         <Button variant="outline">Administrar Suscripción</Button>
                    </CardFooter>
                </Card>
            </div>
            
            <div className="pt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Historial de Transacciones</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead className="text-right">Monto</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {history.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.date}</TableCell>
                                        <TableCell>{item.description}</TableCell>
                                        <TableCell className="text-right font-medium">{item.amount}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

        </>
    )
}
