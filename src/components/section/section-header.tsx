import { FileSpreadsheet, LucideIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SectionHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  exportButton?: () => void;
}

export function SectionHeader({
  title,
  description,
  icon: Icon,
  actionLabel,
  onAction,
  exportButton,
}: SectionHeaderProps) {
  return (
    <div className="flex justify-between items-end">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Icon className="h-6 w-6 text-primary" />
          {title}
        </h1>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <div className="flex justify-between gap-2">
        {actionLabel && (
          <Button
            onClick={onAction}
            className="shrink-0 shadow-sm cursor-pointer flex items-center"
          >
            <Plus /> <div className="hidden md:block"> {actionLabel}</div>
          </Button>
        )}
      </div>
    </div>
  );
}
