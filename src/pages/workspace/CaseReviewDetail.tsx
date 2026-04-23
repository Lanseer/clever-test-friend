import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileCode, Tag, Globe, Database, X, Plus, Trash2, PlayCircle } from "lucide-react";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
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

  Cases:
    | 编号  | 用户名    | 密码        | 预期结果   |
    | 1     | testuser  | Password123 | 登录成功   |
    | 2     | admin     | Admin@456   | 登录成功   |
    | 3     | user01    | User#789    | 登录成功   |`;

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

// ---- BDD <-> Cases table sync helpers ----
const parseRow = (line: string): string[] =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());

const parseCases = (
  bdd: string
): { headers: string[]; rows: string[][] } | null => {
  const lines = bdd.split("\n");
  const idx = lines.findIndex((l) => /^\s*Cases:\s*$/.test(l));
  if (idx === -1) return null;
  const tableLines: string[] = [];
  for (let i = idx + 1; i < lines.length; i++) {
    if (lines[i].trim().startsWith("|")) tableLines.push(lines[i]);
    else if (lines[i].trim() === "") continue;
    else break;
  }
  if (tableLines.length === 0) return null;
  const headers = parseRow(tableLines[0]);
  const rows = tableLines.slice(1).map(parseRow);
  return { headers, rows };
};

const formatTable = (headers: string[], rows: string[][]) => {
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => (r[i] || "").length))
  );
  const fmt = (cells: string[]) =>
    "    | " +
    cells.map((c, i) => (c || "").padEnd(widths[i], " ")).join(" | ") +
    " |";
  return [fmt(headers), ...rows.map(fmt)].join("\n");
};

const replaceCasesInBdd = (
  bdd: string,
  headers: string[],
  rows: string[][]
): string => {
  const lines = bdd.split("\n");
  const idx = lines.findIndex((l) => /^\s*Cases:\s*$/.test(l));
  if (idx === -1) return bdd;
  let endIdx = idx + 1;
  while (
    endIdx < lines.length &&
    (lines[endIdx].trim().startsWith("|") || lines[endIdx].trim() === "")
  ) {
    endIdx++;
  }
  const before = lines.slice(0, idx + 1);
  const after = lines.slice(endIdx);
  return [...before, formatTable(headers, rows), ...after].join("\n");
};

