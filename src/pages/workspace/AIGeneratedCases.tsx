import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { SmartDesignChat, Message } from "@/components/workspace/SmartDesignChat";
import { SmartDesignTaskList, mockChatSessions } from "@/components/workspace/SmartDesignTaskList";
import { CreateSmartDesignTaskDialog } from "@/components/workspace/CreateSmartDesignTaskDialog";
import { GenerationRecordItem, RecordStatus } from "@/components/workspace/GenerationRecordsPanel";
import { GeneratedFilesPanel } from "@/components/workspace/GeneratedFilesPanel";
import { TestSpriteButton } from "@/components/workspace/TestSpriteButton";
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

interface GeneratedFile {
  id: string;
  name: string;
  scenarioCount: number;
  caseCount: number;
  createdAt: string;
}

const mockTasks: SmartDesignTask[] = [
  {
    id: "1",
    name: "用户模块自动化测试案例",
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
    name: "支付接口测试案例生成",
    selfReviewTotal: 0,
    selfReviewPassed: 0,
    expertReviewTotal: 0,
    expertReviewPassed: 0,
    createdAt: "2024-01-15 14:20",
    testPhase: "uat",
    testCategory: "data",
  },
];

const mockWorkspaces: Record<string, { name: string }> = {
  "scb": { name: "SCB" },
  "dbs": { name: "DBS" },
  "cbs": { name: "CBS" },
  "rnd": { name: "研发中心" },
};

const mockUserName = "Lanseer";

