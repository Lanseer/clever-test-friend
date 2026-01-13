import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Search, FileCheck, CheckCircle, Clock, XCircle, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CaseReviewDialog } from "@/components/workspace/CaseReviewDialog";

type CaseStatus = "pending" | "accepted" | "rejected";

interface GeneratedCase {
  id: string;
  code: string;
  name: string;
  status: CaseStatus;
  bddContent: string;
  sourceDocument: string;
  createdAt: string;
}

const mockCases: GeneratedCase[] = [
  {
    id: "1",
    code: "TC-001",
    name: "用户登录成功场景",
    status: "pending",
    createdAt: "2024-01-15 10:30",
    bddContent: `Feature: 用户登录
  Scenario: 使用有效凭证登录
    Given 用户在登录页面
    When 用户输入有效的用户名 "testuser"
    And 用户输入有效的密码 "password123"
    And 用户点击登录按钮
    Then 用户应该被重定向到首页
    And 用户应该看到欢迎信息`,
    sourceDocument: `<h3>2.1 用户登录功能</h3>
<p>系统应支持用户通过用户名和密码进行登录。登录成功后，用户将被重定向到系统首页，并显示个性化欢迎信息。</p>
<h4>功能要求：</h4>
<ul>
  <li>支持用户名/密码登录</li>
  <li>登录成功后跳转首页</li>
  <li>显示用户欢迎信息</li>
</ul>`,
  },
  {
    id: "2",
    code: "TC-002",
    name: "用户登录失败-密码错误",
    status: "pending",
    createdAt: "2024-01-15 10:32",
    bddContent: `Feature: 用户登录
  Scenario: 使用错误密码登录
    Given 用户在登录页面
    When 用户输入有效的用户名 "testuser"
    And 用户输入错误的密码 "wrongpassword"
    And 用户点击登录按钮
    Then 用户应该看到错误提示 "用户名或密码错误"
    And 用户应该保留在登录页面`,
    sourceDocument: `<h3>2.1 用户登录功能</h3>
<p>当用户输入错误的密码时，系统应显示明确的错误提示信息，但不应透露具体是用户名还是密码错误，以防止账户枚举攻击。</p>
<h4>错误处理：</h4>
<ul>
  <li>显示统一错误信息</li>
  <li>限制登录尝试次数</li>
</ul>`,
  },
  {
    id: "3",
    code: "TC-003",
    name: "用户注册成功场景",
    status: "accepted",
    createdAt: "2024-01-15 10:35",
    bddContent: `Feature: 用户注册
  Scenario: 使用有效信息注册新用户
    Given 用户在注册页面
    When 用户输入用户名 "newuser"
    And 用户输入邮箱 "newuser@example.com"
    And 用户输入密码 "SecurePass123!"
    And 用户确认密码 "SecurePass123!"
    And 用户点击注册按钮
    Then 用户应该收到注册成功提示
    And 用户应该被重定向到登录页面`,
    sourceDocument: `<h3>2.2 用户注册功能</h3>
<p>新用户可以通过填写注册表单创建账户。注册成功后，系统将发送确认邮件并引导用户登录。</p>`,
  },
  {
    id: "4",
    code: "TC-004",
    name: "密码重置流程",
    status: "pending",
    createdAt: "2024-01-15 10:38",
    bddContent: `Feature: 密码重置
  Scenario: 通过邮箱重置密码
    Given 用户在忘记密码页面
    When 用户输入注册邮箱 "user@example.com"
    And 用户点击发送重置链接
    Then 用户应该收到确认信息
    And 用户应该在邮箱收到重置链接`,
    sourceDocument: `<h3>2.3 密码重置</h3>
<p>用户可以通过注册邮箱重置密码。系统将发送包含重置链接的邮件，链接有效期为24小时。</p>`,
  },
  {
    id: "5",
    code: "TC-005",
    name: "用户资料更新",
    status: "rejected",
    createdAt: "2024-01-15 10:40",
    bddContent: `Feature: 用户资料管理
  Scenario: 更新用户头像
    Given 用户已登录
    And 用户在个人资料页面
    When 用户点击更换头像
    And 用户选择新的头像图片
    And 用户点击保存
    Then 用户应该看到新头像
    And 系统应该显示保存成功提示`,
    sourceDocument: `<h3>2.4 个人资料管理</h3>
<p>用户可以更新个人资料，包括头像、昵称、联系方式等信息。</p>`,
  },
];

const statusConfig: Record<CaseStatus, { label: string; icon: typeof CheckCircle; className: string }> = {
  pending: {
    label: "待评审",
    icon: Clock,
    className: "bg-amber-500/10 text-amber-600 border-amber-200",
  },
  accepted: {
    label: "已采纳",
    icon: CheckCircle,
    className: "bg-green-500/10 text-green-600 border-green-200",
  },
  rejected: {
    label: "已拒绝",
    icon: XCircle,
    className: "bg-red-500/10 text-red-600 border-red-200",
  },
};

export default function CaseReview() {
  const navigate = useNavigate();
  const { workspaceId, recordId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [cases, setCases] = useState(mockCases);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);

  const filteredCases = cases.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = cases.filter((c) => c.status === "pending").length;
  const acceptedCount = cases.filter((c) => c.status === "accepted").length;

  const handleOpenReview = (index: number) => {
    setSelectedCaseIndex(index);
    setReviewDialogOpen(true);
  };

  const handleBatchReview = () => {
    const firstPendingIndex = cases.findIndex((c) => c.status === "pending");
    if (firstPendingIndex !== -1) {
      handleOpenReview(firstPendingIndex);
    }
  };

  const handleAcceptCase = (caseId: string) => {
    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, status: "accepted" as CaseStatus } : c))
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/workspace/${workspaceId}/management/ai-cases`)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">用例评审</h1>
          <p className="text-muted-foreground mt-1">
            生成记录: AI-001 · 共 {cases.length} 个用例，{pendingCount} 个待评审
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索用例编号或名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={handleBatchReview} disabled={pendingCount === 0} className="gap-2">
          <FileCheck className="w-4 h-4" />
          批量评审 ({pendingCount})
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold">{cases.length}</div>
          <div className="text-sm text-muted-foreground">总用例数</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
          <div className="text-sm text-muted-foreground">待评审</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{acceptedCount}</div>
          <div className="text-sm text-muted-foreground">已采纳</div>
        </div>
      </div>

      {/* Case List */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
          <div className="col-span-1">编号</div>
          <div className="col-span-5">用例名称</div>
          <div className="col-span-2">创建时间</div>
          <div className="col-span-2">状态</div>
          <div className="col-span-2">操作</div>
        </div>

        <div className="divide-y">
          {filteredCases.map((testCase, index) => {
            const status = statusConfig[testCase.status];
            const StatusIcon = status.icon;

            return (
              <div
                key={testCase.id}
                className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-muted/30 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="col-span-1 flex items-center">
                  <Badge variant="outline" className="font-mono text-xs">
                    {testCase.code}
                  </Badge>
                </div>
                <div className="col-span-5 flex items-center">
                  <span className="font-medium text-foreground">{testCase.name}</span>
                </div>
                <div className="col-span-2 flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  {testCase.createdAt}
                </div>
                <div className="col-span-2 flex items-center">
                  <Badge variant="outline" className={cn("text-xs gap-1", status.className)}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </Badge>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-xs gap-1"
                    onClick={() => handleOpenReview(index)}
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    评审
                  </Button>
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

      <CaseReviewDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        cases={filteredCases}
        initialIndex={selectedCaseIndex}
        onAccept={handleAcceptCase}
      />
    </div>
  );
}
