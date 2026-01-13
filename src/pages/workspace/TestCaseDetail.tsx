import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Tag, Settings, TestTube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Mock test case data
const mockTestCases: Record<string, {
  id: string;
  code: string;
  name: string;
  bddContent: string;
  tags: string[];
  environment: string;
  testData: string;
}> = {
  "1": {
    id: "1",
    code: "TC-001",
    name: "用户登录功能测试",
    bddContent: `Feature: 用户登录功能

  Scenario: 使用有效凭证登录
    Given 用户在登录页面
    When 用户输入有效的用户名 "testuser"
    And 用户输入有效的密码 "password123"
    And 用户点击登录按钮
    Then 用户应该成功登录
    And 用户应该被重定向到首页

  Scenario: 使用无效凭证登录
    Given 用户在登录页面
    When 用户输入无效的用户名 "wronguser"
    And 用户输入错误的密码 "wrongpass"
    And 用户点击登录按钮
    Then 用户应该看到错误提示 "用户名或密码错误"
    And 用户应该仍在登录页面`,
    tags: ["登录", "核心功能"],
    environment: "测试环境",
    testData: "使用测试账号 testuser/password123",
  },
  "2": {
    id: "2",
    code: "TC-002",
    name: "支付流程完整性测试",
    bddContent: `Feature: 支付流程

  Scenario: 完成正常支付流程
    Given 用户已登录并在购物车页面
    And 购物车中有商品
    When 用户点击结算按钮
    And 用户选择支付方式 "信用卡"
    And 用户确认支付
    Then 支付应该成功完成
    And 用户应该收到支付成功通知

  Scenario: 支付失败处理
    Given 用户已登录并在支付页面
    When 支付过程中发生网络错误
    Then 系统应该显示支付失败提示
    And 用户可以选择重试或取消`,
    tags: ["支付", "关键路径"],
    environment: "预发布环境",
    testData: "使用测试信用卡 4111111111111111",
  },
  "3": {
    id: "3",
    code: "TC-003",
    name: "用户注册表单验证",
    bddContent: `Feature: 用户注册表单验证

  Scenario: 验证必填字段
    Given 用户在注册页面
    When 用户未填写任何字段
    And 用户点击注册按钮
    Then 系统应该显示 "请填写用户名" 错误
    And 系统应该显示 "请填写密码" 错误
    And 系统应该显示 "请填写邮箱" 错误

  Scenario: 验证邮箱格式
    Given 用户在注册页面
    When 用户输入无效邮箱 "invalidemail"
    And 用户点击注册按钮
    Then 系统应该显示 "请输入有效的邮箱地址" 错误`,
    tags: ["注册", "表单验证"],
    environment: "测试环境",
    testData: "使用随机生成的测试邮箱",
  },
  "4": {
    id: "4",
    code: "TC-004",
    name: "订单状态流转测试",
    bddContent: `Feature: 订单状态流转

  Scenario: 订单从创建到完成的正常流程
    Given 用户创建了一个新订单
    Then 订单状态应该是 "待支付"
    When 用户完成支付
    Then 订单状态应该变为 "待发货"
    When 商家发货
    Then 订单状态应该变为 "已发货"
    When 用户确认收货
    Then 订单状态应该变为 "已完成"`,
    tags: ["订单", "状态机"],
    environment: "开发环境",
    testData: "使用模拟订单数据",
  },
  "5": {
    id: "5",
    code: "TC-005",
    name: "API接口响应时间测试",
    bddContent: `Feature: API接口响应时间

  Scenario: 验证登录接口响应时间
    Given API服务正常运行
    When 发送登录请求到 "/api/login"
    Then 响应时间应该小于 200ms
    And 响应状态码应该是 200

  Scenario: 验证查询接口响应时间
    Given API服务正常运行
    When 发送查询请求到 "/api/users"
    Then 响应时间应该小于 500ms
    And 响应应该包含用户列表数据`,
    tags: ["性能", "API"],
    environment: "测试环境",
    testData: "使用性能测试工具 JMeter",
  },
};

const availableTags = ["登录", "核心功能", "支付", "关键路径", "注册", "表单验证", "订单", "状态机", "性能", "API", "安全", "UI"];
const availableEnvironments = ["开发环境", "测试环境", "预发布环境", "生产环境"];

export default function TestCaseDetail() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  
  const testCase = caseId ? mockTestCases[caseId] : null;
  
  const [selectedTags, setSelectedTags] = useState<string[]>(testCase?.tags || []);
  const [environment, setEnvironment] = useState(testCase?.environment || "");
  const [testData, setTestData] = useState(testCase?.testData || "");

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

  const handleSave = () => {
    console.log("Saving test case:", {
      ...testCase,
      tags: selectedTags,
      environment,
      testData,
    });
    // Here you would typically save to backend
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
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          保存
        </Button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: BDD Content */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b bg-muted/30 flex items-center gap-2">
            <TestTube className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">测试功能</h2>
          </div>
          <div className="p-6">
            <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap leading-relaxed">
              {testCase.bddContent}
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

            {/* Test Data */}
            <div className="space-y-3">
              <Label className="text-base font-medium">测试数据</Label>
              <Textarea
                value={testData}
                onChange={(e) => setTestData(e.target.value)}
                placeholder="输入测试数据说明..."
                className="min-h-[120px] resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
