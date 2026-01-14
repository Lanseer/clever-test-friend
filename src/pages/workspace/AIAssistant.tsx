import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  Send, 
  Bot, 
  User, 
  Loader2,
  CheckCircle,
  FileText,
  Sparkles
} from "lucide-react";

interface TestCase {
  id: string;
  name: string;
  feature: string;
  scenario: string;
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
  timestamp: Date;
}

// Mock data for pending cases
const mockPendingCases: TestCase[] = [
  {
    id: "1",
    name: "用户登录成功验证",
    feature: "用户认证",
    scenario: "用户使用有效凭证登录",
    status: "pending",
    content: "Given 用户在登录页面\nWhen 输入有效用户名和密码\nThen 登录成功并跳转到首页",
  },
  {
    id: "2", 
    name: "用户登录失败验证",
    feature: "用户认证",
    scenario: "用户使用无效凭证登录",
    status: "pending",
    content: "Given 用户在登录页面\nWhen 输入无效用户名或密码\nThen 显示错误提示",
  },
  {
    id: "3",
    name: "密码重置流程",
    feature: "用户认证",
    scenario: "用户请求重置密码",
    status: "pending",
    content: "Given 用户在忘记密码页面\nWhen 输入注册邮箱\nThen 收到密码重置邮件",
  },
  {
    id: "4",
    name: "购物车添加商品",
    feature: "购物车",
    scenario: "用户添加商品到购物车",
    status: "pending",
    content: "Given 用户在商品详情页\nWhen 点击添加到购物车\nThen 商品出现在购物车中",
  },
  {
    id: "5",
    name: "订单创建流程",
    feature: "订单管理",
    scenario: "用户创建新订单",
    status: "pending",
    content: "Given 购物车有商品\nWhen 用户提交订单\nThen 订单创建成功",
  },
];

export default function AIAssistant() {
  const { workspaceId, recordId, batchId } = useParams();
  const navigate = useNavigate();
  
  const [cases, setCases] = useState<TestCase[]>(mockPendingCases);
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const pendingCount = cases.filter(c => c.status === "pending").length;
  const processedCount = cases.filter(c => c.status === "processed" || c.status === "modified").length;

  useEffect(() => {
    // Add initial assistant message
    if (messages.length === 0) {
      setMessages([
        {
          id: "init",
          role: "assistant",
          content: `检测到 ${pendingCount} 条未评审用例，请问需要我帮你做什么调整？\n\n例如：\n• 优化所有用例的场景描述\n• 检查并修正断言错误\n• 补充缺失的前置条件\n• 统一用例格式`,
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
    
    // Add thinking steps
    const steps: ThinkingStep[] = [
      { id: "1", content: "正在分析用户需求...", status: "processing", timestamp: new Date() },
    ];
    setThinkingSteps(steps);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setThinkingSteps(prev => [
      { ...prev[0], status: "completed" },
      { id: "2", content: "正在扫描待评审用例列表...", status: "processing", timestamp: new Date() },
    ]);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setThinkingSteps(prev => [
      prev[0],
      { ...prev[1], status: "completed" },
      { id: "3", content: "正在对用例场景描述进行优化修改...", status: "processing", timestamp: new Date() },
    ]);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update some cases as processed
    const casesToProcess = Math.min(3, cases.filter(c => c.status === "pending").length);
    setCases(prev => prev.map((c, index) => 
      index < casesToProcess ? { ...c, status: "modified" as const } : c
    ));
    
    setThinkingSteps(prev => [
      prev[0],
      prev[1],
      { ...prev[2], status: "completed" },
      { id: "4", content: `已处理 ${casesToProcess} 条用例`, status: "completed", timestamp: new Date() },
    ]);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Add assistant response
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "assistant",
        content: `已完成处理！\n\n✅ 共处理了 ${casesToProcess} 条用例\n📝 优化了场景描述的表述\n🔍 检查了步骤完整性\n\n左侧用例列表已更新，已修改的用例标记为"已修改"状态。您可以点击查看具体的修改内容。\n\n还需要我帮您处理其他用例吗？`,
        timestamp: new Date(),
      },
    ]);
    
    setIsProcessing(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setThinkingSteps([]);
    
    await simulateAIProcessing(inputValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusBadge = (status: TestCase["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">待评审</Badge>;
      case "processed":
        return <Badge variant="default">已处理</Badge>;
      case "modified":
        return <Badge className="bg-amber-500 hover:bg-amber-600">已修改</Badge>;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between">
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
              AI 助手
            </h1>
            <p className="text-sm text-muted-foreground">
              智能协助用例评审与优化
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>待评审: {pendingCount}</span>
          <span>•</span>
          <span>已处理: {processedCount}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Case List */}
        <div className="w-80 border-r flex flex-col">
          <div className="p-3 border-b bg-muted/30">
            <h2 className="font-medium text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              待评审用例列表
            </h2>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {cases.map((testCase) => (
                <Card 
                  key={testCase.id} 
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    testCase.status === "modified" ? "border-amber-500/50" : ""
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {testCase.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {testCase.feature}
                        </p>
                      </div>
                      {getStatusBadge(testCase.status)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex flex-col">
          {/* Thinking Process Panel */}
          <div className="border-b bg-muted/20">
            <div className="p-3 border-b">
              <h2 className="font-medium text-sm flex items-center gap-2">
                <Bot className="h-4 w-4" />
                AI 思考过程
              </h2>
            </div>
            <ScrollArea className="h-32">
              <div className="p-3 space-y-2">
                {thinkingSteps.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    等待处理指令...
                  </p>
                ) : (
                  thinkingSteps.map((step) => (
                    <div 
                      key={step.id} 
                      className="flex items-center gap-2 text-sm"
                    >
                      {step.status === "processing" ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      <span className={step.status === "completed" ? "text-muted-foreground" : ""}>
                        {step.content}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
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
                      className={`max-w-[70%] rounded-lg p-3 ${
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
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="输入您的指令，例如：优化所有用例的场景描述..."
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
    </div>
  );
}
