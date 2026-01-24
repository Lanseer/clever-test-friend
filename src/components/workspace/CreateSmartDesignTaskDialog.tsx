import { useState, useEffect } from "react";
import { Tag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateSmartDesignTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: {
    name: string;
    testPhase: string;
    testCategory: string;
    tags: string[];
  }) => void;
}

const testPhases = ["单元测试", "集成测试", "SIT测试", "UAT测试", "投产测试"];
const testCategories = ["功能测试", "数据测试", "专项测试"];
const availableTags = ["冒烟测试", "回归测试", "功能测试", "接口测试", "性能测试", "安全测试"];

export function CreateSmartDesignTaskDialog({
  open,
  onOpenChange,
  onConfirm,
}: CreateSmartDesignTaskDialogProps) {
  const [name, setName] = useState("");
  const [testPhase, setTestPhase] = useState("");
  const [testCategory, setTestCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setName("");
      setTestPhase("");
      setTestCategory("");
      setSelectedTags([]);
    }
  }, [open]);

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleConfirm = () => {
    onConfirm({
      name,
      testPhase,
      testCategory,
      tags: selectedTags,
    });
    onOpenChange(false);
  };

  const isValid = name.trim() && testPhase && testCategory;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>新增智能设计任务</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 名称 */}
          <div className="space-y-2">
            <Label htmlFor="name">任务名称</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入任务名称"
            />
          </div>

          {/* 测试活动 */}
          <div className="space-y-2">
            <Label>测试活动</Label>
            <Input value="测试案例设计" disabled className="bg-muted" />
          </div>

          {/* 测试阶段 */}
          <div className="space-y-2">
            <Label>测试阶段</Label>
            <Select value={testPhase} onValueChange={setTestPhase}>
              <SelectTrigger>
                <SelectValue placeholder="请选择测试阶段" />
              </SelectTrigger>
              <SelectContent>
                {testPhases.map((phase) => (
                  <SelectItem key={phase} value={phase}>
                    {phase}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 测试大类 */}
          <div className="space-y-2">
            <Label>测试大类</Label>
            <Select value={testCategory} onValueChange={setTestCategory}>
              <SelectTrigger>
                <SelectValue placeholder="请选择测试大类" />
              </SelectTrigger>
              <SelectContent>
                {testCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 选择标签 */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              选择标签（可选）
            </Label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer transition-colors hover:bg-primary/80"
                  onClick={() => handleToggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={!isValid}>
            创建
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
