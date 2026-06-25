import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CaseSourceInfo } from "@/components/workspace/CaseSourceInfo";

const mockTestPoints = [
  {
    keyPoint: "【账单优先顺序分配】",
    verification: "当缴款金额小于总已出账未偿账单时，那么系统应按还款优先类别A(账单优先)从最早到期日到最晚到期日的顺序分配还款",
  },
  {
    keyPoint: "【余额别名顺序分配】",
    verification: "若还款按缴存层级COMN的Seq1执行，则每期到期内应按余额别名列表顺序(S*,FIS,F*,AS1,AT1,A11,AIS,AOT,INT,ALI,ALO,ALT,PIS,POT,PRI)依次分配还款",
  },
  {
    keyPoint: "【部分偿还保留标记】",
    verification: "若某期到期仅部分偿还，则剩余未偿本金应保留在该期到期中，且已偿还部分按结算顺序号标记",
  },
  {
    keyPoint: "【FED不计入账单】",
    verification: "若付款方式配置为B，则代收费用(FED)不计入账单，还款时不优先偿还FED",
  },
  {
    keyPoint: "【未偿账单后续生成】",
    verification: "当还款后仍有未偿账单时，则在账单日系统应正常生成下一期账单，并按缴存层级分配至所有未还余额",
  },
  {
    keyPoint: "【未生成账单不分期】",
    verification: "若当前到期(C)尚未生成账单，则还款时不对其分配还款金额，仅在账单日生成账单",
  },
  {
    keyPoint: "【已计提费用纳入账单】",
    verification: "当账单日生成账单时，系统应将已计提的利息(INT)和利息罚息(ALT)纳入账单金额",
  },
];

export default function CaseReviewDetail() {
  const navigate = useNavigate();
  const { caseId, workspaceId, recordId, batchId } = useParams<{ caseId: string; workspaceId: string; recordId: string; batchId?: string }>();
  const [searchParams] = useSearchParams();
  const reviewStatus = searchParams.get("status");
  const dim = searchParams.get("dim");
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => {
            const target = batchId
              ? `/workspace/${workspaceId}/management/ai-cases/${recordId ?? ""}/batch/${batchId}/review`
              : `/workspace/${workspaceId}/management/ai-cases/${recordId ?? ""}/case-review`;
            navigate(`${target}?status=${reviewStatus ?? ""}${dim ? `&dim=${dim}` : ""}`);
          }}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                {caseId}
              </Badge>
              <h1 className="text-xl font-bold text-foreground">
                {t('caseDetail.title')}
              </h1>
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              {t('caseDetail.bddContent')} & {t('caseDetail.caseSource')}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-6 space-y-6">
          <div>
            <h2 className="font-semibold text-foreground text-sm mb-3">
              测试要点
            </h2>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="px-4 py-3 text-center font-semibold text-foreground w-[200px]">
                      测试要点
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-foreground">
                      具体验证点
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mockTestPoints.map((item, index) => (
                    <tr key={index} className="border-b last:border-b-0">
                      <td className="px-4 py-3 align-top font-medium whitespace-nowrap">
                        {item.keyPoint}
                      </td>
                      <td className="px-4 py-3 align-top text-muted-foreground">
                        {item.verification}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-foreground text-sm mb-3">
              {t('caseDetail.caseSource')}
            </h2>
            <CaseSourceInfo caseId={caseId} showHeader={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
