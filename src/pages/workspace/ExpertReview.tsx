import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Search, Layers, Target, ChevronRight, ChevronDown, Eye, History, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface TestPoint {
  id: string;
  name: string;
  total: number;
  passed: number;
}

interface TestDimension {
  id: string;
  name: string;
  description: string;
  total: number;
  passed: number;
  testPoints: TestPoint[];
}

const mockDimensions: TestDimension[] = [
  {
    id: "dim-1",
    name: "用户管理",
    description: "用户注册、登录、权限相关测试",
    total: 45,
    passed: 35,
    testPoints: [
      { id: "tp-1", name: "用户登录", total: 15, passed: 12 },
      { id: "tp-2", name: "用户注册", total: 18, passed: 14 },
      { id: "tp-3", name: "密码重置", total: 12, passed: 9 },
    ],
  },
  {
    id: "dim-2",
    name: "订单管理",
    description: "订单创建、支付、退款流程测试",
    total: 62,
    passed: 50,
    testPoints: [
      { id: "tp-4", name: "订单创建", total: 22, passed: 18 },
      { id: "tp-5", name: "订单支付", total: 25, passed: 20 },
      { id: "tp-6", name: "订单退款", total: 15, passed: 12 },
    ],
  },
  {
    id: "dim-3",
    name: "商品管理",
    description: "商品上架、编辑、库存管理测试",
    total: 38,
    passed: 30,
    testPoints: [
      { id: "tp-7", name: "商品上架", total: 14, passed: 11 },
      { id: "tp-8", name: "商品编辑", total: 12, passed: 10 },
      { id: "tp-9", name: "库存管理", total: 12, passed: 9 },
    ],
  },
];

// 计算总统计
const calculateTotalStats = (dimensions: TestDimension[]) => {
  return dimensions.reduce(
    (acc, dim) => ({
      total: acc.total + dim.total,
      passed: acc.passed + dim.passed,
    }),
    { total: 0, passed: 0 }
  );
};

// 简化的统计显示组件
function ExpertMiniStats({ total, passed }: { total: number; passed: number }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-green-600 font-medium">{passed}</span>
      <span className="text-muted-foreground">/</span>
      <span className="text-muted-foreground">{total}</span>
    </div>
  );
}

export default function ExpertReview() {
  const navigate = useNavigate();
  const { workspaceId, recordId, batchId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDimensions, setExpandedDimensions] = useState<Set<string>>(
    new Set(mockDimensions.map((d) => d.id))
  );

  const totalStats = calculateTotalStats(mockDimensions);
  const pendingCount = totalStats.total - totalStats.passed;

  const toggleDimension = (dimensionId: string) => {
    setExpandedDimensions((prev) => {
      const next = new Set(prev);
      if (next.has(dimensionId)) {
        next.delete(dimensionId);
      } else {
        next.add(dimensionId);
      }
      return next;
    });
  };

  // 过滤维度和测试点
  const filteredDimensions = mockDimensions
    .map((dim) => ({
      ...dim,
      testPoints: dim.testPoints.filter((tp) =>
        tp.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter(
      (dim) =>
        dim.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dim.testPoints.length > 0
    );

  const handleNavigateToExpertReviewDetail = (testPointId: string) => {
    navigate(`/workspace/${workspaceId}/management/ai-cases/${recordId}/batch/${batchId}/expert-review/${testPointId}`);
  };

  const handleNavigateToRecords = () => {
    navigate(`/workspace/${workspaceId}/management/ai-cases/${recordId}/expert-review-records`);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink 
              className="cursor-pointer"
              onClick={() => navigate(`/workspace/${workspaceId}/management/ai-cases`)}
            >
              智能用例设计
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>专家评审</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/workspace/${workspaceId}/management/ai-cases`)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">专家评审</h1>
          <p className="text-muted-foreground mt-1">
            生成记录: AI-001 · 共 {totalStats.total} 个用例，{pendingCount} 个待评审
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleNavigateToRecords}>
          <History className="w-4 h-4" />
          评审记录
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索用例..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold">{totalStats.total}</div>
          <div className="text-sm text-muted-foreground">总用例数</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{totalStats.passed}</div>
          <div className="text-sm text-muted-foreground">通过</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">{totalStats.total - totalStats.passed - pendingCount}</div>
          <div className="text-sm text-muted-foreground">拒绝</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
          <div className="text-sm text-muted-foreground">待评审</div>
        </div>
      </div>

      {/* Hierarchical Case List */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-6 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
          测试用例
        </div>

        <div className="divide-y">
          {filteredDimensions.map((dimension) => {
            const isExpanded = expandedDimensions.has(dimension.id);

            return (
              <div key={dimension.id}>
                {/* Dimension Row */}
                <div
                  className="flex items-center gap-3 px-6 py-4 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => toggleDimension(dimension.id)}
                >
                  <button className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Layers className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{dimension.name}</span>
                      <span className="text-sm text-muted-foreground">· {dimension.description}</span>
                    </div>
                  </div>
                  <ExpertMiniStats total={dimension.total} passed={dimension.passed} />
                </div>

                {/* Test Points */}
                {isExpanded && dimension.testPoints.map((testPoint) => (
                  <div
                    key={testPoint.id}
                    className="flex items-center gap-3 px-6 py-3 pl-16 hover:bg-muted/20 transition-colors border-t border-muted/50"
                  >
                    <div className="w-6 h-6 rounded bg-secondary/50 flex items-center justify-center flex-shrink-0">
                      <Target className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-foreground">{testPoint.name}</span>
                    </div>
                    <ExpertMiniStats total={testPoint.total} passed={testPoint.passed} />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-3 text-xs gap-1 ml-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigateToExpertReviewDetail(testPoint.id);
                      }}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      查看详情
                    </Button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {filteredDimensions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Search className="w-12 h-12 mb-4 opacity-50" />
            <p>未找到匹配的测试用例</p>
          </div>
        )}
      </div>
    </div>
  );
}
