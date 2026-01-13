import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, Check, FileText, Code } from "lucide-react";

interface TestCase {
  id: string;
  name: string;
  bddContent: string;
  sourceDocument: string;
  status: "pending" | "accepted" | "rejected";
}

interface CaseReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cases: TestCase[];
  initialIndex: number;
  onAccept: (caseId: string) => void;
}

export function CaseReviewDialog({
  open,
  onOpenChange,
  cases,
  initialIndex,
  onAccept,
}: CaseReviewDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const currentCase = cases[currentIndex];
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < cases.length - 1;

  const handlePrevious = () => {
    if (hasPrevious) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleAccept = () => {
    onAccept(currentCase.id);
    if (hasNext) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (!currentCase) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span>用例评审</span>
              <Badge variant="outline" className="font-mono">
                {currentIndex + 1} / {cases.length}
              </Badge>
            </div>
            <Badge
              variant="outline"
              className={
                currentCase.status === "accepted"
                  ? "bg-green-500/10 text-green-600 border-green-200"
                  : currentCase.status === "rejected"
                  ? "bg-red-500/10 text-red-600 border-red-200"
                  : "bg-amber-500/10 text-amber-600 border-amber-200"
              }
            >
              {currentCase.status === "accepted"
                ? "已采纳"
                : currentCase.status === "rejected"
                ? "已拒绝"
                : "待评审"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-2 gap-4 min-h-0 mt-4">
          {/* Left: BDD Content */}
          <div className="flex flex-col border rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b">
              <Code className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">BDD 用例内容</span>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">用例名称</h4>
                  <p className="text-sm font-medium">{currentCase.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">BDD 描述</h4>
                  <pre className="text-sm bg-muted/50 p-4 rounded-lg whitespace-pre-wrap font-mono">
                    {currentCase.bddContent}
                  </pre>
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Right: Source Document */}
          <div className="flex flex-col border rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b">
              <FileText className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">来源文档内容</span>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="prose prose-sm max-w-none">
                <div
                  className="text-sm"
                  dangerouslySetInnerHTML={{ __html: currentCase.sourceDocument }}
                />
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t mt-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={!hasPrevious}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            上一个
          </Button>

          <Button onClick={handleAccept} className="gap-2 px-8">
            <Check className="w-4 h-4" />
            采纳
          </Button>

          <Button
            variant="outline"
            onClick={handleNext}
            disabled={!hasNext}
            className="gap-2"
          >
            下一个
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
