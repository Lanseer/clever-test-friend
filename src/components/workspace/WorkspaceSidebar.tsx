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
  ArrowLeft
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
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

const workspaceMenuItems = [
  { title: "数据大屏", url: "dashboard", icon: LayoutDashboard },
  { title: "测试管理", url: "management", icon: ClipboardList },
  { title: "测试数据", url: "data", icon: Database },
  { title: "测试计划", url: "plan", icon: Calendar },
  { title: "测试报告", url: "report", icon: FileText },
  { title: "知识库", url: "knowledge", icon: BookOpen },
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
              {workspaceMenuItems.map((item, index) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-9">
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all duration-200",
                          "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                          isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground shadow-md",
                          index === 0 && "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                        )
                      }
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {!isCollapsed && <span className="text-sm font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
