import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ExecutionRecord {
  id: string;
  name: string;
  status: "draft" | "running" | "completed" | "failed";
  testStatus: "passed" | "failed" | "partial" | "pending";
  completedCases: number;
  totalCases: number;
  tags: string[];
  environment: string;
  creator: string;
  startTime: string;
  endTime: string;
}

const mockExecutions: ExecutionRecord[] = [
  {
    id: "e1",
    name: "用户登录回归执行",
    status: "completed",
    testStatus: "passed",
    completedCases: 12,
    totalCases: 12,
    tags: ["登录", "回归"],
    environment: "SIT-01",
    creator: "张三",
    startTime: "2026-02-10 09:30",
    endTime: "2026-02-10 10:15",
  },
  {
    id: "e2",
    name: "支付流程冒烟测试",
    status: "running",
    testStatus: "pending",
    completedCases: 3,
    totalCases: 6,
    tags: ["支付", "冒烟"],
    environment: "UAT-02",
    creator: "李四",
    startTime: "2026-02-10 11:00",
    endTime: "-",
  },
  {
    id: "e3",
    name: "订单管理集成验证",
    status: "completed",
    testStatus: "partial",
    completedCases: 8,
    totalCases: 10,
    tags: ["订单", "集成"],
    environment: "SIT-02",
    creator: "王五",
    startTime: "2026-02-09 14:20",
    endTime: "2026-02-09 16:45",
  },
  {
    id: "e4",
    name: "商品搜索性能测试",
    status: "failed",
    testStatus: "failed",
    completedCases: 5,
    totalCases: 8,
    tags: ["搜索", "性能"],
    environment: "PERF-01",
    creator: "赵六",
    startTime: "2026-02-08 10:00",
    endTime: "2026-02-08 11:30",
  },
  {
    id: "e5",
    name: "购物车功能验证",
    status: "draft",
    testStatus: "pending",
    completedCases: 0,
    totalCases: 4,
    tags: ["购物车"],
    environment: "SIT-01",
    creator: "孙七",
    startTime: "-",
    endTime: "-",
  },
];

const statusConfig: Record<ExecutionRecord["status"], { label: string; className: string }> = {
  draft: { label: "草稿", className: "bg-muted text-muted-foreground border-border" },
  running: { label: "执行中", className: "bg-blue-100 text-blue-700 border-blue-200" },
  completed: { label: "已完成", className: "bg-green-100 text-green-700 border-green-200" },
  failed: { label: "执行失败", className: "bg-red-100 text-red-700 border-red-200" },
};

const testStatusConfig: Record<ExecutionRecord["testStatus"], { label: string; className: string }> = {
  passed: { label: "通过", className: "bg-green-100 text-green-700 border-green-200" },
  failed: { label: "未通过", className: "bg-red-100 text-red-700 border-red-200" },
  partial: { label: "部分通过", className: "bg-amber-100 text-amber-700 border-amber-200" },
  pending: { label: "待测试", className: "bg-muted text-muted-foreground border-border" },
};

export default function SmartExecution() {
  const navigate = useNavigate();
  const { workspaceId } = useParams();
  const [executions] = useState<ExecutionRecord[]>(mockExecutions);

  const handleCreate = () => {
    toast.info("新增执行");
  };

  const handleOpenDetail = (id: string) => {
    navigate(`/workspace/${workspaceId}/smart-execution/${id}`);
  };

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="p-4 border-b bg-background/80 backdrop-blur-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PlayCircle className="w-5 h-5 text-primary" />
          <div>
            <h1 className="text-xl font-semibold">智能执行</h1>
            <p className="text-sm text-muted-foreground mt-0.5">管理并查看测试执行记录</p>
          </div>
        </div>
        <Button onClick={handleCreate} className="gap-1.5">
          <Plus className="w-4 h-4" />
          新增执行
        </Button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto p-4">
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="min-w-[180px]">名称</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>测试状态</TableHead>
                <TableHead>执行案例</TableHead>
                <TableHead>标签</TableHead>
                <TableHead>环境</TableHead>
                <TableHead>创建人</TableHead>
                <TableHead>开始时间</TableHead>
                <TableHead>完成时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {executions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                    暂无执行记录
                  </TableCell>
                </TableRow>
              ) : (
                executions.map((exec) => {
                  const status = statusConfig[exec.status];
                  const testStatus = testStatusConfig[exec.testStatus];
                  return (
                    <TableRow key={exec.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">
                        <button
                          onClick={() => handleOpenDetail(exec.id)}
                          className="text-primary hover:underline text-left"
                        >
                          {exec.name}
                        </button>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("font-normal", status.className)}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("font-normal", testStatus.className)}>
                          {testStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className="font-mono text-sm">
                          <span className="text-green-600 font-semibold">{exec.completedCases}</span>
                          <span className="text-muted-foreground">/{exec.totalCases}</span>
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {exec.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 h-5 bg-primary/5 text-primary border-primary/20"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{exec.environment}</TableCell>
                      <TableCell className="text-sm">{exec.creator}</TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {exec.startTime}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {exec.endTime}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
