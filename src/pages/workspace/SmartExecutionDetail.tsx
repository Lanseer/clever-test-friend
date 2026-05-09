import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Play,
  Edit,
  Copy,
  Paperclip,
  Search,
  Archive,
  FileText,
  Video,
  Image as ImageIcon,
  Eye,
  MoreHorizontal,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Maximize2,
  Camera,
  AlertTriangle,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TimelineStep {
  id: string;
  step: number;
  title: string;
  type: string;
  status: "completed" | "running" | "failed";
  highlighted?: boolean;
}

interface ArtifactItem {
  id: string;
  name: string;
  date: string;
  type: "archive" | "file" | "video" | "image";
  viewable?: boolean;
}

const mockSteps: TimelineStep[] = [
  { id: "s1", step: 1, title: "Navigate to the login page", type: "BROWSER", status: "completed" },
  { id: "s2", step: 2, title: "Enter the account email", type: "BROWSER", status: "completed" },
  { id: "s3", step: 3, title: "Enter the password", type: "BROWSER", status: "completed" },
  { id: "s4", step: 4, title: "Click the Login button", type: "BROWSER", status: "completed" },
  {
    id: "s5",
    step: 5,
    title: "Test Execution Summary: User Login Website # # Execution Overview - Status: PASSED - Target URL:...",
    type: "BROWSER",
    status: "completed",
    highlighted: true,
  },
];

const mockArtifacts: ArtifactItem[] = [
  { id: "a1", name: "all_test_attachments.zip", date: "Apr 22, 2026, 6:03 AM", type: "archive" },
  { id: "a2", name: "test.feature_result.xml", date: "Apr 22, 2026, 6:03 AM", type: "file", viewable: true },
  { id: "a3", name: "sctocloud.com_2ace10_User_login...", date: "Apr 22, 2026, 6:03 AM", type: "video", viewable: true },
  { id: "a4", name: "click_end_1776837760286195665.j...", date: "Apr 22, 2026, 6:02 AM", type: "image", viewable: true },
  { id: "a5", name: "element_click_bbox_1776837758.j...", date: "Apr 22, 2026, 6:02 AM", type: "image", viewable: true },
  { id: "a6", name: "click_start_1776837758490825059...", date: "Apr 22, 2026, 6:02 AM", type: "image", viewable: true },
  { id: "a7", name: "entertext_end_17768377498351719...", date: "Apr 22, 2026, 6:02 AM", type: "image", viewable: true },
];

const featureCode = `FEATURE: Login Test
; Use Given Account and password to login website

  SCENARIO: User login website
    GIVEN I am logged into "https://sctocloud.com/auth/login"

    AND I enter the Account and Password

    AND I click on the "登录" button

    THEN I see the login successfule message and turn to homepage`;

const executionPlan = [
  { step: 1, content: 'Navigate to the login page at https://sctocloud.com/auth/login.' },
  { step: 2, content: "Enter the account email 'lanseer@foxmail.com' into the account field." },
  { step: 3, content: "Enter the password 'qlzqai031996' into the password field." },
  { step: 4, content: "Click the '登录' (Login) button." },
  { step: 5, content: "Verify the success message and redirect to the user center page." },
];

const aiReasoning = `The test passed because the login flow completed exactly as expected from start to finish. The test first confirmed that the SCTO Cloud login page opened at the correct URL, that the email and password fields were visible and usable, and that there were no blocking popups or dialogs interfering with the process. It then entered the correct email and verified that the value appeared in the right field, followed by entering the password after confirming the email step had already succeeded. After that, the login button was clicked and the system responded with a "登录成功" message, which showed the credentials were accepted. The browser then redirected from the login page to the User Center page at https://sctocloud.com/user, and the test was able to see user-specific account details like remaining traffic and membership duration. That combination of successful input, success notification, correct redirect, and visible account information is why the test was marked as passed.`;

interface FailureScenario {
  category: string;
  type: string;
  reasoning: string;
  fixSteps: string[];
  retryHint: string;
}

