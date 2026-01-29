import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2, Copy, Check, ArrowRight, ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { toast } from "sonner";

interface CaseItem {
  id: string;
  code: string;
  name: string;
  selected: boolean;
}

interface TestPoint {
  id: string;
  name: string;
  cases: CaseItem[];
}

interface TestDimension {
  id: string;
  name: string;
  testPoints: TestPoint[];
}

const mockDimensions: TestDimension[] = [
  {
    id: "dim-1",
    name: "用户认证",
    testPoints: [
      {
        id: "tp-1",
        name: "登录功能",
        cases: [
          { id: "1", code: "TC-001", name: "用户登录功能验证", selected: false },
          { id: "2", code: "TC-002", name: "登录失败处理", selected: false },
          { id: "3", code: "TC-003", name: "记住密码功能", selected: false },
        ],
      },
      {
        id: "tp-2",
        name: "注册功能",
        cases: [
          { id: "4", code: "TC-004", name: "用户注册表单验证", selected: false },
          { id: "5", code: "TC-005", name: "邮箱验证流程", selected: false },
          { id: "6", code: "TC-006", name: "手机号注册", selected: false },
        ],
      },
    ],
  },
  {
    id: "dim-2",
    name: "权限管理",
    testPoints: [
      {
        id: "tp-3",
        name: "角色权限",
        cases: [
          { id: "7", code: "TC-007", name: "用户权限校验", selected: false },
          { id: "8", code: "TC-008", name: "管理员权限验证", selected: false },
          { id: "9", code: "TC-009", name: "权限继承测试", selected: false },
        ],
      },
      {
        id: "tp-4",
        name: "会话管理",
        cases: [
          { id: "10", code: "TC-010", name: "会话超时处理", selected: false },
          { id: "11", code: "TC-011", name: "多设备登录限制", selected: false },
        ],
      },
    ],
  },
  {
    id: "dim-3",
    name: "账户管理",
    testPoints: [
      {
        id: "tp-5",
        name: "信息维护",
        cases: [
          { id: "12", code: "TC-012", name: "用户信息修改", selected: false },
          { id: "13", code: "TC-013", name: "密码重置流程", selected: false },
          { id: "14", code: "TC-014", name: "头像上传测试", selected: false },
        ],
      },
      {
        id: "tp-6",
        name: "账户安全",
        cases: [
          { id: "15", code: "TC-015", name: "两步验证设置", selected: false },
          { id: "16", code: "TC-016", name: "登录日志查看", selected: false },
        ],
      },
    ],
  },
];

