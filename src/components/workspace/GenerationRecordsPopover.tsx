import { useState } from "react";
import { Clock, FileText, AlertCircle, History, ExternalLink, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface GenerationRecord {
  id: string;
  count: number;
  createdAt: string;
  status: "pending_confirm" | "confirmed";
}

interface GenerationRecordsPopoverProps {
  records: GenerationRecord[];
  onConfirmResult: (recordId: string) => void;
  onViewCases?: (recordId: string) => void;
}

export function GenerationRecordsPopover({
  records,
  onConfirmResult,
  onViewCases,
}: GenerationRecordsPopoverProps) {
  const [open, setOpen] = useState(false);
  
  const pendingCount = records.filter(r => r.status === "pending_confirm").length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5 bg-white/60 dark:bg-card/60 border-sky-200/60 hover:bg-white/80 hover:border-sky-300"
        >
          <History className="w-3.5 h-3.5" />
          生成记录
          {pendingCount > 0 && (
            <Badge className="h-4 px-1.5 text-[10px] bg-amber-500 hover:bg-amber-500">
              {pendingCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0" 
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="px-3 py-2.5 border-b border-border/50 flex items-center justify-between">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-600" />
            生成记录
          </h4>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Records List */}
        <ScrollArea className="max-h-[320px]">
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
                    "p-3 rounded-lg border transition-all",
                    record.status === "pending_confirm"
                      ? "border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 shadow-sm"
                      : "border-border/60 bg-muted/30 hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
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
                      <Badge
                        variant="outline"
                        className="bg-emerald-50/80 text-emerald-600 border-emerald-200/60 text-[10px] px-1.5 py-0"
                      >
                        已确认
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3 h-3" />
                      <span>生成: </span>
                      <span className="font-medium text-foreground">{record.count} 条</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      <span>{record.createdAt}</span>
                    </div>
                  </div>

                  {record.status === "pending_confirm" && (
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full mt-2 h-7 text-xs gap-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-0 shadow-sm"
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
      </PopoverContent>
    </Popover>
  );
}
