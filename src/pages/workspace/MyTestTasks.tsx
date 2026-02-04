import { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { FileText, Plus, ArrowLeft, ClipboardList, MoreHorizontal, Pencil, Trash2, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CreateSmartDesignTaskDialog } from "@/components/workspace/CreateSmartDesignTaskDialog";
import { Card, CardContent } from "@/components/ui/card";
import { CaseFileCard, CaseFileData } from "@/components/workspace/CaseFileCard";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface TestTask {
  id: string;
  name: string;
  testPhase: string;
  testCategory: string;
}

const mockTasks: TestTask[] = [
  { id: "1", name: "用户登录模块测试", testPhase: "SIT测试", testCategory: "功能测试" },
  { id: "2", name: "支付流程测试", testPhase: "UAT测试", testCategory: "功能测试" },
  { id: "3", name: "订单管理测试", testPhase: "集成测试", testCategory: "数据测试" },
  { id: "4", name: "商品搜索测试", testPhase: "SIT测试", testCategory: "功能测试" },
  { id: "5", name: "购物车功能测试", testPhase: "UAT测试", testCategory: "专项测试" },
];

const mockGeneratedCaseFiles: Record<string, CaseFileData[]> = {
  "1": [
    { 
      id: "f1", 
      name: "2026-01-23用户登录模块测试案例", 
      version: "V1.0", 
      createdAt: "2026-01-23 14:30", 
      adoptedCount: 32, 
      needsImprovementCount: 8, 
      discardedCount: 5,
      statusTag: "审查完成",
      externalReview: { total: 3, completed: 2, inProgress: 1 }
    },
    { 
      id: "f2", 
      name: "2026-01-22用户登录模块测试案例", 
      version: "V0.9", 
      createdAt: "2026-01-22 10:15", 
      adoptedCount: 28, 
      needsImprovementCount: 6, 
      discardedCount: 4,
      statusTag: "审查中",
      externalReview: { total: 1, completed: 0, inProgress: 1 }
    },
  ],
  "2": [
    { 
      id: "f3", 
      name: "2026-01-22支付流程测试案例", 
      version: "V1.2", 
      createdAt: "2026-01-22 16:45", 
      adoptedCount: 24, 
      needsImprovementCount: 5, 
      discardedCount: 3,
      statusTag: "审查中",
      externalReview: { total: 2, completed: 1, inProgress: 1 }
    },
  ],
  "3": [
    { 
      id: "f4", 
      name: "2026-01-21订单管理测试案例", 
      version: "V0.8", 
      createdAt: "2026-01-21 09:20", 
      adoptedCount: 38, 
      needsImprovementCount: 10, 
      discardedCount: 4,
      externalReview: { total: 0, completed: 0, inProgress: 0 }
    },
  ],
  "4": [
    { 
      id: "f5", 
      name: "2026-01-20商品搜索测试案例", 
      version: "V1.0", 
      createdAt: "2026-01-20 11:00", 
      adoptedCount: 18, 
      needsImprovementCount: 4, 
      discardedCount: 2,
      statusTag: "审查完成",
      externalReview: { total: 1, completed: 1, inProgress: 0 }
    },
  ],
  "5": [
    { 
      id: "f6", 
      name: "2026-01-20购物车功能测试案例", 
      version: "V1.1", 
      createdAt: "2026-01-20 15:30", 
      adoptedCount: 28, 
      needsImprovementCount: 6, 
      discardedCount: 2,
      statusTag: "审查中",
      externalReview: { total: 2, completed: 2, inProgress: 0 }
    },
  ],
};

export default function MyTestTasks() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTaskId = searchParams.get("taskId") || mockTasks[0]?.id;
  
  const [selectedTaskId, setSelectedTaskId] = useState<string>(initialTaskId);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [caseFiles, setCaseFiles] = useState(mockGeneratedCaseFiles);

  const selectedTask = mockTasks.find(t => t.id === selectedTaskId);
  const generatedFiles = caseFiles[selectedTaskId] || [];

  const handleBack = () => {
    navigate(`/workspace/${workspaceId}/management/ai-cases`);
  };

  const handleOpenTaskReport = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    navigate(`/workspace/${workspaceId}/management/ai-cases/${taskId}/report`);
  };

  const handleOpenDeliverableReport = (e: React.MouseEvent, fileName: string) => {
    e.stopPropagation();
    navigate(`/workspace/${workspaceId}/management/ai-cases/record-1/deliverable-report?name=${encodeURIComponent(fileName)}`);
  };

  const handleOpenCaseReview = (fileId: string) => {
    navigate(`/workspace/${workspaceId}/management/ai-cases/record-1/case-review`);
  };

  const handleCreateTask = (data: { name: string; testPhase: string; testCategory: string; tags: string[] }) => {
    toast.success(`任务 "${data.name}" 创建成功`);
  };

  const handleOpenExpertReview = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    navigate(`/workspace/${workspaceId}/management/ai-cases/record-1/expert-review-records`);
  };

  const handleTagChange = (fileId: string, tag: string | undefined) => {
    setCaseFiles(prev => {
      const updated = { ...prev };
      for (const taskId in updated) {
        updated[taskId] = updated[taskId].map(f => 
          f.id === fileId ? { ...f, statusTag: tag } : f
        );
      }
      return updated;
    });
  };

  const handleEditTask = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    toast.info(`编辑任务 ${taskId}`);
  };

  const handleDeleteTask = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    toast.info(`删除任务 ${taskId}`);
  };

  const handleInitiateExternalReview = () => {
    navigate(`/workspace/${workspaceId}/management/ai-cases/record-1/initiate-expert-review`);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="p-4 border-b bg-background/80 backdrop-blur-sm flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={handleBack} className="hover:bg-muted">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">我的测试任务</h1>
          <p className="text-sm text-muted-foreground mt-0.5">管理和审查您的测试任务与案例</p>
        </div>
      </div>

      <CreateSmartDesignTaskDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onConfirm={handleCreateTask}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Task List */}
        <div className="w-80 border-r bg-muted/30 flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-sm font-medium">任务列表</h2>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 px-2 gap-1"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="w-3.5 h-3.5" />
              新建
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {mockTasks.map((task) => (
                <Card
                  key={task.id}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-md",
                    selectedTaskId === task.id
                      ? "ring-2 ring-primary bg-primary/5 shadow-md"
                      : "hover:bg-muted/50"
                  )}
                  onClick={() => setSelectedTaskId(task.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium truncate">{task.name}</h3>
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          <Badge className="text-[10px] px-1.5 py-0 h-5 bg-blue-100 text-blue-700 border-blue-200">
                            {task.testPhase}
                          </Badge>
                          <Badge className="text-[10px] px-1.5 py-0 h-5 bg-amber-100 text-amber-700 border-amber-200">
                            {task.testCategory}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-1 flex-shrink-0">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-primary"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-32">
                            <DropdownMenuItem onClick={(e) => handleEditTask(e, task.id)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              编辑
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => handleDeleteTask(e, task.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-primary"
                          onClick={(e) => handleOpenTaskReport(e, task.id)}
                          title="评审报告"
                        >
                          <ClipboardList className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - Test Case Versions */}
        <div className="flex-1 flex flex-col bg-background/50">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-medium">{selectedTask?.name || "测试案例"}</h2>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1.5"
              onClick={handleInitiateExternalReview}
            >
              <UserPlus className="w-4 h-4" />
              发起外部评审
            </Button>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-4">
              {generatedFiles.length === 0 ? (
                <div className="py-16 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">暂无测试案例版本</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {generatedFiles.map((file) => (
                    <CaseFileCard
                      key={file.id}
                      file={file}
                      onCardClick={handleOpenCaseReview}
                      onReportClick={handleOpenDeliverableReport}
                      onExpertReviewClick={handleOpenExpertReview}
                      onTagChange={handleTagChange}
                    />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
