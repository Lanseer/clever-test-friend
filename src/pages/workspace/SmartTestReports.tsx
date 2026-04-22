import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileBarChart, Search, Download } from "lucide-react";

interface ReportRow {
  id: string;
  name: string;
  executionName: string;
  totalCases: number;
  passed: number;
  failed: number;
  passRate: string;
  environment: string;
  createdAt: string;
}

const mockReports: ReportRow[] = [
  {
    id: "rpt-1",
    name: "登录功能回归测试报告",
    executionName: "登录功能回归执行 #1024",
    totalCases: 6,
    passed: 5,
    failed: 1,
    passRate: "83.3%",
    environment: "SIT",
    createdAt: "2025-04-20 14:32",
  },
  {
    id: "rpt-2",
    name: "支付流程冒烟测试报告",
    executionName: "支付冒烟执行 #1018",
    totalCases: 12,
    passed: 12,
    failed: 0,
    passRate: "100%",
    environment: "UAT",
    createdAt: "2025-04-19 10:05",
  },
  {
    id: "rpt-3",
    name: "用户管理接口测试报告",
    executionName: "用户管理接口执行 #1015",
    totalCases: 20,
    passed: 17,
    failed: 3,
    passRate: "85.0%",
    environment: "SIT",
    createdAt: "2025-04-18 18:21",
  },
];

export default function SmartTestReports() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileBarChart className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-semibold">
            {t("workspaceMenu.testReport", { defaultValue: "测试报告" })}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="搜索报告名称" className="pl-8 h-9 w-64" />
          </div>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>报告名称</TableHead>
              <TableHead>执行任务</TableHead>
              <TableHead className="text-center">总案例数</TableHead>
              <TableHead className="text-center">通过</TableHead>
              <TableHead className="text-center">失败</TableHead>
              <TableHead className="text-center">通过率</TableHead>
              <TableHead>环境</TableHead>
              <TableHead>生成时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockReports.map((r) => (
              <TableRow key={r.id} className="hover:bg-muted/40">
                <TableCell className="font-medium text-primary cursor-pointer hover:underline">
                  {r.name}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {r.executionName}
                </TableCell>
                <TableCell className="text-center font-mono">
                  {r.totalCases}
                </TableCell>
                <TableCell className="text-center font-mono text-green-600 font-semibold">
                  {r.passed}
                </TableCell>
                <TableCell className="text-center font-mono text-destructive font-semibold">
                  {r.failed}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="secondary"
                    className={
                      r.failed === 0
                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                        : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                    }
                  >
                    {r.passRate}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{r.environment}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {r.createdAt}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    导出
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
