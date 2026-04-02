import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Send, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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

type FilterMode = "all" | "covered" | "uncovered" | "noNeed";

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

// Mock: lines that are "no need to cover"
const noNeedLineIndices: Record<string, number[]> = {
  "ref-1": [0, 1, 15],
  "ref-2": [0, 1, 2],
  "ref-3": [0, 1, 2],
  "ref-4": [0, 1],
  "ref-5": [0, 1],
};

// Mock: outline numbers for covered lines
const outlineNumbers: Record<string, Record<number, string>> = {
  "ref-1": { 3: "AC-SF-001", 4: "AC-SF-001", 5: "AC-SF-002", 7: "AC-SF-002", 8: "AS-FG-001", 9: "AS-FG-001", 12: "SF-002", 13: "SF-002" },
  "ref-2": { 5: "TC-001", 6: "TC-001", 8: "TC-002", 9: "TC-002", 10: "TC-003", 11: "TC-003" },
  "ref-3": { 4: "AC-SF-003", 5: "AC-SF-003", 6: "AC-SF-004", 8: "AS-FG-002", 9: "AS-FG-002", 10: "AS-FG-003", 13: "SF-003", 14: "SF-003" },
  "ref-4": { 3: "TC-004", 4: "TC-004", 5: "TC-005", 7: "TC-005", 8: "TC-006" },
  "ref-5": { 2: "API-001", 3: "API-001", 5: "API-002", 6: "API-002", 7: "API-003" },
};

