import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Star, CheckCircle, XCircle, HelpCircle } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

type ReviewStatus = "adopted" | "rejected" | "pending";
type AIQuality = "excellent" | "passed";
type ExpertOpinion = "adopted" | "rejected" | "pending";

interface ExpertRejection {
  expertName?: string;
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
  aiQuality: AIQuality;
  status: ReviewStatus;
  expertOpinion: ExpertOpinion;
  rejections?: ExpertRejection[];
}

const mockExpertCases: ExpertCase[] = [
  { id: "1", batchCode: "BATCH-001", caseCode: "TC-001", name: "用户登录功能验证", createdAt: "2024-01-15 10:30", aiQuality: "excellent", status: "adopted", expertOpinion: "adopted" },
  { id: "2", batchCode: "BATCH-001", caseCode: "TC-002", name: "用户注册表单验证", createdAt: "2024-01-15 10:35", aiQuality: "passed", status: "rejected", expertOpinion: "rejected", rejections: [
    { expertName: "李专家", rejectTag: "步骤不完整", rejectReason: "缺少边界值测试步骤，建议补充空值和超长输入的验证", reviewTime: "2024-01-15 14:30" },
    { rejectTag: "测试数据不合理", rejectReason: "测试数据覆盖不全面", reviewTime: "2024-01-15 16:00" },
  ]},
  { id: "3", batchCode: "BATCH-001", caseCode: "TC-003", name: "密码重置流程", createdAt: "2024-01-15 10:40", aiQuality: "excellent", status: "pending", expertOpinion: "pending" },
  { id: "4", batchCode: "BATCH-001", caseCode: "TC-004", name: "用户权限校验", createdAt: "2024-01-15 10:45", aiQuality: "passed", status: "pending", expertOpinion: "pending" },
  { id: "5", batchCode: "BATCH-002", caseCode: "TC-005", name: "会话超时处理", createdAt: "2024-01-15 11:00", aiQuality: "excellent", status: "adopted", expertOpinion: "adopted" },
  { id: "6", batchCode: "BATCH-002", caseCode: "TC-006", name: "多设备登录限制", createdAt: "2024-01-15 11:05", aiQuality: "passed", status: "rejected", expertOpinion: "rejected", rejections: [
    { expertName: "王专家", rejectTag: "预期结果不明确", rejectReason: "预期结果描述过于模糊，无法作为测试验收标准", reviewTime: "2024-01-15 15:00" },
    { expertName: "张专家", rejectTag: "与现有用例重复", rejectReason: "该用例与TC-089重复，建议合并", reviewTime: "2024-01-15 15:30" },
  ]},
  { id: "7", batchCode: "BATCH-002", caseCode: "TC-007", name: "用户信息修改", createdAt: "2024-01-15 11:10", aiQuality: "excellent", status: "pending", expertOpinion: "pending" },
  { id: "8", batchCode: "BATCH-002", caseCode: "TC-008", name: "账户注销流程", createdAt: "2024-01-15 11:15", aiQuality: "passed", status: "adopted", expertOpinion: "adopted" },
];

const rejectTags = [
  "步骤不完整",
  "预期结果不明确",
  "前置条件缺失",
  "测试数据不合理",
  "与现有用例重复",
  "不符合业务场景",
  "其他",
];

