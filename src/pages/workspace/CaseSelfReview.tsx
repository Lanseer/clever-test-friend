import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Search, CheckCircle, XCircle, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type CaseNature = "positive" | "negative";

interface GeneratedCase {
  id: string;
  batch: string;
  code: string;
  name: string;
  nature: CaseNature;
  createdAt: string;
}

// 测试点信息
const testPointInfo: Record<string, { name: string; dimensionName: string }> = {
  "tp-1": { name: "用户登录", dimensionName: "用户管理" },
  "tp-2": { name: "用户注册", dimensionName: "用户管理" },
  "tp-3": { name: "密码重置", dimensionName: "用户管理" },
  "tp-4": { name: "订单创建", dimensionName: "订单管理" },
  "tp-5": { name: "订单支付", dimensionName: "订单管理" },
};

// 根据测试点生成 mock 用例
const generateMockCases = (testPointId: string): GeneratedCase[] => {
  const info = testPointInfo[testPointId] || { name: "默认测试点", dimensionName: "默认维度" };
  return [
    {
      id: "1",
      batch: "Batch-001",
      code: "TC-001",
      name: `${info.name}成功场景`,
      nature: "positive",
      createdAt: "2024-01-15 10:30",
    },
    {
      id: "2",
      batch: "Batch-001",
      code: "TC-002",
      name: `${info.name}失败场景-参数错误`,
      nature: "negative",
      createdAt: "2024-01-15 10:32",
    },
    {
      id: "3",
      batch: "Batch-001",
      code: "TC-003",
      name: `${info.name}边界测试`,
      nature: "positive",
      createdAt: "2024-01-15 10:35",
    },
    {
      id: "4",
      batch: "Batch-002",
      code: "TC-004",
      name: `${info.name}异常处理`,
      nature: "negative",
      createdAt: "2024-01-15 10:38",
    },
    {
      id: "5",
      batch: "Batch-002",
      code: "TC-005",
      name: `${info.name}并发测试`,
      nature: "positive",
      createdAt: "2024-01-15 10:40",
    },
    {
      id: "6",
      batch: "Batch-002",
      code: "TC-006",
      name: `${info.name}性能测试`,
      nature: "positive",
      createdAt: "2024-01-15 10:42",
    },
  ];
};

const natureConfig: Record<CaseNature, { label: string; icon: typeof CheckCircle; className: string }> = {
  positive: {
    label: "正例",
    icon: CheckCircle,
    className: "bg-green-500/10 text-green-600 border-green-200",
  },
  negative: {
    label: "反例",
    icon: XCircle,
    className: "bg-orange-500/10 text-orange-600 border-orange-200",
  },
};

export default function CaseSelfReview() {
  const navigate = useNavigate();
  const { workspaceId, recordId, batchId, testPointId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [cases] = useState(() => generateMockCases(testPointId || "tp-1"));

  const info = testPointInfo[testPointId || "tp-1"] || { name: "测试点", dimensionName: "测试维度" };

  const filteredCases = cases.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.batch.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <BreadcrumbLink 
              className="cursor-pointer"
              onClick={() => navigate(`/workspace/${workspaceId}/management/ai-cases/${recordId}/batch/${batchId}/review`)}
            >
              用例自评
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{info.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/workspace/${workspaceId}/management/ai-cases/${recordId}/batch/${batchId}/review`)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{info.name} - 用例列表</h1>
          <p className="text-muted-foreground mt-1">
            测试维度: {info.dimensionName} · 共 {cases.length} 个用例
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索批次、编号或名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Case List */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="grid grid-cols-[100px_80px_1fr_80px_140px] gap-4 px-6 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
          <div>批次</div>
          <div>编号</div>
          <div>名称</div>
          <div>性质</div>
          <div>创建时间</div>
        </div>

        <div className="divide-y">
          {filteredCases.map((testCase, index) => {
            const nature = natureConfig[testCase.nature];
            const NatureIcon = nature.icon;

            return (
              <div
                key={testCase.id}
                className="grid grid-cols-[100px_80px_1fr_80px_140px] gap-4 px-6 py-4 hover:bg-muted/30 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center">
                  <Badge variant="outline" className="font-mono text-xs">
                    {testCase.batch}
                  </Badge>
                </div>
                <div className="flex items-center">
                  <Badge variant="outline" className="font-mono text-xs">
                    {testCase.code}
                  </Badge>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-foreground">
                    {testCase.name}
                  </span>
                </div>
                <div className="flex items-center">
                  <Badge
                    variant="outline"
                    className={cn("text-xs gap-1", nature.className)}
                  >
                    <NatureIcon className="w-3 h-3" />
                    {nature.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  {testCase.createdAt}
                </div>
              </div>
            );
          })}
        </div>

        {filteredCases.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Search className="w-12 h-12 mb-4 opacity-50" />
            <p>未找到匹配的用例</p>
          </div>
        )}
      </div>
    </div>
  );
}
