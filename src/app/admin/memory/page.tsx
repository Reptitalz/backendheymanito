
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function MemoryPage() {
  
  const memoryData = {
    used: 256, // in MB
    total: 1024, // in MB (1 GB)
  };

  const memoryPercentage = (memoryData.used / memoryData.total) * 100;

  return (
    <>
      <div className="flex flex-col items-start gap-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline flex items-center gap-3">
            <Database className="h-8 w-8 text-primary" />
            Gestión de Memoria
          </h1>
          <p className="text-sm text-muted-foreground">Monitoriza el uso de la base de datos y gestiona el conocimiento de tus asistentes.</p>
      </div>

       <div className="grid gap-6 pt-4">
        <Card>
          <CardHeader>
            <CardTitle>Uso de Memoria General (Firestore)</CardTitle>
            <CardDescription>
              Este es el espacio total estimado que ocupan los datos de todos los usuarios en la base de datos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="text-center p-6 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Espacio Utilizado</p>
                <p className="text-4xl font-bold tracking-tighter">
                  {memoryData.used} <span className="text-lg font-medium text-muted-foreground">MB</span>
                </p>
              </div>
              <Progress value={memoryPercentage} className="h-3" />
               <div className="flex justify-between text-xs text-muted-foreground">
                <span>0 MB</span>
                <span>{memoryData.total / 1024} GB</span>
              </div>
          </CardContent>
        </Card>
        
        <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Función en Desarrollo</AlertTitle>
            <AlertDescription>
                La gestión detallada de la memoria y las bases de conocimiento por asistente estará disponible próximamente.
            </AlertDescription>
        </Alert>
      </div>
    </>
  );
}
