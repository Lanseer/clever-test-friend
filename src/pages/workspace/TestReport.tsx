import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronRight, ChevronDown, FileText, CheckCircle, XCircle, Clock, Users, UserCheck, Layers, Target, TestTube } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// 统计数据接口
interface ReviewStats {
  total: number;
  adopted: number;
  rejected: number;
  pending: number;
}

// 用例接口
interface TestCase {
  id: string;
  name: string;
  selfReviewStatus: "adopted" | "rejected" | "pending";
  expertReviewStatus: "adopted" | "rejected" | "pending";
}

// 测试点接口
interface TestPoint {
  id: string;
  name: string;
  cases: TestCase[];
  selfReviewStats: ReviewStats;
  expertReviewStats: ReviewStats;
}

// 测试维度接口
interface TestDimension {
  id: string;
  name: string;
  description: string;
  testPoints: TestPoint[];
  selfReviewStats: ReviewStats;
  expertReviewStats: ReviewStats;
}

// Mock数据
const mockDimensions: TestDimension[] = [
  {
    id: "dim-1",
    name: "用户登录模块",
    description: "覆盖用户登录相关的所有功能测试",
    selfReviewStats: { total: 45, adopted: 38, rejected: 4, pending: 3 },
    expertReviewStats: { total: 38, adopted: 32, rejected: 3, pending: 3 },
    testPoints: [
      {
        id: "tp-1-1",
        name: "账号密码登录",
        selfReviewStats: { total: 15, adopted: 13, rejected: 1, pending: 1 },
        expertReviewStats: { total: 13, adopted: 11, rejected: 1, pending: 1 },
        cases: [
          { id: "case-1-1-1", name: "正确账号密码登录成功", selfReviewStatus: "adopted", expertReviewStatus: "adopted" },
          { id: "case-1-1-2", name: "账号为空时登录失败", selfReviewStatus: "adopted", expertReviewStatus: "adopted" },
          { id: "case-1-1-3", name: "密码为空时登录失败", selfReviewStatus: "adopted", expertReviewStatus: "pending" },
          { id: "case-1-1-4", name: "账号不存在时提示错误", selfReviewStatus: "rejected", expertReviewStatus: "rejected" },
          { id: "case-1-1-5", name: "密码错误时提示错误", selfReviewStatus: "pending", expertReviewStatus: "pending" },
        ],
      },
      {
        id: "tp-1-2",
        name: "验证码登录",
        selfReviewStats: { total: 12, adopted: 10, rejected: 1, pending: 1 },
        expertReviewStats: { total: 10, adopted: 9, rejected: 0, pending: 1 },
        cases: [
          { id: "case-1-2-1", name: "正确手机号获取验证码", selfReviewStatus: "adopted", expertReviewStatus: "adopted" },
          { id: "case-1-2-2", name: "错误验证码登录失败", selfReviewStatus: "adopted", expertReviewStatus: "adopted" },
          { id: "case-1-2-3", name: "验证码过期处理", selfReviewStatus: "rejected", expertReviewStatus: "pending" },
        ],
      },
      {
        id: "tp-1-3",
        name: "第三方登录",
        selfReviewStats: { total: 18, adopted: 15, rejected: 2, pending: 1 },
        expertReviewStats: { total: 15, adopted: 12, rejected: 2, pending: 1 },
        cases: [
          { id: "case-1-3-1", name: "微信授权登录成功", selfReviewStatus: "adopted", expertReviewStatus: "adopted" },
          { id: "case-1-3-2", name: "支付宝授权登录成功", selfReviewStatus: "adopted", expertReviewStatus: "adopted" },
          { id: "case-1-3-3", name: "授权取消处理", selfReviewStatus: "rejected", expertReviewStatus: "rejected" },
        ],
      },
    ],
  },
  {
    id: "dim-2",
    name: "订单管理模块",
    description: "覆盖订单创建、支付、取消等流程",
    selfReviewStats: { total: 68, adopted: 55, rejected: 8, pending: 5 },
    expertReviewStats: { total: 55, adopted: 48, rejected: 4, pending: 3 },
    testPoints: [
      {
        id: "tp-2-1",
        name: "订单创建",
        selfReviewStats: { total: 25, adopted: 20, rejected: 3, pending: 2 },
        expertReviewStats: { total: 20, adopted: 17, rejected: 2, pending: 1 },
        cases: [
          { id: "case-2-1-1", name: "单商品下单成功", selfReviewStatus: "adopted", expertReviewStatus: "adopted" },
          { id: "case-2-1-2", name: "多商品下单成功", selfReviewStatus: "adopted", expertReviewStatus: "adopted" },
          { id: "case-2-1-3", name: "库存不足时下单失败", selfReviewStatus: "rejected", expertReviewStatus: "rejected" },
        ],
      },
      {
        id: "tp-2-2",
        name: "订单支付",
        selfReviewStats: { total: 22, adopted: 18, rejected: 3, pending: 1 },
        expertReviewStats: { total: 18, adopted: 16, rejected: 1, pending: 1 },
        cases: [
          { id: "case-2-2-1", name: "微信支付成功", selfReviewStatus: "adopted", expertReviewStatus: "adopted" },
          { id: "case-2-2-2", name: "支付宝支付成功", selfReviewStatus: "adopted", expertReviewStatus: "adopted" },
          { id: "case-2-2-3", name: "支付超时处理", selfReviewStatus: "pending", expertReviewStatus: "pending" },
        ],
      },
      {
        id: "tp-2-3",
        name: "订单取消",
        selfReviewStats: { total: 21, adopted: 17, rejected: 2, pending: 2 },
        expertReviewStats: { total: 17, adopted: 15, rejected: 1, pending: 1 },
        cases: [
          { id: "case-2-3-1", name: "未支付订单取消", selfReviewStatus: "adopted", expertReviewStatus: "adopted" },
          { id: "case-2-3-2", name: "已支付订单退款", selfReviewStatus: "adopted", expertReviewStatus: "adopted" },
        ],
      },
    ],
  },
  {
    id: "dim-3",
    name: "商品展示模块",
    description: "覆盖商品列表、详情、搜索等功能",
    selfReviewStats: { total: 52, adopted: 45, rejected: 5, pending: 2 },
    expertReviewStats: { total: 45, adopted: 40, rejected: 3, pending: 2 },
    testPoints: [
      {
        id: "tp-3-1",
        name: "商品列表",
        selfReviewStats: { total: 18, adopted: 16, rejected: 1, pending: 1 },
        expertReviewStats: { total: 16, adopted: 14, rejected: 1, pending: 1 },
        cases: [
          { id: "case-3-1-1", name: "商品列表分页加载", selfReviewStatus: "adopted", expertReviewStatus: "adopted" },
          { id: "case-3-1-2", name: "商品列表筛选排序", selfReviewStatus: "adopted", expertReviewStatus: "adopted" },
        ],
      },
      {
        id: "tp-3-2",
        name: "商品详情",
        selfReviewStats: { total: 20, adopted: 17, rejected: 2, pending: 1 },
        expertReviewStats: { total: 17, adopted: 15, rejected: 1, pending: 1 },
        cases: [
          { id: "case-3-2-1", name: "商品图片轮播展示", selfReviewStatus: "adopted", expertReviewStatus: "adopted" },
          { id: "case-3-2-2", name: "商品规格选择", selfReviewStatus: "adopted", expertReviewStatus: "adopted" },
        ],
      },
      {
        id: "tp-3-3",
        name: "商品搜索",
        selfReviewStats: { total: 14, adopted: 12, rejected: 2, pending: 0 },
        expertReviewStats: { total: 12, adopted: 11, rejected: 1, pending: 0 },
        cases: [
          { id: "case-3-3-1", name: "关键词搜索商品", selfReviewStatus: "adopted", expertReviewStatus: "adopted" },
          { id: "case-3-3-2", name: "搜索历史记录", selfReviewStatus: "rejected", expertReviewStatus: "rejected" },
        ],
      },
    ],
  },
];

