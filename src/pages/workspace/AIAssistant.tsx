import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Send, 
  Bot, 
  User, 
  Loader2,
  CheckCircle,
  FileText,
  Sparkles,
  Check,
  Eye
} from "lucide-react";

interface TestCase {
  id: string;
  name: string;
  feature: string;
  confirmed: boolean;
  status: "pending" | "processed" | "modified";
  content: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ThinkingStep {
  id: string;
  content: string;
  status: "processing" | "completed";
}

// Mock data for pending cases
const mockPendingCases: TestCase[] = [
  {
    id: "1",
    name: "用户登录成功场景",
    feature: "用户认证",
    status: "modified",
    confirmed: false,
    content: "Given 用户在登录页面\nWhen 输入有效用户名和密码\nThen 登录成功",
  },
  {
    id: "2", 
    name: "用户登录失败-密码错误",
    feature: "用户认证",
    status: "modified",
    confirmed: false,
    content: "Given 用户在登录页面\nWhen 输入错误密码\nThen 显示错误提示",
  },
  {
    id: "3",
    name: "密码重置流程",
    feature: "用户认证",
    status: "modified",
    confirmed: false,
    content: "Given 用户在忘记密码页面\nWhen 输入注册邮箱\nThen 收到重置邮件",
  },
  {
    id: "4",
    name: "用户资料更新",
    feature: "用户管理",
    status: "pending",
    confirmed: false,
    content: "Given 用户已登录\nWhen 更新个人资料\nThen 保存成功",
  },
  {
    id: "5",
    name: "购物车添加商品",
    feature: "购物车",
    status: "pending",
    confirmed: false,
    content: "Given 用户在商品页\nWhen 点击添加\nThen 商品加入购物车",
  },
];

export default function AIAssistant() {
  const { workspaceId, recordId, batchId } = useParams();
  const navigate = useNavigate();
  
  const [cases, setCases] = useState<TestCase[]>(mockPendingCases);
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([
    { id: "example", content: "好的，查找到108条用例的内容格式有问题，现在开始处理", status: "completed" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<TestCase | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const modifiedCount = cases.filter(c => c.status === "modified").length;
  const confirmedCount = cases.filter(c => c.confirmed).length;
  const unconfirmedCount = cases.filter(c => c.status === "modified" && !c.confirmed).length;

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "init",
          role: "assistant",
          content: `检测到 ${modifiedCount} 条已修改用例，请问需要我帮你做什么调整？\n\n例如：\n• 查找有哪些用例描述格式有问题并帮我修改\n• 优化所有用例的场景描述\n• 检查并修正断言错误\n• 补充缺失的前置条件`,
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const simulateAIProcessing = async (userMessage: string) => {
    setIsProcessing(true);
    setThinkingSteps([]);
    
    // Step 1
    setThinkingSteps([
      { id: "1", content: "正在分析用户需求...", status: "processing" },
    ]);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 2
    setThinkingSteps(prev => [
      { ...prev[0], status: "completed" },
      { id: "2", content: "正在扫描待评审用例列表...", status: "processing" },
    ]);
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Step 3
    setThinkingSteps(prev => [
      prev[0],
      { ...prev[1], status: "completed" },
      { id: "3", content: "正在对用例场景描述进行优化修改...", status: "processing" },
    ]);
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    // Update cases - mark as modified
    const casesToProcess = Math.min(3, cases.filter(c => c.status === "pending").length);
    if (casesToProcess > 0) {
      setCases(prev => prev.map((c, index) => 
        index < casesToProcess && c.status === "pending" 
          ? { ...c, status: "modified" as const } 
          : c
      ));
    }
    
    // Step 4 - completed
    setThinkingSteps(prev => [
      prev[0],
      prev[1],
      { ...prev[2], status: "completed" },
      { id: "4", content: `已处理 ${casesToProcess} 条用例`, status: "completed" },
    ]);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Add response
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "assistant",
        content: `已完成处理！\n\n✅ 共处理了 ${casesToProcess} 条用例\n📝 优化了场景描述的表述\n🔍 检查了步骤完整性\n\n左侧用例列表已更新，已修改的用例标记为"已修改"状态。`,
        timestamp: new Date(),
      },
    ]);
    
    setIsProcessing(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;
    
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "user",
        content: inputValue,
        timestamp: new Date(),
      },
    ]);
    setInputValue("");
    
