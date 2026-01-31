import { useState } from "react";
import { X, Plus, Trash2, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Expert {
  id: string;
  name: string;
  email: string;
}

interface CaseItem {
  id: string;
  code: string;
  name: string;
  selected: boolean;
}

interface ExpertReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recordName: string;
  onConfirm: (data: { experts: Expert[]; selectedCases: string[] }) => void;
}

const mockPendingCases: CaseItem[] = [
  { id: "1", code: "TC-001", name: "用户登录功能验证", selected: true },
  { id: "2", code: "TC-002", name: "用户注册表单验证", selected: true },
  { id: "3", code: "TC-003", name: "密码重置流程", selected: true },
  { id: "4", code: "TC-004", name: "用户权限校验", selected: true },
  { id: "5", code: "TC-005", name: "会话超时处理", selected: true },
  { id: "6", code: "TC-006", name: "多设备登录限制", selected: true },
  { id: "7", code: "TC-007", name: "用户信息修改", selected: true },
  { id: "8", code: "TC-008", name: "账户注销流程", selected: true },
];

export function ExpertReviewDialog({
  open,
  onOpenChange,
  recordName,
  onConfirm,
}: ExpertReviewDialogProps) {
  const [experts, setExperts] = useState<Expert[]>([
    { id: "1", name: "", email: "" },
  ]);
  const [cases, setCases] = useState<CaseItem[]>(mockPendingCases);
  const [copied, setCopied] = useState(false);

  const reviewLink = `https://review.example.com/expert/${Date.now()}`;

  const handleAddExpert = () => {
    setExperts([...experts, { id: Date.now().toString(), name: "", email: "" }]);
  };

  const handleRemoveExpert = (id: string) => {
    if (experts.length > 1) {
      setExperts(experts.filter((e) => e.id !== id));
    }
  };

  const handleExpertChange = (id: string, field: "name" | "email", value: string) => {
    setExperts(
      experts.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const handleCaseToggle = (id: string) => {
    setCases(cases.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c)));
  };

  const handleSelectAll = (checked: boolean) => {
    setCases(cases.map((c) => ({ ...c, selected: checked })));
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(reviewLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = () => {
    const validExperts = experts.filter((e) => e.name && e.email);
    const selectedCaseIds = cases.filter((c) => c.selected).map((c) => c.id);
    onConfirm({ experts: validExperts, selectedCases: selectedCaseIds });
    onOpenChange(false);
  };

  const allSelected = cases.every((c) => c.selected);
  const someSelected = cases.some((c) => c.selected) && !allSelected;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>发起专家评审 - {recordName}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-6">
          {/* Review Link */}
          <div className="space-y-2">
            <Label>评审链接</Label>
            <div className="flex gap-2">
              <Input value={reviewLink} readOnly className="bg-muted" />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Experts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>评审专家</Label>
              <Button variant="ghost" size="sm" onClick={handleAddExpert} className="gap-1 h-7">
                <Plus className="w-3.5 h-3.5" />
                添加专家
              </Button>
            </div>
            <div className="space-y-2">
              {experts.map((expert, index) => (
                <div key={expert.id} className="flex gap-2 items-center">
                  <Input
                    placeholder="专家姓名"
                    value={expert.name}
                    onChange={(e) => handleExpertChange(expert.id, "name", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="邮箱地址"
                    type="email"
                    value={expert.email}
                    onChange={(e) => handleExpertChange(expert.id, "email", e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveExpert(expert.id)}
                    disabled={experts.length === 1}
                    className="shrink-0 h-9 w-9"
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Cases Selection */}
          <div className="flex-1 overflow-hidden flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <Label>评审案例</Label>
              <span className="text-sm text-muted-foreground">
                已选择 {cases.filter((c) => c.selected).length} / {cases.length} 个案例
              </span>
            </div>
            <div className="border rounded-lg overflow-hidden flex-1">
              <div className="flex items-center gap-3 px-4 py-2 bg-muted/50 border-b">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  className="data-[state=indeterminate]:bg-primary"
                  {...(someSelected ? { "data-state": "indeterminate" } : {})}
                />
                <span className="text-sm font-medium">全选</span>
              </div>
              <ScrollArea className="h-[200px]">
                <div className="divide-y">
                  {cases.map((caseItem) => (
                    <div
                      key={caseItem.id}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 cursor-pointer"
                      onClick={() => handleCaseToggle(caseItem.id)}
                    >
                      <Checkbox
                        checked={caseItem.selected}
                        onCheckedChange={() => handleCaseToggle(caseItem.id)}
                      />
                      <span className="text-xs text-muted-foreground font-mono">
                        {caseItem.code}
                      </span>
                      <span className="text-sm">{caseItem.name}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleConfirm}>发送邀请</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
