import { useState } from "react";
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
import { CheckCircle, AlertCircle, XCircle, Check, X, FileText, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CaseSourceInfo } from "./CaseSourceInfo";

interface ReviewCase {
  id: string;
  code: string;
  name: string;
  status: "excellent" | "passed" | "failed";
  statusLabel: string;
  adopted: boolean;
  reason?: string;
  bddContent?: string;
  sourceDocument?: string;
  batchCode?: string;
  nature?: "positive" | "negative";
  createdAt?: string;
  outline?: string;
  scenario?: string;
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

const rejectionTags = [
  "场景错误",
  "步骤错误",
  "断言错误",
  "数据错误",
  "格式错误",
  "逻辑错误",
  "其他",
];

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [detailOpen, setDetailOpen] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [selectedRejectionTag, setSelectedRejectionTag] = useState<string>("");
  const [rejectionReason, setRejectionReason] = useState("");
  
  const adoptedCount = cases.filter((c) => c.adopted).length;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < cases.length - 1;

  const handlePrevious = () => {
    if (hasPrevious) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setSelectedCase(cases[newIndex]);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setSelectedCase(cases[newIndex]);
    }
  };

  const handleAdopt = (caseId: string) => {
    const updatedCases = cases.map((c) =>
      c.id === caseId ? { ...c, adopted: true } : c
    );
    onCasesChange(updatedCases);
    toast.success("用例已采纳");
    setDetailOpen(false);
  };

  const handleReject = (caseId: string) => {
    const updatedCases = cases.map((c) =>
      c.id === caseId ? { ...c, adopted: false } : c
    );
    onCasesChange(updatedCases);
    toast.success("用例不采纳");
  };

  const handleRejectConfirm = () => {
    if (selectedCase && selectedRejectionTag) {
      handleReject(selectedCase.id);
      setShowRejectDialog(false);
      setSelectedRejectionTag("");
      setRejectionReason("");
      setDetailOpen(false);
    }
  };

  const handleDiscard = (caseId: string) => {
    const updatedCases = cases.filter((c) => c.id !== caseId);
    onCasesChange(updatedCases);
    toast.success("用例已丢弃");
    setShowDiscardDialog(false);
    setDetailOpen(false);
  };

  const handleBatchAdopt = () => {
    const updatedCases = cases.map((c) => ({ ...c, adopted: true }));
    onCasesChange(updatedCases);
    toast.success(`已批量采纳 ${cases.length} 个用例`);
  };

  const handleCaseClick = (caseItem: ReviewCase, index: number) => {
    setSelectedCase(caseItem);
    setCurrentIndex(index);
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

  // Mock BDD content and source document for demo
  const getMockBddContent = (caseItem: ReviewCase) => {
    return caseItem.bddContent || `Feature: ${caseItem.name}

  Scenario: 验证${caseItem.name}功能
    Given 用户已登录系统
    And 用户具有相应权限
    When 用户执行${caseItem.name}操作
    Then 系统应正确响应
    And 数据应正确更新`;
  };

  const getMockSourceDocument = (caseItem: ReviewCase) => {
    return caseItem.sourceDocument || `<div class="space-y-4">
      <h3 class="font-semibold">需求文档摘要</h3>
      <p>本文档描述了<strong>${caseItem.name}</strong>的相关业务需求。</p>
      <h4 class="font-medium mt-4">功能要求</h4>
      <ul class="list-disc pl-5 space-y-1">
        <li>系统应支持用户进行相关操作</li>
        <li>操作完成后应给予明确反馈</li>
        <li>异常情况应有合理的错误处理</li>
      </ul>
      <h4 class="font-medium mt-4">验收标准</h4>
      <ul class="list-disc pl-5 space-y-1">
        <li>功能符合业务需求描述</li>
        <li>界面交互符合设计规范</li>
        <li>性能满足预期要求</li>
      </ul>
    </div>`;
  };

  return (
    <>
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

          <div className="py-3 border-b flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              共 <span className="font-medium text-foreground">{cases.length}</span> 个用例
            </span>
            {(type === "excellent" || type === "passed") && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleBatchAdopt}
                className="gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                批量采纳
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
                    <div className="col-span-1">批次</div>
                    <div className="col-span-2">编号</div>
                    <div className="col-span-3">大纲</div>
                    <div className="col-span-3">场景</div>
                    <div className="col-span-3">创建时间</div>
                  </div>

                  <div className="divide-y max-h-[400px] overflow-y-auto">
                    {cases.map((caseItem, index) => (
                      <div
                        key={caseItem.id}
                        className="grid grid-cols-12 gap-2 px-4 py-3 hover:bg-muted/30 transition-colors animate-fade-in"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <div className="col-span-1 flex items-center">
                          <span className="text-xs text-muted-foreground">
                            {caseItem.batchCode || "B001"}
                          </span>
                        </div>
                        <div className="col-span-2 flex items-center">
                          <Badge variant="outline" className="font-mono text-xs">
                            {caseItem.code}
                          </Badge>
                        </div>
                        <div className="col-span-3 flex items-center">
                          <span className="text-sm text-muted-foreground truncate" title={caseItem.outline || "用户管理"}>
                            {caseItem.outline || "用户管理"}
                          </span>
                        </div>
                        <div className="col-span-3 flex items-center">
                          <button
                            className="font-medium text-sm text-primary hover:underline text-left truncate"
                            onClick={() => handleCaseClick(caseItem, index)}
                            title={caseItem.scenario || caseItem.name}
                          >
                            {caseItem.scenario || caseItem.name}
                          </button>
                        </div>
                        <div className="col-span-3 flex items-center text-sm text-muted-foreground">
                          {caseItem.createdAt || "2024-01-15 14:30"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Case Detail Dialog - renamed to 场景详情 */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-5xl h-[70vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span>场景详情</span>
                {selectedCase && (
                  <Badge variant="outline" className="font-mono">
                    {selectedCase.code}
                  </Badge>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedCase && (
            <>
              <div className="flex-1 grid grid-cols-2 gap-4 min-h-0 mt-4">
                {/* Left: Scenario Content */}
                <div className="flex flex-col border rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">场景信息</span>
                  </div>
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">场景描述</h4>
                        <Textarea
                          value={selectedCase.scenario || selectedCase.name}
                          readOnly
                          className="min-h-[120px] text-sm resize-none bg-muted/30"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">智能评分</h4>
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
                        {selectedCase.reason && (
                          <p className="text-sm text-muted-foreground mt-2">{selectedCase.reason}</p>
                        )}
                      </div>
                    </div>
                  </ScrollArea>
                </div>

                {/* Right: Scenario Source */}
                <div className="flex flex-col border rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">场景来源</span>
                  </div>
                  <ScrollArea className="flex-1">
                    <CaseSourceInfo caseId={selectedCase.id} showHeader={false} className="border-0" />
                  </ScrollArea>
                </div>
              </div>

              {/* Bottom Navigation */}
              <div className="flex-shrink-0 flex items-center justify-center pt-4 border-t mt-4">
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
                  <span className="text-sm text-muted-foreground mx-2">
                    {currentIndex + 1} / {cases.length}
                  </span>
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
              </div>
            </>
          )}
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
              onClick={() => selectedCase && handleDiscard(selectedCase.id)}
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