// Chat dialog for supplementing cases
function SupplementCasesDialog({
  open,
  onOpenChange,
  selectedLines,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLines: string[];
}) {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [initialized, setInitialized] = useState(false);

  // Initialize with selected content as prompt
  if (open && !initialized && selectedLines.length > 0) {
    const prompt = `请根据以下未覆盖的需求条目补充测试案例：\n\n${selectedLines.map((l, i) => `${i + 1}. ${l}`).join("\n")}`;
    setMessages([
      { role: "user", content: prompt },
      { role: "assistant", content: "好的，我已收到未覆盖的需求条目，正在为您分析并生成补充测试案例...\n\n根据您提供的需求条目，我建议补充以下测试案例：\n\n1. **边界值验证案例** - 针对输入参数的边界条件进行测试\n2. **异常流程案例** - 覆盖异常和错误处理路径\n3. **兼容性验证案例** - 验证不同环境下的功能表现\n\n需要我详细展开某个案例的设计吗？" },
    ]);
    setInitialized(true);
  }

  const handleClose = (v: boolean) => {
    if (!v) {
      setMessages([]);
      setInitialized(false);
      setInputValue("");
    }
    onOpenChange(v);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: inputValue }]);
    setInputValue("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "我已收到您的补充说明，正在为您优化案例设计..." },
      ]);
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl h-[70vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>补充案例</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 pb-4">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="输入补充说明..."
              className="flex-1 text-sm"
            />
            <Button size="icon" onClick={handleSend} disabled={!inputValue.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ReferenceMaterialsSidebar({
  open,
  onOpenChange,
  material,
}: ReferenceMaterialsSidebarProps) {
  const { t } = useTranslation();
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [selectedUncoveredLines, setSelectedUncoveredLines] = useState<Set<number>>(new Set());
  const [supplementDialogOpen, setSupplementDialogOpen] = useState(false);

  const typeKey = material?.typeKey || material?.type || "";
  const displayType = material?.typeKey ? t(`referenceMaterials.${material.typeKey}`) : (material?.type || "");
  const colorClass = typeColorMap[typeKey] || "bg-muted text-muted-foreground";

  const lines = useMemo(() => material?.content.split('\n') || [], [material?.content]);
  const covered = material ? (coveredLineIndices[material.id] || []) : [];
  const noNeed = material ? (noNeedLineIndices[material.id] || []) : [];
  const outlines = material ? (outlineNumbers[material.id] || {}) : {};

  // Filter lines based on mode
  const filteredLines = useMemo(() => {
    return lines.map((line, idx) => {
      const status: "covered" | "uncovered" | "noNeed" = 
        covered.includes(idx) ? "covered" : noNeed.includes(idx) ? "noNeed" : "uncovered";
      return { line, idx, status };
    }).filter(({ status }) => {
      if (filterMode === "all") return true;
      return status === filterMode;
    });
  }, [lines, filterMode, covered, noNeed]);

  // Uncovered non-empty lines for selection
  const uncoveredNonEmptyLines = useMemo(() => {
    return filteredLines.filter(l => l.status === "uncovered" && l.line.trim().length > 0);
  }, [filteredLines]);

  if (!material) return null;

  const allUncoveredSelected = uncoveredNonEmptyLines.length > 0 && 
    uncoveredNonEmptyLines.every(l => selectedUncoveredLines.has(l.idx));

  const toggleLine = (idx: number) => {
    setSelectedUncoveredLines(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const toggleAll = () => {
    if (allUncoveredSelected) {
      setSelectedUncoveredLines(new Set());
    } else {
      setSelectedUncoveredLines(new Set(uncoveredNonEmptyLines.map(l => l.idx)));
    }
  };

  const handleOpenSupplement = () => {
    setSupplementDialogOpen(true);
  };

  const selectedLineTexts = Array.from(selectedUncoveredLines)
    .sort((a, b) => a - b)
    .map(idx => lines[idx])
    .filter(l => l && l.trim().length > 0);

  // Coverage stats
  const nonEmptyLines = lines.filter(l => l.trim().length > 0);
  const coveredCount = covered.filter(i => i < lines.length && lines[i]?.trim().length > 0).length;
  const coveragePercent = nonEmptyLines.length > 0 ? Math.round((coveredCount / nonEmptyLines.length) * 100) : 0;

  const filterButtons: { mode: FilterMode; label: string }[] = [
    { mode: "all", label: "全部" },
    { mode: "covered", label: "已覆盖" },
    { mode: "uncovered", label: "未覆盖" },
    { mode: "noNeed", label: "无需覆盖" },
  ];

  const handleDialogChange = (v: boolean) => {
    if (!v) {
      setFilterMode("all");
      setSelectedUncoveredLines(new Set());
    }
    onOpenChange(v);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
              {material.name}
              <Badge variant="outline" className={colorClass}>
                {displayType}
              </Badge>
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                覆盖率 {coveragePercent}%
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {/* Filter buttons row */}
          <div className="flex items-center justify-between px-6 pb-2">
            <div className="flex items-center gap-1">
              {filterButtons.map(({ mode, label }) => (
                <Button
                  key={mode}
                  variant={filterMode === mode ? "default" : "outline"}
                  size="sm"
                  className="h-7 px-3 text-xs"
                  onClick={() => {
                    setFilterMode(mode);
                    setSelectedUncoveredLines(new Set());
                  }}
                >
                  {label}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {filterMode === "uncovered" && (
                <>
                  <div className="flex items-center gap-1.5">
                    <Checkbox
                      checked={allUncoveredSelected}
                      onCheckedChange={toggleAll}
                      className="h-3.5 w-3.5"
                    />
                    <span className="text-xs text-muted-foreground">全选</span>
                  </div>
                  <Button
                    size="sm"
                    className="h-7 px-3 text-xs gap-1"
                    disabled={selectedUncoveredLines.size === 0}
                    onClick={handleOpenSupplement}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    补充案例
                  </Button>
                </>
              )}
            </div>
          </div>

          <ScrollArea className="flex-1 px-6 pb-4">
            <div className="space-y-0">
              {filteredLines.map(({ line, idx, status }) => {
                const outlineNum = outlines[idx];
                const prevOutline = idx > 0 ? outlines[idx - 1] : undefined;
                const showOutline = outlineNum && outlineNum !== prevOutline;
                const isNonEmpty = line.trim().length > 0;

                return (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-start gap-2 px-3 py-0.5 text-sm font-sans",
                      status === "covered" && "bg-green-500/15 border-l-2 border-green-500",
                      status === "uncovered" && isNonEmpty && "bg-amber-500/10 border-l-2 border-amber-400",
                      status === "noNeed" && isNonEmpty && "bg-muted/50 border-l-2 border-muted-foreground/30",
                    )}
                  >
                    {filterMode === "uncovered" && status === "uncovered" && isNonEmpty && (
                      <Checkbox
                        checked={selectedUncoveredLines.has(idx)}
                        onCheckedChange={() => toggleLine(idx)}
                        className="mt-0.5 h-3.5 w-3.5 shrink-0"
                      />
                    )}
                    <span className="flex-1 whitespace-pre-wrap">
                      {status === "covered" && showOutline && (
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
        </DialogContent>
      </Dialog>

      <SupplementCasesDialog
        open={supplementDialogOpen}
        onOpenChange={setSupplementDialogOpen}
        selectedLines={selectedLineTexts}
      />
    </>
  );
}
