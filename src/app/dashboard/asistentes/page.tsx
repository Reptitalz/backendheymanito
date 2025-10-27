

'use client';
import { useState } from "react";
import { PlusCircle, MoreHorizontal, Bot, MessageSquare, ArrowLeft, ArrowRight, Sparkles, Settings, ShieldCheck, MessageCircle, Database, CheckCircle, Wand2, Sheet, BrainCircuit, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export default function AsistentesPage() {
  const allAssistants = [
    { id: "asst_1", name: "Asistente de Ventas", status: "Activo", messagesUsed: 250, lastUpdate: "Hace 2 horas", waId: "123456789", verified: true, skills: ["send-messages", "payment-auth", "billing"], messageLimit: 1000 },
    { id: "asst_2", name: "Soporte Técnico Nivel 1", status: "Inactivo", messagesUsed: 520, lastUpdate: "Ayer", waId: "987654321", verified: false, skills: ["receive-calls", "recognize-owner"], messageLimit: 1000 },
    { id: "asst_3", name: "Recordatorios de Citas", status: "Activo", messagesUsed: 890, lastUpdate: "Hace 5 minutos", waId: "112233445", verified: true, skills: ["send-messages"], messageLimit: 1000 },
    { id: "asst_4", name: "Bot de Bienvenida", status: "Activo", messagesUsed: 150, lastUpdate: "Hace 3 días", waId: "223344556", verified: false, skills: ["send-messages", "recognize-owner"], messageLimit: 1000 },
    { id: "asst_5", name: "Encuestas de Satisfacción", status: "Pausado", messagesUsed: 300, lastUpdate: "La semana pasada", waId: "334455667", verified: false, skills: ["send-messages"], messageLimit: 5000 },
    { id: "asst_6", name: "Gestor de Pedidos", status: "Activo", messagesUsed: 750, lastUpdate: "Hoy", waId: "445566778", verified: true, skills: ["payment-auth", "google-sheet"], messageLimit: 2000 },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const ASSISTANTS_PER_PAGE = 3;
  const [messageLimitValue, setMessageLimitValue] = useState([500]);

  const totalPages = Math.ceil(allAssistants.length / ASSISTANTS_PER_PAGE);
  const startIndex = (currentPage - 1) * ASSISTANTS_PER_PAGE;
  const endIndex = startIndex + ASSISTANTS_PER_PAGE;
  const assistants = allAssistants.slice(startIndex, endIndex);

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'Activo':
        return 'default';
      case 'Inactivo':
        return 'destructive';
      case 'Pausado':
        return 'secondary';
      default:
        return 'outline';
    }
  };
  
  const TOTAL_CREDITS = 100; // 100k messages
  const MAX_MESSAGES = TOTAL_CREDITS * 1000;

  return (
    <>
      <div className="flex flex-col items-center text-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Mis Asistentes</h1>
          <p className="text-sm text-muted-foreground">Gestiona y monitorea tus bots de WhatsApp aquí.</p>
        </div>
        <Button size="lg" className="btn-shiny animated-gradient text-white font-bold w-full md:w-auto" asChild>
           <Link href="/dashboard/asistentes/crear">
            <span className="btn-shiny-content flex items-center">
              <Sparkles className="mr-2 h-4 w-4" />
              Crear Bot
            </span>
           </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:gap-6 pt-4">
        {assistants.map((assistant) => (
          <Card key={assistant.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-4 p-4 md:p-6">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-primary/10 rounded-full">
                    <Bot className="w-6 h-6 text-primary" />
                 </div>
                 <div>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      {assistant.name}
                      {assistant.verified && <CheckCircle className="h-5 w-5 text-green-500" />}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                        <Badge variant={getBadgeVariant(assistant.status)} className="py-1 px-2 text-xs">{assistant.status}</Badge>
                    </div>
                 </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                  <DropdownMenuItem>Editar</DropdownMenuItem>
                  <DropdownMenuItem>Duplicar</DropdownMenuItem>
                  <DropdownMenuItem>Ver Estadísticas</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    <span>{assistant.messagesUsed} / {assistant.messageLimit} mensajes</span>
                </div>
                <Progress value={(assistant.messagesUsed / assistant.messageLimit) * 100} className="h-2" />
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <Button variant="ghost" size="sm" className="h-7 gap-1 text-sm text-green-600 hover:text-green-700 hover:bg-green-50" asChild>
                       <Link href={`https://wa.me/${assistant.waId}`} target="_blank">
                          <MessageCircle className="h-4 w-4" />
                          <span>Chatear</span>
                       </Link>
                    </Button>
                    <div className="flex items-center gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="h-7 gap-1 text-sm">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only">Verificación</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Verificación del Asistente</AlertDialogTitle>
                            <AlertDialogDescription>
                              Ingresa el código de 6 caracteres que recibiste para verificar este asistente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="grid gap-2">
                            <Label htmlFor="verification-code">Código de Verificación</Label>
                            <Input id="verification-code" maxLength={6} placeholder="_ _ _ _ _ _" className="text-center tracking-[0.5em]" />
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction>Verificar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      
                      <Button variant="ghost" size="sm" className="h-7 gap-1 text-sm" asChild>
                        <Link href={`/dashboard/asistentes/${assistant.id}/habilidades`}>
                           <Wand2 className="h-3.5 w-3.5" />
                           <span className="sr-only sm:not-sr-only">Habilidades</span>
                        </Link>
                      </Button>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 gap-1 text-sm">
                            <Database className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only">Base de Datos</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Configurar Base de Datos</DialogTitle>
                            <DialogDescription>
                              Elige el tipo de memoria para tu asistente. Puedes usar una hoja de cálculo de Google o una memoria inteligente.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <Sheet className="h-6 w-6 text-primary"/>
                                        <h3 className="text-lg font-semibold">Google Sheet</h3>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-2">Pega la URL de tu Google Sheet para usarla como base de conocimiento.</p>
                                    <Input placeholder="https://docs.google.com/spreadsheets/..." />
                                </CardContent>
                                <CardFooter>
                                    <Button>Guardar URL</Button>
                                </CardFooter>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <BrainCircuit className="h-6 w-6 text-primary"/>
                                        <h3 className="text-lg font-semibold">Memoria Inteligente</h3>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">Permite que el bot aprenda de las conversaciones y mejore con el tiempo.</p>
                                </CardContent>
                                <CardFooter>
                                    <Button variant="secondary">Activar Memoria</Button>
                                </CardFooter>
                            </Card>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                          <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 gap-1 text-sm">
                                  <Settings className="h-3.5 w-3.5" />
                                  <span className="sr-only sm:not-sr-only">Ajustes</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ajustes del Asistente</DropdownMenuLabel>
                                <DialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                                      Definir límite de mensajes
                                  </DropdownMenuItem>
                                </DialogTrigger>
                                <DropdownMenuItem>Configurar horario</DropdownMenuItem>
                              </DropdownMenuContent>
                          </DropdownMenu>
                          <DialogContent>
                              <DialogHeader>
                                  <DialogTitle>Definir Límite de Mensajes</DialogTitle>
                                  <DialogDescription>
                                      Ajusta el número máximo de mensajes que este asistente puede usar. 1 crédito equivale a 1000 mensajes.
                                  </DialogDescription>
                              </DialogHeader>
                              <div className="py-6">
                                  <div className="space-y-4">
                                      <div className="flex justify-between items-center">
                                          <Label htmlFor="message-limit">Límite de Mensajes</Label>
                                          <span className="text-lg font-bold text-primary">{messageLimitValue[0].toLocaleString()}</span>
                                      </div>
                                      <Slider
                                          id="message-limit"
                                          min={500}
                                          max={MAX_MESSAGES}
                                          step={500}
                                          value={messageLimitValue}
                                          onValueChange={setMessageLimitValue}
                                      />
                                      <div className="flex justify-between text-xs text-muted-foreground">
                                          <span>500</span>
                                          <span>{MAX_MESSAGES.toLocaleString()}</span>
                                      </div>
                                  </div>
                              </div>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction>Guardar Límite</AlertDialogAction>
                              </AlertDialogFooter>
                          </DialogContent>
                      </Dialog>
                    </div>
                </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-6">
            <Button 
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
            </span>
            <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
            >
                Siguiente
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </div>
      )}
    </>
  );
}

    