import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CaseSourceInfo } from "@/components/workspace/CaseSourceInfo";
import { cn } from "@/lib/utils";

export interface CaseDetailData {
  id: string;
  reviewResult?: string;
  caseCount?: number;
  bddContent?: string;
}

interface CaseDetailSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseData: CaseDetailData | null;
}

const reviewResultConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "待审查", className: "bg-gray-100 text-gray-600 border-gray-200" },
  adopt: { label: "采纳", className: "bg-green-500/10 text-green-600 border-green-200" },
  needs_improvement: { label: "需完善", className: "bg-amber-500/10 text-amber-600 border-amber-200" },
  discard: { label: "丢弃", className: "bg-red-500/10 text-red-600 border-red-200" },
};

const getMockBddContent = () => {
  return `Feature: 用户登录功能

  Scenario: 用户使用有效的用户名和密码登录系统
    Given 用户已经注册并拥有有效的账户
    And 用户位于登录页面
    When 用户输入正确的用户名 "testuser"
    And 用户输入正确的密码 "Password123"
    And 用户点击登录按钮
    Then 系统应该验证用户凭证
    And 用户应该被重定向到主页
    And 系统应该显示欢迎消息

  Examples:
    | 用户名    | 密码        | 预期结果   |
    | testuser  | Password123 | 登录成功   |
    | admin     | Admin@456   | 登录成功   |
    | user01    | User#789    | 登录成功   |`;
};

export function CaseDetailSidebar({ 
  open, 
  onOpenChange, 
  caseData 
}: CaseDetailSidebarProps) {
  const reviewResult = caseData?.reviewResult || "pending";
  const resultConfig = reviewResultConfig[reviewResult] || reviewResultConfig.pending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[520px] sm:max-w-[520px] flex flex-col">
        <SheetHeader>
          <SheetTitle>案例详情</SheetTitle>
        </SheetHeader>
        
        {caseData && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6 py-4">
                {/* 审查结果和对应案例数 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">审查结果</Label>
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", resultConfig.className)}
                    >
                      {resultConfig.label}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">对应案例数</Label>
                    <Badge variant="outline" className="text-xs">
                      {caseData.caseCount ?? "-"}
                    </Badge>
                  </div>
                </div>
                
                {/* 案例来源详情 */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">案例来源</Label>
                  <CaseSourceInfo caseId={caseData.id} showHeader={false} />
                </div>
                
                {/* BDD 完整内容 - 单一文本域展示 */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">案例详情 (BDD)</Label>
                  <Textarea
                    className="min-h-[300px] font-mono text-xs bg-muted/30 resize-none"
                    value={caseData.bddContent || getMockBddContent()}
                    readOnly
                  />
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
