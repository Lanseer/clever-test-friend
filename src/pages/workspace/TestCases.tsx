import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, MoreHorizontal, Edit, Copy, Trash2, User, Tag, Clock, CheckCircle, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CaseGroupSidebar, CaseGroup } from "@/components/workspace/CaseGroupSidebar";

type CaseNature = "positive" | "negative";

interface TestCase {
  id: string;
  code: string;
  name: string;
  modifier: string;
  environment: string;
  tags: string[];
  updatedAt: string;
  groupId: string;
  nature: CaseNature;
}

const mockTestCases: TestCase[] = [
  {
    id: "1",
    code: "TC-001",
    name: "用户登录功能测试",
    modifier: "张三",
    environment: "测试环境",
    tags: ["登录", "核心功能"],
    updatedAt: "2024-01-15 14:30",
    groupId: "login",
    nature: "positive",
  },
  {
    id: "2",
    code: "TC-002",
    name: "支付流程完整性测试",
    modifier: "李四",
    environment: "预发布环境",
    tags: ["支付", "关键路径"],
    updatedAt: "2024-01-14 16:20",
    groupId: "payment",
    nature: "positive",
  },
  {
    id: "3",
    code: "TC-003",
    name: "用户注册表单验证",
    modifier: "王五",
    environment: "测试环境",
    tags: ["注册", "表单验证"],
    updatedAt: "2024-01-13 09:15",
    groupId: "login",
    nature: "positive",
  },
  {
    id: "4",
    code: "TC-004",
    name: "订单状态流转测试",
    modifier: "赵六",
    environment: "开发环境",
    tags: ["订单", "状态机"],
    updatedAt: "2024-01-12 11:45",
    groupId: "order",
    nature: "positive",
  },
  {
    id: "5",
    code: "TC-005",
    name: "API接口响应时间测试",
    modifier: "张三",
    environment: "测试环境",
    tags: ["性能", "API"],
    updatedAt: "2024-01-11 15:00",
    groupId: "api",
    nature: "positive",
  },
  {
    id: "6",
    code: "TC-006",
    name: "用户登录失败-密码错误",
    modifier: "李四",
    environment: "测试环境",
    tags: ["登录", "异常处理"],
    updatedAt: "2024-01-10 10:00",
    groupId: "login",
    nature: "negative",
  },
  {
    id: "7",
    code: "TC-007",
    name: "支付超时异常处理",
    modifier: "王五",
    environment: "测试环境",
    tags: ["支付", "异常处理"],
    updatedAt: "2024-01-09 14:00",
    groupId: "payment",
    nature: "negative",
  },
  {
    id: "8",
    code: "TC-008",
    name: "订单取消边界测试",
    modifier: "赵六",
    environment: "测试环境",
    tags: ["订单", "边界测试"],
    updatedAt: "2024-01-08 16:00",
    groupId: "order-child",
    nature: "negative",
  },
];

const initialGroups: CaseGroup[] = [
  {
    id: "login",
    name: "登录模块",
    count: 3,
    children: [
      { id: "login-sso", name: "SSO登录", count: 0 },
    ],
  },
  {
    id: "payment",
    name: "支付模块",
    count: 2,
  },
  {
    id: "order",
    name: "订单模块",
    count: 1,
    children: [
      { id: "order-child", name: "订单取消", count: 1 },
    ],
  },
  {
    id: "api",
    name: "API测试",
    count: 1,
  },
];

const natureConfig: Record<CaseNature, { label: string; icon: typeof CheckCircle; className: string }> = {
  positive: {
    label: "正例",
    icon: CheckCircle,
    className: "bg-green-500/10 text-green-600 border-green-200",
  },
  negative: {
    label: "反例",
    icon: XCircle,
    className: "bg-orange-500/10 text-orange-600 border-orange-200",
  },
};

