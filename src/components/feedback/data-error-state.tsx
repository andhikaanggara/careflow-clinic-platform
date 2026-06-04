import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface IDataErrorState {
  title: string;
  message: string;
  tableName: string;
  columns: string[];
}

export function DataErrorState({
  title,
  message,
  tableName,
  columns,
}: IDataErrorState) {
  return (
    <div className="container mx-auto max-w-4xl p-8 space-y-6">
      <Alert variant={"destructive"}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Gagal Memuat{title}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
      <div className="rounded-lg bg-muted/50 p-6 border text-sm">
        <p className="text-muted-foreground mb-4">
          Pastikan tabel{" "}
          <code className="bg-background px-2 py-0.5 rounded border font-mono">
            {tableName}
          </code>{" "}
          memiliki kolom berikut:
        </p>
        <div className="flex flex-wrap gap-2">
          {columns.map((col) => (
            <code
              key={col}
              className="bg-background px-2 py-0.5 rounded border text-xs font-mono"
            >
              {col}
            </code>
          ))}
        </div>
      </div>
    </div>
  );
}
