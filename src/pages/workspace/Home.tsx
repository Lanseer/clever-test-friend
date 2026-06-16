import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bot,
  Send,
  Plug,
  Wand2,
  BrainCircuit,
  Shield,
  Users,
  Sparkles,
  Globe,
  Layers,
  Database,
  FileCode,
  ChevronRight,
  Plus,
  MessageSquare,
  Trash2,
} from "lucide-react";

interface AgentCard {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const agents: AgentCard[] = [
  { id: "general", name: "通用任务", icon: Sparkles },
  { id: "migration", name: "数据迁移字段映射工作流", icon: Database },
  { id: "skill", name: "Skill 编排器", icon: Layers },
  { id: "api", name: "API 智能测试智能体", icon: FileCode },
  { id: "more", name: "更多智能体", icon: ChevronRight },
];

const quickTools = [
  { id: "tools", icon: Globe, label: "海量工具" },
  { id: "connector", icon: Plug, label: "连接器" },
  { id: "skill", icon: Wand2, label: "技能" },
];

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Session {
  id: string;
  title: string;
  updatedAt: string;
  agentId: string;
  messages: ChatMessage[];
}

const initialSessions: Session[] = [
  {
    id: "s1",
    title: "用户登录接口测试",
    updatedAt: "今天 10:24",
    agentId: "api",
    messages: [
      { id: "m1", role: "user", content: "帮我生成用户登录接口的测试用例" },
      {
        id: "m2",
        role: "assistant",
        content:
          "好的，我已根据 /api/login 接口生成了 6 条测试用例，覆盖正常登录、密码错误、账号锁定、参数缺失、SQL 注入与限流场景。",
      },
    ],
  },
  {
    id: "s2",
    title: "订单字段映射梳理",
    updatedAt: "昨天 18:02",
    agentId: "migration",
    messages: [
      { id: "m1", role: "user", content: "把旧订单表字段映射到新订单表" },
      {
        id: "m2",
        role: "assistant",
        content: "已完成字段映射，共匹配 24 个字段，3 个字段需要人工确认。",
      },
    ],
  },
];

export default function Home() {
  const { t } = useTranslation();
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("general");

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;
  const activeAgent =
    agents.find(
      (a) => a.id === (activeSession ? activeSession.agentId : selectedAgent)
    ) || agents[0];
  const ActiveIcon = activeAgent.icon;

  const handleNewSession = () => {
    setActiveSessionId(null);
    setInputValue("");
  };

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;

    if (activeSession) {
      // append to existing
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? {
                ...s,
                updatedAt: "刚刚",
                messages: [
                  ...s.messages,
                  { id: `m-${Date.now()}`, role: "user", content: text },
                  {
                    id: `m-${Date.now()}-a`,
                    role: "assistant",
                    content: "已收到你的请求，正在为你处理…",
                  },
                ],
              }
            : s
        )
      );
    } else {
      const id = `s-${Date.now()}`;
      const newSession: Session = {
        id,
        title: text.length > 16 ? text.slice(0, 16) + "…" : text,
        updatedAt: "刚刚",
        agentId: selectedAgent,
        messages: [
          { id: `m-${Date.now()}`, role: "user", content: text },
          {
            id: `m-${Date.now()}-a`,
            role: "assistant",
            content: "已收到你的请求，正在为你处理…",
          },
        ],
      };
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(id);
    }
    setInputValue("");
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) setActiveSessionId(null);
  };

  return (
    <div className="h-[calc(100vh-3rem)] flex bg-background">
      {/* Left: session history */}
      <aside className="w-64 shrink-0 border-r border-border bg-card flex flex-col">
        <div className="p-3 border-b border-border">
          <Button
            onClick={handleNewSession}
            className="w-full justify-start gap-2 bg-primary/90 hover:bg-primary text-primary-foreground"
          >
            <Plus className="w-4 h-4" />
            {t("home.newSession", "新会话")}
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {sessions.length === 0 && (
              <div className="text-xs text-muted-foreground px-3 py-6 text-center">
                {t("home.noSessions", "暂无会话")}
              </div>
            )}
            {sessions.map((s) => {
              const isActive = s.id === activeSessionId;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSessionId(s.id)}
                  className={cn(
                    "w-full group flex items-start gap-2 px-3 py-2 rounded-md text-left transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <MessageSquare className="w-4 h-4 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{s.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {s.updatedAt}
                    </div>
                  </div>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => handleDeleteSession(s.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </span>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </aside>

      {/* Right: main area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {activeSession ? (
          <>
            {/* Conversation header */}
            <div className="px-6 py-3 border-b border-border flex items-center gap-2">
              <ActiveIcon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                {activeSession.title}
              </span>
              <span className="text-muted-foreground text-xs ml-2">
                · {activeAgent.name}
              </span>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1">
              <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
                {activeSession.messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "flex",
                      m.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {m.role === "user" ? (
                      <div className="max-w-[80%] px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground text-sm">
                        {m.content}
                      </div>
                    ) : (
                      <div className="max-w-[80%] text-sm text-foreground leading-relaxed">
                        {m.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Composer */}
            <div className="border-t border-border p-4">
              <div className="max-w-3xl mx-auto bg-card border border-border rounded-2xl p-3 focus-within:ring-1 focus-within:ring-ring">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={t(
                    "home.inputPlaceholder",
                    "输入你的需求，我来帮你完成任务"
                  )}
                  className="min-h-[60px] resize-none border-0 bg-transparent text-sm focus-visible:ring-0 focus-visible:ring-offset-0 p-0 shadow-none"
                />
                <div className="flex justify-end pt-2">
                  <Button
                    size="icon"
                    onClick={handleSend}
                    className="h-9 w-9 rounded-lg bg-primary/90 hover:bg-primary text-primary-foreground"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <ScrollArea className="flex-1">
            <div className="min-h-full flex flex-col items-center justify-center px-4 py-10">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-10 text-center">
                <span className="text-foreground">TestHand </span>
                <span className="text-primary">智能体</span>
                <span className="text-foreground"> 调用海量工具完成 </span>
                <span className="text-primary">接口测试</span>
              </h1>

              {/* Chat Input Box */}
              <div className="w-full max-w-4xl bg-card border border-border rounded-2xl shadow-sm p-4 md:p-5 transition-all duration-200 focus-within:ring-1 focus-within:ring-ring">
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="w-5 h-5 text-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    {t("home.agentLabel", "智能体")}
                  </span>
                  <span className="text-muted-foreground">|</span>
                  <span className="text-sm font-medium text-primary flex items-center gap-1">
                    <ActiveIcon className="w-4 h-4" />
                    {activeAgent.name}
                  </span>
                </div>

                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={t(
                    "home.inputPlaceholder",
                    "输入你的需求，我来帮你完成任务"
                  )}
                  className="min-h-[120px] resize-none border-0 bg-transparent text-base placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 shadow-none"
                />

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                    {quickTools.map((tool) => (
                      <Button
                        key={tool.id}
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-muted"
                      >
                        <tool.icon className="w-4 h-4 mr-1.5" />
                        <span className="text-sm">{tool.label}</span>
                      </Button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      <BrainCircuit className="w-4 h-4 mr-1.5" />
                      <span className="text-sm">GLM-5.2</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-primary bg-primary/10 hover:bg-primary/15 hover:text-primary"
                    >
                      <Shield className="w-4 h-4 mr-1.5" />
                      <span className="text-sm">
                        {t("home.sessionIsolate", "会话隔离")}
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      <Users className="w-4 h-4 mr-1.5" />
                      <span className="text-sm">
                        {t("home.sessionShare", "会话共享")}
                      </span>
                    </Button>
                    <Button
                      size="icon"
                      onClick={handleSend}
                      className="h-9 w-9 rounded-lg bg-primary/90 hover:bg-primary text-primary-foreground"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-3 self-end max-w-4xl w-full text-right">
                ↵ {t("home.send", "发送")}，⇧ + ↵ {t("home.newLine", "换行")}
              </p>

              {/* Agent Cards */}
              <div className="w-full max-w-5xl mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {agents.map((agent) => {
                  const isActive = agent.id === selectedAgent;
                  const Icon = agent.icon;
                  return (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent.id)}
                      className={cn(
                        "flex flex-col items-center gap-3 p-5 rounded-xl border transition-all duration-200 text-center group",
                        isActive
                          ? "border-primary/30 bg-primary/5 shadow-sm"
                          : "border-border bg-card hover:border-primary/20 hover:bg-accent/5"
                      )}
                    >
                      <div
                        className={cn(
                          "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-primary/10 text-primary group-hover:bg-primary/15"
                        )}
                      >
                        <Icon className="w-7 h-7" />
                      </div>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isActive
                            ? "text-primary"
                            : "text-foreground group-hover:text-primary"
                        )}
                      >
                        {agent.name}
                      </span>
                      {isActive && (
                        <div className="w-6 h-1 rounded-full bg-primary mt-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
