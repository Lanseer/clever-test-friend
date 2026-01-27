import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronRight, FileText, Users, UserCheck, AlertTriangle, Trash2, Target, TrendingUp, Layers, Search, Plus, RefreshCw, Download, FileDown, ClipboardList, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";
// 问题分类数据
interface IssueCategory {
  name: string;
  count: number;
  color: string;
}

// 丢弃原因数据
interface DiscardReason {
  name: string;
  count: number;
  color: string;
}

// 覆盖率补充数据
interface CoverageSupplement {
  name: string;
  count: number;
  icon: typeof Search;
}

// Mock 自评问题分类数据
const selfReviewIssues: IssueCategory[] = [
  { name: "场景问题", count: 10, color: "#f59e0b" },
  { name: "信息问题", count: 20, color: "#3b82f6" },
  { name: "数据问题", count: 30, color: "#ef4444" },
];

// Mock 专家评审问题分类数据
const expertReviewIssues: IssueCategory[] = [
  { name: "场景问题", count: 8, color: "#f59e0b" },
  { name: "信息问题", count: 15, color: "#3b82f6" },
  { name: "数据问题", count: 12, color: "#ef4444" },
];

// Mock 丢弃原因数据
const discardReasons: DiscardReason[] = [
  { name: "场景重复", count: 20, color: "#94a3b8" },
  { name: "场景与需求不符", count: 10, color: "#f97316" },
  { name: "场景与功能不符", count: 20, color: "#dc2626" },
];

// Mock 覆盖率补充数据
const coverageSupplements: CoverageSupplement[] = [
  { name: "隐藏需求挖掘补充", count: 100, icon: Search },
  { name: "等价类补充", count: 120, icon: Layers },
  { name: "边界值补充", count: 120, icon: Target },
  { name: "流程补充", count: 12, icon: TrendingUp },
  { name: "特殊场景补充", count: 20, icon: Plus },
];

// Mock 案例数据
const mockCases = [
  { id: "TC-001", name: "用户登录-密码错误场景", dimension: "用户登录模块", nature: "负向" },
  { id: "TC-002", name: "订单创建-库存不足场景", dimension: "订单管理模块", nature: "负向" },
  { id: "TC-003", name: "支付超时处理", dimension: "订单管理模块", nature: "负向" },
  { id: "TC-004", name: "商品搜索-关键词为空", dimension: "商品展示模块", nature: "负向" },
  { id: "TC-005", name: "验证码过期场景", dimension: "用户登录模块", nature: "负向" },
];

// 汇总统计 - 案例审查汇总数据
interface CaseReviewStats {
  totalScenarios: number;
  totalCases: number;
  adopted: number;
  needsImprovement: number;
}

// 汇总统计 - 外部评审汇总数据
interface ExternalReviewStats {
  totalScenarios: number;
  totalCases: number;
  passed: number;
  rejected: number;
}

const caseReviewTotal: CaseReviewStats = { 
  totalScenarios: 45, 
  totalCases: 165, 
  adopted: 138, 
  needsImprovement: 27 
};

const externalReviewTotal: ExternalReviewStats = { 
  totalScenarios: 40, 
  totalCases: 138, 
  passed: 120, 
  rejected: 18 
};

// 按生成记录维度的采纳数量趋势数据
const adoptionTrendData = [
  { recordName: "记录1", adopted: 24 },
  { recordName: "记录2", adopted: 32 },
  { recordName: "记录3", adopted: 28 },
  { recordName: "记录4", adopted: 38 },
  { recordName: "记录5", adopted: 16 },
];

// 按发起记录维度的通过数量趋势数据
const passTrendData = [
  { recordName: "评审1", passed: 20 },
  { recordName: "评审2", passed: 28 },
  { recordName: "评审3", passed: 32 },
  { recordName: "评审4", passed: 25 },
  { recordName: "评审5", passed: 15 },
];

// 覆盖率数据
const coverageData = {
  totalCoverage: 80,
  uncoveredCount: 200,
};

