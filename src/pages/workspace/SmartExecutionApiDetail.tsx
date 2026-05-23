import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Play, CheckCircle2, XCircle, Clock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const mockRequest = {
  method: "POST",
  url: "https://api.example.com/v1/auth/login",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-Request-Id": "req-20260420-001",
  },
  body: {
    username: "testuser",
    password: "Password123",
  },
};

const mockResponse = {
  status: 200,
  statusText: "OK",
  duration: "238ms",
  headers: {
    "Content-Type": "application/json",
    "X-RateLimit-Remaining": "98",
    "Date": "Mon, 20 Apr 2026 10:14:55 GMT",
  },
  body: {
    code: 0,
    message: "登录成功",
    data: {
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      userId: "u-10086",
      expiresIn: 7200,
    },
  },
};

const mockAssertions = [
  { id: "a1", desc: "响应状态码 = 200", expected: "200", actual: "200", passed: true },
  { id: "a2", desc: "响应字段 code = 0", expected: "0", actual: "0", passed: true },
  { id: "a3", desc: "响应字段 data.token 不为空", expected: "not null", actual: "eyJhbGc...", passed: true },
  { id: "a4", desc: "响应时间 < 500ms", expected: "< 500ms", actual: "238ms", passed: true },
];

export default function SmartExecutionApiDetail() {
  const navigate = useNavigate();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [searchParams] = useSearchParams();
  const editBack = searchParams.get("editBack");
  const caseName = searchParams.get("caseName") || "TC-001";
  const [tab, setTab] = useState("response");

  const allPassed = mockAssertions.every((a) => a.passed);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (editBack) navigate(decodeURIComponent(editBack));
              else navigate(-1);
            }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                {caseName}
              </Badge>
              <h1 className="text-xl font-bold text-foreground">接口测试详情</h1>
              <Badge
                variant="outline"
                className={cn(
                  "gap-1",
                  allPassed
                    ? "bg-green-500/10 text-green-600 border-green-200"
                    : "bg-red-500/10 text-red-600 border-red-200"
                )}
              >
                {allPassed ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    通过
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    失败
                  </>
                )}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              查看 API 请求、响应与断言结果
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Play className="w-4 h-4" />
            重新执行
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1">请求方法</div>
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-200 font-mono">
            {mockRequest.method}
          </Badge>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1">响应状态</div>
          <div className="font-mono text-sm font-semibold text-green-600">
            {mockResponse.status} {mockResponse.statusText}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3" /> 响应时间
          </div>
          <div className="font-mono text-sm font-semibold">{mockResponse.duration}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground mb-1">断言结果</div>
          <div className="font-mono text-sm font-semibold">
            <span className="text-green-600">
              {mockAssertions.filter((a) => a.passed).length}
            </span>
            <span className="text-muted-foreground"> / {mockAssertions.length}</span>
          </div>
        </Card>
      </div>

      {/* Request */}
      <Card className="p-5 mb-4">
        <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4" />
          请求信息
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-500/10 text-blue-600 border-blue-200 font-mono">
              {mockRequest.method}
            </Badge>
            <Input
              readOnly
              value={mockRequest.url}
              className="font-mono text-xs bg-muted/30"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">请求头</Label>
            <Textarea
              readOnly
              value={Object.entries(mockRequest.headers)
                .map(([k, v]) => `${k}: ${v}`)
                .join("\n")}
              className="font-mono text-xs bg-muted/30 mt-1.5 min-h-[90px]"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">请求体</Label>
            <Textarea
              readOnly
              value={JSON.stringify(mockRequest.body, null, 2)}
              className="font-mono text-xs bg-muted/30 mt-1.5 min-h-[100px]"
            />
          </div>
        </div>
      </Card>

      {/* Response & Assertions */}
      <Card className="p-5">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="response">响应内容</TabsTrigger>
            <TabsTrigger value="assertions">断言 ({mockAssertions.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="response" className="mt-4 space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">响应头</Label>
              <Textarea
                readOnly
                value={Object.entries(mockResponse.headers)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join("\n")}
                className="font-mono text-xs bg-muted/30 mt-1.5 min-h-[80px]"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">响应体</Label>
              <Textarea
                readOnly
                value={JSON.stringify(mockResponse.body, null, 2)}
                className="font-mono text-xs bg-muted/30 mt-1.5 min-h-[180px]"
              />
            </div>
          </TabsContent>
          <TabsContent value="assertions" className="mt-4">
            <ScrollArea className="max-h-[400px]">
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 border-b">
                    <tr className="text-left">
                      <th className="px-3 py-2 font-medium text-muted-foreground">断言描述</th>
                      <th className="px-3 py-2 font-medium text-muted-foreground">期望值</th>
                      <th className="px-3 py-2 font-medium text-muted-foreground">实际值</th>
                      <th className="px-3 py-2 font-medium text-muted-foreground w-20">结果</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockAssertions.map((a) => (
                      <tr key={a.id} className="border-b last:border-b-0">
                        <td className="px-3 py-2">{a.desc}</td>
                        <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                          {a.expected}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                          {a.actual}
                        </td>
                        <td className="px-3 py-2">
                          {a.passed ? (
                            <Badge
                              variant="outline"
                              className="bg-green-500/10 text-green-600 border-green-200 gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              通过
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-red-500/10 text-red-600 border-red-200 gap-1"
                            >
                              <XCircle className="w-3 h-3" />
                              失败
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
