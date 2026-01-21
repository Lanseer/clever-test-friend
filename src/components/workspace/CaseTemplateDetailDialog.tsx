import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CaseTemplate {
  id: string;
  name: string;
  type: string;
  modifier: string;
  updateTime: string;
  format: string;
  example: string;
}

interface CaseTemplateDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: CaseTemplate | null;
}

const typeConfig: Record<string, { label: string; className: string }> = {
  BDD: { label: "BDD", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  API: { label: "API", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  UI: { label: "UI", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  Performance: { label: "性能", className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
};

export function CaseTemplateDetailDialog({
  open,
  onOpenChange,
  template,
}: CaseTemplateDetailDialogProps) {
  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="text-xl">{template.name}</DialogTitle>
            <Badge variant="secondary" className={typeConfig[template.type]?.className}>
              {typeConfig[template.type]?.label || template.type}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            修改人: {template.modifier} · 更新时间: {template.updateTime}
          </p>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">规范格式</h4>
            <ScrollArea className="h-[400px] rounded-lg border bg-muted/30 p-4">
              <pre className="text-sm font-mono whitespace-pre-wrap text-foreground">
                {template.format}
              </pre>
            </ScrollArea>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">示例</h4>
            <ScrollArea className="h-[400px] rounded-lg border bg-muted/30 p-4">
              <pre className="text-sm font-mono whitespace-pre-wrap text-foreground">
                {template.example}
              </pre>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
