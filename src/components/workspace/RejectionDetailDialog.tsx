import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RejectedCase {
  id: string;
  code: string;
  name: string;
  rejectTag: string;
  rejectReason: string;
  reviewer: string;
  reviewTime: string;
}

interface RejectionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recordName: string;
  rejectedCases: RejectedCase[];
}

export function RejectionDetailDialog({
  open,
  onOpenChange,
  recordName,
  rejectedCases,
}: RejectionDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>不采纳用例详情 - {recordName}</DialogTitle>
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
                      <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600 border-red-200">
                        {caseItem.rejectTag}
                      </Badge>
                    </div>
                    <h4 className="font-medium">{caseItem.name}</h4>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div>{caseItem.reviewer}</div>
                    <div>{caseItem.reviewTime}</div>
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-sm text-muted-foreground mb-1">不采纳原因</div>
                  <div className="text-sm">{caseItem.rejectReason}</div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
