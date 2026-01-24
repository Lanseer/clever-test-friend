import { Clock, ClipboardCheck, Users, FileText, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
        "p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md",
        isSelected
          ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
          : "border-border bg-card hover:border-muted-foreground/30"
      )}
      onClick={() => onSelect(task.id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{task.name}</h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Clock className="w-3 h-3" />
            {task.createdAt}
          </div>
        </div>
        {isSelected && (
          <Badge className="bg-primary text-primary-foreground text-xs gap-1 flex-shrink-0">
            <Check className="w-3 h-3" />
            已选中
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="text-center p-2 bg-muted/50 rounded">
          <p className="text-xs text-muted-foreground">用例自评</p>
          <p className="text-sm font-medium mt-1">
            <span className="text-green-600">{task.selfReviewPassed}</span>
            <span className="text-muted-foreground">/{task.selfReviewTotal}</span>
          </p>
        </div>
        <div className="text-center p-2 bg-muted/50 rounded">
          <p className="text-xs text-muted-foreground">专家评审</p>
          <p className="text-sm font-medium mt-1">
            <span className="text-green-600">{task.expertReviewPassed}</span>
            <span className="text-muted-foreground">/{task.expertReviewTotal}</span>
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-7 text-xs gap-1"
          onClick={(e) => {
            e.stopPropagation();
            onSelfReview(task.id);
          }}
        >
          <ClipboardCheck className="w-3 h-3" />
          用例自评
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-7 text-xs gap-1"
          onClick={(e) => {
            e.stopPropagation();
            onExpertReview(task.id);
          }}
        >
          <Users className="w-3 h-3" />
          专家评审
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2"
          onClick={(e) => {
            e.stopPropagation();
            onReport(task.id);
          }}
        >
          <FileText className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
