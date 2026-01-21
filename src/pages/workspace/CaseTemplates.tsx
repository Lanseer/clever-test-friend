import { useState } from "react";
import { FileCode, Search, Plus, MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CaseTemplateDetailDialog } from "@/components/workspace/CaseTemplateDetailDialog";
import { toast } from "@/hooks/use-toast";

interface CaseTemplate {
  id: string;
  name: string;
  type: string;
  modifier: string;
  updateTime: string;
  format: string;
  example: string;
}

const mockTemplates: CaseTemplate[] = [
  {
    id: "1",
    name: "BDD标准模板",
    type: "BDD",
    modifier: "张三",
    updateTime: "2024-01-15 14:30",
    format: `Feature: [功能名称]
  As a [角色]
  I want [功能描述]
  So that [业务价值]

  Scenario: [场景名称]
    Given [前置条件]
    When [操作步骤]
    Then [预期结果]`,
    example: `Feature: 用户登录
  As a 注册用户
  I want 使用账号密码登录系统
  So that 访问个人账户功能

  Scenario: 正确的用户名和密码登录
    Given 用户已注册账号 "testuser"
    And 用户在登录页面
    When 用户输入用户名 "testuser"
    And 用户输入密码 "password123"
    And 用户点击登录按钮
    Then 用户应该成功登录
    And 页面跳转到首页`,
  },
  {
    id: "2",
    name: "接口测试模板",
    type: "API",
    modifier: "李四",
    updateTime: "2024-01-14 10:20",
    format: `接口名称: [API名称]
请求方式: [GET/POST/PUT/DELETE]
请求URL: [接口地址]
请求头: [Header信息]
请求参数: [参数列表]
预期响应: [响应状态码和数据结构]`,
    example: `接口名称: 获取用户信息
请求方式: GET
请求URL: /api/v1/users/{userId}
请求头: 
  - Authorization: Bearer {token}
  - Content-Type: application/json
请求参数:
  - userId: 用户ID (path参数)
预期响应:
  - 状态码: 200
  - 响应体: { "id": "123", "name": "张三", "email": "test@example.com" }`,
  },
  {
    id: "3",
    name: "UI自动化模板",
    type: "UI",
    modifier: "王五",
    updateTime: "2024-01-13 16:45",
    format: `测试用例ID: [编号]
测试模块: [模块名称]
测试标题: [用例标题]
前置条件: [测试前的准备工作]
测试步骤:
  1. [步骤1]
  2. [步骤2]
预期结果: [期望的系统行为]
测试数据: [使用的测试数据]`,
    example: `测试用例ID: UI-LOGIN-001
测试模块: 用户认证
测试标题: 验证登录页面元素显示正确
前置条件: 
  - 浏览器已打开
  - 清除所有缓存和Cookie
测试步骤:
  1. 打开登录页面 URL: /login
  2. 检查页面标题
  3. 检查用户名输入框存在
  4. 检查密码输入框存在
  5. 检查登录按钮存在且可点击
预期结果: 
  - 页面标题显示 "用户登录"
  - 所有表单元素正确显示
  - 登录按钮处于可用状态
测试数据: 无`,
  },
  {
    id: "4",
    name: "性能测试模板",
    type: "Performance",
    modifier: "赵六",
    updateTime: "2024-01-12 09:15",
    format: `场景名称: [性能测试场景]
测试目标: [性能指标目标]
并发用户数: [用户数量]
持续时间: [测试时长]
事务列表:
  - [事务1]
  - [事务2]
性能指标:
  - 响应时间: [目标值]
  - 吞吐量: [目标值]
  - 错误率: [目标值]`,
    example: `场景名称: 登录接口压力测试
测试目标: 验证登录接口在高并发下的性能表现
并发用户数: 500
持续时间: 30分钟
事务列表:
  - 用户登录请求
  - Token刷新请求
性能指标:
  - 平均响应时间: < 500ms
  - 95%响应时间: < 1000ms
  - 吞吐量: > 1000 TPS
  - 错误率: < 1%`,
  },
];

