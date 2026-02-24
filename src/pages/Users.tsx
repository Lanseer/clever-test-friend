import { useState } from "react";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  UserCog,
  Building2,
  Mail,
  Phone,
  Shield,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "tester";
  workspaces: string[];
  status: "active" | "inactive";
  createdAt: string;
}

const mockWorkspaces = [
  { id: "scb", name: "SCB" },
  { id: "dbs", name: "DBS" },
  { id: "cbs", name: "CBS" },
  { id: "rnd", name: "研发中心" },
];

const mockUsers: User[] = [
  {
    id: "1",
    name: "张三",
    email: "zhangsan@example.com",
    phone: "13800138001",
    role: "admin",
    workspaces: ["scb", "dbs"],
    status: "active",
    createdAt: "2024-01-10",
  },
  {
    id: "2",
    name: "李四",
    email: "lisi@example.com",
    phone: "13800138002",
    role: "tester",
    workspaces: ["scb"],
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: "3",
    name: "王五",
    email: "wangwu@example.com",
    phone: "13800138003",
    role: "tester",
    workspaces: ["dbs", "cbs"],
    status: "active",
    createdAt: "2024-01-20",
  },
  {
    id: "4",
    name: "赵六",
    email: "zhaoliu@example.com",
    phone: "13800138004",
    role: "admin",
    workspaces: ["rnd"],
    status: "inactive",
    createdAt: "2024-02-01",
  },
];

const roleLabels: Record<string, string> = {
  admin: "测试管理员",
  tester: "测试人员",
};

export default function Users() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "tester" as "admin" | "tester",
    workspaces: [] as string[],
    status: "active" as "active" | "inactive",
  });

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        workspaces: user.workspaces,
        status: user.status,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "tester",
        workspaces: [],
        status: "active",
      });
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.email) {
      toast({
        title: "验证失败",
        description: "请填写必填项",
        variant: "destructive",
      });
      return;
    }

    if (editingUser) {
      setUsers(
        users.map((u) =>
          u.id === editingUser.id
            ? { ...u, ...formData }
            : u
        )
      );
      toast({
        title: "更新成功",
        description: `用户"${formData.name}"信息已更新`,
      });
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setUsers([newUser, ...users]);
      toast({
        title: "创建成功",
        description: `用户"${formData.name}"已创建`,
      });
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (userToDelete) {
      setUsers(users.filter((u) => u.id !== userToDelete.id));
      toast({
        title: "删除成功",
        description: `用户"${userToDelete.name}"已删除`,
      });
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const toggleWorkspace = (workspaceId: string) => {
    setFormData((prev) => ({
      ...prev,
      workspaces: prev.workspaces.includes(workspaceId)
        ? prev.workspaces.filter((w) => w !== workspaceId)
        : [...prev.workspaces, workspaceId],
    }));
  };

  const getWorkspaceNames = (workspaceIds: string[]) => {
    return workspaceIds
      .map((id) => mockWorkspaces.find((w) => w.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, status: u.status === "active" ? "inactive" as const : "active" as const }
        : u
    ));
  };

  const addWorkspaceToUser = (userId: string, workspaceId: string) => {
    setUsers(users.map(u =>
      u.id === userId && !u.workspaces.includes(workspaceId)
        ? { ...u, workspaces: [...u.workspaces, workspaceId] }
        : u
    ));
  };

  const removeWorkspaceFromUser = (userId: string, workspaceId: string) => {
    setUsers(users.map(u =>
      u.id === userId
        ? { ...u, workspaces: u.workspaces.filter(w => w !== workspaceId) }
        : u
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">用户管理</h1>
          <p className="text-sm text-muted-foreground mt-1">
            管理平台用户、角色和工作空间权限
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="w-4 h-4" />
          新增用户
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索用户名或邮箱..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户</TableHead>
              <TableHead>联系方式</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>工作空间</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-medium text-sm">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Mail className="w-3.5 h-3.5" />
                      {user.email}
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Phone className="w-3.5 h-3.5" />
                      {user.phone}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.role === "admin" ? "default" : "secondary"}
                    className="gap-1"
                  >
                    <Shield className="w-3 h-3" />
                    {roleLabels[user.role]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {user.workspaces.map((wId) => {
                      const ws = mockWorkspaces.find((w) => w.id === wId);
                      return ws ? (
                        <Badge key={wId} variant="secondary" className="gap-1 pr-1">
                          {ws.name}
                          <button
                            onClick={() => removeWorkspaceFromUser(user.id, wId)}
                            className="ml-0.5 rounded-full hover:bg-muted p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ) : null;
                    })}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Plus className="w-3.5 h-3.5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-40 p-2" align="start">
                        {mockWorkspaces
                          .filter((w) => !user.workspaces.includes(w.id))
                          .map((w) => (
                            <button
                              key={w.id}
                              className="w-full text-left text-sm px-2 py-1.5 rounded hover:bg-accent"
                              onClick={() => addWorkspaceToUser(user.id, w.id)}
                            >
                              {w.name}
                            </button>
                          ))}
                        {mockWorkspaces.filter((w) => !user.workspaces.includes(w.id)).length === 0 && (
                          <p className="text-xs text-muted-foreground px-2 py-1">已添加全部空间</p>
                        )}
                      </PopoverContent>
                    </Popover>
                  </div>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={user.status === "active"}
                    onCheckedChange={() => toggleUserStatus(user.id)}
                  />
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {user.createdAt}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenDialog(user)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        编辑
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          setUserToDelete(user);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  暂无用户数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="w-5 h-5" />
              {editingUser ? "编辑用户" : "新增用户"}
            </DialogTitle>
            <DialogDescription>
              {editingUser ? "修改用户信息和权限配置" : "创建新用户并分配角色和工作空间"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                用户名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="请输入用户名"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                邮箱 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="请输入邮箱"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">手机号</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="请输入手机号"
              />
            </div>

            <div className="space-y-2">
              <Label>角色</Label>
              <Select
                value={formData.role}
                onValueChange={(value: "admin" | "tester") =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">测试管理员</SelectItem>
                  <SelectItem value="tester">测试人员</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>工作空间</Label>
              <div className="border rounded-lg p-3 space-y-2">
                {mockWorkspaces.map((workspace) => (
                  <div
                    key={workspace.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={workspace.id}
                      checked={formData.workspaces.includes(workspace.id)}
                      onCheckedChange={() => toggleWorkspace(workspace.id)}
                    />
                    <label
                      htmlFor={workspace.id}
                      className="text-sm cursor-pointer"
                    >
                      {workspace.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>状态</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "active" | "inactive") =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">启用</SelectItem>
                  <SelectItem value="inactive">禁用</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>
              {editingUser ? "保存" : "创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除用户"{userToDelete?.name}"吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
