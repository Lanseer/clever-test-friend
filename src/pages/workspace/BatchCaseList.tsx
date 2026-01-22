import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Search, Clock, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BatchCase {
  id: string;
  code: string;
  name: string;
  nature: "positive" | "negative";
  createdAt: string;
}

const mockCases: BatchCase[] = [
  { id: "1", code: "TC-001", name: "用户登录成功-正确用户名密码", nature: "positive", createdAt: "2024-01-15 10:30" },
  { id: "2", code: "TC-002", name: "用户登录失败-密码错误", nature: "negative", createdAt: "2024-01-15 10:31" },
  { id: "3", code: "TC-003", name: "用户登录失败-用户名不存在", nature: "negative", createdAt: "2024-01-15 10:32" },
  { id: "4", code: "TC-004", name: "用户注册成功-填写完整信息", nature: "positive", createdAt: "2024-01-15 10:33" },
  { id: "5", code: "TC-005", name: "用户注册失败-手机号已存在", nature: "negative", createdAt: "2024-01-15 10:34" },
  { id: "6", code: "TC-006", name: "密码重置-发送验证码成功", nature: "positive", createdAt: "2024-01-15 10:35" },
  { id: "7", code: "TC-007", name: "密码重置-验证码校验通过", nature: "positive", createdAt: "2024-01-15 10:36" },
  { id: "8", code: "TC-008", name: "密码重置失败-验证码过期", nature: "negative", createdAt: "2024-01-15 10:37" },
];

const natureConfig = {
  positive: { label: "正向用例", className: "bg-green-500/10 text-green-600 border-green-200" },
  negative: { label: "反向用例", className: "bg-orange-500/10 text-orange-600 border-orange-200" },
};

export default function BatchCaseList() {
  const navigate = useNavigate();
  const { workspaceId, recordId, batchId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCases = mockCases.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
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
              onClick={() => navigate(`/workspace/${workspaceId}/management/ai-cases/${recordId}/generation-records`)}
            >
              生成记录
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>用例列表</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/workspace/${workspaceId}/management/ai-cases/${recordId}/generation-records`)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">用例列表</h1>
          <p className="text-muted-foreground mt-1">
            批次 BATCH-00{batchId} · 共 {mockCases.length} 个用例
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索用例编号或名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Case List */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="grid grid-cols-[80px_1fr_100px_150px] gap-4 px-6 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
          <div>编号</div>
          <div>用例名称</div>
          <div>用例性质</div>
          <div>创建时间</div>
        </div>

        <div className="divide-y">
          {filteredCases.map((testCase, index) => {
            const nature = natureConfig[testCase.nature];

            return (
              <div
                key={testCase.id}
                className="grid grid-cols-[80px_1fr_100px_150px] gap-4 px-6 py-4 hover:bg-muted/30 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center">
                  <Badge variant="outline" className="font-mono text-xs">
                    {testCase.code}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{testCase.name}</span>
                </div>
                <div className="flex items-center">
                  <Badge variant="outline" className={nature.className}>
                    {nature.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
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
