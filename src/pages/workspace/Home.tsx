import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FolderOpen, Library, ChevronDown, Folder, FileSpreadsheet } from "lucide-react";

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
  FileText,
  Eye,
  ClipboardCheck,
  X,
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

interface GeneratedFile {
  id: string;
  name: string;
  scenarioCount: number;
  caseCount: number;
  createdAt: string;
  recordId: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  generationData?: {
    scenarioCount: number;
    caseCount: number;
    fileName: string;
  };
}

interface Session {
  id: string;
  title: string;
  updatedAt: string;
  agentId: string;
  messages: ChatMessage[];
  files: GeneratedFile[];
}

const initialSessions: Session[] = [
  {
    id: "s1",
    title: "用户登录模块案例设计",
    updatedAt: "今天 10:24",
    agentId: "general",
    files: [
      {
        id: "f1",
        name: "2024-06-16生成案例_V0.1",
        scenarioCount: 6,
        caseCount: 24,
        createdAt: "今天 10:24",
        recordId: "1",
      },
    ],
    messages: [
      {
        id: "m1",
        role: "user",
        content: "基于登录模块 PRD 文档，生成完整的测试案例，覆盖正向和负向场景",
      },
      {
        id: "m2",
        role: "assistant",
        content:
          "已为你解析《登录模块PRD V1.2》，提取出 6 个测试场景，并生成 24 条 BDD 格式测试案例，涵盖账号密码登录、SSO登录、验证码登录、密码错误、账号锁定、限流等场景。",
        generationData: {
          scenarioCount: 6,
          caseCount: 24,
          fileName: "2024-06-16生成案例_V0.1",
        },
      },
    ],
  },
  {
    id: "s2",
    title: "支付流程端到端案例",
    updatedAt: "昨天 18:02",
    agentId: "general",
    files: [
      {
        id: "f2",
        name: "2024-06-15生成案例_V0.1",
        scenarioCount: 8,
        caseCount: 32,
        createdAt: "昨天 18:02",
        recordId: "2",
      },
      {
        id: "f3",
        name: "2024-06-15生成案例_V0.2",
        scenarioCount: 4,
        caseCount: 12,
        createdAt: "昨天 19:10",
        recordId: "2",
      },
    ],
    messages: [
      { id: "m1", role: "user", content: "为支付下单到回调的端到端流程生成测试案例" },
      {
        id: "m2",
        role: "assistant",
        content:
          "已生成首版案例，覆盖 8 个支付场景、共 32 条案例，包含创建订单、调起支付、支付成功回调、超时、重复支付、退款等。",
        generationData: { scenarioCount: 8, caseCount: 32, fileName: "2024-06-15生成案例_V0.1" },
      },
      { id: "m3", role: "user", content: "补充异常处理和退款相关的案例" },
      {
        id: "m4",
        role: "assistant",
        content: "已补充 4 个异常场景，共 12 条案例，包含支付超时、网络异常、部分退款、全额退款等。",
        generationData: { scenarioCount: 4, caseCount: 12, fileName: "2024-06-15生成案例_V0.2" },
      },
    ],
  },
];

interface ResourceSection {
  key: string;
  label: string;
  count: number;
  items: { id: string; name: string; icon: React.ComponentType<{ className?: string }>; iconClass?: string; isFolder?: boolean }[];
}

const resourceSections: ResourceSection[] = [
  {
    key: "attachments",
    label: "会话附件",
    count: 1,
    items: [
      { id: "a1", name: "JN-需求FSD-个人活期开户.docx", icon: FileText, iconClass: "text-blue-600" },
    ],
  },
  {
    key: "knowledge",
    label: "项目知识库",
    count: 28,
    items: [
      { id: "k1", name: "case-generation-202606", icon: Folder, iconClass: "text-amber-500", isFolder: true },
      { id: "k2", name: "需求文档汇总", icon: Folder, iconClass: "text-amber-500", isFolder: true },
      { id: "k3", name: "接口规范说明.xlsx", icon: FileSpreadsheet, iconClass: "text-green-600" },
    ],
  },
];

