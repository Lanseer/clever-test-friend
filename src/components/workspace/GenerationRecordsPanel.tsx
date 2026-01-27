import { Clock, FileText, Layers, ThumbsUp, AlertTriangle, Trash2, Package, ClipboardList, Download } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

export type RecordStatus = "draft" | "pending_review" | "reviewing" | "completed";

export interface GenerationRecordItem {
  id: string;
  batchNumber: number;
  scenarioCount: number;
  caseCount: number;
  createdAt: string;
  status: RecordStatus;
  taskName?: string;
  deliverableName?: string;
  stats?: {
    adopted: number;
    improved: number;
    needsImprovement: number;
    discarded: number;
  };
}

interface GenerationRecordsPanelProps {
  records: GenerationRecordItem[];
  taskName?: string;
  onRecordClick: (recordId: string, deliverableName?: string) => void;
}

export function GenerationRecordsPanel({ records, taskName = "任务", onRecordClick }: GenerationRecordsPanelProps) {
  const navigate = useNavigate();
  const { workspaceId } = useParams();

  const handleOpenReport = (e: React.MouseEvent, recordId: string, versionName: string) => {
    e.stopPropagation();
    const encodedName = encodeURIComponent(versionName);
    navigate(`/workspace/${workspaceId}/management/ai-cases/${recordId}/deliverable-report?name=${encodedName}`);
  };

  const handleDownload = (e: React.MouseEvent, versionName: string) => {
    e.stopPropagation();
    toast.success(`${versionName} 下载已开始`);
  };

  return (
    <div className="flex flex-col h-full bg-white/60 dark:bg-background/40 backdrop-blur-sm border-l border-sky-200/50 dark:border-sky-800/30">
      {/* Header */}
      <div className="px-4 py-3 border-b border-sky-200/50 dark:border-sky-800/30">
        <h3 className="font-semibold text-sm flex items-center gap-2 text-sky-800 dark:text-sky-200">
          <Package className="w-4 h-4 text-sky-600" />
          交付物
        </h3>
      </div>

      {/* Records List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {records.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              暂无交付物
            </div>
          ) : (
            records.map((record) => {
              const versionName = record.deliverableName || `${record.taskName || taskName}_V0.${record.batchNumber}`;
              const stats = record.stats || { adopted: 0, improved: 0, needsImprovement: 0, discarded: 0 };
              
              return (
                <div
                  key={record.id}
                  className="p-3 rounded-lg border border-sky-200/60 bg-white/80 dark:bg-card/40 hover:border-sky-300 hover:bg-white transition-all cursor-pointer"
                  onClick={() => onRecordClick(record.id, versionName)}
                >
                  {/* Title Row - Deliverable Name */}
                  <div className="font-medium text-sm text-sky-700 dark:text-sky-300 mb-2 truncate">
                    {versionName}
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

                  {/* Review Stats Row */}
                  <div className="flex flex-wrap gap-2 text-[10px] mb-2">
                    <div className="flex items-center gap-1 text-green-600">
                      <ThumbsUp className="w-3 h-3" />
                      <span>采纳: {stats.adopted}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-600">
                      <AlertTriangle className="w-3 h-3" />
                      <span>需完善: {stats.needsImprovement}</span>
                    </div>
                    <div className="flex items-center gap-1 text-red-500">
                      <Trash2 className="w-3 h-3" />
                      <span>丢弃: {stats.discarded}</span>
                    </div>
                  </div>

                  {/* Time and Actions Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {record.createdAt}
                    </div>
                    <TooltipProvider>
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-primary hover:text-primary"
                              onClick={(e) => handleOpenReport(e, record.id, versionName)}
                            >
                              <ClipboardList className="w-3.5 h-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>审查报告</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-foreground"
                              onClick={(e) => handleDownload(e, versionName)}
                            >
                              <Download className="w-3.5 h-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>下载</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
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
