import { useState } from "react";
import { 
  Clock, FileText, MoreHorizontal, 
  Pencil, Trash2, Info, Plus, Sparkles, MessageSquare 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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
  tags?: string[];
}

interface SmartDesignTaskListProps {
  tasks: SmartDesignTask[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onReport: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  onCreateTask: () => void;
}

interface ChatSession {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
}

// Mock chat sessions
const mockChatSessions: ChatSession[] = [
  { id: "session-1", name: "会话 1", lastMessage: "帮我生成用户登录模块的测试用例", timestamp: "10:30" },
  { id: "session-2", name: "会话 2", lastMessage: "分析这个需求文档", timestamp: "昨天" },
  { id: "session-3", name: "会话 3", lastMessage: "优化测试覆盖率", timestamp: "3天前" },
];

const testPhaseLabels: Record<string, string> = {
  unit: "单元测试",
  integration: "集成测试",
  sit: "SIT测试",
  uat: "UAT测试",
  production: "生产验证",
};

const testCategoryLabels: Record<string, string> = {
  functional: "功能测试",
  data: "数据测试",
  special: "专项测试",
};

export function SmartDesignTaskList({
  tasks,
  selectedTaskId,
  onSelectTask,
  onReport,
  onEdit,
  onDelete,
  onCreateTask,
}: SmartDesignTaskListProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTask, setDetailTask] = useState<SmartDesignTask | null>(null);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  const handleViewDetail = (task: SmartDesignTask) => {
    setDetailTask(task);
    setDetailOpen(true);
  };

  const handleDeleteClick = (taskId: string) => {
    setDeleteTaskId(taskId);
    setDeleteAlertOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTaskId) {
      onDelete?.(deleteTaskId);
    }
    setDeleteAlertOpen(false);
    setDeleteTaskId(null);
  };

  return (
    <div className="flex flex-col h-full bg-white/40 dark:bg-background/40 backdrop-blur-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-sky-200/50 dark:border-sky-800/30 flex items-center justify-between">
        <h3 className="font-semibold text-sm flex items-center gap-2 text-sky-800 dark:text-sky-200">
          <Sparkles className="w-4 h-4 text-sky-600" />
          智能设计任务
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1 text-sky-600 hover:text-sky-700 hover:bg-sky-100/50"
          onClick={onCreateTask}
        >
          <Plus className="w-3.5 h-3.5" />
          新建
        </Button>
      </div>

      {/* Task List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {tasks.length === 0 ? (
            <div 
              className="p-4 text-center cursor-pointer group"
              onClick={onCreateTask}
            >
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl border-2 border-dashed border-sky-300/60 flex items-center justify-center group-hover:border-sky-400 transition-colors">
                <Plus className="w-6 h-6 text-sky-400 group-hover:text-sky-500" />
              </div>
              <p className="text-sm text-muted-foreground">暂无任务，点击创建</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all group",
                  selectedTaskId === task.id
                    ? "border-sky-400 bg-gradient-to-r from-sky-100 to-blue-50 dark:from-sky-900/50 dark:to-blue-900/30 shadow-md shadow-sky-400/20"
                    : "border-sky-200/60 bg-white/60 dark:bg-card/40 hover:border-sky-300 hover:bg-white/80"
                )}
                onClick={() => onSelectTask(task.id)}
              >
                {/* Task Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <button
                    className="font-medium text-sm text-sky-700 dark:text-sky-300 hover:text-sky-600 hover:underline text-left truncate flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetail(task);
                    }}
                  >
                    {task.name}
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-sky-200/50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-28">
                      <DropdownMenuItem
                        className="text-xs gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit?.(task.id);
                        }}
                      >
                        <Pencil className="w-3 h-3" />
                        编辑
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-xs gap-2 text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(task.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Task Info */}
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-2">
                  <Clock className="w-3 h-3" />
                  {task.createdAt}
                </div>

                {/* Actions - Only Report Button - Centered */}
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[11px] px-2 hover:bg-sky-100/50 gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReport(task.id);
                    }}
                  >
                    <FileText className="w-3 h-3" />
                    评审报告
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Chat Sessions Entry */}
      <div className="p-3 border-t border-sky-200/50 dark:border-sky-800/30">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sky-600 hover:text-sky-700 hover:bg-sky-50/50"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm">会话记录</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent side="right" align="end" className="w-64 p-2">
            <div className="space-y-1">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                历史会话
              </div>
              {mockChatSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex flex-col gap-0.5 px-2 py-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{session.name}</span>
                    <span className="text-[10px] text-muted-foreground">{session.timestamp}</span>
                  </div>
                  <span className="text-xs text-muted-foreground truncate">
                    {session.lastMessage}
                  </span>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Task Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-sky-600" />
              任务详情
            </DialogTitle>
          </DialogHeader>
          {detailTask && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">任务名称</label>
                <p className="text-sm font-medium">{detailTask.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">测试阶段</label>
                  <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200">
                    {testPhaseLabels[detailTask.testPhase || "sit"] || detailTask.testPhase}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">测试类别</label>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    {testCategoryLabels[detailTask.testCategory || "functional"] || detailTask.testCategory}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">标签</label>
                <div className="flex flex-wrap gap-1">
                  {(detailTask.tags || ["回归测试", "核心功能"]).map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">内部审查</label>
                  <p className="text-sm">
                    <span className="text-emerald-600 font-medium">{detailTask.selfReviewPassed}</span>
                    <span className="text-muted-foreground"> / {detailTask.selfReviewTotal}</span>
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">外部评审</label>
                  <p className="text-sm">
                    <span className="text-emerald-600 font-medium">{detailTask.expertReviewPassed}</span>
                    <span className="text-muted-foreground"> / {detailTask.expertReviewTotal}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">创建时间</label>
                <p className="text-sm text-muted-foreground">{detailTask.createdAt}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除此任务吗？删除后将无法恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
