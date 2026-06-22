import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CaseSourceInfo } from "@/components/workspace/CaseSourceInfo";

const getMockBddContent = () => `Feature: 用户登录功能

  Scenario: 用户使用有效的用户名和密码登录系统
    Given 用户已经注册并拥有有效的账户
    And 用户位于登录页面
    When 用户输入正确的用户名 "testuser"
    And 用户输入正确的密码 "Password123"
    And 用户点击登录按钮
    Then 系统应该验证用户凭证
    And 用户应该被重定向到主页
    And 系统应该显示欢迎消息

  Cases:
    | 编号    | 用户名      | 密码         | 预期结果           |
    | TC-001  | testuser    | Password123  | 登录成功           |
    | TC-002  | admin       | Admin@456    | 登录成功           |
    | TC-003  | user01      | User#789     | 登录成功           |
    | TC-004  | guest       | Guest@2026   | 登录成功并跳转首页 |
    | TC-005  | dev_user    | Dev$Pass01   | 登录成功           |
    | TC-006  | qa.tester   | Qa!Test2026  | 登录成功           |
    | TC-007  | manager01   | Mgr#Pwd2026  | 登录成功           |
    | TC-008  | finance     | Fin@2026Sec  | 登录成功并显示财务模块 |`;

export default function CaseReviewDetail() {
  const navigate = useNavigate();
  const { caseId, workspaceId, recordId, batchId } = useParams<{ caseId: string; workspaceId: string; recordId: string; batchId?: string }>();
  const [searchParams] = useSearchParams();
  const reviewStatus = searchParams.get("status");
  const dim = searchParams.get("dim");
  const { t } = useTranslation();

  const [bddContent, setBddContent] = useState(getMockBddContent());

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
              测试场景
            </h2>
            <Textarea
              className="min-h-[320px] font-mono text-xs resize-none bg-muted/30"
              value={bddContent}
              onChange={(e) => setBddContent(e.target.value)}
            />
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
