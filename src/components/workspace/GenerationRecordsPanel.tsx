import { Clock, FileText, Layers, CheckCircle, AlertCircle, Play, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export type RecordStatus = "draft" | "pending_review" | "reviewing" | "completed";

export interface GenerationRecordItem {
  id: string;
  batchNumber: number;
  scenarioCount: number;
  caseCount: number;
  createdAt: string;
  status: RecordStatus;
}

interface GenerationRecordsPanelProps {
  records: GenerationRecordItem[];
  onRecordClick: (recordId: string) => void;
}

const statusConfig: Record<RecordStatus, { label: string; className: string; icon: typeof CheckCircle }> = {
  draft: {
    label: "暂存",
    className: "bg-gray-100 text-gray-600 border-gray-200",
    icon: FileText,
  },
  pending_review: {
    label: "待审查",
    className: "bg-amber-50 text-amber-600 border-amber-200",
    icon: AlertCircle,
  },
  reviewing: {
    label: "审查中",
    className: "bg-blue-50 text-blue-600 border-blue-200",
    icon: Play,
  },
  completed: {
    label: "审查完成",
    className: "bg-green-50 text-green-600 border-green-200",
    icon: CheckCircle,
  },
};

export function GenerationRecordsPanel({ records, onRecordClick }: GenerationRecordsPanelProps) {
  return (
    <div className="flex flex-col h-full bg-white/60 dark:bg-background/40 backdrop-blur-sm border-l border-sky-200/50 dark:border-sky-800/30">
      {/* Header */}
      <div className="px-4 py-3 border-b border-sky-200/50 dark:border-sky-800/30">
        <h3 className="font-semibold text-sm flex items-center gap-2 text-sky-800 dark:text-sky-200">
          <Layers className="w-4 h-4 text-sky-600" />
          生成记录
        </h3>
      </div>

      {/* Records List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {records.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              暂无生成记录
            </div>
          ) : (
            records.map((record) => {
              const status = statusConfig[record.status];
              const StatusIcon = status.icon;
              
              return (
                <div
                  key={record.id}
                  className="p-3 rounded-lg border border-sky-200/60 bg-white/80 dark:bg-card/40 hover:border-sky-300 hover:bg-white transition-all cursor-pointer"
                  onClick={() => onRecordClick(record.id)}
                >
                  {/* Title Row */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm text-sky-700 dark:text-sky-300">
                      第 {record.batchNumber} 次生成
                    </span>
                    <Badge 
                      variant="outline" 
                      className={cn("text-[10px] px-1.5 py-0 gap-1", status.className)}
                    >
                      {record.status === "reviewing" ? (
                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      ) : (
                        <StatusIcon className="w-2.5 h-2.5" />
                      )}
                      {status.label}
                    </Badge>
                  </div>

                  {/* Stats Row */}
                  <div className="flex gap-3 text-xs text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span>场景: <span className="text-foreground font-medium">{record.scenarioCount}</span></span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      <span>用例: <span className="text-foreground font-medium">{record.caseCount}</span></span>
                    </div>
                  </div>

                  {/* Time Row */}
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {record.createdAt}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