const initialRecordsByTask: Record<string, GenerationRecordItem[]> = {
  "1": [
    { id: "gen-1-1", batchNumber: 1, scenarioCount: 8, caseCount: 24, createdAt: "2024-01-15 10:30", status: "completed", taskName: "用户模块自动化测试案例", stats: { adopted: 5, improved: 2, needsImprovement: 1, discarded: 0 } },
    { id: "gen-1-2", batchNumber: 2, scenarioCount: 12, caseCount: 36, createdAt: "2024-01-16 14:20", status: "reviewing", taskName: "用户模块自动化测试案例", stats: { adopted: 8, improved: 2, needsImprovement: 2, discarded: 0 } },
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

// Mock generated files
const mockGeneratedFiles: GeneratedFile[] = [
  { id: "file-1", name: "2026-01-23生成案例_V0.1", scenarioCount: 8, caseCount: 24, createdAt: "2026-01-23T10:30:00Z" },
  { id: "file-2", name: "2026-01-24生成案例_V0.2", scenarioCount: 12, caseCount: 36, createdAt: "2026-01-24T14:20:00Z" },
];

export default function AIGeneratedCases() {
  const navigate = useNavigate();
  const { workspaceId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [tasks, setTasks] = useState<SmartDesignTask[]>(mockTasks);
  const [recordsByTask, setRecordsByTask] = useState<Record<string, GenerationRecordItem[]>>(initialRecordsByTask);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(mockTasks[0]?.id || null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [noTaskAlertOpen, setNoTaskAlertOpen] = useState(false);
  
  // Generated files state
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>(mockGeneratedFiles);
  const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);

  // Chat session management
  const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(null);
  
  const defaultMessages: Message[] = [
    {
      id: "init",
      role: "assistant",
      content: "你好！我是智能设计助手。请上传需求文档附件，我将帮你自动生成测试案例。\n\n你可以：\n• 上传文档后发送，开始生成案例\n• 询问如何优化测试覆盖率\n• 了解BDD案例设计规范",
      timestamp: new Date(),
    },
  ];

  // Mock messages for different sessions
  const sessionMessagesMap: Record<string, Message[]> = {
    "session-1": [
      { id: "s1-1", role: "assistant", content: "你好！我是智能设计助手。", timestamp: new Date() },
      { id: "s1-2", role: "user", content: "帮我生成用户登录模块的测试案例", timestamp: new Date() },
      { id: "s1-3", role: "assistant", content: "生成完成！🎉\n\n✅ 文档解析完成\n✅ 功能模块识别完成\n✅ BDD案例生成完成", timestamp: new Date(), isGenerationComplete: true, generationData: { scenarioCount: 8, caseCount: 24, fileName: "2026-01-23生成案例_V0.1" } },
    ],
    "session-2": [
      { id: "s2-1", role: "assistant", content: "你好！我是智能设计助手。", timestamp: new Date() },
      { id: "s2-2", role: "user", content: "分析这个需求文档\n\n📎 附件: 需求规格说明书.pdf", timestamp: new Date() },
      { id: "s2-3", role: "assistant", content: "正在分析您的需求文档...\n\n✅ 文档解析完成\n✅ 识别到 5 个功能模块", timestamp: new Date() },
    ],
    "session-3": [
      { id: "s3-1", role: "assistant", content: "你好！我是智能设计助手。", timestamp: new Date() },
      { id: "s3-2", role: "user", content: "优化测试覆盖率", timestamp: new Date() },
      { id: "s3-3", role: "assistant", content: "根据您当前的测试案例，我建议关注以下几个方面来提高覆盖率：\n\n1. 边界值测试\n2. 异常场景处理\n3. 并发场景测试", timestamp: new Date() },
    ],
  };

  const [chatMessages, setChatMessages] = useState<Message[]>(defaultMessages);

  // Handle review summary from URL
  useEffect(() => {
    const reviewSummaryParam = searchParams.get("reviewSummary");
    if (reviewSummaryParam) {
      try {
        const summary = JSON.parse(decodeURIComponent(reviewSummaryParam));
        // Build summary message
        const summaryMessage: Message = {
          id: `review-summary-${Date.now()}`,
          role: "assistant",
          content: `📋 **案例审查已完成**\n\n**${summary.caseName}** 本次审查了 ${summary.totalScenarios} 个场景：\n\n✅ 采纳：${summary.adopted} 个\n🔧 需完善：${summary.needsImprovement} 个\n✨ 已完善：${summary.improved} 个\n❌ 丢弃：${summary.discarded} 个\n⏳ 待审查：${summary.pending} 个\n\n案例已成功保存到测试任务中。`,
          timestamp: new Date(),
        };
        setChatMessages(prev => [...prev, summaryMessage]);
        
        // Clear the URL parameter
        searchParams.delete("reviewSummary");
        setSearchParams(searchParams, { replace: true });
      } catch (e) {
        console.error("Failed to parse review summary:", e);
      }
    }
  }, [searchParams, setSearchParams]);

  const handleSelectChatSession = (sessionId: string) => {
    setActiveChatSessionId(sessionId);
    // Load messages for the selected session
    const sessionMessages = sessionMessagesMap[sessionId] || defaultMessages;
    setChatMessages(sessionMessages);
  };

  const handleNewSession = () => {
    setActiveChatSessionId(null);
    setChatMessages(defaultMessages);
    setRightPanelOpen(false);
    setSelectedFile(null);
  };

  const handleMessagesChange = (newMessages: Message[]) => {
    setChatMessages(newMessages);
  };

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
    // Add new generated file
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const version = `V0.${generatedFiles.length + 1}`;
    const newFile: GeneratedFile = {
      id: `file-${Date.now()}`,
      name: `${dateStr}生成案例_${version}`,
      scenarioCount,
      caseCount,
      createdAt: now.toISOString(),
    };
    setGeneratedFiles([...generatedFiles, newFile]);
  };

  const handleFileClick = (file: GeneratedFile) => {
    setSelectedFile(file);
    setRightPanelOpen(true);
  };

  const handleStartReviewFromPanel = () => {
    if (!selectedTaskId) return;
    
    const existingRecords = recordsByTask[selectedTaskId] || [];
    const latestVersion = existingRecords.length > 0 
      ? `${selectedTask?.name || '任务'}_V0.${existingRecords.length}`
      : null;
    const baseVersionParam = latestVersion ? `&baseVersion=${encodeURIComponent(latestVersion)}` : '';
    navigate(`/workspace/${workspaceId}/management/ai-cases/${selectedTaskId}/case-review?source=chat${baseVersionParam}`);
  };

  return (
    <div className="h-[calc(100vh)] -m-6 flex overflow-hidden relative">
      {/* Clean Light Background */}
      <div className="absolute inset-0 bg-gray-50 dark:bg-gray-900" />

      {/* Left Panel - Sessions List */}
      <div className="w-56 flex-shrink-0 border-r border-sky-300/30 relative z-10">
        <SmartDesignTaskList
          tasks={tasks}
          selectedTaskId={selectedTaskId}
          onSelectTask={handleSelectTask}
          onReport={handleReport}
          onDelete={handleDeleteTask}
          onCreateTask={() => setCreateDialogOpen(true)}
          activeChatSessionId={activeChatSessionId}
          onSelectChatSession={handleSelectChatSession}
          onNewSession={handleNewSession}
          workspaceName={workspaceId ? mockWorkspaces[workspaceId]?.name : "工作空间"}
          userName={mockUserName}
        />
      </div>

      {/* Middle Panel - Chat Area */}
      <div className="flex-1 relative z-10">
        <SmartDesignChat
          selectedTaskId={selectedTaskId}
          selectedTask={selectedTask}
          records={currentRecords}
          messages={chatMessages}
          onMessagesChange={handleMessagesChange}
          onNoTaskPrompt={handleNoTaskPrompt}
          onGenerationComplete={handleGenerationComplete}
          onViewGenerationResult={() => {}}
          onStartReview={() => {
            if (selectedTaskId) {
              const existingRecords = recordsByTask[selectedTaskId] || [];
              const latestVersion = existingRecords.length > 0 
                ? `${selectedTask?.name || '任务'}_V0.${existingRecords.length}`
                : null;
              const baseVersionParam = latestVersion ? `&baseVersion=${encodeURIComponent(latestVersion)}` : '';
              navigate(`/workspace/${workspaceId}/management/ai-cases/${selectedTaskId}/case-review?source=chat${baseVersionParam}`);
            }
          }}
          onFileClick={handleFileClick}
          generatedFiles={generatedFiles}
        />
      </div>

      {/* Right Panel - Generated Files Detail (conditionally rendered) */}
      {rightPanelOpen && selectedFile && (
        <div className="w-80 flex-shrink-0 relative z-10">
          <GeneratedFilesPanel
            open={rightPanelOpen}
            onOpenChange={setRightPanelOpen}
            file={selectedFile}
            dimensions={mockDimensions}
            onStartReview={handleStartReviewFromPanel}
          />
        </div>
      )}

      {/* Floating Test Sprite Button */}
      <TestSpriteButton />

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
    </div>
  );
}
