import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface ProcessFlowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProcessFlowDialog({ open, onOpenChange }: ProcessFlowDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">业务流程图</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-8 mt-2">
          {/* Left: Flowchart */}
          <div className="flex flex-col items-center">
            <FlowChart />
          </div>

          {/* Right: Description */}
          <div className="space-y-6">
            {/* Flow Steps */}
            <div className="rounded-lg border-2 border-destructive/30 bg-destructive/5 p-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                这是一张银行对公客户交易业务的流程图，展示了从进入交易到交易结束的完整业务处理流程。
              </p>
              <p className="text-sm font-medium mt-3">流程步骤如下：</p>
              <ol className="text-sm space-y-1 list-decimal list-inside text-foreground/80">
                <li>进入交易</li>
                <li>录入客户信息、客户号或证件号码（同时联动"对公维护客户尽职调出"）</li>
                <li>判断客户是否存在：若不存在，则返回到输入界面；若存在，继续下一步</li>
                <li>输入客户填写信息</li>
                <li>选择现金/转账方式：若为现金，进入"联动配款交易"；若为转账，进入"输入对方账户信息"</li>
                <li>提交</li>
                <li>发起授权：若失败，提示失败原因后结束交易；若成功，继续下一步</li>
                <li>无纸化或纸质打印及影像采集</li>
                <li>交易结束</li>
              </ol>
            </div>

            {/* Modification Type */}
            <div>
              <h4 className="font-medium text-sm mb-2">改造类型</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-3 py-2 text-left font-medium">序号</th>
                      <th className="px-3 py-2 text-left font-medium">改造类型</th>
                      <th className="px-3 py-2 text-left font-medium">交易系统</th>
                      <th className="px-3 py-2 text-left font-medium">交易名称</th>
                      <th className="px-3 py-2 text-left font-medium">改造说明</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="px-3 py-2">1</td>
                      <td className="px-3 py-2">优化</td>
                      <td className="px-3 py-2">柜面 核心</td>
                      <td className="px-3 py-2">对公活期开户</td>
                      <td className="px-3 py-2 text-muted-foreground">根据新核心最新功能进行调整</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Counter Design */}
            <div>
              <h4 className="font-medium text-sm mb-2">柜面设计</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="px-3 py-2 bg-muted/30 font-medium w-28">功能名称</td>
                      <td className="px-3 py-2">对公活期开户</td>
                      <td className="px-3 py-2 bg-muted/30 font-medium w-20">核心功能</td>
                      <td className="px-3 py-2"></td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-3 py-2 bg-muted/30 font-medium">菜单位置</td>
                      <td className="px-3 py-2" colSpan={3}>对公账户管理-对公活期开户</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-3 py-2 bg-muted/30 font-medium">功能说明</td>
                      <td className="px-3 py-2" colSpan={3}>用于对公客户以人民币/外币/本外币一体化账户活期开户为目的建立客户及账户信息一体化流程。</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-3 py-2 bg-muted/30 font-medium">币种</td>
                      <td className="px-3 py-2">☑本币 ☑外币</td>
                      <td className="px-3 py-2 bg-muted/30 font-medium text-xs">是否允许冲销</td>
                      <td className="px-3 py-2 text-xs">人民币活期开户进行冲销（外币待与外汇确认）</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-3 py-2 bg-muted/30 font-medium">交易类型</td>
                      <td className="px-3 py-2">事务类</td>
                      <td className="px-3 py-2 bg-muted/30 font-medium">流程类型</td>
                      <td className="px-3 py-2">普通型</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 bg-muted/30 font-medium">视图规则</td>
                      <td className="px-3 py-2">☑客户视图☐内部视图</td>
                      <td className="px-3 py-2 bg-muted/30 font-medium">操作机构</td>
                      <td className="px-3 py-2">账户开户机构</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Simple flowchart component
function FlowChart() {
  const nodes = [
    { text: "进入交易", type: "rounded" as const },
    { text: "录入客户信息、客户号或证件号码", type: "rounded" as const, side: "对公维护客户尽职调出" },
    { text: "客户是否存在", type: "diamond" as const, no: "返回到输入界面" },
    { text: "输入客户填写信息", type: "rounded" as const },
    { text: "现金/转账", type: "diamond" as const, branches: ["联动配款交易", "输入对方账户信息"] },
    { text: "提交", type: "rounded" as const },
    { text: "发起授权", type: "diamond" as const, no: "提示失败原因" },
    { text: "无纸化或纸质打印及影像采集", type: "rounded" as const },
    { text: "交易结束", type: "rounded" as const },
  ];

  return (
    <div className="flex flex-col items-center gap-1 w-full px-4">
      {nodes.map((node, idx) => (
        <div key={idx} className="flex flex-col items-center w-full">
          <div className="flex items-center gap-3 w-full justify-center">
            {/* Side branch (left) */}
            {node.type === "diamond" && node.no && (
              <div className="text-xs text-muted-foreground border border-dashed border-muted-foreground/40 rounded px-2 py-1 min-w-[80px] text-center">
                {node.no}
              </div>
            )}
            {node.type === "diamond" && node.branches && (
              <div className="text-xs text-muted-foreground border border-dashed border-muted-foreground/40 rounded px-2 py-1 min-w-[80px] text-center">
                {node.branches[0]}
              </div>
            )}

            {/* Main node */}
            <div
              className={`
                px-4 py-2 text-xs text-center border-2 border-primary/40 bg-primary/5 text-foreground
                ${node.type === "diamond" ? "rotate-0 border-primary/50 bg-primary/10 min-w-[120px]" : "rounded-lg min-w-[160px]"}
              `}
              style={node.type === "diamond" ? { clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)", padding: "16px 24px" } : {}}
            >
              {node.text}
            </div>

            {/* Side branch (right) */}
            {node.side && (
              <div className="text-xs text-muted-foreground border border-dashed border-muted-foreground/40 rounded px-2 py-1 min-w-[80px] text-center">
                {node.side}
              </div>
            )}
            {node.type === "diamond" && node.branches && (
              <div className="text-xs text-muted-foreground border border-dashed border-muted-foreground/40 rounded px-2 py-1 min-w-[80px] text-center">
                {node.branches[1]}
              </div>
            )}
          </div>

          {/* Arrow */}
          {idx < nodes.length - 1 && (
            <div className="flex flex-col items-center">
              <div className="w-px h-4 bg-muted-foreground/40" />
              <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent border-t-muted-foreground/40" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
