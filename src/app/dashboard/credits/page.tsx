
'use client';

import { PlusCircle, MoreHorizontal, Bot, MessageSquare, Clock, Sparkles, CreditCard, ShoppingCart, Activity, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, Timestamp } from "firebase/firestore";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import GooglePayButton from "@/components/payments/GooglePayButton";
import Link from 'next/link';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Assistant {
  id: string;
  name: string;
  usage: {
    messagesUsed: number;
    messageLimit: number;
  };
}

interface Transaction {
    id: string;
    description: string;
    amount: number;
    credits: number;
    status: 'completed' | 'pending' | 'failed';
    createdAt: Timestamp;
}


export default function CreditsPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const assistantsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return collection(firestore, 'users', user.uid, 'assistants');
    }, [user, firestore]);

    const transactionsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return collection(firestore, 'users', user.uid, 'transactions');
    }, [user, firestore]);

    const { data: assistants, isLoading: isAssistantsLoading } = useCollection<Assistant>(assistantsQuery);
    const { data: transactions, isLoading: isTransactionsLoading } = useCollection<Transaction>(transactionsQuery);

    const { usedCredits, totalCredits } = useMemo(() => {
        if (!assistants) return { usedCredits: 0, totalCredits: 0 };

        const totalMessagesUsed = assistants.reduce((sum, assistant) => sum + (assistant.usage?.messagesUsed || 0), 0);
        const totalMessageLimit = assistants.reduce((sum, assistant) => sum + (assistant.usage?.messageLimit || 0), 0);

        return {
            usedCredits: totalMessagesUsed / 1000,
            totalCredits: totalMessageLimit / 1000
        };
    }, [assistants]);
    
    const usage = {
        creditsUsed: usedCredits,
        totalCredits: totalCredits,
        cycleEndDate: "30 de Julio, 2024",
    };

    const percentageUsed = usage.totalCredits > 0 ? (usage.creditsUsed / usage.totalCredits) * 100 : 0;
    
    const plans = [
      {
        name: "Plan Gratuito",
        price: 0,
        priceString: "Activado",
        period: "",
        description: "1,000 créditos para empezar.",
        features: ["~1,000 Mensajes", "1 Asistente", "Soporte comunitario"],
        cta: "Tu Plan Actual",
        variant: "outline",
        disabled: true,
        isGooglePay: false,
      },
      {
        name: "Paquete Básico",
        price: 450,
        priceString: "$450",
        period: "MXN",
        description: "5,000 créditos para tus asistentes.",
        features: ["~5,000 Mensajes", "Válido por 1 año", "Ideal para tráfico moderado"],
        cta: "Comprar Paquete",
        variant: "default",
        isGooglePay: true,
      },
      {
        name: "Paquete Pro",
        price: 810,
        priceString: "$810",
        period: "MXN",
        description: "10,000 créditos a un mejor precio.",
        features: ["~10,000 Mensajes", "Válido por 1 año", "Acceso a API", "Soporte prioritario"],
        cta: "Comprar Paquete",
        popular: true,
        variant: "default",
        isGooglePay: true,
      },
      {
        name: "Paquete Empresa",
        price: 0,
        priceString: "A medida",
        period: "",
        description: "Soluciones para grandes volúmenes.",
        features: ["Créditos personalizados", "Precios por volumen", "Soporte dedicado 24/7"],
        cta: "Contactar Ventas",
        variant: "outline",
        isGooglePay: false,
      },
    ];

    const formatTransactionDate = (timestamp: Timestamp) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp.seconds * 1000).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    const formatTransactionAmount = (transaction: Transaction) => {
        if (transaction.status !== 'completed') {
            return transaction.status;
        }
        if (transaction.amount > 0) {
            return `-$${(transaction.amount / 100).toFixed(2)} MXN`;
        }
        return `+${transaction.credits} créditos`;
    }
      
    const CreditsUsageCard = () => {
        if(isAssistantsLoading) {
            return (
                <Card className="lg:col-span-4">
                    <CardHeader className="pb-2">
                        <CardDescription>Créditos Usados este Ciclo</CardDescription>
                        <Skeleton className="h-10 w-48 mt-1" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-64 mb-2" />
                        <Skeleton className="h-2 w-full" />
                    </CardContent>
                    <CardFooter>
                       <Skeleton className="h-10 w-48" />
                    </CardFooter>
                </Card>
            );
        }

        return (
            <Card className="lg:col-span-4">
                <CardHeader className="pb-2">
                    <CardDescription>Créditos Disponibles</CardDescription>
                    <CardTitle className="text-4xl">{(totalCredits - usedCredits).toFixed(1)} K</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-xs text-muted-foreground">
                        Total de créditos del plan: {usage.totalCredits.toFixed(0)} K
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
                        <DialogContent className="h-screen w-screen max-w-none sm:rounded-none flex flex-col">
                            <DialogHeader className="text-center pt-8">
                                <DialogTitle className="text-3xl">Paquetes de Créditos</DialogTitle>
                                <DialogDescription>
                                    Recarga tu saldo para mantener a tus asistentes activos.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex-1 flex items-center justify-center py-4">
                               <Carousel
                                    opts={{
                                        align: "center",
                                        loop: false,
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
                                                                <span className="text-4xl font-bold">{plan.priceString}</span>
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
                                                            {plan.isGooglePay ? (
                                                                <GooglePayButton plan={plan} />
                                                            ) : (
                                                                <Button 
                                                                    className="w-full" 
                                                                    variant={plan.variant as any}
                                                                    disabled={plan.disabled}
                                                                >
                                                                    {plan.cta}
                                                                </Button>
                                                            )}
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
        );
    }

    return (
        <>
            <div className="flex flex-col items-start gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Créditos y Facturación</h1>
                    <p className="text-sm text-muted-foreground">Gestiona tus créditos, revisa tu historial y compra más.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 pt-4">
                <CreditsUsageCard />
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
                            <span className="font-semibold">Plan Explorador</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Próximo Pago</span>
                            <span className="font-semibold">N/A</span>
                        </div>
                         <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Método de Pago</span>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">Añadir Método</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Añadir Método de Pago</DialogTitle>
                                        <DialogDescription>
                                            Ingresa los datos de tu tarjeta de crédito. La información es segura.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="card-name">Nombre en la tarjeta</Label>
                                            <Input id="card-name" placeholder="Juan Pérez" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="card-number">Número de tarjeta</Label>
                                            <Input id="card-number" placeholder="**** **** **** 1234" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="expiry-date">Vencimiento</Label>
                                                <Input id="expiry-date" placeholder="MM/AA" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="cvc">CVC</Label>
                                                <Input id="cvc" placeholder="123" />
                                            </div>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline">Cancelar</Button>
                                        <Button type="submit">Guardar Tarjeta</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
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
                                {isTransactionsLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
                                            Cargando historial...
                                        </TableCell>
                                    </TableRow>
                                ) : transactions && transactions.length > 0 ? (
                                    transactions.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{formatTransactionDate(item.createdAt)}</TableCell>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell className="text-right font-medium">{formatTransactionAmount(item)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                     <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
                                            No hay transacciones todavía.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

        </>
    )
}