const statusConfig: Record<ReviewStatus, { label: string; icon: typeof CheckCircle; className: string }> = {
  adopted: {
    label: "采纳",
    icon: CheckCircle,
    className: "bg-green-500/10 text-green-600 border-green-200",
  },
  rejected: {
    label: "不采纳",
    icon: XCircle,
    className: "bg-red-500/10 text-red-600 border-red-200",
  },
  pending: {
    label: "待评审",
    icon: HelpCircle,
    className: "bg-gray-500/10 text-gray-600 border-gray-200",
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

const qualityConfig: Record<AIQuality, { label: string; className: string }> = {
  excellent: {
    label: "优秀",
    className: "bg-purple-500/10 text-purple-600 border-purple-200",
  },
  passed: {
    label: "合格",
    className: "bg-blue-500/10 text-blue-600 border-blue-200",
  },
};

export default function ExpertReviewDetail() {
  const navigate = useNavigate();
  const { workspaceId, id } = useParams();
  const [cases, setCases] = useState<ExpertCase[]>(mockExpertCases);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingCase, setRejectingCase] = useState<ExpertCase | null>(null);
  const [selectedTag, setSelectedTag] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [expertName, setExpertName] = useState("");
  const [viewRejectDialogOpen, setViewRejectDialogOpen] = useState(false);
  const [viewingCase, setViewingCase] = useState<ExpertCase | null>(null);

  const handleAdopt = (caseItem: ExpertCase) => {
    setCases(cases.map(c => 
      c.id === caseItem.id ? { ...c, status: "adopted" as ReviewStatus, expertOpinion: "adopted" as ExpertOpinion } : c
    ));
  };

  const handleOpenReject = (caseItem: ExpertCase) => {
    setRejectingCase(caseItem);
    setSelectedTag("");
    setRejectReason("");
    setExpertName("");
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = () => {
    if (rejectingCase && selectedTag) {
      const newRejection: ExpertRejection = {
        expertName: expertName || undefined,
        rejectTag: selectedTag,
        rejectReason: rejectReason,
        reviewTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
      };
      setCases(cases.map(c =>
        c.id === rejectingCase.id
          ? { 
              ...c, 
              status: "rejected" as ReviewStatus, 
              expertOpinion: "rejected" as ExpertOpinion,
              rejections: [...(c.rejections || []), newRejection]
            }
          : c
      ));
      setRejectDialogOpen(false);
      setRejectingCase(null);
    }
  };

  const handleViewReject = (caseItem: ExpertCase) => {
    setViewingCase(caseItem);
    setViewRejectDialogOpen(true);
  };

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
          <h1 className="text-2xl font-bold text-foreground">专家评审详情</h1>
          <p className="text-muted-foreground mt-1">查看和管理专家对用例的评审结果</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-card border rounded-xl p-4">
          <div className="text-sm text-muted-foreground mb-1">总用例数</div>
          <div className="text-2xl font-bold">{cases.length}</div>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <div className="text-sm text-muted-foreground mb-1">已采纳</div>
          <div className="text-2xl font-bold text-green-600">
            {cases.filter(c => c.status === "adopted").length}
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <div className="text-sm text-muted-foreground mb-1">不采纳</div>
          <div className="text-2xl font-bold text-red-600">
            {cases.filter(c => c.status === "rejected").length}
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <div className="text-sm text-muted-foreground mb-1">待评审</div>
          <div className="text-2xl font-bold text-gray-600">
            {cases.filter(c => c.status === "pending").length}
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="grid grid-cols-[100px_100px_1fr_140px_80px_100px_100px_120px] gap-2 px-6 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
          <div>批次编号</div>
          <div>用例编号</div>
          <div>用例名称</div>
          <div>创建时间</div>
          <div>AI评审</div>
          <div>评审状态</div>
          <div>专家意见</div>
          <div>操作</div>
        </div>

        <div className="divide-y">
          {cases.map((caseItem, index) => {
            const status = statusConfig[caseItem.status];
            const quality = qualityConfig[caseItem.aiQuality];
            const expertOpinion = expertOpinionConfig[caseItem.expertOpinion];
            const StatusIcon = status.icon;
            const ExpertOpinionIcon = expertOpinion.icon;

            return (
              <div
                key={caseItem.id}
                className="grid grid-cols-[100px_100px_1fr_140px_80px_100px_100px_120px] gap-2 px-6 py-4 hover:bg-muted/30 transition-colors animate-fade-in"
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
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  {caseItem.createdAt}
                </div>
                <div className="flex items-center">
                  <Badge variant="outline" className={cn("text-xs gap-1", quality.className)}>
                    <Star className="w-3 h-3" />
                    {quality.label}
                  </Badge>
                </div>
                <div className="flex items-center">
                  <Badge
                    variant="outline"
                    className={cn("text-xs gap-1", status.className)}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </Badge>
                </div>
                <div className="flex items-center">
                  <Badge
                    variant="outline"
                    className={cn("text-xs gap-1", expertOpinion.className)}
                    onClick={() => caseItem.expertOpinion === "rejected" && handleViewReject(caseItem)}
                  >
                    <ExpertOpinionIcon className="w-3 h-3" />
                    {expertOpinion.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {caseItem.status === "pending" && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleAdopt(caseItem)}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        采纳
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleOpenReject(caseItem)}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        不采纳
                      </Button>
                    </>
                  )}
                  {caseItem.status !== "pending" && (
                    <span className="text-xs text-muted-foreground">已评审</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>不采纳用例</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>专家名称 <span className="text-muted-foreground text-xs">(选填)</span></Label>
              <Input
                placeholder="请输入专家名称..."
                value={expertName}
                onChange={(e) => setExpertName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>选择标签 <span className="text-red-500">*</span></Label>
              <div className="flex flex-wrap gap-2">
                {rejectTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={cn(
                      "cursor-pointer transition-colors",
                      selectedTag === tag
                        ? "bg-red-500/10 text-red-600 border-red-300"
                        : "hover:bg-muted"
                    )}
                    onClick={() => setSelectedTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>不采纳原因</Label>
              <Textarea
                placeholder="请输入不采纳的具体原因..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={!selectedTag}
            >
              确认不采纳
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Reject Reason Dialog - Multiple Experts */}
      <Dialog open={viewRejectDialogOpen} onOpenChange={setViewRejectDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>不采纳详情</DialogTitle>
          </DialogHeader>
          {viewingCase && (
            <div className="space-y-4 flex-1 overflow-auto">
              <div>
                <Label className="text-muted-foreground">用例名称</Label>
                <p className="mt-1 font-medium">{viewingCase.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">用例编号</Label>
                <p className="mt-1 font-mono text-sm">{viewingCase.caseCode}</p>
              </div>
              
              {/* Multiple expert rejections */}
              <div className="space-y-3">
                <Label className="text-muted-foreground">
                  专家意见 ({viewingCase.rejections?.length || 0} 位专家不采纳)
                </Label>
                {viewingCase.rejections?.map((rejection, idx) => (
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
                {(!viewingCase.rejections || viewingCase.rejections.length === 0) && (
                  <p className="text-sm text-muted-foreground">暂无专家评审意见</p>
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
    </div>
  );
}
