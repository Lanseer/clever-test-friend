import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Search, Sparkles, Loader2, ChevronDown, Check, Info, ChevronRight, Plus, Save, FileText, ChevronUp, MessageCircle } from "lucide-react";
import { CaseReviewChatPanel } from "@/components/workspace/CaseReviewChatPanel";
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
import { ReviewHistorySidebar, ReviewHistoryData } from "@/components/workspace/ReviewHistorySidebar";
import { ReferenceMaterialsSidebar, ReferenceMaterial } from "@/components/workspace/ReferenceMaterialsSidebar";
import { SaveToTaskDialog } from "@/components/workspace/SaveToTaskDialog";
import { CreateSmartDesignTaskDialog } from "@/components/workspace/CreateSmartDesignTaskDialog";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// 参考资料 Mock 数据
const mockReferenceMaterials: ReferenceMaterial[] = [
  {
    id: "ref-1",
    name: "用户登录功能规格说明书 v2.1",
    type: "基线文档",
    content: `1. 功能概述
用户登录功能是系统的核心入口，负责验证用户身份并建立会话。

2. 功能需求
2.1 账号密码登录
- 用户输入账号（手机号/邮箱/用户名）和密码
- 系统验证账号密码是否匹配
- 登录成功后跳转至首页

2.2 验证码登录
- 用户输入手机号，获取短信验证码
- 系统验证验证码有效性
- 登录成功后跳转至首页

3. 安全要求
- 密码需进行加密传输
- 连续5次登录失败需锁定账号30分钟
- 验证码有效期为5分钟`,
  },
  {
    id: "ref-2",
    name: "GB/T 25000.51-2016 软件测试规范",
    type: "行业标准",
    content: `1. 范围
本标准规定了软件测试的基本要求、测试类型、测试过程和测试文档要求。

2. 术语和定义
2.1 测试用例：为特定目标而编制的一组测试输入、执行条件和预期结果
2.2 测试覆盖：测试所覆盖的软件需求或代码的程度

3. 测试类型
3.1 功能测试
3.2 性能测试
3.3 安全测试
3.4 兼容性测试

4. 测试用例设计方法
4.1 等价类划分法
4.2 边界值分析法
4.3 决策表法
4.4 状态转换法`,
  },
  {
    id: "ref-3",
    name: "账户开户业务需求文档 PRD v1.5",
    type: "需求文档",
    content: `1. 业务背景
为提升用户开户体验，需要优化现有开户流程。

2. 业务流程
2.1 身份验证
- 用户填写基本信息
- 上传身份证正反面
- 人脸识别验证

2.2 账户信息填写
- 设置交易密码
- 绑定银行卡
- 签署协议

2.3 审核流程
- 系统自动审核
- 人工复核（必要时）

3. 业务规则
- 同一身份证只能开设一个账户
- 年龄需满18周岁
- 银行卡需为本人名下`,
  },
  {
    id: "ref-4",
    name: "自动化测试规范 v3.0",
    type: "测试规范",
    content: `1. 测试框架选型
推荐使用 Selenium/Playwright 进行UI自动化测试

2. 用例编写规范
2.1 用例命名：test_模块_功能_场景
2.2 断言要求：每个用例至少包含一个断言
2.3 数据隔离：测试数据需独立，避免相互影响

3. 执行策略
3.1 冒烟测试：每次提交触发
3.2 回归测试：每日定时执行
3.3 全量测试：发版前执行`,
  },
  {
    id: "ref-5",
    name: "用户服务接口文档 API v2.0",
    type: "接口文档",
    content: `1. 登录接口
POST /api/v1/auth/login
请求参数：
- username: 用户名
- password: 密码（MD5加密）

响应：
{
  "code": 200,
  "data": {
    "token": "xxx",
    "userId": "123"
  }
}

2. 注册接口
POST /api/v1/auth/register
请求参数：
- phone: 手机号
- password: 密码
- verifyCode: 验证码`,
  },
];

