import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SmartDesignChat } from "@/components/workspace/SmartDesignChat";
import { GenerationRecordsList } from "@/components/workspace/GenerationRecordsList";
import { SmartDesignTaskCard } from "@/components/workspace/SmartDesignTaskCard";
import { CreateSmartDesignTaskDialog } from "@/components/workspace/CreateSmartDesignTaskDialog";
import { ConfirmGenerationResultDialog } from "@/components/workspace/ConfirmGenerationResultDialog";
import { useToast } from "@/hooks/use-toast";
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

interface SmartDesignTask {
  id: string;
  name: string;
  selfReviewTotal: number;
  selfReviewPassed: number;
  expertReviewTotal: number;
  expertReviewPassed: number;
  createdAt: string;
}

const mockTasks: SmartDesignTask[] = [
  {
    id: "1",
    name: "用户模块自动化测试用例",
    selfReviewTotal: 500,
    selfReviewPassed: 480,
    expertReviewTotal: 480,
    expertReviewPassed: 450,
    createdAt: "2024-01-15 10:30",
  },
  {
    id: "2",
    name: "支付接口测试用例生成",
    selfReviewTotal: 0,
    selfReviewPassed: 0,
    expertReviewTotal: 0,
    expertReviewPassed: 0,
    createdAt: "2024-01-15 14:20",
  },
  {
    id: "3",
    name: "订单流程边界测试",
    selfReviewTotal: 320,
    selfReviewPassed: 300,
    expertReviewTotal: 300,
    expertReviewPassed: 280,
    createdAt: "2024-01-14 16:45",
  },
  {
    id: "5",
    name: "用户权限测试用例",
    selfReviewTotal: 180,
    selfReviewPassed: 175,
    expertReviewTotal: 175,
    expertReviewPassed: 170,
    createdAt: "2024-01-13 11:00",
  },
];

export default function AIGeneratedCases() {
  const navigate = useNavigate();
  const { workspaceId } = useParams();
  const { toast } = useToast();
  
  const [tasks, setTasks] = useState<SmartDesignTask[]>(mockTasks);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(mockTasks[0]?.id || null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [noTaskAlertOpen, setNoTaskAlertOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null;

  const handleSelectTask = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  const handleSelfReview = (taskId: string) => {
    navigate(`/workspace/${workspaceId}/management/ai-cases/${taskId}`);
  };

  const handleExpertReview = (taskId: string) => {
    navigate(`/workspace/${workspaceId}/management/ai-cases/${taskId}/expert-review`);
  };

  const handleReport = (taskId: string) => {
    navigate(`/workspace/${workspaceId}/management/ai-cases/${taskId}/report`);
  };

  const handleNoTaskPrompt = () => {
    setNoTaskAlertOpen(true);
  };

  const handleCreateTask = (data: {
    name: string;
    testPhase: string;
    testCategory: string;
    tags: string[];
  }) => {
    const newTask: SmartDesignTask = {
      id: Date.now().toString(),
      name: data.name,
      selfReviewTotal: 0,
      selfReviewPassed: 0,
      expertReviewTotal: 0,
      expertReviewPassed: 0,
      createdAt: new Date().toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).replace(/\//g, "-"),
    };
    setTasks([newTask, ...tasks]);
    setSelectedTaskId(newTask.id);
    toast({
      title: "创建成功",
      description: `任务"${data.name}"已创建`,
    });
  };

  const handleConfirmResult = (recordId: string) => {
    setConfirmDialogOpen(true);
  };

  const handleConfirmGeneration = () => {
    toast({
      title: "确认成功",
      description: "本次生成用例已确认，可以进行评审",
    });
  };

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col">
      {/* Header */}
      <div className="border-b p-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-foreground">智能用例设计</h1>
        <p className="text-muted-foreground mt-1">通过AI智能对话生成和管理测试用例</p>
      </div>

      {/* Main Content - Split into Top (Chat) and Bottom (Tasks) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Section - Chat Area */}
        <div className="h-[45%] border-b flex">
          {/* Left - Generation Records */}
          <div className="w-64 border-r flex-shrink-0">
            <GenerationRecordsList
              taskId={selectedTaskId}
              taskName={selectedTask?.name || null}
              onConfirmResult={handleConfirmResult}
            />
          </div>

          {/* Right - Chat Area */}
          <div className="flex-1">
            <SmartDesignChat
              selectedTaskId={selectedTaskId}
              onNoTaskPrompt={handleNoTaskPrompt}
            />
          </div>
        </div>

        {/* Bottom Section - Task Cards */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
            <h2 className="font-semibold text-sm">智能设计任务列表</h2>
            <Button 
              size="sm" 
              className="gap-1"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="w-4 h-4" />
              新增任务
            </Button>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tasks.map((task) => (
                <SmartDesignTaskCard
                  key={task.id}
                  task={task}
                  isSelected={task.id === selectedTaskId}
                  onSelect={handleSelectTask}
                  onSelfReview={handleSelfReview}
                  onExpertReview={handleExpertReview}
                  onReport={handleReport}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Create Task Dialog */}
      <CreateSmartDesignTaskDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onConfirm={handleCreateTask}
      />

      {/* No Task Alert */}
      <AlertDialog open={noTaskAlertOpen} onOpenChange={setNoTaskAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>暂无智能设计任务</AlertDialogTitle>
            <AlertDialogDescription>
              您还没有智能设计任务，是否要进行创建？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setNoTaskAlertOpen(false);
              setCreateDialogOpen(true);
            }}>
              创建任务
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Generation Result Dialog */}
      <ConfirmGenerationResultDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={handleConfirmGeneration}
      />
    </div>
  );
}
