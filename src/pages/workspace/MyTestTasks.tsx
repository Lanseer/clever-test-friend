import { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { FileText, ChevronRight, Plus, ArrowLeft, ClipboardList, Download, Calendar, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CreateSmartDesignTaskDialog } from "@/components/workspace/CreateSmartDesignTaskDialog";
import { Card, CardContent } from "@/components/ui/card";

interface TestTask {
  id: string;
  name: string;
  testPhase: string;
  testCategory: string;
}

interface GeneratedCaseFile {
  id: string;
  name: string;
  version: string;
  createdAt: string;
  scenarioCount: number;
  caseCount: number;
}

const mockTasks: TestTask[] = [
  { id: "1", name: "用户登录模块测试", testPhase: "SIT测试", testCategory: "功能测试" },
  { id: "2", name: "支付流程测试", testPhase: "UAT测试", testCategory: "功能测试" },
  { id: "3", name: "订单管理测试", testPhase: "集成测试", testCategory: "数据测试" },
  { id: "4", name: "商品搜索测试", testPhase: "SIT测试", testCategory: "功能测试" },
  { id: "5", name: "购物车功能测试", testPhase: "UAT测试", testCategory: "专项测试" },
];

const mockGeneratedCaseFiles: Record<string, GeneratedCaseFile[]> = {
  "1": [
    { id: "f1", name: "2026-01-23用户登录模块测试案例", version: "V1.0", createdAt: "2026-01-23 14:30", scenarioCount: 12, caseCount: 45 },
    { id: "f2", name: "2026-01-22用户登录模块测试案例", version: "V0.9", createdAt: "2026-01-22 10:15", scenarioCount: 10, caseCount: 38 },
  ],
  "2": [
    { id: "f3", name: "2026-01-22支付流程测试案例", version: "V1.2", createdAt: "2026-01-22 16:45", scenarioCount: 8, caseCount: 32 },
  ],
  "3": [
    { id: "f4", name: "2026-01-21订单管理测试案例", version: "V0.8", createdAt: "2026-01-21 09:20", scenarioCount: 15, caseCount: 52 },
  ],
  "4": [
    { id: "f5", name: "2026-01-20商品搜索测试案例", version: "V1.0", createdAt: "2026-01-20 11:00", scenarioCount: 6, caseCount: 24 },
  ],
  "5": [
    { id: "f6", name: "2026-01-20购物车功能测试案例", version: "V1.1", createdAt: "2026-01-20 15:30", scenarioCount: 9, caseCount: 36 },
  ],
};

export default function MyTestTasks() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTaskId = searchParams.get("taskId") || mockTasks[0]?.id;
  
  const [selectedTaskId, setSelectedTaskId] = useState<string>(initialTaskId);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const selectedTask = mockTasks.find(t => t.id === selectedTaskId);
  const generatedFiles = mockGeneratedCaseFiles[selectedTaskId] || [];

  const handleBack = () => {
    navigate(`/workspace/${workspaceId}/management/ai-cases`);
  };

  const handleOpenReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/workspace/${workspaceId}/management/ai-cases/record-1/deliverable-report?name=${encodeURIComponent(selectedTask?.name || "任务")}`);
  };

  const handleOpenCaseReview = (fileId: string) => {
    // Navigate to the case review page with dimension hierarchy view
    navigate(`/workspace/${workspaceId}/management/ai-cases/record-1/case-review`);
  };

  const handleCreateTask = (data: { name: string; testPhase: string; testCategory: string; tags: string[] }) => {
    toast.success(`任务 "${data.name}" 创建成功`);
  };

  const handleDownload = (e: React.MouseEvent, fileName: string) => {
    e.stopPropagation();
    toast.success(`开始下载 ${fileName}`);
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
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                            {task.testPhase}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                            {task.testCategory}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-primary"
                        onClick={handleOpenReport}
                      >
                        <ClipboardList className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - Test Case Versions */}
        <div className="flex-1 flex flex-col bg-background/50">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium">{selectedTask?.name || "测试案例"}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  共 {generatedFiles.length} 个版本
                </p>
              </div>
            </div>
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
                    <Card
                      key={file.id}
                      className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/30"
                      onClick={() => handleOpenCaseReview(file.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          {/* Icon */}
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-sky-500/20">
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-medium truncate">{file.name}</h3>
                              <Badge className="bg-sky-100 text-sky-700 border-sky-200 text-[10px]">
                                {file.version}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {file.createdAt}
                              </span>
                              <span className="flex items-center gap-1">
                                <Layers className="w-3 h-3" />
                                {file.scenarioCount} 场景 · {file.caseCount} 用例
                              </span>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              onClick={(e) => handleDownload(e, file.name)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              onClick={handleOpenReport}
                            >
                              <ClipboardList className="w-4 h-4" />
                            </Button>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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
