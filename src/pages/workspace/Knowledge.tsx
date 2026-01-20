import { useState } from "react";
import { 
  FileText, 
  Search, 
  Plus, 
  Clock, 
  User, 
  Tag,
  MoreHorizontal,
  FilePlus,
  Eye,
  History,
  Download,
  FileCode,
  FileType,
  Link2,
  GitCompare
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
  { 
    id: "1", 
    name: "用户管理模块功能规格说明书", 
    type: "FSD", 
    version: "v2.1.0", 
    status: "current", 
    updatedAt: "2024-01-15", 
    author: "张三",
    description: "详细描述用户管理模块的功能需求和技术规格"
  },
  { 
    id: "2", 
    name: "订单系统产品需求文档", 
    type: "PRD", 
    version: "v3.0.0", 
    status: "current", 
    updatedAt: "2024-01-14", 
    author: "李四",
    description: "订单系统的完整产品需求和业务流程"
  },
  { 
    id: "3", 
    name: "支付接口API文档", 
    type: "API", 
    version: "v1.8.0", 
    status: "current", 
    updatedAt: "2024-01-13", 
    author: "王五",
    description: "支付模块对外接口定义和调用说明"
  },
  { 
    id: "4", 
    name: "报表模块功能规格说明书", 
    type: "FSD", 
    version: "v1.5.0", 
    status: "outdated", 
    updatedAt: "2024-01-10", 
    author: "赵六",
    description: "报表模块的功能规格和数据展示要求"
  },
  { 
    id: "5", 
    name: "用户认证API接口文档", 
    type: "API", 
    version: "v2.0.0-draft", 
    status: "draft", 
    updatedAt: "2024-01-12", 
    author: "钱七",
    description: "用户登录、注册和权限验证接口"
  },
  { 
    id: "6", 
    name: "移动端产品需求文档", 
    type: "PRD", 
    version: "v1.0.0", 
    status: "draft", 
    updatedAt: "2024-01-11", 
    author: "孙八",
    description: "移动端应用的产品需求和用户体验设计"
  },
];

const documentTypes = ["全部", "FSD", "PRD", "API", "Design", "Other"];

const typeConfig = {
  FSD: { label: "FSD", icon: FileCode, color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  PRD: { label: "PRD", icon: FileType, color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  API: { label: "API", icon: Link2, color: "bg-green-500/10 text-green-500 border-green-500/20" },
  Design: { label: "设计文档", icon: FileText, color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  Other: { label: "其他", icon: FileText, color: "bg-muted text-muted-foreground border-border" },
};

// Mock version history for documents
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
    { version: "v2.0.0", date: "2023-12-25", author: "王五", changes: ["订单拆分功能", "物流对接"] },
  ],
  "3": [
    { version: "v1.8.0", date: "2024-01-13", author: "王五", changes: ["新增微信支付", "优化接口响应"] },
    { version: "v1.5.0", date: "2024-01-01", author: "王五", changes: ["支付宝接口升级", "安全加固"] },
    { version: "v1.0.0", date: "2023-12-01", author: "赵六", changes: ["初始接口发布"] },
  ],
};

export default function Knowledge() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("全部");
  const [diffDialogOpen, setDiffDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const filteredDocs = mockKnowledgeDocs.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "全部" || doc.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleOpenDiffDialog = (doc: KnowledgeDocument) => {
    setSelectedDoc(doc);
    setDiffDialogOpen(true);
  };

  const getStatusBadge = (status: KnowledgeDocument["status"]) => {
    const config = {
      current: { label: "当前版本", className: "bg-success/10 text-success border-success/20" },
      outdated: { label: "已过期", className: "bg-warning/10 text-warning border-warning/20" },
      draft: { label: "草稿", className: "bg-muted text-muted-foreground border-border" },
    };
    return config[status];
  };

  return (
    <div className="h-full">
      {/* Header */}
      <header className="sticky top-0 z-10 glass border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">知识库</h1>
              <p className="text-sm text-muted-foreground mt-1">项目文档中心 · FSD / PRD / API接口文档</p>
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
        {/* Search and Filter */}
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
                {type === "全部" ? type : typeConfig[type as keyof typeof typeConfig]?.label || type}
              </Button>
            ))}
          </div>
        </div>

        {/* Documents List */}
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

      {/* Version Diff Dialog */}
      {selectedDoc && (
        <VersionDiffDialog
          open={diffDialogOpen}
          onOpenChange={setDiffDialogOpen}
          documentName={selectedDoc.name}
          currentVersion={selectedDoc.version}
          versionHistory={mockVersionHistory[selectedDoc.id] || []}
        />
      )}

      {/* Create Document Dialog */}
      <CreateKnowledgeDocDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}
