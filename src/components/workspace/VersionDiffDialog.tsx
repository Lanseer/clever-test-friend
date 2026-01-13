import { useState } from "react";
import { GitCompare, ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface VersionHistory {
  version: string;
  date: string;
  author: string;
  changes: string[];
}

interface VersionDiffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentName: string;
  currentVersion: string;
  versionHistory: VersionHistory[];
}

// Mock diff content for demonstration
const mockDiffContent = [
  { type: "unchanged", lineNumber: [1, 1], content: "## 用户管理模块" },
  { type: "unchanged", lineNumber: [2, 2], content: "" },
  { type: "unchanged", lineNumber: [3, 3], content: "### 1. 功能概述" },
  { type: "removed", lineNumber: [4, null], content: "用户管理模块提供基础的用户增删改查功能。" },
  { type: "added", lineNumber: [null, 4], content: "用户管理模块提供完整的用户生命周期管理功能，包括增删改查、权限控制、批量操作等。" },
  { type: "unchanged", lineNumber: [5, 5], content: "" },
  { type: "unchanged", lineNumber: [6, 6], content: "### 2. 功能列表" },
  { type: "removed", lineNumber: [7, null], content: "- 用户列表查询" },
  { type: "removed", lineNumber: [8, null], content: "- 用户信息编辑" },
  { type: "added", lineNumber: [null, 7], content: "- 用户列表查询（支持分页、排序、筛选）" },
  { type: "added", lineNumber: [null, 8], content: "- 用户信息编辑（支持批量编辑）" },
  { type: "added", lineNumber: [null, 9], content: "- 用户权限分配" },
  { type: "added", lineNumber: [null, 10], content: "- 操作日志记录" },
  { type: "unchanged", lineNumber: [9, 11], content: "" },
  { type: "unchanged", lineNumber: [10, 12], content: "### 3. 接口规范" },
  { type: "removed", lineNumber: [11, null], content: "接口采用RESTful设计。" },
  { type: "added", lineNumber: [null, 13], content: "接口采用RESTful设计，遵循OpenAPI 3.0规范。" },
];

export default function VersionDiffDialog({
  open,
  onOpenChange,
  documentName,
  currentVersion,
  versionHistory,
}: VersionDiffDialogProps) {
  const [sourceVersion, setSourceVersion] = useState(currentVersion);
  const [targetVersion, setTargetVersion] = useState("");
  const [showDiff, setShowDiff] = useState(false);

  const handleCompare = () => {
    if (targetVersion) {
      setShowDiff(true);
    }
  };

  const handleClose = () => {
    setShowDiff(false);
    setTargetVersion("");
    onOpenChange(false);
  };

  const addedCount = mockDiffContent.filter(d => d.type === "added").length;
  const removedCount = mockDiffContent.filter(d => d.type === "removed").length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-primary" />
            版本差异对比
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{documentName}</p>
        </DialogHeader>

        {/* Version Selection */}
        <div className="flex items-center gap-4 py-4 border-b">
          <div className="flex-1">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">当前版本</label>
            <Select value={sourceVersion} onValueChange={setSourceVersion}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择版本" />
              </SelectTrigger>
              <SelectContent>
                {versionHistory.map((v) => (
                  <SelectItem key={v.version} value={v.version}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{v.version}</span>
                      <span className="text-muted-foreground text-xs">({v.date})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-center pt-6">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <ChevronDown className="w-4 h-4 text-muted-foreground rotate-[-90deg]" />
            </div>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">对比版本</label>
            <Select value={targetVersion} onValueChange={setTargetVersion}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择要对比的版本" />
              </SelectTrigger>
              <SelectContent>
                {versionHistory
                  .filter((v) => v.version !== sourceVersion)
                  .map((v) => (
                    <SelectItem key={v.version} value={v.version}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{v.version}</span>
                        <span className="text-muted-foreground text-xs">({v.date})</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-6">
            <Button 
              onClick={handleCompare} 
              disabled={!targetVersion}
              className="gradient-primary text-primary-foreground"
            >
              <GitCompare className="w-4 h-4 mr-2" />
              对比差异
            </Button>
          </div>
        </div>

        {/* Diff Panel */}
        {showDiff && (
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Diff Stats */}
            <div className="flex items-center gap-4 py-3 px-4 bg-muted/50 rounded-t-lg border border-b-0">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">
                  {sourceVersion}
                </Badge>
                <span className="text-muted-foreground">→</span>
                <Badge variant="outline" className="font-mono">
                  {targetVersion}
                </Badge>
              </div>
              <div className="flex items-center gap-3 ml-auto text-sm">
                <span className="flex items-center gap-1 text-green-500">
                  <span className="font-medium">+{addedCount}</span>
                  <span className="text-muted-foreground">新增</span>
                </span>
                <span className="flex items-center gap-1 text-red-500">
                  <span className="font-medium">-{removedCount}</span>
                  <span className="text-muted-foreground">删除</span>
                </span>
              </div>
            </div>

            {/* Diff Content */}
            <div className="flex-1 overflow-auto border rounded-b-lg bg-card">
              <div className="font-mono text-sm">
                {mockDiffContent.map((line, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex border-b border-border/50 last:border-b-0",
                      line.type === "added" && "bg-green-500/10",
                      line.type === "removed" && "bg-red-500/10"
                    )}
                  >
                    {/* Line numbers */}
                    <div className="flex shrink-0 select-none">
                      <div className={cn(
                        "w-12 px-2 py-1 text-right text-muted-foreground border-r border-border/50",
                        line.type === "removed" && "bg-red-500/20",
                        line.type === "added" && "bg-green-500/20"
                      )}>
                        {line.lineNumber[0] || ""}
                      </div>
                      <div className={cn(
                        "w-12 px-2 py-1 text-right text-muted-foreground border-r border-border/50",
                        line.type === "removed" && "bg-red-500/20",
                        line.type === "added" && "bg-green-500/20"
                      )}>
                        {line.lineNumber[1] || ""}
                      </div>
                    </div>

                    {/* Change indicator */}
                    <div className={cn(
                      "w-6 flex items-center justify-center shrink-0 border-r border-border/50",
                      line.type === "removed" && "bg-red-500/20 text-red-500",
                      line.type === "added" && "bg-green-500/20 text-green-500"
                    )}>
                      {line.type === "added" && "+"}
                      {line.type === "removed" && "-"}
                    </div>

                    {/* Content */}
                    <div className={cn(
                      "flex-1 px-4 py-1 whitespace-pre-wrap break-all",
                      line.type === "added" && "text-green-700 dark:text-green-400",
                      line.type === "removed" && "text-red-700 dark:text-red-400 line-through"
                    )}>
                      {line.content || " "}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!showDiff && (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center text-muted-foreground">
              <GitCompare className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>选择要对比的版本后点击"对比差异"</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
