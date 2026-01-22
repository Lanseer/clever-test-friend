import { Loader2, CheckCircle, Brain, FileText, Wand2, Shield } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ThinkingStep {
  id: string;
  timestamp: string;
  content: string;
  status: "processing" | "completed";
}

interface GenerationBatch {
  id: string;
  batchCode: string;
  status: "generating" | "completed" | "failed";
  startTime: string;
  endTime?: string;
  totalCases: number;
  currentStage?: string;
  progress?: number;
  thinkingSteps?: ThinkingStep[];
}

interface AIThinkingSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch: GenerationBatch | null;
}

const stageConfig: Record<string, { label: string; icon: typeof Brain }> = {
  parsing: { label: "文档解析", icon: FileText },
  generating: { label: "用例生成", icon: Wand2 },
  checking: { label: "质量检查", icon: Shield },
};

const mockThinkingSteps: ThinkingStep[] = [
  { id: "1", timestamp: "10:30:01", content: "开始解析源文档...", status: "completed" },
  { id: "2", timestamp: "10:30:05", content: "识别到文档类型：功能规格说明书", status: "completed" },
  { id: "3", timestamp: "10:30:12", content: "提取功能模块：用户管理、订单管理、支付模块", status: "completed" },
  { id: "4", timestamp: "10:30:18", content: "分析用户管理模块的功能点...", status: "completed" },
  { id: "5", timestamp: "10:30:25", content: "生成用户登录场景测试用例", status: "completed" },
  { id: "6", timestamp: "10:30:32", content: "生成用户注册场景测试用例", status: "completed" },
  { id: "7", timestamp: "10:30:40", content: "正在分析订单管理模块...", status: "processing" },
];

export function AIThinkingSidebar({ open, onOpenChange, batch }: AIThinkingSidebarProps) {
  const currentStage = batch?.currentStage || "generating";
  const progress = batch?.progress || 65;
  const thinkingSteps = batch?.thinkingSteps || mockThinkingSteps;
  const StageIcon = stageConfig[currentStage]?.icon || Brain;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[480px] sm:max-w-[480px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI 思考过程
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-auto space-y-6 mt-4">
          {/* Batch Info */}
          {batch && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">批次编号</span>
                <span className="text-sm font-mono">{batch.batchCode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">开始时间</span>
                <span className="text-sm text-muted-foreground">{batch.startTime}</span>
              </div>
            </div>
          )}

          {/* Current Stage */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">当前阶段</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <StageIcon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{stageConfig[currentStage]?.label || "处理中"}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={progress} className="flex-1 h-2" />
                  <span className="text-sm text-muted-foreground">{progress}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stage Progress Indicators */}
          <div className="flex items-center justify-between px-2">
            {Object.entries(stageConfig).map(([key, config], index) => {
              const Icon = config.icon;
              const isActive = key === currentStage;
              const isCompleted = Object.keys(stageConfig).indexOf(currentStage) > index;
              
              return (
                <div key={key} className="flex flex-col items-center gap-1">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                    isCompleted ? "bg-green-500/20 text-green-600" :
                    isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Icon className={cn("w-4 h-4", isActive && "animate-pulse")} />
                    )}
                  </div>
                  <span className={cn(
                    "text-xs",
                    isActive ? "text-primary font-medium" : "text-muted-foreground"
                  )}>
                    {config.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Thinking Steps */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">思考日志</h3>
            <div className="space-y-2 max-h-[400px] overflow-auto">
              {thinkingSteps.map((step) => (
                <div 
                  key={step.id} 
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg transition-colors",
                    step.status === "processing" ? "bg-primary/5 border border-primary/20" : "bg-muted/50"
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {step.status === "processing" ? (
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm",
                      step.status === "processing" ? "text-primary font-medium" : "text-foreground"
                    )}>
                      {step.content}
                    </p>
                    <span className="text-xs text-muted-foreground">{step.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
