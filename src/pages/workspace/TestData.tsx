import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Search, Plus, MoreHorizontal, Edit, Copy, Trash2, User, Tag, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TestDataItem {
  id: string;
  name: string;
  tags: string[];
  modifier: string;
  updatedAt: string;
}

const mockTestData: TestDataItem[] = [
  {
    id: "1",
    name: "用户登录测试数据",
    tags: ["登录", "用户"],
    modifier: "张三",
    updatedAt: "2024-01-15 14:30",
  },
  {
    id: "2",
    name: "支付流程测试数据",
    tags: ["支付", "订单"],
    modifier: "李四",
    updatedAt: "2024-01-14 16:20",
  },
  {
    id: "3",
    name: "注册验证测试数据",
    tags: ["注册", "验证"],
    modifier: "王五",
    updatedAt: "2024-01-13 09:15",
  },
  {
    id: "4",
    name: "商品搜索测试数据",
    tags: ["搜索", "商品"],
    modifier: "赵六",
    updatedAt: "2024-01-12 11:45",
  },
  {
    id: "5",
    name: "API响应模拟数据",
    tags: ["API", "模拟"],
    modifier: "张三",
    updatedAt: "2024-01-11 15:00",
  },
];

export default function TestData() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { workspaceId } = useParams();

  const filteredData = mockTestData.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddData = () => {
    navigate(`/workspace/${workspaceId}/data/create`);
  };

  const handleEditData = (id: string) => {
    navigate(`/workspace/${workspaceId}/data/${id}/edit`);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">测试数据</h1>
          <p className="text-muted-foreground mt-1">管理和维护测试数据集</p>
        </div>
        <Button className="gap-2" onClick={handleAddData}>
          <Plus className="w-4 h-4" />
          新增数据
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索数据名称或标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="grid grid-cols-[1fr_150px_100px_140px_60px] gap-4 px-6 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
          <div>名称</div>
          <div>标签</div>
          <div>修改人</div>
          <div>更新时间</div>
          <div>操作</div>
        </div>

        <div className="divide-y">
          {filteredData.map((item, index) => (
            <div
              key={item.id}
              className="grid grid-cols-[1fr_150px_100px_140px_60px] gap-4 px-6 py-4 hover:bg-muted/30 transition-colors animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center">
                <button
                  onClick={() => handleEditData(item.id)}
                  className="font-medium text-primary hover:text-primary/80 hover:underline truncate text-left transition-colors"
                >
                  {item.name}
                </button>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                {item.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs bg-primary/5">
                    <Tag className="w-2.5 h-2.5 mr-1" />
                    {tag}
                  </Badge>
                ))}
                {item.tags.length > 2 && (
                  <span className="text-xs text-muted-foreground">+{item.tags.length - 2}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm text-foreground truncate">{item.modifier}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span className="truncate">{item.updatedAt}</span>
              </div>
              <div className="flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem className="gap-2" onClick={() => handleEditData(item.id)}>
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

        {filteredData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Search className="w-12 h-12 mb-4 opacity-50" />
            <p>未找到匹配的测试数据</p>
          </div>
        )}
      </div>
    </div>
  );
}
