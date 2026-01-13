import { useState } from "react";
import { Search, Plus, MoreHorizontal, Edit, Trash2, Copy, Clock, User, Tag } from "lucide-react";
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

const mockTestCases = [
  {
    id: "1",
    code: "TC-001",
    name: "用户登录功能测试",
    modifier: "张三",
    environment: "测试环境",
    tags: ["登录", "核心功能"],
    updatedAt: "2024-01-15 14:30",
  },
  {
    id: "2",
    code: "TC-002",
    name: "支付流程完整性测试",
    modifier: "李四",
    environment: "预发布环境",
    tags: ["支付", "关键路径"],
    updatedAt: "2024-01-14 16:20",
  },
  {
    id: "3",
    code: "TC-003",
    name: "用户注册表单验证",
    modifier: "王五",
    environment: "测试环境",
    tags: ["注册", "表单验证"],
    updatedAt: "2024-01-13 09:15",
  },
  {
    id: "4",
    code: "TC-004",
    name: "订单状态流转测试",
    modifier: "赵六",
    environment: "开发环境",
    tags: ["订单", "状态机"],
    updatedAt: "2024-01-12 11:45",
  },
  {
    id: "5",
    code: "TC-005",
    name: "API接口响应时间测试",
    modifier: "张三",
    environment: "测试环境",
    tags: ["性能", "API"],
    updatedAt: "2024-01-11 15:00",
  },
];

export default function TestCases() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCases = mockTestCases.filter(
    (tc) =>
      tc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tc.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">测试用例</h1>
          <p className="text-muted-foreground mt-1">管理和维护测试用例库</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          新建用例
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索用例编码或名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
          <div className="col-span-2">编码</div>
          <div className="col-span-3">名称</div>
          <div className="col-span-1">修改人</div>
          <div className="col-span-2">环境</div>
          <div className="col-span-2">标签</div>
          <div className="col-span-1">更新时间</div>
          <div className="col-span-1">操作</div>
        </div>

        <div className="divide-y">
          {filteredCases.map((tc, index) => (
            <div
              key={tc.id}
              className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-muted/30 transition-colors animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="col-span-2 flex items-center">
                <Badge variant="outline" className="font-mono text-xs">
                  {tc.code}
                </Badge>
              </div>
              <div className="col-span-3 flex items-center">
                <span className="font-medium text-foreground truncate">{tc.name}</span>
              </div>
              <div className="col-span-1 flex items-center gap-1">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm text-foreground truncate">{tc.modifier}</span>
              </div>
              <div className="col-span-2 flex items-center">
                <Badge variant="secondary" className="text-xs">
                  {tc.environment}
                </Badge>
              </div>
              <div className="col-span-2 flex items-center gap-1 flex-wrap">
                {tc.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs bg-primary/5">
                    <Tag className="w-2.5 h-2.5 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="col-span-1 flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span className="truncate">{tc.updatedAt.split(" ")[0]}</span>
              </div>
              <div className="col-span-1 flex items-center">
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
                    <DropdownMenuItem className="gap-2 text-destructive">
                      <Trash2 className="w-4 h-4" />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>

        {filteredCases.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Search className="w-12 h-12 mb-4 opacity-50" />
            <p>未找到匹配的测试用例</p>
          </div>
        )}
      </div>
    </div>
  );
}
