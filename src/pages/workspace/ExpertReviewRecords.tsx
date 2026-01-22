import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, Eye, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { InitiateExpertReviewDialog } from "@/components/workspace/InitiateExpertReviewDialog";

type ReviewRecordStatus = "ongoing" | "closed";

interface ReviewRecord {
  id: string;
  status: ReviewRecordStatus;
  createdAt: string;
  initiator: string;
  total: number;
  adopted: number;
  rejected: number;
  pending: number;
}

const mockReviewRecords: ReviewRecord[] = [
  {
    id: "review-001",
    status: "ongoing",
    createdAt: "2024-01-20 14:30",
    initiator: "张三",
    total: 45,
    adopted: 30,
    rejected: 8,
    pending: 7,
  },
  {
    id: "review-002",
    status: "ongoing",
    createdAt: "2024-01-18 10:15",
    initiator: "李四",
    total: 32,
    adopted: 25,
    rejected: 5,
    pending: 2,
  },
  {
    id: "review-003",
    status: "closed",
    createdAt: "2024-01-15 09:00",
    initiator: "王五",
    total: 28,
    adopted: 20,
    rejected: 8,
    pending: 0,
  },
];

const statusConfig: Record<ReviewRecordStatus, { label: string; className: string }> = {
  ongoing: {
    label: "进行中",
    className: "bg-blue-500/10 text-blue-600 border-blue-200",
  },
  closed: {
    label: "已关闭",
    className: "bg-gray-500/10 text-gray-600 border-gray-200",
  },
};

export default function ExpertReviewRecords() {
  const navigate = useNavigate();
  const { workspaceId, recordId } = useParams();
  const [initiateDialogOpen, setInitiateDialogOpen] = useState(false);

  const handleViewDetail = (reviewId: string) => {
    navigate(`/workspace/${workspaceId}/management/ai-cases/${recordId}/expert-review-records/${reviewId}/cases`);
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
            <BreadcrumbPage>评审记录</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/workspace/${workspaceId}/management/ai-cases`)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">专家评审记录</h1>
          <p className="text-muted-foreground mt-1">
            生成记录: AI-001 · 查看所有专家评审记录
          </p>
        </div>
        <Button className="gap-2" onClick={() => setInitiateDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          发起评审
        </Button>
      </div>

      {/* Records Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="grid grid-cols-[80px_160px_120px_100px_100px_100px_100px_120px] gap-2 px-6 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
          <div>状态</div>
          <div>发起时间</div>
          <div>发起人</div>
          <div>总用例数</div>
          <div>通过</div>
          <div>拒绝</div>
          <div>待评审</div>
          <div>操作</div>
        </div>

        <div className="divide-y">
          {mockReviewRecords.map((record, index) => {
            const status = statusConfig[record.status];
            return (
              <div
                key={record.id}
                className="grid grid-cols-[80px_160px_120px_100px_100px_100px_100px_120px] gap-2 px-6 py-4 hover:bg-muted/30 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center">
                  <Badge variant="outline" className={status.className}>
                    {status.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  {record.createdAt}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  {record.initiator}
                </div>
                <div className="flex items-center">
                  <Badge variant="outline" className="font-medium">
                    {record.total}
                  </Badge>
                </div>
                <div className="flex items-center">
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                    {record.adopted}
                  </Badge>
                </div>
                <div className="flex items-center">
                  <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200">
                    {record.rejected}
                  </Badge>
                </div>
                <div className="flex items-center">
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200">
                    {record.pending}
                  </Badge>
                </div>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-xs gap-1"
                    onClick={() => handleViewDetail(record.id)}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    查看详情
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {mockReviewRecords.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p>暂无评审记录</p>
          </div>
        )}
      </div>

      <InitiateExpertReviewDialog
        open={initiateDialogOpen}
        onOpenChange={setInitiateDialogOpen}
        onConfirm={() => {
          setInitiateDialogOpen(false);
        }}
      />
    </div>
  );
}
