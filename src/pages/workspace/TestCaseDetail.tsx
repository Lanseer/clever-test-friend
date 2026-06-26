import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Tag, Settings, FileText, Copy, Trash2, Play, ChevronsUpDown, Check, History, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";


// Mock test case data
const mockTestCases: Record<string, {
  id: string;
  code: string;
  name: string;
  testPoint: string;
  title: string;
  precondition: string;
  steps: string;
  expected: string;
  tags: string[];
  environment: string;
  testData: string;
  testType: "UI" | "API";
}> = {
  "1": {
    id: "1",
    code: "TC-001",
    name: "贷款还款-账单优先顺序分配",
    testPoint: "贷款还款：\"正常还款-还款金额小于未偿账单-账单优先顺序分配\"的场景",
    title: "验证：\"缴款金额\"小于\"总已出账未偿账单\"时，按\"还款优先类别A（账单优先）\"从最早到期日到最晚到期日的顺序分配还款，最早到期优先清偿",
    precondition: "1、手工数据：准备1个法人客户，用于开户\n2、手工数据：准备1个贷款产品，用于开户\n3、手工数据：准备1个存款人账号，用于开户和还款\n4、过程数据：使用\"贷款开户\"返回的\"SCB主账号\"、\"放款金额\"、\"放款日期\"，用于放款\n5、*N期逾期账单(O)且每期均含INT和PRI，缴款金额<总已出账未偿账单。",
    steps: "1、调用LoanAcctOpening接口，输入cplComm.cust_acct_num=<已准备的法人客户>，cplComm.prod_cate_code=<496>，cplComm.prod_code=<COMN>，发送。\n2、【T日】调用LoanAcctDisburse_Disbursement接口，输入accountID=<步骤1返回的SCB主账号cust_acct_num>，amount=<步骤1返回的放款金额disb_amt>，effectDate=<T>，发送。\n3、*【T+N日】调用LoanDataPmt_RegularRepayment，输入loanAccountNumber=<步骤1返回的SCB主账号>，effectDate=<系统当前日期>。",
    expected: "1、检查LoanAcctOpening接口返回的状态码=<成功>，贷款开户成功。\n2、检查LoanAcctDisburse_Disbursement接口返回的statusCode=<200>，贷款放款成功。\n3、*还款检查：\n（1）调用LoanDataPmt_RegularRepayment接口，检查返回statusCode=<0>，贷款还款成功。\n（2）检查系统按还款优先类别A(账单优先)从最早到期日到最晚到期日顺序分配还款，最早到期优先清偿。\n（3）调用LoanDataInq_AcctDetailInq接口，检查还款成功后账户余额情况：本金+利息的余额更新。",
    tags: ["贷款", "还款"],
    environment: "测试环境",
    testData: "使用贷款测试数据集",
    testType: "API",
  },
  "2": {
    id: "2",
    code: "TC-002",
    name: "贷款还款-余额别名顺序分配",
    testPoint: "贷款还款：\"正常还款-还款金额小于未偿账单-余额别名顺序分配\"的场景",
    title: "验证：还款按\"缴存层级COMN的Seq1\"执行时，按\"余额别名列表顺序\"依次分配还款，\"S*\"优先于\"FIS\"，\"FIS\"优先于\"INT\"，\"INT\"优先于\"PRI\"",
    precondition: "1、手工数据：准备1个法人客户，用于开户\n2、手工数据：准备1个贷款产品，用于开户\n3、手工数据：准备1个存款人账号，用于开户和还款\n4、过程数据：使用\"贷款开户\"返回的\"SCB主账号\"、\"放款金额\"、\"放款日期\"，用于放款\n5、*单期逾期账单(O)含多个余额别名(S*、FIS、INT、PRI)，缴款金额覆盖部分余额别名。",
    steps: "1、调用LoanAcctOpening接口，输入cplComm.cust_acct_num=<已准备的法人客户>，cplComm.prod_cate_code=<496>，cplComm.prod_code=<COMN>，发送。\n2、【T日】调用LoanAcctDisburse_Disbursement接口，输入accountID=<SCB主账号>，amount=<放款金额>，effectDate=<T>，发送。\n3、*【T+N日】调用LoanDataPmt_RegularRepayment，输入loanAccountNumber=<SCB主账号>，effectDate=<系统当前日期>。",
    expected: "1、检查LoanAcctOpening接口返回状态码=<成功>，贷款开户成功。\n2、检查LoanAcctDisburse_Disbursement接口返回statusCode=<200>，贷款放款成功。\n3、*还款检查：\n（1）调用LoanDataPmt_RegularRepayment接口，检查返回statusCode=<0>，贷款还款成功。\n（2）检查系统按Seq1配置的余额别名列表顺序依次分配还款，S*优先于FIS，FIS优先于INT，INT优先于PRI。\n（3）调用LoanDataInq_AcctDetailInq接口，检查还款成功后账户余额情况：本金+利息的余额更新。",
    tags: ["贷款", "还款"],
    environment: "测试环境",
    testData: "使用贷款测试数据集",
    testType: "API",
  },
  "3": {
    id: "3",
    code: "TC-003",
    name: "贷款还款-部分偿还保留标记",
    testPoint: "贷款还款：\"正常还款-还款金额小于未偿账单-部分偿还保留标记\"的场景",
    title: "验证：\"某期到期\"仅部分偿还时，\"INT\"全额清偿并标记\"结算顺序号\"，\"PRI\"部分清偿并标记\"结算顺序号\"，剩余未偿本金保留在该期到期中",
    precondition: "1、手工数据：准备1个法人客户，用于开户\n2、手工数据：准备1个贷款产品，用于开户\n3、手工数据：准备1个存款人账号，用于开户和还款\n4、过程数据：使用\"贷款开户\"返回的\"SCB主账号\"、\"放款金额\"、\"放款日期\"，用于放款\n5、*单期逾期账单(O)含INT和PRI，缴款金额<单期账单总额但>INT金额。",
    steps: "1、调用LoanAcctOpening接口，输入cplComm.cust_acct_num=<已准备的法人客户>，cplComm.prod_cate_code=<496>，cplComm.prod_code=<COMN>，发送。\n2、【T日】调用LoanAcctDisburse_Disbursement接口，输入accountID=<SCB主账号>，amount=<放款金额>，effectDate=<T>，发送。\n3、*【T+N日】调用LoanDataPmt_RegularRepayment，输入loanAccountNumber=<SCB主账号>，effectDate=<系统当前日期>。",
    expected: "1、检查LoanAcctOpening接口返回状态码=<成功>，贷款开户成功。\n2、检查LoanAcctDisburse_Disbursement接口返回statusCode=<200>，贷款放款成功。\n3、*还款检查：\n（1）调用LoanDataPmt_RegularRepayment接口，检查返回statusCode=<0>，贷款还款成功。\n（2）检查INT全额清偿并标记结算顺序号，PRI部分清偿并标记结算顺序号，剩余未偿本金保留在该期到期中。\n（3）调用LoanDataInq_AcctDetailInq接口，检查还款成功后账户余额情况：本金+利息的余额更新。",
    tags: ["贷款", "还款"],
    environment: "测试环境",
    testData: "使用贷款测试数据集",
    testType: "API",
  },
  "4": {
    id: "4",
    code: "TC-004",
    name: "贷款还款-FED不计入账单",
    testPoint: "贷款还款：\"正常还款-FED不计入账单\"的场景",
    title: "验证：若付款方式配置为B，则代收费用(FED)不计入账单，还款时不优先偿还FED",
    precondition: "1、手工数据：准备1个法人客户，用于开户\n2、手工数据：准备1个贷款产品，用于开户\n3、手工数据：准备1个存款人账号，用于开户和还款\n4、过程数据：使用\"贷款开户\"返回的\"SCB主账号\"、\"放款金额\"、\"放款日期\"，用于放款\n5、*付款方式配置为B，账单含FED。",
    steps: "1、调用LoanAcctOpening接口，输入cplComm.cust_acct_num=<已准备的法人客户>，cplComm.prod_cate_code=<496>，cplComm.prod_code=<COMN>，发送。\n2、【T日】调用LoanAcctDisburse_Disbursement接口，输入accountID=<SCB主账号>，amount=<放款金额>，effectDate=<T>，发送。\n3、*【T+N日】调用LoanDataPmt_RegularRepayment，输入loanAccountNumber=<SCB主账号>，effectDate=<系统当前日期>。",
    expected: "1、检查LoanAcctOpening接口返回状态码=<成功>，贷款开户成功。\n2、检查LoanAcctDisburse_Disbursement接口返回statusCode=<200>，贷款放款成功。\n3、*还款检查：\n（1）调用LoanDataPmt_RegularRepayment接口，检查返回statusCode=<0>，贷款还款成功。\n（2）检查FED不计入账单，还款时不优先偿还FED。\n（3）调用LoanDataInq_AcctDetailInq接口，检查还款成功后账户余额情况。",
    tags: ["贷款", "还款"],
    environment: "测试环境",
    testData: "使用贷款测试数据集",
    testType: "API",
  },
  "5": {
    id: "5",
    code: "TC-005",
    name: "贷款还款-已计提费用纳入账单",
    testPoint: "贷款还款：\"正常还款-已计提费用纳入账单\"的场景",
    title: "验证：当账单日生成账单时，系统应将已计提的利息(INT)和利息罚息(ALT)纳入账单金额",
    precondition: "1、手工数据：准备1个法人客户，用于开户\n2、手工数据：准备1个贷款产品，用于开户\n3、手工数据：准备1个存款人账号，用于开户和还款\n4、过程数据：使用\"贷款开户\"返回的\"SCB主账号\"、\"放款金额\"、\"放款日期\"，用于放款\n5、*账单日已计提INT和ALT。",
    steps: "1、调用LoanAcctOpening接口，输入cplComm.cust_acct_num=<已准备的法人客户>，cplComm.prod_cate_code=<496>，cplComm.prod_code=<COMN>，发送。\n2、【T日】调用LoanAcctDisburse_Disbursement接口，输入accountID=<SCB主账号>，amount=<放款金额>，effectDate=<T>，发送。\n3、*【账单日】检查账单生成情况。",
    expected: "1、检查LoanAcctOpening接口返回状态码=<成功>，贷款开户成功。\n2、检查LoanAcctDisburse_Disbursement接口返回statusCode=<200>，贷款放款成功。\n3、*账单检查：\n（1）检查账单日生成账单时，已计提的利息(INT)和利息罚息(ALT)已纳入账单金额。\n（2）调用LoanDataInq_AcctDetailInq接口，检查账单金额正确。",
    tags: ["贷款", "还款"],
    environment: "测试环境",
    testData: "使用贷款测试数据集",
    testType: "API",
  },
};

