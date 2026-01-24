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
        "p-3 rounded-lg border cursor-pointer transition-all",
        isSelected
          ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg shadow-primary/10 ring-1 ring-primary/30"
          : "border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:bg-card/80 hover:shadow-md"
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

      {/* Stats - Compact */}
      <div className="flex gap-2 mb-2 text-xs">
        <div className="flex-1 text-center p-1.5 bg-muted/30 rounded">
          <span className="text-muted-foreground">自评 </span>
          <span className="text-green-600 font-medium">{task.selfReviewPassed}</span>
          <span className="text-muted-foreground">/{task.selfReviewTotal}</span>
        </div>
        <div className="flex-1 text-center p-1.5 bg-muted/30 rounded">
          <span className="text-muted-foreground">专家 </span>
          <span className="text-green-600 font-medium">{task.expertReviewPassed}</span>
          <span className="text-muted-foreground">/{task.expertReviewTotal}</span>
        </div>
      </div>

      {/* Actions - Compact */}
      <div className="flex gap-1">
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
