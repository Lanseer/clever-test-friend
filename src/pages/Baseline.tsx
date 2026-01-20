import { useState } from "react";
import { 
  FileText, 
  Search, 
  Plus, 
  ChevronRight, 
  Clock, 
  User, 
  Tag,
  MoreHorizontal,
  Eye,
  History,
  Download,
  FilePlus
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
import { CreateDocumentDialog } from "@/components/baseline/CreateDocumentDialog";

interface Document {
  id: string;
  name: string;
  version: string;
  type: string;
  updatedAt: string;
  author: string;
  category: string;
  createdBy: string;
}

const mockDocuments: Document[] = [
  { id: "1", name: "API接口规范文档", version: "v2.3.0", type: "API", updatedAt: "2024-01-15", author: "张三", category: "接口规范", createdBy: "Lanseer" },
  { id: "2", name: "测试用例模板", version: "v1.5.0", type: "FSD", updatedAt: "2024-01-14", author: "李四", category: "测试模板", createdBy: "Lanseer" },
  { id: "3", name: "自动化测试框架指南", version: "v3.0.0", type: "PRD", updatedAt: "2024-01-13", author: "王五", category: "框架指南", createdBy: "Admin" },
  { id: "4", name: "性能测试标准", version: "v1.2.0", type: "Design", updatedAt: "2024-01-12", author: "赵六", category: "性能标准", createdBy: "Lanseer" },
  { id: "5", name: "安全测试规范", version: "v2.0.0", type: "Other", updatedAt: "2024-01-10", author: "钱七", category: "安全规范", createdBy: "Admin" },
];

const categories = ["全部", "接口规范", "测试模板", "框架指南", "性能标准", "安全规范"];

export default function Baseline() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "全部" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const typeConfig: Record<string, { label: string; className: string }> = {
    FSD: { label: "FSD", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
    PRD: { label: "PRD", className: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
    API: { label: "API", className: "bg-green-500/10 text-green-600 border-green-500/20" },
    Design: { label: "Design", className: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
    Other: { label: "Other", className: "bg-muted text-muted-foreground border-border" },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 glass border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">基线数据</h1>
              <p className="text-sm text-muted-foreground mt-1">文档管理中心 · 版本化文档管理</p>
            </div>
            <Button 
              className="gradient-primary text-primary-foreground shadow-lg hover:opacity-90 transition-opacity"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              新建文档
            </Button>
          </div>
        </div>
      </header>

      <CreateDocumentDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />

      <div className="p-6">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索文档..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "transition-all",
                  selectedCategory === category && "gradient-primary text-primary-foreground"
                )}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
            <div className="col-span-4">文档名称</div>
            <div className="col-span-2">版本</div>
            <div className="col-span-2">创建人</div>
            <div className="col-span-1">类型</div>
            <div className="col-span-2">更新时间</div>
            <div className="col-span-1">操作</div>
          </div>

          <div className="divide-y divide-border">
            {filteredDocuments.map((doc, index) => {
              const docTypeConfig = typeConfig[doc.type] || typeConfig.Other;
              return (
                <div
                  key={doc.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-muted/30 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{doc.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Tag className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{doc.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <Badge variant="outline" className="font-mono text-xs">
                      {doc.version}
                    </Badge>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{doc.createdBy}</span>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <Badge variant="outline" className={docTypeConfig.className}>
                      {docTypeConfig.label}
                    </Badge>
                  </div>
                  <div className="col-span-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {doc.updatedAt}
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
                          <FilePlus className="w-4 h-4 mr-2" />
                          新增版本
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <History className="w-4 h-4 mr-2" />
                          版本历史
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

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">暂无匹配的文档</p>
          </div>
        )}
      </div>
    </div>
  );
}
