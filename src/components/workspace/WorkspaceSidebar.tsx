import { 
  LayoutDashboard, 
  ClipboardList, 
  Database, 
  Calendar, 
  FileText, 
  BookOpen, 
  Server, 
  Tags,
  ChevronLeft,
  ArrowLeft,
  ChevronDown,
  FlaskConical,
  Sparkles,
  Network
} from "lucide-react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { title: string; url: string; icon: React.ComponentType<{ className?: string }> }[];
}

const workspaceMenuItems: MenuItem[] = [
  { title: "数据看板", url: "dashboard", icon: LayoutDashboard },
  { 
    title: "测试管理", 
    url: "management", 
    icon: ClipboardList,
    children: [
      { title: "测试用例", url: "management/cases", icon: FlaskConical },
      { title: "智能用例设计", url: "management/ai-cases", icon: Sparkles },
    ]
  },
  { title: "测试数据", url: "data", icon: Database },
  { title: "测试计划", url: "plan", icon: Calendar },
  { title: "测试报告", url: "report", icon: FileText },
  { title: "知识库", url: "knowledge", icon: BookOpen },
  { title: "测试本体", url: "ontology", icon: Network },
  { title: "环境", url: "environment", icon: Server },
  { title: "标签", url: "tags", icon: Tags },
];

interface WorkspaceSidebarProps {
  workspaceName: string;
}

export function WorkspaceSidebar({ workspaceName }: WorkspaceSidebarProps) {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<string[]>(["测试管理"]);

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const isChildActive = (item: MenuItem) => {
    if (!item.children) return false;
    return item.children.some((child) => location.pathname.includes(child.url));
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
              <span className="font-semibold text-sidebar-foreground text-xs truncate">{workspaceName}</span>
              <span className="text-[10px] text-sidebar-foreground/60">测试工作台</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {workspaceMenuItems.map((item) => {
                if (item.children) {
                  const isOpen = openMenus.includes(item.title);
                  const hasActiveChild = isChildActive(item);

                  return (
                    <Collapsible
                      key={item.title}
                      open={isOpen}
                      onOpenChange={() => toggleMenu(item.title)}
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="h-9 w-full px-0">
                            <div
                              className={cn(
                                "flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg transition-all duration-200",
                                "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                                hasActiveChild && "text-sidebar-foreground"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <item.icon className="w-4 h-4 flex-shrink-0" />
                                {!isCollapsed && <span className="text-sm font-medium">{item.title}</span>}
                              </div>
                              {!isCollapsed && (
                                <ChevronDown
                                  className={cn(
                                    "w-3.5 h-3.5 transition-transform duration-200",
                                    isOpen && "rotate-180"
                                  )}
                                />
                              )}
                            </div>
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-1 space-y-1">
                          {item.children.map((child) => (
                            <SidebarMenuButton key={child.title} asChild className="h-8">
                              <NavLink
                                to={child.url}
                                className={({ isActive }) =>
                                  cn(
                                    "flex items-center gap-2 px-2.5 py-1.5 ml-6 rounded-lg transition-all duration-200",
                                    "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                                    isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground shadow-md"
                                  )
                                }
                              >
                                <child.icon className="w-3.5 h-3.5 flex-shrink-0" />
                                {!isCollapsed && <span className="text-xs font-medium">{child.title}</span>}
                              </NavLink>
                            </SidebarMenuButton>
                          ))}
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="h-9">
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all duration-200",
                            "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                            isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground shadow-md"
                          )
                        }
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        {!isCollapsed && <span className="text-sm font-medium">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
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
              <span className="text-xs">收起</span>
            </>
          )}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
