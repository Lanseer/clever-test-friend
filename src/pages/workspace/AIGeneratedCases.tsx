import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SmartDesignChat } from "@/components/workspace/SmartDesignChat";
import { SmartDesignTaskList } from "@/components/workspace/SmartDesignTaskList";
import { CreateSmartDesignTaskDialog } from "@/components/workspace/CreateSmartDesignTaskDialog";
import { GenerationRecordsPanel, GenerationRecordItem, RecordStatus } from "@/components/workspace/GenerationRecordsPanel";
import { GenerationResultSidebar } from "@/components/workspace/GenerationResultSidebar";
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
  testPhase?: string;
  testCategory?: string;
}

interface Dimension {
  id: string;
  name: string;
  caseCount: number;
  testPoints: { id: string; name: string; caseCount: number }[];
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
    testPhase: "sit",
    testCategory: "functional",
  },
  {
    id: "2",
    name: "支付接口测试用例生成",
    selfReviewTotal: 0,
    selfReviewPassed: 0,
    expertReviewTotal: 0,
    expertReviewPassed: 0,
    createdAt: "2024-01-15 14:20",
    testPhase: "uat",
    testCategory: "data",
  },
];

const initialRecordsByTask: Record<string, GenerationRecordItem[]> = {
  "1": [
    { id: "gen-1-1", batchNumber: 1, scenarioCount: 8, caseCount: 24, createdAt: "2024-01-15 10:30", status: "completed" },
    { id: "gen-1-2", batchNumber: 2, scenarioCount: 12, caseCount: 36, createdAt: "2024-01-16 14:20", status: "reviewing" },
  ],
  "2": [],
};

const mockDimensions: Dimension[] = [
  {
    id: "dim-1",
    name: "用户认证模块",
    caseCount: 5,
    testPoints: [
      { id: "tp-1", name: "用户登录", caseCount: 3 },
      { id: "tp-2", name: "用户注册", caseCount: 2 },
    ],
  },
  {
    id: "dim-2",
    name: "密码管理模块",
    caseCount: 3,
    testPoints: [
      { id: "tp-3", name: "密码重置", caseCount: 3 },
    ],
  },
];

export default function AIGeneratedCases() {
  const navigate = useNavigate();
  const { workspaceId } = useParams();
  const { toast } = useToast();
  
  const [tasks, setTasks] = useState<SmartDesignTask[]>(mockTasks);
  const [recordsByTask, setRecordsByTask] = useState<Record<string, GenerationRecordItem[]>>(initialRecordsByTask);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(mockTasks[0]?.id || null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [noTaskAlertOpen, setNoTaskAlertOpen] = useState(false);
  const [resultSidebarOpen, setResultSidebarOpen] = useState(false);
  const [pendingGenerationData, setPendingGenerationData] = useState<{
    scenarioCount: number;
    caseCount: number;
    dimensions: Dimension[];
  } | null>(null);

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null;
  const currentRecords = selectedTaskId ? recordsByTask[selectedTaskId] || [] : [];

  const handleSelectTask = (taskId: string) => {
    setSelectedTaskId(taskId);
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
      testPhase: data.testPhase,
      testCategory: data.testCategory,
    };
    setTasks([newTask, ...tasks]);
    setRecordsByTask({ ...recordsByTask, [newTask.id]: [] });
    setSelectedTaskId(newTask.id);
    toast({
      title: "创建成功",
      description: `任务"${data.name}"已创建`,
    });
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    const newRecords = { ...recordsByTask };
    delete newRecords[taskId];
    setRecordsByTask(newRecords);
    if (selectedTaskId === taskId) {
      setSelectedTaskId(tasks[0]?.id || null);
    }
    toast({
      title: "删除成功",
      description: "任务已删除",
    });
  };

  const handleGenerationComplete = (scenarioCount: number, caseCount: number) => {
    // Store pending generation data for the sidebar
    setPendingGenerationData({
      scenarioCount,
      caseCount,
      dimensions: mockDimensions,
    });
  };

  const handleViewGenerationResult = () => {
    setResultSidebarOpen(true);
  };

  const handleAbandonGeneration = () => {
    setPendingGenerationData(null);
    setResultSidebarOpen(false);
    toast({
      title: "已放弃",
      description: "本次生成数据已放弃",
    });
  };

  const handleStartReview = () => {
    if (!selectedTaskId || !pendingGenerationData) return;
    
    const existingRecords = recordsByTask[selectedTaskId] || [];
    const newRecord: GenerationRecordItem = {
      id: `gen-${Date.now()}`,
      batchNumber: existingRecords.length + 1,
      scenarioCount: pendingGenerationData.scenarioCount,
      caseCount: pendingGenerationData.caseCount,
      createdAt: new Date().toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).replace(/\//g, "-"),
      status: "reviewing",
    };

    setRecordsByTask(prev => ({
      ...prev,
      [selectedTaskId]: [...(prev[selectedTaskId] || []), newRecord],
    }));
    
    setPendingGenerationData(null);
    setResultSidebarOpen(false);
    
    // Navigate to case review page
    navigate(`/workspace/${workspaceId}/management/ai-cases/${selectedTaskId}`);
  };

  const handleRecordClick = (recordId: string) => {
    // Navigate to case review page for this record
    navigate(`/workspace/${workspaceId}/management/ai-cases/${selectedTaskId}`);
  };

  return (
    <div className="h-[calc(100vh)] -m-6 flex overflow-hidden relative">
      {/* Clean Light Background */}
      <div className="absolute inset-0 bg-gray-50 dark:bg-gray-900" />

      {/* Left Panel - Task List (Narrower) */}
      <div className="w-56 flex-shrink-0 border-r border-sky-300/30 relative z-10">
        <SmartDesignTaskList
          tasks={tasks}
          selectedTaskId={selectedTaskId}
          onSelectTask={handleSelectTask}
          onReport={handleReport}
          onDelete={handleDeleteTask}
          onCreateTask={() => setCreateDialogOpen(true)}
        />
      </div>

      {/* Middle Panel - Chat Area */}
      <div className="flex-1 relative z-10">
        <SmartDesignChat
          selectedTaskId={selectedTaskId}
          selectedTask={selectedTask}
          records={currentRecords}
          onNoTaskPrompt={handleNoTaskPrompt}
          onGenerationComplete={handleGenerationComplete}
          onViewGenerationResult={handleViewGenerationResult}
        />
      </div>

      {/* Right Panel - Generation Records */}
      <div className="w-72 flex-shrink-0 relative z-10">
        <GenerationRecordsPanel
          records={currentRecords}
          onRecordClick={handleRecordClick}
        />
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

      {/* Generation Result Sidebar */}
      {pendingGenerationData && (
        <GenerationResultSidebar
          open={resultSidebarOpen}
          onOpenChange={setResultSidebarOpen}
          totalScenarios={pendingGenerationData.scenarioCount}
          totalCases={pendingGenerationData.caseCount}
          dimensions={pendingGenerationData.dimensions}
          onAbandon={handleAbandonGeneration}
          onStartReview={handleStartReview}
        />
      )}
    </div>
  );
}
