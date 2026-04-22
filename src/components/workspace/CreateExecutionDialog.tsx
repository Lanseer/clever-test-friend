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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  const [selectedCases, setSelectedCases] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [casePopoverOpen, setCasePopoverOpen] = useState(false);
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setMode("single");
      setName("");
      setEnvironment("");
      setSelectedCases([]);
      setSelectedTags([]);
    }
  }, [open]);

  const toggleCase = (id: string) => {
    setSelectedCases((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const isValid =
    name.trim() &&
    environment &&
    (mode === "single" ? selectedCases.length > 0 : selectedTags.length > 0);

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
          {/* Mode switch */}
          <div className="space-y-2">
            <Label>执行方式</Label>
            <RadioGroup
              value={mode}
              onValueChange={(v) => setMode(v as ExecutionMode)}
              className="flex gap-6"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="single" id="mode-single" />
                <Label htmlFor="mode-single" className="cursor-pointer font-normal">
                  单个执行
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="batch" id="mode-batch" />
                <Label htmlFor="mode-batch" className="cursor-pointer font-normal">
                  批量执行
                </Label>
              </div>
            </RadioGroup>
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

          {/* Single: Test Cases */}
          {mode === "single" && (
            <div className="space-y-2">
              <Label>
                测试 <span className="text-destructive">*</span>
              </Label>
              <Popover open={casePopoverOpen} onOpenChange={setCasePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-between font-normal",
                      selectedCases.length === 0 && "text-muted-foreground",
                    )}
                  >
                    <span className="truncate">
                      {selectedCases.length === 0
                        ? "请选择测试案例"
                        : `已选择 ${selectedCases.length} 个案例`}
                    </span>
                    <ChevronDown className="w-4 h-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-2" align="start">
                  <div className="max-h-64 overflow-auto space-y-1">
                    {availableTestCases.map((tc) => (
                      <label
                        key={tc.id}
                        className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer text-sm"
                      >
                        <Checkbox
                          checked={selectedCases.includes(tc.id)}
                          onCheckedChange={() => toggleCase(tc.id)}
                        />
                        <span>{tc.name}</span>
                      </label>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              {selectedCases.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedCases.map((id) => {
                    const tc = availableTestCases.find((c) => c.id === id);
                    return (
                      <Badge
                        key={id}
                        variant="secondary"
                        className="gap-1 font-normal"
                      >
                        {tc?.name}
                        <button
                          type="button"
                          onClick={() => toggleCase(id)}
                          className="hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
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
