import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Sparkles, 
  X, 
  ListTodo, 
  FileBarChart, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Bot,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface TaskSummary {
  total: number;
  inProgress: number;
  completed: number;
  pending: number;
}

interface QuickTask {
  id: string;
  name: string;
  status: "pending" | "in_progress" | "completed";
  progress?: number;
}

const mockTaskSummary: TaskSummary = {
  total: 12,
  inProgress: 3,
  completed: 7,
  pending: 2,
};

const mockQuickTasks: QuickTask[] = [
  { id: "1", name: "用户登录模块测试", status: "in_progress", progress: 65 },
  { id: "2", name: "支付流程测试", status: "in_progress", progress: 30 },
  { id: "3", name: "订单管理测试", status: "pending" },
  { id: "4", name: "商品搜索测试", status: "completed" },
];

interface SpriteMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function TestSpriteButton() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"tasks" | "chat">("tasks");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<SpriteMessage[]>([
    {
      id: "init",
      role: "assistant",
      content: "你好！我是测试精灵，可以帮你管理测试任务、查看任务状态、生成报告等。有什么需要帮助的吗？",
    },
  ]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: chatInput },
      { 
        id: (Date.now() + 1).toString(), 
        role: "assistant", 
        content: "好的，我来帮你处理这个请求。你可以点击上方的「任务管理」查看所有测试任务，或者直接告诉我你想做什么。" 
      },
    ]);
    setChatInput("");
  };

  const handleNavigateToTask = (taskId: string) => {
    navigate(`/workspace/${workspaceId}/management/ai-cases`);
    setIsOpen(false);
  };

  const getStatusIcon = (status: QuickTask["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />;
      case "in_progress":
        return <Clock className="w-3.5 h-3.5 text-amber-500" />;
      case "pending":
        return <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: QuickTask["status"]) => {
    switch (status) {
      case "completed":
        return "已完成";
      case "in_progress":
        return "进行中";
      case "pending":
        return "待处理";
    }
  };

  return (
    <>
      {/* Floating Button with breathing animation */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full",
          "bg-gradient-to-br from-violet-500 to-purple-600 text-white",
          "shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40",
          "flex items-center justify-center",
          "transition-all duration-300 hover:scale-110",
          isOpen && "scale-0 opacity-0"
        )}
        style={{
          animation: isOpen ? "none" : "breathe 2s ease-in-out infinite",
        }}
      >
        <Sparkles className="w-6 h-6" />
        {/* Task count badge */}
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center">
          {mockTaskSummary.inProgress}
        </span>
      </button>

      {/* Global styles for breathing animation */}
      <style>{`
        @keyframes breathe {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 10px 25px -5px rgba(139, 92, 246, 0.3);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 15px 35px -5px rgba(139, 92, 246, 0.5);
          }
        }
      `}</style>

      {/* Expanded Panel */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 w-80 bg-background border rounded-2xl shadow-2xl overflow-hidden",
          "transition-all duration-300 origin-bottom-right",
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">测试精灵</h3>
                <p className="text-[10px] text-white/70">智能测试助手</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Task Summary Stats */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="bg-white/10 rounded-lg px-2 py-1.5 text-center">
              <div className="text-lg font-bold">{mockTaskSummary.total}</div>
              <div className="text-[10px] text-white/70">总任务</div>
            </div>
            <div className="bg-white/10 rounded-lg px-2 py-1.5 text-center">
              <div className="text-lg font-bold text-amber-300">{mockTaskSummary.inProgress}</div>
              <div className="text-[10px] text-white/70">进行中</div>
            </div>
            <div className="bg-white/10 rounded-lg px-2 py-1.5 text-center">
              <div className="text-lg font-bold text-green-300">{mockTaskSummary.completed}</div>
              <div className="text-[10px] text-white/70">已完成</div>
            </div>
          </div>
        </div>

        {/* Tab Switch */}
        <div className="flex border-b">
          <button
            className={cn(
              "flex-1 py-2 text-xs font-medium transition-colors",
              activeTab === "tasks" 
                ? "text-primary border-b-2 border-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab("tasks")}
          >
            <ListTodo className="w-3.5 h-3.5 inline-block mr-1" />
            任务管理
          </button>
          <button
            className={cn(
              "flex-1 py-2 text-xs font-medium transition-colors",
              activeTab === "chat" 
                ? "text-primary border-b-2 border-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab("chat")}
          >
            <Bot className="w-3.5 h-3.5 inline-block mr-1" />
            对话
          </button>
        </div>

        {/* Content */}
        <div className="h-64">
          {activeTab === "tasks" ? (
            <ScrollArea className="h-full">
              <div className="p-3 space-y-2">
                {/* Quick Actions */}
                <div className="flex gap-2 mb-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs gap-1"
                    onClick={() => {
                      navigate(`/workspace/${workspaceId}/management/ai-cases`);
                      setIsOpen(false);
                    }}
                  >
                    <ListTodo className="w-3.5 h-3.5" />
                    全部任务
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs gap-1"
                    onClick={() => {
                      navigate(`/workspace/${workspaceId}/management/test-report`);
                      setIsOpen(false);
                    }}
                  >
                    <FileBarChart className="w-3.5 h-3.5" />
                    测试报告
                  </Button>
                </div>

                {/* Recent Tasks */}
                <div className="text-xs text-muted-foreground mb-2">近期任务</div>
                {mockQuickTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-2.5 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors group"
                    onClick={() => handleNavigateToTask(task.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {getStatusIcon(task.status)}
                        <span className="text-sm truncate">{task.name}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {task.status === "in_progress" && task.progress !== undefined && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                          <span>{getStatusText(task.status)}</span>
                          <span>{task.progress}%</span>
                        </div>
                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {task.status === "completed" && (
                      <Badge variant="outline" className="mt-1.5 text-[10px] bg-green-50 text-green-600 border-green-200">
                        已完成
                      </Badge>
                    )}
                    {task.status === "pending" && (
                      <Badge variant="outline" className="mt-1.5 text-[10px]">
                        待处理
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col h-full">
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "text-xs p-2.5 rounded-lg max-w-[90%]",
                        msg.role === "user" 
                          ? "ml-auto bg-primary text-primary-foreground" 
                          : "bg-muted"
                      )}
                    >
                      {msg.content}
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-2 border-t flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="输入问题..."
                  className="h-8 text-xs"
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button 
                  size="icon" 
                  className="h-8 w-8 bg-gradient-to-r from-violet-500 to-purple-600"
                  onClick={handleSendMessage}
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
