import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SectionHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, description, icon: Icon, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Icon className="h-6 w-6 text-primary" />
          {title}
        </h1>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      {actionLabel && (
        <Button onClick={onAction} className="shrink-0 shadow-sm cursor-pointer">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}