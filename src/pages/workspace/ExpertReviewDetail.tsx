import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, CheckCircle, XCircle, HelpCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

type ExpertOpinion = "passed" | "rejected" | "reviewing" | "pending";
type CaseNature = "positive" | "negative";

interface ExpertRejection {
  expertName: string;
  rejectTag: string;
  rejectReason: string;
  reviewTime: string;
}

interface ExpertCase {
  id: string;
  batchCode: string;
  caseCode: string;
  name: string;
  createdAt: string;
  opinion: ExpertOpinion;
  nature: CaseNature;
  reviewedExperts: number;
  totalExperts: number;
  rejections?: ExpertRejection[];
}

const mockExpertCases: ExpertCase[] = [
  { id: "1", batchCode: "BATCH-001", caseCode: "TC-001", name: "用户登录功能验证", createdAt: "2024-01-15 10:30", opinion: "passed", nature: "positive", reviewedExperts: 3, totalExperts: 3 },
  { id: "2", batchCode: "BATCH-001", caseCode: "TC-002", name: "用户注册表单验证", createdAt: "2024-01-15 10:35", opinion: "rejected", nature: "positive", reviewedExperts: 3, totalExperts: 3, rejections: [
    { expertName: "张专家", rejectTag: "步骤不完整", rejectReason: "缺少边界值测试步骤", reviewTime: "2024-01-16 09:30" },
    { expertName: "李专家", rejectTag: "预期结果不明确", rejectReason: "预期结果描述过于模糊，需要更具体的验证点", reviewTime: "2024-01-16 10:15" },
  ]},
  { id: "3", batchCode: "BATCH-001", caseCode: "TC-003", name: "密码重置流程", createdAt: "2024-01-15 10:40", opinion: "reviewing", nature: "positive", reviewedExperts: 1, totalExperts: 3 },
  { id: "4", batchCode: "BATCH-001", caseCode: "TC-004", name: "用户权限校验", createdAt: "2024-01-15 10:45", opinion: "pending", nature: "negative", reviewedExperts: 0, totalExperts: 3 },
  { id: "5", batchCode: "BATCH-002", caseCode: "TC-005", name: "会话超时处理", createdAt: "2024-01-15 11:00", opinion: "passed", nature: "negative", reviewedExperts: 3, totalExperts: 3 },
  { id: "6", batchCode: "BATCH-002", caseCode: "TC-006", name: "多设备登录限制", createdAt: "2024-01-15 11:05", opinion: "rejected", nature: "negative", reviewedExperts: 3, totalExperts: 3, rejections: [
    { expertName: "王专家", rejectTag: "测试数据不合理", rejectReason: "测试场景不符合实际业务需求", reviewTime: "2024-01-16 14:20" },
  ]},
  { id: "7", batchCode: "BATCH-002", caseCode: "TC-007", name: "用户信息修改", createdAt: "2024-01-15 11:10", opinion: "reviewing", nature: "positive", reviewedExperts: 2, totalExperts: 3 },
  { id: "8", batchCode: "BATCH-002", caseCode: "TC-008", name: "账户注销流程", createdAt: "2024-01-15 11:15", opinion: "passed", nature: "positive", reviewedExperts: 3, totalExperts: 3 },
];

