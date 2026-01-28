import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { CaseSourceInfo } from "@/components/workspace/CaseSourceInfo";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  onSaveDraft?: (id: string, content: string) => void;
}

const reviewResultConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "待审查", className: "bg-gray-100 text-gray-600 border-gray-200" },
  adopted: { label: "采纳", className: "bg-green-500/10 text-green-600 border-green-200" },
  needsImprovement: { label: "需完善", className: "bg-amber-500/10 text-amber-600 border-amber-200" },
  improved: { label: "已完善", className: "bg-blue-500/10 text-blue-600 border-blue-200" },
  needsDiscard: { label: "丢弃", className: "bg-red-500/10 text-red-600 border-red-200" },
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
  caseData,
  onSaveDraft
}: CaseDetailSidebarProps) {
  const [editedContent, setEditedContent] = useState<string>("");
  const [isEdited, setIsEdited] = useState(false);

  const reviewResult = caseData?.reviewResult || "pending";
  const resultConfig = reviewResultConfig[reviewResult] || reviewResultConfig.pending;

  const handleContentChange = (value: string) => {
    setEditedContent(value);
    setIsEdited(true);
  };

  const handleSaveDraft = () => {
    if (caseData && isEdited) {
      onSaveDraft?.(caseData.id, editedContent);
      toast.success("修改内容已暂存");
      setIsEdited(false);
    }
  };

  const currentContent = isEdited ? editedContent : (caseData?.bddContent || getMockBddContent());

  return (
    <Sheet open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        setIsEdited(false);
        setEditedContent("");
      }
      onOpenChange(isOpen);
    }}>
      <SheetContent className="w-[520px] sm:max-w-[520px] flex flex-col">
        <SheetHeader>
          <SheetTitle>案例详情</SheetTitle>
        </SheetHeader>
        
        {caseData && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6 py-4">
                {/* BDD 完整内容 - 可编辑文本域 - 放在最上面 */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">案例详情 (BDD)</Label>
                  <Textarea
                    className={cn(
                      "min-h-[300px] font-mono text-xs resize-none",
                      isEdited ? "bg-amber-50/50 border-amber-200" : "bg-muted/30"
                    )}
                    value={currentContent}
                    onChange={(e) => handleContentChange(e.target.value)}
                  />
                  {isEdited && (
                    <p className="text-xs text-amber-600">* 内容已修改，请点击暂存按钮保存</p>
                  )}
                </div>

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
              </div>
            </ScrollArea>
            
            {/* 底部暂存按钮 */}
            <div className="pt-4 border-t mt-2">
              <Button 
                className="w-full" 
                onClick={handleSaveDraft}
                disabled={!isEdited}
              >
                保存
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
