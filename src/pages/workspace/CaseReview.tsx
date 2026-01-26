import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Search, Sparkles, Loader2, ChevronDown, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CaseSourceInfo } from "@/components/workspace/CaseSourceInfo";
import { toast } from "sonner";

type ReviewResult = "adopted" | "needsImprovement" | "needsDiscard" | "pending";

interface TestPoint {
  id: string;
  code: string;
  name: string;
  source: string;
  caseCount: number;
  reviewResult: ReviewResult;
  category?: string;
  solution?: string;
  remark?: string;
}

interface TestDimension {
  id: string;
  name: string;
  testPoints: TestPoint[];
}

const mockDimensions: TestDimension[] = [
  {
    id: "dim-1",
    name: "01-业务流程维度",
    testPoints: [
      { id: "tp-1", code: "SC-001", name: "用户登录成功场景", source: "需求文档", caseCount: 12, reviewResult: "adopted" },
      { id: "tp-2", code: "SC-002", name: "用户注册完整流程", source: "用例库", caseCount: 18, reviewResult: "adopted" },
      { id: "tp-3", code: "SC-003", name: "密码重置异常处理", source: "需求文档", caseCount: 8, reviewResult: "needsImprovement", category: "完善场景/完善信息/完善数据" },
      { id: "tp-4", code: "SC-004", name: "多因素认证验证", source: "安全规范", caseCount: 5, reviewResult: "needsDiscard", category: "重复/非本功能/" },
    ],
  },
  {
    id: "dim-2",
    name: "02-业务功能维度",
    testPoints: [
      { id: "tp-5", code: "SC-005", name: "订单创建标准流程", source: "需求文档", caseCount: 22, reviewResult: "adopted" },
      { id: "tp-6", code: "SC-006", name: "订单支付异常处理", source: "用例库", caseCount: 15, reviewResult: "pending" },
    ],
  },
  {
    id: "dim-3",
    name: "03-业务要素维度",
    testPoints: [
      { id: "tp-7", code: "SC-007", name: "商品信息完整性校验", source: "需求文档", caseCount: 14, reviewResult: "adopted" },
      { id: "tp-8", code: "SC-008", name: "库存数量边界测试", source: "用例库", caseCount: 10, reviewResult: "pending" },
    ],
  },
];

const reviewResultConfig: Record<ReviewResult, { label: string; className: string }> = {
  adopted: {
    label: "采纳",
    className: "text-green-600",
  },
  needsImprovement: {
    label: "需完善",
    className: "text-amber-600",
  },
  needsDiscard: {
    label: "丢弃",
    className: "text-red-600",
  },
  pending: {
    label: "待审查",
    className: "text-muted-foreground",
  },
};

// Mock BDD content for sidebar
const mockBddContent = {
  scenario: "用户使用有效的用户名和密码登录系统",
  steps: [
    { keyword: "Given", text: "用户已经注册并拥有有效的账户" },
    { keyword: "And", text: "用户位于登录页面" },
    { keyword: "When", text: "用户输入正确的用户名 \"testuser\"" },
    { keyword: "And", text: "用户输入正确的密码 \"Password123\"" },
    { keyword: "And", text: "用户点击登录按钮" },
    { keyword: "Then", text: "系统应该验证用户凭证" },
    { keyword: "And", text: "用户应该被重定向到主页" },
    { keyword: "And", text: "系统应该显示欢迎消息" },
  ],
  dataExamples: {
    headers: ["用户名", "密码", "预期结果"],
    rows: [
      ["testuser", "Password123", "登录成功"],
      ["admin", "Admin@456", "登录成功"],
      ["user01", "User#789", "登录成功"],
    ],
  },
};

