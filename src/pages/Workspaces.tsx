import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Search, 
  Users, 
  FileText, 
  Clock, 
  MoreHorizontal,
  Settings,
  Trash2,
  ArrowRight,
  Folder,
  Shield,
  UserRound
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useRole, UserRole } from "@/contexts/RoleContext";

interface Workspace {
  id: string;
  name: string;
  description: string;
  members: number;
  documents: number;
  lastActive: string;
  color: string;
}

const mockWorkspaces: Workspace[] = [
  { id: "scb", name: "SCB", description: "渣打银行测试项目空间", members: 12, documents: 156, lastActive: "30分钟前", color: "142 76% 36%" },
  { id: "dbs", name: "DBS", description: "星展银行测试项目空间", members: 8, documents: 89, lastActive: "2小时前", color: "217 91% 60%" },
  { id: "cbs", name: "CBS", description: "招商银行测试项目空间", members: 15, documents: 234, lastActive: "刚刚", color: "0 84% 60%" },
  { id: "rnd", name: "研发中心", description: "内部研发测试项目空间", members: 20, documents: 312, lastActive: "1小时前", color: "262 83% 58%" },
];

export default function Workspaces() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { setRole } = useRole();

  const filteredWorkspaces = mockWorkspaces.filter(ws =>
    ws.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ws.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleWorkspaceClick = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setRoleDialogOpen(true);
  };

  const handleRoleSelect = (role: UserRole) => {
    setRole(role);
    setRoleDialogOpen(false);
    if (selectedWorkspace) {
      navigate(`/workspace/${selectedWorkspace.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 glass border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">工作空间</h1>
              <p className="text-sm text-muted-foreground mt-1">管理您的测试项目空间</p>
            </div>
            <Button className="gradient-primary text-primary-foreground shadow-lg hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4 mr-2" />
              创建空间
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索工作空间..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>

        {/* Workspace Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkspaces.map((workspace, index) => (
            <div
              key={workspace.id}
              className="group bg-card rounded-xl border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden animate-scale-in cursor-pointer"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => handleWorkspaceClick(workspace)}
            >
              {/* Color Bar */}
              <div 
                className="h-2"
                style={{ backgroundColor: `hsl(${workspace.color})` }}
              />
              
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `hsl(${workspace.color} / 0.1)` }}
                    >
                      <Folder 
                        className="w-6 h-6"
                        style={{ color: `hsl(${workspace.color})` }}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {workspace.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {workspace.description}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Settings className="w-4 h-4 mr-2" />
                        空间设置
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        删除空间
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>{workspace.members} 成员</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    <span>{workspace.documents} 文档</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>活跃于 {workspace.lastActive}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-primary hover:text-primary hover:bg-primary/10 gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    进入
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredWorkspaces.length === 0 && (
          <div className="text-center py-12">
            <Folder className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">暂无匹配的工作空间</p>
          </div>
        )}
      </div>

      {/* Role Selection Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>选择进入角色</DialogTitle>
            <DialogDescription>
              请选择您要以哪种角色进入 <span className="font-medium text-foreground">{selectedWorkspace?.name}</span> 工作空间
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <button
              onClick={() => handleRoleSelect("admin")}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-amber-500 hover:bg-amber-500/5 transition-all group"
            >
              <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                <Shield className="w-8 h-8 text-amber-500" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">管理员</p>
                <p className="text-xs text-muted-foreground mt-1">完整功能访问</p>
              </div>
            </button>
            <button
              onClick={() => handleRoleSelect("user")}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-blue-500 hover:bg-blue-500/5 transition-all group"
            >
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <UserRound className="w-8 h-8 text-blue-500" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">普通人员</p>
                <p className="text-xs text-muted-foreground mt-1">智能设计功能</p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
