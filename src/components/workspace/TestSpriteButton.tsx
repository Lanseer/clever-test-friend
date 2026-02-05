import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  Sparkles, 
  X, 
  ChevronRight,
  ListTodo,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface TaskSummary {
  total: number;
}

interface GeneratedCase {
  id: string;
  taskId: string;
  name: string;
  version: string;
  progress: number; // 0-100
  reviewedCount: number;
  totalCount: number;
}

const mockTaskSummary: TaskSummary = {
  total: 12,
};

const mockGeneratedCases: GeneratedCase[] = [
  { id: "1", taskId: "1", name: "2026-01-23用户登录模块测试案例", version: "V1.0", progress: 75, reviewedCount: 18, totalCount: 24 },
  { id: "2", taskId: "2", name: "2026-01-22支付流程测试案例", version: "V1.2", progress: 30, reviewedCount: 5, totalCount: 18 },
  { id: "3", taskId: "3", name: "2026-01-21订单管理测试案例", version: "V0.8", progress: 0, reviewedCount: 0, totalCount: 32 },
  { id: "4", taskId: "5", name: "2026-01-20购物车功能测试案例", version: "V1.1", progress: 60, reviewedCount: 12, totalCount: 20 },
];

export function TestSpriteButton() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleDismissed, setBubbleDismissed] = useState(false);
  
  // Draggable state - default to bottom-left
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Morning greeting bubble - simulate showing on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!bubbleDismissed) {
        setShowBubble(true);
      }
    }, 1500); // Delay for natural feel

    return () => clearTimeout(timer);
  }, [bubbleDismissed]);

  // Removed auto-hide - bubble only closes on user interaction

  const handleDismissBubble = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowBubble(false);
    setBubbleDismissed(true);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isOpen) return;
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

  const handleNavigateToTasks = () => {
    navigate(`/workspace/${workspaceId}/management/my-test-tasks`);
    setIsOpen(false);
  };

  const handleNavigateToTask = (taskId: string) => {
    navigate(`/workspace/${workspaceId}/management/my-test-tasks?taskId=${taskId}`);
    setIsOpen(false);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 40) return "bg-amber-500";
    return "bg-muted-foreground";
  };

  // Mock data for morning summary - use translation
  const morningMessage = {
    yesterdayDone: [
      t('xiaoLiang.yesterdayItems.completedCases'),
      t('xiaoLiang.yesterdayItems.initiatedReview'),
    ],
    todayTodo: [
      t('xiaoLiang.todoItemsList.pendingCases'),
      t('xiaoLiang.todoItemsList.notStarted'),
      t('xiaoLiang.todoItemsList.reviewDeadline'),
    ],
  };

  return (
    <>
      {/* Morning Greeting Bubble */}
      {showBubble && !isOpen && (
        <div
          className="fixed z-50 animate-fade-in"
          style={{
            left: `${position.x + 70}px`,
            bottom: `${position.y + 20}px`,
          }}
        >
          <div className="relative bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/50 dark:to-purple-950/50 border border-violet-200 dark:border-violet-800 rounded-2xl shadow-xl p-4 max-w-xs">
            {/* Arrow pointing to sprite */}
            <div className="absolute -left-2 bottom-6 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-violet-200 dark:border-r-violet-800 border-b-8 border-b-transparent" />
            <div className="absolute -left-[6px] bottom-6 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-violet-50 dark:border-r-violet-950/50 border-b-8 border-b-transparent" />
            
            {/* Close button */}
            <button
              onClick={handleDismissBubble}
              className="absolute top-2 right-2 w-5 h-5 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" />
            </button>

            {/* Header with animated sparkle */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <span className="text-sm font-semibold text-foreground">{t('xiaoLiang.goodMorning')}</span>
                <div className="text-xs text-muted-foreground">{t('xiaoLiang.summary')}</div>
              </div>
            </div>

            {/* Yesterday Summary */}
            <div className="mb-3">
              <div className="text-xs font-medium text-violet-600 dark:text-violet-400 mb-1.5 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {t('xiaoLiang.yesterdayDone')}
              </div>
              <ul className="space-y-1">
                {morningMessage.yesterdayDone.map((item, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground pl-3 relative before:absolute before:left-0 before:top-1.5 before:w-1.5 before:h-1.5 before:rounded-full before:bg-green-500">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Today Todo */}
            <div className="mb-3">
              <div className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {t('xiaoLiang.todayTodo')}
              </div>
              <ul className="space-y-1">
                {morningMessage.todayTodo.map((item, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground pl-3 relative before:absolute before:left-0 before:top-1.5 before:w-1.5 before:h-1.5 before:rounded-full before:bg-amber-500">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action button */}
            <Button
              size="sm"
              className="w-full h-7 text-xs bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
              onClick={() => {
                setShowBubble(false);
                setBubbleDismissed(true);
                handleNavigateToTasks();
              }}
            >
              {t('xiaoLiang.viewAllTasks')}
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <button
        ref={buttonRef}
        onClick={() => {
          if (!isDragging) {
            setIsOpen(true);
            setShowBubble(false);
          }
        }}
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
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center">
          {mockGeneratedCases.length}
        </span>
      </button>

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
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm">{t('xiaoLiang.name')}</h3>
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

          <div 
            className="mt-3 bg-white/10 rounded-lg px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-white/20 transition-colors"
            onClick={handleNavigateToTasks}
          >
            <div className="flex items-center gap-2">
              <ListTodo className="w-4 h-4" />
              <span className="text-sm">{t('xiaoLiang.totalTasks')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">{mockTaskSummary.total}</span>
              <ChevronRight className="w-4 h-4 opacity-60" />
            </div>
          </div>
        </div>

        <div className="h-64">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-2">
              <div className="text-xs text-muted-foreground mb-2">{t('xiaoLiang.todoItems')}</div>
              {mockGeneratedCases.map((caseItem) => (
                <div
                  key={caseItem.id}
                  className="p-2.5 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors group"
                  onClick={() => handleNavigateToTask(caseItem.taskId)}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm truncate flex-1">{caseItem.name}_{caseItem.version}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all", getProgressColor(caseItem.progress))}
                        style={{ width: `${caseItem.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {caseItem.reviewedCount}/{caseItem.totalCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
}
