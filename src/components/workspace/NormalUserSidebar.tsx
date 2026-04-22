import { Sparkles, PlayCircle, Server, Tags as TagsIcon, User, ChevronRight } from "lucide-react";
import { NavLink, useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface NormalUserSidebarProps {
  workspaceName?: string;
  userName?: string;
}

const mockWorkspaces: Record<string, { name: string }> = {
  scb: { name: "SCB" },
  dbs: { name: "DBS" },
  cbs: { name: "CBS" },
  rnd: { name: "研发中心" },
};

export function NormalUserSidebar({ userName = "Lanseer", workspaceName }: NormalUserSidebarProps) {
  const navigate = useNavigate();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const location = useLocation();
  const { t } = useTranslation();

  const wsName = workspaceName || (workspaceId ? mockWorkspaces[workspaceId]?.name : "工作空间");

  const menuItems = [
    {
      label: t("workspaceMenu.smartDesign", { defaultValue: "智能设计" }),
      icon: Sparkles,
      path: "management/ai-cases",
      match: "management/ai-cases",
    },
    {
      label: t("workspaceMenu.smartExecution", { defaultValue: "智能执行" }),
      icon: PlayCircle,
      path: "management/my-test-tasks",
      match: "management/my-test-tasks",
    },
    {
      label: t("workspaceMenu.environment", { defaultValue: "测试环境" }),
      icon: Server,
      path: "environment",
      match: "/environment",
    },
    {
      label: t("workspaceMenu.tags", { defaultValue: "标签" }),
      icon: TagsIcon,
      path: "tags",
      match: "/tags",
    },
  ];

  const handleWorkspaceClick = () => {
    navigate("/workspaces");
  };

  return (
    <div className="w-48 flex-shrink-0 flex flex-col h-full bg-white/60 dark:bg-background/60 backdrop-blur-sm border-r border-sky-200/50 dark:border-sky-800/30 relative z-10">
      {/* Header - User and Workspace Info */}
      <div className="px-4 py-4 border-b border-sky-200/50 dark:border-sky-800/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md flex-shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-sm text-foreground truncate">{userName}</span>
            <div
              className="flex items-center gap-1 cursor-pointer group"
              onClick={handleWorkspaceClick}
              title="返回空间选择"
            >
              <span className="text-xs text-primary truncate group-hover:underline">{wsName}</span>
              <ChevronRight className="w-3 h-3 text-primary flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.includes(item.match);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md font-medium"
                  : "text-foreground/70 hover:text-foreground hover:bg-sky-50 dark:hover:bg-sky-950/30"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
