import { useState, useEffect } from "react";
import { CheckCircle2, ChevronDown, ChevronRight } from "lucide-react";
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
import { cn } from "@/lib/utils";

interface CaseItem {
  id: string;
  code: string;
  name: string;
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

// Mock data for hierarchical cases
const mockDimensions: TestDimension[] = [
  {
    id: "dim-1",
    name: "用户管理",
    testPoints: [
      {
        id: "tp-1-1",
        name: "用户注册",
        cases: [
          { id: "case-1", code: "TC-001", name: "正常注册流程验证" },
          { id: "case-2", code: "TC-002", name: "邮箱格式校验" },
          { id: "case-3", code: "TC-003", name: "密码强度校验" },
        ],
      },
      {
        id: "tp-1-2",
        name: "用户登录",
        cases: [
          { id: "case-4", code: "TC-004", name: "正常登录验证" },
          { id: "case-5", code: "TC-005", name: "密码错误提示" },
          { id: "case-6", code: "TC-006", name: "账号锁定机制" },
        ],
      },
    ],
  },
  {
    id: "dim-2",
    name: "权限控制",
    testPoints: [
      {
        id: "tp-2-1",
        name: "角色管理",
        cases: [
          { id: "case-7", code: "TC-007", name: "角色创建验证" },
          { id: "case-8", code: "TC-008", name: "角色权限分配" },
        ],
      },
      {
        id: "tp-2-2",
        name: "权限验证",
        cases: [
          { id: "case-9", code: "TC-009", name: "页面访问权限" },
          { id: "case-10", code: "TC-010", name: "接口权限校验" },
        ],
      },
    ],
  },
  {
    id: "dim-3",
    name: "数据安全",
    testPoints: [
      {
        id: "tp-3-1",
        name: "数据加密",
        cases: [
          { id: "case-11", code: "TC-011", name: "敏感数据加密存储" },
          { id: "case-12", code: "TC-012", name: "传输加密验证" },
        ],
      },
    ],
  },
];

interface ConfirmGenerationResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ConfirmGenerationResultDialog({
  open,
  onOpenChange,
  onConfirm,
}: ConfirmGenerationResultDialogProps) {
  const [selectedCases, setSelectedCases] = useState<Set<string>>(new Set());
  const [expandedDimensions, setExpandedDimensions] = useState<Set<string>>(new Set());
  const [expandedPoints, setExpandedPoints] = useState<Set<string>>(new Set());

  // Initialize all cases as selected when dialog opens
  useEffect(() => {
    if (open) {
      const allCaseIds = new Set<string>();
      const allDimIds = new Set<string>();
      const allPointIds = new Set<string>();
      
      mockDimensions.forEach((dim) => {
        allDimIds.add(dim.id);
        dim.testPoints.forEach((point) => {
          allPointIds.add(point.id);
          point.cases.forEach((c) => {
            allCaseIds.add(c.id);
          });
        });
      });
      
      setSelectedCases(allCaseIds);
      setExpandedDimensions(allDimIds);
      setExpandedPoints(allPointIds);
    }
  }, [open]);

  const getAllCaseIds = () => {
    const ids: string[] = [];
    mockDimensions.forEach((dim) => {
      dim.testPoints.forEach((point) => {
        point.cases.forEach((c) => {
          ids.push(c.id);
        });
      });
    });
    return ids;
  };

  const getDimensionCaseIds = (dimId: string) => {
    const dim = mockDimensions.find((d) => d.id === dimId);
    if (!dim) return [];
    const ids: string[] = [];
    dim.testPoints.forEach((point) => {
      point.cases.forEach((c) => {
        ids.push(c.id);
      });
    });
    return ids;
  };

  const getPointCaseIds = (pointId: string) => {
    for (const dim of mockDimensions) {
      const point = dim.testPoints.find((p) => p.id === pointId);
      if (point) {
        return point.cases.map((c) => c.id);
      }
    }
    return [];
  };

  const isAllSelected = () => {
    const allIds = getAllCaseIds();
    return allIds.length > 0 && allIds.every((id) => selectedCases.has(id));
  };

  const isSomeSelected = () => {
    const allIds = getAllCaseIds();
    const selectedCount = allIds.filter((id) => selectedCases.has(id)).length;
    return selectedCount > 0 && selectedCount < allIds.length;
  };

  const isDimensionSelected = (dimId: string) => {
    const ids = getDimensionCaseIds(dimId);
    return ids.length > 0 && ids.every((id) => selectedCases.has(id));
  };

  const isDimensionIndeterminate = (dimId: string) => {
    const ids = getDimensionCaseIds(dimId);
    const selectedCount = ids.filter((id) => selectedCases.has(id)).length;
    return selectedCount > 0 && selectedCount < ids.length;
  };

  const isPointSelected = (pointId: string) => {
    const ids = getPointCaseIds(pointId);
    return ids.length > 0 && ids.every((id) => selectedCases.has(id));
  };

  const isPointIndeterminate = (pointId: string) => {
    const ids = getPointCaseIds(pointId);
    const selectedCount = ids.filter((id) => selectedCases.has(id)).length;
    return selectedCount > 0 && selectedCount < ids.length;
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCases(new Set(getAllCaseIds()));
    } else {
      setSelectedCases(new Set());
    }
  };