// 案例审查汇总卡片组件
function CaseReviewStatsCard({ 
  stats, 
  trendData,
  issues,
  onIssueClick,
  onExportIssues
}: { 
  stats: CaseReviewStats;
  trendData: typeof adoptionTrendData;
  issues: IssueCategory[];
  onIssueClick: (category: string) => void;
  onExportIssues: () => void;
}) {
  const adoptedPercentage = stats.totalCases > 0 ? (stats.adopted / stats.totalCases) * 100 : 0;
  
  const chartConfig = {
    count: { label: "数量" },
    adopted: { label: "采纳数", color: "hsl(var(--chart-1))" },
  };

  return (
    <Card className="flex-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-blue-500" />
          案例审查汇总
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{stats.totalScenarios}</div>
            <div className="text-xs text-muted-foreground">总场景</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{stats.totalCases}</div>
            <div className="text-xs text-muted-foreground">总案例</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.adopted}</div>
            <div className="text-xs text-muted-foreground">采纳</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-500">{stats.needsImprovement}</div>
            <div className="text-xs text-muted-foreground">需完善</div>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>采纳率</span>
            <span>{adoptedPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={adoptedPercentage} className="h-2" />
        </div>

        {/* 采纳数量趋势图 */}
        <div className="pt-3 border-t">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">按生成记录采纳趋势</span>
          </div>
          <div className="h-[100px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="recordName" 
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} 
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Line 
                  type="monotone" 
                  dataKey="adopted" 
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 问题分类汇总 */}
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium">问题分类汇总</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
              onClick={onExportIssues}
            >
              <FileDown className="w-3.5 h-3.5 mr-1" />
              导出问题清单
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <ChartContainer config={chartConfig} className="h-[80px] w-[80px]">
              <PieChart>
                <Pie
                  data={issues}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={20}
                  outerRadius={35}
                >
                  {issues.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="flex-1 space-y-2">
              {issues.map((issue) => (
                <div key={issue.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: issue.color }}
                    />
                    <span className="text-xs text-muted-foreground">{issue.name}</span>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs font-medium"
                    onClick={() => onIssueClick(issue.name)}
                  >
                    {issue.count}条
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 外部评审汇总卡片组件
function ExternalReviewStatsCard({ 
  stats, 
  trendData,
  issues,
  onIssueClick,
  onExportIssues
}: { 
  stats: ExternalReviewStats;
  trendData: typeof passTrendData;
  issues: IssueCategory[];
  onIssueClick: (category: string) => void;
  onExportIssues: () => void;
}) {
  const passPercentage = stats.totalCases > 0 ? (stats.passed / stats.totalCases) * 100 : 0;
  
  const chartConfig = {
    count: { label: "数量" },
    passed: { label: "通过数", color: "hsl(var(--chart-2))" },
  };

  return (
    <Card className="flex-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <ExternalLink className="w-4 h-4 text-purple-500" />
          外部评审汇总
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{stats.totalScenarios}</div>
            <div className="text-xs text-muted-foreground">总场景</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{stats.totalCases}</div>
            <div className="text-xs text-muted-foreground">总案例</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
            <div className="text-xs text-muted-foreground">通过</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">{stats.rejected}</div>
            <div className="text-xs text-muted-foreground">不通过</div>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>通过率</span>
            <span>{passPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={passPercentage} className="h-2" />
        </div>

        {/* 通过数量趋势图 */}
        <div className="pt-3 border-t">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium">按发起记录通过趋势</span>
          </div>
          <div className="h-[100px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="recordName" 
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} 
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Line 
                  type="monotone" 
                  dataKey="passed" 
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 问题分类汇总 */}
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium">问题分类汇总</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
              onClick={onExportIssues}
            >
              <FileDown className="w-3.5 h-3.5 mr-1" />
              导出问题清单
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <ChartContainer config={chartConfig} className="h-[80px] w-[80px]">
              <PieChart>
                <Pie
                  data={issues}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={20}
                  outerRadius={35}
                >
                  {issues.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="flex-1 space-y-2">
              {issues.map((issue) => (
                <div key={issue.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: issue.color }}
                    />
                    <span className="text-xs text-muted-foreground">{issue.name}</span>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs font-medium"
                    onClick={() => onIssueClick(issue.name)}
                  >
                    {issue.count}条
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 丢弃情况卡片
function DiscardCard({ 
  reasons, 
  onReasonClick 
}: { 
  reasons: DiscardReason[];
  onReasonClick: (reason: string) => void;
}) {
  const totalDiscarded = reasons.reduce((sum, r) => sum + r.count, 0);
  
  const chartConfig = {
    count: { label: "数量" },
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-red-500" />
          丢弃情况汇总
          <Badge variant="secondary" className="ml-auto">{totalDiscarded}条</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <ChartContainer config={chartConfig} className="h-[120px] w-[160px]">
            <BarChart data={reasons} layout="vertical">
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={90}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {reasons.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
          <div className="flex-1 space-y-3">
            {reasons.map((reason) => (
              <div key={reason.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded" 
                    style={{ backgroundColor: reason.color }}
                  />
                  <span className="text-sm">{reason.name}</span>
                </div>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 font-medium"
                  onClick={() => onReasonClick(reason.name)}
                >
                  {reason.count}条
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 覆盖率卡片
function CoverageCard({ supplements }: { supplements: CoverageSupplement[] }) {
  const totalSupplement = supplements.reduce((sum, s) => sum + s.count, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Target className="w-4 h-4 text-green-500" />
          覆盖率情况
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 覆盖率概要 */}
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${coverageData.totalCoverage * 2.51} 251`}
                className="text-green-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold">{coverageData.totalCoverage}%</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">总覆盖率</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {coverageData.totalCoverage}%
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">未覆盖</span>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                {coverageData.uncoveredCount}条
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">补充用例</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {totalSupplement}条
              </Badge>
            </div>
          </div>
        </div>

        {/* 补充用例分类 */}
        <div className="pt-3 border-t">
          <div className="flex items-center gap-2 mb-3">
            <Plus className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">补充用例分类</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {supplements.map((item) => {
              const Icon = item.icon;
              return (
                <div 
                  key={item.name}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground truncate">{item.name}</div>
                    <div className="text-sm font-medium">{item.count}条</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 案例列表弹窗
function CaseListDialog({ 
  open, 
  onOpenChange, 
  title, 
  cases 
}: { 
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  cases: typeof mockCases;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {title}
            <Badge variant="secondary" className="ml-2">{cases.length}条</Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">用例编号</TableHead>
                <TableHead>用例名称</TableHead>
                <TableHead className="w-[120px]">所属维度</TableHead>
                <TableHead className="w-[80px]">性质</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.map((caseItem) => (
                <TableRow key={caseItem.id}>
                  <TableCell className="font-mono text-xs">{caseItem.id}</TableCell>
                  <TableCell className="font-medium">{caseItem.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{caseItem.dimension}</TableCell>
                  <TableCell>
                    <Badge variant={caseItem.nature === "正向" ? "default" : "secondary"}>
                      {caseItem.nature}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function TestReport() {
  const navigate = useNavigate();
  const { workspaceId } = useParams();
  const [caseDialogOpen, setCaseDialogOpen] = useState(false);
  const [caseDialogTitle, setCaseDialogTitle] = useState("");

  const handleIssueClick = (category: string) => {
    setCaseDialogTitle(`${category}相关用例`);
    setCaseDialogOpen(true);
  };

  const handleDiscardClick = (reason: string) => {
    setCaseDialogTitle(`${reason}用例`);
    setCaseDialogOpen(true);
  };

  const handleUpdateReport = () => {
    toast.success("报告数据已更新");
  };

  const handleDownloadReport = () => {
    toast.success("报告下载已开始");
  };

  const handleExportSelfReviewIssues = () => {
    toast.success("自评问题清单导出已开始");
  };

  const handleExportExpertReviewIssues = () => {
    toast.success("专家评审问题清单导出已开始");
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* 页面标题 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <button 
            onClick={() => navigate(`/workspace/${workspaceId}/management/ai-cases`)}
            className="hover:text-foreground transition-colors"
          >
            智能用例设计
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">评审报告</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              评审报告
              <span className="text-sm font-normal text-muted-foreground ml-2">
                更新于 2024-01-15 14:30
              </span>
            </h1>
            <p className="text-muted-foreground mt-1">
              用例评审数据分析与覆盖率汇总
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleUpdateReport}>
              <RefreshCw className="w-4 h-4 mr-1.5" />
              更新报告
            </Button>
            <Button size="sm" onClick={handleDownloadReport}>
              <Download className="w-4 h-4 mr-1.5" />
              下载报告
            </Button>
          </div>
        </div>
      </div>

      {/* 评审汇总卡片 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <CaseReviewStatsCard 
          stats={caseReviewTotal} 
          trendData={adoptionTrendData}
          issues={selfReviewIssues}
          onIssueClick={handleIssueClick}
          onExportIssues={handleExportSelfReviewIssues}
        />
        <ExternalReviewStatsCard 
          stats={externalReviewTotal} 
          trendData={passTrendData}
          issues={expertReviewIssues}
          onIssueClick={handleIssueClick}
          onExportIssues={handleExportExpertReviewIssues}
        />
      </div>

      {/* 丢弃情况和覆盖率 */}
      <div className="grid grid-cols-2 gap-4">
        <DiscardCard 
          reasons={discardReasons} 
          onReasonClick={handleDiscardClick}
        />
        <CoverageCard supplements={coverageSupplements} />
      </div>

      {/* 案例列表弹窗 */}
      <CaseListDialog
        open={caseDialogOpen}
        onOpenChange={setCaseDialogOpen}
        title={caseDialogTitle}
        cases={mockCases}
      />
    </div>
  );
}
