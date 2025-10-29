
import { BrainCircuit, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function AdminDashboardPage() {

  const summaryData = {
    assistants: {
      active: 3,
      total: 3,
      lastActivity: "Ahora mismo"
    },
  };

  return (
    <>
      <div className="flex flex-col items-start gap-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Un resumen de las herramientas de administración.</p>
      </div>

      <div className="grid gap-4 md:gap-6 pt-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monitor del Cerebro</CardTitle>
            <BrainCircuit className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.assistants.active} Asistentes</div>
            <p className="text-xs text-muted-foreground">
              Última actividad: {summaryData.assistants.lastActivity}
            </p>
            <Button asChild size="sm" className="mt-4 w-full">
              <Link href="/admin/monitor">
                Ir al Monitor <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
