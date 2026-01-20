import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronRight, ChevronDown, FileText, Users, UserCheck, Layers, Target, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// 统计数据接口
interface ReviewStats {
  total: number;
  adopted: number;
  rejected: number;
  pending: number;
}

// 测试点接口
interface TestPoint {
  id: string;
  name: string;
  sourceDoc: string;
  sourceDocVersion: string;
  caseCount: number;
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
        sourceDoc: "用户登录功能规格说明书",
        sourceDocVersion: "v2.1",
        caseCount: 48,
        selfReviewStats: { total: 15, adopted: 13, rejected: 1, pending: 1 },
        expertReviewStats: { total: 13, adopted: 11, rejected: 1, pending: 1 },
      },
      {
        id: "tp-1-2",
        name: "验证码登录",
        sourceDoc: "用户登录功能规格说明书",
        sourceDocVersion: "v2.1",
        caseCount: 36,
        selfReviewStats: { total: 12, adopted: 10, rejected: 1, pending: 1 },
        expertReviewStats: { total: 10, adopted: 9, rejected: 0, pending: 1 },
      },
      {
        id: "tp-1-3",
        name: "第三方登录",
        sourceDoc: "第三方集成接口文档",
        sourceDocVersion: "v1.0",
        caseCount: 42,
        selfReviewStats: { total: 18, adopted: 15, rejected: 2, pending: 1 },
        expertReviewStats: { total: 15, adopted: 12, rejected: 2, pending: 1 },
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
        sourceDoc: "订单流程设计文档",
        sourceDocVersion: "v3.0",
        caseCount: 52,
        selfReviewStats: { total: 25, adopted: 20, rejected: 3, pending: 2 },
        expertReviewStats: { total: 20, adopted: 17, rejected: 2, pending: 1 },
      },
      {
        id: "tp-2-2",
        name: "订单支付",
        sourceDoc: "支付模块接口文档",
        sourceDocVersion: "v2.0",
        caseCount: 38,
        selfReviewStats: { total: 22, adopted: 18, rejected: 3, pending: 1 },
        expertReviewStats: { total: 18, adopted: 16, rejected: 1, pending: 1 },
      },
      {
        id: "tp-2-3",
        name: "订单取消",
        sourceDoc: "订单流程设计文档",
        sourceDocVersion: "v3.0",
        caseCount: 28,
        selfReviewStats: { total: 21, adopted: 17, rejected: 2, pending: 2 },
        expertReviewStats: { total: 17, adopted: 15, rejected: 1, pending: 1 },
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
        sourceDoc: "商品管理PRD",
        sourceDocVersion: "v1.5",
        caseCount: 32,
        selfReviewStats: { total: 18, adopted: 16, rejected: 1, pending: 1 },
        expertReviewStats: { total: 16, adopted: 14, rejected: 1, pending: 1 },
      },
      {
        id: "tp-3-2",
        name: "商品详情",
        sourceDoc: "商品管理PRD",
        sourceDocVersion: "v1.5",
        caseCount: 45,
        selfReviewStats: { total: 20, adopted: 17, rejected: 2, pending: 1 },
        expertReviewStats: { total: 17, adopted: 15, rejected: 1, pending: 1 },
      },
      {
        id: "tp-3-3",
        name: "商品搜索",
        sourceDoc: "搜索功能设计文档",
        sourceDocVersion: "v2.0",
        caseCount: 28,
        selfReviewStats: { total: 14, adopted: 12, rejected: 2, pending: 0 },
        expertReviewStats: { total: 12, adopted: 11, rejected: 1, pending: 0 },
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
                    {dimension.testPoints.map((testPoint) => (
                      <div key={testPoint.id}>
                        {/* 测试点行 */}
                        <div
                          className="flex items-center gap-3 px-6 py-3 pl-14 hover:bg-muted/30 transition-colors"
                        >
                          <Target className="w-4 h-4 text-blue-500" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground">{testPoint.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs font-normal">
                                <FileText className="w-3 h-3 mr-1" />
                                {testPoint.sourceDoc}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {testPoint.sourceDocVersion}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {testPoint.caseCount} 个用例
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <MiniStats stats={testPoint.selfReviewStats} label="自评" />
                            <MiniStats stats={testPoint.expertReviewStats} label="专家" />
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/workspace/${workspaceId}/management/ai-cases/${recordId}/report/test-point/${testPoint.id}`);
                            }}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            查看用例
                          </Button>
                        </div>
                      </div>
                    ))}
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
