import { ChevronDown, ChevronRight, FileText, Eye, X } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface TestPoint {
  id: string;
  name: string;
  caseCount: number;
}

interface Dimension {
  id: string;
  name: string;
  caseCount: number;
  testPoints: TestPoint[];
}

interface GeneratedFile {
  id: string;
  name: string;
  scenarioCount: number;
  caseCount: number;
  createdAt: string;
}

interface GeneratedFilesPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: GeneratedFile | null;
  dimensions: Dimension[];
  onStartReview?: () => void;
}

export function GeneratedFilesPanel({
  onOpenChange,
  file,
  dimensions,
  onStartReview,
}: GeneratedFilesPanelProps) {
  const navigate = useNavigate();
  const { workspaceId } = useParams();
  const { t } = useTranslation();
  const [expandedDimensions, setExpandedDimensions] = useState<Set<string>>(
    new Set(dimensions.map((d) => d.id))
  );

  const toggleDimension = (id: string) => {
    const newExpanded = new Set(expandedDimensions);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedDimensions(newExpanded);
  };

  const handleViewCases = (testPoint: TestPoint) => {
    if (!workspaceId) return;
    navigate(`/workspace/${workspaceId}/management/ai-cases/1/case-review/case/${testPoint.id}`);
    onOpenChange(false);
  };

  if (!file) return null;

  return (
    <div className="flex flex-col h-full bg-white/60 dark:bg-background/40 backdrop-blur-sm border-l border-sky-200/50 dark:border-sky-800/30">
      <div className="px-4 py-3 border-b border-sky-200/50 dark:border-sky-800/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-sky-600" />
          <h3 className="font-semibold text-sm text-sky-800 dark:text-sky-200 truncate">
            {file.name}
          </h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onOpenChange(false)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="px-4 py-3 border-b bg-muted/30">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t("generatedFiles.scenariosLabel")}</span>
            <Badge variant="secondary" className="font-medium">{file.scenarioCount}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t("generatedFiles.casesLabel")}</span>
            <Badge variant="secondary" className="font-medium">{file.caseCount}</Badge>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {dimensions.map((dimension) => (
            <Collapsible
              key={dimension.id}
              open={expandedDimensions.has(dimension.id)}
              onOpenChange={() => toggleDimension(dimension.id)}
            >
              <div className="rounded-lg border bg-card overflow-hidden">
                <CollapsibleTrigger asChild>
                  <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2">
                      {expandedDimensions.has(dimension.id) ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="font-medium text-sm">{dimension.name}</span>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-0">
                      {dimension.caseCount} {t("generatedFiles.casesCount")}
                    </Badge>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border-t divide-y">
                    {dimension.testPoints.map((tp) => (
                      <div
                        key={tp.id}
                        className="px-4 py-2.5 flex items-center justify-between hover:bg-muted/30 transition-colors"
                      >
                        <button
                          type="button"
                          className="flex items-center gap-2 flex-1 min-w-0 text-left"
                          onClick={() => handleViewCases(tp)}
                        >
                          <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm truncate">{tp.name}</span>
                          <span className="text-xs text-primary">
                            ({tp.caseCount} {t("generatedFiles.casesCount")})
                          </span>
                        </button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs gap-1 flex-shrink-0 text-primary hover:text-primary"
                          onClick={() => handleViewCases(tp)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {t("generatedFiles.view")}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>
      </ScrollArea>

      {onStartReview && (
        <div className="p-4 border-t">
          <Button className="w-full bg-gradient-to-r from-primary to-primary/80" onClick={onStartReview}>
            {t("generatedFiles.startReview")}
          </Button>
        </div>
      )}
    </div>
  );
}
