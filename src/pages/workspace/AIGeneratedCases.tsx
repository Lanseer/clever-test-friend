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

  const handleViewCases = (recordId: string) => {
    navigate(`/workspace/${workspaceId}/management/batch-cases/${recordId}`);
  };

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col relative overflow-hidden -m-6 p-6">
      {/* Enhanced Sky Blue Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-200 via-blue-100 to-indigo-200 dark:from-sky-900/60 dark:via-blue-900/40 dark:to-indigo-900/50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-100/40 via-transparent to-transparent" />
      
      {/* Animated Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[8%] left-[12%] w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-lg shadow-white/50" />
        <div className="absolute top-[15%] right-[20%] w-2 h-2 bg-sky-200 rounded-full animate-pulse shadow-lg shadow-sky-200/60" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-[5%] right-[45%] w-1 h-1 bg-white/80 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[25%] left-[5%] w-1 h-1 bg-cyan-200 rounded-full animate-pulse shadow-md shadow-cyan-200/40" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-[12%] left-[55%] w-1.5 h-1.5 bg-white/90 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
        <div className="absolute top-[6%] right-[8%] w-2 h-2 bg-sky-100 rounded-full animate-pulse shadow-lg shadow-sky-100/50" style={{ animationDelay: '0.8s' }} />
        <div className="absolute top-[20%] left-[30%] w-1 h-1 bg-indigo-200/80 rounded-full animate-pulse" style={{ animationDelay: '1.2s' }} />
        <div className="absolute top-[30%] right-[60%] w-1.5 h-1.5 bg-white/70 rounded-full animate-pulse" style={{ animationDelay: '0.7s' }} />
        <div className="absolute top-[18%] right-[35%] w-1 h-1 bg-cyan-100 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[35%] left-[20%] w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '1.8s' }} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Top Section - Chat Area */}
        <div className="flex-1 border-b border-sky-300/30 flex min-h-0">
          {/* Left - Generation Records */}
          <div className="w-44 border-r border-sky-300/30 flex-shrink-0">
            <GenerationRecordsList
              taskId={selectedTaskId}
              taskName={selectedTask?.name || null}
              records={currentRecords}
              onConfirmResult={handleConfirmResult}
              onViewCases={handleViewCases}
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

        {/* Bottom Section - Task Cards */}
        <div className="h-[200px] flex flex-col min-h-0 bg-white/30 dark:bg-background/30 backdrop-blur-sm">
          <div className="px-4 py-2 border-b border-sky-300/30 flex items-center justify-between flex-shrink-0">
            <h2 className="font-semibold text-sm flex items-center gap-2 text-sky-800 dark:text-sky-200">
              <Sparkles className="w-4 h-4 text-sky-600" />
              智能设计任务
            </h2>
            <Button 
              size="sm" 
              className="gap-1 h-7 bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 shadow-md shadow-sky-500/30"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="w-3 h-3" />
              测试任务
            </Button>
          </div>
          
          <div className="flex-1 px-4 py-3 overflow-x-auto">
            <div className="flex gap-3 h-full">
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
          </div>
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
