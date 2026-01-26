import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Search, Sparkles, Tag } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
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
    label: "需丢弃",
    className: "text-red-600",
  },
  pending: {
    label: "待审查",
    className: "text-muted-foreground",
  },
};

const categoryOptions = [
  "完善场景",
  "完善信息",
  "完善数据",
  "重复",
  "非本功能",
  "逻辑错误",
];

export default function CaseReview() {
  const navigate = useNavigate();
  const { workspaceId, recordId, batchId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [dimensions, setDimensions] = useState(mockDimensions);
  
  // 对话框状态
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewingTestPoint, setReviewingTestPoint] = useState<{ dimId: string; tp: TestPoint } | null>(null);
  const [selectedResult, setSelectedResult] = useState<ReviewResult>("adopted");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [solution, setSolution] = useState("");
  const [remark, setRemark] = useState("");
  
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

  const handleNavigateToCaseList = (testPointId: string) => {
    navigate(`/workspace/${workspaceId}/management/ai-cases/${recordId}/batch/${batchId}/self-review/${testPointId}`);
  };

  const handleOpenReviewDialog = (dimId: string, tp: TestPoint) => {
    setReviewingTestPoint({ dimId, tp });
    setSelectedResult(tp.reviewResult === "pending" ? "adopted" : tp.reviewResult);
    setSelectedCategories(tp.category ? tp.category.split("/").filter(Boolean) : []);
    setSolution(tp.solution || "");
    setRemark(tp.remark || "");
    setReviewDialogOpen(true);
  };

  const handleConfirmReview = () => {
    if (reviewingTestPoint) {
      setDimensions(prev => prev.map(dim => {
        if (dim.id === reviewingTestPoint.dimId) {
          return {
            ...dim,
            testPoints: dim.testPoints.map(tp => {
              if (tp.id === reviewingTestPoint.tp.id) {
                return { 
                  ...tp, 
                  reviewResult: selectedResult,
                  category: selectedCategories.length > 0 ? selectedCategories.join("/") + "/" : undefined,
                  solution: solution || undefined,
                  remark: remark || undefined,
                };
              }
              return tp;
            })
          };
        }
        return dim;
      }));
      setReviewDialogOpen(false);
      toast.success("审查结果已保存");
    }
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) 
        ? prev.filter(c => c !== cat)
        : [...prev, cat]
    );
  };

  const handleOpenSidebar = (dimId: string, tp: TestPoint) => {
    setSidebarTestPoint({ dimId, tp });
    setSidebarOpen(true);
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
            onClick={() => navigate(`/workspace/${workspaceId}/management/ai-cases/${recordId}/batch/${batchId}/ai-review`)}
          >
            <Sparkles className="w-4 h-4" />
            智能审查
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
                  <div className="col-span-1 px-3 py-2 border-r border-[hsl(200,70%,60%)] flex items-center justify-center font-medium row-span-2">
                    序号
                  </div>
                  <div className="col-span-5 px-3 py-2 border-r border-[hsl(200,70%,60%)] text-center font-medium">
                    场景基本信息
                  </div>
                  <div className="col-span-6 px-3 py-2 text-center font-medium">
                    用户审查
                  </div>
                </div>
                {/* Second row - column headers */}
                <div className="grid grid-cols-12 text-sm bg-[hsl(200,65%,55%)]">
                  <div className="col-span-1 px-3 py-2 border-r border-[hsl(200,70%,60%)]"></div>
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
                {dimension.testPoints.map((tp, index) => {
                  const resultConfig = reviewResultConfig[tp.reviewResult];
                  
                  return (
                    <div
                      key={tp.id}
                      className="grid grid-cols-12 text-sm hover:bg-muted/30 transition-colors"
                    >
                      {/* 序号 */}
                      <div className="col-span-1 px-3 py-3 border-r border-border flex items-center justify-center text-muted-foreground">
                        {index + 1}
                      </div>
                      {/* 编号 */}
                      <div className="col-span-1 px-3 py-3 border-r border-border flex items-center justify-center">
                        <span className="font-mono text-xs">{tp.code}</span>
                      </div>
                      {/* 场景描述 - 可点击打开侧边栏 */}
                      <div 
                        className="col-span-2 px-3 py-3 border-r border-border flex items-center cursor-pointer text-primary hover:text-primary/80 hover:underline"
                        onClick={() => handleOpenSidebar(dimension.id, tp)}
                      >
                        <span className="truncate">{tp.name}</span>
                      </div>
                      {/* 场景来源 */}
                      <div className="col-span-1 px-3 py-3 border-r border-border flex items-center justify-center text-muted-foreground">
                        {tp.source}
                      </div>
                      {/* 对应案例数 - 可点击查看用例 */}
                      <div className="col-span-1 px-3 py-3 border-r border-border flex items-center justify-center">
                        <span 
                          className="text-primary hover:underline cursor-pointer"
                          onClick={() => handleNavigateToCaseList(tp.id)}
                        >
                          {tp.caseCount}
                        </span>
                      </div>
                      {/* 审查结果 - 可点击修改 */}
                      <div className="col-span-1 px-3 py-3 border-r border-border flex items-center justify-center">
                        <span 
                          className={cn("cursor-pointer hover:underline", resultConfig.className)}
                          onClick={() => handleOpenReviewDialog(dimension.id, tp)}
                        >
                          {resultConfig.label}
                        </span>
                      </div>
                      {/* 分类 */}
                      <div className="col-span-2 px-3 py-3 border-r border-border flex items-center text-muted-foreground text-xs">
                        {tp.category || "-"}
                      </div>
                      {/* 处理方案 */}
                      <div className="col-span-2 px-3 py-3 border-r border-border flex items-center text-muted-foreground text-xs">
                        {tp.solution || "-"}
                      </div>
                      {/* 备注 */}
                      <div className="col-span-1 px-3 py-3 flex items-center text-muted-foreground text-xs">
                        {tp.remark || "-"}
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

      {/* 审查对话框 */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>审查结果</DialogTitle>
          </DialogHeader>
          {reviewingTestPoint && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-sm font-medium">{reviewingTestPoint.tp.name}</div>
                <div className="text-xs text-muted-foreground mt-1">编号: {reviewingTestPoint.tp.code}</div>
              </div>
              
              <div className="space-y-2">
                <Label>审查结果 <span className="text-red-500">*</span></Label>
                <div className="flex flex-wrap gap-2">
                  {(["adopted", "needsImprovement", "needsDiscard"] as ReviewResult[]).map((result) => {
                    const config = reviewResultConfig[result];
                    return (
                      <Badge
                        key={result}
                        variant={selectedResult === result ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer transition-colors",
                          selectedResult === result 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted"
                        )}
                        onClick={() => setSelectedResult(result)}
                      >
                        {config.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>
              
              {(selectedResult === "needsImprovement" || selectedResult === "needsDiscard") && (
                <div className="space-y-2">
                  <Label>分类</Label>
                  <div className="flex flex-wrap gap-2">
                    {categoryOptions.map((cat) => (
                      <Badge
                        key={cat}
                        variant={selectedCategories.includes(cat) ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer transition-colors",
                          selectedCategories.includes(cat) 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted"
                        )}
                        onClick={() => toggleCategory(cat)}
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="solution">处理方案</Label>
                <Textarea
                  id="solution"
                  placeholder="请输入处理方案..."
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="remark">备注</Label>
                <Textarea
                  id="remark"
                  placeholder="请输入备注..."
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  className="min-h-[60px]"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleConfirmReview}>
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 场景详情侧边栏 */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent className="w-[480px] sm:max-w-[480px] flex flex-col">
          <SheetHeader>
            <SheetTitle>场景详情</SheetTitle>
          </SheetHeader>
          
          {sidebarTestPoint && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-6 py-4">
                  {/* 基本信息 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">编号</Label>
                      <p className="text-sm font-mono">{sidebarTestPoint.tp.code}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">场景来源</Label>
                      <p className="text-sm">{sidebarTestPoint.tp.source}</p>
                    </div>
                  </div>
                  
                  {/* 场景描述 */}
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs">场景描述</Label>
                    <Textarea
                      value={sidebarTestPoint.tp.name}
                      onChange={(e) => {
                        const newName = e.target.value;
                        setDimensions(prev => prev.map(dim => {
                          if (dim.id === sidebarTestPoint.dimId) {
                            return {
                              ...dim,
                              testPoints: dim.testPoints.map(tp => {
                                if (tp.id === sidebarTestPoint.tp.id) {
                                  return { ...tp, name: newName };
                                }
                                return tp;
                              })
                            };
                          }
                          return dim;
                        }));
                        setSidebarTestPoint(prev => prev ? {
                          ...prev,
                          tp: { ...prev.tp, name: newName }
                        } : null);
                      }}
                      className="min-h-[80px] text-sm"
                      placeholder="请输入场景描述..."
                    />
                  </div>
                  
                  {/* 审查状态 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">审查结果</Label>
                      <p className={cn("text-sm font-medium", reviewResultConfig[sidebarTestPoint.tp.reviewResult].className)}>
                        {reviewResultConfig[sidebarTestPoint.tp.reviewResult].label}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">对应案例数</Label>
                      <p 
                        className="text-sm text-primary cursor-pointer hover:underline"
                        onClick={() => {
                          handleNavigateToCaseList(sidebarTestPoint.tp.id);
                          setSidebarOpen(false);
                        }}
                      >
                        {sidebarTestPoint.tp.caseCount}
                      </p>
                    </div>
                  </div>
                  
                  {sidebarTestPoint.tp.category && (
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">分类</Label>
                      <p className="text-sm">{sidebarTestPoint.tp.category}</p>
                    </div>
                  )}
                  
                  {sidebarTestPoint.tp.solution && (
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">处理方案</Label>
                      <p className="text-sm">{sidebarTestPoint.tp.solution}</p>
                    </div>
                  )}
                  
                  {/* 场景来源详情 */}
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs">来源详情</Label>
                    <CaseSourceInfo caseId={sidebarTestPoint.tp.id} showHeader={false} />
                  </div>
                </div>
              </ScrollArea>
              
              <SheetFooter className="pt-4 border-t mt-auto">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    handleOpenReviewDialog(sidebarTestPoint.dimId, sidebarTestPoint.tp);
                    setSidebarOpen(false);
                  }}
                >
                  修改审查结果
                </Button>
              </SheetFooter>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
