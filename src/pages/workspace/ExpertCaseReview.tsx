import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Star, CheckCircle, XCircle, Users, ArrowLeft, ArrowRight, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CaseSourceInfo } from "@/components/workspace/CaseSourceInfo";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

type AIScore = "excellent" | "qualified" | "unqualified";
type ExpertOpinion = "passed" | "rejected" | "pending";
type CaseNature = "positive" | "negative";

interface ReviewCase {
  id: string;
  code: string;
  name: string;
  nature: CaseNature;
  aiScore: AIScore;
  aiScoreSummary: string;
  expertOpinion: ExpertOpinion;
  bddContent: string;
  sourceDocument: string;
}

const aiScoreConfig: Record<AIScore, { label: string; icon: typeof Star; className: string }> = {
  excellent: {
    label: "优秀",
    icon: Star,
    className: "bg-amber-500/10 text-amber-600 border-amber-200 hover:bg-amber-500/20",
  },
  qualified: {
    label: "合格",
    icon: CheckCircle,
    className: "bg-green-500/10 text-green-600 border-green-200 hover:bg-green-500/20",
  },
  unqualified: {
    label: "不合格",
    icon: XCircle,
    className: "bg-red-500/10 text-red-600 border-red-200 hover:bg-red-500/20",
  },
};

const expertOpinionConfig: Record<ExpertOpinion, { label: string; className: string }> = {
  passed: {
    label: "通过",
    className: "bg-green-500/10 text-green-600 border-green-200",
  },
  rejected: {
    label: "拒绝",
    className: "bg-red-500/10 text-red-600 border-red-200",
  },
  pending: {
    label: "待评审",
    className: "bg-gray-500/10 text-gray-600 border-gray-200",
  },
};

const rejectionTags = [
  "用例描述不清晰",
  "测试步骤不完整",
  "预期结果不明确",
  "覆盖场景不足",
  "与需求不符",
  "重复用例",
  "其他问题",
];

const mockCases: ReviewCase[] = [
  {
    id: "1",
    code: "TC-001",
    name: "用户登录功能验证",
    nature: "positive",
    aiScore: "excellent",
    aiScoreSummary: "用例覆盖全面，步骤清晰，预期结果明确，符合BDD规范",
    expertOpinion: "pending",
    bddContent: `Feature: 用户登录功能

Scenario: 用户使用正确的凭证登录
  Given 用户在登录页面
  When 用户输入正确的用户名 "testuser"
  And 用户输入正确的密码 "password123"
  And 用户点击登录按钮
  Then 用户应该成功登录
  And 用户应该被重定向到首页`,
    sourceDocument: `<h3>需求文档 - 用户登录</h3>
<p><strong>功能描述：</strong>系统应支持用户使用用户名和密码进行登录认证。</p>
<p><strong>验收标准：</strong></p>
<ul>
  <li>用户输入正确凭证后成功登录</li>
  <li>登录成功后跳转至首页</li>
</ul>`,
  },
  {
    id: "2",
    code: "TC-002",
    name: "登录失败处理",
    nature: "negative",
    aiScore: "qualified",
    aiScoreSummary: "用例基本完整，建议补充更多错误场景",
    expertOpinion: "pending",
    bddContent: `Feature: 登录失败处理

Scenario: 用户使用错误密码登录
  Given 用户在登录页面
  When 用户输入用户名 "testuser"
  And 用户输入错误的密码 "wrongpassword"
  And 用户点击登录按钮
  Then 系统应显示错误提示 "用户名或密码错误"
  And 用户应保持在登录页面`,
    sourceDocument: `<h3>需求文档 - 登录安全</h3>
<p><strong>功能描述：</strong>系统应正确处理登录失败情况。</p>`,
  },
  {
    id: "3",
    code: "TC-003",
    name: "用户注册表单验证",
    nature: "positive",
    aiScore: "excellent",
    aiScoreSummary: "表单验证逻辑完整，覆盖各种输入场景",
    expertOpinion: "passed",
    bddContent: `Feature: 用户注册表单验证

Scenario: 验证必填字段
  Given 用户在注册页面
  When 用户不填写任何信息
  And 用户点击注册按钮
  Then 系统应显示必填字段提示`,
    sourceDocument: `<h3>需求文档 - 用户注册</h3>
<p><strong>功能描述：</strong>系统应验证注册表单的完整性。</p>`,
  },
  {
    id: "4",
    code: "TC-004",
    name: "密码强度验证",
    nature: "positive",
    aiScore: "unqualified",
    aiScoreSummary: "缺少边界条件测试，预期结果不够明确",
    expertOpinion: "rejected",
    bddContent: `Feature: 密码强度验证

Scenario: 弱密码提示
  Given 用户在注册页面
  When 用户输入弱密码 "123"
  Then 系统应提示密码强度不足`,
    sourceDocument: `<h3>需求文档 - 密码策略</h3>
<p><strong>功能描述：</strong>系统应验证用户密码强度。</p>`,
  },
  {
    id: "5",
    code: "TC-005",
    name: "会话超时处理",
    nature: "negative",
    aiScore: "qualified",
    aiScoreSummary: "场景描述合理，但可增加更多超时边界测试",
    expertOpinion: "pending",
    bddContent: `Feature: 会话超时处理

Scenario: 用户会话超时后自动登出
  Given 用户已登录系统
  When 用户30分钟未进行任何操作
  Then 系统应自动登出用户
  And 显示会话超时提示`,
    sourceDocument: `<h3>需求文档 - 会话管理</h3>
<p><strong>功能描述：</strong>系统应在用户长时间不活动后自动结束会话。</p>`,
  },
];

