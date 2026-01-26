import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Search, Clock, FileText, BookOpen, Layout, ChevronDown, ChevronUp, ChevronRight, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CaseSourceInfo } from "@/components/workspace/CaseSourceInfo";

interface BatchCase {
  id: string;
  code: string;
  name: string;
  nature: "positive" | "negative";
  createdAt: string;
}

interface TestPoint {
  id: string;
  name: string;
  cases: BatchCase[];
}

interface TestDimension {
  id: string;
  name: string;
  testPoints: TestPoint[];
}

interface SourceDocument {
  id: string;
  name: string;
  version: string;
  type: "FSD" | "PRD" | "API" | "Design" | "UserStory";
}

interface GenerationMeta {
  documents: SourceDocument[];
  caseTemplate: string;
  generatedAt: string;
}

// Mock data organized by dimension hierarchy
const mockDimensions: TestDimension[] = [
  {
    id: "dim-1",
    name: "用户认证模块",
    testPoints: [
      {
        id: "tp-1",
        name: "用户登录",
        cases: [
          { id: "1", code: "TC-001", name: "用户登录成功-正确用户名密码", nature: "positive", createdAt: "2024-01-15 10:30" },
          { id: "2", code: "TC-002", name: "用户登录失败-密码错误", nature: "negative", createdAt: "2024-01-15 10:31" },
          { id: "3", code: "TC-003", name: "用户登录失败-用户名不存在", nature: "negative", createdAt: "2024-01-15 10:32" },
        ],
      },
      {
        id: "tp-2",
        name: "用户注册",
        cases: [
          { id: "4", code: "TC-004", name: "用户注册成功-填写完整信息", nature: "positive", createdAt: "2024-01-15 10:33" },
          { id: "5", code: "TC-005", name: "用户注册失败-手机号已存在", nature: "negative", createdAt: "2024-01-15 10:34" },
        ],
      },
    ],
  },
  {
    id: "dim-2",
    name: "密码管理模块",
    testPoints: [
      {
        id: "tp-3",
        name: "密码重置",
        cases: [
          { id: "6", code: "TC-006", name: "密码重置-发送验证码成功", nature: "positive", createdAt: "2024-01-15 10:35" },
          { id: "7", code: "TC-007", name: "密码重置-验证码校验通过", nature: "positive", createdAt: "2024-01-15 10:36" },
          { id: "8", code: "TC-008", name: "密码重置失败-验证码过期", nature: "negative", createdAt: "2024-01-15 10:37" },
        ],
      },
    ],
  },
];

// Mock generation metadata
const mockGenerationMeta: GenerationMeta = {
  documents: [
    { id: "doc-1", name: "用户管理功能规格说明书", version: "v1.2", type: "FSD" },
    { id: "doc-2", name: "登录注册接口文档", version: "v2.0", type: "API" },
    { id: "doc-3", name: "用户模块需求文档", version: "v1.0", type: "PRD" },
  ],
  caseTemplate: "BDD标准模板",
  generatedAt: "2024-01-15 10:30",
};

const natureConfig = {
  positive: { label: "正向用例", className: "bg-green-500/10 text-green-600 border-green-200" },
  negative: { label: "反向用例", className: "bg-orange-500/10 text-orange-600 border-orange-200" },
};

