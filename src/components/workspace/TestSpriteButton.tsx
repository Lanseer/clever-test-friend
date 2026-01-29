import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Sparkles, 
  X, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface TaskSummary {
  total: number;
  inProgress: number;
  completed: number;
  pending: number;
}

interface QuickTask {
  id: string;
  name: string;
  status: "pending" | "in_progress" | "completed";
  progress?: number;
}

const mockTaskSummary: TaskSummary = {
  total: 12,
  inProgress: 3,
  completed: 7,
  pending: 2,
};

const mockQuickTasks: QuickTask[] = [
  { id: "1", name: "用户登录模块测试", status: "in_progress", progress: 65 },
  { id: "2", name: "支付流程测试", status: "in_progress", progress: 30 },
  { id: "3", name: "订单管理测试", status: "pending" },
  { id: "4", name: "商品搜索测试", status: "completed" },
];

export function TestSpriteButton() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  
  // Draggable state - default to bottom-left
  const [position, setPosition] = useState({ x: 24, y: 24 }); // offset from bottom-left
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isOpen) return; // Don't drag when panel is open
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY + position.y,
    });
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = dragStart.y - e.clientY;
    // Constrain to viewport
    const maxX = window.innerWidth - 70;
    const maxY = window.innerHeight - 70;
    setPosition({
      x: Math.max(10, Math.min(newX, maxX)),
      y: Math.max(10, Math.min(newY, maxY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add/remove global mouse listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart]);


  const handleNavigateToTask = (taskId: string) => {
    navigate(`/workspace/${workspaceId}/management/ai-cases`);
    setIsOpen(false);
  };

  const getStatusIcon = (status: QuickTask["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />;
      case "in_progress":
        return <Clock className="w-3.5 h-3.5 text-amber-500" />;
      case "pending":
        return <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: QuickTask["status"]) => {
    switch (status) {
      case "completed":
        return "已完成";
      case "in_progress":
        return "进行中";
      case "pending":
        return "待处理";
    }
  };

  return (
    <>
      {/* Floating Button with breathing animation - Draggable */}
      <button
        ref={buttonRef}
        onClick={() => !isDragging && setIsOpen(true)}
        onMouseDown={handleMouseDown}
        className={cn(
          "fixed z-50 w-14 h-14 rounded-full",
          "bg-gradient-to-br from-violet-500 to-purple-600 text-white",
          "shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40",
          "flex items-center justify-center",
          "transition-shadow duration-300 hover:scale-110",
          isDragging && "cursor-grabbing scale-110",
          !isDragging && !isOpen && "cursor-grab",
          isOpen && "scale-0 opacity-0 pointer-events-none"
        )}
        style={{
          left: `${position.x}px`,
          bottom: `${position.y}px`,
          animation: isOpen || isDragging ? "none" : "breathe 2s ease-in-out infinite",
          transition: isDragging ? "none" : "transform 0.3s, opacity 0.3s",
        }}
      >
        <Sparkles className="w-6 h-6" />
        {/* Task count badge */}
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center">
          {mockTaskSummary.inProgress}
        </span>
      </button>

      {/* Global styles for breathing animation */}
      <style>{`
        @keyframes breathe {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 10px 25px -5px rgba(139, 92, 246, 0.3);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 15px 35px -5px rgba(139, 92, 246, 0.5);
          }
        }
      `}</style>

      {/* Expanded Panel - follows button position */}
      <div
        className={cn(
          "fixed z-50 w-80 bg-background border rounded-2xl shadow-2xl overflow-hidden",
          "transition-all duration-300 origin-bottom-left",
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        )}
        style={{
          left: `${position.x}px`,
          bottom: `${position.y}px`,
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm">测试精灵</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Task Summary Stats */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="bg-white/10 rounded-lg px-2 py-1.5 text-center">
              <div className="text-lg font-bold">{mockTaskSummary.total}</div>
              <div className="text-[10px] text-white/70">总任务</div>
            </div>
            <div className="bg-white/10 rounded-lg px-2 py-1.5 text-center">
              <div className="text-lg font-bold text-amber-300">{mockTaskSummary.inProgress}</div>
              <div className="text-[10px] text-white/70">进行中</div>
            </div>
            <div className="bg-white/10 rounded-lg px-2 py-1.5 text-center">
              <div className="text-lg font-bold text-green-300">{mockTaskSummary.completed}</div>
              <div className="text-[10px] text-white/70">已完成</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="h-64">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-2">
              {/* To-do Items */}
              <div className="text-xs text-muted-foreground mb-2">待办事项</div>
              {mockQuickTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-2.5 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors group"
                  onClick={() => handleNavigateToTask(task.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getStatusIcon(task.status)}
                      <span className="text-sm truncate">{task.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {task.status === "in_progress" && task.progress !== undefined && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                        <span>{getStatusText(task.status)}</span>
                        <span>{task.progress}%</span>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {task.status === "completed" && (
                    <Badge variant="outline" className="mt-1.5 text-[10px] bg-green-50 text-green-600 border-green-200">
                      已完成
                    </Badge>
                  )}
                  {task.status === "pending" && (
                    <Badge variant="outline" className="mt-1.5 text-[10px]">
                      待处理
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
}
