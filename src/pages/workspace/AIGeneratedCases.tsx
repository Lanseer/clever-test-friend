import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Search, RefreshCw, FileCheck, Clock, User, Loader2, CheckCircle, XCircle, FileText, AlertTriangle, Sparkles, ClipboardCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ReportSidebar } from "@/components/workspace/ReportSidebar";
import { AIGenerateDialog } from "@/components/workspace/AIGenerateDialog";

type GenerationStatus = "generating" | "completed" | "failed";

interface SelectedDocument {
  docId: string;
  docName: string;
  versionId: string;
  versionName: string;
}

interface GenerationRecord {
  id: string;
  code: string;
  name: string;
  status: GenerationStatus;
  reviewer: string;
  reviewReport: string | null;
  failureReason?: string;
  createdAt: string;
  documents?: SelectedDocument[];
  tags?: string[];
  selfReviewTotal: number;
  selfReviewPassed: number;
  expertReviewTotal: number;
  expertReviewPassed: number;
}

const mockRecords: GenerationRecord[] = [
  {
    id: "1",
    code: "AI-001",
    name: "用户模块自动化测试用例",
    status: "completed",
    reviewer: "张三",
    reviewReport: "已通过，共生成 24 个用例",
    createdAt: "2024-01-15 10:30",
    documents: [
      { docId: "doc-1", docName: "用户管理功能规格说明书", versionId: "v1-2", versionName: "v1.1" },
    ],
    tags: ["功能测试", "回归测试"],
    selfReviewTotal: 500,
    selfReviewPassed: 480,
    expertReviewTotal: 480,
    expertReviewPassed: 450,
  },
  {
    id: "2",
    code: "AI-002",
    name: "支付接口测试用例生成",
    status: "generating",
    reviewer: "李四",
    reviewReport: null,
    createdAt: "2024-01-15 14:20",
    documents: [
      { docId: "doc-2", docName: "支付模块接口文档", versionId: "v2-2", versionName: "v2.0" },
    ],
    tags: ["接口测试"],
    selfReviewTotal: 0,
    selfReviewPassed: 0,
    expertReviewTotal: 0,
    expertReviewPassed: 0,
  },
  {
    id: "3",
    code: "AI-003",
    name: "订单流程边界测试",
    status: "completed",
    reviewer: "王五",
    reviewReport: "部分通过，需调整 3 个用例",
    createdAt: "2024-01-14 16:45",
    documents: [
      { docId: "doc-3", docName: "订单流程设计文档", versionId: "v3-3", versionName: "v2.0" },
    ],
    tags: ["功能测试"],
    selfReviewTotal: 320,
    selfReviewPassed: 300,
    expertReviewTotal: 300,
    expertReviewPassed: 280,
  },
  {
    id: "4",
    code: "AI-004",
    name: "商品管理模块测试",
    status: "failed",
    reviewer: "赵六",
    reviewReport: null,
    failureReason: "源文档解析失败：文档格式不正确，缺少必要的功能描述章节。请检查文档结构是否符合 FSD 规范。",
    createdAt: "2024-01-14 09:15",
    documents: [
      { docId: "doc-4", docName: "商品管理PRD", versionId: "v4-1", versionName: "v1.0" },
    ],
    tags: ["冒烟测试"],
    selfReviewTotal: 0,
    selfReviewPassed: 0,
    expertReviewTotal: 0,
    expertReviewPassed: 0,
  },
  {
    id: "5",
    code: "AI-005",
    name: "用户权限测试用例",
    status: "completed",
    reviewer: "张三",
    reviewReport: "已通过，生成 18 个用例",
    createdAt: "2024-01-13 11:00",
    documents: [
      { docId: "doc-5", docName: "权限控制设计方案", versionId: "v5-2", versionName: "v1.1" },
    ],
    tags: ["安全测试", "功能测试"],
    selfReviewTotal: 180,
    selfReviewPassed: 175,
    expertReviewTotal: 175,
    expertReviewPassed: 170,
  },
];

const statusConfig: Record<GenerationStatus, { label: string; icon: typeof Loader2; className: string }> = {
  generating: {
    label: "生成中",
    icon: Loader2,
    className: "bg-blue-500/10 text-blue-600 border-blue-200",
  },
  completed: {
    label: "已完成",
    icon: CheckCircle,
    className: "bg-green-500/10 text-green-600 border-green-200",
  },
  failed: {
    label: "生成失败",
    icon: XCircle,
    className: "bg-red-500/10 text-red-600 border-red-200",
  },
};

