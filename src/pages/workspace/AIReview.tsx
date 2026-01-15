import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, FileText, Calendar, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AIReviewSummarySidebar } from "@/components/workspace/AIReviewSummarySidebar";
import { AIReviewCasesDialog } from "@/components/workspace/AIReviewCasesDialog";
import { toast } from "sonner";

interface AIReviewRecord {
  id: string;
  code: string;
  reviewTime: string;
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
    reviewTime: "2024-01-15 14:30",
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
    reviewTime: "2024-01-14 10:15",
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
    reviewTime: "2024-01-13 16:45",
    totalCases: 30,
    excellentCases: 15,
    passedCases: 10,
    failedCases: 5,
    summary: `**AI评审总结报告**

本次评审用例数量较多，整体质量中上。

**优秀用例 (15个)**
- 核心功能覆盖完整

**合格用例 (10个)**
- 需要优化部分描述

**不合格用例 (5个)**
- 建议重新生成`,
  },
];

// Mock case data for each category
const generateMockCases = (count: number, type: "excellent" | "passed" | "failed") => {
  const statusLabels = {
    excellent: "优秀",
    passed: "合格", 
    failed: "不合格",
  };
  
  return Array.from({ length: count }, (_, i) => ({
    id: `${type}-${i + 1}`,
    code: `TC-${String(i + 1).padStart(3, "0")}`,
    name: `${type === "excellent" ? "完整覆盖" : type === "passed" ? "基础验证" : "待完善"} - 测试场景${i + 1}`,
    status: type,
    statusLabel: statusLabels[type],
    adopted: false,
    reason: type === "failed" ? "场景描述不完整，缺少边界条件" : undefined,
  }));
};

export default function AIReview() {
  const navigate = useNavigate();
  const { workspaceId, recordId, batchId } = useParams();
  const [records] = useState(mockReviewRecords);
  const [summarySidebarOpen, setSummarySidebarOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AIReviewRecord | null>(null);
  const [casesDialogOpen, setCasesDialogOpen] = useState(false);
  const [casesDialogType, setCasesDialogType] = useState<"excellent" | "passed" | "failed">("excellent");
  const [dialogCases, setDialogCases] = useState<any[]>([]);

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

  const handleNewAIReview = () => {
    toast.success("正在启动新的AI评审...");
    // Here you would typically trigger a new AI review
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
          <h1 className="text-2xl font-bold text-foreground">AI用例评审</h1>
          <p className="text-muted-foreground mt-1">
            AI智能评审记录列表
          </p>
        </div>
        <Button onClick={handleNewAIReview} className="gap-2">
          <Plus className="w-4 h-4" />
          新增AI评审
        </Button>
      </div>

      {/* Review Records Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
          <div className="col-span-2">评审编号</div>
          <div className="col-span-2">评审时间</div>
          <div className="col-span-1">总用例数</div>
          <div className="col-span-1">优秀用例</div>
          <div className="col-span-1">合格用例</div>
          <div className="col-span-2">不合格用例</div>
          <div className="col-span-3">操作</div>
        </div>

        <div className="divide-y">
          {records.map((record, index) => (
            <div
              key={record.id}
              className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-muted/30 transition-colors animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="col-span-2 flex items-center">
                <Badge variant="outline" className="font-mono text-xs">
                  {record.code}
                </Badge>
              </div>
              <div className="col-span-2 flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                {record.reviewTime}
              </div>
              <div className="col-span-1 flex items-center">
                <span className="font-medium">{record.totalCases}</span>
              </div>
              <div className="col-span-1 flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={() => handleOpenCasesDialog(record, "excellent")}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  {record.excellentCases}
                </Button>
              </div>
              <div className="col-span-1 flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  onClick={() => handleOpenCasesDialog(record, "passed")}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {record.passedCases}
                </Button>
              </div>
              <div className="col-span-2 flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleOpenCasesDialog(record, "failed")}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  {record.failedCases}
                </Button>
              </div>
              <div className="col-span-3 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-3 text-xs gap-1"
                  onClick={() => handleOpenSummary(record)}
                >
                  <FileText className="w-3.5 h-3.5" />
                  评审总结
                </Button>
              </div>
            </div>
          ))}
        </div>

        {records.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <FileText className="w-12 h-12 mb-4 opacity-50" />
            <p>暂无AI评审记录</p>
          </div>
        )}
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
    </div>
  );
}
