import { useState, useEffect } from "react";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ExecutionMode = "single" | "batch";

export interface CreateExecutionData {
  mode: ExecutionMode;
  name: string;
  environment: string;
  testCases?: string[];
  tags?: string[];
}

interface CreateExecutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: CreateExecutionData) => void;
}

const availableTestCases = [
  { id: "tc1", name: "案例1 - 用户登录" },
  { id: "tc2", name: "案例2 - 用户注册" },
  { id: "tc3", name: "案例3 - 密码重置" },
  { id: "tc4", name: "案例4 - 商品搜索" },
  { id: "tc5", name: "案例5 - 加入购物车" },
  { id: "tc6", name: "案例6 - 提交订单" },
  { id: "tc7", name: "案例7 - 支付流程" },
  { id: "tc8", name: "案例8 - 订单查询" },
];

const availableTags = [
  "登录",
  "注册",
  "支付",
  "订单",
  "购物车",
  "搜索",
  "冒烟",
  "回归",
  "性能",
  "集成",
];

const environments = ["SIT-01", "SIT-02", "UAT-01", "UAT-02", "PERF-01"];

export function CreateExecutionDialog({
  open,
  onOpenChange,
  onConfirm,
}: CreateExecutionDialogProps) {
  const [mode, setMode] = useState<ExecutionMode>("single");
  const [name, setName] = useState("");
  const [environment, setEnvironment] = useState("");
  const [selectedCase, setSelectedCase] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setMode("single");
      setName("");
      setEnvironment("");
      setSelectedCase("");
      setSelectedTags([]);
    }
  }, [open]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const isValid =
    name.trim() &&
    environment &&
    (mode === "single" ? !!selectedCase : selectedTags.length > 0);

  const handleConfirm = () => {
    onConfirm({
      mode,
      name: name.trim(),
      environment,
      testCases: mode === "single" ? selectedCases : undefined,
      tags: mode === "batch" ? selectedTags : undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>新增执行</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Mode switch - radio button style, centered */}
          <div className="flex justify-center">
            <ToggleGroup
              type="single"
              value={mode}
              onValueChange={(v) => v && setMode(v as ExecutionMode)}
              className="bg-muted p-1 rounded-md gap-0"
            >
              <ToggleGroupItem
                value="single"
                className="px-6 h-8 rounded data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm text-muted-foreground"
              >
                单个执行
              </ToggleGroupItem>
              <ToggleGroupItem
                value="batch"
                className="px-6 h-8 rounded data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm text-muted-foreground"
              >
                批量执行
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="exec-name">
              名称 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="exec-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入执行名称"
            />
          </div>

          {/* Single: Test Case (single select) */}
          {mode === "single" && (
            <div className="space-y-2">
              <Label>
                测试 <span className="text-destructive">*</span>
              </Label>
              <Select value={selectedCase} onValueChange={setSelectedCase}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择测试案例" />
                </SelectTrigger>
                <SelectContent>
                  {availableTestCases.map((tc) => (
                    <SelectItem key={tc.id} value={tc.id}>
                      {tc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Batch: Tags */}
          {mode === "batch" && (
            <div className="space-y-2">
              <Label>
                标签 <span className="text-destructive">*</span>
              </Label>
              <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-between font-normal",
                      selectedTags.length === 0 && "text-muted-foreground",
                    )}
                  >
                    <span className="truncate">
                      {selectedTags.length === 0
                        ? "请选择标签（可多选）"
                        : `已选择 ${selectedTags.length} 个标签`}
                    </span>
                    <ChevronDown className="w-4 h-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-2" align="start">
                  <div className="max-h-64 overflow-auto space-y-1">
                    {availableTags.map((tag) => (
                      <label
                        key={tag}
                        className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer text-sm"
                      >
                        <Checkbox
                          checked={selectedTags.includes(tag)}
                          onCheckedChange={() => toggleTag(tag)}
                        />
                        <span>{tag}</span>
                      </label>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="gap-1 font-normal bg-primary/5 text-primary border-primary/20"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className="hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Environment */}
          <div className="space-y-2">
            <Label>
              环境 <span className="text-destructive">*</span>
            </Label>
            <Select value={environment} onValueChange={setEnvironment}>
              <SelectTrigger>
                <SelectValue placeholder="请选择执行环境" />
              </SelectTrigger>
              <SelectContent>
                {environments.map((env) => (
                  <SelectItem key={env} value={env}>
                    {env}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={!isValid}>
            确定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
