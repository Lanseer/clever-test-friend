import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Search, Sparkles, Layers, Target, ChevronRight, ChevronDown, ThumbsUp, ThumbsDown, Eye, Tag } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CaseSourceInfo } from "@/components/workspace/CaseSourceInfo";
import { toast } from "sonner";

type AIScore = "excellent" | "qualified" | "unqualified";
type AdoptionStatus = "adopted" | "notAdopted" | "pending";

interface TestPoint {
  id: string;
  name: string;
  total: number;
  passed: number;
  aiScore: AIScore;
  adoptionStatus: AdoptionStatus;
  rejectionTags?: string[];
  rejectionReason?: string;
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
    passed: 38,
    testPoints: [
      { id: "tp-1", name: "用户登录", total: 15, passed: 12, aiScore: "excellent", adoptionStatus: "pending" },
      { id: "tp-2", name: "用户注册", total: 18, passed: 16, aiScore: "qualified", adoptionStatus: "adopted" },
      { id: "tp-3", name: "密码重置", total: 12, passed: 10, aiScore: "unqualified", adoptionStatus: "notAdopted", rejectionTags: ["覆盖不完整", "步骤缺失"], rejectionReason: "测试步骤不够详细，缺少边界条件测试" },
    ],
  },
  {
    id: "dim-2",
    name: "订单管理",
    description: "订单创建、支付、退款流程测试",
    total: 62,
    passed: 55,
    testPoints: [
      { id: "tp-4", name: "订单创建", total: 22, passed: 20, aiScore: "excellent", adoptionStatus: "adopted" },
      { id: "tp-5", name: "订单支付", total: 25, passed: 22, aiScore: "qualified", adoptionStatus: "pending" },
      { id: "tp-6", name: "订单退款", total: 15, passed: 13, aiScore: "qualified", adoptionStatus: "pending" },
    ],
  },
  {
    id: "dim-3",
    name: "商品管理",
    description: "商品上架、编辑、库存管理测试",
    total: 38,
    passed: 32,
    testPoints: [
      { id: "tp-7", name: "商品上架", total: 14, passed: 12, aiScore: "excellent", adoptionStatus: "adopted" },
      { id: "tp-8", name: "商品编辑", total: 12, passed: 10, aiScore: "unqualified", adoptionStatus: "notAdopted", rejectionTags: ["逻辑错误"], rejectionReason: "编辑场景测试逻辑有误" },
      { id: "tp-9", name: "库存管理", total: 12, passed: 10, aiScore: "qualified", adoptionStatus: "pending" },
    ],
  },
  {
    id: "dim-4",
    name: "报表统计",
    description: "数据报表、导出功能测试",
    total: 25,
    passed: 22,
    testPoints: [
      { id: "tp-10", name: "销售报表", total: 10, passed: 9, aiScore: "excellent", adoptionStatus: "adopted" },
      { id: "tp-11", name: "数据导出", total: 15, passed: 13, aiScore: "qualified", adoptionStatus: "pending" },
    ],
  },
];

const aiScoreConfig: Record<AIScore, { label: string; className: string }> = {
  excellent: {
    label: "优秀",
    className: "text-green-600",
  },
  qualified: {
    label: "合格",
    className: "text-blue-600",
  },
  unqualified: {
    label: "不合格",
    className: "text-red-600",
  },
};

const adoptionStatusConfig: Record<AdoptionStatus, { label: string; className: string }> = {
  adopted: {
    label: "采纳",
    className: "text-green-600",
  },
  notAdopted: {
    label: "不采纳",
    className: "text-red-600",
  },
  pending: {
    label: "待自评",
    className: "text-amber-600",
  },
};

const rejectionTagOptions = [
  "覆盖不完整",
  "步骤缺失",
  "逻辑错误",
  "描述不清",
  "重复用例",
  "优先级不当",
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
function SimpleMiniStats({ total, passed }: { total: number; passed: number }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-green-600 font-medium">{passed}</span>
      <span className="text-muted-foreground">/</span>
      <span className="text-muted-foreground">{total}</span>
    </div>
  );
}

