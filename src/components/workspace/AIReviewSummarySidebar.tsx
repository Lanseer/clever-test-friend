import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Clock, Pencil, Save, X, Sparkles, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AIReviewRecord {
  id: string;
  code: string;
  startTime: string;
  endTime: string | null;
  totalCases: number;
  excellentCases: number;
  passedCases: number;
  failedCases: number;
  summary: string;
}

interface AIReviewSummarySidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: AIReviewRecord | null;
}

export function AIReviewSummarySidebar({ open, onOpenChange, record }: AIReviewSummarySidebarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState(record?.summary || "");

  // Update summary when record changes
  if (record && summary !== record.summary && !isEditing) {
    setSummary(record.summary);
  }

  if (!record) return null;

  const handleAIGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setSummary(`**AI智能生成评审总结**

本次AI评审共涉及${record.totalCases}个测试用例，整体质量评估如下：

**评审结果概览**
- 优秀用例: ${record.excellentCases}个 (${((record.excellentCases / record.totalCases) * 100).toFixed(1)}%)
- 合格用例: ${record.passedCases}个 (${((record.passedCases / record.totalCases) * 100).toFixed(1)}%)
- 不合格用例: ${record.failedCases}个 (${((record.failedCases / record.totalCases) * 100).toFixed(1)}%)

**质量分析**
优秀用例场景设计完整，BDD描述规范，可直接采纳使用。合格用例基本满足测试需求，建议优化部分描述后采纳。不合格用例需要重新生成或人工修改。

**优化建议**
1. 补充边界条件测试场景
2. 完善异常处理用例
3. 增加性能相关测试覆盖`);
      setIsGenerating(false);
      toast.success("AI评审总结生成成功");
    }, 1500);
  };

  const handleSave = () => {
    setIsEditing(false);
    toast.success("评审总结已保存");
  };

  const handleCancel = () => {
    setSummary(record.summary);
    setIsEditing(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            AI评审总结
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">评审编号</span>
              <Badge variant="outline" className="font-mono">{record.code}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">开始时间</span>
              <div className="flex items-center gap-1 text-sm">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                {record.startTime}
              </div>
            </div>
            {record.endTime && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">结束时间</span>
                <div className="flex items-center gap-1 text-sm">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  {record.endTime}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Statistics */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">评审统计</h4>
            <div className="grid grid-cols-4 gap-3">
              <div className="p-3 rounded-lg border bg-muted/30 text-center">
                <div className="text-lg font-bold">{record.totalCases}</div>
                <div className="text-xs text-muted-foreground">总用例</div>
              </div>
              <div className="p-3 rounded-lg border bg-green-50 text-center">
                <div className="text-lg font-bold text-green-600 flex items-center justify-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  {record.excellentCases}
                </div>
                <div className="text-xs text-green-600">优秀</div>
              </div>
              <div className="p-3 rounded-lg border bg-blue-50 text-center">
                <div className="text-lg font-bold text-blue-600 flex items-center justify-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {record.passedCases}
                </div>
                <div className="text-xs text-blue-600">合格</div>
              </div>
              <div className="p-3 rounded-lg border bg-red-50 text-center">
                <div className="text-lg font-bold text-red-600 flex items-center justify-center gap-1">
                  <XCircle className="w-4 h-4" />
                  {record.failedCases}
                </div>
                <div className="text-xs text-red-600">不合格</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Summary Content */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                评审总结详情
              </h4>
              {!isEditing && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs gap-1"
                    onClick={handleAIGenerate}
                    disabled={isGenerating}
                  >
                    <Sparkles className={cn("w-3.5 h-3.5", isGenerating && "animate-pulse")} />
                    {isGenerating ? "生成中..." : "AI智能生成"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs gap-1"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    编辑
                  </Button>
                </div>
              )}
            </div>
            {isEditing ? (
              <div className="space-y-3">
                <Textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="min-h-[250px] text-sm"
                  placeholder="输入评审总结..."
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-xs gap-1"
                    onClick={handleCancel}
                  >
                    <X className="w-3.5 h-3.5" />
                    取消
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 px-3 text-xs gap-1"
                    onClick={handleSave}
                  >
                    <Save className="w-3.5 h-3.5" />
                    保存
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg border bg-muted/30 max-h-[300px] overflow-y-auto">
                <div className="text-sm whitespace-pre-wrap prose prose-sm max-w-none">
                  {summary}
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