// 分类选项
const categoryOptions = [
  { value: "完善场景", label: "完善场景" },
  { value: "完善信息", label: "完善信息" },
  { value: "完善数据", label: "完善数据" },
  { value: "重复", label: "重复" },
  { value: "非本功能", label: "非本功能" },
  { value: "其他", label: "其他" },
];

// 场景分类选项
const scenarioCategoryOptions = [
  { value: "功能测试", label: "功能测试" },
  { value: "边界测试", label: "边界测试" },
  { value: "异常测试", label: "异常测试" },
  { value: "性能测试", label: "性能测试" },
  { value: "安全测试", label: "安全测试" },
  { value: "兼容性测试", label: "兼容性测试" },
];

 type ReviewResult = "adopted" | "needsImprovement" | "improved" | "needsDiscard" | "pending" | "focusReview";
 type ComparisonStatus = "new" | "updated" | "deleted" | "unchanged";

interface ReviewHistoryItem {
  timestamp: string;
  action: string;
}

interface TestPoint {
  id: string;
  code: string;
  name: string;
  scenarioCategory?: string;
  source: string;
  caseCount: number;
  reviewResult: ReviewResult;
  aiSuggestion?: ReviewResult; // 智能审查建议结果
  category?: string;
  solution?: string;
  reviewHistory: ReviewHistoryItem[];
  comparisonStatus?: ComparisonStatus; // 对比状态
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
       { id: "tp-1", code: "SC-001", name: "用户登录成功场景", scenarioCategory: "功能测试", source: "UserStory, FSD", caseCount: 12, reviewResult: "pending", comparisonStatus: "unchanged", reviewHistory: [] },
       { id: "tp-2", code: "SC-002", name: "用户注册完整流程", scenarioCategory: "功能测试", source: "FSD", caseCount: 18, reviewResult: "pending", comparisonStatus: "new", reviewHistory: [] },
       { id: "tp-3", code: "SC-003", name: "密码重置异常处理", scenarioCategory: "异常测试", source: "TSD, PRD", caseCount: 8, reviewResult: "pending", comparisonStatus: "updated", reviewHistory: [] },
       { id: "tp-4", code: "SC-004", name: "多因素认证验证", scenarioCategory: "安全测试", source: "PRD", caseCount: 5, reviewResult: "pending", comparisonStatus: "deleted", reviewHistory: [] },
    ],
  },
  {
    id: "dim-2",
    name: "02-业务功能维度",
    testPoints: [
       { id: "tp-5", code: "SC-005", name: "订单创建标准流程", scenarioCategory: "功能测试", source: "UserStory", caseCount: 22, reviewResult: "pending", comparisonStatus: "unchanged", reviewHistory: [] },
      { id: "tp-6", code: "SC-006", name: "订单支付异常处理", scenarioCategory: "异常测试", source: "FSD", caseCount: 15, reviewResult: "pending", comparisonStatus: "new", reviewHistory: [] },
    ],
  },
  {
    id: "dim-3",
    name: "03-业务要素维度",
    testPoints: [
       { id: "tp-7", code: "SC-007", name: "商品信息完整性校验", scenarioCategory: "功能测试", source: "TSD", caseCount: 14, reviewResult: "pending", comparisonStatus: "updated", reviewHistory: [] },
      { id: "tp-8", code: "SC-008", name: "库存数量边界测试", scenarioCategory: "边界测试", source: "PRD", caseCount: 10, reviewResult: "pending", comparisonStatus: "unchanged", reviewHistory: [] },
    ],
  },
];

const comparisonStatusConfig: Record<ComparisonStatus, { label: string; className: string; scenarioClassName: string }> = {
  new: {
    label: "新增",
    className: "bg-green-500/10 text-green-600 border-green-200",
    scenarioClassName: "text-green-600",
  },
  updated: {
    label: "更新",
    className: "bg-blue-500/10 text-blue-600 border-blue-200",
    scenarioClassName: "text-blue-600",
  },
  deleted: {
    label: "删除",
    className: "bg-red-500/10 text-red-600 border-red-200",
    scenarioClassName: "text-red-500 line-through",
  },
  unchanged: {
    label: "-",
    className: "text-muted-foreground",
    scenarioClassName: "text-foreground",
  },
};

