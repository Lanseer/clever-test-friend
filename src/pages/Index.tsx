import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Play, XCircle, CheckCircle } from "lucide-react";
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
    title: "总用例数",
    value: "1,234",
    icon: ClipboardList,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "总运行测试次数",
    value: "5,678",
    icon: Play,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: "最近一周失败用例数",
    value: "23",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    title: "最近一周通过用例数",
    value: "456",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
];

// 用例增加趋势数据
const weekTrendData = [
  { date: "周一", count: 12 },
  { date: "周二", count: 19 },
  { date: "周三", count: 8 },
  { date: "周四", count: 25 },
  { date: "周五", count: 15 },
  { date: "周六", count: 5 },
  { date: "周日", count: 10 },
];

const monthTrendData = [
  { date: "第1周", count: 45 },
  { date: "第2周", count: 62 },
  { date: "第3周", count: 78 },
  { date: "第4周", count: 95 },
];

// 运行结果分布数据
const weekResultData = [
  { name: "通过", value: 456, color: "#22c55e" },
  { name: "失败", value: 23, color: "#ef4444" },
  { name: "错误", value: 8, color: "#f59e0b" },
];

const monthResultData = [
  { name: "通过", value: 1820, color: "#22c55e" },
  { name: "失败", value: 92, color: "#ef4444" },
  { name: "错误", value: 35, color: "#f59e0b" },
];

// AI生成用例质量分布数据
const weekQualityData = [
  { name: "采纳", value: 68, color: "#22c55e" },
  { name: "不采纳", value: 24, color: "#f59e0b" },
  { name: "丢弃", value: 8, color: "#ef4444" },
];

const monthQualityData = [
  { name: "采纳", value: 256, color: "#22c55e" },
  { name: "不采纳", value: 89, color: "#f59e0b" },
  { name: "丢弃", value: 32, color: "#ef4444" },
];

const lineChartConfig = {
  count: {
    label: "用例数",
    color: "hsl(var(--primary))",
  },
};

const Index = () => {
  const [trendPeriod, setTrendPeriod] = useState<"week" | "month">("week");
  const [resultPeriod, setResultPeriod] = useState<"week" | "month">("week");
  const [qualityPeriod, setQualityPeriod] = useState<"week" | "month">("week");

  const trendData = trendPeriod === "week" ? weekTrendData : monthTrendData;
  const resultData = resultPeriod === "week" ? weekResultData : monthResultData;
  const qualityData = qualityPeriod === "week" ? weekQualityData : monthQualityData;
  const totalResults = resultData.reduce((sum, item) => sum + item.value, 0);
  const totalQuality = qualityData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">数据看板</h1>
        <p className="text-muted-foreground text-sm mt-1">测试数据统计与可视化分析</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat) => (
          <Card key={stat.title} className="border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 图表区域 - 第一行 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 用例增加趋势 - 折线图 */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">用例增加趋势</CardTitle>
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

        {/* 运行结果分布 - 环形图 */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">运行结果分布</CardTitle>
              <Select
                value={resultPeriod}
                onValueChange={(value: "week" | "month") => setResultPeriod(value)}
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
            <div className="h-[280px] w-full flex items-center">
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={resultData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {resultData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
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
                {resultData.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="text-sm">
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-medium ml-2">{item.value}</span>
                      <span className="text-muted-foreground ml-1">
                        ({((item.value / totalResults) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 图表区域 - 第二行 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI生成用例质量分布 - 环形图 */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">AI生成用例质量分布</CardTitle>
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
      </div>
    </div>
  );
};

export default Index;
