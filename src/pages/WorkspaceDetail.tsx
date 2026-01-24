import { useParams, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { WorkspaceSidebar } from "@/components/workspace/WorkspaceSidebar";
import Knowledge from "./workspace/Knowledge";
import TestCases from "./workspace/TestCases";
import TestCaseDetail from "./workspace/TestCaseDetail";
import AIGeneratedCases from "./workspace/AIGeneratedCases";
import AIGeneratedCaseDetail from "./workspace/AIGeneratedCaseDetail";
import CaseReview from "./workspace/CaseReview";
import CaseSelfReview from "./workspace/CaseSelfReview";
import GenerationRecords from "./workspace/GenerationRecords";
import BatchCaseList from "./workspace/BatchCaseList";
import AIReview from "./workspace/AIReview";
import AIAssistant from "./workspace/AIAssistant";
import ExpertReview from "./workspace/ExpertReview";
import ExpertReviewDetail from "./workspace/ExpertReviewDetail";
import ExpertReviewRecords from "./workspace/ExpertReviewRecords";
import InitiateExpertReview from "./workspace/InitiateExpertReview";
import ExpertCaseReview from "./workspace/ExpertCaseReview";
import Tags from "./workspace/Tags";
import Dashboard from "./Index";
import TestData from "./workspace/TestData";
import TestDataCreate from "./workspace/TestDataCreate";
import TestReport from "./workspace/TestReport";
import TestReportCases from "./workspace/TestReportCases";
import TestReportSource from "./workspace/TestReportSource";
import CaseTemplates from "./workspace/CaseTemplates";

const mockWorkspaces: Record<string, { name: string; description: string }> = {
  "scb": { name: "SCB", description: "SCB 测试工作空间" },
  "dbs": { name: "DBS", description: "DBS 测试工作空间" },
  "cbs": { name: "CBS", description: "CBS 测试工作空间" },
  "rnd": { name: "研发中心", description: "研发中心测试工作空间" },
};

// 默认仪表板组件
function WorkspaceDashboard({ workspace }: { workspace: { name: string; description: string } | null }) {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-2">
        {workspace?.name || "工作空间"} - 测试工作台
      </h1>
      <p className="text-muted-foreground mb-6">{workspace?.description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl border bg-card">
          <h3 className="font-semibold text-foreground mb-2">快速统计</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>测试用例: 128 个</p>
            <p>执行计划: 5 个</p>
            <p>通过率: 94.5%</p>
          </div>
        </div>
        <div className="p-6 rounded-xl border bg-card">
          <h3 className="font-semibold text-foreground mb-2">最近活动</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• 执行了回归测试计划</p>
            <p>• 新增了 12 个测试用例</p>
            <p>• 生成了测试报告</p>
          </div>
        </div>
        <div className="p-6 rounded-xl border bg-card">
          <h3 className="font-semibold text-foreground mb-2">团队成员</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>成员数: 8 人</p>
            <p>在线: 5 人</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkspaceDetail() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const workspace = workspaceId ? mockWorkspaces[workspaceId] : null;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <WorkspaceSidebar workspaceName={workspace?.name || "工作空间"} />
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="knowledge" element={<Knowledge />} />
            <Route path="management/cases" element={<TestCases />} />
            <Route path="management/cases/:caseId" element={<TestCaseDetail />} />
            <Route path="management/ai-cases" element={<AIGeneratedCases />} />
            <Route path="management/ai-cases/:recordId" element={<CaseReview />} />
            <Route path="management/ai-cases/:recordId/generation-records" element={<GenerationRecords />} />
            <Route path="management/batch-cases/:batchId" element={<BatchCaseList />} />
            <Route path="management/ai-cases/:recordId/batch/:batchId/cases" element={<BatchCaseList />} />
            <Route path="management/ai-cases/:recordId/batch/:batchId/review" element={<CaseReview />} />
            <Route path="management/ai-cases/:recordId/batch/:batchId/self-review/:testPointId" element={<CaseSelfReview />} />
            <Route path="management/ai-cases/:recordId/batch/:batchId/ai-review" element={<AIReview />} />
            <Route path="management/ai-cases/:recordId/batch/:batchId/ai-assistant" element={<AIAssistant />} />
            <Route path="management/ai-cases/:recordId/expert-review" element={<ExpertReview />} />
            <Route path="management/ai-cases/:recordId/batch/:batchId/expert-review" element={<ExpertReview />} />
            <Route path="management/ai-cases/:recordId/batch/:batchId/expert-review/:testPointId" element={<ExpertReviewDetail />} />
            <Route path="management/ai-cases/:recordId/expert-review-records" element={<ExpertReviewRecords />} />
            <Route path="management/ai-cases/:recordId/expert-review-records/:reviewId/cases" element={<ExpertReviewDetail />} />
            <Route path="management/ai-cases/:recordId/initiate-expert-review" element={<InitiateExpertReview />} />
            <Route path="management/ai-cases/:recordId/expert-case-review" element={<ExpertCaseReview />} />
            <Route path="data" element={<TestData />} />
            <Route path="data/create" element={<TestDataCreate />} />
            <Route path="data/:dataId/edit" element={<TestDataCreate />} />
            <Route path="tags" element={<Tags />} />
            <Route path="templates" element={<CaseTemplates />} />
            <Route path="management/ai-cases/:recordId/report" element={<TestReport />} />
            <Route path="management/ai-cases/:recordId/report/test-point/:testPointId" element={<TestReportCases />} />
            <Route path="management/ai-cases/:recordId/report/test-point/:testPointId/source" element={<TestReportSource />} />
            <Route path="*" element={<WorkspaceDashboard workspace={workspace} />} />
          </Routes>
        </main>
      </div>
    </SidebarProvider>
  );
}
