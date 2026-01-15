import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, XCircle, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ReviewCase {
  id: string;
  code: string;
  name: string;
  status: "excellent" | "passed" | "failed";
  statusLabel: string;
  adopted: boolean;
  reason?: string;
}

interface AIReviewCasesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "excellent" | "passed" | "failed";
  cases: ReviewCase[];
  onCasesChange: (cases: ReviewCase[]) => void;
}

const typeConfig = {
  excellent: {
    title: "优秀用例",
    icon: CheckCircle,
    bgColor: "bg-green-50",
    textColor: "text-green-600",
    borderColor: "border-green-200",
  },
  passed: {
    title: "合格用例",
    icon: AlertCircle,
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    borderColor: "border-blue-200",
  },
  failed: {
    title: "不合格用例",
    icon: XCircle,
    bgColor: "bg-red-50",
    textColor: "text-red-600",
    borderColor: "border-red-200",
  },
};

export function AIReviewCasesDialog({
  open,
  onOpenChange,
  type,
  cases,
  onCasesChange,
}: AIReviewCasesDialogProps) {
  const config = typeConfig[type];
  const TypeIcon = config.icon;
  const [selectedCase, setSelectedCase] = useState<ReviewCase | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  
  const adoptedCount = cases.filter((c) => c.adopted).length;

  const handleAdopt = (caseId: string) => {
    const updatedCases = cases.map((c) =>
      c.id === caseId ? { ...c, adopted: true } : c
    );
    onCasesChange(updatedCases);
    toast.success("用例已采纳");
  };

  const handleReject = (caseId: string) => {
    const updatedCases = cases.map((c) =>
      c.id === caseId ? { ...c, adopted: false } : c
    );
    onCasesChange(updatedCases);
    toast.success("用例不采纳");
  };

  const handleBatchAdopt = () => {
    const updatedCases = cases.map((c) => ({ ...c, adopted: true }));
    onCasesChange(updatedCases);
    toast.success(`已批量采纳 ${cases.length} 个用例`);
  };

  const handleCaseClick = (caseItem: ReviewCase) => {
    setSelectedCase(caseItem);
    setDetailOpen(true);
  };

  const getAdoptionStatus = (caseItem: ReviewCase) => {
    if (caseItem.adopted === true) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
          已采纳
        </Badge>
      );
    } else if (caseItem.adopted === false) {
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
          不采纳
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
        待处理
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TypeIcon className={cn("w-5 h-5", config.textColor)} />
            {config.title}列表
            <Badge variant="secondary" className="ml-2">
              共 {cases.length} 个
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between py-3 border-b">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>已采纳: <span className="font-medium text-green-600">{adoptedCount}</span></span>
            <span>待处理: <span className="font-medium text-amber-600">{cases.length - adoptedCount}</span></span>
          </div>
          <Button 
            size="sm" 
            onClick={handleBatchAdopt}
            className="gap-1"
          >
            <Check className="w-4 h-4" />
            批量采纳
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="rounded-lg border overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
              <div className="col-span-2">编号</div>
              <div className="col-span-5">用例名称</div>
              <div className="col-span-2">采纳状态</div>
              <div className="col-span-3">操作</div>
            </div>

            <div className="divide-y max-h-[400px] overflow-y-auto">
              {cases.map((caseItem, index) => (
                <div
                  key={caseItem.id}
                  className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-muted/30 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="col-span-2 flex items-center">
                    <Badge variant="outline" className="font-mono text-xs">
                      {caseItem.code}
                    </Badge>
                  </div>
                  <div className="col-span-5 flex items-center">
                    <div>
                      <button
                        className="font-medium text-foreground text-sm hover:text-primary hover:underline text-left"
                        onClick={() => handleCaseClick(caseItem)}
                      >
                        {caseItem.name}
                      </button>
                      {caseItem.reason && (
                        <p className="text-xs text-muted-foreground mt-0.5">{caseItem.reason}</p>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center">
                    {getAdoptionStatus(caseItem)}
                  </div>
                  <div className="col-span-3 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => handleAdopt(caseItem.id)}
                      disabled={caseItem.adopted === true}
                    >
                      <Check className="w-3.5 h-3.5" />
                      采纳
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs gap-1 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                      onClick={() => handleReject(caseItem.id)}
                      disabled={caseItem.adopted === false}
                    >
                      <X className="w-3.5 h-3.5" />
                      不采纳
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Case Detail Dialog */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                用例详情
                {selectedCase && (
                  <Badge variant="outline" className="font-mono text-xs">
                    {selectedCase.code}
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>
            {selectedCase && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">用例名称</label>
                    <p className="mt-1 text-sm">{selectedCase.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">评审状态</label>
                    <div className="mt-1">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          selectedCase.status === "excellent" && "bg-green-50 text-green-600 border-green-200",
                          selectedCase.status === "passed" && "bg-blue-50 text-blue-600 border-blue-200",
                          selectedCase.status === "failed" && "bg-red-50 text-red-600 border-red-200"
                        )}
                      >
                        {selectedCase.statusLabel}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">采纳状态</label>
                    <div className="mt-1">
                      {getAdoptionStatus(selectedCase)}
                    </div>
                  </div>
                </div>
                {selectedCase.reason && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">评审意见</label>
                    <p className="mt-1 text-sm bg-muted/50 p-3 rounded-lg">{selectedCase.reason}</p>
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      handleReject(selectedCase.id);
                      setDetailOpen(false);
                    }}
                    disabled={selectedCase.adopted === false}
                  >
                    <X className="w-4 h-4" />
                    不采纳
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1"
                    onClick={() => {
                      handleAdopt(selectedCase.id);
                      setDetailOpen(false);
                    }}
                    disabled={selectedCase.adopted === true}
                  >
                    <Check className="w-4 h-4" />
                    采纳
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
