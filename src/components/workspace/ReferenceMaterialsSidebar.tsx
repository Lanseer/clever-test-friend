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
  "基线文档": "bg-blue-500/10 text-blue-600 border-blue-200",
  "行业标准": "bg-purple-500/10 text-purple-600 border-purple-200",
  "需求文档": "bg-green-500/10 text-green-600 border-green-200",
  "测试规范": "bg-amber-500/10 text-amber-600 border-amber-200",
  "接口文档": "bg-cyan-500/10 text-cyan-600 border-cyan-200",
};

// Mock: lines that are "covered" (formed into outline) - by line index
const coveredLineIndices: Record<string, number[]> = {
  "ref-1": [3, 4, 5, 7, 8, 9, 12, 13],
  "ref-2": [5, 6, 8, 9, 10, 11],
  "ref-3": [4, 5, 6, 8, 9, 10, 13, 14],
  "ref-4": [3, 4, 5, 7, 8],
  "ref-5": [2, 3, 5, 6, 7],
};

// Mock: outline numbers for covered lines
const outlineNumbers: Record<string, Record<number, string>> = {
  "ref-1": { 3: "AC-SF-001", 4: "AC-SF-001", 5: "AC-SF-002", 7: "AC-SF-002", 8: "AS-FG-001", 9: "AS-FG-001", 12: "SF-002", 13: "SF-002" },
  "ref-2": { 5: "TC-001", 6: "TC-001", 8: "TC-002", 9: "TC-002", 10: "TC-003", 11: "TC-003" },
  "ref-3": { 4: "AC-SF-003", 5: "AC-SF-003", 6: "AC-SF-004", 8: "AS-FG-002", 9: "AS-FG-002", 10: "AS-FG-003", 13: "SF-003", 14: "SF-003" },
  "ref-4": { 3: "TC-004", 4: "TC-004", 5: "TC-005", 7: "TC-005", 8: "TC-006" },
  "ref-5": { 2: "API-001", 3: "API-001", 5: "API-002", 6: "API-002", 7: "API-003" },
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

  const lines = material.content.split('\n');
  const covered = coveredLineIndices[material.id] || [];
  const outlines = outlineNumbers[material.id] || {};

  // Compute coverage for this document
  const nonEmptyLines = lines.filter((l) => l.trim().length > 0);
  const coveredCount = covered.filter((i) => i < lines.length && lines[i]?.trim().length > 0).length;
  const coveragePercent = nonEmptyLines.length > 0 ? Math.round((coveredCount / nonEmptyLines.length) * 100) : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:max-w-[600px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {material.name}
          </SheetTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={colorClass}>
              {displayType}
            </Badge>
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
              覆盖率 {coveragePercent}%
            </Badge>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 pr-4 mt-6">
          <div className="space-y-0">
            {lines.map((line, idx) => {
              const isCovered = covered.includes(idx);
              const outlineNum = outlines[idx];
              // Show outline number only on first occurrence
              const prevOutline = idx > 0 ? outlines[idx - 1] : undefined;
              const showOutline = outlineNum && outlineNum !== prevOutline;

              return (
                <div
                  key={idx}
                  className={`flex items-start gap-2 px-3 py-0.5 text-sm font-sans ${
                    isCovered ? "bg-green-500/15 border-l-2 border-green-500" : ""
                  }`}
                >
                  <span className="flex-1 whitespace-pre-wrap">
                    {isCovered && showOutline && (
                      <span className="text-xs font-mono text-green-700 bg-green-500/20 px-1 py-0.5 rounded mr-1.5">
                        {outlineNum}
                      </span>
                    )}
                    {line || '\u00A0'}
                  </span>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
