import { useState } from "react";
import { FileText, ChevronRight, ClipboardList, Calendar, Check, AlertCircle, Trash2, UserCheck, Tag, Plus, MessageSquare, Users, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type ReviewStatus = "pending" | "reviewing" | "completed";

export interface ExternalReviewStats {
  total: number;
  completed: number;
  inProgress: number;
}

export interface CaseFileData {
  id: string;
  name: string;
  version: string;
  createdAt: string;
  adoptedCount: number;
  needsImprovementCount: number;
  discardedCount: number;
  status?: ReviewStatus;
  statusTags?: string[];
  remark?: string;
  externalReview?: ExternalReviewStats;
}

interface CaseFileCardProps {
  file: CaseFileData;
  onCardClick: (fileId: string) => void;
  onReportClick: (e: React.MouseEvent, fileName: string) => void;
  onExpertReviewClick: (e: React.MouseEvent, fileId: string) => void;
  onStatusChange?: (fileId: string, status: ReviewStatus) => void;
  onTagsChange?: (fileId: string, tags: string[]) => void;
  onRemarkChange?: (fileId: string, remark: string) => void;
}

const defaultStatusTags = ["审查完成", "审查中", "待审查"];

const statusConfig: Record<ReviewStatus, { label: string; className: string; icon: React.ElementType }> = {
  pending: { label: "待审查", className: "bg-slate-100 text-slate-700 border-slate-200", icon: Clock },
  reviewing: { label: "审查中", className: "bg-amber-100 text-amber-700 border-amber-200", icon: Loader2 },
  completed: { label: "审查完成", className: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
};

export function CaseFileCard({
  file,
  onCardClick,
  onReportClick,
  onExpertReviewClick,
  onStatusChange,
  onTagsChange,
  onRemarkChange,
}: CaseFileCardProps) {
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [remarkPopoverOpen, setRemarkPopoverOpen] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [remarkText, setRemarkText] = useState(file.remark || "");
  const [customTags, setCustomTags] = useState<string[]>(file.statusTags || []);

  const currentStatus = file.status || "pending";
  const statusInfo = statusConfig[currentStatus];
  const StatusIcon = statusInfo.icon;

  const handleAddTag = () => {
    if (newTag.trim() && !customTags.includes(newTag.trim())) {
      const updatedTags = [...customTags, newTag.trim()];
      setCustomTags(updatedTags);
      onTagsChange?.(file.id, updatedTags);
      setNewTag("");
      toast.success(`标签 "${newTag.trim()}" 已添加`);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = customTags.filter(t => t !== tagToRemove);
    setCustomTags(updatedTags);
    onTagsChange?.(file.id, updatedTags);
  };

  const handleSelectDefaultTag = (tag: string) => {
    if (!customTags.includes(tag)) {
      const updatedTags = [...customTags, tag];
      setCustomTags(updatedTags);
      onTagsChange?.(file.id, updatedTags);
    }
    setTagPopoverOpen(false);
  };

  const handleSaveRemark = () => {
    onRemarkChange?.(file.id, remarkText);
    setRemarkPopoverOpen(false);
    toast.success("备注已保存");
  };

  const externalReview = file.externalReview || { total: 0, completed: 0, inProgress: 0 };

  return (
    <Card
      className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/30"
      onClick={() => onCardClick(file.id)}
    >
      <CardContent className="p-4">
        {/* Top Row: Title + Status + Actions */}
        <div className="flex items-start gap-3 mb-3">
          {/* Icon */}
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-sky-500/20">
            <FileText className="w-5 h-5 text-white" />
          </div>

          {/* Title & Status */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-medium truncate max-w-[200px]">{file.name}_{file.version}</h3>
              <Badge className={cn("text-[10px] px-1.5 py-0 h-5 flex items-center gap-1", statusInfo.className)}>
                <StatusIcon className={cn("w-3 h-3", currentStatus === "reviewing" && "animate-spin")} />
                {statusInfo.label}
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {file.createdAt}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-primary"
                    onClick={(e) => onReportClick(e, `${file.name}_${file.version}`)}
                  >
                    <ClipboardList className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top"><p>审查报告</p></TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-primary"
                    onClick={(e) => onExpertReviewClick(e, file.id)}
                  >
                    <UserCheck className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top"><p>外部评审</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <ChevronRight className="w-4 h-4 text-muted-foreground ml-1" />
          </div>
        </div>

        {/* Middle Row: Stats & External Review */}
        <div className="flex items-center justify-between gap-4 py-2 px-2 bg-muted/30 rounded-lg mb-3">
          {/* Case Stats */}
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-green-600">
              <Check className="w-3 h-3" />
              <span className="text-muted-foreground">采纳</span> {file.adoptedCount}
            </span>
            <span className="flex items-center gap-1 text-amber-600">
              <AlertCircle className="w-3 h-3" />
              <span className="text-muted-foreground">需完善</span> {file.needsImprovementCount}
            </span>
            <span className="flex items-center gap-1 text-red-600">
              <Trash2 className="w-3 h-3" />
              <span className="text-muted-foreground">丢弃</span> {file.discardedCount}
            </span>
          </div>

          {/* External Review Stats */}
          {externalReview.total > 0 && (
            <div className="flex items-center gap-2 text-xs border-l pl-3">
              <Users className="w-3.5 h-3.5 text-primary" />
              <span className="text-muted-foreground">外部评审</span>
              <span className="font-medium">{externalReview.total}次</span>
              <span className="text-green-600">(完成{externalReview.completed}</span>
              <span className="text-amber-600">进行中{externalReview.inProgress})</span>
            </div>
          )}
          {externalReview.total === 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              <span>暂无外部评审</span>
            </div>
          )}
        </div>

        {/* Bottom Row: Tags & Remark */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Custom Tags */}
          {customTags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-[10px] px-1.5 py-0.5 h-5 bg-primary/5 border-primary/20 text-primary cursor-pointer hover:bg-primary/10"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveTag(tag);
              }}
            >
              {tag} ×
            </Badge>
          ))}

          {/* Add Tag Button */}
          <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
            <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[10px] text-muted-foreground hover:text-primary gap-0.5">
                <Tag className="w-3 h-3" />
                <Plus className="w-2.5 h-2.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-60 p-3" onClick={(e) => e.stopPropagation()}>
              <div className="space-y-3">
                <div className="text-xs font-medium text-muted-foreground">快捷标签</div>
                <div className="flex flex-wrap gap-1.5">
                  {defaultStatusTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-[10px] cursor-pointer hover:bg-primary/10 hover:border-primary/30"
                      onClick={() => handleSelectDefaultTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="border-t pt-3">
                  <div className="text-xs font-medium text-muted-foreground mb-2">自定义标签</div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="输入标签名称"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="h-7 text-xs"
                      onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                    />
                    <Button size="sm" className="h-7 px-2" onClick={handleAddTag}>
                      添加
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Remark Button */}
          <Popover open={remarkPopoverOpen} onOpenChange={setRemarkPopoverOpen}>
            <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-5 px-1.5 text-[10px] gap-0.5",
                  remarkText ? "text-primary" : "text-muted-foreground hover:text-primary"
                )}
              >
                <MessageSquare className="w-3 h-3" />
                {remarkText ? "备注" : "添加备注"}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-72 p-3" onClick={(e) => e.stopPropagation()}>
              <div className="space-y-3">
                <div className="text-xs font-medium">备注说明</div>
                <Textarea
                  placeholder="输入备注内容..."
                  value={remarkText}
                  onChange={(e) => setRemarkText(e.target.value)}
                  className="min-h-[80px] text-xs resize-none"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" className="h-7" onClick={() => setRemarkPopoverOpen(false)}>
                    取消
                  </Button>
                  <Button size="sm" className="h-7" onClick={handleSaveRemark}>
                    保存
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Show remark preview if exists */}
          {remarkText && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-[10px] text-muted-foreground truncate max-w-[150px] cursor-default" onClick={(e) => e.stopPropagation()}>
                    "{remarkText}"
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[300px]">
                  <p className="text-xs">{remarkText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