const typeConfig: Record<string, { label: string; className: string }> = {
  BDD: { label: "BDD", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  API: { label: "API", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  UI: { label: "UI", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  Performance: { label: "性能", className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
};

export default function CaseTemplates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [templates, setTemplates] = useState<CaseTemplate[]>(mockTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<CaseTemplate | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<CaseTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<CaseTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "BDD",
    format: "",
    example: "",
  });

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTemplateClick = (template: CaseTemplate) => {
    setSelectedTemplate(template);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingTemplate(null);
    setFormData({ name: "", type: "BDD", format: "", example: "" });
    setEditDialogOpen(true);
  };

  const handleEdit = (template: CaseTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      format: template.format,
      example: template.example,
    });
    setEditDialogOpen(true);
  };

  const handleView = (template: CaseTemplate) => {
    setSelectedTemplate(template);
    setDialogOpen(true);
  };

  const handleDeleteClick = (template: CaseTemplate) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (templateToDelete) {
      setTemplates(templates.filter((t) => t.id !== templateToDelete.id));
      toast({ title: "删除成功", description: `模板 "${templateToDelete.name}" 已删除` });
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({ title: "请输入模板名称", variant: "destructive" });
      return;
    }

    const now = new Date().toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).replace(/\//g, "-");

    if (editingTemplate) {
      setTemplates(
        templates.map((t) =>
          t.id === editingTemplate.id
            ? { ...t, ...formData, modifier: "当前用户", updateTime: now }
            : t
        )
      );
      toast({ title: "保存成功", description: "模板已更新" });
    } else {
      const newTemplate: CaseTemplate = {
        id: `tpl-${Date.now()}`,
        name: formData.name,
        type: formData.type,
        modifier: "当前用户",
        updateTime: now,
        format: formData.format,
        example: formData.example,
      };
      setTemplates([newTemplate, ...templates]);
      toast({ title: "新增成功", description: "模板已创建" });
    }
    setEditDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">用例模板</h1>
        <p className="text-muted-foreground mt-1">管理和查看测试用例的规范模板</p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索模板名称或类型..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          新增模板
        </Button>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">模板名称</TableHead>
              <TableHead className="w-[120px]">模板类型</TableHead>
              <TableHead className="w-[120px]">修改人</TableHead>
              <TableHead className="w-[180px]">更新时间</TableHead>
              <TableHead className="w-[80px] text-center">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTemplates.map((template) => (
              <TableRow key={template.id}>
                <TableCell>
                  <button
                    onClick={() => handleTemplateClick(template)}
                    className="flex items-center gap-2 text-primary hover:underline font-medium"
                  >
                    <FileCode className="w-4 h-4" />
                    {template.name}
                  </button>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={typeConfig[template.type]?.className}>
                    {typeConfig[template.type]?.label || template.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{template.modifier}</TableCell>
                <TableCell className="text-muted-foreground">{template.updateTime}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover">
                      <DropdownMenuItem onClick={() => handleView(template)}>
                        <Eye className="w-4 h-4 mr-2" />
                        查看
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(template)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        编辑
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteClick(template)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredTemplates.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  未找到匹配的模板
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 查看详情弹窗 */}
      <CaseTemplateDetailDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        template={selectedTemplate}
      />

      {/* 新增/编辑弹窗 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "编辑模板" : "新增模板"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">模板名称</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入模板名称"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">模板类型</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BDD">BDD</SelectItem>
                    <SelectItem value="API">API</SelectItem>
                    <SelectItem value="UI">UI</SelectItem>
                    <SelectItem value="Performance">性能</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="format">规范格式</Label>
              <Textarea
                id="format"
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                placeholder="请输入规范格式内容"
                className="min-h-[150px] font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="example">示例</Label>
              <Textarea
                id="example"
                value={formData.example}
                onChange={(e) => setFormData({ ...formData, example: e.target.value })}
                placeholder="请输入示例内容"
                className="min-h-[150px] font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认弹窗 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除模板 "{templateToDelete?.name}" 吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
