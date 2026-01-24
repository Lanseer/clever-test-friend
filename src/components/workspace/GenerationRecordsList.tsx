import { Clock, FileText, AlertCircle, Sparkles, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface GenerationRecord {
  id: string;
  count: number;
  createdAt: string;
  status: "pending_confirm" | "confirmed";
}

interface GenerationRecordsListProps {
  taskId: string | null;
  taskName: string | null;
  records: GenerationRecord[];
  onConfirmResult: (recordId: string) => void;
  onViewCases?: (recordId: string) => void;
}

export function GenerationRecordsList({ 
  taskId, 
  taskName,
  records,
  onConfirmResult,
  onViewCases
}: GenerationRecordsListProps) {
  if (!taskId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm p-4 bg-white/30 dark:bg-background/30 backdrop-blur-sm">
        <Sparkles className="w-8 h-8 mb-2 text-primary/40" />
        <span>请先选择一个设计任务</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white/40 dark:bg-background/40 backdrop-blur-sm">
      <div className="px-2 py-3 border-b border-sky-200/50 dark:border-sky-800/30">
        <h3 className="font-medium text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 text-sky-600" />
          生成记录
        </h3>
        {taskName && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {taskName}
          </p>
        )}
      </div>
      
      <ScrollArea className="flex-1">
        <div className="px-2 py-2 space-y-2">
          {records.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              暂无生成记录
            </div>
          ) : (
            records.map((record, index) => (
              <div
                key={record.id}
                className={cn(
                  "p-2.5 rounded-lg border transition-all",
                  record.status === "pending_confirm" 
                    ? "border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 shadow-sm" 
                    : "border-sky-200/60 bg-white/60 dark:bg-sky-950/20 hover:bg-white/80"
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <button 
                    className="text-sm font-medium text-sky-700 dark:text-sky-400 hover:text-sky-600 hover:underline flex items-center gap-1 transition-colors"
                    onClick={() => onViewCases?.(record.id)}
                  >
                    第 {records.length - index} 次生成
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  {record.status === "pending_confirm" ? (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-[10px] px-1.5 py-0 border-0">
                      待确认
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-emerald-50/80 text-emerald-600 border-emerald-200/60 text-[10px] px-1.5 py-0">
                      已确认
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-0.5 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span>生成: </span>
                    <span className="font-medium text-foreground">{record.count} 条</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{record.createdAt}</span>
                  </div>
                </div>

                {record.status === "pending_confirm" && (
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full mt-2 h-6 text-[11px] gap-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-0 shadow-sm"
                    onClick={() => onConfirmResult(record.id)}
                  >
                    <AlertCircle className="w-3 h-3" />
                    确认结果
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
