import { Clock, ClipboardCheck, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SmartDesignTask {
  id: string;
  name: string;
  selfReviewTotal: number;
  selfReviewPassed: number;
  expertReviewTotal: number;
  expertReviewPassed: number;
  createdAt: string;
}

interface SmartDesignTaskCardProps {
  task: SmartDesignTask;
  isSelected: boolean;
  onSelect: (taskId: string) => void;
  onSelfReview: (taskId: string) => void;
  onExpertReview: (taskId: string) => void;
  onReport: (taskId: string) => void;
}

export function SmartDesignTaskCard({
  task,
  isSelected,
  onSelect,
  onSelfReview,
  onExpertReview,
  onReport,
}: SmartDesignTaskCardProps) {
  return (
    <div
      className={cn(
        "w-[200px] flex-shrink-0 p-3 rounded-lg border cursor-pointer transition-all flex flex-col",
        isSelected
          ? "border-primary bg-gradient-to-br from-primary/15 to-sky-100/50 dark:to-sky-900/30 shadow-lg shadow-primary/20 ring-2 ring-primary/40"
          : "border-border/40 bg-white/60 dark:bg-card/60 backdrop-blur-sm hover:border-primary/40 hover:bg-white/80 dark:hover:bg-card/80 hover:shadow-md"
      )}
      onClick={() => onSelect(task.id)}
    >
      {/* Header */}
      <div className="mb-2">
        <h3 className="font-medium text-sm truncate">{task.name}</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          <Clock className="w-3 h-3" />
          {task.createdAt}
        </div>
      </div>

      {/* Stats - Vertical layout */}
      <div className="flex gap-2 mb-2 text-xs">
        <div className="flex-1 text-center p-1.5 bg-sky-50/50 dark:bg-sky-900/20 rounded border border-sky-200/30">
          <div className="text-muted-foreground">自评</div>
          <div className="mt-0.5">
            <span className="text-green-600 font-medium">{task.selfReviewPassed}</span>
            <span className="text-muted-foreground">/{task.selfReviewTotal}</span>
          </div>
        </div>
        <div className="flex-1 text-center p-1.5 bg-sky-50/50 dark:bg-sky-900/20 rounded border border-sky-200/30">
          <div className="text-muted-foreground">专家</div>
          <div className="mt-0.5">
            <span className="text-green-600 font-medium">{task.expertReviewPassed}</span>
            <span className="text-muted-foreground">/{task.expertReviewTotal}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-1 mt-auto">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 h-6 text-xs px-1"
          onClick={(e) => {
            e.stopPropagation();
            onSelfReview(task.id);
          }}
        >
          <ClipboardCheck className="w-3 h-3 mr-0.5" />
          自评
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 h-6 text-xs px-1"
          onClick={(e) => {
            e.stopPropagation();
            onExpertReview(task.id);
          }}
        >
          <Users className="w-3 h-3 mr-0.5" />
          专家
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-1.5"
          onClick={(e) => {
            e.stopPropagation();
            onReport(task.id);
          }}
        >
          <FileText className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
