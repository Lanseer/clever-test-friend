import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Sparkles, FileText, Calendar, CheckCircle, AlertCircle, XCircle, Clock, Loader2, AlertTriangle, RotateCcw, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AIReviewSummarySidebar } from "@/components/workspace/AIReviewSummarySidebar";
import { AIReviewCasesDialog } from "@/components/workspace/AIReviewCasesDialog";
import { SmartReviewSelectDialog } from "@/components/workspace/SmartReviewSelectDialog";
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
import { toast } from "sonner";

type ReviewProgress = "completed" | "in_progress" | "failed";

interface AIReviewRecord {
  id: string;
  code: string;
  startTime: string;
  endTime: string | null;
  progress: ReviewProgress;
  failureReason?: string;
  totalCases: number;
  excellentCases: number;
  passedCases: number;
  failedCases: number;
  summary: string;
}

const mockReviewRecords: AIReviewRecord[] = [
  {
    id: "1",
    code: "AIR-001",
    startTime: "2024-01-15 14:30",
    endTime: "2024-01-15 14:35",
    progress: "completed",
    totalCases: 24,
    excellentCases: 8,
    passedCases: 12,
    failedCases: 4,
    summary: `**AI评审总结报告**

本次AI评审共涉及24个测试用例，评审结果如下：

**优秀用例 (8个)**
- 用例设计完整，覆盖正向和异常场景
- BDD描述规范清晰
- 测试步骤可执行性强

**合格用例 (12个)**
- 基本满足测试需求
- 部分用例可优化描述
- 建议补充边界条件

**不合格用例 (4个)**
- 主要问题：场景描述不完整
- 缺少必要的前置条件
- 需要重新生成或人工修改`,
  },
  {
    id: "2",
    code: "AIR-002",
    startTime: "2024-01-14 10:15",
    endTime: "2024-01-14 10:18",
    progress: "completed",
    totalCases: 18,
    excellentCases: 10,
    passedCases: 6,
    failedCases: 2,
    summary: `**AI评审总结报告**

本次评审结果良好，整体质量较高。

**优秀用例 (10个)**
- 场景覆盖全面
- 测试数据设计合理

**合格用例 (6个)**
- 满足基本测试要求

**不合格用例 (2个)**
- 需要补充异常处理场景`,
  },
  {
    id: "3",
    code: "AIR-003",
    startTime: "2024-01-13 16:45",
    endTime: null,
    progress: "in_progress",
    totalCases: 30,
    excellentCases: 0,
    passedCases: 0,
    failedCases: 0,
    summary: "",
  },
  {
    id: "4",
    code: "AIR-004",
    startTime: "2024-01-12 09:30",
    endTime: "2024-01-12 09:32",
    progress: "failed",
    failureReason: "AI模型响应超时，请稍后重试或联系管理员检查服务状态。",
    totalCases: 15,
    excellentCases: 0,
    passedCases: 0,
    failedCases: 0,
    summary: "",
  },
];

// Mock case data for each category
const generateMockCases = (count: number, type: "excellent" | "passed" | "failed") => {
  const statusLabels = {
    excellent: "优秀",
    passed: "合格", 
    failed: "不合格",
  };
  
  const outlines = ["用户管理", "订单管理", "商品管理", "支付流程", "报表统计"];
  const scenarios = ["用户登录验证", "订单创建流程", "商品上架审核", "支付成功回调", "数据导出功能"];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `${type}-${i + 1}`,
    code: `TC-${String(i + 1).padStart(3, "0")}`,
    name: `${type === "excellent" ? "完整覆盖" : type === "passed" ? "基础验证" : "待完善"} - 测试场景${i + 1}`,
    status: type,
    statusLabel: statusLabels[type],
    adopted: false,
    reason: type === "failed" ? "场景描述不完整，缺少边界条件" : undefined,
    batchCode: `B00${Math.floor(i / 3) + 1}`,
    nature: (i % 2 === 0 ? "positive" : "negative") as "positive" | "negative",
    createdAt: `2024-01-${15 - Math.floor(i / 2)} ${10 + i}:30`,
    outline: outlines[i % outlines.length],
    scenario: scenarios[i % scenarios.length],
  }));
};

const progressConfig: Record<ReviewProgress, { label: string; icon: typeof CheckCircle; className: string }> = {
  completed: {
    label: "已完成",
    icon: CheckCircle,
    className: "bg-green-50 text-green-600 border-green-200",
  },
  in_progress: {
    label: "进行中",
    icon: Loader2,
    className: "bg-blue-50 text-blue-600 border-blue-200",
  },
  failed: {
    label: "失败",
    icon: XCircle,
    className: "bg-red-50 text-red-600 border-red-200",
  },
};

