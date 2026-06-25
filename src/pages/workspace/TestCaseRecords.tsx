import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, Clock, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RunRecord {
  id: string;
  executedAt: string;
  executor: string;
  environment: string;
  duration: string;
  status: "passed" | "failed" | "running";
}

const mockRecords: RunRecord[] = [
  { id: "r-001", executedAt: "2026-06-25 09:42:18", executor: "张伟", environment: "测试环境", duration: "12s", status: "passed" },
  { id: "r-002", executedAt: "2026-06-24 18:05:32", executor: "CI Pipeline", environment: "预发布环境", duration: "15s", status: "failed" },
  { id: "r-003", executedAt: "2026-06-24 10:21:07", executor: "李娜", environment: "测试环境", duration: "11s", status: "passed" },
  { id: "r-004", executedAt: "2026-06-23 22:00:00", executor: "定时任务", environment: "测试环境", duration: "13s", status: "passed" },
  { id: "r-005", executedAt: "2026-06-23 14:33:46", executor: "王芳", environment: "开发环境", duration: "10s", status: "failed" },
];

const statusConfig = {
  passed: { label: "通过", icon: CheckCircle2, className: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  failed: { label: "失败", icon: XCircle, className: "text-red-600 bg-red-50 border-red-200" },
  running: { label: "执行中", icon: Clock, className: "text-blue-600 bg-blue-50 border-blue-200" },
};

export default function TestCaseRecords() {
  const { workspaceId, caseId } = useParams<{ workspaceId: string; caseId: string }>();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/workspace/${workspaceId}/management/cases/${caseId}`)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">测试记录</h1>
            <p className="text-muted-foreground text-sm mt-1">案例 {caseId} 的历史执行记录</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="grid grid-cols-[1.4fr_1fr_1fr_100px_100px_100px] gap-2 px-6 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
          <div>执行时间</div>
          <div>执行人</div>
          <div>环境</div>
          <div>耗时</div>
          <div>状态</div>
          <div className="text-right">操作</div>
        </div>
        {mockRecords.map((r) => {
          const cfg = statusConfig[r.status];
          const StatusIcon = cfg.icon;
          return (
            <div
              key={r.id}
              className="grid grid-cols-[1.4fr_1fr_1fr_100px_100px_100px] gap-2 px-6 py-3 border-b last:border-b-0 items-center text-sm hover:bg-muted/30"
            >
              <div className="text-foreground">{r.executedAt}</div>
              <div className="text-foreground">{r.executor}</div>
              <div className="text-muted-foreground">{r.environment}</div>
              <div className="text-muted-foreground">{r.duration}</div>
              <div>
                <Badge variant="outline" className={`gap-1 ${cfg.className}`}>
                  <StatusIcon className="w-3 h-3" />
                  {cfg.label}
                </Badge>
              </div>
              <div className="text-right">
                <Button variant="ghost" size="sm" className="gap-1 text-primary">
                  <PlayCircle className="w-3.5 h-3.5" />
                  详情
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
