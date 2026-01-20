import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronRight, ChevronLeft, TestTube, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

type ReviewStatus = "adopted" | "rejected" | "pending";

interface TestCase {
  id: string;
  code: string;
  name: string;
  selfReviewStatus: ReviewStatus;
  expertReviewStatus: ReviewStatus;
  createdAt: string;
  bddContent: string;
}

// Mock数据 - 模拟大量用例
const generateMockCases = (testPointId: string): TestCase[] => {
  const statuses: ReviewStatus[] = ["adopted", "rejected", "pending"];
  const cases: TestCase[] = [];
  
  for (let i = 1; i <= 48; i++) {
    cases.push({
      id: `${testPointId}-case-${i}`,
      code: `TC-${testPointId.split("-").pop()}-${String(i).padStart(3, "0")}`,
      name: `测试用例${i}: ${["登录验证", "密码校验", "权限检查", "数据校验", "流程测试", "边界测试", "异常处理", "并发测试"][i % 8]}场景${Math.ceil(i / 8)}`,
      selfReviewStatus: statuses[i % 3],
      expertReviewStatus: statuses[(i + 1) % 3],
      createdAt: `2024-01-${String(15 - (i % 10)).padStart(2, "0")} ${10 + (i % 12)}:${String((i * 7) % 60).padStart(2, "0")}`,
      bddContent: `Given 用户处于${["登录页面", "首页", "订单页面", "个人中心"][i % 4]}\nWhen 用户执行${["点击", "输入", "滑动", "提交"][i % 4]}操作\nThen 系统应该${["显示成功", "返回结果", "跳转页面", "提示错误"][i % 4]}`,
    });
  }
  
  return cases;
};

// 测试点信息
const testPointInfo: Record<string, { name: string; dimensionName: string; sourceDoc: string }> = {
  "tp-1-1": { name: "账号密码登录", dimensionName: "用户登录模块", sourceDoc: "用户登录功能规格说明书 v2.1" },
  "tp-1-2": { name: "验证码登录", dimensionName: "用户登录模块", sourceDoc: "用户登录功能规格说明书 v2.1" },
  "tp-1-3": { name: "第三方登录", dimensionName: "用户登录模块", sourceDoc: "第三方集成接口文档 v1.0" },
  "tp-2-1": { name: "订单创建", dimensionName: "订单管理模块", sourceDoc: "订单流程设计文档 v3.0" },
  "tp-2-2": { name: "订单支付", dimensionName: "订单管理模块", sourceDoc: "支付模块接口文档 v2.0" },
  "tp-2-3": { name: "订单取消", dimensionName: "订单管理模块", sourceDoc: "订单流程设计文档 v3.0" },
  "tp-3-1": { name: "商品列表", dimensionName: "商品展示模块", sourceDoc: "商品管理PRD v1.5" },
  "tp-3-2": { name: "商品详情", dimensionName: "商品展示模块", sourceDoc: "商品管理PRD v1.5" },
  "tp-3-3": { name: "商品搜索", dimensionName: "商品展示模块", sourceDoc: "搜索功能设计文档 v2.0" },
};

