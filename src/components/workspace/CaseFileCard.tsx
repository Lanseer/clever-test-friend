import { useState } from "react";
import { FileText, ChevronRight, ClipboardList, Calendar, Check, AlertCircle, Trash2, UserCheck, Tag, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

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
  statusTag?: string;
  externalReview?: ExternalReviewStats;
}

interface CaseFileCardProps {
  file: CaseFileData;
  onCardClick: (fileId: string) => void;
  onReportClick: (e: React.MouseEvent, fileName: string) => void;
  onExpertReviewClick: (e: React.MouseEvent, fileId: string) => void;
  onTagChange?: (fileId: string, tag: string | undefined) => void;
}

const useDefaultStatusTags = () => {
  const { t } = useTranslation();
  return [
    t('mockData.statusTags.reviewComplete'), 
    t('mockData.statusTags.reviewing'), 
    t('mockData.statusTags.pendingReview'), 
    t('mockData.statusTags.discarded')
  ];
};

const useTagColorClasses = () => {
  const { t } = useTranslation();
  return (tag: string): string => {
    const reviewComplete = t('mockData.statusTags.reviewComplete');
    const reviewing = t('mockData.statusTags.reviewing');
    const pendingReview = t('mockData.statusTags.pendingReview');
    const discarded = t('mockData.statusTags.discarded');
    
    if (tag === reviewComplete || tag === "审查完成" || tag === "Review Complete") {
      return "bg-green-100 text-green-700 border-green-300";
    } else if (tag === reviewing || tag === "审查中" || tag === "Reviewing") {
      return "bg-blue-100 text-blue-700 border-blue-300";
    } else if (tag === pendingReview || tag === "待审查" || tag === "Pending Review") {
      return "bg-amber-100 text-amber-700 border-amber-300";
    } else if (tag === discarded || tag === "废弃" || tag === "Discarded") {
      return "bg-gray-100 text-gray-500 border-gray-300";
    }
    return "bg-primary/5 border-primary/20 text-primary";
  };
};

export function CaseFileCard({
  file,
  onCardClick,
  onReportClick,
  onExpertReviewClick,
  onTagChange,
}: CaseFileCardProps) {
  const { t } = useTranslation();
  const defaultStatusTags = useDefaultStatusTags();
  const getTagColorClasses = useTagColorClasses();
  
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [currentTag, setCurrentTag] = useState<string | undefined>(file.statusTag);

  const handleAddTag = () => {
    if (newTag.trim()) {
      setCurrentTag(newTag.trim());
      onTagChange?.(file.id, newTag.trim());
      setNewTag("");
      setTagPopoverOpen(false);
      toast.success(`${t('mockData.caseFileCard.tagAdded')}: "${newTag.trim()}"`);
    }
  };

  const handleRemoveTag = () => {
    setCurrentTag(undefined);
    onTagChange?.(file.id, undefined);
  };

  const handleSelectDefaultTag = (tag: string) => {
    setCurrentTag(tag);
    onTagChange?.(file.id, tag);
    setTagPopoverOpen(false);
  };

  const externalReview = file.externalReview || { total: 0, completed: 0, inProgress: 0 };

  return (
    <Card
      className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/30"
      onClick={() => onCardClick(file.id)}
    >
      <CardContent className="p-4">
        {/* Top Row: Title + Actions */}
        <div className="flex items-start gap-3 mb-3">
          {/* Icon */}
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-sky-500/20">
            <FileText className="w-5 h-5 text-white" />
          </div>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium truncate">{file.name}_{file.version}</h3>
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
                <TooltipContent side="top"><p>{t('mockData.caseFileCard.auditReport')}</p></TooltipContent>
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
                <TooltipContent side="top"><p>{t('mockData.caseFileCard.externalReview')}</p></TooltipContent>
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
              <span className="text-muted-foreground">{t('mockData.caseFileCard.adopted')}</span> {file.adoptedCount}
            </span>
            <span className="flex items-center gap-1 text-amber-600">
              <AlertCircle className="w-3 h-3" />
              <span className="text-muted-foreground">{t('mockData.caseFileCard.needsImprovement')}</span> {file.needsImprovementCount}
            </span>
            <span className="flex items-center gap-1 text-red-600">
              <Trash2 className="w-3 h-3" />
              <span className="text-muted-foreground">{t('mockData.caseFileCard.discard')}</span> {file.discardedCount}
            </span>
          </div>

          {/* External Review Stats */}
          {externalReview.total > 0 && (
            <div className="flex items-center gap-2 text-xs border-l pl-3">
              <Users className="w-3.5 h-3.5 text-primary" />
              <span className="text-muted-foreground">{t('mockData.caseFileCard.externalReviewStats')}</span>
              <span className="font-medium">{externalReview.total}{t('common.times')}</span>
              <span className="text-green-600">({t('common.completed')}{externalReview.completed}</span>
              <span className="text-amber-600">{t('common.inProgress')}{externalReview.inProgress})</span>
            </div>
          )}
          {externalReview.total === 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              <span>{t('mockData.caseFileCard.noExternalReview')}</span>
            </div>
          )}
        </div>

        {/* Bottom Row: Single Tag */}
        <div className="flex items-center gap-2">
          {/* Current Tag */}
          {currentTag && (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] px-1.5 py-0.5 h-5 cursor-pointer hover:opacity-80",
                getTagColorClasses(currentTag)
              )}
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveTag();
              }}
            >
              {currentTag} ×
            </Badge>
          )}

          {/* Add Tag Button - Only show if no tag exists */}
          {!currentTag && (
            <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
              <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[10px] text-muted-foreground hover:text-primary gap-1">
                  <Tag className="w-3 h-3" />
                  {t('mockData.caseFileCard.addTag')}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-60 p-3" onClick={(e) => e.stopPropagation()}>
                <div className="space-y-3">
                  <div className="text-xs font-medium text-muted-foreground">{t('mockData.caseFileCard.quickTags')}</div>
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
                    <div className="text-xs font-medium text-muted-foreground mb-2">{t('mockData.caseFileCard.customTag')}</div>
                    <div className="flex gap-2">
                      <Input
                        placeholder={t('mockData.caseFileCard.enterTagName')}
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        className="h-7 text-xs"
                        onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                      />
                      <Button size="sm" className="h-7 px-2" onClick={handleAddTag}>
                        {t('common.add')}
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