// 计算总计统计
const calculateTotalStats = (dimensions: TestDimension[], type: "self" | "expert"): ReviewStats => {
  return dimensions.reduce(
    (acc, dim) => {
      const stats = type === "self" ? dim.selfReviewStats : dim.expertReviewStats;
      return {
        total: acc.total + stats.total,
        adopted: acc.adopted + stats.adopted,
        rejected: acc.rejected + stats.rejected,
        pending: acc.pending + stats.pending,
      };
    },
    { total: 0, adopted: 0, rejected: 0, pending: 0 }
  );
};

// 统计卡片组件
function StatsCard({ 
  title, 
  icon: Icon, 
  stats, 
  colorScheme 
}: { 
  title: string; 
  icon: typeof Users; 
  stats: ReviewStats;
  colorScheme: "blue" | "purple";
}) {
  const adoptedPercentage = stats.total > 0 ? (stats.adopted / stats.total) * 100 : 0;
  
  return (
    <Card className="flex-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className={cn(
            "w-4 h-4",
            colorScheme === "blue" ? "text-blue-500" : "text-purple-500"
          )} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 mb-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="text-xs text-muted-foreground">总用例</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.adopted}</div>
            <div className="text-xs text-muted-foreground">已采纳</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">{stats.rejected}</div>
            <div className="text-xs text-muted-foreground">不采纳</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-500">{stats.pending}</div>
            <div className="text-xs text-muted-foreground">待评审</div>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>采纳率</span>
            <span>{adoptedPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={adoptedPercentage} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}

// 状态徽章组件
function StatusBadge({ status }: { status: "adopted" | "rejected" | "pending" }) {
  const config = {
    adopted: { label: "已采纳", className: "bg-green-500/10 text-green-600 border-green-200" },
    rejected: { label: "不采纳", className: "bg-red-500/10 text-red-600 border-red-200" },
    pending: { label: "待评审", className: "bg-amber-500/10 text-amber-600 border-amber-200" },
  };
  
  return (
    <Badge variant="outline" className={cn("text-xs", config[status].className)}>
      {config[status].label}
    </Badge>
  );
}

