import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
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
  onConfirm: (taskId: string, caseName: string) => void;
  onCreateNew: () => void;
  defaultCaseName?: string;
}

// Generate default case name with current date
const generateDefaultCaseName = () => {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return `${dateStr}用户模块测试案例_V1.0`;
};

export function SaveToTaskDialog({
  open,
  onOpenChange,
  onConfirm,
  onCreateNew,
  defaultCaseName,
}: SaveToTaskDialogProps) {
  const { t } = useTranslation();
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [caseName, setCaseName] = useState<string>("");

  // Translated mock tasks
  const mockTasks: TestTask[] = [
    { id: "1", name: t('mockData.tasks.userLogin'), testPhase: t('myTasks.testPhase.sit'), testCategory: t('myTasks.testCategory.functional') },
    { id: "2", name: t('mockData.tasks.paymentFlow'), testPhase: t('myTasks.testPhase.uat'), testCategory: t('myTasks.testCategory.functional') },
    { id: "3", name: t('mockData.tasks.orderManagement'), testPhase: t('myTasks.testPhase.integration'), testCategory: t('myTasks.testCategory.data') },
    { id: "4", name: t('mockData.tasks.productSearch'), testPhase: t('myTasks.testPhase.sit'), testCategory: t('myTasks.testCategory.functional') },
    { id: "5", name: t('mockData.tasks.shoppingCart'), testPhase: t('myTasks.testPhase.uat'), testCategory: t('myTasks.testCategory.special') },
  ];

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedTaskId("");
      setCaseName(defaultCaseName || generateDefaultCaseName());
    }
  }, [open, defaultCaseName]);

  const handleConfirm = () => {
    if (selectedTaskId && caseName.trim()) {
      onConfirm(selectedTaskId, caseName.trim());
      onOpenChange(false);
      setSelectedTaskId("");
      setCaseName("");
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
          <DialogTitle>{t('saveToTask.title')}</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Case Name Input */}
          <div className="space-y-2">
            <Label htmlFor="caseName">{t('saveToTask.caseName')}</Label>
            <Input
              id="caseName"
              value={caseName}
              onChange={(e) => setCaseName(e.target.value)}
              placeholder={t('saveToTask.enterCaseName')}
            />
          </div>

          {hasTasks ? (
            <>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  {t('saveToTask.selectTask')}
                </Label>
                <ScrollArea className="h-[240px] pr-4">
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
              </div>
            </>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground mb-4">
                {t('saveToTask.noTasks')}
              </p>
              <Button onClick={handleCreateNew} className="gap-2">
                <Plus className="w-4 h-4" />
                {t('saveToTask.newTask')}
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
              {t('saveToTask.newTask')}
            </Button>
            <div className="flex-1" />
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleConfirm} disabled={!selectedTaskId || !caseName.trim()}>
              {t('saveToTask.confirmSave')}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
