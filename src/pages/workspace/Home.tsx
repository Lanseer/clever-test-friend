import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
} from "lucide-react";

interface AgentCard {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
}

const agents: AgentCard[] = [
  { id: "general", name: "通用任务", icon: Sparkles, active: true },
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

export default function Home() {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("general");

  const activeAgent = agents.find((a) => a.id === selectedAgent) || agents[0];
  const ActiveIcon = activeAgent.icon;

  return (
    <div className="min-h-[calc(100vh-3rem)] flex flex-col items-center justify-center px-4 py-8">
      {/* Page Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-10 text-center">
        <span className="text-foreground">TestHand </span>
        <span className="text-primary">智能体</span>
        <span className="text-foreground"> 调用海量工具完成 </span>
        <span className="text-primary">接口测试</span>
      </h1>

      {/* Chat Input Box */}
      <div className="w-full max-w-4xl bg-card border border-border rounded-2xl shadow-sm p-4 md:p-5 transition-all duration-200 focus-within:ring-1 focus-within:ring-ring">
        {/* Mode label */}
        <div className="flex items-center gap-2 mb-3">
          <Bot className="w-5 h-5 text-foreground" />
          <span className="text-sm font-medium text-foreground">{t("home.agentLabel", "智能体")}</span>
          <span className="text-muted-foreground">|</span>
          <span className="text-sm font-medium text-primary flex items-center gap-1">
            <ActiveIcon className="w-4 h-4" />
            {activeAgent.name}
          </span>
        </div>

        {/* Textarea */}
        <Textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t("home.inputPlaceholder", "输入你的需求，我来帮你完成任务")}
          className="min-h-[120px] resize-none border-0 bg-transparent text-base placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 shadow-none"
        />

        {/* Bottom toolbar */}
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
              <span className="text-sm">{t("home.sessionIsolate", "会话隔离")}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <Users className="w-4 h-4 mr-1.5" />
              <span className="text-sm">{t("home.sessionShare", "会话共享")}</span>
            </Button>
            <Button
              size="icon"
              className="h-9 w-9 rounded-lg bg-primary/90 hover:bg-primary text-primary-foreground"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Shortcut hint */}
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
                  isActive ? "text-primary" : "text-foreground group-hover:text-primary"
                )}
              >
                {agent.name}
              </span>
              {isActive && <div className="w-6 h-1 rounded-full bg-primary mt-1" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
