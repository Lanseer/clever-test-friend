import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, AlertTriangle, FileText, Clock, User, Pencil, Save, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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

const defaultSummary = `本次生成用例覆盖了用户登录、注册、密码重置等核心功能场景。

**完整性评估**: 覆盖率约85%，主要覆盖了正向流程和常见异常场景。

**质量评估**: 用例描述清晰，BDD格式规范，步骤可执行性强。

**缺失用例建议**: 
- 缺少并发登录限制场景
- 缺少密码强度验证边界测试
- 建议补充会话超时处理用例`;

export function ReportSidebar({ open, onOpenChange, type, data }: ReportSidebarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [summary, setSummary] = useState(data?.reportSummary || defaultSummary);

  if (!data) return null;

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
                      <span className="text-muted-foreground">生成用例数</span>
                      <span className="font-medium">24 个</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">通过用例数</span>
                      <span className="font-medium text-green-600">22 个</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">待调整用例</span>
                      <span className="font-medium text-amber-600">2 个</span>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs gap-1"
                      onClick={() => setIsEditing(true)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      编辑报告
                    </Button>
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