export default function CaseReviewDetail() {
  const navigate = useNavigate();
  const { caseId, workspaceId } = useParams<{ caseId: string; workspaceId: string }>();
  const { t } = useTranslation();

  const [bddContent, setBddContent] = useState(getMockBddContent());
  const [selectedTags, setSelectedTags] = useState<string[]>(["登录", "核心功能"]);
  const [appUrl, setAppUrl] = useState("https://test.example.com/login");
  const [scriptDialogOpen, setScriptDialogOpen] = useState(false);
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [liveCaseDialogOpen, setLiveCaseDialogOpen] = useState(false);
  const [selectedLiveCaseIdx, setSelectedLiveCaseIdx] = useState<string>("");
  const [caseNatures, setCaseNatures] = useState<Record<number, "positive" | "negative">>({
    0: "positive",
    1: "positive",
    2: "negative",
  });
  const getNature = (idx: number): "positive" | "negative" => caseNatures[idx] ?? "positive";
  const setNature = (idx: number, nature: "positive" | "negative") =>
    setCaseNatures((prev) => ({ ...prev, [idx]: nature }));

  const parsed = useMemo(() => parseCases(bddContent), [bddContent]);
  const headers = parsed?.headers ?? ["用户名", "密码", "预期结果"];
  const rows = parsed?.rows ?? [];

  const updateRows = (newRows: string[][]) => {
    setBddContent((prev) => replaceCasesInBdd(prev, headers, newRows));
  };

  const handleCellChange = (rowIdx: number, colIdx: number, value: string) => {
    const next = rows.map((r) => [...r]);
    while (next[rowIdx].length < headers.length) next[rowIdx].push("");
    next[rowIdx][colIdx] = value;
    updateRows(next);
  };

  const handleDeleteRow = (rowIdx: number) => {
    const next = rows.filter((_, i) => i !== rowIdx);
    updateRows(next);
  };

  const handleAddRow = () => {
    const next = [...rows, headers.map(() => "")];
    updateRows(next);
  };

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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setScriptDialogOpen(true)}
            className="gap-2"
          >
            <FileCode className="w-4 h-4" />
            现场测试记录
          </Button>
          <Button
            variant="default"
            size="sm"
            className="gap-2"
            onClick={() => {
              setSelectedLiveCaseIdx("");
              setLiveCaseDialogOpen(true);
            }}
          >
            <PlayCircle className="w-4 h-4" />
            现场测试
          </Button>
        </div>
      </div>

      {/* Two columns with visible divider */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_400px] gap-0 rounded-xl border bg-card overflow-hidden">
        {/* Left: Detail + Source */}
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

        {/* Vertical divider */}
        <div className="hidden lg:block w-px bg-border" />

        {/* Right: Configuration */}
        <div className="bg-muted/20">
          <div className="px-5 py-3 border-b bg-muted/30">
            <h2 className="font-semibold text-foreground text-sm">配置</h2>
          </div>
          <div className="p-5 space-y-6">
            {/* Tags - dropdown */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Tag className="w-4 h-4" />
                标签
              </Label>
              <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <div className="flex flex-wrap gap-1.5 flex-1">
                      {selectedTags.length === 0 ? (
                        <span className="text-muted-foreground">选择标签...</span>
                      ) : (
                        selectedTags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="gap-1 pr-1"
                          >
                            {tag}
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTag(tag);
                              }}
                              className="ml-0.5 rounded-sm hover:bg-muted-foreground/20 p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </span>
                          </Badge>
                        ))
                      )}
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-2" align="start">
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={cn(
                          "px-3 py-1 rounded-full border text-xs transition-colors",
                          selectedTags.includes(tag)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background hover:bg-muted border-border"
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
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

            {/* Test Cases (key|value editable rows) */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Database className="w-4 h-4" />
                测试案例
              </Label>

              <div className="space-y-3 rounded-md border bg-background p-3">
                {rows.length === 0 && (
                  <p className="text-xs text-muted-foreground py-2 text-center">
                    暂无数据，点击下方按钮新增一行
                  </p>
                )}

                {rows.map((row, rowIdx) => (
                  <div
                    key={rowIdx}
                    className="space-y-2 pb-3 border-b last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        案例{rowIdx + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteRow(rowIdx)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    {headers.map((header, colIdx) => (
                      <div key={colIdx} className="space-y-2">
                        <div className="grid grid-cols-[90px_1fr] items-center gap-2">
                          <Label className="text-xs text-muted-foreground truncate">
                            {header}
                          </Label>
                          <Input
                            value={row[colIdx] ?? ""}
                            onChange={(e) =>
                              handleCellChange(rowIdx, colIdx, e.target.value)
                            }
                            className="h-8 text-xs"
                            placeholder={`请输入${header}`}
                          />
                        </div>
                        {header === "预期结果" && (
                          <div className="grid grid-cols-[90px_1fr] items-center gap-2">
                            <Label className="text-xs text-muted-foreground truncate">
                              案例性质
                            </Label>
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => setNature(rowIdx, "positive")}
                                className={cn(
                                  "flex-1 px-2 py-1 rounded-md border text-xs transition-colors",
                                  getNature(rowIdx) === "positive"
                                    ? "bg-success/10 text-success border-success"
                                    : "bg-background hover:bg-muted border-border text-muted-foreground"
                                )}
                              >
                                正例
                              </button>
                              <button
                                type="button"
                                onClick={() => setNature(rowIdx, "negative")}
                                className={cn(
                                  "flex-1 px-2 py-1 rounded-md border text-xs transition-colors",
                                  getNature(rowIdx) === "negative"
                                    ? "bg-destructive/10 text-destructive border-destructive"
                                    : "bg-background hover:bg-muted border-border text-muted-foreground"
                                )}
                              >
                                反例
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddRow}
                  className="w-full gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  新增案例
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Test Records Dialog */}
      <Dialog open={scriptDialogOpen} onOpenChange={setScriptDialogOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCode className="w-5 h-5" />
              现场测试记录
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr className="text-left">
                    <th className="px-3 py-2 font-medium">名称</th>
                    <th className="px-3 py-2 font-medium">案例性质</th>
                    <th className="px-3 py-2 font-medium">测试数据</th>
                    <th className="px-3 py-2 font-medium">状态</th>
                    <th className="px-3 py-2 font-medium">测试状态</th>
                    <th className="px-3 py-2 font-medium">环境</th>
                    <th className="px-3 py-2 font-medium">创建者</th>
                    <th className="px-3 py-2 font-medium">开始时间</th>
                    <th className="px-3 py-2 font-medium">完成时间</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      id: "live-001",
                      name: `${caseId}-现场测试-001`,
                      nature: "positive" as const,
                      testData: "testuser / Password123",
                      status: "已完成",
                      testStatus: "通过",
                      env: "测试环境",
                      creator: "张三",
                      startTime: "2026-04-20 10:12:33",
                      endTime: "2026-04-20 10:15:08",
                    },
                    {
                      id: "live-002",
                      name: `${caseId}-现场测试-002`,
                      nature: "negative" as const,
                      testData: "wronguser / wrongpass",
                      status: "已完成",
                      testStatus: "失败",
                      env: "预发布环境",
                      creator: "李四",
                      startTime: "2026-04-21 14:02:11",
                      endTime: "2026-04-21 14:06:42",
                    },
                    {
                      id: "live-003",
                      name: `${caseId}-现场测试-003`,
                      nature: "positive" as const,
                      testData: "admin / Admin@456",
                      status: "执行中",
                      testStatus: "-",
                      env: "测试环境",
                      creator: "王五",
                      startTime: "2026-04-22 09:31:50",
                      endTime: "-",
                    },
                  ].map((rec) => {
                    const statusCls =
                      rec.status === "已完成"
                        ? "bg-green-500/10 text-green-600 border-green-200"
                        : rec.status === "执行中"
                        ? "bg-blue-500/10 text-blue-600 border-blue-200"
                        : "bg-gray-100 text-gray-600 border-gray-200";
                    const testCls =
                      rec.testStatus === "通过"
                        ? "bg-green-500/10 text-green-600 border-green-200"
                        : rec.testStatus === "失败"
                        ? "bg-red-500/10 text-red-600 border-red-200"
                        : "bg-gray-100 text-gray-500 border-gray-200";
                    return (
                      <tr key={rec.id} className="border-t hover:bg-muted/30">
                        <td className="px-3 py-2">
                          <button
                            className="text-primary hover:underline font-medium"
                            onClick={() => {
                              setScriptDialogOpen(false);
                              navigate(
                                `/workspace/${workspaceId}/smart-execution/${rec.id}?live=1&caseIdx=0`
                              );
                            }}
                          >
                            {rec.name}
                          </button>
                        </td>
                        <td className="px-3 py-2">
                          <Badge
                            variant="outline"
                            className={
                              rec.nature === "positive"
                                ? "bg-green-500/10 text-green-600 border-green-200"
                                : "bg-red-500/10 text-red-600 border-red-200"
                            }
                          >
                            {rec.nature === "positive" ? "正例" : "反例"}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground font-mono text-xs">
                          {rec.testData}
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant="outline" className={statusCls}>
                            {rec.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant="outline" className={testCls}>
                            {rec.testStatus}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{rec.env}</td>
                        <td className="px-3 py-2 text-muted-foreground">{rec.creator}</td>
                        <td className="px-3 py-2 text-muted-foreground font-mono text-xs">
                          {rec.startTime}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground font-mono text-xs">
                          {rec.endTime}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Live Test Case Selection Dialog */}
      <Dialog open={liveCaseDialogOpen} onOpenChange={setLiveCaseDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlayCircle className="w-5 h-5" />
              选择测试案例
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            {rows.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                暂无测试案例，请先在右侧配置中新增案例
              </p>
            ) : (
              <RadioGroup
                value={selectedLiveCaseIdx}
                onValueChange={setSelectedLiveCaseIdx}
                className="space-y-2"
              >
                {rows.map((row, rowIdx) => (
                  <label
                    key={rowIdx}
                    htmlFor={`live-case-${rowIdx}`}
                    className={cn(
                      "flex items-start gap-3 rounded-md border p-3 cursor-pointer transition-colors",
                      selectedLiveCaseIdx === String(rowIdx)
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <RadioGroupItem
                      value={String(rowIdx)}
                      id={`live-case-${rowIdx}`}
                      className="mt-0.5"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium">案例{rowIdx + 1}</div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            getNature(rowIdx) === "positive"
                              ? "bg-success/10 text-success border-success/30"
                              : "bg-destructive/10 text-destructive border-destructive/30"
                          )}
                        >
                          {getNature(rowIdx) === "positive" ? "正例" : "反例"}
                        </Badge>
                      </div>
                      <div className="space-y-0.5">
                        {headers.map((header, colIdx) => (
                          <div key={colIdx} className="text-xs text-muted-foreground">
                            <span className="font-medium">{header}：</span>
                            <span>{row[colIdx] || "-"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLiveCaseDialogOpen(false)}>
              取消
            </Button>
            <Button
              onClick={() => {
                if (!selectedLiveCaseIdx) {
                  toast.error("请选择一个测试案例");
                  return;
                }
                setLiveCaseDialogOpen(false);
                navigate(
                  `/workspace/${workspaceId}/smart-execution/live-${caseId}?live=1&caseIdx=${selectedLiveCaseIdx}`
                );
              }}
              disabled={rows.length === 0}
            >
              开始执行
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
