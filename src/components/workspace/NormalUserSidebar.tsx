import {
  Sparkles,
  PlayCircle,
  FileBarChart,
  Server,
  Tags as TagsIcon,
  ChevronLeft,
  ArrowLeft,
  Database,
  LayoutDashboard,
  ClipboardList,
  BookOpen,
  Home,
} from "lucide-react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MenuItem {
  titleKey: string;
  defaultLabel: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: MenuItem[];
}

const normalUserMenuItems: MenuItem[] = [
  { titleKey: "workspaceMenu.home", defaultLabel: "首页", url: "home", icon: Home },
  { titleKey: "workspaceMenu.kanban", defaultLabel: "看板", url: "dashboard", icon: LayoutDashboard },
  { titleKey: "workspaceMenu.testManagement", defaultLabel: "测试管理", url: "management/my-test-tasks", icon: ClipboardList },
  { titleKey: "workspaceMenu.smartDesign", defaultLabel: "智能设计", url: "management/ai-cases", icon: Sparkles },
  { titleKey: "workspaceMenu.testExecution", defaultLabel: "测试执行", url: "smart-execution", icon: PlayCircle },
  { titleKey: "workspaceMenu.testData", defaultLabel: "测试数据", url: "smart-execution/test-data", icon: Database },
  { titleKey: "workspaceMenu.testReport", defaultLabel: "测试报告", url: "test-report", icon: FileBarChart },
  { titleKey: "workspaceMenu.knowledgeBase", defaultLabel: "知识库", url: "knowledge", icon: BookOpen },
  { titleKey: "workspaceMenu.environment", defaultLabel: "测试环境", url: "environment", icon: Server },
  { titleKey: "workspaceMenu.tags", defaultLabel: "标签", url: "tags", icon: TagsIcon },
];

interface NormalUserSidebarProps {
  workspaceName?: string;
}

export function NormalUserSidebar({ workspaceName = "工作空间" }: NormalUserSidebarProps) {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const isPathActive = (url: string) => {
    const normalizedUrl = url.replace(/^\/+|\/+$/g, "");
    const urlParts = normalizedUrl.split("/");
    const pathParts = pathname.split("/").filter(Boolean);
    if (pathParts.length < urlParts.length) return false;
    const endParts = pathParts.slice(-urlParts.length);
    return endParts.join("/") === normalizedUrl;
  };

  return (
    <Sidebar
      className={cn(
        "border-r-0 transition-all duration-300",
        isCollapsed ? "w-14" : "w-52"
      )}
      collapsible="icon"
    >
      <SidebarHeader className="p-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground"
            onClick={() => navigate("/workspaces")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sidebar-foreground text-xs truncate">
                {workspaceName}
              </span>
              <span className="text-[10px] text-sidebar-foreground/60">
                {t("workspaceMenu.testWorkbench")}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {normalUserMenuItems.map((item) => {
                const isParentActive = item.children?.some((child) => isPathActive(child.url)) ?? false;
                return (
                  <SidebarMenuItem key={item.titleKey}>
                    <SidebarMenuButton asChild className="h-9">
                      <NavLink
                        to={item.url}
                        end={item.url === "smart-execution"}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all duration-200",
                            "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                            (isActive || isParentActive) &&
                              "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground shadow-md"
                          )
                        }
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        {!isCollapsed && (
                          <span className="text-sm font-medium">
                            {t(item.titleKey, { defaultValue: item.defaultLabel })}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                    {item.children && (
                      <SidebarMenuSub>
                        {item.children.map((child) => (
                          <SidebarMenuSubItem key={child.titleKey}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isPathActive(child.url)}
                              size="sm"
                            >
                              <NavLink to={child.url}>
                                <child.icon className="w-4 h-4" />
                                <span>{t(child.titleKey, { defaultValue: child.defaultLabel })}</span>
                              </NavLink>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="w-full justify-center text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent h-8"
        >
          {isCollapsed ? (
            <ChevronLeft className="w-4 h-4 rotate-180" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span className="text-xs">{t("sidebar.collapse")}</span>
            </>
          )}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
