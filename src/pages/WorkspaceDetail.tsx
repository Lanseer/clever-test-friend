import { useParams, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { WorkspaceSidebar } from "@/components/workspace/WorkspaceSidebar";
import Knowledge from "./workspace/Knowledge";
import TestCases from "./workspace/TestCases";
import AIGeneratedCases from "./workspace/AIGeneratedCases";
import CaseReview from "./workspace/CaseReview";

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
            <Route path="dashboard" element={<WorkspaceDashboard workspace={workspace} />} />
            <Route path="knowledge" element={<Knowledge />} />
            <Route path="management/cases" element={<TestCases />} />
            <Route path="management/ai-cases" element={<AIGeneratedCases />} />
            <Route path="management/ai-cases/:recordId/review" element={<CaseReview />} />
            <Route path="*" element={<WorkspaceDashboard workspace={workspace} />} />
          </Routes>
        </main>
      </div>
    </SidebarProvider>
  );
}
