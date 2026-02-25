import { X, GitCompare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface DiffLine {
  type: "unchanged" | "added" | "removed" | "modified";
  oldLineNumber?: number;
  newLineNumber?: number;
  content: string;
  highlightText?: string;
}

interface VersionDiffPanelProps {
  open: boolean;
  onClose: () => void;
  onDiscard: () => void;
  onConfirm: () => void;
  oldVersion: string;
  newVersion: string;
}

// Mock feature file diff data resembling BDD/test case format
const mockDiffLines: DiffLine[] = [
  // Scenario 1 - unchanged
  { type: "unchanged", oldLineNumber: 1, newLineNumber: 1, content: "场景溯源：FSD001，第5页，描述 用户认证" },
  { type: "unchanged", oldLineNumber: 2, newLineNumber: 2, content: "场景描述：支持有效用户名和密码进行登录。" },
  { type: "unchanged", oldLineNumber: 3, newLineNumber: 3, content: "前置条件：用户已注册" },
  { type: "unchanged", oldLineNumber: 4, newLineNumber: 4, content: "操作步骤：" },
  { type: "unchanged", oldLineNumber: 5, newLineNumber: 5, content: "  step1: 打开登录页面" },
  { type: "unchanged", oldLineNumber: 6, newLineNumber: 6, content: "  step2: 输入用户名和密码" },
  { type: "unchanged", oldLineNumber: 7, newLineNumber: 7, content: "  step3: 点击登录按钮" },
  { type: "unchanged", oldLineNumber: 8, newLineNumber: 8, content: "Data Eg: admin/Pass@123" },
  { type: "unchanged", oldLineNumber: 9, newLineNumber: 9, content: "" },
  // Scenario 2 - modified
  { type: "unchanged", oldLineNumber: 10, newLineNumber: 10, content: "场景溯源：FSD001，第9页，描述 转账功能" },
  { type: "removed", oldLineNumber: 11, content: "场景描述：支持有效状态的卡，进行转账。" },
  { type: "added", newLineNumber: 11, content: "场景描述：支持活动状态的卡，进行转账。", highlightText: "活动" },
  { type: "unchanged", oldLineNumber: 12, newLineNumber: 12, content: "前置条件：用户已登录且有绑定银行卡" },
  { type: "unchanged", oldLineNumber: 13, newLineNumber: 13, content: "操作步骤：" },
  { type: "removed", oldLineNumber: 14, content: "  step1: 选择转账功能" },
  { type: "removed", oldLineNumber: 15, content: "  step2: 输入金额" },
  { type: "added", newLineNumber: 14, content: "  step1: 选择转账功能并验证卡状态" },
  { type: "added", newLineNumber: 15, content: "  step2: 输入金额并确认" },
  { type: "added", newLineNumber: 16, content: "  step3: 验证转账结果" },
  { type: "unchanged", oldLineNumber: 16, newLineNumber: 17, content: "Data Eg: 转账金额=1000" },
  { type: "unchanged", oldLineNumber: 17, newLineNumber: 18, content: "" },
  // Scenario 3 - new
  { type: "added", newLineNumber: 19, content: "场景溯源：FSD002，第3页，描述 余额查询" },
  { type: "added", newLineNumber: 20, content: "场景描述：支持查询活期账户余额。" },
  { type: "added", newLineNumber: 21, content: "前置条件：用户已登录" },
  { type: "added", newLineNumber: 22, content: "操作步骤：" },
  { type: "added", newLineNumber: 23, content: "  step1: 进入账户管理页面" },
  { type: "added", newLineNumber: 24, content: "  step2: 点击余额查询" },
  { type: "added", newLineNumber: 25, content: "Data Eg: 账户类型=活期" },
  { type: "unchanged", oldLineNumber: 18, newLineNumber: 26, content: "" },
  // Scenario 4 - removed
  { type: "removed", oldLineNumber: 19, content: "场景溯源：FSD001，第12页，描述 旧版密码重置" },
  { type: "removed", oldLineNumber: 20, content: "场景描述：通过安全问题重置密码。" },
  { type: "removed", oldLineNumber: 21, content: "前置条件：用户已设置安全问题" },
  { type: "removed", oldLineNumber: 22, content: "操作步骤：" },
  { type: "removed", oldLineNumber: 23, content: "  step1: 点击忘记密码" },
  { type: "removed", oldLineNumber: 24, content: "  step2: 回答安全问题" },
  { type: "removed", oldLineNumber: 25, content: "Data Eg: 问题=您的宠物名字" },
];

function renderContent(line: DiffLine) {
  if (line.highlightText && line.type === "added") {
    const idx = line.content.indexOf(line.highlightText);
    if (idx >= 0) {
      return (
        <>
          {line.content.slice(0, idx)}
          <span className="bg-yellow-300/60 dark:bg-yellow-500/40 px-0.5 rounded">{line.highlightText}</span>
          {line.content.slice(idx + line.highlightText.length)}
        </>
      );
    }
  }
  return line.content || " ";
}

export function VersionDiffPanel({
  open,
  onClose,
  onDiscard,
  onConfirm,
  oldVersion,
  newVersion,
}: VersionDiffPanelProps) {
  const { t } = useTranslation();

  if (!open) return null;

  const addedCount = mockDiffLines.filter(d => d.type === "added").length;
  const removedCount = mockDiffLines.filter(d => d.type === "removed").length;

  return (
    <div className="flex flex-col h-full bg-white/60 dark:bg-background/40 backdrop-blur-sm border-l border-border/50">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">{t('smartDesign.viewDiffComparison')}</h3>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Version info & stats */}
      <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs">{oldVersion}</Badge>
          <span className="text-muted-foreground text-xs">→</span>
          <Badge variant="outline" className="font-mono text-xs">{newVersion}</Badge>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-green-600">
            <span className="font-semibold">+{addedCount}</span>
          </span>
          <span className="flex items-center gap-1 text-red-500">
            <span className="font-semibold">-{removedCount}</span>
          </span>
        </div>
      </div>

      {/* Diff content */}
      <ScrollArea className="flex-1">
        <div className="font-mono text-xs">
          {mockDiffLines.map((line, index) => (
            <div
              key={index}
              className={cn(
                "flex border-b border-border/30 last:border-b-0",
                line.type === "added" && "bg-green-500/10",
                line.type === "removed" && "bg-red-500/10"
              )}
            >
              {/* Old line number */}
              <div className={cn(
                "w-8 px-1 py-0.5 text-right text-muted-foreground/60 border-r border-border/30 select-none flex-shrink-0",
                line.type === "removed" && "bg-red-500/20",
                line.type === "added" && "bg-green-500/20"
              )}>
                {line.oldLineNumber || ""}
              </div>
              {/* New line number */}
              <div className={cn(
                "w-8 px-1 py-0.5 text-right text-muted-foreground/60 border-r border-border/30 select-none flex-shrink-0",
                line.type === "removed" && "bg-red-500/20",
                line.type === "added" && "bg-green-500/20"
              )}>
                {line.newLineNumber || ""}
              </div>
              {/* Indicator */}
              <div className={cn(
                "w-4 flex items-center justify-center flex-shrink-0 border-r border-border/30",
                line.type === "removed" && "bg-red-500/20 text-red-500",
                line.type === "added" && "bg-green-500/20 text-green-500"
              )}>
                {line.type === "added" && "+"}
                {line.type === "removed" && "-"}
              </div>
              {/* Content */}
              <div className={cn(
                "flex-1 px-2 py-0.5 whitespace-pre-wrap break-all",
                line.type === "added" && "text-green-700 dark:text-green-400",
                line.type === "removed" && "text-red-700 dark:text-red-400 line-through"
              )}>
                {renderContent(line)}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Bottom actions */}
      <div className="px-4 py-3 border-t flex items-center gap-2 flex-shrink-0">
        <Button
          variant="outline"
          className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={onDiscard}
        >
          {t('smartDesign.discardChanges')}
        </Button>
        <Button
          className="flex-1 bg-gradient-to-r from-primary to-primary/80"
          onClick={onConfirm}
        >
          {t('smartDesign.confirmChanges')}
        </Button>
      </div>
    </div>
  );
}
