import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Search, FileCheck, Clock, CheckCircle, XCircle, Calendar, Users, ClipboardCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ExpertReviewDialog } from "@/components/workspace/ExpertReviewDialog";
import { RejectionDetailDialog } from "@/components/workspace/RejectionDetailDialog";

interface BatchRecord {
  id: string;
  batchCode: string;
  generatedAt: string;
  totalCases: number;
  pendingCount: number;
  acceptedCount: number;
  rejectedCount: number;
}

const mockBatchRecords: BatchRecord[] = [
  {
    id: "batch-1",
    batchCode: "BATCH-001",
    generatedAt: "2024-01-15 10:30",
    totalCases: 24,
    pendingCount: 10,
    acceptedCount: 12,
    rejectedCount: 2,
  },
  {
    id: "batch-2",
    batchCode: "BATCH-002",
    generatedAt: "2024-01-14 15:20",
    totalCases: 18,
    pendingCount: 0,
    acceptedCount: 15,
    rejectedCount: 3,
  },
  {
    id: "batch-3",
    batchCode: "BATCH-003",
    generatedAt: "2024-01-13 09:45",
    totalCases: 12,
    pendingCount: 5,
    acceptedCount: 6,
    rejectedCount: 1,
  },
];

const mockRecordInfo = {
  id: "1",
  code: "AI-001",
  name: "用户模块自动化测试用例",
  createdAt: "2024-01-15 10:30",
};

const mockRejectedCases = [
  { id: "1", code: "TC-001", name: "用户登录功能验证", rejectTag: "步骤不完整", rejectReason: "缺少边界值测试步骤，建议补充空值和超长输入的验证", reviewer: "李专家", reviewTime: "2024-01-15 14:30" },
  { id: "2", code: "TC-002", name: "密码重置流程", rejectTag: "预期结果不明确", rejectReason: "预期结果描述过于模糊，无法作为测试验收标准", reviewer: "王专家", reviewTime: "2024-01-15 15:00" },
  { id: "3", code: "TC-003", name: "多设备登录限制", rejectTag: "与现有用例重复", rejectReason: "该用例与TC-089重复，建议合并", reviewer: "李专家", reviewTime: "2024-01-15 15:30" },
];

