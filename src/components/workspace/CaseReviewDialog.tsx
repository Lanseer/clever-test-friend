import { useState, useEffect } from "react";
import { CaseSourceInfo } from "./CaseSourceInfo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Check, FileText, Code, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestCase {
  id: string;
  name: string;
  bddContent: string;
  sourceDocument: string;
  status: "pending" | "accepted" | "rejected";
  rejectionReason?: string;
}

interface CaseReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cases: TestCase[];
  initialIndex: number;
  onAccept: (caseId: string) => void;
  onReject?: (caseId: string, reason: string) => void;
  onDiscard?: (caseId: string) => void;
}

const rejectionTags = [
  "场景错误",
  "步骤错误",
  "断言错误",
  "数据错误",
  "格式错误",
  "逻辑错误",
  "其他",
];

export function CaseReviewDialog({
  open,
  onOpenChange,
  cases,
  initialIndex,
  onAccept,
  onReject,
  onDiscard,
}: CaseReviewDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [editedContent, setEditedContent] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [selectedRejectionTag, setSelectedRejectionTag] = useState<string>("");
  const [rejectionReason, setRejectionReason] = useState("");

  const currentCase = cases[currentIndex];
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < cases.length - 1;

  useEffect(() => {
    if (currentCase) {
      setEditedContent(currentCase.bddContent);
    }
  }, [currentCase]);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, open]);

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

  const handleRejectConfirm = () => {
    if (selectedRejectionTag && onReject) {
      const fullReason = rejectionReason 
        ? `${selectedRejectionTag}: ${rejectionReason}` 
        : selectedRejectionTag;
      onReject(currentCase.id, fullReason);
      setShowRejectDialog(false);
      setSelectedRejectionTag("");
      setRejectionReason("");
      if (hasNext) {
        setCurrentIndex(currentIndex + 1);
      }
    }
  };

  const handleDiscardConfirm = () => {
    if (onDiscard) {
      onDiscard(currentCase.id);
      setShowDiscardDialog(false);
      if (hasNext) {
        setCurrentIndex(currentIndex + 1);
      }
    }
  };

  if (!currentCase) return null;

  return (
    <>
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
            {/* Left: Case Content - Editable */}
            <div className="flex flex-col border rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b">
                <Code className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">用例内容</span>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">用例名称</h4>
                    <p className="text-sm font-medium">{currentCase.name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">用例描述</h4>
                    <Textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="min-h-[300px] font-mono text-sm resize-none"
                      placeholder="编辑用例内容..."
                    />
                  </div>
                </div>
              </ScrollArea>
            </div>

            {/* Right: Case Source */}
            <CaseSourceInfo caseId={currentCase.id} className="flex-1" />
          </div>

          {/* Bottom Actions */}
          <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t mt-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={!hasPrevious}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                上一个
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

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDiscardDialog(true)}
                className="gap-2 text-muted-foreground hover:text-destructive hover:border-destructive"
              >
                <Trash2 className="w-4 h-4" />
                丢弃
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowRejectDialog(true)}
                className="gap-2 text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700"
              >
                <X className="w-4 h-4" />
                不采纳
              </Button>
              <Button onClick={handleAccept} className="gap-2 px-8">
                <Check className="w-4 h-4" />
                采纳
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>选择不采纳原因</AlertDialogTitle>
            <AlertDialogDescription>
              请选择一个标签来说明不采纳此用例的原因
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm font-medium mb-2">选择标签</p>
              <div className="flex flex-wrap gap-2">
                {rejectionTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={cn(
                      "cursor-pointer px-3 py-1.5 text-sm transition-colors",
                      selectedRejectionTag === tag
                        ? "bg-orange-500/10 text-orange-600 border-orange-300"
                        : "hover:bg-muted"
                    )}
                    onClick={() => setSelectedRejectionTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">详细原因（选填）</p>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="请输入不采纳的详细原因..."
                className="min-h-[80px] resize-none"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setSelectedRejectionTag("");
              setRejectionReason("");
            }}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectConfirm}
              disabled={!selectedRejectionTag}
              className="bg-orange-600 hover:bg-orange-700"
            >
              确认不采纳
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Discard Confirmation Dialog */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认丢弃</AlertDialogTitle>
            <AlertDialogDescription>
              确定要丢弃此用例吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDiscardConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              确认丢弃
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
