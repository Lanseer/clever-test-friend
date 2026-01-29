import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface TestTask {
  id: string;
  name: string;
  testPhase: string;
  testCategory: string;
}

interface SaveToTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (taskId: string) => void;
  onCreateNew: () => void;
}

const mockTasks: TestTask[] = [
  { id: "1", name: "用户登录模块测试", testPhase: "SIT测试", testCategory: "功能测试" },
  { id: "2", name: "支付流程测试", testPhase: "UAT测试", testCategory: "功能测试" },
  { id: "3", name: "订单管理测试", testPhase: "集成测试", testCategory: "数据测试" },
  { id: "4", name: "商品搜索测试", testPhase: "SIT测试", testCategory: "功能测试" },
  { id: "5", name: "购物车功能测试", testPhase: "UAT测试", testCategory: "专项测试" },
];

export function SaveToTaskDialog({
  open,
  onOpenChange,
  onConfirm,
  onCreateNew,
}: SaveToTaskDialogProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");

  const handleConfirm = () => {
    if (selectedTaskId) {
      onConfirm(selectedTaskId);
      onOpenChange(false);
      setSelectedTaskId("");
    }
  };

  const handleCreateNew = () => {
    onOpenChange(false);
    onCreateNew();
  };

  const hasTasks = mockTasks.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>保存到测试任务</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {hasTasks ? (
            <>
              <Label className="text-sm text-muted-foreground mb-3 block">
                请选择要保存到的测试任务
              </Label>
              <ScrollArea className="h-[280px] pr-4">
                <RadioGroup
                  value={selectedTaskId}
                  onValueChange={setSelectedTaskId}
                  className="space-y-2"
                >
                  {mockTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedTaskId === task.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedTaskId(task.id)}
                    >
                      <RadioGroupItem value={task.id} id={task.id} />
                      <div className="flex-1 min-w-0">
                        <Label
                          htmlFor={task.id}
                          className="text-sm font-medium cursor-pointer block truncate"
                        >
                          {task.name}
                        </Label>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Badge className="text-[10px] px-1.5 py-0 h-5 bg-blue-100 text-blue-700 border-blue-200">
                            {task.testPhase}
                          </Badge>
                          <Badge className="text-[10px] px-1.5 py-0 h-5 bg-amber-100 text-amber-700 border-amber-200">
                            {task.testCategory}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </ScrollArea>
            </>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground mb-4">
                暂无测试任务，请先新建测试任务
              </p>
              <Button onClick={handleCreateNew} className="gap-2">
                <Plus className="w-4 h-4" />
                新建测试任务
              </Button>
            </div>
          )}
        </div>

        {hasTasks && (
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleCreateNew}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              新建任务
            </Button>
            <div className="flex-1" />
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button onClick={handleConfirm} disabled={!selectedTaskId}>
              确认保存
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
