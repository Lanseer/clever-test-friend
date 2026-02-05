import { useTranslation } from "react-i18next";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export interface ReferenceMaterial {
  id: string;
  name: string;
  type: "基线文档" | "行业标准" | "需求文档" | "测试规范" | "接口文档";
  typeKey?: string;
  content: string;
}

interface ReferenceMaterialsSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: ReferenceMaterial | null;
}

const typeColorMap: Record<string, string> = {
  "baselineDoc": "bg-blue-500/10 text-blue-600 border-blue-200",
  "industryStandard": "bg-purple-500/10 text-purple-600 border-purple-200",
  "requirementDoc": "bg-green-500/10 text-green-600 border-green-200",
  "testSpec": "bg-amber-500/10 text-amber-600 border-amber-200",
  "apiDoc": "bg-cyan-500/10 text-cyan-600 border-cyan-200",
  // Fallback for legacy type values
  "基线文档": "bg-blue-500/10 text-blue-600 border-blue-200",
  "行业标准": "bg-purple-500/10 text-purple-600 border-purple-200",
  "需求文档": "bg-green-500/10 text-green-600 border-green-200",
  "测试规范": "bg-amber-500/10 text-amber-600 border-amber-200",
  "接口文档": "bg-cyan-500/10 text-cyan-600 border-cyan-200",
};

export function ReferenceMaterialsSidebar({
  open,
  onOpenChange,
  material,
}: ReferenceMaterialsSidebarProps) {
  const { t } = useTranslation();
  
  if (!material) return null;

  const typeKey = material.typeKey || material.type;
  const displayType = material.typeKey ? t(`referenceMaterials.${material.typeKey}`) : material.type;
  const colorClass = typeColorMap[typeKey] || "bg-muted text-muted-foreground";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[560px] sm:max-w-[560px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {material.name}
          </SheetTitle>
          <Badge
            variant="outline"
            className={colorClass}
          >
            {displayType}
          </Badge>
        </SheetHeader>

        <ScrollArea className="flex-1 pr-4 mt-6">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm text-foreground bg-muted/50 p-4 rounded-lg">
              {material.content}
            </pre>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
