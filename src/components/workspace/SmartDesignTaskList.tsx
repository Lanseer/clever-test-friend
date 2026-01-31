import { useState } from "react";
import { 
  Clock, MessageSquare, Plus, FlaskConical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

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
}

export interface ChatSession {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
}

// Mock chat sessions - exported for use in parent
export const mockChatSessions: ChatSession[] = [
  { id: "session-1", name: "用户登录模块测试", lastMessage: "帮我生成用户登录模块的测试案例", timestamp: "10:30" },
  { id: "session-2", name: "订单支付流程分析", lastMessage: "分析这个需求文档", timestamp: "昨天" },
  { id: "session-3", name: "接口覆盖率优化", lastMessage: "优化测试覆盖率", timestamp: "3天前" },
];

export function SmartDesignTaskList({
  activeChatSessionId,
  onSelectChatSession,
  onNewSession,
}: SmartDesignTaskListProps) {
  return (
    <div className="flex flex-col h-full bg-white/40 dark:bg-background/40 backdrop-blur-sm">
      {/* Header - Product Logo and Name */}
      <div className="px-4 py-4 border-b border-sky-200/50 dark:border-sky-800/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-base text-sky-800 dark:text-sky-200">
            TestHand
          </span>
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
          <span className="text-sm">新建会话</span>
        </Button>
      </div>

      {/* Recent Sessions Label */}
      <div className="px-4 py-2">
        <span className="text-xs text-muted-foreground font-medium">最近</span>
      </div>

      {/* Session List */}
      <ScrollArea className="flex-1">
        <div className="px-2 space-y-1">
          {mockChatSessions.map((session) => (
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
              <span className="text-xs text-muted-foreground truncate pl-5.5">
                {session.lastMessage}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