export default function AIReview() {
  const navigate = useNavigate();
  const { workspaceId, recordId, batchId } = useParams();
  const [records, setRecords] = useState(mockReviewRecords);
  const [summarySidebarOpen, setSummarySidebarOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AIReviewRecord | null>(null);
  const [casesDialogOpen, setCasesDialogOpen] = useState(false);
  const [casesDialogType, setCasesDialogType] = useState<"excellent" | "passed" | "failed">("excellent");
  const [dialogCases, setDialogCases] = useState<any[]>([]);
  const [selectDialogOpen, setSelectDialogOpen] = useState(false);
  const [failureDialogOpen, setFailureDialogOpen] = useState(false);
  const [failureRecord, setFailureRecord] = useState<AIReviewRecord | null>(null);

  const handleOpenSummary = (record: AIReviewRecord) => {
    setSelectedRecord(record);
    setSummarySidebarOpen(true);
  };

  const handleOpenCasesDialog = (record: AIReviewRecord, type: "excellent" | "passed" | "failed") => {
    const count = type === "excellent" ? record.excellentCases : type === "passed" ? record.passedCases : record.failedCases;
    setDialogCases(generateMockCases(count, type));
    setCasesDialogType(type);
    setSelectedRecord(record);
    setCasesDialogOpen(true);
  };

  const handleNewSmartReview = () => {
    setSelectDialogOpen(true);
  };

  const handleConfirmReview = (selectedCaseIds: string[]) => {
    // Create a new review record
    const newRecord: AIReviewRecord = {
      id: `${records.length + 1}`,
      code: `AIR-${String(records.length + 1).padStart(3, "0")}`,
      startTime: new Date().toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).replace(/\//g, "-"),
      endTime: null,
      progress: "in_progress",
      totalCases: selectedCaseIds.length,
      excellentCases: 0,
      passedCases: 0,
      failedCases: 0,
      summary: "",
    };
    
    setRecords([newRecord, ...records]);
    toast.success("智能审查任务已开始！");
  };

  const handleViewFailure = (record: AIReviewRecord) => {
    setFailureRecord(record);
    setFailureDialogOpen(true);
  };

  const handleRetry = (record: AIReviewRecord) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === record.id
          ? { ...r, progress: "in_progress" as ReviewProgress, startTime: new Date().toLocaleString("zh-CN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }).replace(/\//g, "-"), endTime: null, failureReason: undefined }
          : r
      )
    );
    toast.success("智能审查任务已重新开始！");
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/workspace/${workspaceId}/management/ai-cases/${recordId}/batch/${batchId}/review`)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">智能审查</h1>
          <p className="text-muted-foreground mt-1">
            AI智能审查记录列表
          </p>
        </div>
        <Button onClick={handleNewSmartReview} className="gap-2">
          <Sparkles className="w-4 h-4" />
          智能审查
        </Button>
      </div>

      {/* Review Records Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            <div className="grid grid-cols-12 gap-2 px-6 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
              <div className="col-span-1">编号</div>
              <div className="col-span-1">进度</div>
              <div className="col-span-2">开始时间</div>
              <div className="col-span-2">结束时间</div>
              <div className="col-span-1">总用例数</div>
              <div className="col-span-1">优秀</div>
              <div className="col-span-1">合格</div>
              <div className="col-span-1">不合格</div>
              <div className="col-span-2">操作</div>
            </div>

            <div className="divide-y">
              {records.map((record, index) => {
                const progressInfo = progressConfig[record.progress];
                const ProgressIcon = progressInfo.icon;
                
                return (
                  <div
                    key={record.id}
                    className="grid grid-cols-12 gap-2 px-6 py-4 hover:bg-muted/30 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="col-span-1 flex items-center">
                      <Badge variant="outline" className="font-mono text-xs">
                        {record.code}
                      </Badge>
                    </div>
                    <div className="col-span-1 flex items-center">
                      <Badge variant="outline" className={`gap-1 text-xs ${progressInfo.className}`}>
                        <ProgressIcon className={`w-3 h-3 ${record.progress === "in_progress" ? "animate-spin" : ""}`} />
                        {progressInfo.label}
                      </Badge>
                    </div>
                    <div className="col-span-2 flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {record.startTime}
                    </div>
                    <div className="col-span-2 flex items-center gap-1 text-sm text-muted-foreground">
                      {record.endTime ? (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          {record.endTime}
                        </>
                      ) : (
                        <span>-</span>
                      )}
                    </div>
                    <div className="col-span-1 flex items-center">
                      <span className="font-medium">{record.totalCases}</span>
                    </div>
                    <div className="col-span-1 flex items-center">
                      {record.progress === "completed" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleOpenCasesDialog(record, "excellent")}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          {record.excellentCases}
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                    <div className="col-span-1 flex items-center">
                      {record.progress === "completed" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => handleOpenCasesDialog(record, "passed")}
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          {record.passedCases}
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                    <div className="col-span-1 flex items-center">
                      {record.progress === "completed" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleOpenCasesDialog(record, "failed")}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          {record.failedCases}
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      {record.progress === "failed" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs gap-1 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            onClick={() => handleViewFailure(record)}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            查看失败信息
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs gap-1"
                            onClick={() => handleRetry(record)}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            重新开始
                          </Button>
                        </>
                      )}
                      {record.progress === "completed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-3 text-xs gap-1"
                          onClick={() => handleOpenSummary(record)}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          评审总结
                        </Button>
                      )}
                      {record.progress === "in_progress" && (
                        <span className="text-xs text-muted-foreground">审查中...</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {records.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mb-4 opacity-50" />
                <p>暂无智能审查记录</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Sidebar */}
      <AIReviewSummarySidebar
        open={summarySidebarOpen}
        onOpenChange={setSummarySidebarOpen}
        record={selectedRecord}
      />

      {/* Cases Dialog */}
      <AIReviewCasesDialog
        open={casesDialogOpen}
        onOpenChange={setCasesDialogOpen}
        type={casesDialogType}
        cases={dialogCases}
        onCasesChange={setDialogCases}
      />

      {/* Smart Review Select Dialog */}
      <SmartReviewSelectDialog
        open={selectDialogOpen}
        onOpenChange={setSelectDialogOpen}
        onConfirm={handleConfirmReview}
      />

      {/* Failure Details Dialog */}
      <AlertDialog open={failureDialogOpen} onOpenChange={setFailureDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              审查失败
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              {failureRecord?.failureReason || "未知错误"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>关闭</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (failureRecord) {
                  handleRetry(failureRecord);
                }
                setFailureDialogOpen(false);
              }}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              重新开始
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