export default function CaseReview() {
  const navigate = useNavigate();
  const { workspaceId, recordId, batchId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [dimensions, setDimensions] = useState(mockDimensions);
  const [expandedDimensions, setExpandedDimensions] = useState<Set<string>>(
    new Set(mockDimensions.map((d) => d.id))
  );
  
  // 不采纳对话框状态
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingTestPoint, setRejectingTestPoint] = useState<{ dimId: string; tpId: string } | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [rejectionReason, setRejectionReason] = useState("");
  
  // 查看状态对话框
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [viewingTestPoint, setViewingTestPoint] = useState<TestPoint | null>(null);
  
  // 侧边栏状态
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTestPoint, setSidebarTestPoint] = useState<{ dimId: string; testPoint: TestPoint } | null>(null);

  const totalStats = calculateTotalStats(dimensions);
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
  const filteredDimensions = dimensions
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

  const handleNavigateToCaseList = (testPointId: string) => {
    navigate(`/workspace/${workspaceId}/management/ai-cases/${recordId}/batch/${batchId}/self-review/${testPointId}`);
  };

  const handleAdopt = (dimId: string, tpId: string) => {
    setDimensions(prev => prev.map(dim => {
      if (dim.id === dimId) {
        return {
          ...dim,
          testPoints: dim.testPoints.map(tp => {
            if (tp.id === tpId) {
              return { ...tp, adoptionStatus: "adopted" as AdoptionStatus };
            }
            return tp;
          })
        };
      }
      return dim;
    }));
    toast.success("已采纳");
  };

  const handleOpenRejectDialog = (dimId: string, tpId: string) => {
    setRejectingTestPoint({ dimId, tpId });
    setSelectedTags([]);
    setRejectionReason("");
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = () => {
    if (rejectingTestPoint && selectedTags.length > 0 && rejectionReason.trim()) {
      setDimensions(prev => prev.map(dim => {
        if (dim.id === rejectingTestPoint.dimId) {
          return {
            ...dim,
            testPoints: dim.testPoints.map(tp => {
              if (tp.id === rejectingTestPoint.tpId) {
                return { 
                  ...tp, 
                  adoptionStatus: "notAdopted" as AdoptionStatus,
                  rejectionTags: selectedTags,
                  rejectionReason: rejectionReason
                };
              }
              return tp;
            })
          };
        }
        return dim;
      }));
      setRejectDialogOpen(false);
      toast.success("已标记为不采纳");
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleViewStatus = (testPoint: TestPoint) => {
    if (testPoint.adoptionStatus !== "pending") {
      setViewingTestPoint(testPoint);
      setStatusDialogOpen(true);
    }
  };

  const handleOpenSidebar = (dimId: string, testPoint: TestPoint) => {
    setSidebarTestPoint({ dimId, testPoint });
    setSidebarOpen(true);
  };

  const handleSidebarAdopt = () => {
    if (sidebarTestPoint) {
      handleAdopt(sidebarTestPoint.dimId, sidebarTestPoint.testPoint.id);
      setSidebarOpen(false);
    }
  };

  const handleSidebarReject = () => {
    if (sidebarTestPoint) {
      handleOpenRejectDialog(sidebarTestPoint.dimId, sidebarTestPoint.testPoint.id);
      setSidebarOpen(false);
    }
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
          <h1 className="text-2xl font-bold text-foreground">用例自评</h1>
          <p className="text-muted-foreground mt-1">
            生成记录: AI-001 · 共 {totalStats.total} 个用例，{pendingCount} 个待评审
          </p>
        </div>
      </div>

      {/* Search and Actions */}
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

      {/* Stats - 只保留自评统计 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold">{totalStats.total}</div>
          <div className="text-sm text-muted-foreground">总用例数</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
          <div className="text-sm text-muted-foreground">待评审</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{totalStats.passed}</div>
          <div className="text-sm text-muted-foreground">已通过</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">{totalStats.total - totalStats.passed}</div>
          <div className="text-sm text-muted-foreground">不通过</div>
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
                  <div className="flex items-center gap-2 text-sm flex-shrink-0">
                    <span className="text-green-600 font-medium">{dimension.passed}</span>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-muted-foreground">{dimension.total}</span>
                  </div>
                </div>

                {/* Test Points */}
                {isExpanded && dimension.testPoints.map((testPoint) => {
                  const aiScore = aiScoreConfig[testPoint.aiScore];
                  const adoptionStatus = adoptionStatusConfig[testPoint.adoptionStatus];
                  
                  return (
                    <div
                      key={testPoint.id}
                      className="flex items-center gap-3 px-6 py-3 pl-16 hover:bg-muted/20 transition-colors border-t border-muted/50"
                    >
                      <div className="w-6 h-6 rounded bg-secondary/50 flex items-center justify-center flex-shrink-0">
                        <Target className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      
                      {/* 左侧文字区域 - 最多占一半宽度，可点击打开侧边栏 */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className="max-w-[50%] min-w-0 cursor-pointer text-primary hover:text-primary/80 hover:underline transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenSidebar(dimension.id, testPoint);
                              }}
                            >
                              <span className="text-sm truncate block">
                                {testPoint.name}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-sm">
                            <p>{testPoint.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <div className="flex-1" />
                      
                      {/* 智能评分和采纳状态 - 无背景无图标纯文字 */}
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <span className={cn("text-xs whitespace-nowrap", aiScore.className)}>
                          {aiScore.label}
                        </span>
                        
                        <span 
                          className={cn(
                            "text-xs whitespace-nowrap cursor-pointer hover:underline",
                            adoptionStatus.className
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewStatus(testPoint);
                          }}
                        >
                          {adoptionStatus.label}
                        </span>
                      </div>
                      
                      {/* 操作按钮区域 - 只保留图标，始终可点击 */}
                      <div className="flex items-center gap-1 ml-8 flex-shrink-0">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  "h-7 w-7",
                                  testPoint.adoptionStatus === "adopted" 
                                    ? "text-green-600 bg-green-50" 
                                    : "text-green-600 hover:text-green-700 hover:bg-green-50"
                                )}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAdopt(dimension.id, testPoint.id);
                                }}
                              >
                                <ThumbsUp className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>采纳</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  "h-7 w-7",
                                  testPoint.adoptionStatus === "notAdopted" 
                                    ? "text-red-600 bg-red-50" 
                                    : "text-red-600 hover:text-red-700 hover:bg-red-50"
                                )}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenRejectDialog(dimension.id, testPoint.id);
                                }}
                              >
                                <ThumbsDown className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>不采纳</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNavigateToCaseList(testPoint.id);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>查看用例</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  );
                })}
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

      {/* 不采纳对话框 */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>填写不采纳信息</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>选择标签 <span className="text-red-500">*</span></Label>
              <div className="flex flex-wrap gap-2">
                {rejectionTagOptions.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-colors",
                      selectedTags.includes(tag) 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted"
                    )}
                    onClick={() => toggleTag(tag)}
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">不采纳原因 <span className="text-red-500">*</span></Label>
              <Textarea
                id="reason"
                placeholder="请输入不采纳的具体原因..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              取消
            </Button>
            <Button 
              onClick={handleConfirmReject}
              disabled={selectedTags.length === 0 || !rejectionReason.trim()}
            >
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 查看状态对话框 */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {viewingTestPoint?.adoptionStatus === "adopted" ? "采纳详情" : "不采纳详情"}
            </DialogTitle>
          </DialogHeader>
          {viewingTestPoint && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{viewingTestPoint.name}</span>
              </div>
              
              {viewingTestPoint.adoptionStatus === "adopted" ? (
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <ThumbsUp className="w-4 h-4" />
                    <span className="font-medium">已采纳</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">不采纳标签</Label>
                    <div className="flex flex-wrap gap-1">
                      {viewingTestPoint.rejectionTags?.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">不采纳原因</Label>
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                      <p className="text-sm text-red-700 dark:text-red-400">
                        {viewingTestPoint.rejectionReason}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 测试点详情侧边栏 */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent className="w-[480px] sm:max-w-[480px] flex flex-col">
          <SheetHeader>
            <SheetTitle>场景详情</SheetTitle>
          </SheetHeader>
          
          {sidebarTestPoint && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-6 py-4">
                  {/* 场景名称 - 可编辑文本域 */}
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs">场景名称</Label>
                    <Textarea
                      value={sidebarTestPoint.testPoint.name}
                      onChange={(e) => {
                        const newName = e.target.value;
                        setDimensions(prev => prev.map(dim => {
                          if (dim.id === sidebarTestPoint.dimId) {
                            return {
                              ...dim,
                              testPoints: dim.testPoints.map(tp => {
                                if (tp.id === sidebarTestPoint.testPoint.id) {
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
                          testPoint: { ...prev.testPoint, name: newName }
                        } : null);
                      }}
                      className="min-h-[80px] text-sm"
                      placeholder="请输入场景名称..."
                    />
                  </div>
                  
                  {/* 状态信息 */}
                  <div className="flex items-center gap-6">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">智能评分</Label>
                      <p className={cn("text-sm font-medium", aiScoreConfig[sidebarTestPoint.testPoint.aiScore].className)}>
                        {aiScoreConfig[sidebarTestPoint.testPoint.aiScore].label}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">采纳状态</Label>
                      <p className={cn("text-sm font-medium", adoptionStatusConfig[sidebarTestPoint.testPoint.adoptionStatus].className)}>
                        {adoptionStatusConfig[sidebarTestPoint.testPoint.adoptionStatus].label}
                      </p>
                    </div>
                  </div>
                  
                  {/* 场景来源 */}
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs">场景来源</Label>
                    <CaseSourceInfo caseId={sidebarTestPoint.testPoint.id} showHeader={false} />
                  </div>
                </div>
              </ScrollArea>
              
              <SheetFooter className="pt-4 border-t mt-auto">
                <div className="flex items-center gap-2 w-full">
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1",
                      sidebarTestPoint.testPoint.adoptionStatus === "notAdopted"
                        ? "text-red-600 bg-red-50 border-red-200"
                        : "text-red-600 hover:text-red-700 hover:bg-red-50"
                    )}
                    onClick={handleSidebarReject}
                  >
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    不采纳
                  </Button>
                  <Button
                    className={cn(
                      "flex-1",
                      sidebarTestPoint.testPoint.adoptionStatus === "adopted"
                        ? "bg-primary"
                        : ""
                    )}
                    onClick={handleSidebarAdopt}
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    采纳
                  </Button>
                </div>
              </SheetFooter>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
