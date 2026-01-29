import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { FileText, CheckCircle2, Clock, AlertCircle, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { CaseSourceInfo } from "@/components/workspace/CaseSourceInfo";
import { toast } from "sonner";

interface TestTask {
  id: string;
  name: string;
  status: "pending" | "in_progress" | "completed";
  caseCount: number;
  reviewedCount: number;
}

interface TestCase {
  id: string;
  code: string;
  name: string;
  scenario: string;
  status: "pending" | "adopted" | "improved" | "discarded";
  priority: "high" | "medium" | "low";
  bddContent?: string;
}

const mockTasks: TestTask[] = [
  { id: "1", name: "用户登录模块测试", status: "in_progress", caseCount: 24, reviewedCount: 15 },
  { id: "2", name: "支付流程测试", status: "in_progress", caseCount: 18, reviewedCount: 5 },
  { id: "3", name: "订单管理测试", status: "pending", caseCount: 32, reviewedCount: 0 },
  { id: "4", name: "商品搜索测试", status: "completed", caseCount: 16, reviewedCount: 16 },
  { id: "5", name: "购物车功能测试", status: "in_progress", caseCount: 20, reviewedCount: 12 },
];

const getMockBddContent = (caseName: string) => {
  return `Feature: ${caseName}

  Scenario: 用户执行${caseName}操作
    Given 用户已登录系统
    And 用户位于相关页面
    When 用户执行操作
    Then 系统返回预期结果

  Examples:
    | 输入数据 | 预期结果 |
    | 有效数据 | 成功     |
    | 无效数据 | 失败     |`;
};

const mockCases: Record<string, TestCase[]> = {
  "1": [
    { id: "c1", code: "TC-001", name: "正常登录验证", scenario: "用户使用正确凭据登录", status: "adopted", priority: "high" },
    { id: "c2", code: "TC-002", name: "密码错误验证", scenario: "用户输入错误密码", status: "improved", priority: "high" },
    { id: "c3", code: "TC-003", name: "账号锁定测试", scenario: "多次错误登录后锁定", status: "pending", priority: "medium" },
    { id: "c4", code: "TC-004", name: "验证码功能", scenario: "登录验证码校验", status: "pending", priority: "medium" },
    { id: "c5", code: "TC-005", name: "记住密码功能", scenario: "勾选记住密码", status: "discarded", priority: "low" },
  ],
  "2": [
    { id: "c6", code: "TC-006", name: "支付宝支付", scenario: "使用支付宝完成支付", status: "adopted", priority: "high" },
    { id: "c7", code: "TC-007", name: "微信支付", scenario: "使用微信完成支付", status: "pending", priority: "high" },
    { id: "c8", code: "TC-008", name: "支付超时处理", scenario: "支付超时后的处理逻辑", status: "pending", priority: "medium" },
  ],
  "3": [
    { id: "c9", code: "TC-009", name: "创建订单", scenario: "正常创建订单流程", status: "pending", priority: "high" },
    { id: "c10", code: "TC-010", name: "取消订单", scenario: "订单取消功能", status: "pending", priority: "medium" },
  ],
  "4": [
    { id: "c11", code: "TC-011", name: "关键词搜索", scenario: "按关键词搜索商品", status: "adopted", priority: "high" },
    { id: "c12", code: "TC-012", name: "分类筛选", scenario: "按分类筛选商品", status: "adopted", priority: "medium" },
  ],
  "5": [
    { id: "c13", code: "TC-013", name: "添加商品", scenario: "添加商品到购物车", status: "adopted", priority: "high" },
    { id: "c14", code: "TC-014", name: "修改数量", scenario: "修改购物车商品数量", status: "pending", priority: "medium" },
  ],
};

const reviewResultConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "待审查", className: "bg-gray-100 text-gray-600 border-gray-200" },
  adopted: { label: "采纳", className: "bg-green-500/10 text-green-600 border-green-200" },
  improved: { label: "已完善", className: "bg-blue-500/10 text-blue-600 border-blue-200" },
  discarded: { label: "废弃", className: "bg-red-500/10 text-red-600 border-red-200" },
};

