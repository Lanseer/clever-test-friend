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
        "w-[180px] h-full flex-shrink-0 p-2.5 rounded-lg border cursor-pointer transition-all flex flex-col",
        isSelected
          ? "border-sky-400 bg-gradient-to-br from-sky-100 to-blue-50 dark:from-sky-900/50 dark:to-blue-900/30 shadow-lg shadow-sky-400/30 ring-2 ring-sky-400/50"
          : "border-sky-200/60 bg-white/70 dark:bg-card/70 backdrop-blur-sm hover:border-sky-300 hover:bg-white/90 hover:shadow-md"
      )}
      onClick={() => onSelect(task.id)}
    >
      {/* Header */}
      <div className="mb-1.5">
        <h3 className="font-medium text-xs truncate text-sky-900 dark:text-sky-100">{task.name}</h3>
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
  );
}
