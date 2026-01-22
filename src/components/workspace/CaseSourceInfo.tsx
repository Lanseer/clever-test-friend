import { FileText, BookOpen, Code, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export type SourceDocType = "UserStory" | "FSD" | "TSD" | "测试本体";

export interface CaseSource {
  documentName: string;
  documentType: SourceDocType;
  contentSnippet: string;
}

const docTypeConfig: Record<SourceDocType, { label: string; icon: typeof FileText; className: string }> = {
  UserStory: {
    label: "UserStory",
    icon: BookOpen,
    className: "bg-blue-500/10 text-blue-600 border-blue-200",
  },
  FSD: {
    label: "FSD",
    icon: FileText,
    className: "bg-green-500/10 text-green-600 border-green-200",
  },
  TSD: {
    label: "TSD",
    icon: Code,
    className: "bg-purple-500/10 text-purple-600 border-purple-200",
  },
  测试本体: {
    label: "测试本体",
    icon: Database,
    className: "bg-orange-500/10 text-orange-600 border-orange-200",
  },
};

// Mock function to generate case source data
export function getMockCaseSource(caseId?: string): CaseSource {
  const sources: CaseSource[] = [
    {
      documentName: "用户登录功能需求说明书",
      documentType: "FSD",
      contentSnippet: `<h4>3.1 登录功能</h4>
<p>用户应能够通过用户名和密码登录系统。系统应验证用户凭证，并在验证成功后允许用户访问受保护的资源。</p>
<h5>3.1.1 功能要求</h5>
<ul>
  <li>支持用户名/邮箱登录</li>
  <li>密码长度8-20位，包含数字和字母</li>
  <li>连续失败3次锁定账户15分钟</li>
</ul>`,
    },
    {
      documentName: "支付模块用户故事",
      documentType: "UserStory",
      contentSnippet: `<h4>US-001: 用户在线支付</h4>
<p><strong>作为</strong>一名已登录用户，</p>
<p><strong>我希望</strong>能够使用多种支付方式完成订单支付，</p>
<p><strong>以便</strong>我可以方便快捷地购买商品。</p>
<h5>验收标准：</h5>
<ul>
  <li>支持微信支付、支付宝、银行卡</li>
  <li>支付超时时间为30分钟</li>
  <li>支付成功后发送确认通知</li>
</ul>`,
    },
    {
      documentName: "接口技术设计文档",
      documentType: "TSD",
      contentSnippet: `<h4>4.2 用户认证接口</h4>
<pre><code>POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}

Response 200:
{
  "token": "string",
  "expiresIn": 3600
}</code></pre>`,
    },
    {
      documentName: "银行核心系统测试本体",
      documentType: "测试本体",
      contentSnippet: `<h4>测试维度：用户认证</h4>
<p><strong>测试点：</strong>登录验证</p>
<h5>覆盖场景：</h5>
<ul>
  <li>正常登录流程验证</li>
  <li>异常密码输入处理</li>
  <li>账户锁定机制验证</li>
  <li>会话超时处理</li>
</ul>`,
    },
  ];

  // Use caseId to deterministically select a source
  const index = caseId ? parseInt(caseId.replace(/\D/g, "") || "0") % sources.length : 0;
  return sources[index];
}

interface CaseSourceInfoProps {
  source?: CaseSource;
  caseId?: string;
  className?: string;
  showHeader?: boolean;
  compact?: boolean;
}

export function CaseSourceInfo({ 
  source, 
  caseId, 
  className,
  showHeader = true,
  compact = false 
}: CaseSourceInfoProps) {
  const caseSource = source || getMockCaseSource(caseId);
  const typeConfig = docTypeConfig[caseSource.documentType];
  const TypeIcon = typeConfig.icon;

  if (compact) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{caseSource.documentName}</span>
          <Badge variant="outline" className={cn("text-xs gap-1", typeConfig.className)}>
            <TypeIcon className="w-3 h-3" />
            {typeConfig.label}
          </Badge>
        </div>
        <div 
          className="p-3 bg-muted/50 rounded-lg text-sm prose prose-sm max-w-none overflow-auto max-h-48"
          dangerouslySetInnerHTML={{ __html: caseSource.contentSnippet }}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col border rounded-lg overflow-hidden", className)}>
      {showHeader && (
        <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b">
          <FileText className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">案例来源</span>
        </div>
      )}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{caseSource.documentName}</span>
          <Badge variant="outline" className={cn("text-xs gap-1", typeConfig.className)}>
            <TypeIcon className="w-3 h-3" />
            {typeConfig.label}
          </Badge>
        </div>
        <ScrollArea className="max-h-[300px]">
          <div className="prose prose-sm max-w-none">
            <div
              className="text-sm"
              dangerouslySetInnerHTML={{ __html: caseSource.contentSnippet }}
            />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