// 小型统计展示
function MiniStats({ stats, label }: { stats: ReviewStats; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium text-foreground">{stats.total}</span>
      <span className="text-green-600">{stats.adopted}</span>
      <span className="text-muted-foreground">/</span>
      <span className="text-red-500">{stats.rejected}</span>
      <span className="text-muted-foreground">/</span>
      <span className="text-amber-500">{stats.pending}</span>
    </div>
  );
}

export default function TestReport() {
  const navigate = useNavigate();
  const { workspaceId, recordId } = useParams();
  const [expandedDimensions, setExpandedDimensions] = useState<Set<string>>(new Set(["dim-1"]));
  const [expandedTestPoints, setExpandedTestPoints] = useState<Set<string>>(new Set());

  const selfReviewTotal = calculateTotalStats(mockDimensions, "self");
  const expertReviewTotal = calculateTotalStats(mockDimensions, "expert");

  const toggleDimension = (dimId: string) => {
    setExpandedDimensions((prev) => {
      const next = new Set(prev);
      if (next.has(dimId)) {
        next.delete(dimId);
      } else {
        next.add(dimId);
      }
      return next;
    });
  };

  const toggleTestPoint = (tpId: string) => {
    setExpandedTestPoints((prev) => {
      const next = new Set(prev);
      if (next.has(tpId)) {
        next.delete(tpId);
      } else {
        next.add(tpId);
      }
      return next;
    });
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
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          评审报告
        </h1>
        <p className="text-muted-foreground mt-1">
          按测试维度、测试点、用例层级展示评审汇总数据
        </p>
      </div>

      {/* 汇总统计卡片 */}
      <div className="flex gap-4 mb-6">
        <StatsCard 
          title="用例自评汇总" 
          icon={UserCheck} 
          stats={selfReviewTotal} 
          colorScheme="blue"
        />
        <StatsCard 
          title="专家评审汇总" 
          icon={Users} 
          stats={expertReviewTotal} 
          colorScheme="purple"
        />
      </div>

      {/* 层级数据展示 */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-6 py-3 bg-muted/50 border-b">
          <h2 className="font-medium text-foreground">测试维度详情</h2>
        </div>

        <div className="divide-y">
          {mockDimensions.map((dimension) => {
            const isDimExpanded = expandedDimensions.has(dimension.id);

            return (
              <div key={dimension.id} className="bg-card">
                {/* 测试维度行 */}
                <div
                  className="flex items-center gap-3 px-6 py-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => toggleDimension(dimension.id)}
                >
                  <div className="w-5 h-5 flex items-center justify-center text-muted-foreground">
                    {isDimExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                  <Layers className="w-5 h-5 text-primary" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground">{dimension.name}</div>
                    <div className="text-xs text-muted-foreground">{dimension.description}</div>
                  </div>
                  <div className="flex items-center gap-6">
                    <MiniStats stats={dimension.selfReviewStats} label="自评" />
                    <MiniStats stats={dimension.expertReviewStats} label="专家" />
                  </div>
                </div>

                {/* 测试点列表 */}
                {isDimExpanded && (
                  <div className="border-t bg-muted/20">
                    {dimension.testPoints.map((testPoint) => {
                      const isTpExpanded = expandedTestPoints.has(testPoint.id);

                      return (
                        <div key={testPoint.id}>
                          {/* 测试点行 */}
                          <div
                            className="flex items-center gap-3 px-6 py-3 pl-14 cursor-pointer hover:bg-muted/30 transition-colors"
                            onClick={() => toggleTestPoint(testPoint.id)}
                          >
                            <div className="w-5 h-5 flex items-center justify-center text-muted-foreground">
                              {isTpExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </div>
                            <Target className="w-4 h-4 text-blue-500" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-foreground">{testPoint.name}</div>
                            </div>
                            <div className="flex items-center gap-6">
                              <MiniStats stats={testPoint.selfReviewStats} label="自评" />
                              <MiniStats stats={testPoint.expertReviewStats} label="专家" />
                            </div>
                          </div>

                          {/* 用例列表 */}
                          {isTpExpanded && (
                            <div className="border-t bg-muted/10">
                              {testPoint.cases.map((testCase) => (
                                <div
                                  key={testCase.id}
                                  className="flex items-center gap-3 px-6 py-2.5 pl-24 hover:bg-muted/20 transition-colors"
                                >
                                  <TestTube className="w-4 h-4 text-muted-foreground" />
                                  <div className="flex-1 min-w-0">
                                    <span className="text-sm text-foreground">{testCase.name}</span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground">自评:</span>
                                      <StatusBadge status={testCase.selfReviewStatus} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground">专家:</span>
                                      <StatusBadge status={testCase.expertReviewStatus} />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
