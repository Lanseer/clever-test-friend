import { GitCompare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface CaseLine {
  type: "unchanged" | "added" | "removed" | "modified";
  content: string;
  highlightText?: string;
}

interface VersionDiffPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDiscard: () => void;
  onConfirm: () => void;
  oldVersion: string;
  newVersion: string;
}

const newVersionLines: CaseLine[] = [
  { type: "unchanged", content: "场景溯源：FSD001，第5页，描述 用户认证" },
  { type: "unchanged", content: "场景描述：支持有效用户名和密码进行登录。" },
  { type: "unchanged", content: "前置条件：用户已注册" },
  { type: "unchanged", content: "操作步骤：" },
  { type: "unchanged", content: "  step1: 打开登录页面" },
  { type: "unchanged", content: "  step2: 输入用户名和密码" },
  { type: "unchanged", content: "  step3: 点击登录按钮" },
  { type: "unchanged", content: "Data Eg: admin/Pass@123" },
  { type: "unchanged", content: "" },
  { type: "unchanged", content: "场景溯源：FSD001，第9页，描述 转账功能" },
  { type: "modified", content: "场景描述：支持活动状态的卡，进行转账。", highlightText: "活动" },
  { type: "unchanged", content: "前置条件：用户已登录且有绑定银行卡" },
  { type: "unchanged", content: "操作步骤：" },
  { type: "modified", content: "  step1: 选择转账功能并验证卡状态" },
  { type: "modified", content: "  step2: 输入金额并确认" },
  { type: "added", content: "  step3: 验证转账结果" },
  { type: "unchanged", content: "Data Eg: 转账金额=1000" },
  { type: "unchanged", content: "" },
  { type: "added", content: "场景溯源：FSD002，第3页，描述 余额查询" },
  { type: "added", content: "场景描述：支持查询活期账户余额。" },
  { type: "added", content: "前置条件：用户已登录" },
  { type: "added", content: "操作步骤：" },
  { type: "added", content: "  step1: 进入账户管理页面" },
  { type: "added", content: "  step2: 点击余额查询" },
  { type: "added", content: "Data Eg: 账户类型=活期" },
];

const oldVersionLines: CaseLine[] = [
  { type: "unchanged", content: "场景溯源：FSD001，第5页，描述 用户认证" },
  { type: "unchanged", content: "场景描述：支持有效用户名和密码进行登录。" },
  { type: "unchanged", content: "前置条件：用户已注册" },
  { type: "unchanged", content: "操作步骤：" },
  { type: "unchanged", content: "  step1: 打开登录页面" },
  { type: "unchanged", content: "  step2: 输入用户名和密码" },
  { type: "unchanged", content: "  step3: 点击登录按钮" },
  { type: "unchanged", content: "Data Eg: admin/Pass@123" },
  { type: "unchanged", content: "" },
  { type: "unchanged", content: "场景溯源：FSD001，第9页，描述 转账功能" },
  { type: "modified", content: "场景描述：支持有效状态的卡，进行转账。", highlightText: "有效" },
  { type: "unchanged", content: "前置条件：用户已登录且有绑定银行卡" },
  { type: "unchanged", content: "操作步骤：" },
  { type: "modified", content: "  step1: 选择转账功能" },
  { type: "modified", content: "  step2: 输入金额" },
  { type: "unchanged", content: "Data Eg: 转账金额=1000" },
  { type: "unchanged", content: "" },
  { type: "removed", content: "场景溯源：FSD001，第12页，描述 旧版密码重置" },
  { type: "removed", content: "场景描述：通过安全问题重置密码。" },
  { type: "removed", content: "前置条件：用户已设置安全问题" },
  { type: "removed", content: "操作步骤：" },
  { type: "removed", content: "  step1: 点击忘记密码" },
  { type: "removed", content: "  step2: 回答安全问题" },
  { type: "removed", content: "Data Eg: 问题=您的宠物名字" },
];