function ResourcePopover({ className, files, onFileClick }: { className?: string; files?: GeneratedFile[]; onFileClick?: (f: GeneratedFile) => void }) {
  const [open, setOpen] = useState<Record<string, boolean>>({
    attachments: true,
    knowledge: true,
    cases: true,
  });
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("h-9 w-9 rounded-md bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary", className)}
          title="资源"
        >
          <Folder className="w-5 h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="max-h-96 overflow-auto py-2">
          {resourceSections.map((section) => {
            const isOpen = open[section.key];
            return (
              <div key={section.key} className="px-2 py-1.5">
                <button
                  type="button"
                  onClick={() => setOpen((p) => ({ ...p, [section.key]: !p[section.key] }))}
                  className="w-full flex items-center gap-1 px-1.5 py-1 text-left hover:bg-muted/50 rounded"
                >
                  <ChevronDown
                    className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", !isOpen && "-rotate-90")}
                  />
                  <span className="text-sm font-semibold text-foreground">{section.label}</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    （{section.count}个文件）
                  </span>
                </button>
                {isOpen && (
                  <div className="mt-1 space-y-0.5">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 px-2 py-1.5 ml-4 rounded hover:bg-muted/50 cursor-pointer"
                        >
                          {item.isFolder && <ChevronDown className="w-3 h-3 text-muted-foreground -rotate-90" />}
                          <Icon className={cn("w-4 h-4 shrink-0", item.iconClass)} />
                          <span className="text-sm text-foreground truncate">{item.name}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {files && files.length > 0 && (
            <div className="px-2 py-1.5">
              <button
                type="button"
                onClick={() => setOpen((p) => ({ ...p, cases: !p.cases }))}
                className="w-full flex items-center gap-1 px-1.5 py-1 text-left hover:bg-muted/50 rounded"
              >
                <ChevronDown
                  className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", !open.cases && "-rotate-90")}
                />
                <span className="text-sm font-semibold text-foreground">测试案例</span>
                <span className="text-xs text-muted-foreground ml-1">
                  （{files.length}个文件）
                </span>
              </button>
              {open.cases && (
                <div className="mt-1 space-y-0.5">
                  {files.map((f) => (
                    <div
                      key={f.id}
                      onClick={() => onFileClick?.(f)}
                      className="flex items-center gap-2 px-2 py-1.5 ml-4 rounded hover:bg-muted/50 cursor-pointer"
                    >
                      <FileText className="w-4 h-4 shrink-0 text-primary" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-foreground truncate">{f.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {f.scenarioCount} 场景 · {f.caseCount} 案例
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}





export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { workspaceId } = useParams();
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("general");
  const [previewFile, setPreviewFile] = useState<GeneratedFile | null>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;
  const activeAgent =
    agents.find(
      (a) => a.id === (activeSession ? activeSession.agentId : selectedAgent)
    ) || agents[0];
  const ActiveIcon = activeAgent.icon;

  const handleNewSession = () => {
    setActiveSessionId(null);
    setInputValue("");
    setPreviewFile(null);
  };

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;

    const ts = Date.now();
    const fileName = `${new Date().toISOString().slice(0, 10)}生成案例_V0.${(activeSession?.files.length ?? 0) + 1}`;
    const scenarioCount = 4 + Math.floor(Math.random() * 4);
    const caseCount = scenarioCount * 4;
    const newFile: GeneratedFile = {
      id: `f-${ts}`,
      name: fileName,
      scenarioCount,
      caseCount,
      createdAt: "刚刚",
      recordId: activeSession?.files[0]?.recordId ?? "1",
    };

    if (activeSession) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? {
                ...s,
                updatedAt: "刚刚",
                files: [...s.files, newFile],
                messages: [
                  ...s.messages,
                  { id: `m-${ts}`, role: "user", content: text },
                  {
                    id: `m-${ts}-a`,
                    role: "assistant",
                    content: `已基于你的需求生成案例文件 ${fileName}，共 ${scenarioCount} 个场景、${caseCount} 条案例。`,
                    generationData: { scenarioCount, caseCount, fileName },
                  },
                ],
              }
            : s
        )
      );
    } else {
      const id = `s-${ts}`;
      const newSession: Session = {
        id,
        title: text.length > 16 ? text.slice(0, 16) + "…" : text,
        updatedAt: "刚刚",
        agentId: selectedAgent,
        files: [newFile],
        messages: [
          { id: `m-${ts}`, role: "user", content: text },
          {
            id: `m-${ts}-a`,
            role: "assistant",
            content: `已基于你的需求生成案例文件 ${fileName}，共 ${scenarioCount} 个场景、${caseCount} 条案例。`,
            generationData: { scenarioCount, caseCount, fileName },
          },
        ],
      };
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(id);
    }
    setInputValue("");
  };

  const handleReview = (file: GeneratedFile) => {
    const base = workspaceId ? `/workspace/${workspaceId}` : "..";
    navigate(`${base}/management/ai-cases/${file.recordId}/case-review`);
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
            <div className="px-6 py-3 border-b border-border flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <ActiveIcon className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-medium text-foreground truncate">
                  {activeSession.title}
                </span>
                <span className="text-muted-foreground text-xs shrink-0">
                  · {activeAgent.name}
                </span>
              </div>

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
              <div className="max-w-3xl mx-auto flex flex-col items-end">
                <ResourcePopover files={activeSession.files} onFileClick={setPreviewFile} />
                <div className="w-full bg-card border border-border rounded-2xl p-3 focus-within:ring-1 focus-within:ring-ring">
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
                  <div className="flex items-center justify-end gap-2 pt-2">
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
              <div className="w-full max-w-4xl flex flex-col items-end mx-auto">
                <ResourcePopover />
                <div className="w-full bg-card border border-border rounded-2xl shadow-sm p-4 md:p-5 transition-all duration-200 focus-within:ring-1 focus-within:ring-ring">
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

      {/* Right: file preview panel */}
      {activeSession && previewFile && (
        <aside className="w-[420px] shrink-0 border-l border-border bg-card flex flex-col">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">
                {previewFile.name}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {previewFile.scenarioCount} 个场景 · {previewFile.caseCount} 条案例
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setPreviewFile(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {Array.from({ length: previewFile.scenarioCount }).map((_, sIdx) => {
                const perScenario = Math.ceil(previewFile.caseCount / previewFile.scenarioCount);
                return (
                  <div key={sIdx} className="border border-border rounded-lg overflow-hidden">
                    <div className="px-3 py-2 bg-muted/40 border-b border-border flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        场景 {sIdx + 1}：测试场景示例
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {perScenario} 条
                      </Badge>
                    </div>
                    <div className="divide-y divide-border">
                      {Array.from({ length: perScenario }).map((__, cIdx) => (
                        <div key={cIdx} className="px-3 py-2 text-xs text-muted-foreground">
                          <span className="text-foreground font-medium">
                            TC-{sIdx + 1}.{cIdx + 1}
                          </span>{" "}
                          案例示例：当用户执行操作 {cIdx + 1} 时，系统应返回预期结果。
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          <div className="border-t border-border p-3 bg-card">
            <Button
              className="w-full gap-2 bg-primary/90 hover:bg-primary text-primary-foreground"
              onClick={() => handleReview(previewFile)}
            >
              <ClipboardCheck className="w-4 h-4" />
              开始审查
            </Button>
          </div>
        </aside>

      )}
    </div>
  );
}
