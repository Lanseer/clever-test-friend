import { useState } from "react";
import { Plus, Folder, FolderOpen, MoreHorizontal, Pencil, Trash2, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";

export interface CaseGroup {
  id: string;
  name: string;
  count: number;
  parentId?: string;
  children?: CaseGroup[];
}

interface CaseGroupSidebarProps {
  groups: CaseGroup[];
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string | null) => void;
  onCreateGroup: (name: string, parentId?: string) => void;
  onUpdateGroup: (groupId: string, name: string) => void;
  onDeleteGroup: (groupId: string) => void;
}

export function CaseGroupSidebar({
  groups,
  selectedGroupId,
  onSelectGroup,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
}: CaseGroupSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [editingGroup, setEditingGroup] = useState<CaseGroup | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [createParentId, setCreateParentId] = useState<string | undefined>();

  const toggleExpand = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const handleCreate = () => {
    if (newGroupName.trim()) {
      onCreateGroup(newGroupName.trim(), createParentId);
      setNewGroupName("");
      setCreateParentId(undefined);
      setCreateDialogOpen(false);
    }
  };

  const handleEdit = () => {
    if (editingGroup && newGroupName.trim()) {
      onUpdateGroup(editingGroup.id, newGroupName.trim());
      setNewGroupName("");
      setEditingGroup(null);
      setEditDialogOpen(false);
    }
  };

  const openEditDialog = (group: CaseGroup) => {
    setEditingGroup(group);
    setNewGroupName(group.name);
    setEditDialogOpen(true);
  };

  const openCreateDialog = (parentId?: string) => {
    setCreateParentId(parentId);
    setNewGroupName("");
    setCreateDialogOpen(true);
  };

  const totalCount = groups.reduce((sum, g) => sum + g.count + (g.children?.reduce((s, c) => s + c.count, 0) || 0), 0);

  const filterGroups = (items: CaseGroup[]): CaseGroup[] => {
    if (!searchQuery) return items;
    return items.filter((g) => {
      const matchesName = g.name.toLowerCase().includes(searchQuery.toLowerCase());
      const hasMatchingChildren = g.children?.some((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return matchesName || hasMatchingChildren;
    }).map((g) => ({
      ...g,
      children: g.children?.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }));
  };

  const filteredGroups = filterGroups(groups);

  const renderGroup = (group: CaseGroup, level: number = 0) => {
    const isExpanded = expandedGroups.has(group.id);
    const isSelected = selectedGroupId === group.id;
    const hasChildren = group.children && group.children.length > 0;

    return (
      <div key={group.id}>
        <div
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors group",
            isSelected
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted text-foreground"
          )}
          style={{ paddingLeft: `${8 + level * 16}px` }}
          onClick={() => onSelectGroup(group.id)}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(group.id);
              }}
              className="p-0.5"
            >
              <ChevronRight
                className={cn(
                  "w-3.5 h-3.5 transition-transform",
                  isExpanded && "rotate-90"
                )}
              />
            </button>
          ) : (
            <span className="w-4" />
          )}
          {isExpanded ? (
            <FolderOpen className="w-4 h-4 flex-shrink-0" />
          ) : (
            <Folder className="w-4 h-4 flex-shrink-0" />
          )}
          <span className="flex-1 text-sm truncate">{group.name}</span>
          <span
            className={cn(
              "text-xs px-1.5 py-0.5 rounded",
              isSelected ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground"
            )}
          >
            {group.count}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity",
                  isSelected && "opacity-100"
                )}
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem
                className="gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  openCreateDialog(group.id);
                }}
              >
                <Plus className="w-4 h-4" />
                添加子分组
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  openEditDialog(group);
                }}
              >
                <Pencil className="w-4 h-4" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteGroup(group.id);
                }}
              >
                <Trash2 className="w-4 h-4" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {hasChildren && isExpanded && (
          <div className="mt-0.5">
            {group.children!.map((child) => renderGroup(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 border-r bg-card flex flex-col h-full">
      <div className="p-3 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">案例分组</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => openCreateDialog()}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="搜索分组..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {/* All cases option */}
          <div
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors",
              selectedGroupId === null
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted text-foreground"
            )}
            onClick={() => onSelectGroup(null)}
          >
            <Folder className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-sm">全部案例</span>
            <span
              className={cn(
                "text-xs px-1.5 py-0.5 rounded",
                selectedGroupId === null ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground"
              )}
            >
              {totalCount}
            </span>
          </div>

          {filteredGroups.map((group) => renderGroup(group))}
        </div>
      </ScrollArea>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {createParentId ? "添加子分组" : "新建分组"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>分组名称</Label>
              <Input
                placeholder="请输入分组名称"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreate} disabled={!newGroupName.trim()}>
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>编辑分组</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>分组名称</Label>
              <Input
                placeholder="请输入分组名称"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEdit()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleEdit} disabled={!newGroupName.trim()}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
