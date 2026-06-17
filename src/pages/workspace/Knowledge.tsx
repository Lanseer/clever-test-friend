import { useState } from "react";
import {
  FileText,
  Search,
  Plus,
  Clock,
  User,
  MoreHorizontal,
  FilePlus,
  Eye,
  History,
  Download,
  FileCode,
  FileType,
  Link2,
  GitCompare,
  ListTodo,
  BookOpen,
  Filter,
  LayoutGrid,
  Table as TableIcon,
  Settings,
  Pencil,
  Trash2,
  RefreshCw,
  Play,
  MessageSquare,
  Folder,
  ChevronRight,
  ChevronDown,
  Star,
  Minimize2,
  FolderPlus,
  Upload,
  FileSpreadsheet,
  FileType2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import VersionDiffDialog from "@/components/workspace/VersionDiffDialog";
import { CreateKnowledgeDocDialog } from "@/components/workspace/CreateKnowledgeDocDialog";

interface KnowledgeDocument {
  id: string;
  name: string;
  type: "FSD" | "PRD" | "API" | "Design" | "Other";
  version: string;
  status: "current" | "outdated" | "draft";
  updatedAt: string;
  author: string;
  description: string;
}

const mockKnowledgeDocs: KnowledgeDocument[] = [
  { id: "1", name: "用户管理模块功能规格说明书", type: "FSD", version: "v2.1.0", status: "current", updatedAt: "2024-01-15", author: "张三", description: "详细描述用户管理模块的功能需求和技术规格" },
  { id: "2", name: "订单系统产品需求文档", type: "PRD", version: "v3.0.0", status: "current", updatedAt: "2024-01-14", author: "李四", description: "订单系统的完整产品需求和业务流程" },
  { id: "3", name: "支付接口API文档", type: "API", version: "v1.8.0", status: "current", updatedAt: "2024-01-13", author: "王五", description: "支付模块对外接口定义和调用说明" },
  { id: "4", name: "报表模块功能规格说明书", type: "FSD", version: "v1.5.0", status: "outdated", updatedAt: "2024-01-10", author: "赵六", description: "报表模块的功能规格和数据展示要求" },
  { id: "5", name: "用户认证API接口文档", type: "API", version: "v2.0.0-draft", status: "draft", updatedAt: "2024-01-12", author: "钱七", description: "用户登录、注册和权限验证接口" },
  { id: "6", name: "移动端产品需求文档", type: "PRD", version: "v1.0.0", status: "draft", updatedAt: "2024-01-11", author: "孙八", description: "移动端应用的产品需求和用户体验设计" },
];

const documentTypes = ["全部", "FSD", "PRD", "API", "Design", "Other"];

const typeConfig = {
  FSD: { label: "FSD", icon: FileCode, color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  PRD: { label: "PRD", icon: FileType, color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  API: { label: "API", icon: Link2, color: "bg-green-500/10 text-green-500 border-green-500/20" },
  Design: { label: "设计文档", icon: FileText, color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  Other: { label: "其他", icon: FileText, color: "bg-muted text-muted-foreground border-border" },
};

const mockVersionHistory: Record<string, { version: string; date: string; author: string; changes: string[] }[]> = {
  "1": [
    { version: "v2.1.0", date: "2024-01-15", author: "张三", changes: ["新增权限控制模块", "优化用户列表查询"] },
    { version: "v2.0.0", date: "2024-01-10", author: "张三", changes: ["重构用户管理架构", "新增批量操作功能"] },
    { version: "v1.5.0", date: "2024-01-05", author: "李四", changes: ["添加用户导入导出", "修复搜索问题"] },
    { version: "v1.0.0", date: "2023-12-20", author: "张三", changes: ["初始版本发布"] },
  ],
  "2": [
    { version: "v3.0.0", date: "2024-01-14", author: "李四", changes: ["全新订单流程设计", "支持多币种"] },
    { version: "v2.5.0", date: "2024-01-08", author: "李四", changes: ["优化订单状态机", "新增退款流程"] },
  ],
  "3": [
    { version: "v1.8.0", date: "2024-01-13", author: "王五", changes: ["新增微信支付", "优化接口响应"] },
  ],
};

// ===== Tasks data =====
interface RegularTask {
  id: string;
  name: string;
  status: string;
  priority: string;
  proposer: string;
  group: string;
  tester: string;
  value: string;
}

const mockRegularTasks: RegularTask[] = [
  { id: "TRV5-8", name: "EvoMap测试阶段免重训提升Agent智能研究", status: "待确认", priority: "中", proposer: "-", group: "-", tester: "-", value: "-" },
  { id: "TRV5-7", name: "TestZeus连接与知识库功能调研", status: "待办", priority: "中", proposer: "-", group: "-", tester: "-", value: "-" },
  { id: "TRV5-6", name: "数据建模", status: "待办", priority: "中", proposer: "-", group: "-", tester: "-", value: "-" },
  { id: "TRV5-5", name: "UI智能测试:脚本自动生成、执行与报告", status: "待办", priority: "中", proposer: "-", group: "-", tester: "-", value: "-" },
  { id: "TRV5-4", name: "评审智能体", status: "待办", priority: "中", proposer: "-", group: "-", tester: "-", value: "-" },
  { id: "TRV5-3", name: "测试教练智能体构建", status: "待办", priority: "中", proposer: "-", group: "-", tester: "-", value: "-" },
  { id: "TRV5-2", name: "API智能测试智能体设计与实现", status: "待办", priority: "中", proposer: "-", group: "-", tester: "-", value: "-" },
  { id: "TRV5-1", name: "知识库构建:文档转换、需求分析与测试要点", status: "待办", priority: "中", proposer: "-", group: "-", tester: "-", value: "-" },
];

interface AutoTask {
  id: string;
  name: string;
  project: string;
  date: string;
  owner: string;
  description: string;
  enabled: boolean;
  execStatus: string;
}

const mockAutoTasks: AutoTask[] = [
  {
    id: "a1",
    name: "每日智能测试技术与产品调研",
    project: "TestHand 产品研发",
    date: "2026/06/17",
    owner: "qiaozhi",
    description:
      "请作为资深软件测试专家,调研当前最新的智能测试(AI-driven Testing)技术和相关产品。重点关注:1. 最新的技术趋势(如LLM在测试用例生成中的应用);2. 市场上值得关注的新型智能测试平...",
    enabled: true,
    execStatus: "未执行",
  },
  {
    id: "a2",
    name: "测试报告",
    project: "TestHand 产品研发",
    date: "2026/06/17",
    owner: "qiaozhi",
    description: "每天22:00点生成测试报告",
    enabled: true,
    execStatus: "未执行",
  },
];

type SubMenu = "tasks" | "knowledge";
type TaskTab = "regular" | "auto";

export default function Knowledge() {
  const [subMenu, setSubMenu] = useState<SubMenu>("tasks");
  const [taskTab, setTaskTab] = useState<TaskTab>("regular");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("全部");
  const [diffDialogOpen, setDiffDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const filteredDocs = mockKnowledgeDocs.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "全部" || doc.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleOpenDiffDialog = (doc: KnowledgeDocument) => {
    setSelectedDoc(doc);
    setDiffDialogOpen(true);
  };

  const subMenuItems: { key: SubMenu; label: string; icon: typeof ListTodo }[] = [
    { key: "tasks", label: "任务", icon: ListTodo },
    { key: "knowledge", label: "知识", icon: BookOpen },
  ];

  return (
    <div className="h-full flex">
      {/* Sub Sidebar */}
      <aside className="w-48 shrink-0 border-r bg-card/30">
        <div className="px-3 py-4">
          <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            知识库
          </p>
          <nav className="space-y-1">
            {subMenuItems.map((item) => {
              const Icon = item.icon;
              const active = subMenu === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setSubMenu(item.key)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                    active
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 overflow-auto">
        {subMenu === "tasks" ? (
          <TasksView taskTab={taskTab} setTaskTab={setTaskTab} />
        ) : (
          <KnowledgeView
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            filteredDocs={filteredDocs}
            handleOpenDiffDialog={handleOpenDiffDialog}
            setCreateDialogOpen={setCreateDialogOpen}
          />
        )}
      </div>

      {selectedDoc && (
        <VersionDiffDialog
          open={diffDialogOpen}
          onOpenChange={setDiffDialogOpen}
          documentName={selectedDoc.name}
          currentVersion={selectedDoc.version}
          versionHistory={mockVersionHistory[selectedDoc.id] || []}
        />
      )}

      <CreateKnowledgeDocDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}

function TasksView({
  taskTab,
  setTaskTab,
}: {
  taskTab: TaskTab;
  setTaskTab: (t: TaskTab) => void;
}) {
  return (
    <div className="h-full">
      <header className="sticky top-0 z-10 glass border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">任务</h1>
              <p className="text-sm text-muted-foreground mt-1">
                常规任务与自动化任务管理
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        <Tabs value={taskTab} onValueChange={(v) => setTaskTab(v as TaskTab)}>
          <TabsList>
            <TabsTrigger value="regular">常规</TabsTrigger>
            <TabsTrigger value="auto">自动化</TabsTrigger>
          </TabsList>

          <TabsContent value="regular" className="mt-4">
            <RegularTasksView />
          </TabsContent>
          <TabsContent value="auto" className="mt-4">
            <AutoTasksView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function RegularTasksView() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="w-4 h-4" />
          筛选 0个条件
        </Button>
        <Select defaultValue="全部">
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="全部">全部</SelectItem>
            <SelectItem value="我的">我的</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="任务编号、标题、负责人" className="pl-10" />
        </div>
        <div className="ml-auto flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" className="accent-primary" />
            仅看我的
          </label>
          <div className="flex items-center border rounded-md overflow-hidden">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none">
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none bg-primary/10 text-primary">
              <TableIcon className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="w-4 h-4" />
            配置看板
          </Button>
          <Button size="sm" className="gradient-primary text-primary-foreground gap-2">
            <Plus className="w-4 h-4" />
            创建任务
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
          <div className="col-span-1">任务编号</div>
          <div className="col-span-4">任务名称</div>
          <div className="col-span-1">任务状态</div>
          <div className="col-span-1">优先级</div>
          <div className="col-span-1">提出人</div>
          <div className="col-span-1">分组</div>
          <div className="col-span-1">测试人</div>
          <div className="col-span-1">价值评</div>
          <div className="col-span-1">操作</div>
        </div>
        <div className="divide-y divide-border">
          {mockRegularTasks.map((t) => (
            <div key={t.id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
              <div className="col-span-1 flex items-center text-sm">{t.id}</div>
              <div className="col-span-4 flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-500 border-blue-500/20">任务</Badge>
                <span className="text-sm text-foreground truncate">{t.name}</span>
              </div>
              <div className="col-span-1 flex items-center text-sm text-muted-foreground">{t.status}</div>
              <div className="col-span-1 flex items-center text-sm text-muted-foreground">{t.priority}</div>
              <div className="col-span-1 flex items-center text-sm text-muted-foreground">{t.proposer}</div>
              <div className="col-span-1 flex items-center text-sm text-muted-foreground">{t.group}</div>
              <div className="col-span-1 flex items-center text-sm text-muted-foreground">{t.tester}</div>
              <div className="col-span-1 flex items-center text-sm text-muted-foreground">{t.value}</div>
              <div className="col-span-1 flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between px-6 py-3 text-sm text-muted-foreground border-t">
          <span>共 {mockRegularTasks.length} / {mockRegularTasks.length} 条,当前第 1/1 页</span>
          <div className="flex items-center gap-4">
            <button className="hover:text-foreground">首页</button>
            <button className="hover:text-foreground">上一页</button>
            <button className="hover:text-foreground">下一页</button>
            <button className="hover:text-foreground">尾页</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AutoTasksView() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">是否启用:</span>
          <Select defaultValue="全部">
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="全部">全部</SelectItem>
              <SelectItem value="启用">启用</SelectItem>
              <SelectItem value="禁用">禁用</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">执行状态:</span>
          <Select defaultValue="全部">
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="全部">全部</SelectItem>
              <SelectItem value="未执行">未执行</SelectItem>
              <SelectItem value="执行中">执行中</SelectItem>
              <SelectItem value="已完成">已完成</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="relative w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="任务名称/提示词/描述" className="pl-10" />
        </div>
        <div className="relative w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="项目名称/会话名称" className="pl-10" />
        </div>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <RefreshCw className="w-4 h-4" />
        </Button>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Switch />
          自动刷新
        </label>
        <Button size="sm" className="ml-auto gradient-primary text-primary-foreground gap-2">
          <Plus className="w-4 h-4" />
          创建自动化任务
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockAutoTasks.map((t) => (
          <div key={t.id} className="bg-card border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2 mb-3">
              <h3 className="font-semibold text-foreground truncate">{t.name}</h3>
              <Switch checked={t.enabled} />
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3 flex-wrap">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                <span className="truncate max-w-[120px]">{t.project}</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {t.date}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {t.owner}
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-4 mb-4 min-h-[5rem]">
              {t.description}
            </p>
            <div className="flex items-center justify-between gap-2">
              <Badge variant="outline" className="bg-muted text-muted-foreground">
                {t.execStatus}
              </Badge>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="text-primary gap-1 h-7 px-2">
                  <Play className="w-3.5 h-3.5" />
                  运行
                </Button>
                <Button variant="ghost" size="sm" className="text-primary gap-1 h-7 px-2">
                  <History className="w-3.5 h-3.5" />
                  历史
                </Button>
                <Button variant="ghost" size="sm" className="text-primary gap-1 h-7 px-2">
                  <MessageSquare className="w-3.5 h-3.5" />
                  会话
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KnowledgeView({
  searchQuery,
  setSearchQuery,
  selectedType,
  setSelectedType,
  filteredDocs,
  handleOpenDiffDialog,
  setCreateDialogOpen,
}: {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  selectedType: string;
  setSelectedType: (v: string) => void;
  filteredDocs: KnowledgeDocument[];
  handleOpenDiffDialog: (doc: KnowledgeDocument) => void;
  setCreateDialogOpen: (v: boolean) => void;
}) {
  return (
    <div className="h-full">
      <header className="sticky top-0 z-10 glass border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">知识</h1>
              <p className="text-sm text-muted-foreground mt-1">
                项目文档中心 · FSD / PRD / API接口文档
              </p>
            </div>
            <Button
              className="gradient-primary text-primary-foreground shadow-lg hover:opacity-90 transition-opacity"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              新建文档
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索文档名称或描述..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {documentTypes.map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type)}
                className={cn(
                  "transition-all",
                  selectedType === type && "gradient-primary text-primary-foreground"
                )}
              >
                {type === "全部"
                  ? type
                  : typeConfig[type as keyof typeof typeConfig]?.label || type}
              </Button>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
            <div className="col-span-5">文档名称</div>
            <div className="col-span-1">类型</div>
            <div className="col-span-2">版本</div>
            <div className="col-span-2">更新时间</div>
            <div className="col-span-1">作者</div>
            <div className="col-span-1">操作</div>
          </div>

          <div className="divide-y divide-border">
            {filteredDocs.map((doc, index) => {
              const typeInfo = typeConfig[doc.type];
              const TypeIcon = typeInfo.icon;
              return (
                <div
                  key={doc.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-muted/30 transition-colors animate-fade-in cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="col-span-5 flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", typeInfo.color.split(" ")[0])}>
                      <TypeIcon className={cn("w-5 h-5", typeInfo.color.split(" ")[1])} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{doc.description}</p>
                    </div>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <Badge variant="outline" className={cn("text-xs", typeInfo.color)}>
                      {typeInfo.label}
                    </Badge>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <Badge variant="outline" className="font-mono text-xs">
                      {doc.version}
                    </Badge>
                  </div>
                  <div className="col-span-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {doc.updatedAt}
                  </div>
                  <div className="col-span-1 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm text-foreground truncate">{doc.author}</span>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          查看详情
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <History className="w-4 h-4 mr-2" />
                          版本历史
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenDiffDialog(doc)}>
                          <GitCompare className="w-4 h-4 mr-2" />
                          查看版本差异
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FilePlus className="w-4 h-4 mr-2" />
                          新增版本
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          下载文档
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {filteredDocs.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">暂无匹配的文档</p>
          </div>
        )}
      </div>
    </div>
  );
}
