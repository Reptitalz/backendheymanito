import { Bot, Users, CreditCard, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Dashboard() {
  const summaryData = {
    assistants: {
      active: 2,
      total: 3,
    },
    clients: {
      total: 5,
      new: 1,
    },
    credits: {
      used: 46.8,
      total: 100,
    }
  };

  return (
    <>
      <div className="flex flex-col items-start gap-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Un resumen de la actividad de tu cuenta.</p>
      </div>

      <div className="grid gap-4 md:gap-6 pt-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Asistentes Activos</CardTitle>
            <Bot className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.assistants.active} / {summaryData.assistants.total}</div>
            <p className="text-xs text-muted-foreground">
              Bots actualmente en funcionamiento.
            </p>
            <Button asChild size="sm" className="mt-4 w-full">
              <Link href="/dashboard/asistentes">
                Gestionar Asistentes <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.clients.total}</div>
            <p className="text-xs text-muted-foreground">
              +{summaryData.clients.new} nuevos esta semana.
            </p>
            <Button asChild size="sm" variant="secondary" className="mt-4 w-full">
               <Link href="/dashboard/clients">
                Ver Clientes <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Créditos Usados</CardTitle>
            <CreditCard className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.credits.used.toFixed(1)} / {summaryData.credits.total}K</div>
            <p className="text-xs text-muted-foreground">
              Tu ciclo se renueva pronto.
            </p>
             <Button asChild size="sm" variant="secondary" className="mt-4 w-full">
               <Link href="/dashboard/credits">
                Comprar Créditos <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

       <div className="pt-4">
          <Card>
            <CardHeader>
                <CardTitle>Comienza a Crear</CardTitle>
                <CardDescription>
                    Crea un nuevo asistente de WhatsApp para automatizar tus conversaciones.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild size="lg" className="btn-shiny animated-gradient text-white font-bold w-full sm:w-auto">
                    <Link href="/dashboard/asistentes/crear">
                        <span className="btn-shiny-content">
                            Crear Asistente
                        </span>
                    </Link>
                </Button>
            </CardContent>
        </Card>
       </div>

    </>
  );
}