const docTypeConfig: Record<string, { label: string; className: string }> = {
  FSD: { label: "FSD", className: "bg-blue-500/10 text-blue-600 border-blue-200" },
  PRD: { label: "PRD", className: "bg-purple-500/10 text-purple-600 border-purple-200" },
  API: { label: "API", className: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
  Design: { label: "Design", className: "bg-pink-500/10 text-pink-600 border-pink-200" },
  UserStory: { label: "UserStory", className: "bg-amber-500/10 text-amber-600 border-amber-200" },
};

export default function BatchCaseList() {
  const navigate = useNavigate();
  const { workspaceId, batchId } = useParams();
  const [metaExpanded, setMetaExpanded] = useState(true);
  const [expandedDimensions, setExpandedDimensions] = useState<Record<string, boolean>>(() => 
    mockDimensions.reduce((acc, dim) => ({ ...acc, [dim.id]: true }), {})
  );
  const [caseDetailOpen, setCaseDetailOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<BatchCase | null>(null);
  const [selectedTestPoint, setSelectedTestPoint] = useState<TestPoint | null>(null);
  const [caseListOpen, setCaseListOpen] = useState(false);
  const [caseSearchQuery, setCaseSearchQuery] = useState("");

  const totalCases = mockDimensions.reduce(
    (acc, dim) => acc + dim.testPoints.reduce((tpAcc, tp) => tpAcc + tp.cases.length, 0),
    0
  );

  const toggleDimension = (dimId: string) => {
    setExpandedDimensions(prev => ({ ...prev, [dimId]: !prev[dimId] }));
  };

  const handleViewCases = (testPoint: TestPoint) => {
    setSelectedTestPoint(testPoint);
    setCaseSearchQuery("");
    setCaseListOpen(true);
  };

  const handleViewCaseDetail = (testCase: BatchCase) => {
    setSelectedCase(testCase);
    setCaseDetailOpen(true);
  };

  const getMockBddContent = (testCase: BatchCase) => {
    return `Feature: ${testCase.name}

  Scenario: ${testCase.name}
    Given 用户已经注册并拥有有效的账户
    And 用户位于登录页面
    When 用户输入正确的用户名 "testuser"
    And 用户输入正确的密码 "Password123"
    And 用户点击登录按钮
    Then 系统应该验证用户凭证
    And 用户应该被重定向到主页
    And 系统应该显示欢迎消息

  Examples:
    | 用户名    | 密码        | 预期结果   |
    | testuser  | Password123 | 登录成功   |
    | admin     | Admin@456   | 登录成功   |
    | user01    | User#789    | 登录成功   |`;
  };

  const filteredCases = selectedTestPoint?.cases.filter(
    (c) =>
      c.name.toLowerCase().includes(caseSearchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(caseSearchQuery.toLowerCase())
  ) || [];

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
            <BreadcrumbPage>生成用例列表</BreadcrumbPage>
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
        <div>
          <h1 className="text-2xl font-bold text-foreground">生成用例列表</h1>
          <p className="text-muted-foreground mt-1">
            批次 {batchId?.substring(0, 8)} · 共 {totalCases} 个用例
          </p>
        </div>
      </div>

      {/* Generation Meta Info */}
      <Collapsible open={metaExpanded} onOpenChange={setMetaExpanded} className="mb-6">
        <Card className="border-sky-200/60 bg-gradient-to-r from-sky-50/80 to-blue-50/60 dark:from-sky-950/30 dark:to-blue-950/20">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-sky-100/30 transition-colors">
              <div className="flex items-center gap-2 text-sm font-medium text-sky-800 dark:text-sky-200">
                <BookOpen className="w-4 h-4" />
                生成配置信息
              </div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                {metaExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-4 px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Source Documents */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    知识库文档 ({mockGenerationMeta.documents.length})
                  </div>
                  <div className="space-y-1.5">
                    {mockGenerationMeta.documents.map((doc) => {
                      const typeConfig = docTypeConfig[doc.type];
                      return (
                        <div 
                          key={doc.id} 
                          className="flex items-center gap-2 p-2 rounded-lg bg-white/60 dark:bg-card/60 border border-sky-100/50"
                        >
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${typeConfig.className}`}>
                            {typeConfig.label}
                          </Badge>
                          <span className="text-sm text-foreground flex-1 truncate">{doc.name}</span>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-sky-100/50 text-sky-700">
                            {doc.version}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Case Template */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Layout className="w-4 h-4" />
                    用例模板
                  </div>
                  <div className="p-3 rounded-lg bg-white/60 dark:bg-card/60 border border-sky-100/50">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-gradient-to-r from-sky-500 to-blue-500 text-white border-0">
                        {mockGenerationMeta.caseTemplate}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      生成时间：{mockGenerationMeta.generatedAt}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Dimension Hierarchy List */}
      <div className="space-y-4">
        {mockDimensions.map((dimension) => (
          <div key={dimension.id} className="rounded-xl border bg-card overflow-hidden">
            {/* Dimension Header */}
            <button
              className="w-full flex items-center justify-between px-6 py-4 bg-muted/30 hover:bg-muted/50 transition-colors"
              onClick={() => toggleDimension(dimension.id)}
            >
              <div className="flex items-center gap-3">
                <ChevronRight 
                  className={`w-4 h-4 text-muted-foreground transition-transform ${
                    expandedDimensions[dimension.id] ? "rotate-90" : ""
                  }`} 
                />
                <span className="font-medium text-foreground">{dimension.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {dimension.testPoints.reduce((acc, tp) => acc + tp.cases.length, 0)} 个用例
                </Badge>
              </div>
            </button>

            {/* Test Points */}
            {expandedDimensions[dimension.id] && (
              <div className="divide-y">
                {dimension.testPoints.map((testPoint) => (
                  <div
                    key={testPoint.id}
                    className="flex items-center justify-between px-6 py-3 pl-14 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{testPoint.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({testPoint.cases.length} 个用例)
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-3 text-xs gap-1"
                      onClick={() => handleViewCases(testPoint)}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      查看用例
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Case List Sheet */}
      <Sheet open={caseListOpen} onOpenChange={setCaseListOpen}>
        <SheetContent className="w-[600px] sm:max-w-[600px] flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {selectedTestPoint?.name} - 用例列表
            </SheetTitle>
          </SheetHeader>

          {/* Search */}
          <div className="py-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索用例编号或名称..."
                value={caseSearchQuery}
                onChange={(e) => setCaseSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Case List */}
          <ScrollArea className="flex-1">
            <div className="rounded-lg border">
              <div className="grid grid-cols-[70px_1fr_80px_110px] gap-2 px-3 py-2 bg-muted/50 text-xs font-medium text-muted-foreground border-b sticky top-0">
                <div>编号</div>
                <div>用例名称</div>
                <div>用例性质</div>
                <div>创建时间</div>
              </div>

              <div className="divide-y">
                {filteredCases.map((testCase) => {
                  const nature = natureConfig[testCase.nature];

                  return (
                    <div
                      key={testCase.id}
                      className="grid grid-cols-[70px_1fr_80px_110px] gap-2 px-3 py-2 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => handleViewCaseDetail(testCase)}
                    >
                      <div className="flex items-center">
                        <Badge variant="outline" className="font-mono text-[10px] px-1">
                          {testCase.code}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-foreground truncate">{testCase.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Badge variant="outline" className={`text-[10px] px-1 ${nature.className}`}>
                          {nature.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="w-3 h-3" />
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
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Case Detail Sidebar */}
      <Sheet open={caseDetailOpen} onOpenChange={setCaseDetailOpen}>
        <SheetContent className="w-[520px] sm:max-w-[520px] flex flex-col">
          <SheetHeader>
            <SheetTitle>案例详情</SheetTitle>
          </SheetHeader>
          
          {selectedCase && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-6 py-4">
                  {/* 案例信息 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">用例编号</Label>
                      <Badge variant="outline" className="text-xs font-mono">
                        {selectedCase.code}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">用例性质</Label>
                      <Badge variant="outline" className={`text-xs ${natureConfig[selectedCase.nature].className}`}>
                        {natureConfig[selectedCase.nature].label}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">用例名称</Label>
                    <p className="text-sm font-medium">{selectedCase.name}</p>
                  </div>
                  
                  {/* 案例来源详情 */}
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs">案例来源</Label>
                    <CaseSourceInfo caseId={selectedCase.id} showHeader={false} />
                  </div>
                  
                  {/* BDD 完整内容 */}
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs">案例详情 (BDD)</Label>
                    <Textarea
                      className="min-h-[300px] font-mono text-xs bg-muted/30 resize-none"
                      value={getMockBddContent(selectedCase)}
                      readOnly
                    />
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}