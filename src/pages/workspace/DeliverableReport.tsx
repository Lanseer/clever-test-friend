import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft, ClipboardList, AlertTriangle, FileDown, Target, Plus, Search, Layers, TrendingUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

interface IssueCategory {
  name: string;
  count: number;
  color: string;
}

interface DiscardReason {
  name: string;
  count: number;
  color: string;
}

interface CoverageSupplement {
  name: string;
  count: number;
  icon: typeof Search;
}

// Mock data
const selfReviewIssues: IssueCategory[] = [
  { name: "场景问题", count: 10, color: "#f59e0b" },
  { name: "信息问题", count: 20, color: "#3b82f6" },
  { name: "数据问题", count: 30, color: "#ef4444" },
];

const discardReasons: DiscardReason[] = [
  { name: "场景重复", count: 20, color: "#94a3b8" },
  { name: "场景与需求不符", count: 10, color: "#f97316" },
  { name: "场景与功能不符", count: 20, color: "#dc2626" },
];

const coverageSupplements: CoverageSupplement[] = [
  { name: "隐藏需求挖掘补充", count: 100, icon: Search },
  { name: "等价类补充", count: 120, icon: Layers },
  { name: "边界值补充", count: 120, icon: Target },
  { name: "流程补充", count: 12, icon: TrendingUp },
  { name: "特殊场景补充", count: 20, icon: Plus },
];

const coverageData = {
  totalCoverage: 80,
  uncoveredCount: 200,
};

export default function DeliverableReport() {
  const navigate = useNavigate();
  const { workspaceId, recordId } = useParams();
  const [searchParams] = useSearchParams();
  const deliverableName = searchParams.get("name") || "交付物";

  const stats = { totalScenarios: 45, totalCases: 165, adopted: 138, needsImprovement: 27 };
  const adoptedPercentage = stats.totalCases > 0 ? (stats.adopted / stats.totalCases) * 100 : 0;
  const totalDiscarded = discardReasons.reduce((sum, r) => sum + r.count, 0);
  const totalSupplement = coverageSupplements.reduce((sum, s) => sum + s.count, 0);

  const chartConfig = {
    count: { label: "数量" },
  };

  const handleExportIssues = () => {
    toast.success("问题清单导出成功");
  };

  const handleIssueClick = (category: string) => {
    // 映射问题分类到分类下拉框的值
    const categoryMap: Record<string, string> = {
      "场景问题": "完善场景",
      "信息问题": "完善信息",
      "数据问题": "完善数据",
    };
    const filterValue = categoryMap[category] || category;
    navigate(`/workspace/${workspaceId}/management/ai-cases/${recordId}/case-review?filterCategory=${encodeURIComponent(filterValue)}`);
  };

  const handleReasonClick = (reason: string) => {
    // 映射丢弃原因到分类下拉框的值
    const reasonMap: Record<string, string> = {
      "场景重复": "重复",
      "场景与需求不符": "非本功能",
      "场景与功能不符": "非本功能",
    };
    const filterValue = reasonMap[reason] || reason;
    navigate(`/workspace/${workspaceId}/management/ai-cases/${recordId}/case-review?filterResult=needsDiscard&filterCategory=${encodeURIComponent(filterValue)}`);
  };

  const handleDownload = () => {
    toast.success("报告下载已开始");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-semibold">{deliverableName} - 审查报告</h1>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />
          下载报告
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Case Review Summary Card */}
        <Card>
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

            {/* Issue Classification Summary */}
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
                  onClick={handleExportIssues}
                >
                  <FileDown className="w-3.5 h-3.5 mr-1" />
                  导出问题清单
                </Button>
              </div>
              <div className="flex items-center gap-4">
                <ChartContainer config={chartConfig} className="h-[80px] w-[80px]">
                  <PieChart>
                    <Pie
                      data={selfReviewIssues}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={35}
                    >
                      {selfReviewIssues.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
                <div className="flex-1 space-y-2">
                  {selfReviewIssues.map((issue) => (
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
                        onClick={() => handleIssueClick(issue.name)}
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

        {/* Coverage Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-green-500" />
              覆盖率情况
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Coverage Overview */}
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
                  <span className="text-sm text-muted-foreground">补充案例</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {totalSupplement}条
                  </Badge>
                </div>
              </div>
            </div>

            {/* Supplement Categories */}
            <div className="pt-3 border-t">
              <div className="flex items-center gap-2 mb-3">
                <Plus className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">补充案例分类</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {coverageSupplements.map((item) => {
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

        {/* Discard Summary Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              丢弃情况汇总
              <Badge variant="secondary" className="ml-auto">{totalDiscarded}条</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <ChartContainer config={chartConfig} className="h-[120px] w-[200px]">
                <BarChart data={discardReasons} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={100}
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {discardReasons.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
              <div className="flex-1 space-y-3">
                {discardReasons.map((reason) => (
                  <div key={reason.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: reason.color }}
                      />
                      <span className="text-xs text-muted-foreground">{reason.name}</span>
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs font-medium"
                      onClick={() => handleReasonClick(reason.name)}
                    >
                      {reason.count}条
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