const opinionConfig: Record<ExpertOpinion, { label: string; icon: typeof CheckCircle; className: string; showCount?: boolean }> = {
  passed: {
    label: "通过",
    icon: CheckCircle,
    className: "bg-green-500/10 text-green-600 border-green-200",
  },
  rejected: {
    label: "拒绝",
    icon: XCircle,
    className: "bg-red-500/10 text-red-600 border-red-200 cursor-pointer hover:bg-red-500/20",
  },
  reviewing: {
    label: "评审中",
    icon: Users,
    className: "bg-blue-500/10 text-blue-600 border-blue-200",
    showCount: true,
  },
  pending: {
    label: "待评审",
    icon: HelpCircle,
    className: "bg-gray-500/10 text-gray-600 border-gray-200",
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

export default function ExpertReviewDetail() {
  const navigate = useNavigate();
  const { workspaceId, recordId } = useParams();
  const [cases] = useState<ExpertCase[]>(mockExpertCases);
  const [viewRejectDialogOpen, setViewRejectDialogOpen] = useState(false);
  const [viewingCase, setViewingCase] = useState<ExpertCase | null>(null);

  const handleViewReject = (caseItem: ExpertCase) => {
    setViewingCase(caseItem);
    setViewRejectDialogOpen(true);
  };

  const passedCount = cases.filter(c => c.opinion === "passed").length;
  const rejectedCount = cases.filter(c => c.opinion === "rejected").length;
  const reviewingCount = cases.filter(c => c.opinion === "reviewing").length;
  const pendingCount = cases.filter(c => c.opinion === "pending").length;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/workspace/${workspaceId}/management/ai-cases/${recordId}/expert-review-records`)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">专家评审详情</h1>
          <p className="text-muted-foreground mt-1">查看专家对用例的评审结果</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-card border rounded-xl p-4">
          <div className="text-sm text-muted-foreground mb-1">总用例数</div>
          <div className="text-2xl font-bold">{cases.length}</div>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <div className="text-sm text-muted-foreground mb-1">通过</div>
          <div className="text-2xl font-bold text-green-600">{passedCount}</div>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <div className="text-sm text-muted-foreground mb-1">拒绝</div>
          <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <div className="text-sm text-muted-foreground mb-1">进行中</div>
          <div className="text-2xl font-bold text-blue-600">{reviewingCount}</div>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <div className="text-sm text-muted-foreground mb-1">待评审</div>
          <div className="text-2xl font-bold text-gray-600">{pendingCount}</div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="grid grid-cols-[100px_100px_1fr_80px_140px_120px] gap-2 px-6 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
          <div>批次编号</div>
          <div>用例编号</div>
          <div>用例名称</div>
          <div>性质</div>
          <div>创建时间</div>
          <div>专家意见</div>
        </div>

        <div className="divide-y">
          {cases.map((caseItem, index) => {
            const opinion = opinionConfig[caseItem.opinion];
            const nature = natureConfig[caseItem.nature];
            const OpinionIcon = opinion.icon;
            const NatureIcon = nature.icon;

            return (
              <div
                key={caseItem.id}
                className="grid grid-cols-[100px_100px_1fr_80px_140px_120px] gap-2 px-6 py-4 hover:bg-muted/30 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center">
                  <Badge variant="outline" className="font-mono text-xs">
                    {caseItem.batchCode}
                  </Badge>
                </div>
                <div className="flex items-center">
                  <Badge variant="outline" className="font-mono text-xs bg-blue-500/10 text-blue-600 border-blue-200">
                    {caseItem.caseCode}
                  </Badge>
                </div>
                <div className="flex items-center">
                  <span className="font-medium truncate">{caseItem.name}</span>
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
                  <Clock className="w-3.5 h-3.5" />
                  {caseItem.createdAt}
                </div>
                <div className="flex items-center">
                  <Badge
                    variant="outline"
                    className={cn("text-xs gap-1", opinion.className)}
                    onClick={() => caseItem.opinion === "rejected" && handleViewReject(caseItem)}
                  >
                    <OpinionIcon className="w-3 h-3" />
                    {opinion.showCount 
                      ? `${opinion.label} ${caseItem.reviewedExperts}/${caseItem.totalExperts}`
                      : opinion.label
                    }
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* View Reject Reason Dialog */}
      <Dialog open={viewRejectDialogOpen} onOpenChange={setViewRejectDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>拒绝详情</DialogTitle>
          </DialogHeader>
          {viewingCase && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">用例名称</Label>
                <p className="mt-1 font-medium">{viewingCase.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">用例编号</Label>
                <p className="mt-1 font-mono text-sm">{viewingCase.caseCode}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">专家拒绝原因</Label>
                <ScrollArea className="mt-2 max-h-[300px]">
                  <div className="space-y-3 pr-4">
                    {viewingCase.rejections?.map((rejection, idx) => (
                      <div key={idx} className="bg-muted/50 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-sm font-medium">{rejection.expertName}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{rejection.reviewTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600 border-red-200">
                            {rejection.rejectTag}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{rejection.rejectReason}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
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
    </div>
  );
}