export default function AIGeneratedCases() {
  const navigate = useNavigate();
  const { workspaceId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarType, setSidebarType] = useState<"report" | "failure">("report");
  const [selectedRecord, setSelectedRecord] = useState<GenerationRecord | null>(null);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [generateMode, setGenerateMode] = useState<"create" | "regenerate">("create");
  const [regenerateRecord, setRegenerateRecord] = useState<GenerationRecord | null>(null);

  const filteredRecords = mockRecords.filter(
    (record) =>
      record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenReport = (record: GenerationRecord) => {
    setSelectedRecord(record);
    setSidebarType("report");
    setSidebarOpen(true);
  };

  const handleOpenFailure = (record: GenerationRecord) => {
    setSelectedRecord(record);
    setSidebarType("failure");
    setSidebarOpen(true);
  };

  const handleOpenReview = (record: GenerationRecord) => {
    navigate(`/workspace/${workspaceId}/management/ai-cases/${record.id}/review`);
  };

  const handleOpenGenerateDialog = () => {
    setGenerateMode("create");
    setRegenerateRecord(null);
    setGenerateDialogOpen(true);
  };

  const handleOpenRegenerateDialog = (record: GenerationRecord) => {
    setGenerateMode("regenerate");
    setRegenerateRecord(record);
    setGenerateDialogOpen(true);
  };

  const handleConfirmGenerate = (data: { name: string; documents: SelectedDocument[]; tags: string[] }) => {
    console.log("生成用例:", data);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI生成用例</h1>
          <p className="text-muted-foreground mt-1">查看和管理AI自动生成的测试用例记录</p>
        </div>
        <Button onClick={handleOpenGenerateDialog} className="gap-2">
          <Sparkles className="w-4 h-4" />
          AI生成
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索编号或名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="grid grid-cols-14 gap-4 px-6 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
          <div className="col-span-1">编号</div>
          <div className="col-span-3">名称</div>
          <div className="col-span-1">状态</div>
          <div className="col-span-1">评审人</div>
          <div className="col-span-1">用例自评</div>
          <div className="col-span-1">专家评审</div>
          <div className="col-span-2">创建时间</div>
          <div className="col-span-4">操作</div>
        </div>

        <div className="divide-y">
          {filteredRecords.map((record, index) => {
            const status = statusConfig[record.status];
            const StatusIcon = status.icon;
            const isCompleted = record.status === "completed";
            const isFailed = record.status === "failed";

            return (
              <div
                key={record.id}
                className="grid grid-cols-14 gap-4 px-6 py-4 hover:bg-muted/30 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="col-span-1 flex items-center">
                  <Badge variant="outline" className="font-mono text-xs">
                    {record.code}
                  </Badge>
                </div>
                <div className="col-span-3 flex items-center">
                  <button
                    className="font-medium text-primary hover:underline truncate text-left"
                    onClick={() => navigate(`/workspace/${workspaceId}/management/ai-cases/${record.id}`)}
                  >
                    {record.name}
                  </button>
                </div>
                <div className="col-span-1 flex items-center">
                  <Badge variant="outline" className={cn("text-xs gap-1", status.className)}>
                    <StatusIcon className={cn("w-3 h-3", record.status === "generating" && "animate-spin")} />
                    {status.label}
                  </Badge>
                </div>
                <div className="col-span-1 flex items-center gap-1">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm text-foreground truncate">{record.reviewer}</span>
                </div>
                <div className="col-span-1 flex items-center">
                  {isCompleted ? (
                    <span className="text-sm font-medium">
                      <span className="text-green-600">{record.selfReviewPassed}</span>
                      <span className="text-muted-foreground">/{record.selfReviewTotal}</span>
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </div>
                <div className="col-span-1 flex items-center">
                  {isCompleted ? (
                    <span className="text-sm font-medium">
                      <span className="text-green-600">{record.expertReviewPassed}</span>
                      <span className="text-muted-foreground">/{record.expertReviewTotal}</span>
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </div>
                <div className="col-span-2 flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  {record.createdAt}
                </div>
                <div className="col-span-4 flex items-center gap-1 flex-wrap">
                  {isCompleted && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs gap-1"
                        onClick={() => handleOpenReport(record)}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        评审报告
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs gap-1"
                        onClick={() => handleOpenReview(record)}
                      >
                        <ClipboardCheck className="w-3.5 h-3.5" />
                        评审
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs gap-1"
                        onClick={() => handleOpenRegenerateDialog(record)}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        再次生成
                      </Button>
                    </>
                  )}
                  {isFailed && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs gap-1 text-destructive hover:text-destructive"
                        onClick={() => handleOpenFailure(record)}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        查看失败信息
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs gap-1"
                        onClick={() => handleOpenRegenerateDialog(record)}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        重新生成
                      </Button>
                    </>
                  )}
                  {record.status === "generating" && (
                    <span className="text-xs text-muted-foreground">生成中，请稍候...</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredRecords.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Search className="w-12 h-12 mb-4 opacity-50" />
            <p>未找到匹配的生成记录</p>
          </div>
        )}
      </div>

      <ReportSidebar
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        type={sidebarType}
        data={
          selectedRecord
            ? {
                code: selectedRecord.code,
                name: selectedRecord.name,
                reviewer: selectedRecord.reviewer,
                createdAt: selectedRecord.createdAt,
                report: selectedRecord.reviewReport,
                failureReason: selectedRecord.failureReason,
              }
            : null
        }
      />

      <AIGenerateDialog
        open={generateDialogOpen}
        onOpenChange={setGenerateDialogOpen}
        mode={generateMode}
        initialData={
          regenerateRecord
            ? {
                name: regenerateRecord.name,
                documents: regenerateRecord.documents || [],
                tags: regenerateRecord.tags || [],
              }
            : undefined
        }
        onConfirm={handleConfirmGenerate}
      />
    </div>
  );
}