const failureScenarios: FailureScenario[] = [
  {
    category: "脚本自身问题",
    type: "Gherkin 语法错误",
    reasoning:
      '测试在第 2 步执行失败：BDD 脚本中的 "When 用户输入正确的密码" 缺少 Given/When/Then 关键字前置层级，AI 解析时报 "Step keyword not recognized"，导致整个 Scenario 无法进入执行阶段。',
    fixSteps: [
      "检查 Cases 表对应行的 BDD 步骤，补全 Given/When/Then 关键字。",
      '在 "When 用户输入正确的密码" 之前增加 "And" 连接词，确保步骤层级正确。',
      "保存并重新解析 BDD，确认无 Gherkin 语法警告。",
    ],
    retryHint: "修复完成后请点击「编辑案例」返回，再次发起现场测试以重新执行。",
  },
  {
    category: "脚本自身问题",
    type: "步骤描述模糊",
    reasoning:
      '测试在第 3 步执行失败：步骤 "用户点击登录按钮" 未明确按钮的定位特征，AI 在页面上识别到 2 个候选按钮（"登录"、"快速登录"），错误地点击了 "快速登录"，触发了非预期跳转。',
    fixSteps: [
      '在 BDD 步骤中补充按钮的唯一标识，例如 text="登录" 或 id="loginBtn"。',
      "若页面存在多个相似按钮，请使用更精确的 selector（如 :has-text + class）。",
      "更新预期结果，明确点击后应跳转到的目标页面 URL。",
    ],
    retryHint: "修复 BDD 后请重新发起现场测试，AI 将基于新描述重新识别元素。",
  },
  {
    category: "被测系统/环境问题",
    type: "页面元素变更",
    reasoning:
      '测试在第 3 步执行失败：页面无法定位到密码输入框元素（选择器 #password 未找到匹配节点）。被测系统已升级，密码框 id 由 "password" 修改为 "user-password"，原案例脚本未同步更新。',
    fixSteps: [
      "登录被测系统确认密码输入框最新的 id / name / placeholder 值。",
      '在案例 BDD 中更新元素定位描述，例如改为 name="user-password"。',
      '增加 "And 等待登录页面完全加载" 的前置等待逻辑，避免 DOM 未挂载。',
    ],
    retryHint: "更新元素定位后重新执行现场测试，AI 将按新选择器定位元素。",
  },
  {
    category: "被测系统/环境问题",
    type: "环境不可用",
    reasoning:
      "测试在第 1 步执行失败：访问 https://test.example.com/login 超时（30s），目标环境返回 502 Bad Gateway。环境监控显示该 SIT 环境正在进行例行重启。",
    fixSteps: [
      "通过环境管理页确认 SIT 环境当前状态，等待重启完成。",
      "若需立即执行，可在配置中切换到可用的 UAT 环境 URL。",
      "联系环境运维确认服务恢复时间，并在案例中记录环境切换说明。",
    ],
    retryHint: "环境恢复后请重新发起现场测试，建议先做一次手工冒烟验证。",
  },
  {
    category: "配置问题",
    type: "环境配置错误",
    reasoning:
      "测试在第 4 步执行失败：登录接口返回 401 Unauthorized。检查发现案例配置中的环境 URL 指向了已废弃的 v1 域名（test-v1.example.com），认证服务已迁移到 v2。",
    fixSteps: [
      "在右侧配置中将「环境」URL 更新为 https://test-v2.example.com/login。",
      "确认所选环境的认证 token 与目标系统一致。",
      "保存配置后查看环境变量是否生效。",
    ],
    retryHint: "环境 URL 修正后重新执行现场测试即可。",
  },
  {
    category: "配置问题",
    type: "测试数据绑定错误",
    reasoning:
      '测试在第 2 步执行失败：脚本期望读取字段 "username"，但 Cases 表当前列名为 "用户名"，AI 在做数据绑定时未找到匹配字段，传入了空值导致登录失败。',
    fixSteps: [
      "检查 Cases 表头与 BDD 中引用的字段名是否一致。",
      '将列名 "用户名" 调整为脚本期望的字段标识，或在 BDD 中改为引用 "用户名"。',
      "确认所有行的对应单元格均已填写。",
    ],
    retryHint: "字段对齐后重新执行现场测试，数据绑定将正常生效。",
  },
  {
    category: "真实业务缺陷",
    type: "功能回归",
    reasoning:
      '测试在第 5 步执行失败：登录成功后未跳转到主页，停留在登录页且显示 "系统繁忙"。最近一次发布修改了登录后的路由逻辑，破坏了原有跳转。这属于被测系统的真实缺陷，建议提交 Bug。',
    fixSteps: [
      "在缺陷管理系统提交 Bug，附上本次现场测试的录屏与日志。",
      "保留当前案例不变，等待开发修复后再次执行验证。",
      '在案例备注中标记 "已发现回归缺陷"，避免误判为案例问题。',
    ],
    retryHint: "缺陷修复后请重新执行现场测试以验证回归。",
  },
  {
    category: "真实业务缺陷",
    type: "数据处理错误",
    reasoning:
      "测试在第 5 步执行失败：登录成功但财务模块未显示。后端日志显示用户角色权限计算错误，返回的菜单列表缺少 finance 节点。属于业务逻辑缺陷。",
    fixSteps: [
      "提交 Bug 至开发团队，附上后端日志与请求/响应。",
      "在案例中保留预期结果，等待修复后再次验证。",
      "可临时切换为通用账号验证其他登录流程不受影响。",
    ],
    retryHint: "缺陷修复后请重新执行现场测试。",
  },
];