export default function TestCases() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groups, setGroups] = useState<CaseGroup[]>(initialGroups);
  const navigate = useNavigate();

  // Helper to get all group IDs including children
  const getAllGroupIds = (group: CaseGroup): string[] => {
    const ids = [group.id];
    if (group.children) {
      group.children.forEach((child) => {
        ids.push(...getAllGroupIds(child));
      });
    }
    return ids;
  };

  // Get all group IDs for selected group (including children)
  const getSelectedGroupIds = (): string[] | null => {
    if (!selectedGroupId) return null;
    
    const findGroup = (items: CaseGroup[]): CaseGroup | null => {
      for (const item of items) {
        if (item.id === selectedGroupId) return item;
        if (item.children) {
          const found = findGroup(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    const group = findGroup(groups);
    return group ? getAllGroupIds(group) : null;
  };

  const filteredCases = mockTestCases.filter((tc) => {
    const matchesSearch =
      tc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tc.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const groupIds = getSelectedGroupIds();
    const matchesGroup = groupIds === null || groupIds.includes(tc.groupId);
    
    return matchesSearch && matchesGroup;
  });

  const handleCaseClick = (caseId: string) => {
    navigate(`${caseId}`);
  };

  const handleCreateGroup = (name: string, parentId?: string) => {
    const newGroup: CaseGroup = {
      id: `group-${Date.now()}`,
      name,
      count: 0,
    };

    if (parentId) {
      setGroups((prev) =>
        prev.map((g) => {
          if (g.id === parentId) {
            return { ...g, children: [...(g.children || []), newGroup] };
          }
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
    const updateInList = (items: CaseGroup[]): CaseGroup[] =>
      items.map((g) => {
        if (g.id === groupId) {
          return { ...g, name };
        }
        if (g.children) {
          return { ...g, children: updateInList(g.children) };
        }
        return g;
      });

    setGroups((prev) => updateInList(prev));
  };

  const handleDeleteGroup = (groupId: string) => {
    const deleteFromList = (items: CaseGroup[]): CaseGroup[] =>
      items
        .filter((g) => g.id !== groupId)
        .map((g) => ({
          ...g,
          children: g.children ? deleteFromList(g.children) : undefined,
        }));

    setGroups((prev) => deleteFromList(prev));
    if (selectedGroupId === groupId) {
      setSelectedGroupId(null);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left Sidebar - Group Management */}
      <CaseGroupSidebar
        groups={groups}
        selectedGroupId={selectedGroupId}
        onSelectGroup={setSelectedGroupId}
        onCreateGroup={handleCreateGroup}
        onUpdateGroup={handleUpdateGroup}
        onDeleteGroup={handleDeleteGroup}
      />

      {/* Right Content - Case List */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">测试案例</h1>
              <p className="text-muted-foreground mt-1">管理和维护测试案例库</p>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              新建案例
            </Button>
          </div>

          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索案例编号或名称..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="grid grid-cols-[80px_1fr_80px_100px_120px_100px_100px_60px] gap-2 px-6 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
              <div>编码</div>
              <div>名称</div>
              <div>性质</div>
              <div>修改人</div>
              <div>环境</div>
              <div>标签</div>
              <div>更新时间</div>
              <div>操作</div>
            </div>

            <div className="divide-y">
              {filteredCases.map((tc, index) => {
                const nature = natureConfig[tc.nature];
                const NatureIcon = nature.icon;

                return (
                  <div
                    key={tc.id}
                    className="grid grid-cols-[80px_1fr_80px_100px_120px_100px_100px_60px] gap-2 px-6 py-4 hover:bg-muted/30 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center">
                      <Badge variant="outline" className="font-mono text-xs">
                        {tc.code}
                      </Badge>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={() => handleCaseClick(tc.id)}
                        className="font-medium text-primary hover:text-primary/80 hover:underline truncate text-left transition-colors"
                      >
                        {tc.name}
                      </button>
                    </div>
                    <div className="flex items-center">
                      <Badge
                        variant="outline"
                        className={cn("text-xs gap-1", nature.className)}
                      >
                        <NatureIcon className="w-3 h-3" />
                        {nature.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm text-foreground truncate">{tc.modifier}</span>
                    </div>
                    <div className="flex items-center">
                      <Badge variant="secondary" className="text-xs">
                        {tc.environment}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      {tc.tags.slice(0, 1).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs bg-primary/5">
                          <Tag className="w-2.5 h-2.5 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {tc.tags.length > 1 && (
                        <span className="text-xs text-muted-foreground">+{tc.tags.length - 1}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span className="truncate">{tc.updatedAt.split(" ")[0]}</span>
                    </div>
                    <div className="flex items-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          <DropdownMenuItem className="gap-2">
                            <Edit className="w-4 h-4" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Copy className="w-4 h-4" />
                            复制
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                            <Trash2 className="w-4 h-4" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
    </div>
  );
}