export default function MyTestTasks() {
  const { workspaceId } = useParams();
  const [searchParams] = useSearchParams();
  const initialTaskId = searchParams.get("taskId") || mockTasks[0]?.id;
  
  const [selectedTaskId, setSelectedTaskId] = useState<string>(initialTaskId);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>("");
  const [isEdited, setIsEdited] = useState(false);

  const selectedTask = mockTasks.find(t => t.id === selectedTaskId);
  const cases = mockCases[selectedTaskId] || [];
  const selectedCase = cases.find(c => c.id === selectedCaseId);

  useEffect(() => {
    if (selectedCase) {
      setEditedContent(selectedCase.bddContent || getMockBddContent(selectedCase.name));
      setIsEdited(false);
    }
  }, [selectedCaseId]);

  const getStatusIcon = (status: TestTask["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "pending":
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getCaseStatusBadge = (status: TestCase["status"]) => {
    switch (status) {
      case "adopted":
        return <Badge className="bg-green-100 text-green-700 border-green-200">采纳</Badge>;
      case "improved":
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">已完善</Badge>;
      case "discarded":
        return <Badge className="bg-red-100 text-red-700 border-red-200">废弃</Badge>;
      case "pending":
        return <Badge variant="outline">待审查</Badge>;
    }
  };

  const getPriorityBadge = (priority: TestCase["priority"]) => {
    switch (priority) {
      case "high":
        return <Badge variant="outline" className="text-red-600 border-red-200">高</Badge>;
      case "medium":
        return <Badge variant="outline" className="text-amber-600 border-amber-200">中</Badge>;
      case "low":
        return <Badge variant="outline" className="text-muted-foreground">低</Badge>;
    }
  };

  const handleContentChange = (value: string) => {
    setEditedContent(value);
    setIsEdited(true);
  };

  const handleSave = () => {
    if (selectedCase && isEdited) {
      toast.success("修改内容已暂存");
      setIsEdited(false);
    }
  };

  const resultConfig = selectedCase 
    ? reviewResultConfig[selectedCase.status] || reviewResultConfig.pending
    : reviewResultConfig.pending;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-xl font-semibold">我的测试任务</h1>
        <p className="text-sm text-muted-foreground mt-1">管理和审查您的测试任务与案例</p>
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left Panel - Task List */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <div className="h-full border-r bg-muted/30">
            <div className="p-3 border-b">
              <h2 className="text-sm font-medium text-muted-foreground">任务列表</h2>
            </div>
            <ScrollArea className="h-[calc(100%-3rem)]">
              <div className="p-2 space-y-1">
                {mockTasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer transition-colors",
                      selectedTaskId === task.id
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-muted"
                    )}
                    onClick={() => {
                      setSelectedTaskId(task.id);
                      setSelectedCaseId(null);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <span className="text-sm font-medium truncate flex-1">{task.name}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{task.caseCount} 用例</span>
                      <span>·</span>
                      <span>已审查 {task.reviewedCount}</span>
                    </div>
                    {task.status === "in_progress" && (
                      <div className="mt-2">
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(task.reviewedCount / task.caseCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Middle Panel - Test Cases */}
        <ResizablePanel defaultSize={30} minSize={20}>
          <div className="h-full border-r">
            <div className="p-3 border-b flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium">{selectedTask?.name || "测试案例"}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {cases.length} 个测试案例
                </p>
              </div>
            </div>
            <ScrollArea className="h-[calc(100%-3.5rem)]">
              <div className="p-2 space-y-1">
                {cases.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    暂无测试案例
                  </div>
                ) : (
                  cases.map((testCase) => (
                    <div
                      key={testCase.id}
                      className={cn(
                        "p-3 rounded-lg cursor-pointer transition-colors group",
                        selectedCaseId === testCase.id
                          ? "bg-primary/10 border border-primary/30"
                          : "hover:bg-muted border border-transparent"
                      )}
                      onClick={() => setSelectedCaseId(testCase.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-xs text-muted-foreground">{testCase.code}</span>
                          <span className="text-sm font-medium truncate">{testCase.name}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </div>
                      <p className="mt-1.5 text-xs text-muted-foreground truncate pl-6">
                        {testCase.scenario}
                      </p>
                      <div className="mt-2 flex items-center gap-2 pl-6">
                        {getCaseStatusBadge(testCase.status)}
                        {getPriorityBadge(testCase.priority)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel - Case Review (Larger) */}
        <ResizablePanel defaultSize={50} minSize={35}>
          <div className="h-full bg-muted/20 flex flex-col">
            {selectedCase ? (
              <>
                <div className="p-4 border-b">
                  <h2 className="font-medium">案例审查</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedCase.code} - {selectedCase.name}</p>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-6">
                    {/* BDD Content */}
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-xs">案例详情 (BDD)</Label>
                      <Textarea
                        className={cn(
                          "min-h-[280px] font-mono text-xs resize-none",
                          isEdited 
                            ? "bg-amber-50/50 border-amber-200" 
                            : "bg-background"
                        )}
                        value={editedContent}
                        onChange={(e) => handleContentChange(e.target.value)}
                      />
                      {isEdited && (
                        <p className="text-xs text-amber-600">* 内容已修改，请点击保存按钮暂存</p>
                      )}
                    </div>

                    {/* Review Result and Case Count */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-muted-foreground text-xs">审查结果</Label>
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", resultConfig.className)}
                        >
                          {resultConfig.label}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-muted-foreground text-xs">优先级</Label>
                        {getPriorityBadge(selectedCase.priority)}
                      </div>
                    </div>

                    {/* Case Source */}
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-xs">案例来源</Label>
                      <CaseSourceInfo caseId={selectedCase.id} showHeader={false} />
                    </div>
                  </div>
                </ScrollArea>
                <div className="p-4 border-t">
                  <Button 
                    className="w-full" 
                    onClick={handleSave}
                    disabled={!isEdited}
                  >
                    保存
                  </Button>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">选择一个测试案例查看详情</p>
                </div>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