const reviewResultConfig: Record<ReviewResult, { label: string; className: string }> = {
  adopted: {
    label: "采纳",
    className: "text-green-600",
  },
  needsImprovement: {
    label: "需完善",
    className: "text-amber-600",
  },
  improved: {
    label: "已完善",
    className: "text-blue-600",
  },
  needsDiscard: {
    label: "丢弃",
    className: "text-red-600",
  },
  pending: {
    label: "待审查",
    className: "text-muted-foreground",
  },
 focusReview: {
   label: "重点审查",
   className: "text-amber-600",
 },
};

export default function CaseReview() {
  const navigate = useNavigate();
  const { workspaceId, recordId, batchId } = useParams();
  const [searchParams] = useSearchParams();
  
  // 检测来源
  const source = searchParams.get("source"); // "chat" 或 "deliverable"
  const deliverableName = searchParams.get("deliverable") ? decodeURIComponent(searchParams.get("deliverable")!) : null;
  const baseVersion = searchParams.get("baseVersion") ? decodeURIComponent(searchParams.get("baseVersion")!) : null;
  const isFromChat = source === "chat";
  const isFromDeliverable = source === "deliverable" && deliverableName;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [dimensions, setDimensions] = useState(mockDimensions);
  
  // 从URL获取筛选参数
  const urlFilterResult = searchParams.get("filterResult");
  const urlFilterCategory = searchParams.get("filterCategory");
  
  // 筛选状态 - 初始化时读取URL参数
  const [filterResult, setFilterResult] = useState<string>(urlFilterResult || "all");
  const [filterCategory, setFilterCategory] = useState<string>(urlFilterCategory ? decodeURIComponent(urlFilterCategory) : "all");
  
  // 维度折叠状态
  const [collapsedDimensions, setCollapsedDimensions] = useState<Set<string>>(new Set());
  
  // 智能审查状态
  const [isSmartReviewing, setIsSmartReviewing] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Map<string, ReviewResult>>(new Map());
  
  // 保存任务选择弹窗
  const [saveToTaskDialogOpen, setSaveToTaskDialogOpen] = useState(false);
  const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false);
  
  // Mock task data for display
  const mockTasksData = [
    { id: "1", name: "用户登录模块测试", testPhase: "SIT测试", testCategory: "功能测试" },
    { id: "2", name: "支付流程测试", testPhase: "UAT测试", testCategory: "功能测试" },
  ];
  
  // 保存处理
  const handleSave = () => {
    setSaveToTaskDialogOpen(true);
  };
  
  const handleSaveToTask = (taskId: string, caseName: string) => {
    const task = mockTasksData.find(t => t.id === taskId);
    toast.success(`"${caseName}" 已成功保存到测试任务：${task?.name || "未知任务"}`);
    
    // 计算待审查数量
    const pendingCount = dimensions.reduce((sum, dim) => sum + dim.testPoints.filter(tp => tp.reviewResult === "pending").length, 0);
    
    // 构建审查总结数据并跳转回智能对话页面
    const reviewSummary = {
      caseName,
      totalScenarios: statistics.totalScenarios,
      adopted: statistics.adopted,
      needsImprovement: statistics.needsImprovement,
      improved: statistics.improved,
      discarded: statistics.needsDiscard,
      pending: pendingCount,
    };
    
    // Navigate back to smart design page with review summary
    navigate(`/workspace/${workspaceId}/management/ai-cases?reviewSummary=${encodeURIComponent(JSON.stringify(reviewSummary))}`);
  };
  
  // Generate default case name
  const generateDefaultCaseName = () => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return `${dateStr}用户模块测试案例_V1.0`;
  };
  
  const handleCreateTask = (data: { name: string; testPhase: string; testCategory: string; tags: string[] }) => {
    toast.success(`任务 "${data.name}" 创建成功，请重新选择保存`);
    setCreateTaskDialogOpen(false);
    setSaveToTaskDialogOpen(true);
  };

  // 统计数据计算
  const statistics = {
    totalScenarios: dimensions.reduce((sum, dim) => sum + dim.testPoints.length, 0),
    totalCases: dimensions.reduce((sum, dim) => sum + dim.testPoints.reduce((s, tp) => s + tp.caseCount, 0), 0),
    adopted: dimensions.reduce((sum, dim) => sum + dim.testPoints.filter(tp => tp.reviewResult === "adopted").length, 0),
    needsImprovement: dimensions.reduce((sum, dim) => sum + dim.testPoints.filter(tp => tp.reviewResult === "needsImprovement").length, 0),
    improved: dimensions.reduce((sum, dim) => sum + dim.testPoints.filter(tp => tp.reviewResult === "improved").length, 0),
    needsDiscard: dimensions.reduce((sum, dim) => sum + dim.testPoints.filter(tp => tp.reviewResult === "needsDiscard").length, 0),
     focusReview: dimensions.reduce((sum, dim) => sum + dim.testPoints.filter(tp => tp.reviewResult === "focusReview").length, 0),
     pending: dimensions.reduce((sum, dim) => sum + dim.testPoints.filter(tp => tp.reviewResult === "pending").length, 0),
  };
  
  // 侧边栏状态
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCaseData, setSidebarCaseData] = useState<CaseDetailData | null>(null);
  
  // 审查记录侧边栏状态
  const [historySidebarOpen, setHistorySidebarOpen] = useState(false);
  const [historyData, setHistoryData] = useState<ReviewHistoryData | null>(null);
  
  // 参考资料侧边栏状态
  const [referenceMaterialsOpen, setReferenceMaterialsOpen] = useState(false);
  const [referenceSidebarOpen, setReferenceSidebarOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<ReferenceMaterial | null>(null);
  
  // 对话面板状态
  const [chatPanelOpen, setChatPanelOpen] = useState(false);
  
  const handleOpenMaterial = (material: ReferenceMaterial) => {
    setSelectedMaterial(material);
    setReferenceSidebarOpen(true);
  };

  // 切换维度折叠状态
  const toggleDimensionCollapse = (dimId: string) => {
    setCollapsedDimensions(prev => {
      const next = new Set(prev);
      if (next.has(dimId)) {
        next.delete(dimId);
      } else {
        next.add(dimId);
      }
      return next;
    });
  };

  // 新增场景
  const handleAddScenario = (dimId: string) => {
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const dim = dimensions.find(d => d.id === dimId);
    if (!dim) return;
    
    const newCode = `SC-${String(dim.testPoints.length + 1).padStart(3, '0')}`;
    const newTestPoint: TestPoint = {
      id: `tp-${Date.now()}`,
      code: newCode,
      name: "新场景",
      source: "UserStory",
      caseCount: 0,
      reviewResult: "pending",
      reviewHistory: [{ timestamp, action: "新增场景" }],
    };
    
    setDimensions(prev => prev.map(d => {
      if (d.id === dimId) {
        return { ...d, testPoints: [...d.testPoints, newTestPoint] };
      }
      return d;
    }));
    toast.success("已新增场景");
  };

  // 过滤维度和测试点
  const filteredDimensions = dimensions
    .map((dim) => ({
      ...dim,
      testPoints: dim.testPoints.filter((tp) => {
        const matchesSearch = tp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tp.code.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesResult = filterResult === "all" || tp.reviewResult === filterResult;
        const matchesCategory = filterCategory === "all" || tp.category === filterCategory;
        return matchesSearch && matchesResult && matchesCategory;
      }),
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

  const handleFieldChange = (dimId: string, tpId: string, field: "category" | "solution" | "scenarioCategory", value: string) => {
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
       const focusReviewSuggestions = [
         "非本需求，请详细查看本体来源",
         "场景描述与需求文档不符，请核实",
         "测试数据边界条件需要确认",
         "与已有案例存在重复风险，请检查",
         "业务逻辑复杂度较高，建议人工复核",
       ];
       
      dimensions.forEach(dim => {
         dim.testPoints.forEach((tp, index) => {
          // 模拟AI给出的建议
           // 部分变为重点审查，部分保持待审查或采纳
           const randomValue = Math.random();
           let suggestion: ReviewResult;
           if (randomValue < 0.35) {
             suggestion = "focusReview";
           } else if (randomValue < 0.6) {
             suggestion = "adopted";
           } else {
             suggestion = "pending"; // 保持待审查
           }
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
    
     const focusReviewSuggestions = [
       "非本需求，请详细查看本体来源",
       "场景描述与需求文档不符，请核实",
       "测试数据边界条件需要确认",
       "与已有案例存在重复风险，请检查",
       "业务逻辑复杂度较高，建议人工复核",
     ];
     
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
           // 如果是重点审查，添加审查建议到处理方案
           const solutionSuggestion = suggestion === "focusReview" 
             ? focusReviewSuggestions[Math.floor(Math.random() * focusReviewSuggestions.length)]
             : tp.solution;
          return { 
            ...tp, 
            reviewResult: suggestion,
            aiSuggestion: suggestion, // 保存智能审查结果
             solution: solutionSuggestion,
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
    <div className="flex h-screen overflow-hidden relative">
      {/* Left Chat Panel - only when open */}
      {chatPanelOpen && (
        <div className="w-1/5 min-w-[280px] max-w-[360px] border-r bg-muted/20 flex-shrink-0 h-full">
          <CaseReviewChatPanel onClose={() => setChatPanelOpen(false)} />
        </div>
      )}
      
      {/* Main Content */}
      <div className={cn("flex-1 p-6 overflow-y-auto", isFromChat && "pb-20")}>

      {/* Floating Chat Button - bottom left */}
      {!chatPanelOpen && (
        <Button
          onClick={() => setChatPanelOpen(true)}
          className="fixed left-6 bottom-6 z-40 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
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
          <h1 className="text-2xl font-bold text-foreground flex items-baseline gap-2">
            <span>账户开户-案例审查</span>
            {isFromDeliverable && deliverableName && (
              <span className="text-primary">- {deliverableName}</span>
            )}
            {isFromChat && baseVersion && (
              <span className="text-sm font-normal text-muted-foreground">
                （对比状态基于{baseVersion}版本）
              </span>
            )}
          </h1>
          
          {/* Reference Materials */}
          <Popover open={referenceMaterialsOpen} onOpenChange={setReferenceMaterialsOpen}>
            <PopoverTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mt-1 cursor-pointer">
              <FileText className="w-4 h-4" />
              <span>基于 {mockReferenceMaterials.length} 条资料作为参考</span>
              {referenceMaterialsOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[480px] p-0">
              <div className="bg-card rounded-lg p-3 space-y-1 max-h-[400px] overflow-y-auto">
                {mockReferenceMaterials.map((material, index) => (
                  <div
                    key={material.id}
                    className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-muted/50 transition-colors cursor-pointer group"
                    onClick={() => {
                      handleOpenMaterial(material);
                      setReferenceMaterialsOpen(false);
                    }}
                  >
                    <span className="text-muted-foreground text-sm">{index + 1}.</span>
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors flex-1">
                      {material.name}
                    </span>
                    <span className="text-xs text-muted-foreground">{material.type}</span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Statistics Cards */}
       <div className="grid grid-cols-8 gap-3 mb-6">
        <div className="bg-card border rounded-lg px-4 py-3 flex flex-col">
          <span className="text-xs text-muted-foreground mb-1">总场景</span>
          <span className="text-xl font-semibold">{statistics.totalScenarios}</span>
        </div>
        <div className="bg-card border rounded-lg px-4 py-3 flex flex-col">
          <span className="text-xs text-muted-foreground mb-1">总案例</span>
          <span className="text-xl font-semibold">{statistics.totalCases}</span>
        </div>
        <div className="bg-card border rounded-lg px-4 py-3 flex flex-col">
           <span className="text-xs text-muted-foreground mb-1">待审查</span>
           <span className="text-xl font-semibold text-muted-foreground">{statistics.pending}</span>
         </div>
         <div className="bg-card border rounded-lg px-4 py-3 flex flex-col">
           <span className="text-xs text-muted-foreground mb-1">重点审查</span>
           <span className="text-xl font-semibold text-amber-600">{statistics.focusReview}</span>
         </div>
         <div className="bg-card border rounded-lg px-4 py-3 flex flex-col">
          <span className="text-xs text-muted-foreground mb-1">采纳</span>
          <span className="text-xl font-semibold text-green-600">{statistics.adopted}</span>
        </div>
        <div className="bg-card border rounded-lg px-4 py-3 flex flex-col">
          <span className="text-xs text-muted-foreground mb-1">需完善</span>
           <span className="text-xl font-semibold text-orange-600">{statistics.needsImprovement}</span>
        </div>
        <div className="bg-card border rounded-lg px-4 py-3 flex flex-col">
          <span className="text-xs text-muted-foreground mb-1">已完善</span>
          <span className="text-xl font-semibold text-blue-600">{statistics.improved}</span>
        </div>
        <div className="bg-card border rounded-lg px-4 py-3 flex flex-col">
          <span className="text-xs text-muted-foreground mb-1">丢弃</span>
          <span className="text-xl font-semibold text-red-600">{statistics.needsDiscard}</span>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索编号或场景描述..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterResult} onValueChange={setFilterResult}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="审查结果" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部结果</SelectItem>
              <SelectItem value="adopted">采纳</SelectItem>
              <SelectItem value="needsImprovement">需完善</SelectItem>
              <SelectItem value="improved">已完善</SelectItem>
              <SelectItem value="needsDiscard">丢弃</SelectItem>
              <SelectItem value="pending">待审查</SelectItem>
               <SelectItem value="focusReview">重点审查</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分类</SelectItem>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        {filteredDimensions.map((dimension) => {
          const isCollapsed = collapsedDimensions.has(dimension.id);
          
          return (
          <Collapsible key={dimension.id} open={!isCollapsed} onOpenChange={() => toggleDimensionCollapse(dimension.id)}>
            <div className="overflow-hidden">
              {/* Dimension Header */}
              <CollapsibleTrigger asChild>
                <div className="bg-[hsl(200,60%,94%)] border-l-4 border-l-[hsl(200,70%,50%)] px-4 py-3 font-medium text-foreground cursor-pointer hover:bg-[hsl(200,60%,90%)] transition-colors flex items-center gap-2">
                  <ChevronRight className={cn("w-4 h-4 transition-transform", !isCollapsed && "rotate-90")} />
                  {dimension.name}
                  <span className="text-xs text-muted-foreground ml-2">({dimension.testPoints.length}个场景)</span>
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
            {/* Table */}
            <div className="border border-t-0 overflow-x-auto">
              {/* Table Header */}
              <div className="bg-[hsl(200,70%,50%)] text-white min-w-[1200px]">
                {/* First row - group headers */}
                <div className="grid text-sm" style={{ gridTemplateColumns: 'repeat(14, minmax(0, 1fr))' }}>
                  <div className="col-span-7 px-3 py-2 border-r border-[hsl(200,70%,60%)] text-center font-medium">
                    场景基本信息
                  </div>
                  <div className="col-span-7 px-3 py-2 text-center font-medium">
                    用户审查
                  </div>
                </div>
                {/* Second row - column headers */}
                <div className="grid text-sm bg-[hsl(200,65%,55%)]" style={{ gridTemplateColumns: 'repeat(14, minmax(0, 1fr))' }}>
                  <div className="col-span-1 px-3 py-2 border-r border-[hsl(200,70%,60%)] text-center">编号</div>
                  <div className="col-span-2 px-3 py-2 border-r border-[hsl(200,70%,60%)] text-center">场景描述</div>
                  <div className="col-span-1 px-3 py-2 border-r border-[hsl(200,70%,60%)] text-center">场景分类</div>
                  <div className="col-span-1 px-3 py-2 border-r border-[hsl(200,70%,60%)] text-center">对比状态</div>
                  <div className="col-span-1 px-3 py-2 border-r border-[hsl(200,70%,60%)] text-center">来源</div>
                  <div className="col-span-1 px-3 py-2 border-r border-[hsl(200,70%,60%)] text-center">案例数</div>
                  <div className="col-span-2 px-3 py-2 border-r border-[hsl(200,70%,60%)] text-center">审查结果</div>
                  <div className="col-span-2 px-3 py-2 border-r border-[hsl(200,70%,60%)] text-center">问题分类</div>
                  <div className="col-span-2 px-3 py-2 border-r border-[hsl(200,70%,60%)] text-center">处理方案</div>
                  <div className="col-span-1 px-3 py-2 text-center">审查记录</div>
                </div>
              </div>
              
              {/* Table Body */}
              <div className="divide-y divide-border bg-background min-w-[1200px]">
                {dimension.testPoints.map((tp) => {
                  const resultConfig = reviewResultConfig[tp.reviewResult];
                  const comparisonConfig = comparisonStatusConfig[tp.comparisonStatus || "unchanged"];
                  
                  return (
                    <div
                      key={tp.id}
                      className="grid text-sm hover:bg-muted/30 transition-colors"
                      style={{ gridTemplateColumns: 'repeat(14, minmax(0, 1fr))' }}
                    >
                      {/* 编号 */}
                      <div className="col-span-1 px-3 py-3 border-r border-border flex items-center justify-center">
                         <span className={cn(
                           "font-mono text-xs",
                           tp.reviewResult === "focusReview" && "text-amber-600 font-semibold"
                         )}>{tp.code}</span>
                      </div>
                      {/* 场景描述 - hover显示完整内容，根据对比状态显示颜色 */}
                      <div className="col-span-2 px-3 py-3 border-r border-border flex items-center group relative">
                        <span className={cn("truncate text-xs", comparisonConfig.scenarioClassName)}>{tp.name}</span>
                        <div className="absolute left-0 top-full z-50 hidden group-hover:block bg-popover border rounded-lg shadow-lg p-2 min-w-[200px] max-w-[300px]">
                          <span className={cn("text-xs whitespace-normal", comparisonConfig.scenarioClassName)}>{tp.name}</span>
                        </div>
                      </div>
                      {/* 场景分类 */}
                      <div className="col-span-1 px-2 py-1 border-r border-border flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">
                          {tp.scenarioCategory || "-"}
                        </span>
                      </div>
                      {/* 对比状态 */}
                      <div className="col-span-1 px-3 py-3 border-r border-border flex items-center justify-center">
                        {tp.comparisonStatus && tp.comparisonStatus !== "unchanged" ? (
                          <Badge variant="outline" className={cn("text-[10px] px-1.5", comparisonConfig.className)}>
                            {comparisonConfig.label}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </div>
                      {/* 场景来源 - 纯文字显示，支持多个类型 */}
                      <div className="col-span-1 px-3 py-3 border-r border-border flex items-center justify-center">
                        <span className="text-[10px]">
                          {tp.source.split(",").map((s, idx, arr) => {
                            const source = s.trim();
                            const colorClass = 
                              source === "UserStory" ? "text-amber-600" :
                              source === "FSD" ? "text-blue-600" :
                              source === "TSD" ? "text-emerald-600" :
                              source === "PRD" ? "text-purple-600" :
                              "text-foreground";
                            return (
                              <span key={idx}>
                                <span className={colorClass}>{source}</span>
                                {idx < arr.length - 1 && <span className="text-muted-foreground">, </span>}
                              </span>
                            );
                          })}
                        </span>
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
                      <div className="col-span-2 px-3 py-3 border-r border-border flex items-center justify-center">
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
                               {(["adopted", "needsImprovement", "improved", "needsDiscard", "focusReview"] as ReviewResult[]).map((result) => {
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
                         {tp.reviewResult === "adopted" || tp.reviewResult === "pending" ? (
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
                         {tp.reviewResult === "adopted" || tp.reviewResult === "pending" ? (
                          <span className="text-xs text-muted-foreground">-</span>
                         ) : tp.reviewResult === "focusReview" && tp.solution ? (
                           <span className="text-xs text-amber-600">{tp.solution}</span>
                        ) : (
                          <Input
                            className="h-8 text-xs border-0 bg-transparent focus-visible:ring-1"
                            placeholder="请输入处理方案..."
                            value={tp.solution || ""}
                            onChange={(e) => handleFieldChange(dimension.id, tp.id, "solution", e.target.value)}
                          />
                        )}
                      </div>
                      {/* 审查记录 - 显示查看文字，点击打开侧边栏 */}
                      <div className="col-span-1 px-2 py-1 flex items-center justify-center">
                        {tp.reviewHistory && tp.reviewHistory.length > 0 ? (
                          <span 
                            className="text-xs text-primary hover:underline cursor-pointer"
                            onClick={() => {
                              // 为每个案例生成包含内容修改示例的记录
                              const contentModificationRecord = {
                                timestamp: "2026-01-06 14:30",
                                type: "content" as const,
                                before: `Feature: ${tp.name}

Scenario: 基础场景描述
  Given 前置条件
  When 执行操作
  Then 预期结果`,
                                after: `Feature: ${tp.name}

Scenario: 完善后的场景描述
  Given 用户已完成前置准备
  And 系统处于正常状态
  When 用户执行核心操作
  And 系统处理请求
  Then 系统应返回正确结果
  And 用户应看到成功提示`,
                              };
                              
                              const statusRecords = tp.reviewHistory.map((h, idx) => ({
                                timestamp: h.timestamp,
                                type: "status" as const,
                                before: idx === 0 ? "待审查" : tp.reviewHistory[idx - 1].action.replace("将状态改为", "").replace("状态修改为", ""),
                                after: h.action.replace("将状态改为", "").replace("状态修改为", ""),
                              }));
                              
                              setHistoryData({
                                id: tp.id,
                                scenarioName: tp.name,
                                records: [contentModificationRecord, ...statusRecords],
                              });
                              setHistorySidebarOpen(true);
                            }}
                          >
                            查看
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
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
                
                {/* 新增场景按钮 */}
                <div 
                  className="px-4 py-2 border-t border-dashed border-border hover:bg-muted/30 cursor-pointer transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-primary"
                  onClick={() => handleAddScenario(dimension.id)}
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">新增场景</span>
                </div>
              </div>
            </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        );
        })}
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

      <ReviewHistorySidebar
        open={historySidebarOpen}
        onOpenChange={setHistorySidebarOpen}
        historyData={historyData}
      />

      <ReferenceMaterialsSidebar
        open={referenceSidebarOpen}
        onOpenChange={setReferenceSidebarOpen}
        material={selectedMaterial}
      />

      {/* Save to Task Dialog */}
      <SaveToTaskDialog
        open={saveToTaskDialogOpen}
        onOpenChange={setSaveToTaskDialogOpen}
        onConfirm={handleSaveToTask}
        onCreateNew={() => {
          setSaveToTaskDialogOpen(false);
          setCreateTaskDialogOpen(true);
        }}
        defaultCaseName={generateDefaultCaseName()}
      />

      {/* Create Task Dialog */}
      <CreateSmartDesignTaskDialog
        open={createTaskDialogOpen}
        onOpenChange={setCreateTaskDialogOpen}
        onConfirm={handleCreateTask}
      />

      {/* Fixed Footer - Save (only when from chat) */}
      {isFromChat && (
        <div className="fixed bottom-0 left-[20%] right-0 bg-background border-t shadow-lg z-50">
          <div className="max-w-full mx-auto px-6 py-4 flex items-center justify-center">
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              保存
            </Button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
