import { 
  LayoutDashboard, 
  ChevronLeft,
  ArrowLeft,
  Network,
  FileCode,
  Server,
  Tags
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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

interface MenuItem {
  titleKey: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Admin menu items only
const adminMenuItems: MenuItem[] = [
  { titleKey: "workspaceMenu.dashboard", url: "dashboard", icon: LayoutDashboard },
  { titleKey: "workspaceMenu.ontology", url: "ontology", icon: Network },
  { titleKey: "workspaceMenu.templates", url: "templates", icon: FileCode },
  { titleKey: "workspaceMenu.environment", url: "environment", icon: Server },
  { titleKey: "workspaceMenu.tags", url: "tags", icon: Tags },
];

interface WorkspaceSidebarProps {
  workspaceName: string;
}

export function WorkspaceSidebar({ workspaceName }: WorkspaceSidebarProps) {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const navigate = useNavigate();
  const { t } = useTranslation();

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
              <span className="text-[10px] text-sidebar-foreground/60">{t('workspaceMenu.testWorkbench')}</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
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
                      {!isCollapsed && <span className="text-sm font-medium">{t(item.titleKey)}</span>}
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
              <span className="text-xs">{t('sidebar.collapse')}</span>
            </>
          )}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
