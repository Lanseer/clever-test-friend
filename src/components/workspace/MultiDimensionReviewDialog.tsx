import { useState } from "react";
import { Shield, AlertTriangle, CheckCircle, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface ReviewItem {
  id: string;
  category: string;
  subItem: string;
  isRisk: boolean;
  riskDescription: string;
  manualDismissNote: string;
  dismissed: boolean;
}

const mockReviewItems: ReviewItem[] = [
  {
    id: "1",
    category: "完整度检查",
    subItem: "权限控制",
    isRisk: true,
    riskDescription: "缺少权限控制相关规则",
    manualDismissNote: "",
    dismissed: false,
  },
  {
    id: "2",
    category: "完整度检查",
    subItem: "资金处理",
    isRisk: false,
    riskDescription: "",
    manualDismissNote: "",
    dismissed: false,
  },
  {
    id: "3",
    category: "完整度检查",
    subItem: "风控准入",
    isRisk: false,
    riskDescription: "",
    manualDismissNote: "",
    dismissed: false,
  },
  {
    id: "4",
    category: "完整度检查",
    subItem: "额度限额",
    isRisk: true,
    riskDescription: "未考虑年限额、限额回滚",
    manualDismissNote: "",
    dismissed: false,
  },
  {
    id: "5",
    category: "安全度检查",
    subItem: "数据加密",
    isRisk: true,
    riskDescription: "未覆盖传输层加密验证场景",
    manualDismissNote: "",
    dismissed: false,
  },
  {
    id: "6",
    category: "安全度检查",
    subItem: "身份认证",
    isRisk: false,
    riskDescription: "",
    manualDismissNote: "",
    dismissed: false,
  },
  {
    id: "7",
    category: "安全度检查",
    subItem: "预留",
    isRisk: false,
    riskDescription: "",
    manualDismissNote: "",
    dismissed: false,
  },
  {
    id: "8",
    category: "一致性检查",
    subItem: "接口一致性",
    isRisk: true,
    riskDescription: "部分接口参数与文档描述不一致",
    manualDismissNote: "",
    dismissed: false,
  },
  {
    id: "9",
    category: "一致性检查",
    subItem: "业务流程一致性",
    isRisk: false,
    riskDescription: "",
    manualDismissNote: "",
    dismissed: false,
  },
  {
    id: "10",
    category: "边界检查",
    subItem: "边界值覆盖",
    isRisk: true,
    riskDescription: "缺少金额上下限边界测试",
    manualDismissNote: "",
    dismissed: false,
  },
];

interface MultiDimensionReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MultiDimensionReviewDialog({
  open,
  onOpenChange,
}: MultiDimensionReviewDialogProps) {
  const [items, setItems] = useState<ReviewItem[]>(mockReviewItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState("");

  const riskCount = items.filter((i) => i.isRisk && !i.dismissed).length;
  const totalRisks = items.filter((i) => i.isRisk).length;
  const dismissedCount = items.filter((i) => i.dismissed).length;

  // Group items by category
  const categories = Array.from(new Set(items.map((i) => i.category)));

  const handleDismiss = (id: string) => {
    setEditingId(id);
    setEditNote("");
  };

  const handleConfirmDismiss = (id: string) => {
    if (!editNote.trim()) {
      toast.error("请填写擦除说明");
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, dismissed: true, manualDismissNote: editNote }
          : item
      )
    );
    setEditingId(null);
    setEditNote("");
    toast.success("风险项已擦除");
  };

  const handleUndoDismiss = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, dismissed: false, manualDismissNote: "" }
          : item
      )
    );
    toast.info("已恢复风险项");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            多维度智能覆盖率评估
            <Badge variant="destructive" className="ml-2">
              {riskCount} 个风险项
            </Badge>
            {dismissedCount > 0 && (
              <Badge variant="outline" className="text-muted-foreground">
                已擦除 {dismissedCount} 项
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">审查项</TableHead>
                <TableHead className="w-[120px]">子项</TableHead>
                <TableHead className="w-[80px] text-center">是否风险</TableHead>
                <TableHead>风险说明</TableHead>
                <TableHead className="w-[200px]">人工擦除说明</TableHead>
                <TableHead className="w-[80px] text-center">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => {
                const categoryItems = items.filter(
                  (i) => i.category === category
                );
                return categoryItems.map((item, idx) => (
                  <TableRow
                    key={item.id}
                    className={
                      item.dismissed
                        ? "opacity-60 bg-muted/30"
                        : item.isRisk
                        ? "bg-red-500/5"
                        : ""
                    }
                  >
                    {idx === 0 ? (
                      <TableCell
                        rowSpan={categoryItems.length}
                        className="font-medium align-top border-r"
                      >
                        {category}
                      </TableCell>
                    ) : null}
                    <TableCell className="text-sm">{item.subItem}</TableCell>
                    <TableCell className="text-center">
                      {item.isRisk ? (
                        item.dismissed ? (
                          <span className="text-muted-foreground line-through text-sm">是</span>
                        ) : (
                          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200 text-xs">
                            是
                          </Badge>
                        )
                      ) : (
                        <span className="text-sm text-muted-foreground">否</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.isRisk ? (
                        <span className={item.dismissed ? "line-through text-muted-foreground" : "text-red-600"}>
                          {item.riskDescription}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.dismissed ? (
                        <span className="text-sm text-muted-foreground">{item.manualDismissNote}</span>
                      ) : editingId === item.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            value={editNote}
                            onChange={(e) => setEditNote(e.target.value)}
                            placeholder="请输入擦除说明..."
                            className="h-7 text-xs"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleConfirmDismiss(item.id);
                            }}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={() => handleConfirmDismiss(item.id)}
                          >
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.isRisk && !item.dismissed && editingId !== item.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => handleDismiss(item.id)}
                        >
                          擦除
                        </Button>
                      )}
                      {item.dismissed && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-muted-foreground"
                          onClick={() => handleUndoDismiss(item.id)}
                        >
                          恢复
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ));
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
