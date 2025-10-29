
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";

export default function MemoryPage() {
  return (
    <>
      <div className="flex flex-col items-start gap-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline flex items-center gap-3">
            <Database className="h-8 w-8 text-primary" />
            Memory Management
          </h1>
          <p className="text-sm text-muted-foreground">Manage your assistants' knowledge base and memory.</p>
      </div>

       <div className="grid gap-4 md:gap-6 pt-4">
        <Card>
          <CardHeader>
            <CardTitle>Memory Configuration</CardTitle>
            <CardDescription>
              This section will allow you to configure and manage the data sources for your assistants.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
