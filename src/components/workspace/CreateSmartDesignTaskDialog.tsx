import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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

const testPhaseKeys = ["unit", "integration", "sit", "uat", "production"];
const testCategoryKeys = ["functional", "data", "special"];
const availableTagKeys = ["smoke", "regression", "functional", "api", "performance", "security"];

export function CreateSmartDesignTaskDialog({
  open,
  onOpenChange,
  onConfirm,
}: CreateSmartDesignTaskDialogProps) {
  const { t } = useTranslation();
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
          <DialogTitle>{t('createTask.title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 名称 */}
          <div className="space-y-2">
            <Label htmlFor="name">{t('createTask.taskName')}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('createTask.enterTaskName')}
            />
          </div>

          {/* 测试活动 */}
          <div className="space-y-2">
            <Label>{t('createTask.testActivity')}</Label>
            <Input value={t('createTask.caseDesign')} disabled className="bg-muted" />
          </div>

          {/* 测试阶段 */}
          <div className="space-y-2">
            <Label>{t('createTask.testPhase')}</Label>
            <Select value={testPhase} onValueChange={setTestPhase}>
              <SelectTrigger>
                <SelectValue placeholder={t('createTask.selectTestPhase')} />
              </SelectTrigger>
              <SelectContent>
                {testPhaseKeys.map((key) => (
                  <SelectItem key={key} value={key}>
                    {t(`myTasks.testPhase.${key}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 测试大类 */}
          <div className="space-y-2">
            <Label>{t('createTask.testCategory')}</Label>
            <Select value={testCategory} onValueChange={setTestCategory}>
              <SelectTrigger>
                <SelectValue placeholder={t('createTask.selectTestCategory')} />
              </SelectTrigger>
              <SelectContent>
                {testCategoryKeys.map((key) => (
                  <SelectItem key={key} value={key}>
                    {t(`myTasks.testCategory.${key}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 选择标签 */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              {t('createTask.selectTags')}
            </Label>
            <div className="flex flex-wrap gap-2">
              {availableTagKeys.map((key) => (
                <Badge
                  key={key}
                  variant={selectedTags.includes(key) ? "default" : "outline"}
                  className="cursor-pointer transition-colors hover:bg-primary/80"
                  onClick={() => handleToggleTag(key)}
                >
                  {t(`createTask.tags.${key}`)}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleConfirm} disabled={!isValid}>
            {t('common.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
