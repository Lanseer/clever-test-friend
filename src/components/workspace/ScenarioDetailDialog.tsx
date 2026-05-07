import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { CaseSourceInfo } from "@/components/workspace/CaseSourceInfo";

interface ScenarioDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scenarioId: string | null;
}

const getMockBdd = (scenarioId: string) => `Feature: 场景 ${scenarioId}

  Scenario: ${scenarioId} - 主流程验证
    Given 用户已登录系统
    And 用户位于业务操作页面
    When 用户按照标准流程发起 ${scenarioId} 操作
    And 用户提交相关表单数据
    Then 系统应正确处理请求
    And 返回成功响应并展示结果
    And 操作日志被正确记录

  Examples:
    | 输入项     | 取值        | 预期结果   |
    | 金额       | 100.00      | 成功       |
    | 金额       | 0.01        | 成功       |
    | 金额       | -1          | 失败       |`;

export function ScenarioDetailDialog({ open, onOpenChange, scenarioId }: ScenarioDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>场景详情 · {scenarioId}</DialogTitle>
        </DialogHeader>
        {scenarioId && (
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6 py-2">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs">案例内容（BDD）</Label>
                <pre className="rounded-md border bg-muted/30 p-3 font-mono text-xs whitespace-pre-wrap text-foreground/80">
{getMockBdd(scenarioId)}
                </pre>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs">案例来源</Label>
                <CaseSourceInfo caseId={scenarioId} showHeader={false} />
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