// 状态徽章组件
function StatusBadge({ status }: { status: ReviewStatus }) {
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

const PAGE_SIZE = 10;

export default function TestReportCases() {
  const navigate = useNavigate();
  const { workspaceId, recordId, testPointId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selfFilter, setSelfFilter] = useState<string>("all");
  const [expertFilter, setExpertFilter] = useState<string>("all");

  const info = testPointId ? testPointInfo[testPointId] : null;
  const allCases = testPointId ? generateMockCases(testPointId) : [];
  
  // 过滤用例
  const filteredCases = allCases.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSelf = selfFilter === "all" || c.selfReviewStatus === selfFilter;
    const matchesExpert = expertFilter === "all" || c.expertReviewStatus === expertFilter;
    return matchesSearch && matchesSelf && matchesExpert;
  });

  // 分页
  const totalPages = Math.ceil(filteredCases.length / PAGE_SIZE);
  const paginatedCases = filteredCases.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const goToPage = (page: number) => {
    setSearchParams({ page: String(page) });
  };

  // 统计
  const stats = {
    total: filteredCases.length,
    adopted: filteredCases.filter((c) => c.selfReviewStatus === "adopted").length,
    rejected: filteredCases.filter((c) => c.selfReviewStatus === "rejected").length,
    pending: filteredCases.filter((c) => c.selfReviewStatus === "pending").length,
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* 面包屑导航 */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <button 
          onClick={() => navigate(`/workspace/${workspaceId}/management/ai-cases`)}
          className="hover:text-foreground transition-colors"
        >
          智能用例设计
        </button>
        <ChevronRight className="w-4 h-4" />
        <button 
          onClick={() => navigate(`/workspace/${workspaceId}/management/ai-cases/${recordId}/report`)}
          className="hover:text-foreground transition-colors"
        >
          评审报告
        </button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground">{info?.name || "测试点用例"}</span>
      </div>

      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <TestTube className="w-6 h-6 text-primary" />
          {info?.name || "测试点用例"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {info?.dimensionName} · 共 {allCases.length} 个用例
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="text-xs text-muted-foreground">总用例</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.adopted}</div>
            <div className="text-xs text-muted-foreground">已采纳</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold text-red-500">{stats.rejected}</div>
            <div className="text-xs text-muted-foreground">不采纳</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold text-amber-500">{stats.pending}</div>
            <div className="text-xs text-muted-foreground">待评审</div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索用例编号或名称..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              goToPage(1);
            }}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={selfFilter} onValueChange={(v) => { setSelfFilter(v); goToPage(1); }}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="自评状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部自评</SelectItem>
              <SelectItem value="adopted">已采纳</SelectItem>
              <SelectItem value="rejected">不采纳</SelectItem>
              <SelectItem value="pending">待评审</SelectItem>
            </SelectContent>
          </Select>
          <Select value={expertFilter} onValueChange={(v) => { setExpertFilter(v); goToPage(1); }}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="专家状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部专家</SelectItem>
              <SelectItem value="adopted">已采纳</SelectItem>
              <SelectItem value="rejected">不采纳</SelectItem>
              <SelectItem value="pending">待评审</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 用例列表 */}
      <div className="rounded-xl border bg-card overflow-hidden mb-4">
        <div className="grid grid-cols-[100px_1fr_120px_100px_100px_150px] gap-3 px-6 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
          <div>编号</div>
          <div>用例名称</div>
          <div>创建时间</div>
          <div>自评状态</div>
          <div>专家状态</div>
          <div>操作</div>
        </div>

        <div className="divide-y">
          {paginatedCases.map((testCase, index) => (
            <div
              key={testCase.id}
              className="grid grid-cols-[100px_1fr_120px_100px_100px_150px] gap-3 px-6 py-3 hover:bg-muted/30 transition-colors animate-fade-in"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div>
                <Badge variant="outline" className="font-mono text-xs">
                  {testCase.code}
                </Badge>
              </div>
              <div className="text-sm text-foreground truncate" title={testCase.name}>
                {testCase.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {testCase.createdAt.split(" ")[0]}
              </div>
              <div>
                <StatusBadge status={testCase.selfReviewStatus} />
              </div>
              <div>
                <StatusBadge status={testCase.expertReviewStatus} />
              </div>
              <div>
                <Button variant="ghost" size="sm" className="h-7 text-xs">
                  查看详情
                </Button>
              </div>
            </div>
          ))}
        </div>

        {paginatedCases.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Search className="w-12 h-12 mb-4 opacity-50" />
            <p>未找到匹配的用例</p>
          </div>
        )}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            显示 {(currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, filteredCases.length)} 条，共 {filteredCases.length} 条
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => currentPage > 1 && goToPage(currentPage - 1)}
                  className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => goToPage(pageNum)}
                      isActive={currentPage === pageNum}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => currentPage < totalPages && goToPage(currentPage + 1)}
                  className={cn(currentPage === totalPages && "pointer-events-none opacity-50")}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
