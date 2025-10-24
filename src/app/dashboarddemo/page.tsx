import { PlusCircle, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function DashboardDemo() {
  const assistants = [
    { name: "Asistente de Ventas (Demo)", status: "Activo", creditsUsed: 12.5, lastUpdate: "Hace 2 horas" },
    { name: "Soporte Técnico Nivel 1 (Demo)", status: "Inactivo", creditsUsed: 5.2, lastUpdate: "Ayer" },
    { name: "Recordatorios de Citas (Demo)", status: "Activo", creditsUsed: 34.1, lastUpdate: "Hace 5 minutos" },
    { name: "Bot de Bienvenida (Demo)", status: "Pausado", creditsUsed: 0.8, lastUpdate: "La semana pasada" },
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
          <h1 className="text-3xl font-bold tracking-tight font-headline">Mis Asistentes (Modo Demo)</h1>
          <p className="text-muted-foreground">Esta es una demostración de cómo puedes gestionar tus bots.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Crear Nuevo Asistente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen de Asistentes</CardTitle>
          <CardDescription>
            Una lista de todos los bots de demostración en tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Créditos Usados (mes)</TableHead>
                <TableHead>Última Actualización</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assistants.map((assistant) => (
                <TableRow key={assistant.name}>
                  <TableCell className="font-medium">{assistant.name}</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(assistant.status)}>{assistant.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{assistant.creditsUsed.toFixed(1)}</TableCell>
                  <TableCell>{assistant.lastUpdate}</TableCell>
                  <TableCell className="text-right">
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
