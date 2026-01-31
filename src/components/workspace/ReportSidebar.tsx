import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, AlertTriangle, FileText, Clock, User, Pencil, Save, X, Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ReportSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "report" | "failure";
  data: {
    code: string;
    name: string;
    reviewer?: string;
    createdAt: string;
    report?: string | null;
    reportSummary?: string;
    failureReason?: string;
  } | null;
}

const defaultSummary = `本次生成案例覆盖了用户登录、注册、密码重置等核心功能场景。

**完整性评估**: 覆盖率约85%，主要覆盖了正向流程和常见异常场景。

**质量评估**: 案例描述清晰，BDD格式规范，步骤可执行性强。

**缺失案例建议**: 
- 缺少并发登录限制场景
- 缺少密码强度验证边界测试
- 建议补充会话超时处理案例`;

export function ReportSidebar({ open, onOpenChange, type, data }: ReportSidebarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState(data?.reportSummary || defaultSummary);

  if (!data) return null;

  const handleAIGenerate = () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setSummary(`**AI智能生成报告总结**

本次案例评审共涉及24个AI生成案例，最终采纳22个，采纳率91.7%。

**质量分析**: 
- 案例场景覆盖完整，涵盖正向流程和异常边界
- BDD格式规范，可读性强
- 测试步骤清晰明确，可执行性高

**问题案例分析**: 
- 2个不采纳案例主要问题：场景描述与实际需求不符

**优化建议**: 
- 建议补充并发场景测试案例
- 增加性能边界值测试覆盖`);
      setIsGenerating(false);
      toast.success("AI报告总结生成成功");
    }, 1500);
  };

  const handleSave = () => {
    // In a real app, this would save to the backend
    setIsEditing(false);
  };

  const handleCancel = () => {
    setSummary(data?.reportSummary || defaultSummary);
    setIsEditing(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {type === "report" ? (
              <>
                <FileText className="w-5 h-5 text-primary" />
                评审报告
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-destructive" />
                失败信息
              </>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">编号</span>
              <Badge variant="outline" className="font-mono">{data.code}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">名称</span>
              <span className="text-sm font-medium">{data.name}</span>
            </div>
            {data.reviewer && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">评审人</span>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm">{data.reviewer}</span>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">创建时间</span>
              <div className="flex items-center gap-1 text-sm">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                {data.createdAt}
              </div>
            </div>
          </div>

          <Separator />

          {/* Report or Failure Content */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              {type === "report" ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  报告详情
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-destructive" />
                  错误详情
                </>
              )}
            </h4>
            <div className={`p-4 rounded-lg border ${type === "failure" ? "bg-destructive/5 border-destructive/20" : "bg-muted/50"}`}>
              {type === "report" ? (
                <div className="space-y-3">
                  <p className="text-sm">{data.report || "暂无报告内容"}</p>
                  <div className="pt-3 border-t space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">案例采纳</span>
                      <span className="font-medium text-green-600">22 / 24 个</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">案例总结</span>
                      <span className="font-medium">覆盖登录、注册等核心场景</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-destructive">
                    {data.failureReason || "生成过程中发生未知错误，请稍后重试。"}
                  </p>
                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground">
                      错误代码: ERR_GENERATION_FAILED
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      建议: 检查源文档格式是否正确，或尝试重新生成。
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Report Summary - Only for report type */}
          {type === "report" && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    报告总结
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
                        编辑报告
                      </Button>
                    </div>
                  )}
                </div>
                {isEditing ? (
                  <div className="space-y-3">
                    <Textarea
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      className="min-h-[200px] text-sm"
                      placeholder="输入报告总结..."
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
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <div className="text-sm whitespace-pre-wrap prose prose-sm max-w-none">
                      {summary}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
