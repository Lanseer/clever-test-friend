import { ChevronDown, ChevronRight, FileText, Eye, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CaseDetailSidebar, CaseDetailData } from "./CaseDetailSidebar";

interface TestPoint {
  id: string;
  name: string;
  caseCount: number;
}

interface Dimension {
  id: string;
  name: string;
  caseCount: number;
  testPoints: TestPoint[];
}

interface GenerationResultSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalScenarios: number;
  totalCases: number;
  dimensions: Dimension[];
  onAbandon: () => void;
  onStartReview: () => void;
}

export function GenerationResultSidebar({
  open,
  onOpenChange,
  totalScenarios,
  totalCases,
  dimensions,
  onAbandon,
  onStartReview,
}: GenerationResultSidebarProps) {
  const [expandedDimensions, setExpandedDimensions] = useState<Set<string>>(
    new Set(dimensions.map(d => d.id))
  );
  const [abandonDialogOpen, setAbandonDialogOpen] = useState(false);
  const [caseDetailOpen, setCaseDetailOpen] = useState(false);
  const [selectedCaseData, setSelectedCaseData] = useState<CaseDetailData | null>(null);

  const toggleDimension = (id: string) => {
    const newExpanded = new Set(expandedDimensions);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedDimensions(newExpanded);
  };

  const handleViewCases = (testPoint: TestPoint) => {
    setSelectedCaseData({
      id: testPoint.id,
      reviewResult: "pending",
      caseCount: testPoint.caseCount,
    });
    setCaseDetailOpen(true);
  };

  const handleAbandonConfirm = () => {
    setAbandonDialogOpen(false);
    onAbandon();
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[500px] sm:max-w-[500px] p-0 flex flex-col">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              生成结果详情
            </SheetTitle>
          </SheetHeader>

          {/* Summary */}
          <div className="px-4 py-3 border-b bg-muted/30">
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">总场景:</span>
                <Badge variant="secondary" className="font-medium">{totalScenarios}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">总用例:</span>
                <Badge variant="secondary" className="font-medium">{totalCases}</Badge>
              </div>
            </div>
          </div>

          {/* Hierarchical List */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {dimensions.map((dimension) => (
                <Collapsible
                  key={dimension.id}
                  open={expandedDimensions.has(dimension.id)}
                  onOpenChange={() => toggleDimension(dimension.id)}
                >
                  <div className="rounded-lg border bg-card overflow-hidden">
                    <CollapsibleTrigger asChild>
                      <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2">
                          {expandedDimensions.has(dimension.id) ? (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className="font-medium text-sm">{dimension.name}</span>
                        </div>
                        <Badge className="bg-primary/10 text-primary border-0">
                          {dimension.caseCount} 个用例
                        </Badge>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="border-t divide-y">
                        {dimension.testPoints.map((tp) => (
                          <div
                            key={tp.id}
                            className="px-4 py-2.5 flex items-center justify-between hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm truncate">{tp.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({tp.caseCount} 个用例)
                              </span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs gap-1 flex-shrink-0"
                              onClick={() => handleViewCases(tp)}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              查看用例
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))}
            </div>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="p-4 border-t flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setAbandonDialogOpen(true)}
            >
              <X className="w-4 h-4 mr-2" />
              放弃
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-primary to-primary/80"
              onClick={onStartReview}
            >
              开始审查
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Abandon Confirmation Dialog */}
      <AlertDialog open={abandonDialogOpen} onOpenChange={setAbandonDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认放弃</AlertDialogTitle>
            <AlertDialogDescription>
              确定要放弃本次生成数据吗？放弃后将不会在生成记录中添加本次记录。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleAbandonConfirm}
            >
              确定放弃
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Case Detail Sidebar */}
      <CaseDetailSidebar
        open={caseDetailOpen}
        onOpenChange={setCaseDetailOpen}
        caseData={selectedCaseData}
      />
    </>
  );
}
