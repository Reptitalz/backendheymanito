import { PlusCircle, MoreHorizontal, Bot, MessageSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Dashboard() {
  const assistants = [
    { name: "Asistente de Ventas", status: "Activo", creditsUsed: 12.5, lastUpdate: "Hace 2 horas" },
    { name: "Soporte Técnico Nivel 1", status: "Inactivo", creditsUsed: 5.2, lastUpdate: "Ayer" },
    { name: "Recordatorios de Citas", status: "Activo", creditsUsed: 34.1, lastUpdate: "Hace 5 minutos" },
  ];

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

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Mis Asistentes</h1>
          <p className="text-sm text-muted-foreground">Gestiona y monitorea tus bots de WhatsApp aquí.</p>
        </div>
        <Button>
          <PlusCircle className="mr-0 md:mr-2 h-4 w-4" />
          <span className="hidden md:inline">Crear Nuevo</span>
        </Button>
      </div>

      <div className="grid gap-4 md:gap-6">
        {assistants.map((assistant) => (
          <Card key={assistant.name}>
            <CardHeader className="flex flex-row items-start justify-between gap-4 p-4 md:p-6">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-primary/10 rounded-full">
                    <Bot className="w-6 h-6 text-primary" />
                 </div>
                 <div>
                    <CardTitle className="text-lg font-semibold">{assistant.name}</CardTitle>
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
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>{assistant.creditsUsed.toFixed(1)}K mensajes</span>
                  </div>
                  <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{assistant.lastUpdate}</span>
                  </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