export default function CaseReview() {
  const navigate = useNavigate();
  const { workspaceId, recordId, batchId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [dimensions, setDimensions] = useState(mockDimensions);
  
  // 智能审查状态
  const [isSmartReviewing, setIsSmartReviewing] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Map<string, ReviewResult>>(new Map());
  
  // 侧边栏状态
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTestPoint, setSidebarTestPoint] = useState<{ dimId: string; tp: TestPoint } | null>(null);

  // 过滤维度和测试点
  const filteredDimensions = dimensions
    .map((dim) => ({
      ...dim,
      testPoints: dim.testPoints.filter((tp) =>
        tp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tp.code.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter(
      (dim) =>
        dim.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dim.testPoints.length > 0
    );

  const handleOpenSidebar = (dimId: string, tp: TestPoint) => {
    setSidebarTestPoint({ dimId, tp });
    setSidebarOpen(true);
  };

  const handleReviewResultChange = (dimId: string, tpId: string, result: ReviewResult) => {
    setDimensions(prev => prev.map(dim => {
      if (dim.id === dimId) {
        return {
          ...dim,
          testPoints: dim.testPoints.map(tp => {
            if (tp.id === tpId) {
              return { ...tp, reviewResult: result };
            }
            return tp;
          })
        };
      }
      return dim;
    }));
    toast.success("审查结果已更新");
  };

  const handleFieldChange = (dimId: string, tpId: string, field: "category" | "solution" | "remark", value: string) => {
    setDimensions(prev => prev.map(dim => {
      if (dim.id === dimId) {
        return {
          ...dim,
          testPoints: dim.testPoints.map(tp => {
            if (tp.id === tpId) {
              return { ...tp, [field]: value };
            }
            return tp;
          })
        };
      }
      return dim;
    }));
  };

  const handleSmartReview = () => {
    setIsSmartReviewing(true);
    toast.info("智能审查进行中，请稍等...");
    
    // 模拟AI审查过程
    setTimeout(() => {
      // 生成AI建议
      const suggestions = new Map<string, ReviewResult>();
      dimensions.forEach(dim => {
        dim.testPoints.forEach(tp => {
          // 模拟AI给出的建议
          const randomResults: ReviewResult[] = ["adopted", "needsImprovement", "needsDiscard"];
          const suggestion = randomResults[Math.floor(Math.random() * randomResults.length)];
          suggestions.set(tp.id, suggestion);
        });
      });
      setAiSuggestions(suggestions);
      setIsSmartReviewing(false);
      setConfirmDialogOpen(true);
    }, 2000);
  };

  const handleConfirmAiSuggestions = () => {
    setDimensions(prev => prev.map(dim => ({
      ...dim,
      testPoints: dim.testPoints.map(tp => {
        const suggestion = aiSuggestions.get(tp.id);
        if (suggestion) {
          return { ...tp, reviewResult: suggestion };
        }
        return tp;
      })
    })));
    setConfirmDialogOpen(false);
    toast.success("智能审查结果已应用");
  };

  return (
    <div className="max-w-full mx-auto">
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
            <BreadcrumbPage>用例自评</BreadcrumbPage>
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
          <h1 className="text-2xl font-bold text-foreground">账户开户-案例审查</h1>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索编号或场景描述..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleSmartReview}
            disabled={isSmartReviewing}
          >
            {isSmartReviewing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                智能审查中...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                智能审查
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Dimension Tables */}
      <div className="space-y-6">
        {filteredDimensions.map((dimension) => (
          <div key={dimension.id} className="overflow-hidden">
            {/* Dimension Header */}
            <div className="bg-[hsl(200,60%,94%)] border-l-4 border-l-[hsl(200,70%,50%)] px-4 py-3 font-medium text-foreground">
              {dimension.name}
            </div>
            
            {/* Table */}
            <div className="border border-t-0 overflow-x-auto">
              {/* Table Header */}
              <div className="bg-[hsl(200,70%,50%)] text-white">
                {/* First row - group headers */}
                <div className="grid grid-cols-11 text-sm">
                  <div className="col-span-5 px-3 py-2 border-r border-[hsl(200,70%,60%)] text-center font-medium">
                    场景基本信息
                  </div>
                  <div className="col-span-6 px-3 py-2 text-center font-medium">
                    用户审查
                  </div>
                </div>
                {/* Second row - column headers */}
                <div className="grid grid-cols-11 text-sm bg-[hsl(200,65%,55%)]">
                  <div className="col-span-1 px-3 py-2 border-r border-[hsl(200,70%,60%)] text-center">编号</div>
                  <div className="col-span-2 px-3 py-2 border-r border-[hsl(200,70%,60%)] text-center">场景描述</div>
                  <div className="col-span-1 px-3 py-2 border-r border-[hsl(200,70%,60%)] text-center">场景来源</div>
                  <div className="col-span-1 px-3 py-2 border-r border-[hsl(200,70%,60%)] text-center">对应案例数</div>
                  <div className="col-span-1 px-3 py-2 border-r border-[hsl(200,70%,60%)] text-center">审查结果</div>
                  <div className="col-span-2 px-3 py-2 border-r border-[hsl(200,70%,60%)] text-center">分类</div>
                  <div className="col-span-2 px-3 py-2 border-r border-[hsl(200,70%,60%)] text-center">处理方案</div>
                  <div className="col-span-1 px-3 py-2 text-center">备注</div>
                </div>
              </div>
              
              {/* Table Body */}
              <div className="divide-y divide-border bg-background">
                {dimension.testPoints.map((tp) => {
                  const resultConfig = reviewResultConfig[tp.reviewResult];
                  
                  return (
                    <div
                      key={tp.id}
                      className="grid grid-cols-11 text-sm hover:bg-muted/30 transition-colors"
                    >
                      {/* 编号 */}
                      <div className="col-span-1 px-3 py-3 border-r border-border flex items-center justify-center">
                        <span className="font-mono text-xs">{tp.code}</span>
                      </div>
                      {/* 场景描述 - 不可点击 */}
                      <div className="col-span-2 px-3 py-3 border-r border-border flex items-center">
                        <span className="truncate text-foreground">{tp.name}</span>
                      </div>
                      {/* 场景来源 */}
                      <div className="col-span-1 px-3 py-3 border-r border-border flex items-center justify-center text-muted-foreground">
                        {tp.source}
                      </div>
                      {/* 对应案例数 - 可点击打开侧边栏 */}
                      <div className="col-span-1 px-3 py-3 border-r border-border flex items-center justify-center">
                        <span 
                          className="text-primary hover:underline cursor-pointer"
                          onClick={() => handleOpenSidebar(dimension.id, tp)}
                        >
                          {tp.caseCount}
                        </span>
                      </div>
                      {/* 审查结果 - 下拉菜单 */}
                      <div className="col-span-1 px-3 py-3 border-r border-border flex items-center justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn("h-7 px-2 gap-1", resultConfig.className)}
                            >
                              {resultConfig.label}
                              <ChevronDown className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="center">
                            {(["adopted", "needsImprovement", "needsDiscard"] as ReviewResult[]).map((result) => {
                              const config = reviewResultConfig[result];
                              return (
                                <DropdownMenuItem
                                  key={result}
                                  className={cn("gap-2", config.className)}
                                  onClick={() => handleReviewResultChange(dimension.id, tp.id, result)}
                                >
                                  {tp.reviewResult === result && <Check className="w-3 h-3" />}
                                  <span className={tp.reviewResult !== result ? "ml-5" : ""}>{config.label}</span>
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {/* 分类 - 可编辑 */}
                      <div className="col-span-2 px-2 py-1 border-r border-border flex items-center">
                        <Input
                          className="h-8 text-xs border-0 bg-transparent focus-visible:ring-1"
                          placeholder="请输入分类..."
                          value={tp.category || ""}
                          onChange={(e) => handleFieldChange(dimension.id, tp.id, "category", e.target.value)}
                        />
                      </div>
                      {/* 处理方案 - 可编辑 */}
                      <div className="col-span-2 px-2 py-1 border-r border-border flex items-center">
                        <Input
                          className="h-8 text-xs border-0 bg-transparent focus-visible:ring-1"
                          placeholder="请输入处理方案..."
                          value={tp.solution || ""}
                          onChange={(e) => handleFieldChange(dimension.id, tp.id, "solution", e.target.value)}
                        />
                      </div>
                      {/* 备注 - 可编辑 */}
                      <div className="col-span-1 px-2 py-1 flex items-center">
                        <Input
                          className="h-8 text-xs border-0 bg-transparent focus-visible:ring-1"
                          placeholder="备注..."
                          value={tp.remark || ""}
                          onChange={(e) => handleFieldChange(dimension.id, tp.id, "remark", e.target.value)}
                        />
                      </div>
                    </div>
                  );
                })}
                
                {dimension.testPoints.length === 0 && (
                  <div className="col-span-11 px-3 py-6 text-center text-muted-foreground">
                    暂无数据
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDimensions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Search className="w-12 h-12 mb-4 opacity-50" />
          <p>未找到匹配的测试场景</p>
        </div>
      )}

      {/* 智能审查确认对话框 */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认采纳智能意见</AlertDialogTitle>
            <AlertDialogDescription>
              智能审查已完成，是否将智能审查结果应用到当前页面的用例审查结果？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAiSuggestions}>
              确认
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 案例详情侧边栏 */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent className="w-[520px] sm:max-w-[520px] flex flex-col">
          <SheetHeader>
            <SheetTitle>案例详情</SheetTitle>
          </SheetHeader>
          
          {sidebarTestPoint && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-6 py-4">
                  {/* BDD Scenario */}
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs">Scenario</Label>
                    <div className="p-3 rounded-lg bg-muted/50 text-sm">
                      {mockBddContent.scenario}
                    </div>
                  </div>
                  
                  {/* BDD Steps */}
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs">Steps</Label>
                    <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                      {mockBddContent.steps.map((step, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-semibold text-primary">{step.keyword}</span>{" "}
                          <span>{step.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Data Examples */}
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs">Data Examples</Label>
                    <div className="rounded-lg border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            {mockBddContent.dataExamples.headers.map((header, index) => (
                              <th key={index} className="px-3 py-2 text-left font-medium text-muted-foreground">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {mockBddContent.dataExamples.rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="border-t">
                              {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="px-3 py-2">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* 场景来源详情 */}
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs">场景来源</Label>
                    <CaseSourceInfo caseId={sidebarTestPoint.tp.id} showHeader={false} />
                  </div>
                  
                  {/* 审查结果和对应案例数 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">审查结果</Label>
                      <p className={cn("text-sm font-medium", reviewResultConfig[sidebarTestPoint.tp.reviewResult].className)}>
                        {reviewResultConfig[sidebarTestPoint.tp.reviewResult].label}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">对应案例数</Label>
                      <p className="text-sm font-medium">
                        {sidebarTestPoint.tp.caseCount}
                      </p>
                    </div>
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
