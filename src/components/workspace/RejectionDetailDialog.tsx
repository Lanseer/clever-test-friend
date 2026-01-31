import { useState } from "react";
import { User, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CaseSourceInfo } from "./CaseSourceInfo";

interface ExpertRejection {
  expertName?: string;
  rejectTag: string;
  rejectReason: string;
  reviewTime: string;
}

interface RejectedCase {
  id: string;
  code: string;
  name: string;
  rejections: ExpertRejection[];
}

interface RejectionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recordName: string;
  rejectedCases: RejectedCase[];
}

// Case detail dialog component
interface CaseDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseItem: RejectedCase | null;
}

function CaseDetailDialog({ open, onOpenChange, caseItem }: CaseDetailDialogProps) {
  if (!caseItem) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>案例详情 - {caseItem.code}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1">
          <div className="space-y-4 pr-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">案例名称</div>
              <div className="font-medium">{caseItem.name}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">案例编号</div>
              <div className="font-mono text-sm">{caseItem.code}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">测试步骤</div>
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                <ol className="list-decimal list-inside space-y-1">
                  <li>打开系统登录页面</li>
                  <li>输入用户名和密码</li>
                  <li>点击登录按钮</li>
                  <li>验证登录结果</li>
                </ol>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">预期结果</div>
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                登录成功后跳转到首页，显示用户信息
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">案例来源</div>
              <CaseSourceInfo caseId={caseItem.id} showHeader={false} compact />
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export function RejectionDetailDialog({
  open,
  onOpenChange,
  recordName,
  rejectedCases,
}: RejectionDetailDialogProps) {
  const [caseDetailOpen, setCaseDetailOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<RejectedCase | null>(null);

  const handleOpenCaseDetail = (caseItem: RejectedCase) => {
    setSelectedCase(caseItem);
    setCaseDetailOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>不采纳案例详情 - {recordName}</DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1">
            <div className="space-y-4 pr-4">
              {rejectedCases.map((caseItem) => (
                <div
                  key={caseItem.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground">
                          {caseItem.code}
                        </span>
                      </div>
                      <button
                        className="font-medium text-primary hover:underline text-left"
                        onClick={() => handleOpenCaseDetail(caseItem)}
                      >
                        {caseItem.name}
                      </button>
                    </div>
                    <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600 border-red-200">
                      {caseItem.rejections.length} 位专家不采纳
                    </Badge>
                  </div>
                  
                  {/* Multiple expert rejections */}
                  <div className="space-y-3">
                    {caseItem.rejections.map((rejection, idx) => (
                      <div key={idx} className="bg-muted/50 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {rejection.expertName || "匿名"}
                            </span>
                            <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600 border-red-200">
                              {rejection.rejectTag}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {rejection.reviewTime}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {rejection.rejectReason || "未填写原因"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <CaseDetailDialog
        open={caseDetailOpen}
        onOpenChange={setCaseDetailOpen}
        caseItem={selectedCase}
      />
    </>
  );
}
