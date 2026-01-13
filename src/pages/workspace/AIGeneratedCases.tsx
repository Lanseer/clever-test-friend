import { useState } from "react";
import { Search, RefreshCw, FileCheck, Clock, User, Loader2, CheckCircle, XCircle, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type GenerationStatus = "generating" | "completed" | "failed";

interface GenerationRecord {
  id: string;
  code: string;
  name: string;
  status: GenerationStatus;
  reviewer: string;
  reviewReport: string | null;
  createdAt: string;
}

const mockRecords: GenerationRecord[] = [
  {
    id: "1",
    code: "AI-001",
    name: "用户模块自动化测试用例",
    status: "completed",
    reviewer: "张三",
    reviewReport: "已通过，共生成 24 个用例",
    createdAt: "2024-01-15 10:30",
  },
  {
    id: "2",
    code: "AI-002",
    name: "支付接口测试用例生成",
    status: "generating",
    reviewer: "李四",
    reviewReport: null,
    createdAt: "2024-01-15 14:20",
  },
  {
    id: "3",
    code: "AI-003",
    name: "订单流程边界测试",
    status: "completed",
    reviewer: "王五",
    reviewReport: "部分通过，需调整 3 个用例",
    createdAt: "2024-01-14 16:45",
  },
  {
    id: "4",
    code: "AI-004",
    name: "商品管理模块测试",
    status: "failed",
    reviewer: "赵六",
    reviewReport: null,
    createdAt: "2024-01-14 09:15",
  },
  {
    id: "5",
    code: "AI-005",
    name: "用户权限测试用例",
    status: "completed",
    reviewer: "张三",
    reviewReport: "已通过，生成 18 个用例",
    createdAt: "2024-01-13 11:00",
  },
];

const statusConfig: Record<GenerationStatus, { label: string; icon: typeof Loader2; className: string }> = {
  generating: {
    label: "生成中",
    icon: Loader2,
    className: "bg-blue-500/10 text-blue-600 border-blue-200",
  },
  completed: {
    label: "已完成",
    icon: CheckCircle,
    className: "bg-green-500/10 text-green-600 border-green-200",
  },
  failed: {
    label: "生成失败",
    icon: XCircle,
    className: "bg-red-500/10 text-red-600 border-red-200",
  },
};

export default function AIGeneratedCases() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRecords = mockRecords.filter(
    (record) =>
      record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI生成用例</h1>
          <p className="text-muted-foreground mt-1">查看和管理AI自动生成的测试用例记录</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索编号或名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
          <div className="col-span-1">编号</div>
          <div className="col-span-3">名称</div>
          <div className="col-span-1">状态</div>
          <div className="col-span-1">评审人</div>
          <div className="col-span-3">评审报告</div>
          <div className="col-span-2">创建时间</div>
          <div className="col-span-1">操作</div>
        </div>

        <div className="divide-y">
          {filteredRecords.map((record, index) => {
            const status = statusConfig[record.status];
            const StatusIcon = status.icon;
            const isCompleted = record.status === "completed";

            return (
              <div
                key={record.id}
                className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-muted/30 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="col-span-1 flex items-center">
                  <Badge variant="outline" className="font-mono text-xs">
                    {record.code}
                  </Badge>
                </div>
                <div className="col-span-3 flex items-center">
                  <span className="font-medium text-foreground truncate">{record.name}</span>
                </div>
                <div className="col-span-1 flex items-center">
                  <Badge variant="outline" className={cn("text-xs gap-1", status.className)}>
                    <StatusIcon className={cn("w-3 h-3", record.status === "generating" && "animate-spin")} />
                    {status.label}
                  </Badge>
                </div>
                <div className="col-span-1 flex items-center gap-1">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm text-foreground truncate">{record.reviewer}</span>
                </div>
                <div className="col-span-3 flex items-center">
                  {record.reviewReport ? (
                    <span className="text-sm text-muted-foreground truncate flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {record.reviewReport}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground/50">-</span>
                  )}
                </div>
                <div className="col-span-2 flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  {record.createdAt}
                </div>
                <div className="col-span-1 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs gap-1"
                    disabled={!isCompleted}
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    评审
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs gap-1"
                    disabled={!isCompleted}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    再次生成
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredRecords.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Search className="w-12 h-12 mb-4 opacity-50" />
            <p>未找到匹配的生成记录</p>
          </div>
        )}
      </div>
    </div>
  );
}
