import { ClipboardList, AlertTriangle, FileDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

interface IssueCategory {
  name: string;
  count: number;
  color: string;
}

interface DiscardReason {
  name: string;
  count: number;
  color: string;
}

interface CaseReviewStats {
  totalScenarios: number;
  totalCases: number;
  adopted: number;
  needsImprovement: number;
}

interface DeliverableReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deliverableName: string;
  stats?: CaseReviewStats;
}

// Mock data
const selfReviewIssues: IssueCategory[] = [
  { name: "场景问题", count: 10, color: "#f59e0b" },
  { name: "信息问题", count: 20, color: "#3b82f6" },
  { name: "数据问题", count: 30, color: "#ef4444" },
];

const discardReasons: DiscardReason[] = [
  { name: "场景重复", count: 20, color: "#94a3b8" },
  { name: "场景与需求不符", count: 10, color: "#f97316" },
  { name: "场景与功能不符", count: 20, color: "#dc2626" },
];

export function DeliverableReportDialog({ 
  open, 
  onOpenChange, 
  deliverableName,
  stats = { totalScenarios: 45, totalCases: 165, adopted: 138, needsImprovement: 27 }
}: DeliverableReportDialogProps) {
  const adoptedPercentage = stats.totalCases > 0 ? (stats.adopted / stats.totalCases) * 100 : 0;
  const totalDiscarded = discardReasons.reduce((sum, r) => sum + r.count, 0);

  const chartConfig = {
    count: { label: "数量" },
  };

  const handleExportIssues = () => {
    toast.success("问题清单导出成功");
  };

  const handleIssueClick = (category: string) => {
    toast.info(`查看${category}详情`);
  };

  const handleReasonClick = (reason: string) => {
    toast.info(`查看${reason}详情`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            {deliverableName} - 审查报告
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Case Review Summary Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-blue-500" />
                案例审查汇总
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{stats.totalScenarios}</div>
                  <div className="text-xs text-muted-foreground">总场景</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{stats.totalCases}</div>
                  <div className="text-xs text-muted-foreground">总案例</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.adopted}</div>
                  <div className="text-xs text-muted-foreground">采纳</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-500">{stats.needsImprovement}</div>
                  <div className="text-xs text-muted-foreground">需完善</div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>采纳率</span>
                  <span>{adoptedPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={adoptedPercentage} className="h-2" />
              </div>

              {/* Issue Classification Summary */}
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium">问题分类汇总</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    onClick={handleExportIssues}
                  >
                    <FileDown className="w-3.5 h-3.5 mr-1" />
                    导出问题清单
                  </Button>
                </div>
                <div className="flex items-center gap-4">
                  <ChartContainer config={chartConfig} className="h-[80px] w-[80px]">
                    <PieChart>
                      <Pie
                        data={selfReviewIssues}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={20}
                        outerRadius={35}
                      >
                        {selfReviewIssues.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                  <div className="flex-1 space-y-2">
                    {selfReviewIssues.map((issue) => (
                      <div key={issue.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2.5 h-2.5 rounded-full" 
                            style={{ backgroundColor: issue.color }}
                          />
                          <span className="text-xs text-muted-foreground">{issue.name}</span>
                        </div>
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs font-medium"
                          onClick={() => handleIssueClick(issue.name)}
                        >
                          {issue.count}条
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Discard Summary Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                丢弃情况汇总
                <Badge variant="secondary" className="ml-auto">{totalDiscarded}条</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <ChartContainer config={chartConfig} className="h-[120px] w-[160px]">
                  <BarChart data={discardReasons} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={90}
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {discardReasons.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
                <div className="flex-1 space-y-3">
                  {discardReasons.map((reason) => (
                    <div key={reason.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: reason.color }}
                        />
                        <span className="text-xs text-muted-foreground">{reason.name}</span>
                      </div>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs font-medium"
                        onClick={() => handleReasonClick(reason.name)}
                      >
                        {reason.count}条
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