export default function InitiateExpertReview() {
  const navigate = useNavigate();
  const { workspaceId, recordId } = useParams();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [dimensions, setDimensions] = useState<TestDimension[]>(mockDimensions);
  const [emails, setEmails] = useState<string[]>([""]);
  const [copied, setCopied] = useState(false);
  const [expandedDimensions, setExpandedDimensions] = useState<Set<string>>(
    new Set(mockDimensions.map((d) => d.id))
  );
  const [expandedPoints, setExpandedPoints] = useState<Set<string>>(
    new Set(mockDimensions.flatMap((d) => d.testPoints.map((tp) => tp.id)))
  );

  const reviewLink = `https://review.example.com/expert/${Date.now()}`;

  const toggleDimension = (dimId: string) => {
    setExpandedDimensions((prev) => {
      const next = new Set(prev);
      if (next.has(dimId)) {
        next.delete(dimId);
      } else {
        next.add(dimId);
      }
      return next;
    });
  };

  const togglePoint = (pointId: string) => {
    setExpandedPoints((prev) => {
      const next = new Set(prev);
      if (next.has(pointId)) {
        next.delete(pointId);
      } else {
        next.add(pointId);
      }
      return next;
    });
  };

  const handleCaseToggle = (caseId: string) => {
    setDimensions((dims) =>
      dims.map((dim) => ({
        ...dim,
        testPoints: dim.testPoints.map((tp) => ({
          ...tp,
          cases: tp.cases.map((c) =>
            c.id === caseId ? { ...c, selected: !c.selected } : c
          ),
        })),
      }))
    );
  };

  const handlePointToggle = (pointId: string, checked: boolean) => {
    setDimensions((dims) =>
      dims.map((dim) => ({
        ...dim,
        testPoints: dim.testPoints.map((tp) =>
          tp.id === pointId
            ? { ...tp, cases: tp.cases.map((c) => ({ ...c, selected: checked })) }
            : tp
        ),
      }))
    );
  };

  const handleDimensionToggle = (dimId: string, checked: boolean) => {
    setDimensions((dims) =>
      dims.map((dim) =>
        dim.id === dimId
          ? {
              ...dim,
              testPoints: dim.testPoints.map((tp) => ({
                ...tp,
                cases: tp.cases.map((c) => ({ ...c, selected: checked })),
              })),
            }
          : dim
      )
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setDimensions((dims) =>
      dims.map((dim) => ({
        ...dim,
        testPoints: dim.testPoints.map((tp) => ({
          ...tp,
          cases: tp.cases.map((c) => ({ ...c, selected: checked })),
        })),
      }))
    );
  };

  const getAllCases = () => dimensions.flatMap((d) => d.testPoints.flatMap((tp) => tp.cases));
  const allCases = getAllCases();
  const selectedCount = allCases.filter((c) => c.selected).length;
  const allSelected = allCases.length > 0 && allCases.every((c) => c.selected);
  const someSelected = allCases.some((c) => c.selected) && !allSelected;

  const getPointStats = (tp: TestPoint) => {
    const selected = tp.cases.filter((c) => c.selected).length;
    const all = tp.cases.length;
    return { selected, all, allSelected: selected === all && all > 0, someSelected: selected > 0 && selected < all };
  };

  const getDimensionStats = (dim: TestDimension) => {
    const cases = dim.testPoints.flatMap((tp) => tp.cases);
    const selected = cases.filter((c) => c.selected).length;
    const all = cases.length;
    return { selected, all, allSelected: selected === all && all > 0, someSelected: selected > 0 && selected < all };
  };

  const canProceed = selectedCount > 0;

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
    toast.success("用例评审已成功发起！");
    // Navigate to the expert case review page
    navigate(`/workspace/${workspaceId}/management/ai-cases/${recordId}/expert-case-review`);
  };

  const handleBack = () => {
    if (step === 1) {
      navigate(`/workspace/${workspaceId}/management/ai-cases/${recordId}/expert-review`);
    } else {
      setStep(1);
    }
  };

  const handleNext = () => {
    setStep(2);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink 
              className="cursor-pointer"
              onClick={() => navigate(`/workspace/${workspaceId}/management/ai-cases`)}
            >
              智能用例设计
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink 
              className="cursor-pointer"
              onClick={() => navigate(`/workspace/${workspaceId}/management/ai-cases/${recordId}/expert-review`)}
            >
              专家评审
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>发起评审</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">发起专家评审</h1>
          <p className="text-muted-foreground mt-1">
            {step === 1 ? "选择需要专家评审的用例" : "填写评审信息并发送邀请"}
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-4 mb-6 bg-card border rounded-lg p-4">
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

      {/* Content */}
      <div className="bg-card border rounded-lg p-6">
        {step === 1 && (
          /* Step 1: Select Cases */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">选择要评审的场景</Label>
              <span className="text-sm text-muted-foreground">
                已选择 {selectedCount} / {allCases.length} 个场景
              </span>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 border-b">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  className="data-[state=indeterminate]:bg-primary"
                  {...(someSelected ? { "data-state": "indeterminate" } : {})}
                />
                <span className="text-sm font-medium">全选</span>
              </div>
              <ScrollArea className="h-[400px]">
                <div className="divide-y">
                  {dimensions.map((dim) => {
                    const dimStats = getDimensionStats(dim);
                    const isDimExpanded = expandedDimensions.has(dim.id);
                    return (
                      <div key={dim.id}>
                        {/* Dimension Header */}
                        <div
                          className="flex items-center gap-2 px-4 py-3 bg-muted/30 hover:bg-muted/50 cursor-pointer"
                          onClick={() => toggleDimension(dim.id)}
                        >
                          <button
                            className="p-0.5 hover:bg-muted rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDimension(dim.id);
                            }}
                          >
                            {isDimExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                          <Checkbox
                            checked={dimStats.allSelected}
                            onCheckedChange={(checked) => handleDimensionToggle(dim.id, !!checked)}
                            onClick={(e) => e.stopPropagation()}
                            className="data-[state=indeterminate]:bg-primary"
                            {...(dimStats.someSelected ? { "data-state": "indeterminate" } : {})}
                          />
                          <span className="text-sm font-medium">{dim.name}</span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {dimStats.selected}/{dimStats.all}
                          </span>
                        </div>
                        {/* Test Points (Scenarios) */}
                        {isDimExpanded && dim.testPoints.map((tp) => {
                          const tpStats = getPointStats(tp);
                          return (
                            <div key={tp.id}>
                              <div
                                className="flex items-center gap-2 px-4 py-2.5 pl-10 hover:bg-muted/20 cursor-pointer"
                                onClick={() => handlePointToggle(tp.id, !tpStats.allSelected)}
                              >
                                <Checkbox
                                  checked={tpStats.allSelected}
                                  onCheckedChange={(checked) => handlePointToggle(tp.id, !!checked)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="data-[state=indeterminate]:bg-primary"
                                  {...(tpStats.someSelected ? { "data-state": "indeterminate" } : {})}
                                />
                                <span className="text-sm">{tp.name}</span>
                                <span className="text-xs text-muted-foreground ml-auto">
                                  {tpStats.selected}/{tpStats.all} 个用例
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleNext} disabled={!canProceed} className="gap-2">
                下一步
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          /* Step 2: Review Info */
          <div className="space-y-6">
            {/* Review Link */}
            <div className="space-y-2">
              <Label className="text-base">评审地址</Label>
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
                <Label className="text-base">评审专家邮箱</Label>
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
                评审邀请将发送至以上邮箱
              </p>
            </div>

            {/* Selected Cases Summary */}
            <div className="space-y-2">
              <Label className="text-base">已选用例</Label>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm">
                  共选择 <span className="font-medium text-primary">{selectedCount}</span> 个用例进行专家评审
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleBack} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                上一步
              </Button>
              <Button onClick={handleConfirm}>发送邀请</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
