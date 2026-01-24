import { useState } from "react";
import { Clock, FileText, AlertCircle, Sparkles } from "lucide-react";
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
}

export function GenerationRecordsList({ 
  taskId, 
  taskName,
  records,
  onConfirmResult 
}: GenerationRecordsListProps) {
  if (!taskId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm p-4 bg-gradient-to-b from-muted/20 to-transparent">
        <Sparkles className="w-8 h-8 mb-2 text-primary/40" />
        <span>请先选择一个设计任务</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-sky-50/50 to-transparent dark:from-sky-950/20">
      <div className="px-2 py-3 border-b border-border/30">
        <h3 className="font-medium text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
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
                  "p-3 rounded-lg border transition-all",
                  record.status === "pending_confirm" 
                    ? "border-amber-400/50 bg-gradient-to-r from-amber-50/50 to-amber-100/30 shadow-sm shadow-amber-200/30" 
                    : "border-border/50 bg-card/50 hover:bg-card/80"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    第 {records.length - index} 次生成
                  </span>
                  {record.status === "pending_confirm" ? (
                    <Badge className="bg-gradient-to-r from-amber-500 to-amber-400 text-xs border-0">
                      待确认
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-50/50 text-green-600 border-green-200/50 text-xs">
                      已确认
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span>生成总数: </span>
                    <span className="font-medium text-foreground">
                      {record.count}
                    </span>
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
                    className="w-full mt-2 h-7 text-xs gap-1 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 border-0 shadow-sm"
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
