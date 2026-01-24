import { Clock, FileText, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface GenerationRecord {
  id: string;
  count: number;
  createdAt: string;
  status: "completed" | "pending_confirm";
}

interface GenerationRecordsListProps {
  taskId: string | null;
  taskName: string | null;
  onConfirmResult: (recordId: string) => void;
}

// Mock generation records per task
const mockRecordsByTask: Record<string, GenerationRecord[]> = {
  "1": [
    { id: "gen-1-1", count: 24, createdAt: "2024-01-15 10:30", status: "completed" },
    { id: "gen-1-2", count: 18, createdAt: "2024-01-14 14:20", status: "completed" },
  ],
  "2": [
    { id: "gen-2-1", count: 0, createdAt: "2024-01-15 14:20", status: "pending_confirm" },
  ],
  "3": [
    { id: "gen-3-1", count: 32, createdAt: "2024-01-14 16:45", status: "completed" },
    { id: "gen-3-2", count: 28, createdAt: "2024-01-13 09:00", status: "pending_confirm" },
  ],
  "5": [
    { id: "gen-5-1", count: 18, createdAt: "2024-01-13 11:00", status: "completed" },
  ],
};

export function GenerationRecordsList({ 
  taskId, 
  taskName,
  onConfirmResult 
}: GenerationRecordsListProps) {
  const records = taskId ? mockRecordsByTask[taskId] || [] : [];

  if (!taskId) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
        请先选择一个设计任务
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b bg-muted/30">
        <h3 className="font-medium text-sm flex items-center gap-2">
          <FileText className="w-4 h-4" />
          生成记录
        </h3>
        {taskName && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {taskName}
          </p>
        )}
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {records.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              暂无生成记录
            </div>
          ) : (
            records.map((record, index) => (
              <div
                key={record.id}
                className={cn(
                  "p-3 rounded-lg border transition-colors",
                  record.status === "pending_confirm" 
                    ? "border-amber-400/50 bg-amber-50/30" 
                    : "border-border bg-card hover:bg-muted/30"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    第 {records.length - index} 次生成
                  </span>
                  {record.status === "pending_confirm" ? (
                    <Badge className="bg-amber-500 text-xs">
                      待确认
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 text-xs">
                      已完成
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span>生成总数: </span>
                    <span className="font-medium text-foreground">
                      {record.status === "pending_confirm" ? "-" : record.count}
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
                    className="w-full mt-2 h-7 text-xs gap-1 bg-amber-500 hover:bg-amber-600"
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
