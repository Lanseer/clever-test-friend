import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, AlertTriangle, CheckCircle, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// 统计卡片数据
const statsData = [
  {
    title: "智能生成总用例数",
    value: "1,234",
    icon: ClipboardList,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "问题用例数",
    value: "156",
    icon: AlertTriangle,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    title: "自评采纳数/采纳率",
    value: "892 / 72.3%",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "专家通过数/通过率",
    value: "756 / 84.8%",
    icon: Users,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
];

// 智能设计增加趋势数据（生成次数）
const weekTrendData = [
  { date: "周一", count: 5 },
  { date: "周二", count: 8 },
  { date: "周三", count: 3 },
  { date: "周四", count: 12 },
  { date: "周五", count: 7 },
  { date: "周六", count: 2 },
  { date: "周日", count: 4 },
];

const monthTrendData = [
  { date: "第1周", count: 18 },
  { date: "第2周", count: 25 },
  { date: "第3周", count: 32 },
  { date: "第4周", count: 28 },
];

// 用例增加趋势数据（用例数量）
const caseWeekTrendData = [
  { date: "周一", count: 45 },
  { date: "周二", count: 72 },
  { date: "周三", count: 28 },
  { date: "周四", count: 96 },
  { date: "周五", count: 63 },
  { date: "周六", count: 18 },
  { date: "周日", count: 35 },
];

const caseMonthTrendData = [
  { date: "第1周", count: 156 },
  { date: "第2周", count: 225 },
  { date: "第3周", count: 298 },
  { date: "第4周", count: 245 },
];

// 自评用例质量分布数据
const selfWeekQualityData = [
  { name: "采纳", value: 68, color: "#22c55e" },
  { name: "不采纳", value: 24, color: "#f59e0b" },
  { name: "丢弃", value: 8, color: "#ef4444" },
];

const selfMonthQualityData = [
  { name: "采纳", value: 256, color: "#22c55e" },
  { name: "不采纳", value: 89, color: "#f59e0b" },
  { name: "丢弃", value: 32, color: "#ef4444" },
];

// 专家用例质量分布数据
const expertWeekQualityData = [
  { name: "通过", value: 72, color: "#22c55e" },
  { name: "不通过", value: 18, color: "#f59e0b" },
  { name: "待评审", value: 10, color: "#94a3b8" },
];

const expertMonthQualityData = [
  { name: "通过", value: 280, color: "#22c55e" },
  { name: "不通过", value: 65, color: "#f59e0b" },
  { name: "待评审", value: 32, color: "#94a3b8" },
];

// 自评问题分类统计数据
const selfWeekIssueData = [
  { category: "场景描述错误", count: 86, color: "#ef4444", description: "用例场景与实际业务不符" },
  { category: "格式不规范", count: 45, color: "#f59e0b", description: "用例格式不符合标准模板" },
  { category: "步骤不完整", count: 38, color: "#3b82f6", description: "测试步骤缺失或不完整" },
  { category: "预期结果错误", count: 32, color: "#8b5cf6", description: "预期结果与实际预期不符" },
];

const selfMonthIssueData = [
  { category: "场景描述错误", count: 300, color: "#ef4444", description: "用例场景与实际业务不符" },
  { category: "格式不规范", count: 156, color: "#f59e0b", description: "用例格式不符合标准模板" },
  { category: "步骤不完整", count: 128, color: "#3b82f6", description: "测试步骤缺失或不完整" },
  { category: "预期结果错误", count: 98, color: "#8b5cf6", description: "预期结果与实际预期不符" },
];

// 专家问题分类统计数据
const expertWeekIssueData = [
  { category: "业务理解偏差", count: 52, color: "#ef4444", description: "对业务需求理解有误" },
  { category: "覆盖度不足", count: 38, color: "#f59e0b", description: "测试覆盖范围不够全面" },
  { category: "边界条件缺失", count: 28, color: "#3b82f6", description: "未考虑边界条件测试" },
  { category: "数据设计不当", count: 22, color: "#8b5cf6", description: "测试数据设计不合理" },
];

const expertMonthIssueData = [
  { category: "业务理解偏差", count: 180, color: "#ef4444", description: "对业务需求理解有误" },
  { category: "覆盖度不足", count: 132, color: "#f59e0b", description: "测试覆盖范围不够全面" },
  { category: "边界条件缺失", count: 95, color: "#3b82f6", description: "未考虑边界条件测试" },
  { category: "数据设计不当", count: 78, color: "#8b5cf6", description: "测试数据设计不合理" },
];

const lineChartConfig = {
  count: {
    label: "生成次数",
    color: "hsl(var(--primary))",
  },
};

const Index = () => {
  const [trendPeriod, setTrendPeriod] = useState<"week" | "month">("week");
  const [caseTrendPeriod, setCaseTrendPeriod] = useState<"week" | "month">("week");
  const [qualityPeriod, setQualityPeriod] = useState<"week" | "month">("week");
  const [qualityType, setQualityType] = useState<"self" | "expert">("self");
  const [issuePeriod, setIssuePeriod] = useState<"week" | "month">("week");
  const [issueType, setIssueType] = useState<"self" | "expert">("self");

  const trendData = trendPeriod === "week" ? weekTrendData : monthTrendData;
  const caseTrendData = caseTrendPeriod === "week" ? caseWeekTrendData : caseMonthTrendData;
  
  // 根据类型和时间段选择质量分布数据
  const getQualityData = () => {
    if (qualityType === "self") {
      return qualityPeriod === "week" ? selfWeekQualityData : selfMonthQualityData;
    }
    return qualityPeriod === "week" ? expertWeekQualityData : expertMonthQualityData;
  };
  
  // 根据类型和时间段选择问题分类数据
  const getIssueData = () => {
    if (issueType === "self") {
      return issuePeriod === "week" ? selfWeekIssueData : selfMonthIssueData;
    }
    return issuePeriod === "week" ? expertWeekIssueData : expertMonthIssueData;
  };

  const qualityData = getQualityData();
  const issueData = getIssueData();
  const totalQuality = qualityData.reduce((sum, item) => sum + item.value, 0);
  const totalIssues = issueData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">数据看板</h1>
        <p className="text-muted-foreground text-sm mt-1">测试数据统计与可视化分析</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <Card 
            key={stat.title} 
            className="border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group"
          >
            <CardContent className="p-0">
              <div className="relative">
                {/* 渐变背景条 */}
                <div 
                  className={cn(
                    "absolute top-0 left-0 right-0 h-1",
                    index === 0 && "bg-gradient-to-r from-blue-500 to-blue-400",
                    index === 1 && "bg-gradient-to-r from-amber-500 to-amber-400",
                    index === 2 && "bg-gradient-to-r from-green-500 to-green-400",
                    index === 3 && "bg-gradient-to-r from-purple-500 to-purple-400"
                  )}
                />
                <div className="p-5 pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                    </div>
                    <div className={cn(
                      "p-3 rounded-xl transition-transform duration-300 group-hover:scale-110",
                      stat.bgColor
                    )}>
                      <stat.icon className={cn("w-6 h-6", stat.color)} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 图表区域 - 第一行 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 智能设计增加趋势 - 折线图 */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">智能设计增加趋势</CardTitle>
              <Select
                value={trendPeriod}
                onValueChange={(value: "week" | "month") => setTrendPeriod(value)}
              >
                <SelectTrigger className="w-32 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">过去一周</SelectItem>
                  <SelectItem value="month">过去一个月</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={lineChartConfig} className="h-[280px] w-full">
              <LineChart data={trendData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* 用例增加趋势 - 折线图 */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">用例增加趋势</CardTitle>
              <Select
                value={caseTrendPeriod}
                onValueChange={(value: "week" | "month") => setCaseTrendPeriod(value)}
              >
                <SelectTrigger className="w-32 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">过去一周</SelectItem>
                  <SelectItem value="month">过去一个月</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={lineChartConfig} className="h-[280px] w-full">
              <LineChart data={caseTrendData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* 图表区域 - 第二行 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 用例质量分布 - 环形图 */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">用例质量分布</CardTitle>
              <div className="flex items-center gap-2">
                {/* 自评/专家切换 */}
                <div className="flex items-center bg-muted rounded-lg p-0.5">
                  <button
                    onClick={() => setQualityType("self")}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md transition-all",
                      qualityType === "self"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    自评
                  </button>
                  <button
                    onClick={() => setQualityType("expert")}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md transition-all",
                      qualityType === "expert"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    专家
                  </button>
                </div>
                <Select
                  value={qualityPeriod}
                  onValueChange={(value: "week" | "month") => setQualityPeriod(value)}
                >
                  <SelectTrigger className="w-32 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">过去一周</SelectItem>
                    <SelectItem value="month">过去一个月</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full flex items-center">
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={qualityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {qualityData.map((entry, index) => (
                        <Cell key={`quality-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-popover border rounded-lg shadow-md p-2 text-sm">
                              <p className="font-medium">{data.name}</p>
                              <p className="text-muted-foreground">{data.value} 个</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* 图例 */}
              <div className="space-y-3 pr-4">
                {qualityData.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="text-sm">
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-medium ml-2">{item.value}</span>
                      <span className="text-muted-foreground ml-1">
                        ({((item.value / totalQuality) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 用例问题分类统计 */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <CardTitle className="text-base font-semibold">用例问题分类</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {/* 自评/专家切换 */}
                <div className="flex items-center bg-muted rounded-lg p-0.5">
                  <button
                    onClick={() => setIssueType("self")}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md transition-all",
                      issueType === "self"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    自评
                  </button>
                  <button
                    onClick={() => setIssueType("expert")}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md transition-all",
                      issueType === "expert"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    专家
                  </button>
                </div>
                <Select
                  value={issuePeriod}
                  onValueChange={(value: "week" | "month") => setIssuePeriod(value)}
                >
                  <SelectTrigger className="w-32 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">过去一周</SelectItem>
                    <SelectItem value="month">过去一个月</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              基于{issueType === "self" ? "自评不采纳" : "专家不通过"}反馈的问题归类统计，共 {totalIssues} 条问题
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {issueData.map((item) => {
                const percentage = (item.count / totalIssues) * 100;
                return (
                  <div key={item.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-medium">{item.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{item.count} 条</span>
                        <span className="text-xs text-muted-foreground">
                          ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <Progress 
                      value={percentage} 
                      className="h-2"
                      style={{ 
                        '--progress-color': item.color 
                      } as React.CSSProperties}
                    />
                    <p className="text-xs text-muted-foreground pl-5">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
