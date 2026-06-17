import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Search, Plus, Sparkles, Trash2, PlayCircle, Tag, Clock, User, Globe, Code2, Upload, FileText, Database, Folder, ChevronRight, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { cn } from "@/lib/utils";
import { CaseGroupSidebar, CaseGroup } from "@/components/workspace/CaseGroupSidebar";
import { toast } from "sonner";

type TestType = "UI" | "API";

interface TestCase {
  id: string;
  name: string;
  tags: string[];
  environment: string;
  testType: TestType;
  creator: string;
  updatedAt: string;
  groupId: string;
}

const mockTestCases: TestCase[] = [
  { id: "1", name: "用户登录功能测试", tags: ["登录", "核心功能"], environment: "测试环境", testType: "UI", creator: "张三", updatedAt: "2024-01-15 14:30", groupId: "login" },
  { id: "2", name: "支付流程完整性测试", tags: ["支付", "关键路径"], environment: "预发布环境", testType: "UI", creator: "李四", updatedAt: "2024-01-14 16:20", groupId: "payment" },
  { id: "3", name: "用户注册接口验证", tags: ["注册", "接口"], environment: "测试环境", testType: "API", creator: "王五", updatedAt: "2024-01-13 09:15", groupId: "login" },
  { id: "4", name: "订单状态流转测试", tags: ["订单", "状态机"], environment: "开发环境", testType: "API", creator: "赵六", updatedAt: "2024-01-12 11:45", groupId: "order" },
  { id: "5", name: "API接口响应时间测试", tags: ["性能", "API"], environment: "测试环境", testType: "API", creator: "张三", updatedAt: "2024-01-11 15:00", groupId: "api" },
  { id: "6", name: "用户登录失败-密码错误", tags: ["登录", "异常处理"], environment: "测试环境", testType: "UI", creator: "李四", updatedAt: "2024-01-10 10:00", groupId: "login" },
  { id: "7", name: "支付超时异常处理", tags: ["支付", "异常处理"], environment: "测试环境", testType: "API", creator: "王五", updatedAt: "2024-01-09 14:00", groupId: "payment" },
  { id: "8", name: "订单取消边界测试", tags: ["订单", "边界测试"], environment: "测试环境", testType: "UI", creator: "赵六", updatedAt: "2024-01-08 16:00", groupId: "order-child" },
];

const initialGroups: CaseGroup[] = [
  { id: "login", name: "登录模块", count: 3, children: [{ id: "login-sso", name: "SSO登录", count: 0 }] },
  { id: "payment", name: "支付模块", count: 2 },
  { id: "order", name: "订单模块", count: 1, children: [{ id: "order-child", name: "订单取消", count: 1 }] },
  { id: "api", name: "API测试", count: 1 },
];

const testTypeConfig: Record<TestType, { className: string; icon: typeof Globe }> = {
  UI: { className: "bg-blue-500/10 text-blue-600 border-blue-200", icon: Globe },
  API: { className: "bg-purple-500/10 text-purple-600 border-purple-200", icon: Code2 },
};

