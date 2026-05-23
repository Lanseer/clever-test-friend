import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Search, Plus, MoreHorizontal, Edit, Copy, Trash2, User, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TestDataItem {
  id: string;
  name: string;
  creator: string;
  updatedAt: string;
}

const mockData: TestDataItem[] = [
  { id: "1", name: "开户交易测试数据", creator: "张三", updatedAt: "2024-05-20 14:30" },
  { id: "2", name: "供货期开户数据集", creator: "李四", updatedAt: "2024-05-19 10:15" },
  { id: "3", name: "对公账户开户数据", creator: "王五", updatedAt: "2024-05-18 16:42" },
  { id: "4", name: "个人客户身份验证数据", creator: "赵六", updatedAt: "2024-05-17 09:20" },
  { id: "5", name: "跨境汇款测试数据", creator: "张三", updatedAt: "2024-05-16 11:05" },
];

export default function SmartExecutionTestData() {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = mockData.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">测试数据</h1>
        <p className="text-muted-foreground mt-1">管理智能执行所需的测试数据</p>
      </div>

      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          新增
        </Button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="grid grid-cols-[1fr_140px_180px_80px] gap-4 px-6 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
          <div>名称</div>
          <div>创建者</div>
          <div>更新时间</div>
          <div>操作</div>
        </div>

        <div className="divide-y">
          {filtered.map((item, index) => (
            <div
              key={item.id}
              className="grid grid-cols-[1fr_140px_180px_80px] gap-4 px-6 py-4 hover:bg-muted/30 transition-colors animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center">
                <button className="font-medium text-primary hover:text-primary/80 hover:underline text-left transition-colors">
                  {item.name}
                </button>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm text-foreground truncate">{item.creator}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{item.updatedAt}</span>
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
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Search className="w-12 h-12 mb-4 opacity-50" />
            <p>未找到匹配的测试数据</p>
          </div>
        )}
      </div>
    </div>
  );
}