  const handleDimensionToggle = (dimId: string, checked: boolean) => {
    const ids = getDimensionCaseIds(dimId);
    const newSelected = new Set(selectedCases);
    ids.forEach((id) => {
      if (checked) {
        newSelected.add(id);
      } else {
        newSelected.delete(id);
      }
    });
    setSelectedCases(newSelected);
  };

  const handlePointToggle = (pointId: string, checked: boolean) => {
    const ids = getPointCaseIds(pointId);
    const newSelected = new Set(selectedCases);
    ids.forEach((id) => {
      if (checked) {
        newSelected.add(id);
      } else {
        newSelected.delete(id);
      }
    });
    setSelectedCases(newSelected);
  };

  const handleCaseToggle = (caseId: string) => {
    const newSelected = new Set(selectedCases);
    if (newSelected.has(caseId)) {
      newSelected.delete(caseId);
    } else {
      newSelected.add(caseId);
    }
    setSelectedCases(newSelected);
  };

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

  const totalCases = getAllCaseIds().length;
  const selectedCount = selectedCases.size;

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            确认生成结果
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between py-2 px-1 border-b">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isAllSelected()}
              ref={(el) => {
                if (el) {
                  (el as unknown as HTMLInputElement).indeterminate = isSomeSelected();
                }
              }}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm font-medium">全选</span>
          </div>
          <span className="text-sm text-muted-foreground">
            已选择 {selectedCount}/{totalCases} 个案例
          </span>
        </div>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-1 py-2">
            {mockDimensions.map((dim) => (
              <div key={dim.id} className="border rounded-lg overflow-hidden">
                {/* Dimension Header */}
                <div
                  className="flex items-center gap-2 p-3 bg-muted/50 cursor-pointer hover:bg-muted/70"
                  onClick={() => toggleDimensionExpand(dim.id)}
                >
                  <Checkbox
                    checked={isDimensionSelected(dim.id)}
                    ref={(el) => {
                      if (el) {
                        (el as unknown as HTMLInputElement).indeterminate = isDimensionIndeterminate(dim.id);
                      }
                    }}
                    onCheckedChange={(checked) => handleDimensionToggle(dim.id, checked as boolean)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {expandedDimensions.has(dim.id) ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="font-medium text-sm">{dim.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {getDimensionCaseIds(dim.id).filter((id) => selectedCases.has(id)).length}/
                    {getDimensionCaseIds(dim.id).length}
                  </span>
                </div>

                {/* Test Points */}
                {expandedDimensions.has(dim.id) && (
                  <div className="divide-y">
                    {dim.testPoints.map((point) => (
                      <div key={point.id}>
                        {/* Point Header */}
                        <div
                          className="flex items-center gap-2 p-2 pl-8 bg-background cursor-pointer hover:bg-muted/30"
                          onClick={() => togglePointExpand(point.id)}
                        >
                          <Checkbox
                            checked={isPointSelected(point.id)}
                            ref={(el) => {
                              if (el) {
                                (el as unknown as HTMLInputElement).indeterminate = isPointIndeterminate(point.id);
                              }
                            }}
                            onCheckedChange={(checked) => handlePointToggle(point.id, checked as boolean)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          {expandedPoints.has(point.id) ? (
                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                          )}
                          <span className="text-sm">{point.name}</span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {getPointCaseIds(point.id).filter((id) => selectedCases.has(id)).length}/
                            {point.cases.length}
                          </span>
                        </div>

                        {/* Cases */}
                        {expandedPoints.has(point.id) && (
                          <div className="bg-muted/20">
                            {point.cases.map((caseItem) => (
                              <div
                                key={caseItem.id}
                                className="flex items-center gap-2 p-2 pl-14 hover:bg-muted/30 cursor-pointer"
                                onClick={() => handleCaseToggle(caseItem.id)}
                              >
                                <Checkbox
                                  checked={selectedCases.has(caseItem.id)}
                                  onCheckedChange={() => handleCaseToggle(caseItem.id)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <span className="text-xs font-mono text-muted-foreground w-16">
                                  {caseItem.code}
                                </span>
                                <span className="text-sm truncate">{caseItem.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={selectedCount === 0}>
            确认 ({selectedCount})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
