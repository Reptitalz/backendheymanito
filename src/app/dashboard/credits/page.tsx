
'use client';

import { PlusCircle, MoreHorizontal, Bot, MessageSquare, Clock, Sparkles, CreditCard, ShoppingCart, Activity, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
                            <DialogContent className="sm:max-w-4xl">
                                <DialogHeader>
                                    <DialogTitle>Elige tu Plan</DialogTitle>
                                    <DialogDescription>
                                        Selecciona el plan que mejor se adapte a tus necesidades.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                                     <Card>
                                        <CardHeader>
                                            <CardTitle className="font-headline">Gratuito</CardTitle>
                                            <CardDescription>Para empezar a explorar.</CardDescription>
                                            <div className="pt-4">
                                                <span className="text-4xl font-bold">$0</span>
                                                <span className="text-muted-foreground">/mes</span>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-3">
                                                <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /><span>500 Mensajes/mes</span></li>
                                                <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /><span>1 Asistente</span></li>
                                                <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /><span>Soporte Básico</span></li>
                                            </ul>
                                        </CardContent>
                                        <CardFooter>
                                            <Button className="w-full" variant="secondary" disabled>Plan Actual</Button>
                                        </CardFooter>
                                    </Card>
                                    <Card className="border-primary border-2 relative shadow-lg">
                                         <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Recomendado</Badge>
                                        <CardHeader>
                                            <CardTitle className="font-headline">Manito Pro</CardTitle>
                                            <CardDescription>Para negocios en crecimiento.</CardDescription>
                                            <div className="pt-4">
                                                <span className="text-4xl font-bold">$45</span>
                                                <span className="text-muted-foreground">/mes</span>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-3">
                                                <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /><span>5,000 Mensajes/mes</span></li>
                                                <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /><span>3 Asistentes</span></li>
                                                <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /><span>Integraciones y API</span></li>
                                                <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /><span>Soporte Prioritario</span></li>
                                            </ul>
                                        </CardContent>
                                        <CardFooter>
                                            <Button className="w-full">Mejorar a Pro</Button>
                                        </CardFooter>
                                    </Card>
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
                            <span className="font-semibold">Manito Pro</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Próximo Pago</span>
                            <span className="font-semibold">$45.00</span>
                        </div>
                         <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Método de Pago</span>
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                <span className="font-semibold">**** **** **** 4242</span>
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
