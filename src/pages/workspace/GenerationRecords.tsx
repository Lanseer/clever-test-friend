import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, CheckCircle, XCircle, Clock, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AIThinkingSidebar } from "@/components/workspace/AIThinkingSidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CaseSourceInfo } from "@/components/workspace/CaseSourceInfo";

type BatchStatus = "generating" | "completed" | "failed";

interface GenerationBatch {
  id: string;
  batchCode: string;
  status: BatchStatus;
  startTime: string;
  endTime?: string;
  totalCases: number;
  currentStage?: string;
  progress?: number;
}

const mockBatches: GenerationBatch[] = [
  {
    id: "1",
    batchCode: "BATCH-001",
    status: "generating",
    startTime: "2024-01-15 10:30:00",
    totalCases: 0,
    currentStage: "generating",
    progress: 65,
  },
  {
    id: "2",
    batchCode: "BATCH-002",
    status: "completed",
    startTime: "2024-01-15 09:00:00",
    endTime: "2024-01-15 09:15:30",
    totalCases: 24,
  },
  {
    id: "3",
    batchCode: "BATCH-003",
    status: "completed",
    startTime: "2024-01-14 16:00:00",
    endTime: "2024-01-14 16:12:45",
    totalCases: 18,
  },
  {
    id: "4",
    batchCode: "BATCH-004",
    status: "failed",
    startTime: "2024-01-14 14:30:00",
    endTime: "2024-01-14 14:31:20",
    totalCases: 0,
  },
  {
    id: "5",
    batchCode: "BATCH-005",
    status: "completed",
    startTime: "2024-01-13 11:00:00",
    endTime: "2024-01-13 11:18:00",
    totalCases: 32,
  },
];

const statusConfig: Record<BatchStatus, { label: string; icon: typeof Loader2; className: string }> = {
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

// Mock BDD content for sidebar
const getMockBddContent = () => {
  return `Feature: 用户登录功能

  Scenario: 用户使用有效的用户名和密码登录系统
    Given 用户已经注册并拥有有效的账户
    And 用户位于登录页面
    When 用户输入正确的用户名 "testuser"
    And 用户输入正确的密码 "Password123"
    And 用户点击登录按钮
    Then 系统应该验证用户凭证
    And 用户应该被重定向到主页
    And 系统应该显示欢迎消息

  Examples:
    | 用户名    | 密码        | 预期结果   |
    | testuser  | Password123 | 登录成功   |
    | admin     | Admin@456   | 登录成功   |
    | user01    | User#789    | 登录成功   |`;
};

export default function GenerationRecords() {
  const navigate = useNavigate();
  const { workspaceId, recordId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<GenerationBatch | null>(null);
  const [caseDetailOpen, setCaseDetailOpen] = useState(false);
  const [selectedCaseBatch, setSelectedCaseBatch] = useState<GenerationBatch | null>(null);

  const handleViewProgress = (batch: GenerationBatch) => {
    setSelectedBatch(batch);
    setSidebarOpen(true);
  };

  const handleViewCases = (batch: GenerationBatch) => {
    setSelectedCaseBatch(batch);
    setCaseDetailOpen(true);
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
            <BreadcrumbPage>生成记录</BreadcrumbPage>
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
        <div>
          <h1 className="text-2xl font-bold text-foreground">生成记录</h1>
          <p className="text-muted-foreground mt-1">
            查看任务 AI-001 的所有生成批次记录
          </p>
        </div>
      </div>

      {/* Batch List */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="grid grid-cols-[120px_1fr_100px_100px_140px] gap-4 px-6 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
          <div>批次编号</div>
          <div>生成时间</div>
          <div>状态</div>
          <div>用例数量</div>
          <div>操作</div>
        </div>

        <div className="divide-y">
          {mockBatches.map((batch, index) => {
            const status = statusConfig[batch.status];
            const StatusIcon = status.icon;
            const isGenerating = batch.status === "generating";

            return (
              <div
                key={batch.id}
                className="grid grid-cols-[120px_1fr_100px_100px_140px] gap-4 px-6 py-4 hover:bg-muted/30 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center">
                  <Badge variant="outline" className="font-mono text-xs">
                    {batch.batchCode}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{batch.startTime}</span>
                  {batch.endTime && (
                    <>
                      <span className="text-muted-foreground">→</span>
                      <span>{batch.endTime}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center">
                  <Badge variant="outline" className={cn("text-xs gap-1", status.className)}>
                    <StatusIcon className={cn("w-3 h-3", isGenerating && "animate-spin")} />
                    {status.label}
                  </Badge>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium">
                    {batch.totalCases > 0 ? `${batch.totalCases} 个` : "-"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isGenerating ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-3 text-xs gap-1"
                      onClick={() => handleViewProgress(batch)}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      查看进度
                    </Button>
                  ) : batch.status === "completed" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-3 text-xs gap-1"
                      onClick={() => handleViewCases(batch)}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      查看用例
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AIThinkingSidebar
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        batch={selectedBatch}
      />

      {/* 案例详情侧边栏 */}
      <Sheet open={caseDetailOpen} onOpenChange={setCaseDetailOpen}>
        <SheetContent className="w-[520px] sm:max-w-[520px] flex flex-col">
          <SheetHeader>
            <SheetTitle>案例详情</SheetTitle>
          </SheetHeader>
          
          {selectedCaseBatch && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-6 py-4">
                  {/* 批次信息 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">批次编号</Label>
                      <Badge variant="outline" className="text-xs font-mono">
                        {selectedCaseBatch.batchCode}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">用例数量</Label>
                      <Badge variant="outline" className="text-xs">
                        {selectedCaseBatch.totalCases} 个
                      </Badge>
                    </div>
                  </div>
                  
                  {/* 案例来源详情 */}
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs">案例来源</Label>
                    <CaseSourceInfo caseId={selectedCaseBatch.id} showHeader={false} />
                  </div>
                  
                  {/* BDD 完整内容 - 单一文本域展示 */}
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs">案例详情 (BDD)</Label>
                    <Textarea
                      className="min-h-[300px] font-mono text-xs bg-muted/30 resize-none"
                      value={getMockBddContent()}
                      readOnly
                    />
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
