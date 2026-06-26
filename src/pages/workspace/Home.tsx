import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FolderOpen, Library, ChevronDown, Folder, FileSpreadsheet } from "lucide-react";


import {
  Bot,
  Send,
  Plug,
  Wand2,
  BrainCircuit,
  Shield,
  Users,
  Sparkles,
  Globe,
  Layers,
  Database,
  FileCode,
  ChevronRight,
  Plus,
  MessageSquare,
  Trash2,
  FileText,
  Eye,
  ClipboardCheck,
  X,
} from "lucide-react";

interface AgentCard {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const agents: AgentCard[] = [
  { id: "general", name: "通用任务", icon: Sparkles },
  { id: "migration", name: "数据迁移字段映射工作流", icon: Database },
  { id: "skill", name: "Skill 编排器", icon: Layers },
  { id: "api", name: "API 智能测试智能体", icon: FileCode },
  { id: "more", name: "更多智能体", icon: ChevronRight },
];

const quickTools = [
  { id: "tools", icon: Globe, label: "海量工具" },
  { id: "connector", icon: Plug, label: "连接器" },
  { id: "skill", icon: Wand2, label: "技能" },
];

interface GeneratedFile {
  id: string;
  name: string;
  scenarioCount: number;
  caseCount: number;
  createdAt: string;
  recordId: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  generationData?: {
    scenarioCount: number;
    caseCount: number;
    fileName: string;
  };
}

interface Session {
  id: string;
  title: string;
  updatedAt: string;
  agentId: string;
  messages: ChatMessage[];
  files: GeneratedFile[];
}

const initialSessions: Session[] = [
  {
    id: "s1",
    title: "用户登录模块案例设计",
    updatedAt: "今天 10:24",
    agentId: "general",
    files: [
      {
        id: "f1",
        name: "2024-06-16生成案例_V0.1",
        scenarioCount: 6,
        caseCount: 24,
        createdAt: "今天 10:24",
        recordId: "1",
      },
    ],
    messages: [
      {
        id: "m1",
        role: "user",
        content: "基于登录模块 PRD 文档，生成完整的测试案例，覆盖正向和负向场景",
      },
      {
        id: "m2",
        role: "assistant",
        content:
          "已为你解析《登录模块PRD V1.2》，提取出 6 个测试场景，并生成 24 条 BDD 格式测试案例，涵盖账号密码登录、SSO登录、验证码登录、密码错误、账号锁定、限流等场景。",
        generationData: {
          scenarioCount: 6,
          caseCount: 24,
          fileName: "2024-06-16生成案例_V0.1",
        },
      },
    ],
  },
  {
    id: "s2",
    title: "支付流程端到端案例",
    updatedAt: "昨天 18:02",
    agentId: "general",
    files: [
      {
        id: "f2",
        name: "2024-06-15生成案例_V0.1",
        scenarioCount: 8,
        caseCount: 32,
        createdAt: "昨天 18:02",
        recordId: "2",
      },
      {
        id: "f3",
        name: "2024-06-15生成案例_V0.2",
        scenarioCount: 4,
        caseCount: 12,
        createdAt: "昨天 19:10",
        recordId: "2",
      },
    ],
    messages: [
      { id: "m1", role: "user", content: "为支付下单到回调的端到端流程生成测试案例" },
      {
        id: "m2",
        role: "assistant",
        content:
          "已生成首版案例，覆盖 8 个支付场景、共 32 条案例，包含创建订单、调起支付、支付成功回调、超时、重复支付、退款等。",
        generationData: { scenarioCount: 8, caseCount: 32, fileName: "2024-06-15生成案例_V0.1" },
      },
      { id: "m3", role: "user", content: "补充异常处理和退款相关的案例" },
      {
        id: "m4",
        role: "assistant",
        content: "已补充 4 个异常场景，共 12 条案例，包含支付超时、网络异常、部分退款、全额退款等。",
        generationData: { scenarioCount: 4, caseCount: 12, fileName: "2024-06-15生成案例_V0.2" },
      },
    ],
  },
];

interface ResourceSection {
  key: string;
  label: string;
  count: number;
  items: { id: string; name: string; icon: React.ComponentType<{ className?: string }>; iconClass?: string; isFolder?: boolean }[];
}

const resourceSections: ResourceSection[] = [
  {
    key: "attachments",
    label: "会话附件",
    count: 1,
    items: [
      { id: "a1", name: "JN-需求FSD-个人活期开户.docx", icon: FileText, iconClass: "text-blue-600" },
    ],
  },
  {
    key: "knowledge",
    label: "项目知识库",
    count: 28,
    items: [
      { id: "k1", name: "case-generation-202606", icon: Folder, iconClass: "text-amber-500", isFolder: true },
      { id: "k2", name: "需求文档汇总", icon: Folder, iconClass: "text-amber-500", isFolder: true },
      { id: "k3", name: "接口规范说明.xlsx", icon: FileSpreadsheet, iconClass: "text-green-600" },
    ],
  },
];

type CaseFileKind = "outline" | "cases";

function ResourcePopover({
  className,
  files,
  onFileClick,
}: {
  className?: string;
  files?: GeneratedFile[];
  onFileClick?: (f: GeneratedFile, kind: CaseFileKind) => void;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({
    attachments: true,
    knowledge: true,
    cases: true,
  });
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("h-9 w-9 rounded-md bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary", className)}
          title="资源"
        >
          <Folder className="w-5 h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="max-h-96 overflow-auto py-2">
          {resourceSections.map((section) => {
            const isOpen = open[section.key];
            return (
              <div key={section.key} className="px-2 py-1.5">
                <button
                  type="button"
                  onClick={() => setOpen((p) => ({ ...p, [section.key]: !p[section.key] }))}
                  className="w-full flex items-center gap-1 px-1.5 py-1 text-left hover:bg-muted/50 rounded"
                >
                  <ChevronDown
                    className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", !isOpen && "-rotate-90")}
                  />
                  <span className="text-sm font-semibold text-foreground">{section.label}</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    （{section.count}个文件）
                  </span>
                </button>
                {isOpen && (
                  <div className="mt-1 space-y-0.5">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 px-2 py-1.5 ml-4 rounded hover:bg-muted/50 cursor-pointer"
                        >
                          {item.isFolder && <ChevronDown className="w-3 h-3 text-muted-foreground -rotate-90" />}
                          <Icon className={cn("w-4 h-4 shrink-0", item.iconClass)} />
                          <span className="text-sm text-foreground truncate">{item.name}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {files && files.length > 0 && (
            <div className="px-2 py-1.5">
              <button
                type="button"
                onClick={() => setOpen((p) => ({ ...p, cases: !p.cases }))}
                className="w-full flex items-center gap-1 px-1.5 py-1 text-left hover:bg-muted/50 rounded"
              >
                <ChevronDown
                  className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", !open.cases && "-rotate-90")}
                />
                <span className="text-sm font-semibold text-foreground">测试案例</span>
                <span className="text-xs text-muted-foreground ml-1">
                  （{files.length * 2}个文件）
                </span>
              </button>
              {open.cases && (
                <div className="mt-1 space-y-0.5">
                  {files.map((f) => (
                    <div key={f.id} className="space-y-0.5">
                      <div
                        onClick={() => onFileClick?.(f, "outline")}
                        className="flex items-center gap-2 px-2 py-1.5 ml-4 rounded hover:bg-muted/50 cursor-pointer"
                      >
                        <FileText className="w-4 h-4 shrink-0 text-blue-600" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-foreground truncate">{f.name}_测试大纲</div>
                          <div className="text-xs text-muted-foreground">
                            {f.scenarioCount} 场景 · {f.caseCount} 个测试要点
                          </div>
                        </div>
                      </div>
                      <div
                        onClick={() => onFileClick?.(f, "cases")}
                        className="flex items-center gap-2 px-2 py-1.5 ml-4 rounded hover:bg-muted/50 cursor-pointer"
                      >
                        <FileSpreadsheet className="w-4 h-4 shrink-0 text-green-600" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-foreground truncate">{f.name}_案例文件</div>
                          <div className="text-xs text-muted-foreground">
                            {f.caseCount} 条案例
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}


interface DimensionScenario {
  name: string;
  testPoints: string[];
}

function buildDimensionData(file: GeneratedFile): Record<"process" | "function" | "element", DimensionScenario[]> {
  const total = file.caseCount;
  const make = (labels: string[], pointTemplates: (s: string, i: number) => string): DimensionScenario[] => {
    const perScenario = Math.max(1, Math.ceil(total / labels.length));
    return labels.map((name) => ({
      name,
      testPoints: Array.from({ length: perScenario }).map((_, i) => pointTemplates(name, i)),
    }));
  };
  return {
    process: make(
      ["发起请求", "身份校验", "业务处理", "结果回调", "异常处理"],
      (s, i) => `【${s}环节测试要点 ${i + 1}】`,
    ),
    function: make(
      ["账户开立", "信息维护", "权限控制", "查询统计", "报表导出"],
      (s, i) => `【${s}功能测试要点 ${i + 1}】`,
    ),
    element: make(
      ["客户信息", "证件资料", "金额与币种", "渠道标识", "时间字段"],
      (s, i) => `【${s}要素测试要点 ${i + 1}】`,
    ),
  };
}

function PreviewDimensions({ file }: { file: GeneratedFile }) {
  const data = buildDimensionData(file);
  const tabs: { key: "process" | "function" | "element"; label: string }[] = [
    { key: "process", label: "业务流程" },
    { key: "function", label: "业务功能" },
    { key: "element", label: "业务要素" },
  ];
  return (
    <Tabs defaultValue="process" className="flex-1 flex flex-col min-h-0">
      <div className="px-4 pt-3">
        <TabsList className="grid w-full grid-cols-3">
          {tabs.map((t) => (
            <TabsTrigger key={t.key} value={t.key} className="text-xs">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {tabs.map((t) => {
        const scenarios = data[t.key];
        const totalPoints = scenarios.reduce((sum, s) => sum + s.testPoints.length, 0);
        return (
          <TabsContent key={t.key} value={t.key} className="flex-1 min-h-0 mt-2">
            <ScrollArea className="h-full">
              <div className="p-4 pt-2 space-y-3">
                <div className="text-xs text-muted-foreground">
                  共 {scenarios.length} 个场景 · {totalPoints} 个测试要点
                </div>
                <table className="w-full border border-border rounded-lg overflow-hidden text-sm">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border">
                      <th className="px-3 py-2 text-left text-xs font-semibold text-foreground border-r border-border w-[140px]">
                        分类场景
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-foreground">
                        测试要点
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {scenarios.map((s, sIdx) => (
                      s.testPoints.map((p, pIdx) => (
                        <tr key={`${sIdx}-${pIdx}`} className="border-b border-border last:border-b-0">
                          {pIdx === 0 && (
                            <td rowSpan={s.testPoints.length} className="px-3 py-2 text-xs text-foreground border-r border-border align-middle">
                              {s.name}
                            </td>
                          )}
                          <td className="px-3 py-2 text-xs text-muted-foreground">
                            {p}
                          </td>
                        </tr>
                      ))
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}

interface CaseRow {
  testPoint: string;
  title: string;
  precondition: string;
  steps: string;
  expected: string;
}

function buildCaseRows(file: GeneratedFile): CaseRow[] {
  const samples: CaseRow[] = [
    {
      testPoint: "贷款还款：\"正常还款-还款金额小于未偿账单-账单优先顺序分配\"的场景",
      title: "验证：\"缴款金额\"小于\"总已出账未偿账单\"时，按\"还款优先类别A（账单优先）\"从最早到期日到最晚到期日的顺序分配还款，最早到期优先清偿",
      precondition: "1、手工数据：准备1个法人客户，用于开户\n2、手工数据：准备1个贷款产品，用于开户\n3、手工数据：准备1个存款人账号，用于开户和还款\n4、过程数据：使用\"贷款开户\"返回的\"SCB主账号\"、\"放款金额\"、\"放款日期\"，用于放款\n5、*N期逾期账单(O)且每期均含INT和PRI，缴款金额<总已出账未偿账单。",
      steps: "1、调用LoanAcctOpening接口，输入cplComm.cust_acct_num=<已准备的法人客户>，cplComm.prod_cate_code=<496>，cplComm.prod_code=<COMN>，发送。\n2、【T日】调用LoanAcctDisburse_Disbursement接口，输入accountID=<步骤1返回的SCB主账号cust_acct_num>，amount=<步骤1返回的放款金额disb_amt>，effectDate=<T>，发送。\n3、*【T+N日】调用LoanDataPmt_RegularRepayment，输入loanAccountNumber=<步骤1返回的SCB主账号>，effectDate=<系统当前日期>。",
      expected: "1、检查LoanAcctOpening接口返回的状态码=<成功>，贷款开户成功。\n2、检查LoanAcctDisburse_Disbursement接口返回的statusCode=<200>，贷款放款成功。\n3、*还款检查：\n（1）调用LoanDataPmt_RegularRepayment接口，检查返回statusCode=<0>，贷款还款成功。\n（2）检查系统按还款优先类别A(账单优先)从最早到期日到最晚到期日顺序分配还款，最早到期优先清偿。\n（3）调用LoanDataInq_AcctDetailInq接口，检查还款成功后账户余额情况：本金+利息的余额更新。",
    },
    {
      testPoint: "贷款还款：\"正常还款-还款金额小于未偿账单-余额别名顺序分配\"的场景",
      title: "验证：还款按\"缴存层级COMN的Seq1\"执行时，按\"余额别名列表顺序\"依次分配还款，\"S*\"优先于\"FIS\"，\"FIS\"优先于\"INT\"，\"INT\"优先于\"PRI\"",
      precondition: "1、手工数据：准备1个法人客户，用于开户\n2、手工数据：准备1个贷款产品，用于开户\n3、手工数据：准备1个存款人账号，用于开户和还款\n4、过程数据：使用\"贷款开户\"返回的\"SCB主账号\"、\"放款金额\"、\"放款日期\"，用于放款\n5、*单期逾期账单(O)含多个余额别名(S*、FIS、INT、PRI)，缴款金额覆盖部分余额别名。",
      steps: "1、调用LoanAcctOpening接口，输入cplComm.cust_acct_num=<已准备的法人客户>，cplComm.prod_cate_code=<496>，cplComm.prod_code=<COMN>，发送。\n2、【T日】调用LoanAcctDisburse_Disbursement接口，输入accountID=<步骤1返回的SCB主账号>，amount=<放款金额>，effectDate=<T>，发送。\n3、*【T+N日】调用LoanDataPmt_RegularRepayment，输入loanAccountNumber=<SCB主账号>，effectDate=<系统当前日期>。",
      expected: "1、检查LoanAcctOpening接口返回状态码=<成功>，贷款开户成功。\n2、检查LoanAcctDisburse_Disbursement接口返回statusCode=<200>，贷款放款成功。\n3、*还款检查：\n（1）调用LoanDataPmt_RegularRepayment接口，检查返回statusCode=<0>，贷款还款成功。\n（2）检查系统按Seq1配置的余额别名列表顺序依次分配还款，S*优先于FIS，FIS优先于INT，INT优先于PRI。\n（3）调用LoanDataInq_AcctDetailInq接口，检查还款成功后账户余额情况：本金+利息的余额更新。",
    },
    {
      testPoint: "贷款还款：\"正常还款-还款金额小于未偿账单-部分偿还保留标记\"的场景",
      title: "验证：\"某期到期\"仅部分偿还时，\"INT\"全额清偿并标记\"结算顺序号\"，\"PRI\"部分清偿并标记\"结算顺序号\"，剩余未偿本金保留在该期到期中",
      precondition: "1、手工数据：准备1个法人客户，用于开户\n2、手工数据：准备1个贷款产品，用于开户\n3、手工数据：准备1个存款人账号，用于开户和还款\n4、过程数据：使用\"贷款开户\"返回的\"SCB主账号\"、\"放款金额\"、\"放款日期\"，用于放款\n5、*单期逾期账单(O)含INT和PRI，缴款金额<单期账单总额但>INT金额。",
      steps: "1、调用LoanAcctOpening接口，输入cplComm.cust_acct_num=<已准备的法人客户>，cplComm.prod_cate_code=<496>，cplComm.prod_code=<COMN>，发送。\n2、【T日】调用LoanAcctDisburse_Disbursement接口，输入accountID=<SCB主账号>，amount=<放款金额>，effectDate=<T>，发送。\n3、*【T+N日】调用LoanDataPmt_RegularRepayment，输入loanAccountNumber=<SCB主账号>，effectDate=<系统当前日期>。",
      expected: "1、检查LoanAcctOpening接口返回状态码=<成功>，贷款开户成功。\n2、检查LoanAcctDisburse_Disbursement接口返回statusCode=<200>，贷款放款成功。\n3、*还款检查：\n（1）调用LoanDataPmt_RegularRepayment接口，检查返回statusCode=<0>，贷款还款成功。\n（2）检查INT全额清偿并标记结算顺序号，PRI部分清偿并标记结算顺序号，剩余未偿本金保留在该期到期中。\n（3）调用LoanDataInq_AcctDetailInq接口，检查还款成功后账户余额情况：本金+利息的余额更新。",
    },
  ];
  const rows: CaseRow[] = [];
  for (let i = 0; i < file.caseCount; i++) {
    rows.push(samples[i % samples.length]);
  }
  return rows;
}

function CasesListPreview({ file }: { file: GeneratedFile }) {
  const rows = buildCaseRows(file);
  return (
    <ScrollArea className="flex-1 min-h-0">
      <div className="p-3">
        <div className="text-xs text-muted-foreground mb-2">共 {rows.length} 条案例</div>
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="text-xs min-w-[1200px]">
            <thead className="bg-emerald-50 dark:bg-emerald-950/30">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-foreground border-b border-r border-border w-[180px]">测试点</th>
                <th className="px-3 py-2 text-left font-semibold text-foreground border-b border-r border-border w-[240px]">标题</th>
                <th className="px-3 py-2 text-left font-semibold text-foreground border-b border-r border-border w-[260px]">前置条件</th>
                <th className="px-3 py-2 text-left font-semibold text-foreground border-b border-r border-border w-[300px]">步骤</th>
                <th className="px-3 py-2 text-left font-semibold text-foreground border-b border-border w-[280px]">预期</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={idx} className="border-b border-border last:border-b-0 align-top">
                  <td className="px-3 py-2 border-r border-border text-foreground whitespace-pre-wrap">{r.testPoint}</td>
                  <td className="px-3 py-2 border-r border-border text-foreground whitespace-pre-wrap">{r.title}</td>
                  <td className="px-3 py-2 border-r border-border text-muted-foreground whitespace-pre-wrap">{r.precondition}</td>
                  <td className="px-3 py-2 border-r border-border text-muted-foreground whitespace-pre-wrap">{r.steps}</td>
                  <td className="px-3 py-2 text-muted-foreground whitespace-pre-wrap">{r.expected}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ScrollArea>
  );
}






export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { workspaceId } = useParams();
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("general");
  const [previewFile, setPreviewFile] = useState<GeneratedFile | null>(null);
  const [previewKind, setPreviewKind] = useState<CaseFileKind>("outline");

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;
  const activeAgent =
    agents.find(
      (a) => a.id === (activeSession ? activeSession.agentId : selectedAgent)
    ) || agents[0];
  const ActiveIcon = activeAgent.icon;

  const handleNewSession = () => {
    setActiveSessionId(null);
    setInputValue("");
    setPreviewFile(null);
  };

  const handleOpenPreview = (f: GeneratedFile, kind: CaseFileKind) => {
    setPreviewFile(f);
    setPreviewKind(kind);
  };

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;

    const ts = Date.now();
    const fileName = `${new Date().toISOString().slice(0, 10)}生成案例_V0.${(activeSession?.files.length ?? 0) + 1}`;
    const scenarioCount = 4 + Math.floor(Math.random() * 4);
    const caseCount = scenarioCount * 4;
    const newFile: GeneratedFile = {
      id: `f-${ts}`,
      name: fileName,
      scenarioCount,
      caseCount,
      createdAt: "刚刚",
      recordId: activeSession?.files[0]?.recordId ?? "1",
    };

    if (activeSession) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? {
                ...s,
                updatedAt: "刚刚",
                files: [...s.files, newFile],
                messages: [
                  ...s.messages,
                  { id: `m-${ts}`, role: "user", content: text },
                  {
                    id: `m-${ts}-a`,
                    role: "assistant",
                    content: `已基于你的需求生成案例文件 ${fileName}，共 ${scenarioCount} 个场景、${caseCount} 条案例。`,
                    generationData: { scenarioCount, caseCount, fileName },
                  },
                ],
              }
            : s
        )
      );
    } else {
      const id = `s-${ts}`;
      const newSession: Session = {
        id,
        title: text.length > 16 ? text.slice(0, 16) + "…" : text,
        updatedAt: "刚刚",
        agentId: selectedAgent,
        files: [newFile],
        messages: [
          { id: `m-${ts}`, role: "user", content: text },
          {
            id: `m-${ts}-a`,
            role: "assistant",
            content: `已基于你的需求生成案例文件 ${fileName}，共 ${scenarioCount} 个场景、${caseCount} 条案例。`,
            generationData: { scenarioCount, caseCount, fileName },
          },
        ],
      };
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(id);
    }
    setInputValue("");
  };

  const handleReview = (file: GeneratedFile) => {
    const base = workspaceId ? `/workspace/${workspaceId}` : "..";
    navigate(`${base}/management/ai-cases/${file.recordId}/case-review`);
  };



  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) setActiveSessionId(null);
  };

  return (
    <div className="h-[calc(100vh-3rem)] flex bg-background">
      {/* Left: session history */}
      <aside className="w-64 shrink-0 border-r border-border bg-card flex flex-col">
        <div className="p-3 border-b border-border">
          <Button
            onClick={handleNewSession}
            className="w-full justify-start gap-2 bg-primary/90 hover:bg-primary text-primary-foreground"
          >
            <Plus className="w-4 h-4" />
            {t("home.newSession", "新会话")}
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {sessions.length === 0 && (
              <div className="text-xs text-muted-foreground px-3 py-6 text-center">
                {t("home.noSessions", "暂无会话")}
              </div>
            )}
            {sessions.map((s) => {
              const isActive = s.id === activeSessionId;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSessionId(s.id)}
                  className={cn(
                    "w-full group flex items-start gap-2 px-3 py-2 rounded-md text-left transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <MessageSquare className="w-4 h-4 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{s.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {s.updatedAt}
                    </div>
                  </div>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => handleDeleteSession(s.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </span>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </aside>

      {/* Right: main area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {activeSession ? (
          <>
            {/* Conversation header */}
            <div className="px-6 py-3 border-b border-border flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <ActiveIcon className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-medium text-foreground truncate">
                  {activeSession.title}
                </span>
                <span className="text-muted-foreground text-xs shrink-0">
                  · {activeAgent.name}
                </span>
              </div>

            </div>

            {/* Messages */}
            <ScrollArea className="flex-1">
              <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
                {activeSession.messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "flex",
                      m.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {m.role === "user" ? (
                      <div className="max-w-[80%] px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground text-sm">
                        {m.content}
                      </div>
                    ) : (
                      <div className="max-w-[80%] text-sm text-foreground leading-relaxed">
                        {m.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Composer */}
            <div className="border-t border-border p-4">
              <div className="max-w-3xl mx-auto flex flex-col items-end">
                <ResourcePopover files={activeSession.files} onFileClick={handleOpenPreview} />
                <div className="w-full bg-card border border-border rounded-2xl p-3 focus-within:ring-1 focus-within:ring-ring">
                  <Textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={t(
                      "home.inputPlaceholder",
                      "输入你的需求，我来帮你完成任务"
                    )}
                    className="min-h-[60px] resize-none border-0 bg-transparent text-sm focus-visible:ring-0 focus-visible:ring-offset-0 p-0 shadow-none"
                  />
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      size="icon"
                      onClick={handleSend}
                      className="h-9 w-9 rounded-lg bg-primary/90 hover:bg-primary text-primary-foreground"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>



          </>
        ) : (
          <ScrollArea className="flex-1">
            <div className="min-h-full flex flex-col items-center justify-center px-4 py-10">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-10 text-center">
                <span className="text-foreground">TestHand </span>
                <span className="text-primary">智能体</span>
                <span className="text-foreground"> 调用海量工具完成 </span>
                <span className="text-primary">接口测试</span>
              </h1>

              {/* Chat Input Box */}
              <div className="w-full max-w-4xl flex flex-col items-end mx-auto">
                <ResourcePopover />
                <div className="w-full bg-card border border-border rounded-2xl shadow-sm p-4 md:p-5 transition-all duration-200 focus-within:ring-1 focus-within:ring-ring">
                  <div className="flex items-center gap-2 mb-3">
                    <Bot className="w-5 h-5 text-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {t("home.agentLabel", "智能体")}
                    </span>
                    <span className="text-muted-foreground">|</span>
                    <span className="text-sm font-medium text-primary flex items-center gap-1">
                      <ActiveIcon className="w-4 h-4" />
                      {activeAgent.name}
                    </span>
                  </div>

                  <Textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={t(
                      "home.inputPlaceholder",
                      "输入你的需求，我来帮你完成任务"
                    )}
                    className="min-h-[120px] resize-none border-0 bg-transparent text-base placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 shadow-none"
                  />

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                    <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                      {quickTools.map((tool) => (
                        <Button
                          key={tool.id}
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                          <tool.icon className="w-4 h-4 mr-1.5" />
                          <span className="text-sm">{tool.label}</span>
                        </Button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-muted"
                      >
                        <BrainCircuit className="w-4 h-4 mr-1.5" />
                        <span className="text-sm">GLM-5.2</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-primary bg-primary/10 hover:bg-primary/15 hover:text-primary"
                      >
                        <Shield className="w-4 h-4 mr-1.5" />
                        <span className="text-sm">
                          {t("home.sessionIsolate", "会话隔离")}
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-muted"
                      >
                        <Users className="w-4 h-4 mr-1.5" />
                        <span className="text-sm">
                          {t("home.sessionShare", "会话共享")}
                        </span>
                      </Button>
                      <Button
                        size="icon"
                        onClick={handleSend}
                        className="h-9 w-9 rounded-lg bg-primary/90 hover:bg-primary text-primary-foreground"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-3 self-end max-w-4xl w-full text-right">
                ↵ {t("home.send", "发送")}，⇧ + ↵ {t("home.newLine", "换行")}
              </p>

              {/* Agent Cards */}
              <div className="w-full max-w-5xl mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {agents.map((agent) => {
                  const isActive = agent.id === selectedAgent;
                  const Icon = agent.icon;
                  return (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent.id)}
                      className={cn(
                        "flex flex-col items-center gap-3 p-5 rounded-xl border transition-all duration-200 text-center group",
                        isActive
                          ? "border-primary/30 bg-primary/5 shadow-sm"
                          : "border-border bg-card hover:border-primary/20 hover:bg-accent/5"
                      )}
                    >
                      <div
                        className={cn(
                          "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-primary/10 text-primary group-hover:bg-primary/15"
                        )}
                      >
                        <Icon className="w-7 h-7" />
                      </div>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isActive
                            ? "text-primary"
                            : "text-foreground group-hover:text-primary"
                        )}
                      >
                        {agent.name}
                      </span>
                      {isActive && (
                        <div className="w-6 h-1 rounded-full bg-primary mt-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Right: file preview panel */}
      {activeSession && previewFile && (
        <aside className={cn("shrink-0 border-l border-border bg-card flex flex-col", previewKind === "cases" ? "w-[720px]" : "w-[420px]")}>
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            {previewKind === "cases" ? (
              <FileSpreadsheet className="w-4 h-4 text-green-600" />
            ) : (
              <FileText className="w-4 h-4 text-blue-600" />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">
                {previewFile.name}_{previewKind === "cases" ? "案例文件" : "测试大纲"}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {previewKind === "cases"
                  ? `${previewFile.caseCount} 条案例`
                  : `${previewFile.scenarioCount} 个场景 · ${previewFile.caseCount} 个测试要点`}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setPreviewFile(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          {previewKind === "cases" ? (
            <CasesListPreview file={previewFile} />
          ) : (
            <PreviewDimensions file={previewFile} />
          )}

          {previewKind === "outline" && (
            <div className="border-t border-border p-3 bg-card">
              <Button
                className="w-full gap-2 bg-primary/90 hover:bg-primary text-primary-foreground"
                onClick={() => handleReview(previewFile)}
              >
                <ClipboardCheck className="w-4 h-4" />
                开始审查
              </Button>
            </div>
          )}
        </aside>

      )}
    </div>
  );
}