function renderContent(line: CaseLine) {
  if (line.highlightText) {
    const idx = line.content.indexOf(line.highlightText);
    if (idx >= 0) {
      const bgClass = line.type === "removed"
        ? "bg-red-300/60 dark:bg-red-500/40 px-0.5 rounded"
        : "bg-yellow-300/60 dark:bg-yellow-500/40 px-0.5 rounded";
      return (
        <>
          {line.content.slice(0, idx)}
          <span className={bgClass}>{line.highlightText}</span>
          {line.content.slice(idx + line.highlightText.length)}
        </>
      );
    }
  }
  return line.content || "\u00A0";
}

function DiffColumn({ title, version, lines }: { title: string; version: string; lines: CaseLine[] }) {
  return (
    <div className="flex flex-col flex-1 min-w-0">
      <div className="px-3 py-2 border-b bg-muted/40 flex items-center gap-2 flex-shrink-0">
        <span className="text-xs font-semibold text-foreground">{title}</span>
        <Badge variant="outline" className="font-mono text-[10px]">{version}</Badge>
      </div>
      <ScrollArea className="flex-1">
        <div className="font-mono text-xs">
          {lines.map((line, i) => (
            <div
              key={i}
              className={cn(
                "flex border-b border-border/20 last:border-b-0",
                line.type === "added" && "bg-green-500/10",
                line.type === "removed" && "bg-red-500/10",
                line.type === "modified" && "bg-amber-500/10",
              )}
            >
              <div className="w-7 px-1 py-0.5 text-right text-muted-foreground/50 border-r border-border/20 select-none flex-shrink-0 text-[10px]">
                {i + 1}
              </div>
              <div className={cn(
                "w-4 flex items-center justify-center flex-shrink-0 border-r border-border/20 text-[10px]",
                line.type === "added" && "text-green-600",
                line.type === "removed" && "text-red-500",
                line.type === "modified" && "text-amber-600",
              )}>
                {line.type === "added" && "+"}
                {line.type === "removed" && "-"}
                {line.type === "modified" && "~"}
              </div>
              <div className={cn(
                "flex-1 px-2 py-0.5 whitespace-pre-wrap break-all",
                line.type === "added" && "text-green-700 dark:text-green-400",
                line.type === "removed" && "text-red-600 dark:text-red-400 line-through opacity-70",
                line.type === "modified" && "text-amber-700 dark:text-amber-400",
              )}>
                {renderContent(line)}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

export function VersionDiffPanel({
  open,
  onOpenChange,
  onDiscard,
  onConfirm,
  oldVersion,
  newVersion,
}: VersionDiffPanelProps) {
  const { t } = useTranslation();

  const newAdded = newVersionLines.filter(l => l.type === "added").length;
  const newModified = newVersionLines.filter(l => l.type === "modified").length;
  const oldRemoved = oldVersionLines.filter(l => l.type === "removed").length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[90vw] h-[80vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <div className="px-5 py-3 border-b flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-primary" />
            <DialogTitle className="text-sm font-semibold">{t('smartDesign.viewDiffComparison')}</DialogTitle>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-green-600 font-medium">+{newAdded} 新增</span>
            <span className="flex items-center gap-1 text-amber-600 font-medium">~{newModified} 修改</span>
            <span className="flex items-center gap-1 text-red-500 font-medium">-{oldRemoved} 删除</span>
          </div>
        </div>

        {/* Side by side: Left=New, Right=Old */}
        <div className="flex flex-1 min-h-0 divide-x divide-border">
          <DiffColumn title="新版本" version={newVersion} lines={newVersionLines} />
          <DiffColumn title="旧版本" version={oldVersion} lines={oldVersionLines} />
        </div>

        {/* Bottom actions */}
        <div className="px-5 py-3 border-t flex items-center justify-end gap-2 flex-shrink-0">
          <Button
            variant="outline"
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={() => { onDiscard(); onOpenChange(false); }}
          >
            {t('smartDesign.discardChanges')}
          </Button>
          <Button
            className="bg-gradient-to-r from-primary to-primary/80"
            onClick={() => { onConfirm(); onOpenChange(false); }}
          >
            {t('smartDesign.confirmChanges')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