export default function AIGeneratedCaseDetail() {
  const navigate = useNavigate();
  const { workspaceId, recordId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"self" | "expert">("self");
  const [expertReviewDialogOpen, setExpertReviewDialogOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<BatchRecord | null>(null);

  const filteredBatches = mockBatchRecords.filter((batch) =>
    batch.batchCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReview = (batchId: string) => {
    navigate(`/workspace/${workspaceId}/management/ai-cases/${recordId}/batch/${batchId}/review`);
  };

  const handleOpenExpertReview = (batch: BatchRecord) => {
    setSelectedBatch(batch);
    setExpertReviewDialogOpen(true);
  };

  const handleConfirmExpertReview = (data: { experts: { id: string; name: string; email: string }[]; selectedCases: string[] }) => {
    console.log("发起专家评审:", data);
  };

  const handleOpenRejectionDetail = (batch: BatchRecord) => {
    setSelectedBatch(batch);
    setRejectionDialogOpen(true);
  };

  const handleOpenExpertReviewDetail = (batchId: string) => {
    navigate(`/workspace/${workspaceId}/management/ai-cases/${recordId}/batch/${batchId}/expert-review`);
  };

  const totalCases = mockBatchRecords.reduce((sum, b) => sum + b.totalCases, 0);
  const totalPending = mockBatchRecords.reduce((sum, b) => sum + b.pendingCount, 0);
  const totalAccepted = mockBatchRecords.reduce((sum, b) => sum + b.acceptedCount, 0);
  const totalRejected = mockBatchRecords.reduce((sum, b) => sum + b.rejectedCount, 0);

  const renderBatchTable = (isExpertView: boolean) => (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className={cn(
        "grid gap-4 px-6 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b",
        isExpertView ? "grid-cols-12" : "grid-cols-12"
      )}>
        <div className="col-span-2">批次编号</div>
        <div className="col-span-2">生成时间</div>
        <div className="col-span-1">总用例数</div>
        <div className="col-span-2">未评审</div>
        <div className="col-span-2">已采纳</div>
        <div className="col-span-1">不采纳</div>
        <div className="col-span-2">操作</div>
      </div>

      <div className="divide-y">
        {filteredBatches.map((batch, index) => (
          <div
            key={batch.id}
            className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-muted/30 transition-colors animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="col-span-2 flex items-center">
              <Badge variant="outline" className="font-mono text-xs">
                {batch.batchCode}
              </Badge>
            </div>
            <div className="col-span-2 flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              {batch.generatedAt}
            </div>
            <div className="col-span-1 flex items-center">
              <span className="font-medium">{batch.totalCases}</span>
            </div>
            <div className="col-span-2 flex items-center">
              <Badge variant="outline" className={cn("text-xs gap-1", batch.pendingCount > 0 ? "bg-amber-500/10 text-amber-600 border-amber-200" : "")}>
                <Clock className="w-3 h-3" />
                {batch.pendingCount}
              </Badge>
            </div>
            <div className="col-span-2 flex items-center">
              <Badge variant="outline" className="text-xs gap-1 bg-green-500/10 text-green-600 border-green-200">
                <CheckCircle className="w-3 h-3" />
                {batch.acceptedCount}
              </Badge>
            </div>
            <div className="col-span-1 flex items-center">
              {isExpertView && batch.rejectedCount > 0 ? (
                <button
                  className="cursor-pointer"
                  onClick={() => handleOpenRejectionDetail(batch)}
                >
                  <Badge variant="outline" className="text-xs gap-1 bg-red-500/10 text-red-600 border-red-200 hover:bg-red-500/20">
                    <XCircle className="w-3 h-3" />
                    {batch.rejectedCount}
                  </Badge>
                </button>
              ) : (
                <Badge variant="outline" className="text-xs gap-1 bg-red-500/10 text-red-600 border-red-200">
                  <XCircle className="w-3 h-3" />
                  {batch.rejectedCount}
                </Badge>
              )}
            </div>
            <div className="col-span-2 flex items-center gap-1">
              {!isExpertView ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-3 text-xs gap-1"
                  onClick={() => handleReview(batch.id)}
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  评审
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs gap-1"
                    onClick={() => handleOpenExpertReview(batch)}
                  >
                    <Users className="w-3.5 h-3.5" />
                    发起专家评审
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs gap-1"
                    onClick={() => handleOpenExpertReviewDetail(batch.id)}
                  >
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    详情
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredBatches.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Search className="w-12 h-12 mb-4 opacity-50" />
          <p>未找到匹配的批次记录</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/workspace/${workspaceId}/management/ai-cases`)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{mockRecordInfo.name}</h1>
          <p className="text-muted-foreground mt-1">
            编号: {mockRecordInfo.code} · 创建时间: {mockRecordInfo.createdAt}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold">{totalCases}</div>
          <div className="text-sm text-muted-foreground">总用例数</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-amber-600">{totalPending}</div>
          <div className="text-sm text-muted-foreground">未评审</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{totalAccepted}</div>
          <div className="text-sm text-muted-foreground">已采纳</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">{totalRejected}</div>
          <div className="text-sm text-muted-foreground">不采纳</div>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索批次编号..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs for Self Review and Expert Review */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "self" | "expert")} className="mb-6">
        <TabsList>
          <TabsTrigger value="self" className="gap-2">
            <ClipboardCheck className="w-4 h-4" />
            用例自评
          </TabsTrigger>
          <TabsTrigger value="expert" className="gap-2">
            <Users className="w-4 h-4" />
            专家评审
          </TabsTrigger>
        </TabsList>

        <TabsContent value="self" className="mt-4">
          {renderBatchTable(false)}
        </TabsContent>

        <TabsContent value="expert" className="mt-4">
          {renderBatchTable(true)}
        </TabsContent>
      </Tabs>

      <ExpertReviewDialog
        open={expertReviewDialogOpen}
        onOpenChange={setExpertReviewDialogOpen}
        recordName={selectedBatch?.batchCode || ""}
        onConfirm={handleConfirmExpertReview}
      />

      <RejectionDetailDialog
        open={rejectionDialogOpen}
        onOpenChange={setRejectionDialogOpen}
        recordName={selectedBatch?.batchCode || ""}
        rejectedCases={mockRejectedCases}
      />
    </div>
  );
}
