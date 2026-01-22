import { useState } from "react";
import { X, Plus, Trash2, Copy, Check, ArrowRight, ArrowLeft } from "lucide-react";
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

interface CaseItem {
  id: string;
  code: string;
  name: string;
  selected: boolean;
}

interface InitiateExpertReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: { emails: string[]; selectedCases: string[] }) => void;
}

const mockPendingCases: CaseItem[] = [
  { id: "1", code: "TC-001", name: "用户登录功能验证", selected: false },
  { id: "2", code: "TC-002", name: "用户注册表单验证", selected: false },
  { id: "3", code: "TC-003", name: "密码重置流程", selected: false },
  { id: "4", code: "TC-004", name: "用户权限校验", selected: false },
  { id: "5", code: "TC-005", name: "会话超时处理", selected: false },
  { id: "6", code: "TC-006", name: "多设备登录限制", selected: false },
  { id: "7", code: "TC-007", name: "用户信息修改", selected: false },
  { id: "8", code: "TC-008", name: "账户注销流程", selected: false },
  { id: "9", code: "TC-009", name: "邮箱验证流程", selected: false },
  { id: "10", code: "TC-010", name: "手机验证流程", selected: false },
];

export function InitiateExpertReviewDialog({
  open,
  onOpenChange,
  onConfirm,
}: InitiateExpertReviewDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [cases, setCases] = useState<CaseItem[]>(mockPendingCases);
  const [emails, setEmails] = useState<string[]>([""]);
  const [copied, setCopied] = useState(false);

  const reviewLink = `https://review.example.com/expert/${Date.now()}`;

  const handleCaseToggle = (id: string) => {
    setCases(cases.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c)));
  };

  const handleSelectAll = (checked: boolean) => {
    setCases(cases.map((c) => ({ ...c, selected: checked })));
  };

  const handleAddEmail = () => {
    setEmails([...emails, ""]);
  };

  const handleRemoveEmail = (index: number) => {
    if (emails.length > 1) {
      setEmails(emails.filter((_, i) => i !== index));
    }
  };

  const handleEmailChange = (index: number, value: string) => {
    setEmails(emails.map((e, i) => (i === index ? value : e)));
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(reviewLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = () => {
    const validEmails = emails.filter((e) => e.trim() !== "");
    const selectedCaseIds = cases.filter((c) => c.selected).map((c) => c.id);
    onConfirm({ emails: validEmails, selectedCases: selectedCaseIds });
    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setCases(mockPendingCases);
    setEmails([""]);
    onOpenChange(false);
  };

  const handleNext = () => {
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const allSelected = cases.every((c) => c.selected);
  const someSelected = cases.some((c) => c.selected) && !allSelected;
  const selectedCount = cases.filter((c) => c.selected).length;
  const canProceed = selectedCount > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            发起专家评审 - {step === 1 ? "选择用例" : "填写评审信息"}
          </DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 1 ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"
            }`}>
              1
            </div>
            <span className={step === 1 ? "font-medium" : "text-muted-foreground"}>
              选择用例
            </span>
          </div>
          <div className="flex-1 h-px bg-border" />
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              2
            </div>
            <span className={step === 2 ? "font-medium" : "text-muted-foreground"}>
              填写信息
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {step === 1 && (
            /* Step 1: Select Cases */
            <div className="flex-1 overflow-hidden flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <Label>选择要评审的用例</Label>
                <span className="text-sm text-muted-foreground">
                  已选择 {selectedCount} / {cases.length} 个用例
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
                <ScrollArea className="h-[300px]">
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
          )}

          {step === 2 && (
            /* Step 2: Review Info */
            <div className="flex-1 overflow-hidden flex flex-col gap-6">
              {/* Review Link */}
              <div className="space-y-2">
                <Label>评审地址</Label>
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
                <p className="text-xs text-muted-foreground">
                  评审专家可通过此链接访问评审页面
                </p>
              </div>

              {/* Expert Emails */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>评审专家邮箱</Label>
                  <Button variant="ghost" size="sm" onClick={handleAddEmail} className="gap-1 h-7">
                    <Plus className="w-3.5 h-3.5" />
                    添加邮箱
                  </Button>
                </div>
                <div className="space-y-2">
                  {emails.map((email, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        placeholder="请输入专家邮箱"
                        type="email"
                        value={email}
                        onChange={(e) => handleEmailChange(index, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveEmail(index)}
                        disabled={emails.length === 1}
                        className="shrink-0 h-9 w-9"
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  邀请邮件将发送至所填邮箱，已选择 {selectedCount} 个用例
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between gap-2 pt-4 border-t mt-4">
          {step === 1 ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                取消
              </Button>
              <Button onClick={handleNext} disabled={!canProceed} className="gap-2">
                下一步
                <ArrowRight className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleBack} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                上一步
              </Button>
              <Button onClick={handleConfirm}>发送邀请</Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