const availableTags = ["登录", "核心功能", "支付", "关键路径", "注册", "表单验证", "订单", "状态机", "性能", "API", "安全", "UI"];
const availableEnvironments = ["开发环境", "测试环境", "预发布环境", "生产环境"];
const availableDatabases = ["MySQL-主库", "MySQL-从库", "Oracle-核心库", "PostgreSQL-测试库", "MongoDB-文档库"];

const availableTestData = [
  "登录测试数据集",
  "支付测试数据集",
  "用户注册数据集",
  "订单模拟数据集",
  "性能压测数据集",
  "API接口Mock数据",
];

export default function TestCaseDetail() {
  const { workspaceId, caseId } = useParams<{ workspaceId: string; caseId: string }>();
  const navigate = useNavigate();
  
  const testCase = caseId ? mockTestCases[caseId] : null;
  
  const [selectedTags, setSelectedTags] = useState<string[]>(testCase?.tags || []);
  const [environment, setEnvironment] = useState(testCase?.environment || "");
  const [database, setDatabase] = useState("");
  const [selectedTestData, setSelectedTestData] = useState<string[]>(
    testCase?.testData ? [availableTestData[0]] : []
  );
  const [testDataOpen, setTestDataOpen] = useState(false);


  if (!testCase) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground">未找到测试用例</p>
          <Button variant="link" onClick={() => navigate(-1)}>
            返回列表
          </Button>
        </div>
      </div>
    );
  }

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleCopy = () => {
    toast.success("用例已复制");
    // Here you would typically copy the test case
  };

  const handleDelete = () => {
    toast.success("用例已删除");
    navigate(-1);
    // Here you would typically delete the test case
  };

  const handleTest = () => {
    toast.success("开始执行测试");
    if (testCase.testType === "API") {
      navigate(`/workspace/${workspaceId}/smart-execution/e5/case/live-oa-${caseId}`);
    } else {
      navigate(`/workspace/${workspaceId}/smart-execution/exec-001/case/${caseId}`);
    }
  };

  const toggleTestData = (item: string) => {
    setSelectedTestData(prev =>
      prev.includes(item) ? prev.filter(t => t !== item) : [...prev, item]
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                {testCase.code}
              </Badge>
              <h1 className="text-xl font-bold text-foreground">{testCase.name}</h1>
            </div>
            <p className="text-muted-foreground text-sm mt-1">测试用例详情</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCopy} className="gap-2">
            <Copy className="w-4 h-4" />
            复制
          </Button>
          <Button variant="outline" onClick={handleDelete} className="gap-2 text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4" />
            删除
          </Button>
          <Button variant="outline" onClick={() => navigate(`/workspace/${workspaceId}/management/cases/${caseId}/records`)} className="gap-2">
            <History className="w-4 h-4" />
            测试记录
          </Button>
          <Button onClick={handleTest} className="gap-2">
            <Play className="w-4 h-4" />
            测试
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Case Detail */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b bg-muted/30 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">用例详情</h2>
          </div>
          <div className="p-6 space-y-5">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">测试点</Label>
              <div className="text-sm text-foreground">{testCase.testPoint}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">用例标题</Label>
              <div className="text-sm text-foreground font-medium">{testCase.title}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">前置条件</Label>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{testCase.precondition}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">步骤</Label>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{testCase.steps}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">预期</Label>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{testCase.expected}</div>
            </div>
          </div>
        </div>

        {/* Right: Configuration */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b bg-muted/30 flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">配置</h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Tags */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-medium">
                <Tag className="w-4 h-4" />
                标签
              </Label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <label
                    key={tag}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${
                      selectedTags.includes(tag)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-muted border-border"
                    }`}
                  >
                    <Checkbox
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={() => handleTagToggle(tag)}
                      className="hidden"
                    />
                    <span className="text-sm">{tag}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Environment */}
            <div className="space-y-3">
              <Label className="text-base font-medium">测试环境</Label>
              <Select value={environment} onValueChange={setEnvironment}>
                <SelectTrigger>
                  <SelectValue placeholder="选择测试环境" />
                </SelectTrigger>
                <SelectContent>
                  {availableEnvironments.map((env) => (
                    <SelectItem key={env} value={env}>
                      {env}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Database */}
            <div className="space-y-3">
              <Label className="text-base font-medium">数据库</Label>
              <Select value={database} onValueChange={setDatabase}>
                <SelectTrigger>
                  <SelectValue placeholder="选择数据库" />
                </SelectTrigger>
                <SelectContent>
                  {availableDatabases.map((db) => (
                    <SelectItem key={db} value={db}>
                      {db}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Test Data */}
            <div className="space-y-3">
              <Label className="text-base font-medium">测试数据</Label>
              <Popover open={testDataOpen} onOpenChange={setTestDataOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between font-normal"
                  >
                    <span className={cn("truncate", selectedTestData.length === 0 && "text-muted-foreground")}>
                      {selectedTestData.length > 0
                        ? selectedTestData.join("、")
                        : "选择测试数据"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-1" align="start">
                  <div className="max-h-64 overflow-y-auto">
                    {availableTestData.map((item) => {
                      const checked = selectedTestData.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleTestData(item)}
                          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent text-left"
                        >
                          <Checkbox checked={checked} className="pointer-events-none" />
                          <span className="flex-1">{item}</span>
                          {checked && <Check className="h-4 w-4 text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
