import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface SmartReviewSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (selectedCases: string[]) => void;
}

const mockDimensions: TestDimension[] = [
  {
    id: "dim-1",
    name: "用户管理",
    testPoints: [
      {
        id: "tp-1",
        name: "用户注册",
        cases: [
          { id: "case-1", code: "TC-001", name: "正常注册流程验证", selected: true },
          { id: "case-2", code: "TC-002", name: "重复邮箱注册验证", selected: true },
          { id: "case-3", code: "TC-003", name: "密码强度验证", selected: true },
        ],
      },
      {
        id: "tp-2",
        name: "用户登录",
        cases: [
          { id: "case-4", code: "TC-004", name: "正常登录验证", selected: true },
          { id: "case-5", code: "TC-005", name: "错误密码登录", selected: true },
        ],
      },
    ],
  },
  {
    id: "dim-2",
    name: "订单管理",
    testPoints: [
      {
        id: "tp-3",
        name: "订单创建",
        cases: [
          { id: "case-6", code: "TC-006", name: "正常订单创建", selected: true },
          { id: "case-7", code: "TC-007", name: "库存不足订单创建", selected: true },
        ],
      },
    ],
  },
];

export function SmartReviewSelectDialog({
  open,
  onOpenChange,
  onConfirm,
}: SmartReviewSelectDialogProps) {
  const [dimensions, setDimensions] = useState<TestDimension[]>(mockDimensions);
  const [expandedDimensions, setExpandedDimensions] = useState<Set<string>>(
    new Set(mockDimensions.map((d) => d.id))
  );
  const [expandedPoints, setExpandedPoints] = useState<Set<string>>(
    new Set(mockDimensions.flatMap((d) => d.testPoints.map((tp) => tp.id)))
  );

  const toggleDimensionExpand = (dimId: string) => {
    const newExpanded = new Set(expandedDimensions);
    if (newExpanded.has(dimId)) {
      newExpanded.delete(dimId);
    } else {
      newExpanded.add(dimId);
    }
    setExpandedDimensions(newExpanded);
  };

  const togglePointExpand = (pointId: string) => {
    const newExpanded = new Set(expandedPoints);
    if (newExpanded.has(pointId)) {
      newExpanded.delete(pointId);
    } else {
      newExpanded.add(pointId);
    }
    setExpandedPoints(newExpanded);
  };

  const handleCaseToggle = (caseId: string) => {
    setDimensions((prev) =>
      prev.map((dim) => ({
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
    setDimensions((prev) =>
      prev.map((dim) => ({
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
    setDimensions((prev) =>
      prev.map((dim) =>
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
    setDimensions((prev) =>
      prev.map((dim) => ({
        ...dim,
        testPoints: dim.testPoints.map((tp) => ({
          ...tp,
          cases: tp.cases.map((c) => ({ ...c, selected: checked })),
        })),
      }))
    );
  };

  const getPointState = (tp: TestPoint) => {
    const selectedCount = tp.cases.filter((c) => c.selected).length;
    if (selectedCount === 0) return { checked: false, indeterminate: false };
    if (selectedCount === tp.cases.length) return { checked: true, indeterminate: false };
    return { checked: false, indeterminate: true };
  };

  const getDimensionState = (dim: TestDimension) => {
    const allCases = dim.testPoints.flatMap((tp) => tp.cases);
    const selectedCount = allCases.filter((c) => c.selected).length;
    if (selectedCount === 0) return { checked: false, indeterminate: false };
    if (selectedCount === allCases.length) return { checked: true, indeterminate: false };
    return { checked: false, indeterminate: true };
  };

  const getAllState = () => {
    const allCases = dimensions.flatMap((d) => d.testPoints.flatMap((tp) => tp.cases));
    const selectedCount = allCases.filter((c) => c.selected).length;
    if (selectedCount === 0) return { checked: false, indeterminate: false };
    if (selectedCount === allCases.length) return { checked: true, indeterminate: false };
    return { checked: false, indeterminate: true };
  };

  const getSelectedCaseIds = () => {
    return dimensions.flatMap((d) =>
      d.testPoints.flatMap((tp) => tp.cases.filter((c) => c.selected).map((c) => c.id))
    );
  };

  const selectedCount = getSelectedCaseIds().length;
  const totalCount = dimensions.flatMap((d) => d.testPoints.flatMap((tp) => tp.cases)).length;
  const allState = getAllState();

  const handleConfirm = () => {
    onConfirm(getSelectedCaseIds());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            选择审查用例
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between py-3 border-b">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={allState.checked}
              onCheckedChange={(checked) => handleSelectAll(checked === true)}
              className={cn(allState.indeterminate && "data-[state=checked]:bg-primary/50")}
              ref={(el) => {
                if (el) {
                  (el as HTMLButtonElement).dataset.state = allState.indeterminate
                    ? "indeterminate"
                    : allState.checked
                    ? "checked"
                    : "unchecked";
                }
              }}
            />
            <span className="text-sm font-medium">全选</span>
          </div>
          <span className="text-sm text-muted-foreground">
            已选择 {selectedCount}/{totalCount} 个用例
          </span>
        </div>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-2 py-4">
            {dimensions.map((dim) => {
              const dimState = getDimensionState(dim);
              const isDimExpanded = expandedDimensions.has(dim.id);

              return (
                <div key={dim.id} className="border rounded-lg">
                  <div className="flex items-center gap-3 p-3 bg-muted/50">
                    <button
                      onClick={() => toggleDimensionExpand(dim.id)}
                      className="p-0.5 hover:bg-muted rounded"
                    >
                      {isDimExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    <Checkbox
                      checked={dimState.checked}
                      onCheckedChange={(checked) =>
                        handleDimensionToggle(dim.id, checked === true)
                      }
                      ref={(el) => {
                        if (el) {
                          (el as HTMLButtonElement).dataset.state = dimState.indeterminate
                            ? "indeterminate"
                            : dimState.checked
                            ? "checked"
                            : "unchecked";
                        }
                      }}
                    />
                    <span className="font-medium text-sm">{dim.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {dim.testPoints.flatMap((tp) => tp.cases).filter((c) => c.selected).length}/
                      {dim.testPoints.flatMap((tp) => tp.cases).length}
                    </span>
                  </div>

                  {isDimExpanded && (
                    <div className="pl-8 pr-3 pb-2 space-y-1">
                      {dim.testPoints.map((tp) => {
                        const tpState = getPointState(tp);
                        const isTpExpanded = expandedPoints.has(tp.id);

                        return (
                          <div key={tp.id}>
                            <div className="flex items-center gap-3 py-2">
                              <button
                                onClick={() => togglePointExpand(tp.id)}
                                className="p-0.5 hover:bg-muted rounded"
                              >
                                {isTpExpanded ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </button>
                              <Checkbox
                                checked={tpState.checked}
                                onCheckedChange={(checked) =>
                                  handlePointToggle(tp.id, checked === true)
                                }
                                ref={(el) => {
                                  if (el) {
                                    (el as HTMLButtonElement).dataset.state = tpState.indeterminate
                                      ? "indeterminate"
                                      : tpState.checked
                                      ? "checked"
                                      : "unchecked";
                                  }
                                }}
                              />
                              <span className="text-sm">{tp.name}</span>
                              <span className="text-xs text-muted-foreground ml-auto">
                                {tp.cases.filter((c) => c.selected).length}/{tp.cases.length}
                              </span>
                            </div>

                            {isTpExpanded && (
                              <div className="pl-10 space-y-1">
                                {tp.cases.map((caseItem) => (
                                  <div
                                    key={caseItem.id}
                                    className="flex items-center gap-3 py-1.5 text-sm"
                                  >
                                    <Checkbox
                                      checked={caseItem.selected}
                                      onCheckedChange={() => handleCaseToggle(caseItem.id)}
                                    />
                                    <span className="text-muted-foreground font-mono text-xs">
                                      {caseItem.code}
                                    </span>
                                    <span>{caseItem.name}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={selectedCount === 0} className="gap-2">
            <Sparkles className="w-4 h-4" />
            开始智能审查
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