const getFailureScenario = (idx: number): FailureScenario =>
  failureScenarios[idx % failureScenarios.length];

function ArtifactIcon({ type }: { type: ArtifactItem["type"] }) {
  const iconCls = "w-5 h-5 text-muted-foreground";
  switch (type) {
    case "archive":
      return <Archive className={iconCls} />;
    case "video":
      return <Video className={iconCls} />;
    case "image":
      return <ImageIcon className={iconCls} />;
    default:
      return <FileText className={iconCls} />;
  }
}

export default function SmartExecutionDetail() {
  const navigate = useNavigate();
  const { workspaceId } = useParams();
  const [searchParams] = useSearchParams();
  const isLiveEntry = searchParams.get("live") === "1";
  const isFailedRun = searchParams.get("result") === "failed";
  const editBackUrl = searchParams.get("editBack") || "";
  const caseIdx = parseInt(searchParams.get("caseIdx") || "0", 10) || 0;
  const failureScenario = getFailureScenario(caseIdx);

  const [isLiveLoading, setIsLiveLoading] = useState(isLiveEntry);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchArtifact, setSearchArtifact] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    if (!isLiveEntry) return;
    setIsLiveLoading(true);
    const timer = setTimeout(() => setIsLiveLoading(false), 3000);
    return () => clearTimeout(timer);
  }, [isLiveEntry]);

  const filteredArtifacts = mockArtifacts.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(searchArtifact.toLowerCase());
    const matchesType = filterType === "all" || a.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(featureCode);
    toast.success("已复制到剪贴板");
  };

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col bg-gradient-to-br from-background via-background to-muted/20 overflow-auto">
      {/* Header Card */}
      <div className="p-4">
        <Card className="p-5 border-border/60">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 mt-0.5"
                onClick={() => navigate(`/workspace/${workspaceId}/smart-execution`)}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-semibold truncate">web-网页测试</h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-muted-foreground">Tags:</span>
                  <Badge variant="outline" className="bg-muted/50 font-normal">
                    web case
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3 shrink-0">
              <div className="flex items-center gap-2">
                {isFailedRun ? (
                  <>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
                      Completed
                    </Badge>
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 px-3 py-1">
                      Fail
                    </Badge>
                    {editBackUrl && (
                      <Button
                        size="sm"
                        variant="default"
                        className="gap-1.5"
                        onClick={() => navigate(editBackUrl)}
                      >
                        <Edit3 className="w-4 h-4" />
                        编辑案例
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
                      Completed
                    </Badge>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
                      Pass
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>


      {/* AI Reasoning */}
      <div className="px-4">
        {isFailedRun ? (
          <Card className="p-5 border-2 border-red-300 bg-red-50/30 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-red-700 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                AI Reasoning · 失败原因与修改建议
              </h2>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                  {failureScenario.category}
                </Badge>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  {failureScenario.type}
                </Badge>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {failureScenario.reasoning}
              </p>
            </div>

            <div className="rounded-md border border-amber-200 bg-amber-50/60 p-4">
              <h3 className="text-sm font-semibold text-amber-800 mb-2">建议修复过程</h3>
              <ol className="space-y-1.5 text-sm text-foreground/85 list-decimal list-inside">
                {failureScenario.fixSteps.map((step, i) => (
                  <li key={i} className="leading-relaxed">{step}</li>
                ))}
              </ol>
            </div>

            <div className="rounded-md border border-blue-200 bg-blue-50/60 p-4 flex items-start gap-3">
              <RefreshCw className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-800 mb-1">下一步：重试执行</h3>
                <p className="text-sm text-foreground/85 leading-relaxed">
                  {failureScenario.retryHint}
                </p>
              </div>
              {editBackUrl && (
                <Button
                  size="sm"
                  variant="default"
                  className="gap-1.5 shrink-0"
                  onClick={() => navigate(editBackUrl)}
                >
                  <Edit3 className="w-4 h-4" />
                  返回修复案例
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <Card className="p-5 border-2 border-green-300 bg-green-50/30">
            <h2 className="text-lg font-semibold text-green-700 mb-3">AI Reasoning</h2>
            <p className="text-sm leading-relaxed text-foreground/90">{aiReasoning}</p>
          </Card>
        )}
      </div>

      {/* Feature Code + Execution Plan */}
      <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 h-8 w-8"
            onClick={handleCopy}
          >
            <Copy className="w-4 h-4" />
          </Button>
          <pre className="text-sm font-mono leading-relaxed whitespace-pre-wrap pr-10">
            <span className="text-blue-600 font-semibold">FEATURE:</span> Login Test
            {"\n"}; Use Given Account and password to login website
            {"\n\n  "}
            <span className="text-blue-600 font-semibold">SCENARIO:</span> User login website
            {"\n    "}
            <span className="text-purple-600 font-semibold">GIVEN</span> I am logged into "https://sctocloud.com/auth/login"
            {"\n\n    "}
            <span className="text-purple-600 font-semibold">AND</span> I enter the Account and Password
            {"\n\n    "}
            <span className="text-purple-600 font-semibold">AND</span> I click on the "登录" button
            {"\n\n    "}
            <span className="text-purple-600 font-semibold">THEN</span> I see the login successfule message and turn to homepage
          </pre>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-semibold mb-4">Execution Plan</h2>
          <div className="space-y-4">
            {executionPlan.map((p) => (
              <div key={p.step}>
                <h3 className="font-semibold text-sm mb-1">Step {p.step}</h3>
                <p className="text-sm text-foreground/80 leading-relaxed">{p.content}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Execution Timeline + Artifacts */}
      <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h2 className="text-lg font-semibold mb-4">Execution Timeline</h2>
          <div className="space-y-3">
            {mockSteps.map((step) => (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border bg-background/50 transition-colors hover:bg-muted/30",
                  step.highlighted && "border-2 border-green-300 bg-green-50/40"
                )}
              >
                <div
                  className={cn(
                    "w-2.5 h-2.5 rounded-full shrink-0",
                    step.highlighted ? "bg-green-500" : "bg-blue-500"
                  )}
                />
                <div className={cn("flex-1 text-sm min-w-0", step.highlighted && "text-green-700 font-medium")}>
                  <span className="font-semibold">Step {step.step}: </span>
                  <span className="truncate">{step.title}</span>
                </div>
                <Badge variant="outline" className="bg-background font-normal shrink-0">
                  {step.type}
                </Badge>
                <Badge variant="outline" className="bg-blue-500 text-white border-blue-500 shrink-0">
                  Completed
                </Badge>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Paperclip className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Artifacts</h2>
              <span className="text-muted-foreground">({mockArtifacts.length})</span>
            </div>
            <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "px-3 py-1 text-sm rounded transition-colors",
                  viewMode === "grid" ? "bg-background shadow-sm" : "text-muted-foreground"
                )}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "px-3 py-1 text-sm rounded transition-colors",
                  viewMode === "list" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                )}
              >
                List
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search artifacts..."
                value={searchArtifact}
                onChange={(e) => setSearchArtifact(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <Paperclip className="w-4 h-4 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="archive">Archive</SelectItem>
                <SelectItem value="file">File</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="image">Image</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[360px]">
            <div className="space-y-2 pr-3">
              {filteredArtifacts.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-background/50 hover:bg-muted/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <ArtifactIcon type={a.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{a.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{a.date}</div>
                  </div>
                  {a.viewable && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Live Test Preview - shown for first 3 seconds */}
      {isLiveLoading && (
        <div className="px-4 pb-4">
          <Card className="overflow-hidden border-border/60">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/40 border-b border-border/60">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2 px-3 py-1 bg-background rounded-md border border-border/60 text-xs text-muted-foreground max-w-md w-full">
                  <span className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="truncate">https://sctocloud.com/auth/login</span>
                </div>
              </div>
            </div>
            <div className="relative aspect-video bg-gradient-to-br from-orange-100 via-amber-50 to-rose-50 flex items-center justify-center">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <Play className="w-7 h-7 text-primary absolute inset-0 m-auto" />
                </div>
                <div className="text-center space-y-1">
                  <div className="text-base font-semibold text-foreground">现场测试启动中...</div>
                  <div className="text-sm text-muted-foreground">正在启动浏览器并加载目标页面</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-border/60 bg-muted/20">
              <div className="flex items-center gap-2 text-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                </span>
                <span className="font-medium">Live · 实时执行中</span>
              </div>
              <div className="text-xs text-muted-foreground">即将进入完整执行报告...</div>
            </div>
          </Card>
        </div>
      )}
      {!isLiveLoading && (
        <>
      {/* Video Playback */}
      <div className="px-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Video Playback</h2>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center">
            <div className="text-white/60 flex flex-col items-center gap-2">
              <Camera className="w-12 h-12" />
              <span className="text-sm">视频回放预览</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 hover:text-white">
                <Play className="w-4 h-4" />
              </Button>
              <span className="text-xs text-white">1:06 / 1:06</span>
              <div className="flex-1 h-1 bg-white/30 rounded-full">
                <div className="h-full w-full bg-white rounded-full" />
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 hover:text-white">
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Browser Trace Viewer */}
      <div className="p-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Browser Trace Viewer</h2>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5">
              <ExternalLink className="w-4 h-4" />
              Open in new tab
            </Button>
          </div>
          <div className="bg-zinc-900 rounded-lg overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-700">
              <span className="text-white font-medium">Trace Viewer</span>
            </div>
            <div className="px-4 py-3 border-b border-zinc-700 flex items-center gap-8 text-xs text-zinc-400 overflow-x-auto">
              {[2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32].map((s) => (
                <span key={s} className="whitespace-nowrap">{s}.0s</span>
              ))}
            </div>
            <div className="px-4 py-2 border-b border-zinc-700 flex items-center gap-4 text-sm text-zinc-300">
              <span>Actions</span>
              <span>Metadata</span>
              <span className="ml-auto">Action · Before · After</span>
            </div>
            <div className="h-64 flex items-center justify-center bg-zinc-800/50">
              <div className="bg-zinc-700/40 border border-zinc-600 rounded-md p-4 w-80 h-32 flex items-center justify-center text-zinc-500 text-xs">
                about:blank
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Screenshot - 页面底部 */}
      <div className="px-4 pb-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Screenshot</h2>
              <span className="text-muted-foreground text-sm">(执行截图)</span>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5">
              <ExternalLink className="w-4 h-4" />
              View All
            </Button>
          </div>
          <Carousel opts={{ align: "start", loop: true }} className="w-full px-10">
            <CarouselContent className="-ml-3">
              {[
                { label: "Step 1: Navigate to login", time: "06:02:35" },
                { label: "Step 2: Enter email", time: "06:02:38" },
                { label: "Step 3: Enter password", time: "06:02:42" },
                { label: "Step 4: Click login", time: "06:02:45" },
                { label: "Step 5: Login success", time: "06:02:48" },
                { label: "Step 5: User center page", time: "06:02:52" },
              ].map((shot, idx) => (
                <CarouselItem key={idx} className="pl-3 basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <div className="group relative rounded-lg border border-border/60 overflow-hidden bg-muted hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="aspect-video bg-gradient-to-br from-muted to-muted-foreground/10 flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-muted-foreground/40" />
                    </div>
                    <div className="p-2 bg-background/80 backdrop-blur-sm border-t border-border/60">
                      <div className="text-xs font-medium truncate">{shot.label}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{shot.time}</div>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button variant="secondary" size="sm" className="gap-1.5">
                        <Eye className="w-4 h-4" />
                        Preview
                      </Button>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0" />
            <CarouselNext className="right-0" />
          </Carousel>
        </Card>
      </div>
        </>
      )}
    </div>
  );
}
