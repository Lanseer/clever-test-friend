import { useParams, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { WorkspaceSidebar } from "@/components/workspace/WorkspaceSidebar";
import { useRole } from "@/contexts/RoleContext";
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

export default function WorkspaceDetail() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const workspace = workspaceId ? mockWorkspaces[workspaceId] : null;
  const { isAdmin } = useRole();

  // Normal user: no sidebar, directly show AIGeneratedCases (Smart Design)
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex w-full bg-background">
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route index element={<Navigate to="management/ai-cases" replace />} />
            <Route path="management/ai-cases" element={<AIGeneratedCases />} />
            <Route path="management/ai-cases/:recordId" element={<CaseReview />} />
            <Route path="management/ai-cases/:recordId/generation-records" element={<BatchCaseList />} />
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
            <Route path="management/ai-cases/:recordId/report" element={<TestReport />} />
            <Route path="management/ai-cases/:recordId/report/test-point/:testPointId" element={<TestReportCases />} />
            <Route path="management/ai-cases/:recordId/report/test-point/:testPointId/source" element={<TestReportSource />} />
            <Route path="*" element={<Navigate to="management/ai-cases" replace />} />
          </Routes>
        </main>
      </div>
    );
  }

  // Admin: show sidebar with admin menu
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
            <Route path="management/ai-cases/:recordId/generation-records" element={<BatchCaseList />} />
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
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </SidebarProvider>
  );
}
