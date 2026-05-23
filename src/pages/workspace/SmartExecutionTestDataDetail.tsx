import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, ChevronRight, Upload, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface DataRow {
  id: string;
  key: string;
  value: string;
  multiline?: boolean;
}

const mockDataMap: Record<string, { name: string; rows: DataRow[] }> = {
  "1": {
    name: "开户交易测试数据",
    rows: [
      { id: "r1", key: "username", value: "Qiao" },
      { id: "r2", key: "password", value: "123456!" },
      { id: "r3", key: "account.nickName", value: "Lanseer" },
      {
        id: "r4",
        key: "account.info",
        value: `{\n  "address": "上海市浦东新区",\n  "level": "VIP"\n}`,
        multiline: true,
      },
      { id: "r5", key: "account.idCard", value: "310115199001011234" },
      { id: "r6", key: "account.phone", value: "13800138000" },
    ],
  },
  "2": {
    name: "供货期开户数据集",
    rows: [
      { id: "r1", key: "supplyPeriod", value: "2024Q2" },
      { id: "r2", key: "accountType", value: "Corporate" },
      { id: "r3", key: "companyName", value: "上海某某贸易有限公司" },
      { id: "r4", key: "creditCode", value: "91310115MA1K3X9Y0Z" },
      { id: "r5", key: "legalPerson.name", value: "张伟" },
      { id: "r6", key: "legalPerson.idCard", value: "310101198505057890" },
    ],
  },
  "3": {
    name: "对公账户开户数据",
    rows: [
      { id: "r1", key: "accountName", value: "深圳科技有限公司" },
      { id: "r2", key: "accountNo", value: "6225880137820001" },
      { id: "r3", key: "bankCode", value: "ICBC-0102" },
      { id: "r4", key: "branch", value: "中国工商银行深圳分行" },
    ],
  },
  "4": {
    name: "个人客户身份验证数据",
    rows: [
      { id: "r1", key: "fullName", value: "李娜" },
      { id: "r2", key: "idCard", value: "440301199203051234" },
      { id: "r3", key: "mobile", value: "13900139000" },
      { id: "r4", key: "verifyCode", value: "888888" },
    ],
  },
  "5": {
    name: "跨境汇款测试数据",
    rows: [
      { id: "r1", key: "remitter", value: "John Smith" },
      { id: "r2", key: "beneficiary", value: "山田太郎" },
      { id: "r3", key: "amount", value: "10000.00" },
      { id: "r4", key: "currency", value: "USD" },
      { id: "r5", key: "swiftCode", value: "BOTKJPJT" },
    ],
  },
};

export default function SmartExecutionTestDataDetail() {
  const navigate = useNavigate();
  const { workspaceId, dataId } = useParams();
  const initial = mockDataMap[dataId ?? "1"] ?? mockDataMap["1"];

  const [name, setName] = useState(initial.name);
  const [rows, setRows] = useState<DataRow[]>(initial.rows);
  const [agentGuidanceOpen, setAgentGuidanceOpen] = useState(false);
  const [agentGuidance, setAgentGuidance] = useState("");

  const updateRow = (id: string, patch: Partial<DataRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };
  const removeRow = (id: string) => setRows((prev) => prev.filter((r) => r.id !== id));
  const addRow = () =>
    setRows((prev) => [
      ...prev,
      { id: `r${Date.now()}`, key: "", value: "" },
    ]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => navigate(`/workspace/${workspaceId}/smart-execution/test-data`)}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-xl font-bold border-0 px-0 h-auto shadow-none focus-visible:ring-0"
          />
          <p className="text-sm text-muted-foreground mt-1">测试数据详情</p>
        </div>
        <Button variant="outline">取消</Button>
        <Button>保存</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* 左侧：数据内容 */}
        <div className="rounded-xl border bg-card p-5">
          <h2 className="text-base font-semibold mb-4">数据内容</h2>

          <div className="rounded-lg border overflow-hidden">
            <div className="grid grid-cols-[200px_1fr_60px] gap-3 px-4 py-2.5 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
              <div>键</div>
              <div>值</div>
              <div></div>
            </div>
            <div className="divide-y">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-[200px_1fr_60px] gap-3 px-4 py-3 items-start hover:bg-muted/20"
                >
                  <Input
                    value={row.key}
                    onChange={(e) => updateRow(row.id, { key: e.target.value })}
                    className="h-9 font-mono text-sm"
                  />
                  {row.multiline ? (
                    <Textarea
                      value={row.value}
                      onChange={(e) => updateRow(row.id, { value: e.target.value })}
                      className="font-mono text-sm min-h-[120px]"
                    />
                  ) : (
                    <Input
                      value={row.value}
                      onChange={(e) => updateRow(row.id, { value: e.target.value })}
                      className="h-9 font-mono text-sm"
                    />
                  )}
                  <div className="flex items-center justify-center h-9">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeRow(row.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button variant="outline" className="mt-4 gap-2" onClick={addRow}>
            <Plus className="w-4 h-4" />
            新增行
          </Button>
        </div>

        {/* 右侧：智能体指导 / 附件 */}
        <div className="space-y-4">
          <div className="rounded-lg border bg-card">
            <button
              className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-muted/30"
              onClick={() => setAgentGuidanceOpen(!agentGuidanceOpen)}
            >
              <ChevronRight
                className={`w-4 h-4 transition-transform ${agentGuidanceOpen ? "rotate-90" : ""}`}
              />
              智能体指导
            </button>
            {agentGuidanceOpen && (
              <div className="px-4 pb-4">
                <Textarea
                  value={agentGuidance}
                  onChange={(e) => setAgentGuidance(e.target.value)}
                  placeholder="为智能体提供此数据集的使用说明..."
                  className="min-h-[100px] text-sm"
                />
              </div>
            )}
          </div>

          <div className="rounded-lg border bg-card">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-2 text-sm">
                <Paperclip className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">0 个附件</span>
              </div>
              <span className="text-xs text-muted-foreground border rounded px-2 py-0.5">无附件</span>
            </div>
            <div className="p-4">
              <div className="border-2 border-dashed rounded-lg px-4 py-8 text-center">
                <Upload className="w-8 h-8 mx-auto text-primary mb-2" />
                <p className="text-sm font-medium mb-1">
                  拖拽文件到此处，或点击选择文件
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  支持的文件类型：文档（.txt, .doc, .docx, .pdf）、
                  数据（.json, .csv, .xls, .xlsx, .xlsm）、图片
                  （.jpg, .jpeg, .png, .bmp）、视频（.mp4, .webm, .avi）
                </p>
              </div>
              <div className="mt-3 border rounded-lg py-6 text-center text-sm text-muted-foreground">
                未选择文件
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