    await simulateAIProcessing(inputValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleConfirmCase = (caseId: string) => {
    setCases(prev => prev.map(c => 
      c.id === caseId ? { ...c, confirmed: true } : c
    ));
  };

  const handleViewCase = (testCase: TestCase) => {
    setSelectedCase(testCase);
    setDetailDialogOpen(true);
  };

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              智能助手
            </h1>
            <p className="text-sm text-muted-foreground">
              智能协助用例评审与优化
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>已修改: <strong className="text-amber-600">{modifiedCount}</strong></span>
          <span>已确认: <strong className="text-green-600">{confirmedCount}</strong></span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Case List */}
        <div className="w-80 border-r flex flex-col flex-shrink-0">
          <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
            <h2 className="font-medium text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              已修改用例列表
            </h2>
            {unconfirmedCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setCases(prev => prev.map(c => 
                  c.status === "modified" && !c.confirmed ? { ...c, confirmed: true } : c
                ))}
              >
                <Check className="h-3 w-3 mr-1" />
                批量确认
              </Button>
            )}
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {cases.filter(c => c.status === "modified").map((testCase) => (
                <Card 
                  key={testCase.id} 
                  className={`transition-colors ${
                    testCase.confirmed 
                      ? "border-border bg-card" 
                      : "border-amber-400/50 bg-amber-50/30"
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p 
                          className={`font-medium text-sm truncate cursor-pointer hover:underline ${
                            testCase.confirmed ? "text-foreground" : "text-amber-700"
                          }`}
                          onClick={() => handleViewCase(testCase)}
                        >
                          {testCase.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {testCase.feature}
                        </p>
                      </div>
                      {!testCase.confirmed && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs gap-1 flex-shrink-0"
                          onClick={() => handleConfirmCase(testCase.id)}
                        >
                          <Check className="h-3 w-3" />
                          确认修改
                        </Button>
                      )}
                      {testCase.confirmed && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-600 border-green-200">
                          已确认
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Thinking Process Panel */}
          <div className="border-b bg-muted/20 flex-shrink-0">
            <div className="p-3 border-b">
              <h2 className="font-medium text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                智能案例修改助手
              </h2>
            </div>
            <div className="h-28 overflow-auto p-3">
              <div className="space-y-2">
                {thinkingSteps.map((step) => (
                  <div 
                    key={step.id} 
                    className="flex items-center gap-2 text-sm"
                  >
                    {step.status === "processing" ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary flex-shrink-0" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    )}
                    <span className={step.status === "completed" ? "text-muted-foreground" : ""}>
                      {step.content}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 max-w-3xl mx-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t p-4 flex-shrink-0">
              <div className="flex gap-2 max-w-3xl mx-auto">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="输入您的指令，例如：查找有哪些用例描述格式有问题并帮我修改..."
                  disabled={isProcessing}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!inputValue.trim() || isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Case Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              用例详情
            </DialogTitle>
          </DialogHeader>
          {selectedCase && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">用例名称</p>
                <p className="font-medium mt-1">{selectedCase.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">所属功能</p>
                <p className="mt-1">{selectedCase.feature}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">用例内容</p>
                <pre className="mt-1 p-3 bg-muted rounded-lg text-sm whitespace-pre-wrap">
                  {selectedCase.content}
                </pre>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">状态:</p>
                {selectedCase.confirmed ? (
                  <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                    已确认
                  </Badge>
                ) : (
                  <Badge className="bg-amber-500">待确认</Badge>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
