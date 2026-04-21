import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileCode, Tag, Globe, Database, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CaseSourceInfo } from "@/components/workspace/CaseSourceInfo";
import { cn } from "@/lib/utils";

const availableTags = ["登录", "核心功能", "支付", "关键路径", "注册", "表单验证", "订单", "API", "安全", "UI"];

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

  Examples:
    | 用户名    | 密码        | 预期结果   |
    | testuser  | Password123 | 登录成功   |
    | admin     | Admin@456   | 登录成功   |
    | user01    | User#789    | 登录成功   |`;

const getMockPlaywrightScript = (caseId: string) => `// Playwright 测试脚本: ${caseId}
import { test, expect } from '@playwright/test';

test.describe('用户登录功能', () => {
  test('应该使用有效凭证成功登录', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'Password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('.welcome')).toBeVisible();
  });

  test('应该在凭证无效时显示错误', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'wronguser');
    await page.fill('#password', 'wrongpass');
    await page.click('button[type="submit"]');
    await expect(page.locator('.error-message')).toContainText('用户名或密码错误');
  });
});`;

export default function CaseReviewDetail() {
  const navigate = useNavigate();
  const { caseId } = useParams<{ caseId: string }>();
  const { t } = useTranslation();

  const [bddContent, setBddContent] = useState(getMockBddContent());
  const [selectedTags, setSelectedTags] = useState<string[]>(["登录", "核心功能"]);
  const [appUrl, setAppUrl] = useState("https://test.example.com/login");
  const [testData, setTestData] = useState(
    "用户名: testuser\n密码: Password123\n备用账号: admin / Admin@456"
  );
  const [scriptDialogOpen, setScriptDialogOpen] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => setScriptDialogOpen(true)}
          className="gap-2"
        >
          <FileCode className="w-4 h-4" />
          查看脚本
        </Button>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Detail + Source */}
        <div className="space-y-6">
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b bg-muted/30">
              <h2 className="font-semibold text-foreground text-sm">
                {t('caseDetail.bddContent')}
              </h2>
            </div>
            <div className="p-5">
              <Textarea
                className="min-h-[320px] font-mono text-xs resize-none bg-muted/30"
                value={bddContent}
                onChange={(e) => setBddContent(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b bg-muted/30">
              <h2 className="font-semibold text-foreground text-sm">
                {t('caseDetail.caseSource')}
              </h2>
            </div>
            <div className="p-5">
              <CaseSourceInfo caseId={caseId} showHeader={false} />
            </div>
          </div>
        </div>

        {/* Right: Configuration */}
        <div className="rounded-xl border bg-card overflow-hidden h-fit">
          <div className="px-5 py-3 border-b bg-muted/30">
            <h2 className="font-semibold text-foreground text-sm">案例配置</h2>
          </div>
          <div className="p-5 space-y-6">
            {/* Tags */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Tag className="w-4 h-4" />
                标签
              </Label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "px-3 py-1.5 rounded-full border text-sm transition-colors",
                      selectedTags.includes(tag)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-muted border-border"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* App URL */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Globe className="w-4 h-4" />
                应用地址
              </Label>
              <Input
                value={appUrl}
                onChange={(e) => setAppUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            {/* Test Data */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Database className="w-4 h-4" />
                测试数据
              </Label>
              <Textarea
                value={testData}
                onChange={(e) => setTestData(e.target.value)}
                placeholder="输入测试数据..."
                className="min-h-[180px] resize-none font-mono text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Script Dialog */}
      <Dialog open={scriptDialogOpen} onOpenChange={setScriptDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCode className="w-5 h-5" />
              Playwright 脚本
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <pre className="rounded-md border bg-muted/40 p-4 font-mono text-xs whitespace-pre-wrap text-foreground/90">
              {getMockPlaywrightScript(caseId || "")}
            </pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
