import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Search, FileCheck, CheckCircle, Clock, XCircle, Calendar, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CaseReviewDialog } from "@/components/workspace/CaseReviewDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type CaseStatus = "pending" | "accepted" | "rejected";
type ExpertOpinion = "adopted" | "rejected" | "pending";
type CaseNature = "positive" | "negative";

interface ExpertRejection {
  expertName?: string;
  rejectTag: string;
  rejectReason: string;
  reviewTime: string;
}

interface GeneratedCase {
  id: string;
  code: string;
  name: string;
  status: CaseStatus;
  bddContent: string;
  sourceDocument: string;
  createdAt: string;
  rejectionReason?: string;
  expertOpinion: ExpertOpinion;
  expertRejections?: ExpertRejection[];
  nature: CaseNature;
}

// 测试点信息
const testPointInfo: Record<string, { name: string; dimensionName: string }> = {
  "tp-1": { name: "用户登录", dimensionName: "用户管理" },
  "tp-2": { name: "用户注册", dimensionName: "用户管理" },
  "tp-3": { name: "密码重置", dimensionName: "用户管理" },
  "tp-4": { name: "订单创建", dimensionName: "订单管理" },
  "tp-5": { name: "订单支付", dimensionName: "订单管理" },
};

// 根据测试点生成 mock 用例
const generateMockCases = (testPointId: string): GeneratedCase[] => {
  const info = testPointInfo[testPointId] || { name: "默认测试点", dimensionName: "默认维度" };
  return [
    {
      id: "1",
      code: "TC-001",
      name: `${info.name}成功场景`,
      status: "pending",
      createdAt: "2024-01-15 10:30",
      expertOpinion: "pending",
      nature: "positive",
      bddContent: `Feature: ${info.name}
  Scenario: ${info.name}成功
    Given 用户在${info.name}页面
    When 用户执行${info.name}操作
    Then 操作应该成功完成`,
      sourceDocument: `<h3>${info.name}功能</h3><p>功能规格说明...</p>`,
    },
    {
      id: "2",
      code: "TC-002",
      name: `${info.name}失败场景-参数错误`,
      status: "pending",
      createdAt: "2024-01-15 10:32",
      expertOpinion: "pending",
      nature: "negative",
      bddContent: `Feature: ${info.name}
  Scenario: ${info.name}失败-参数错误
    Given 用户在${info.name}页面
    When 用户输入无效参数
    Then 系统应该显示错误提示`,
      sourceDocument: `<h3>${info.name}错误处理</h3><p>错误处理规格说明...</p>`,
    },
    {
      id: "3",
      code: "TC-003",
      name: `${info.name}边界测试`,
      status: "accepted",
      createdAt: "2024-01-15 10:35",
      expertOpinion: "adopted",
      nature: "positive",
      bddContent: `Feature: ${info.name}
  Scenario: ${info.name}边界条件
    Given 用户在${info.name}页面
    When 用户输入边界值
    Then 系统应该正确处理`,
      sourceDocument: `<h3>${info.name}边界条件</h3><p>边界条件说明...</p>`,
    },
    {
      id: "4",
      code: "TC-004",
      name: `${info.name}异常处理`,
      status: "rejected",
      createdAt: "2024-01-15 10:38",
      expertOpinion: "rejected",
      nature: "negative",
      expertRejections: [
        { expertName: "李专家", rejectTag: "步骤不完整", rejectReason: "缺少异常恢复步骤", reviewTime: "2024-01-15 14:30" },
      ],
      bddContent: `Feature: ${info.name}
  Scenario: ${info.name}异常处理
    Given 系统发生异常
    When 用户尝试${info.name}
    Then 系统应该优雅处理`,
      sourceDocument: `<h3>${info.name}异常处理</h3><p>异常处理规格说明...</p>`,
    },
  ];
};

const statusConfig: Record<CaseStatus, { label: string; icon: typeof CheckCircle; className: string }> = {
  pending: {
    label: "待评审",
    icon: Clock,
    className: "bg-amber-500/10 text-amber-600 border-amber-200",
  },
  accepted: {
    label: "已通过",
    icon: CheckCircle,
    className: "bg-green-500/10 text-green-600 border-green-200",
  },
  rejected: {
    label: "不通过",
    icon: XCircle,
    className: "bg-red-500/10 text-red-600 border-red-200",
  },
};

