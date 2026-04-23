import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, PlayCircle } from "lucide-react";
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

interface ExecutionCaseRow {
  id: string;
  name: string;
  testData: string;
  nature: "positive" | "negative";
  status: "pending" | "running" | "completed" | "failed";
  testStatus: "passed" | "failed" | "pending";
  environment: string;
  startTime: string;
  endTime: string;
}

const mockCases: ExecutionCaseRow[] = [
  {
    id: "live-tp-1",
    name: "TC-001",
    testData: "user01@test.com / Pass@123",
    nature: "positive",
    status: "completed",
    testStatus: "passed",
    environment: "SIT-01",
    startTime: "2026-02-10 09:30",
    endTime: "2026-02-10 09:38",
  },
  {
    id: "live-tp-2",
    name: "TC-002",
    testData: "user01@test.com / WrongPass",
    nature: "negative",
    status: "completed",
    testStatus: "passed",
    environment: "SIT-01",
    startTime: "2026-02-10 09:38",
    endTime: "2026-02-10 09:45",
  },
  {
    id: "live-tp-3",
    name: "TC-003",
    testData: "invalid-email / Pass@123",
    nature: "negative",
    status: "completed",
    testStatus: "passed",
    environment: "SIT-01",
    startTime: "2026-02-10 09:45",
    endTime: "2026-02-10 09:52",
  },
  {
    id: "live-tp-4",
    name: "TC-004",
    testData: "user01@test.com / (空)",
    nature: "negative",
    status: "running",
    testStatus: "pending",
    environment: "SIT-01",
    startTime: "2026-02-10 09:52",
    endTime: "-",
  },
  {
    id: "live-tp-5",
    name: "TC-005",
    testData: "user01@test.com / Pass@123",
    nature: "positive",
    status: "pending",
    testStatus: "pending",
    environment: "SIT-01",
    startTime: "-",
    endTime: "-",
  },
  {
    id: "live-tp-6",
    name: "TC-006",
    testData: "user01@test.com / x5次",
    nature: "negative",
    status: "pending",
    testStatus: "pending",
    environment: "SIT-01",
    startTime: "-",
    endTime: "-",
  },
];

const natureConfig: Record<ExecutionCaseRow["nature"], { label: string; className: string }> = {
  positive: { label: "正例", className: "bg-green-100 text-green-700 border-green-200" },
  negative: { label: "反例", className: "bg-amber-100 text-amber-700 border-amber-200" },
};

const statusConfig: Record<ExecutionCaseRow["status"], { label: string; className: string }> = {
  pending: { label: "待执行", className: "bg-muted text-muted-foreground border-border" },
  running: { label: "执行中", className: "bg-blue-100 text-blue-700 border-blue-200" },
  completed: { label: "已完成", className: "bg-green-100 text-green-700 border-green-200" },
  failed: { label: "执行失败", className: "bg-red-100 text-red-700 border-red-200" },
};

const testStatusConfig: Record<ExecutionCaseRow["testStatus"], { label: string; className: string }> = {
  passed: { label: "通过", className: "bg-green-100 text-green-700 border-green-200" },
  failed: { label: "未通过", className: "bg-red-100 text-red-700 border-red-200" },
  pending: { label: "待测试", className: "bg-muted text-muted-foreground border-border" },
};

export default function SmartExecutionCases() {
  const navigate = useNavigate();
  const { workspaceId, executionId } = useParams();
  const [cases] = useState<ExecutionCaseRow[]>(mockCases);

  const handleOpenCase = (caseId: string) => {
    navigate(`/workspace/${workspaceId}/smart-execution/${executionId}/case/${caseId}?live=1`);
  };

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="p-4 border-b bg-background/80 backdrop-blur-sm flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1">
          <ArrowLeft className="w-4 h-4" />
          返回
        </Button>
        <div className="flex items-center gap-2">
          <PlayCircle className="w-5 h-5 text-primary" />
          <div>
            <h1 className="text-xl font-semibold">执行案例</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              共 {cases.length} 个案例
            </p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto p-4">
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="min-w-[140px]">案例编号</TableHead>
                <TableHead className="min-w-[200px]">测试数据</TableHead>
                <TableHead>案例性质</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>测试状态</TableHead>
                <TableHead>环境</TableHead>
                <TableHead>开始时间</TableHead>
                <TableHead>结束时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    暂无案例
                  </TableCell>
                </TableRow>
              ) : (
                cases.map((c) => {
                  const nature = natureConfig[c.nature];
                  const status = statusConfig[c.status];
                  const testStatus = testStatusConfig[c.testStatus];
                  return (
                    <TableRow key={c.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono font-medium">
                        <button
                          onClick={() => handleOpenCase(c.id)}
                          className="text-primary hover:underline text-left"
                        >
                          {c.name}
                        </button>
                      </TableCell>
                      <TableCell className="text-sm font-mono text-muted-foreground">
                        {c.testData}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("font-normal", nature.className)}>
                          {nature.label}
                        </Badge>
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
                      <TableCell className="text-sm text-muted-foreground">{c.environment}</TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {c.startTime}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {c.endTime}
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
