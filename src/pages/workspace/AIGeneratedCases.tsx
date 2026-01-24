import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Sparkles } from "lucide-react";
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

interface GenerationRecord {
  id: string;
  count: number;
  createdAt: string;
  status: "pending_confirm" | "confirmed";
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
];

const initialRecordsByTask: Record<string, GenerationRecord[]> = {
  "1": [
    { id: "gen-1-1", count: 24, createdAt: "2024-01-15 10:30", status: "confirmed" },
  ],
  "2": [],
};

export default function AIGeneratedCases() {
  const navigate = useNavigate();
  const { workspaceId } = useParams();
  const { toast } = useToast();
  
  const [tasks, setTasks] = useState<SmartDesignTask[]>(mockTasks);
  const [recordsByTask, setRecordsByTask] = useState<Record<string, GenerationRecord[]>>(initialRecordsByTask);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(mockTasks[0]?.id || null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [noTaskAlertOpen, setNoTaskAlertOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingRecordId, setPendingRecordId] = useState<string | null>(null);

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null;
  const currentRecords = selectedTaskId ? recordsByTask[selectedTaskId] || [] : [];

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
    setRecordsByTask({ ...recordsByTask, [newTask.id]: [] });
    setSelectedTaskId(newTask.id);
    toast({
      title: "创建成功",
      description: `任务"${data.name}"已创建`,
    });
  };

  const handleGenerationComplete = () => {
    if (!selectedTaskId) return;
    
    const newRecord: GenerationRecord = {
      id: `gen-${Date.now()}`,
      count: Math.floor(Math.random() * 20) + 15,
      createdAt: new Date().toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).replace(/\//g, "-"),
      status: "pending_confirm",
    };

    setRecordsByTask(prev => ({
      ...prev,
      [selectedTaskId]: [newRecord, ...(prev[selectedTaskId] || [])],
    }));
  };

  const handleConfirmResult = (recordId: string) => {
    setPendingRecordId(recordId);
    setConfirmDialogOpen(true);
  };

  const handleConfirmGeneration = () => {
    if (!selectedTaskId || !pendingRecordId) return;
    
    setRecordsByTask(prev => ({
      ...prev,
      [selectedTaskId]: (prev[selectedTaskId] || []).map(r => 
        r.id === pendingRecordId ? { ...r, status: "confirmed" as const } : r
      ),
    }));
    
    setPendingRecordId(null);
    toast({
      title: "确认成功",
      description: "本次生成用例已确认，可以进行评审",
    });
  };

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      {/* Main Content - Split into Top (Chat) and Bottom (Tasks) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Section - Chat Area (larger) */}
        <div className="flex-[3] border-b border-border/50 flex min-h-0">
          {/* Left - Generation Records */}
          <div className="w-56 border-r border-border/50 flex-shrink-0">
            <GenerationRecordsList
              taskId={selectedTaskId}
              taskName={selectedTask?.name || null}
              records={currentRecords}
              onConfirmResult={handleConfirmResult}
            />
          </div>

          {/* Right - Chat Area */}
          <div className="flex-1">
            <SmartDesignChat
              selectedTaskId={selectedTaskId}
              onNoTaskPrompt={handleNoTaskPrompt}
              onGenerationComplete={handleGenerationComplete}
            />
          </div>
        </div>

        {/* Bottom Section - Task Cards (smaller) */}
        <div className="flex-[1] flex flex-col min-h-0 bg-gradient-to-t from-muted/20 to-transparent">
          <div className="px-4 py-2 border-b border-border/50 flex items-center justify-between flex-shrink-0">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              智能设计任务
            </h2>
            <Button 
              size="sm" 
              className="gap-1 h-7 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-sm"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="w-3 h-3" />
              新增任务
            </Button>
          </div>
          
          <ScrollArea className="flex-1 px-4 py-2">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
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
        <AlertDialogContent className="border-border/50 bg-card/95 backdrop-blur-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>暂无智能设计任务</AlertDialogTitle>
            <AlertDialogDescription>
              您还没有智能设计任务，是否要进行创建？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-gradient-to-r from-primary to-primary/80"
              onClick={() => {
                setNoTaskAlertOpen(false);
                setCreateDialogOpen(true);
              }}
            >
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