const expertOpinionConfig: Record<ExpertOpinion, { label: string; icon: typeof CheckCircle; className: string; clickable: boolean }> = {
  adopted: {
    label: "采纳",
    icon: CheckCircle,
    className: "bg-green-500/10 text-green-600 border-green-200",
    clickable: false,
  },
  rejected: {
    label: "不采纳",
    icon: XCircle,
    className: "bg-red-500/10 text-red-600 border-red-200 cursor-pointer hover:bg-red-500/20",
    clickable: true,
  },
  pending: {
    label: "待评审",
    icon: HelpCircle,
    className: "bg-gray-500/10 text-gray-600 border-gray-200",
    clickable: false,
  },
};

const natureConfig: Record<CaseNature, { label: string; icon: typeof CheckCircle; className: string }> = {
  positive: {
    label: "正例",
    icon: CheckCircle,
    className: "bg-green-500/10 text-green-600 border-green-200",
  },
  negative: {
    label: "反例",
    icon: XCircle,
    className: "bg-orange-500/10 text-orange-600 border-orange-200",
  },
};

export default function CaseSelfReview() {
  const navigate = useNavigate();
  const { workspaceId, recordId, batchId, testPointId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [cases, setCases] = useState(() => generateMockCases(testPointId || "tp-1"));
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);
  const [viewRejectDialogOpen, setViewRejectDialogOpen] = useState(false);
  const [viewingCase, setViewingCase] = useState<GeneratedCase | null>(null);
  const [caseDetailDialogOpen, setCaseDetailDialogOpen] = useState(false);
  const [detailCase, setDetailCase] = useState<GeneratedCase | null>(null);

  const info = testPointInfo[testPointId || "tp-1"] || { name: "测试点", dimensionName: "测试维度" };

  const filteredCases = cases.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = cases.filter((c) => c.status === "pending").length;
  const acceptedCount = cases.filter((c) => c.status === "accepted").length;
  const rejectedCount = cases.filter((c) => c.status === "rejected").length;

  const handleOpenReview = (index: number) => {
    setSelectedCaseIndex(index);
    setReviewDialogOpen(true);
  };

  const handleBatchReview = () => {
    const firstPendingIndex = cases.findIndex((c) => c.status === "pending");
    if (firstPendingIndex !== -1) {
      handleOpenReview(firstPendingIndex);
    }
  };

  const handleAcceptCase = (caseId: string) => {
    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, status: "accepted" as CaseStatus, expertOpinion: "adopted" as ExpertOpinion } : c))
    );
  };

  const handleRejectCase = (caseId: string, reason: string) => {
    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, status: "rejected" as CaseStatus, rejectionReason: reason, expertOpinion: "rejected" as ExpertOpinion } : c))
    );
  };

  const handleDiscardCase = (caseId: string) => {
    setCases((prev) => prev.filter((c) => c.id !== caseId));
  };

  const handleViewReject = (testCase: GeneratedCase) => {
    setViewingCase(testCase);
    setViewRejectDialogOpen(true);
  };

  const handleViewCaseDetail = (testCase: GeneratedCase) => {
    setDetailCase(testCase);
    setCaseDetailDialogOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink 
              className="cursor-pointer"
              onClick={() => navigate(`/workspace/${workspaceId}/management/ai-cases`)}
            >
              智能用例设计
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink 
              className="cursor-pointer"
              onClick={() => navigate(`/workspace/${workspaceId}/management/ai-cases/${recordId}/batch/${batchId}/review`)}
            >
              用例自评
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{info.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/workspace/${workspaceId}/management/ai-cases/${recordId}/batch/${batchId}/review`)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{info.name} - 用例自评</h1>
          <p className="text-muted-foreground mt-1">
            测试维度: {info.dimensionName} · 共 {cases.length} 个用例，{pendingCount} 个待评审
          </p>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索用例编号或名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={handleBatchReview} disabled={pendingCount === 0} className="gap-2">
          <FileCheck className="w-4 h-4" />
          批量评审 ({pendingCount})
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold">{cases.length}</div>
          <div className="text-sm text-muted-foreground">总用例数</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
          <div className="text-sm text-muted-foreground">待评审</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{acceptedCount}</div>
          <div className="text-sm text-muted-foreground">已通过</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
          <div className="text-sm text-muted-foreground">不通过</div>
        </div>
      </div>

      {/* Case List */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="grid grid-cols-[80px_1fr_80px_120px_100px_100px_100px] gap-4 px-6 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
          <div>编号</div>
          <div>用例名称</div>
          <div>性质</div>
          <div>创建时间</div>
          <div>状态</div>
          <div>专家意见</div>
          <div>操作</div>
        </div>

        <div className="divide-y">
          {filteredCases.map((testCase, index) => {
            const status = statusConfig[testCase.status];
            const StatusIcon = status.icon;
            const expertOpinion = expertOpinionConfig[testCase.expertOpinion];
            const ExpertOpinionIcon = expertOpinion.icon;
            const nature = natureConfig[testCase.nature];
            const NatureIcon = nature.icon;

            return (
              <div
                key={testCase.id}
                className="grid grid-cols-[80px_1fr_80px_120px_100px_100px_100px] gap-4 px-6 py-4 hover:bg-muted/30 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center">
                  <Badge variant="outline" className="font-mono text-xs">
                    {testCase.code}
                  </Badge>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-foreground">{testCase.name}</span>
                </div>
                <div className="flex items-center">
                  <Badge
                    variant="outline"
                    className={cn("text-xs gap-1", nature.className)}
                  >
                    <NatureIcon className="w-3 h-3" />
                    {nature.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  {testCase.createdAt}
                </div>
                <div className="flex items-center">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs gap-1",
                      status.className,
                      testCase.status === "rejected" && "cursor-pointer hover:bg-red-500/20"
                    )}
                    onClick={() => testCase.status === "rejected" && handleViewReject(testCase)}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </Badge>
                </div>
                <div className="flex items-center">
                  <Badge
                    variant="outline"
                    className={cn("text-xs gap-1", expertOpinion.className)}
                    onClick={() => testCase.expertOpinion === "rejected" && handleViewReject(testCase)}
                  >
                    <ExpertOpinionIcon className="w-3 h-3" />
                    {expertOpinion.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-xs gap-1"
                    onClick={() => handleOpenReview(index)}
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    评审
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCases.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Search className="w-12 h-12 mb-4 opacity-50" />
            <p>未找到匹配的用例</p>
          </div>
        )}
      </div>

      <CaseReviewDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        cases={filteredCases}
        initialIndex={selectedCaseIndex}
        onAccept={handleAcceptCase}
        onReject={handleRejectCase}
        onDiscard={handleDiscardCase}
      />

      {/* View Reject Reason Dialog */}
      <Dialog open={viewRejectDialogOpen} onOpenChange={setViewRejectDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>不通过详情</DialogTitle>
          </DialogHeader>
          {viewingCase && (
            <div className="space-y-4 flex-1 overflow-auto">
              <div>
                <Label className="text-muted-foreground">用例名称</Label>
                <p 
                  className="mt-1 font-medium text-primary cursor-pointer hover:underline"
                  onClick={() => handleViewCaseDetail(viewingCase)}
                >
                  {viewingCase.name}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">用例编号</Label>
                <p className="mt-1 font-mono text-sm">{viewingCase.code}</p>
              </div>
              
              <div className="space-y-3">
                <Label className="text-muted-foreground">
                  专家意见 ({viewingCase.expertRejections?.length || 0} 位专家不采纳)
                </Label>
                {viewingCase.expertRejections?.map((rejection, idx) => (
                  <div key={idx} className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {rejection.expertName || "匿名"}
                        </span>
                        <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600 border-red-200">
                          {rejection.rejectTag}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{rejection.reviewTime}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {rejection.rejectReason || "未填写原因"}
                    </p>
                  </div>
                ))}
                {(!viewingCase.expertRejections || viewingCase.expertRejections.length === 0) && viewingCase.rejectionReason && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">{viewingCase.rejectionReason}</p>
                  </div>
                )}
                {(!viewingCase.expertRejections || viewingCase.expertRejections.length === 0) && !viewingCase.rejectionReason && (
                  <p className="text-sm text-muted-foreground">暂无不通过原因</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewRejectDialogOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Case Detail Dialog */}
      <Dialog open={caseDetailDialogOpen} onOpenChange={setCaseDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>用例详情</DialogTitle>
          </DialogHeader>
          {detailCase && (
            <div className="space-y-4 flex-1 overflow-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">用例编号</Label>
                  <p className="mt-1 font-mono text-sm">{detailCase.code}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">创建时间</Label>
                  <p className="mt-1 text-sm">{detailCase.createdAt}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">用例名称</Label>
                <p className="mt-1 font-medium">{detailCase.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">BDD内容</Label>
                <pre className="mt-1 p-3 bg-muted/50 rounded-lg text-sm font-mono whitespace-pre-wrap overflow-auto max-h-48">
                  {detailCase.bddContent}
                </pre>
              </div>
              <div>
                <Label className="text-muted-foreground">来源文档</Label>
                <div 
                  className="mt-1 p-3 bg-muted/50 rounded-lg text-sm prose prose-sm max-w-none overflow-auto max-h-48"
                  dangerouslySetInnerHTML={{ __html: detailCase.sourceDocument }}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCaseDetailDialogOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