export default function ExpertCaseReview() {
  const navigate = useNavigate();
  const { workspaceId, recordId } = useParams();
  
  const [cases, setCases] = useState<ReviewCase[]>(mockCases);
  const [batchReviewOpen, setBatchReviewOpen] = useState(false);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingCaseId, setRejectingCaseId] = useState<string | null>(null);
  const [selectedRejectionTag, setSelectedRejectionTag] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const pendingCases = cases.filter((c) => c.expertOpinion === "pending");
  const passedCount = cases.filter((c) => c.expertOpinion === "passed").length;
  const rejectedCount = cases.filter((c) => c.expertOpinion === "rejected").length;
  const pendingCount = cases.filter((c) => c.expertOpinion === "pending").length;

  const handlePass = (caseId: string) => {
    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, expertOpinion: "passed" as ExpertOpinion } : c))
    );
    toast.success("用例已通过");
  };

  const handleOpenRejectDialog = (caseId: string) => {
    setRejectingCaseId(caseId);
    setSelectedRejectionTag("");
    setRejectionReason("");
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = () => {
    if (rejectingCaseId) {
      setCases((prev) =>
        prev.map((c) => (c.id === rejectingCaseId ? { ...c, expertOpinion: "rejected" as ExpertOpinion } : c))
      );
      toast.success("用例已拒绝");
    }
    setRejectDialogOpen(false);
    setRejectingCaseId(null);
    
    // If in batch review, move to next
    if (batchReviewOpen && currentBatchIndex < pendingCases.length - 1) {
      setCurrentBatchIndex((prev) => prev + 1);
    } else if (batchReviewOpen) {
      setBatchReviewOpen(false);
    }
  };

  const handleBatchPass = () => {
    const currentCase = pendingCases[currentBatchIndex];
    if (currentCase) {
      handlePass(currentCase.id);
      if (currentBatchIndex < pendingCases.length - 1) {
        setCurrentBatchIndex((prev) => prev + 1);
      } else {
        setBatchReviewOpen(false);
      }
    }
  };

  const handleBatchReject = () => {
    const currentCase = pendingCases[currentBatchIndex];
    if (currentCase) {
      handleOpenRejectDialog(currentCase.id);
    }
  };

  const currentBatchCase = pendingCases[currentBatchIndex];

  const renderAIScore = (score: AIScore, summary: string) => {
    const config = aiScoreConfig[score];
    const Icon = config.icon;
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Badge variant="outline" className={`cursor-pointer ${config.className}`}>
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-2">
            <h4 className="font-medium">智能评分概要</h4>
            <p className="text-sm text-muted-foreground">{summary}</p>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  const renderExpertOpinion = (opinion: ExpertOpinion) => {
    const config = expertOpinionConfig[opinion];
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const renderNature = (nature: CaseNature) => {
    return nature === "positive" ? (
      <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">
        正向
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-200">
        反向
      </Badge>
    );
  };

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 12,
    minutes: 45,
    seconds: 30
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else if (days > 0) {
          days--;
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">欢迎参与专家评审</h1>
              <p className="text-muted-foreground mt-1">
                感谢各位专家的参与，请根据您的专业知识对以下测试用例进行评审。您的意见对我们非常重要。
              </p>
            </div>
          </div>
          
          {/* Countdown Timer */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>距离评审结束</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <div className="bg-primary text-primary-foreground font-mono text-xl font-bold px-3 py-2 rounded-lg min-w-[52px] text-center shadow-sm">
                  {formatNumber(timeLeft.days)}
                </div>
                <span className="text-xs text-muted-foreground mt-1">天</span>
              </div>
              <span className="text-xl font-bold text-muted-foreground pb-5">:</span>
              <div className="flex flex-col items-center">
                <div className="bg-primary text-primary-foreground font-mono text-xl font-bold px-3 py-2 rounded-lg min-w-[52px] text-center shadow-sm">
                  {formatNumber(timeLeft.hours)}
                </div>
                <span className="text-xs text-muted-foreground mt-1">时</span>
              </div>
              <span className="text-xl font-bold text-muted-foreground pb-5">:</span>
              <div className="flex flex-col items-center">
                <div className="bg-primary text-primary-foreground font-mono text-xl font-bold px-3 py-2 rounded-lg min-w-[52px] text-center shadow-sm">
                  {formatNumber(timeLeft.minutes)}
                </div>
                <span className="text-xs text-muted-foreground mt-1">分</span>
              </div>
              <span className="text-xl font-bold text-muted-foreground pb-5">:</span>
              <div className="flex flex-col items-center">
                <div className="bg-primary text-primary-foreground font-mono text-xl font-bold px-3 py-2 rounded-lg min-w-[52px] text-center shadow-sm">
                  {formatNumber(timeLeft.seconds)}
                </div>
                <span className="text-xs text-muted-foreground mt-1">秒</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold">{cases.length}</div>
          <div className="text-sm text-muted-foreground">总用例数</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{passedCount}</div>
          <div className="text-sm text-muted-foreground">已通过</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
          <div className="text-sm text-muted-foreground">已拒绝</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
          <div className="text-sm text-muted-foreground">待评审</div>
        </div>
      </div>

      {/* Batch Review Button */}
      <div className="flex justify-end mb-4">
        <Button 
          onClick={() => {
            setCurrentBatchIndex(0);
            setBatchReviewOpen(true);
          }}
          disabled={pendingCases.length === 0}
          className="gap-2"
        >
          <Users className="w-4 h-4" />
          批量评审 ({pendingCases.length})
        </Button>
      </div>

      {/* Cases Table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">编号</TableHead>
              <TableHead>场景</TableHead>
              <TableHead className="w-[120px]">智能审查结果</TableHead>
              <TableHead className="w-[100px]">专家意见</TableHead>
              <TableHead className="w-[150px] text-center">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.map((caseItem) => (
              <TableRow key={caseItem.id}>
                <TableCell className="font-mono text-xs">{caseItem.code}</TableCell>
                <TableCell>{caseItem.name}</TableCell>
                <TableCell>{renderAIScore(caseItem.aiScore, caseItem.aiScoreSummary)}</TableCell>
                <TableCell>{renderExpertOpinion(caseItem.expertOpinion)}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => handlePass(caseItem.id)}
                      disabled={caseItem.expertOpinion !== "pending"}
                    >
                      通过
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleOpenRejectDialog(caseItem.id)}
                      disabled={caseItem.expertOpinion !== "pending"}
                    >
                      拒绝
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Batch Review Dialog */}
      <Dialog open={batchReviewOpen} onOpenChange={setBatchReviewOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>批量评审 ({currentBatchIndex + 1}/{pendingCases.length})</span>
              {currentBatchCase && (
                <span className="text-sm font-normal text-muted-foreground">
                  {currentBatchCase.code} - {currentBatchCase.name}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {currentBatchCase && (
            <div className="flex-1 overflow-hidden grid grid-cols-2 gap-4">
              {/* Left: Case Content */}
              <div className="flex flex-col overflow-hidden">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-medium">用例内容</h3>
                  {renderNature(currentBatchCase.nature)}
                  {renderAIScore(currentBatchCase.aiScore, currentBatchCase.aiScoreSummary)}
                </div>
                <ScrollArea className="flex-1 border rounded-lg p-4 bg-muted/30">
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {currentBatchCase.bddContent}
                  </pre>
                </ScrollArea>
              </div>

              {/* Right: Case Source */}
              <div className="flex flex-col overflow-hidden">
                <h3 className="font-medium mb-3">案例来源</h3>
                <CaseSourceInfo caseId={currentBatchCase.id} showHeader={false} className="flex-1" />
              </div>
            </div>
          )}

          {/* Navigation and Actions */}
          <div className="flex items-center justify-between pt-4 border-t mt-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentBatchIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentBatchIndex === 0}
                className="gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                上一个
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentBatchIndex((prev) => Math.min(pendingCases.length - 1, prev + 1))}
                disabled={currentBatchIndex >= pendingCases.length - 1}
                className="gap-1"
              >
                下一个
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleBatchReject}
              >
                拒绝
              </Button>
              <Button onClick={handleBatchPass}>
                通过
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>拒绝用例</AlertDialogTitle>
            <AlertDialogDescription>
              请选择拒绝原因并填写详细说明
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>拒绝原因标签</Label>
              <div className="flex flex-wrap gap-2">
                {rejectionTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedRejectionTag === tag ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedRejectionTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>详细原因</Label>
              <Textarea
                placeholder="请输入详细的拒绝原因..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmReject}
              disabled={!selectedRejectionTag}
              className="bg-red-600 hover:bg-red-700"
            >
              确认拒绝
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
