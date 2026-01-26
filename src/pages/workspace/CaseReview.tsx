import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Search, Sparkles, Loader2, ChevronDown, Check, Info } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CaseDetailSidebar, CaseDetailData } from "@/components/workspace/CaseDetailSidebar";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// 分类选项
const categoryOptions = [
  { value: "完善场景", label: "完善场景" },
  { value: "完善信息", label: "完善信息" },
  { value: "完善数据", label: "完善数据" },
  { value: "重复", label: "重复" },
  { value: "非本功能", label: "非本功能" },
  { value: "其他", label: "其他" },
];

type ReviewResult = "adopted" | "needsImprovement" | "needsDiscard" | "pending";

interface ReviewHistoryItem {
  timestamp: string;
  action: string;
}

interface TestPoint {
  id: string;
  code: string;
  name: string;
  source: string;
  caseCount: number;
  reviewResult: ReviewResult;
  aiSuggestion?: ReviewResult; // 智能审查建议结果
  category?: string;
  solution?: string;
  reviewHistory: ReviewHistoryItem[];
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
      { id: "tp-1", code: "SC-001", name: "用户登录成功场景", source: "UserStory", caseCount: 12, reviewResult: "adopted", reviewHistory: [{ timestamp: "2026-01-05 10:40", action: "状态修改为采纳" }] },
      { id: "tp-2", code: "SC-002", name: "用户注册完整流程", source: "FSD", caseCount: 18, reviewResult: "needsImprovement", aiSuggestion: "adopted", category: "完善场景", reviewHistory: [{ timestamp: "2026-01-05 11:20", action: "状态修改为采纳" }] },
      { id: "tp-3", code: "SC-003", name: "密码重置异常处理", source: "TSD", caseCount: 8, reviewResult: "needsImprovement", category: "完善场景", reviewHistory: [{ timestamp: "2026-01-05 10:40", action: "状态修改为采纳" }, { timestamp: "2026-01-06 13:25", action: "状态修改为需完善" }] },
      { id: "tp-4", code: "SC-004", name: "多因素认证验证", source: "PRD", caseCount: 5, reviewResult: "needsDiscard", aiSuggestion: "adopted", category: "重复", reviewHistory: [{ timestamp: "2026-01-05 14:30", action: "状态修改为丢弃" }] },
    ],
  },
  {
    id: "dim-2",
    name: "02-业务功能维度",
    testPoints: [
      { id: "tp-5", code: "SC-005", name: "订单创建标准流程", source: "UserStory", caseCount: 22, reviewResult: "adopted", reviewHistory: [{ timestamp: "2026-01-06 09:00", action: "状态修改为采纳" }] },
      { id: "tp-6", code: "SC-006", name: "订单支付异常处理", source: "FSD", caseCount: 15, reviewResult: "pending", reviewHistory: [] },
    ],
  },
  {
    id: "dim-3",
    name: "03-业务要素维度",
    testPoints: [
      { id: "tp-7", code: "SC-007", name: "商品信息完整性校验", source: "TSD", caseCount: 14, reviewResult: "adopted", reviewHistory: [{ timestamp: "2026-01-06 10:15", action: "状态修改为采纳" }] },
      { id: "tp-8", code: "SC-008", name: "库存数量边界测试", source: "PRD", caseCount: 10, reviewResult: "pending", reviewHistory: [] },
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

export default function CaseReview() {
  const navigate = useNavigate();
  const { workspaceId, recordId, batchId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [dimensions, setDimensions] = useState(mockDimensions);
  
  // 智能审查状态
  const [isSmartReviewing, setIsSmartReviewing] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Map<string, ReviewResult>>(new Map());

  // 统计数据计算
  const statistics = {
    totalScenarios: dimensions.reduce((sum, dim) => sum + dim.testPoints.length, 0),
    totalCases: dimensions.reduce((sum, dim) => sum + dim.testPoints.reduce((s, tp) => s + tp.caseCount, 0), 0),
    adopted: dimensions.reduce((sum, dim) => sum + dim.testPoints.filter(tp => tp.reviewResult === "adopted").length, 0),
    needsImprovement: dimensions.reduce((sum, dim) => sum + dim.testPoints.filter(tp => tp.reviewResult === "needsImprovement").length, 0),
    needsDiscard: dimensions.reduce((sum, dim) => sum + dim.testPoints.filter(tp => tp.reviewResult === "needsDiscard").length, 0),
  };
  
  // 侧边栏状态
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCaseData, setSidebarCaseData] = useState<CaseDetailData | null>(null);

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
    setSidebarCaseData({
      id: tp.id,
      reviewResult: tp.reviewResult,
      caseCount: tp.caseCount,
    });
    setSidebarOpen(true);
  };

  const handleReviewResultChange = (dimId: string, tpId: string, result: ReviewResult) => {
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const actionLabel = reviewResultConfig[result].label;
    
    setDimensions(prev => prev.map(dim => {
      if (dim.id === dimId) {
        return {
          ...dim,
          testPoints: dim.testPoints.map(tp => {
            if (tp.id === tpId) {
              const newHistory: ReviewHistoryItem = {
                timestamp,
                action: `将状态改为${actionLabel}`
              };
              return { 
                ...tp, 
                reviewResult: result,
                reviewHistory: [...tp.reviewHistory, newHistory]
              };
            }
            return tp;
          })
        };
      }
      return dim;
    }));
    toast.success("审查结果已更新");
  };

  const handleFieldChange = (dimId: string, tpId: string, field: "category" | "solution", value: string) => {
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
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    setDimensions(prev => prev.map(dim => ({
      ...dim,
      testPoints: dim.testPoints.map(tp => {
        const suggestion = aiSuggestions.get(tp.id);
        if (suggestion) {
          const actionLabel = reviewResultConfig[suggestion].label;
          const newHistory: ReviewHistoryItem = {
            timestamp,
            action: `智能审查将状态改为${actionLabel}`
          };
          return { 
            ...tp, 
            reviewResult: suggestion,
            aiSuggestion: suggestion, // 保存智能审查结果
            reviewHistory: [...(tp.reviewHistory || []), newHistory]
          };
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        <div className="bg-card border rounded-lg px-4 py-3 flex flex-col">
          <span className="text-xs text-muted-foreground mb-1">总场景</span>
          <span className="text-xl font-semibold">{statistics.totalScenarios}</span>
        </div>
        <div className="bg-card border rounded-lg px-4 py-3 flex flex-col">
          <span className="text-xs text-muted-foreground mb-1">总案例</span>
          <span className="text-xl font-semibold">{statistics.totalCases}</span>
        </div>
        <div className="bg-card border rounded-lg px-4 py-3 flex flex-col">
          <span className="text-xs text-muted-foreground mb-1">采纳</span>
          <span className="text-xl font-semibold text-green-600">{statistics.adopted}</span>
        </div>
        <div className="bg-card border rounded-lg px-4 py-3 flex flex-col">
          <span className="text-xs text-muted-foreground mb-1">需完善</span>
          <span className="text-xl font-semibold text-amber-600">{statistics.needsImprovement}</span>
        </div>
        <div className="bg-card border rounded-lg px-4 py-3 flex flex-col">
          <span className="text-xs text-muted-foreground mb-1">丢弃</span>
          <span className="text-xl font-semibold text-red-600">{statistics.needsDiscard}</span>
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
                <div className="grid grid-cols-12 text-sm">
                  <div className="col-span-5 px-3 py-2 border-r border-[hsl(200,70%,60%)] text-center font-medium">
                    场景基本信息
                  </div>
                  <div className="col-span-7 px-3 py-2 text-center font-medium">
                    用户审查
                  </div>
                </div>
                {/* Second row - column headers */}
                <div className="grid grid-cols-12 text-sm bg-[hsl(200,65%,55%)]">
                  <div className="col-span-1 px-3 py-2 border-r border-[hsl(200,70%,60%)] text-center">编号</div>
                  <div className="col-span-2 px-3 py-2 border-r border-[hsl(200,70%,60%)] text-center">场景描述</div>
                  <div className="col-span-1 px-3 py-2 border-r border-[hsl(200,70%,60%)] text-center">来源</div>
                  <div className="col-span-1 px-3 py-2 border-r border-[hsl(200,70%,60%)] text-center">案例数</div>
                  <div className="col-span-1 px-3 py-2 border-r border-[hsl(200,70%,60%)] text-center">审查结果</div>
                  <div className="col-span-2 px-3 py-2 border-r border-[hsl(200,70%,60%)] text-center">分类</div>
                  <div className="col-span-2 px-3 py-2 border-r border-[hsl(200,70%,60%)] text-center">处理方案</div>
                  <div className="col-span-2 px-3 py-2 text-center">审查记录</div>
                </div>
              </div>
              
              {/* Table Body */}
              <div className="divide-y divide-border bg-background">
                {dimension.testPoints.map((tp) => {
                  const resultConfig = reviewResultConfig[tp.reviewResult];
                  
                  return (
                    <div
                      key={tp.id}
                      className="grid grid-cols-12 text-sm hover:bg-muted/30 transition-colors"
                    >
                      {/* 编号 */}
                      <div className="col-span-1 px-3 py-3 border-r border-border flex items-center justify-center">
                        <span className="font-mono text-xs">{tp.code}</span>
                      </div>
                      {/* 场景描述 - hover显示完整内容 */}
                      <div className="col-span-2 px-3 py-3 border-r border-border flex items-center group relative">
                        <span className="truncate text-foreground text-xs">{tp.name}</span>
                        <div className="absolute left-0 top-full z-50 hidden group-hover:block bg-popover border rounded-lg shadow-lg p-2 min-w-[200px] max-w-[300px]">
                          <span className="text-xs text-foreground whitespace-normal">{tp.name}</span>
                        </div>
                      </div>
                      {/* 场景来源 - Badge显示 */}
                      <div className="col-span-1 px-3 py-3 border-r border-border flex items-center justify-center">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[10px] px-1.5",
                            tp.source === "UserStory" && "bg-amber-500/10 text-amber-600 border-amber-200",
                            tp.source === "FSD" && "bg-blue-500/10 text-blue-600 border-blue-200",
                            tp.source === "TSD" && "bg-emerald-500/10 text-emerald-600 border-emerald-200",
                            tp.source === "PRD" && "bg-purple-500/10 text-purple-600 border-purple-200"
                          )}
                        >
                          {tp.source}
                        </Badge>
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
                        <div className="flex items-center gap-1">
                          {/* 智能审查结果差异提示 */}
                          {tp.aiSuggestion && tp.aiSuggestion !== tp.reviewResult && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="w-3.5 h-3.5 text-amber-500 cursor-help flex-shrink-0" />
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-[250px]">
                                  <p className="text-xs">
                                    智能审查结果已被人工修改：
                                    <span className={cn("font-medium", reviewResultConfig[tp.aiSuggestion].className)}>
                                      {reviewResultConfig[tp.aiSuggestion].label}
                                    </span>
                                    {" → "}
                                    <span className={cn("font-medium", resultConfig.className)}>
                                      {resultConfig.label}
                                    </span>
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
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
                      </div>
                      {/* 分类 - 采纳时显示-，否则下拉选择 */}
                      <div className="col-span-2 px-2 py-1 border-r border-border flex items-center justify-center">
                        {tp.reviewResult === "adopted" ? (
                          <span className="text-xs text-muted-foreground">-</span>
                        ) : (
                          <Select
                            value={tp.category || ""}
                            onValueChange={(value) => handleFieldChange(dimension.id, tp.id, "category", value)}
                          >
                            <SelectTrigger className="h-8 text-xs border-0 bg-transparent focus:ring-1">
                              <SelectValue placeholder="请选择分类..." />
                            </SelectTrigger>
                            <SelectContent>
                              {categoryOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value} className="text-xs">
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                      {/* 处理方案 - 采纳时显示-，否则可编辑 */}
                      <div className="col-span-2 px-2 py-1 border-r border-border flex items-center justify-center">
                        {tp.reviewResult === "adopted" ? (
                          <span className="text-xs text-muted-foreground">-</span>
                        ) : (
                          <Input
                            className="h-8 text-xs border-0 bg-transparent focus-visible:ring-1"
                            placeholder="请输入处理方案..."
                            value={tp.solution || ""}
                            onChange={(e) => handleFieldChange(dimension.id, tp.id, "solution", e.target.value)}
                          />
                        )}
                      </div>
                      {/* 审查记录 - 显示最新记录，hover显示完整历史 */}
                      <div className="col-span-2 px-2 py-1 flex items-center group relative">
                        <span className="text-xs text-muted-foreground truncate">
                          {tp.reviewHistory && tp.reviewHistory.length > 0 
                            ? `${tp.reviewHistory[tp.reviewHistory.length - 1].timestamp} ${tp.reviewHistory[tp.reviewHistory.length - 1].action}`
                            : "-"
                          }
                        </span>
                        {tp.reviewHistory && tp.reviewHistory.length > 0 && (
                          <div className="absolute left-0 top-full z-50 hidden group-hover:block bg-popover border rounded-lg shadow-lg p-3 min-w-[280px] max-w-[400px]">
                            <div className="text-xs font-medium mb-2 text-foreground">审查记录</div>
                            <div className="space-y-1.5">
                              {tp.reviewHistory.map((record, idx) => (
                                <div key={idx} className="text-xs text-muted-foreground whitespace-normal">
                                  {record.timestamp} {record.action}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {dimension.testPoints.length === 0 && (
                  <div className="col-span-12 px-3 py-6 text-center text-muted-foreground">
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

      <CaseDetailSidebar
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        caseData={sidebarCaseData}
      />
    </div>
  );
}
