import { useState } from "react";
import { Clock, ClipboardCheck, Users, FileText, MoreHorizontal, Pencil, Trash2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface SmartDesignTaskCardProps {
  task: SmartDesignTask;
  isSelected: boolean;
  onSelect: (taskId: string) => void;
  onSelfReview: (taskId: string) => void;
  onExpertReview: (taskId: string) => void;
  onReport: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
}

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

export function SmartDesignTaskCard({
  task,
  isSelected,
  onSelect,
  onSelfReview,
  onExpertReview,
  onReport,
  onEdit,
  onDelete,
}: SmartDesignTaskCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);

  // Mock additional task info
  const taskDetail = {
    ...task,
    testPhase: task.testPhase || "sit",
    testCategory: task.testCategory || "functional",
    tags: task.tags || ["回归测试", "核心功能"],
  };

  return (
    <>
      <div
        className={cn(
          "w-[180px] h-full flex-shrink-0 p-2.5 rounded-lg border cursor-pointer transition-all flex flex-col relative",
          isSelected
            ? "border-sky-400 bg-gradient-to-br from-sky-100 to-blue-50 dark:from-sky-900/50 dark:to-blue-900/30 shadow-lg shadow-sky-400/30 ring-2 ring-sky-400/50"
            : "border-sky-200/60 bg-white/70 dark:bg-card/70 backdrop-blur-sm hover:border-sky-300 hover:bg-white/90 hover:shadow-md"
        )}
        onClick={() => onSelect(task.id)}
      >
        {/* More Menu - Top Right */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-1 right-1 h-5 w-5 p-0 hover:bg-sky-200/50"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
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
                setDeleteAlertOpen(true);
              }}
            >
              <Trash2 className="w-3 h-3" />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Header */}
        <div className="mb-1.5 pr-5">
          <button
            className="font-medium text-xs truncate text-sky-700 dark:text-sky-300 hover:text-sky-600 hover:underline text-left w-full"
            onClick={(e) => {
              e.stopPropagation();
              setDetailOpen(true);
            }}
          >
            {task.name}
          </button>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
            <Clock className="w-2.5 h-2.5" />
            {task.createdAt}
          </div>
        </div>

        {/* Stats - Vertical layout */}
        <div className="flex gap-1.5 mb-1.5 text-[10px]">
          <div className="flex-1 text-center py-1 px-1 bg-sky-50/80 dark:bg-sky-900/30 rounded border border-sky-200/50">
            <div className="text-muted-foreground leading-none">自评</div>
            <div className="mt-0.5 leading-none">
              <span className="text-emerald-600 font-medium">{task.selfReviewPassed}</span>
              <span className="text-muted-foreground">/{task.selfReviewTotal}</span>
            </div>
          </div>
          <div className="flex-1 text-center py-1 px-1 bg-sky-50/80 dark:bg-sky-900/30 rounded border border-sky-200/50">
            <div className="text-muted-foreground leading-none">专家</div>
            <div className="mt-0.5 leading-none">
              <span className="text-emerald-600 font-medium">{task.expertReviewPassed}</span>
              <span className="text-muted-foreground">/{task.expertReviewTotal}</span>
            </div>
          </div>
        </div>

        {/* Actions - Compact */}
        <div className="flex gap-0.5 mt-auto pt-1 border-t border-sky-100/50">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-5 text-[10px] px-0.5 hover:bg-sky-100/50"
            onClick={(e) => {
              e.stopPropagation();
              onSelfReview(task.id);
            }}
          >
            <ClipboardCheck className="w-2.5 h-2.5 mr-0.5" />
            自评
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-5 text-[10px] px-0.5 hover:bg-sky-100/50"
            onClick={(e) => {
              e.stopPropagation();
              onExpertReview(task.id);
            }}
          >
            <Users className="w-2.5 h-2.5 mr-0.5" />
            专家
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 px-1 hover:bg-sky-100/50"
            onClick={(e) => {
              e.stopPropagation();
              onReport(task.id);
            }}
          >
            <FileText className="w-2.5 h-2.5" />
          </Button>
        </div>
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
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">任务名称</label>
              <p className="text-sm font-medium">{taskDetail.name}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">测试阶段</label>
                <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200">
                  {testPhaseLabels[taskDetail.testPhase] || taskDetail.testPhase}
                </Badge>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">测试类别</label>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  {testCategoryLabels[taskDetail.testCategory] || taskDetail.testCategory}
                </Badge>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">标签</label>
              <div className="flex flex-wrap gap-1">
                {taskDetail.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">自评进度</label>
                <p className="text-sm">
                  <span className="text-emerald-600 font-medium">{taskDetail.selfReviewPassed}</span>
                  <span className="text-muted-foreground"> / {taskDetail.selfReviewTotal}</span>
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">专家评审进度</label>
                <p className="text-sm">
                  <span className="text-emerald-600 font-medium">{taskDetail.expertReviewPassed}</span>
                  <span className="text-muted-foreground"> / {taskDetail.expertReviewTotal}</span>
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">创建时间</label>
              <p className="text-sm text-muted-foreground">{taskDetail.createdAt}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除任务"{task.name}"吗？删除后将无法恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                onDelete?.(task.id);
                setDeleteAlertOpen(false);
              }}
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
