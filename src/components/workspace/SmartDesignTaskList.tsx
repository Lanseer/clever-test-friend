import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Clock, MessageSquare, Plus, FlaskConical, User, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
 import { useTranslation } from "react-i18next";

interface SmartDesignTask {
  id: string;
  name: string;
  selfReviewTotal: number;
  selfReviewPassed: number;
  expertReviewTotal: number;
  expertReviewPassed: number;
  createdAt: string;
  testPhase?: string;
  testCategory?: string;
  tags?: string[];
}

interface SmartDesignTaskListProps {
  tasks: SmartDesignTask[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onReport: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  onCreateTask: () => void;
  activeChatSessionId?: string | null;
  onSelectChatSession?: (sessionId: string) => void;
  onNewSession?: () => void;
  workspaceName?: string;
  userName?: string;
}

export interface ChatSession {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
}

// Mock chat sessions - use hook for translated data
export const useMockChatSessions = () => {
  const { t } = useTranslation();
  return [
    { id: "session-1", name: t('mockData.sessions.userLoginModule'), lastMessage: "", timestamp: "10:30" },
    { id: "session-2", name: t('mockData.sessions.orderPaymentAnalysis'), lastMessage: "", timestamp: t('common.yesterday') },
    { id: "session-3", name: t('mockData.sessions.apiCoverageOptimization'), lastMessage: "", timestamp: `3${t('common.daysAgo')}` },
  ];
};

// Keep static export for backward compatibility
export const mockChatSessions: ChatSession[] = [
  { id: "session-1", name: "用户登录模块测试", lastMessage: "", timestamp: "10:30" },
  { id: "session-2", name: "订单支付流程分析", lastMessage: "", timestamp: "昨天" },
  { id: "session-3", name: "接口覆盖率优化", lastMessage: "", timestamp: "3天前" },
];

export function SmartDesignTaskList({
  activeChatSessionId,
  onSelectChatSession,
  onNewSession,
  workspaceName = "SCB",
  userName = "Lanseer",
}: SmartDesignTaskListProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const chatSessions = useMockChatSessions();

  const handleWorkspaceClick = () => {
    navigate("/workspaces");
  };

  return (
    <div className="flex flex-col h-full bg-white/40 dark:bg-background/40 backdrop-blur-sm">
      {/* Header - User and Workspace Info */}
      <div className="px-4 py-4 border-b border-sky-200/50 dark:border-sky-800/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-sm text-foreground truncate">
              {userName}
            </span>
            <div 
              className="flex items-center gap-1 cursor-pointer group"
              onClick={handleWorkspaceClick}
              title="返回空间选择"
            >
              <span className="text-xs text-primary truncate group-hover:underline">
                {workspaceName}
              </span>
              <ChevronRight className="w-3 h-3 text-primary flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </div>

      {/* New Session Button */}
      <div className="px-3 py-2 border-b border-sky-200/50 dark:border-sky-800/30">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-sky-600 hover:text-sky-700 hover:bg-sky-50/50 h-9"
          onClick={onNewSession}
        >
          <Plus className="w-4 h-4" />
           <span className="text-sm">{t('smartDesign.newSession')}</span>
        </Button>
      </div>

      {/* Recent Sessions Label */}
      <div className="px-4 py-2">
         <span className="text-xs text-muted-foreground font-medium">{t('smartDesign.recent')}</span>
      </div>

      {/* Session List */}
      <ScrollArea className="flex-1">
        <div className="px-2 space-y-1">
          {chatSessions.map((session) => (
            <div
              key={session.id}
              className={cn(
                "flex flex-col gap-0.5 px-3 py-2.5 rounded-lg hover:bg-sky-50/50 cursor-pointer transition-colors",
                activeChatSessionId === session.id && "bg-sky-100/60 border border-sky-200/60"
              )}
              onClick={() => onSelectChatSession?.(session.id)}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-sm font-medium truncate flex-1">{session.name}</span>
                <span className="text-[10px] text-muted-foreground flex-shrink-0">{session.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
