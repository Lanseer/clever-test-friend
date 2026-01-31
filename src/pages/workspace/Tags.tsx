import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Plus, Search, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Tag {
  id: string;
  name: string;
  modifier: string;
  updateTime: string;
}

// 模拟数据
const initialTags: Tag[] = [
  { id: "1", name: "冒烟测试", modifier: "张三", updateTime: "2024-01-15 10:30:00" },
  { id: "2", name: "回归测试", modifier: "李四", updateTime: "2024-01-14 15:20:00" },
  { id: "3", name: "性能测试", modifier: "王五", updateTime: "2024-01-13 09:45:00" },
  { id: "4", name: "安全测试", modifier: "赵六", updateTime: "2024-01-12 14:10:00" },
  { id: "5", name: "接口测试", modifier: "张三", updateTime: "2024-01-11 11:00:00" },
  { id: "6", name: "UI测试", modifier: "李四", updateTime: "2024-01-10 16:30:00" },
  { id: "7", name: "兼容性测试", modifier: "王五", updateTime: "2024-01-09 08:50:00" },
  { id: "8", name: "压力测试", modifier: "赵六", updateTime: "2024-01-08 13:25:00" },
];

export default function Tags() {
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTag, setCurrentTag] = useState<Tag | null>(null);
  const [tagName, setTagName] = useState("");

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const handleCreate = () => {
    if (!tagName.trim()) {
      toast.error("请输入标签名称");
      return;
    }
    
    const newTag: Tag = {
      id: Date.now().toString(),
      name: tagName.trim(),
      modifier: "当前用户",
      updateTime: new Date().toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).replace(/\//g, "-"),
    };
    
    setTags([newTag, ...tags]);
    setTagName("");
    setIsCreateDialogOpen(false);
    toast.success("标签创建成功");
  };

  const handleEdit = () => {
    if (!tagName.trim()) {
      toast.error("请输入标签名称");
      return;
    }
    
    if (!currentTag) return;
    
    setTags(tags.map(tag => 
      tag.id === currentTag.id 
        ? { 
            ...tag, 
            name: tagName.trim(), 
            modifier: "当前用户",
            updateTime: new Date().toLocaleString("zh-CN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }).replace(/\//g, "-"),
          } 
        : tag
    ));
    
    setTagName("");
    setCurrentTag(null);
    setIsEditDialogOpen(false);
    toast.success("标签更新成功");
  };

  const handleDelete = () => {
    if (!currentTag) return;
    
    setTags(tags.filter(tag => tag.id !== currentTag.id));
    setCurrentTag(null);
    setIsDeleteDialogOpen(false);
    toast.success("标签删除成功");
  };

  const openEditDialog = (tag: Tag) => {
    setCurrentTag(tag);
    setTagName(tag.name);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (tag: Tag) => {
    setCurrentTag(tag);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">标签管理</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          新建标签
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索标签..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">标签名称</TableHead>
              <TableHead className="w-[25%]">修改者</TableHead>
              <TableHead className="w-[25%]">更新时间</TableHead>
              <TableHead className="w-[10%] text-center">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTags.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  暂无标签数据
                </TableCell>
              </TableRow>
            ) : (
              filteredTags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell className="font-medium">{tag.name}</TableCell>
                  <TableCell>{tag.modifier}</TableCell>
                  <TableCell>{tag.updateTime}</TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(tag)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => openDeleteDialog(tag)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 新建标签对话框 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新建标签</DialogTitle>
            <DialogDescription>
              创建一个新的标签用于分类测试案例
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tagName">标签名称</Label>
              <Input
                id="tagName"
                placeholder="请输入标签名称"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false);
              setTagName("");
            }}>
              取消
            </Button>
            <Button onClick={handleCreate}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑标签对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑标签</DialogTitle>
            <DialogDescription>
              修改标签名称
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editTagName">标签名称</Label>
              <Input
                id="editTagName"
                placeholder="请输入标签名称"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              setTagName("");
              setCurrentTag(null);
            }}>
              取消
            </Button>
            <Button onClick={handleEdit}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除标签 "{currentTag?.name}" 吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDeleteDialogOpen(false);
              setCurrentTag(null);
            }}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete}>删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