export default function TestCases() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groups, setGroups] = useState<CaseGroup[]>(initialGroups);
  const [cases, setCases] = useState<TestCase[]>(mockTestCases);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [newCase, setNewCase] = useState({
    name: "",
    testType: "UI" as TestType,
    tags: "",
  });
  const navigate = useNavigate();
  const { workspaceId } = useParams();

  const getAllGroupIds = (group: CaseGroup): string[] => {
    const ids = [group.id];
    group.children?.forEach((c) => ids.push(...getAllGroupIds(c)));
    return ids;
  };

  const getSelectedGroupIds = (): string[] | null => {
    if (!selectedGroupId) return null;
    const find = (items: CaseGroup[]): CaseGroup | null => {
      for (const i of items) {
        if (i.id === selectedGroupId) return i;
        if (i.children) {
          const f = find(i.children);
          if (f) return f;
        }
      }
      return null;
    };
    const g = find(groups);
    return g ? getAllGroupIds(g) : null;
  };

  const filteredCases = cases.filter((tc) => {
    const matchesSearch = tc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const groupIds = getSelectedGroupIds();
    const matchesGroup = groupIds === null || groupIds.includes(tc.groupId);
    return matchesSearch && matchesGroup;
  });

  const allSelected = filteredCases.length > 0 && filteredCases.every((c) => selectedIds.has(c.id));
  const toggleAll = () => {
    if (allSelected) {
      const next = new Set(selectedIds);
      filteredCases.forEach((c) => next.delete(c.id));
      setSelectedIds(next);
    } else {
      const next = new Set(selectedIds);
      filteredCases.forEach((c) => next.add(c.id));
      setSelectedIds(next);
    }
  };
  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  const handleSmartDesign = () => {
    if (workspaceId) navigate(`/workspace/${workspaceId}/home`);
    else navigate("../home");
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) {
      toast.error("请先选择案例");
      return;
    }
    setCases((prev) => prev.filter((c) => !selectedIds.has(c.id)));
    toast.success(`已删除 ${selectedIds.size} 个案例`);
    setSelectedIds(new Set());
  };

  const handleBatchTest = () => {
    if (selectedIds.size === 0) {
      toast.error("请先选择案例");
      return;
    }
    toast.success(`已开始测试 ${selectedIds.size} 个案例`);
  };

  const handleCreate = () => {
    if (!newCase.name.trim()) {
      toast.error("请输入案例名称");
      return;
    }
    const created: TestCase = {
      id: `tc-${Date.now()}`,
      name: newCase.name,
      tags: newCase.tags.split(",").map((t) => t.trim()).filter(Boolean),
      environment: "测试环境",
      testType: newCase.testType,
      creator: "当前用户",
      updatedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      groupId: selectedGroupId ?? "login",
    };
    setCases((prev) => [created, ...prev]);
    toast.success("案例创建成功");
    setCreateOpen(false);
    setNewCase({ name: "", testType: "UI", tags: "" });
  };

  const handleCaseClick = (id: string) => navigate(`${id}`);

  const handleCreateGroup = (name: string, parentId?: string) => {
    const newGroup: CaseGroup = { id: `group-${Date.now()}`, name, count: 0 };
    if (parentId) {
      setGroups((prev) =>
        prev.map((g) => {
          if (g.id === parentId) return { ...g, children: [...(g.children || []), newGroup] };
          if (g.children) {
            return {
              ...g,
              children: g.children.map((c) =>
                c.id === parentId ? { ...c, children: [...(c.children || []), newGroup] } : c
              ),
            };
          }
          return g;
        })
      );
    } else {
      setGroups((prev) => [...prev, newGroup]);
    }
  };

  const handleUpdateGroup = (groupId: string, name: string) => {
    const upd = (items: CaseGroup[]): CaseGroup[] =>
      items.map((g) => (g.id === groupId ? { ...g, name } : g.children ? { ...g, children: upd(g.children) } : g));
    setGroups((prev) => upd(prev));
  };

  const handleDeleteGroup = (groupId: string) => {
    const del = (items: CaseGroup[]): CaseGroup[] =>
      items.filter((g) => g.id !== groupId).map((g) => ({ ...g, children: g.children ? del(g.children) : undefined }));
    setGroups((prev) => del(prev));
    if (selectedGroupId === groupId) setSelectedGroupId(null);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <CaseGroupSidebar
        groups={groups}
        selectedGroupId={selectedGroupId}
        onSelectGroup={setSelectedGroupId}
        onCreateGroup={handleCreateGroup}
        onUpdateGroup={handleUpdateGroup}
        onDeleteGroup={handleDeleteGroup}
      />

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-foreground">测试案例</h1>
            <p className="text-muted-foreground mt-1 text-sm">管理和维护测试案例库</p>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4 gap-3">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索案例名称..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2" onClick={handleSmartDesign}>
                <Sparkles className="w-4 h-4" />
                智能设计
              </Button>
              <Button className="gap-2" onClick={() => setCreateOpen(true)}>
                <Plus className="w-4 h-4" />
                新增案例
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => setImportOpen(true)}>
                <Upload className="w-4 h-4" />
                导入
              </Button>
              <Button variant="outline" className="gap-2" onClick={handleBatchDelete} disabled={selectedIds.size === 0}>
                <Trash2 className="w-4 h-4" />
                批量删除
              </Button>
              <Button variant="outline" className="gap-2" onClick={handleBatchTest} disabled={selectedIds.size === 0}>
                <PlayCircle className="w-4 h-4" />
                触发测试
              </Button>
            </div>
          </div>

          {selectedIds.size > 0 && (
            <div className="mb-2 text-sm text-muted-foreground">
              已选中 {selectedIds.size} 个案例
            </div>
          )}

          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="grid grid-cols-[40px_1.5fr_1.2fr_120px_100px_100px_140px] gap-2 px-6 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
              <div className="flex items-center">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              </div>
              <div>名称</div>
              <div>标签</div>
              <div>环境</div>
              <div>测试类型</div>
              <div>创建者</div>
              <div>更新时间</div>
            </div>

            <div className="divide-y">
              {filteredCases.map((tc, index) => {
                const type = testTypeConfig[tc.testType];
                const TypeIcon = type.icon;
                const checked = selectedIds.has(tc.id);
                return (
                  <div
                    key={tc.id}
                    className={cn(
                      "grid grid-cols-[40px_1.5fr_1.2fr_120px_100px_100px_140px] gap-2 px-6 py-4 hover:bg-muted/30 transition-colors animate-fade-in",
                      checked && "bg-primary/5"
                    )}
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="flex items-center">
                      <Checkbox checked={checked} onCheckedChange={() => toggleOne(tc.id)} />
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={() => handleCaseClick(tc.id)}
                        className="font-medium text-primary hover:text-primary/80 hover:underline truncate text-left transition-colors"
                      >
                        {tc.name}
                      </button>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      {tc.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs bg-primary/5">
                          <Tag className="w-2.5 h-2.5 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center">
                      <Badge variant="secondary" className="text-xs">{tc.environment}</Badge>
                    </div>
                    <div className="flex items-center">
                      <Badge variant="outline" className={cn("text-xs gap-1", type.className)}>
                        <TypeIcon className="w-3 h-3" />
                        {tc.testType}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm text-foreground truncate">{tc.creator}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span className="truncate">{tc.updatedAt}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredCases.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Search className="w-12 h-12 mb-4 opacity-50" />
                <p>未找到匹配的测试案例</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Case Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>新增案例</DialogTitle>
            <DialogDescription>填写测试案例的基础信息</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">案例名称 *</Label>
              <Input
                id="name"
                placeholder="请输入案例名称"
                value={newCase.name}
                onChange={(e) => setNewCase({ ...newCase, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>测试类型</Label>
                <Select value={newCase.testType} onValueChange={(v: TestType) => setNewCase({ ...newCase, testType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UI">UI</SelectItem>
                    <SelectItem value="API">API</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">标签（逗号分隔）</Label>
                <Input
                  id="tags"
                  placeholder="如：登录, 核心功能"
                  value={newCase.tags}
                  onChange={(e) => setNewCase({ ...newCase, tags: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>取消</Button>
            <Button onClick={handleCreate}>创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>导入测试案例</DialogTitle>
            <DialogDescription>选择导入途径</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <button
              onClick={() => {
                toast.info("请选择本地文件");
                setImportOpen(false);
              }}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all text-center"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="font-medium text-foreground">本地文件</div>
                <div className="text-xs text-muted-foreground mt-1">从本地导入Excel/CSV文件</div>
              </div>
            </button>
            <button
              onClick={() => {
                toast.info("请选择知识库文件");
                setImportOpen(false);
              }}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all text-center"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Database className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="font-medium text-foreground">知识库</div>
                <div className="text-xs text-muted-foreground mt-1">从知识库选择已有文档</div>
              </div>
            </button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)}>取消</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
