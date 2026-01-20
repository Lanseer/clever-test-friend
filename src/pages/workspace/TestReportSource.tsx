import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronRight, FileText, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// 文档接口
interface SourceDocument {
  id: string;
  name: string;
  version: string;
  type: string;
  updatedAt: string;
  content: string;
}

// 测试点信息
const testPointInfo: Record<string, { name: string; dimensionName: string }> = {
  "tp-1-1": { name: "账号密码登录", dimensionName: "用户登录模块" },
  "tp-1-2": { name: "验证码登录", dimensionName: "用户登录模块" },
  "tp-1-3": { name: "第三方登录", dimensionName: "用户登录模块" },
  "tp-2-1": { name: "订单创建", dimensionName: "订单管理模块" },
  "tp-2-2": { name: "订单支付", dimensionName: "订单管理模块" },
  "tp-2-3": { name: "订单取消", dimensionName: "订单管理模块" },
  "tp-3-1": { name: "商品列表", dimensionName: "商品展示模块" },
  "tp-3-2": { name: "商品详情", dimensionName: "商品展示模块" },
  "tp-3-3": { name: "商品搜索", dimensionName: "商品展示模块" },
};

// Mock文档数据
const mockDocuments: Record<string, SourceDocument[]> = {
  "tp-1-1": [
    {
      id: "doc-1",
      name: "用户登录功能规格说明书",
      version: "v2.1",
      type: "FSD",
      updatedAt: "2024-01-10 14:30",
      content: `# 用户登录功能规格说明书

## 1. 功能概述
本文档描述用户登录模块的功能需求和技术规格。

## 2. 账号密码登录

### 2.1 功能描述
用户可以通过账号（手机号/邮箱）和密码进行登录。

### 2.2 业务规则
1. 账号格式验证：
   - 手机号：11位数字，以1开头
   - 邮箱：符合标准邮箱格式
2. 密码规则：
   - 长度：8-20位
   - 必须包含字母和数字
   - 可包含特殊字符
3. 错误处理：
   - 账号不存在：提示"账号或密码错误"
   - 密码错误：提示"账号或密码错误"，连续5次错误锁定账号15分钟
   - 账号被锁定：提示剩余解锁时间

### 2.3 接口要求
- 请求方式：POST
- 接口地址：/api/auth/login
- 请求参数：account, password
- 返回结果：token, userInfo

## 3. 安全要求
1. 密码传输使用HTTPS加密
2. 密码存储使用bcrypt加盐哈希
3. 登录成功后生成JWT token，有效期24小时`,
    },
    {
      id: "doc-2",
      name: "用户认证接口文档",
      version: "v1.5",
      type: "API",
      updatedAt: "2024-01-08 10:15",
      content: `# 用户认证接口文档

## 1. 登录接口

### POST /api/auth/login

**请求参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| account | string | 是 | 账号（手机号/邮箱） |
| password | string | 是 | 密码 |

**响应示例：**
\`\`\`json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "userInfo": {
      "id": "user_001",
      "name": "张三",
      "avatar": "https://..."
    }
  }
}
\`\`\`

**错误码：**
| 错误码 | 说明 |
|--------|------|
| 40001 | 账号或密码错误 |
| 40002 | 账号已被锁定 |
| 40003 | 参数格式错误 |`,
    },
  ],
  "tp-1-2": [
    {
      id: "doc-1",
      name: "用户登录功能规格说明书",
      version: "v2.1",
      type: "FSD",
      updatedAt: "2024-01-10 14:30",
      content: `# 用户登录功能规格说明书

## 4. 验证码登录

### 4.1 功能描述
用户可以通过手机号接收短信验证码进行登录。

### 4.2 业务规则
1. 手机号格式：11位数字，以1开头
2. 验证码规则：
   - 6位数字
   - 有效期5分钟
   - 同一手机号60秒内只能发送一次
3. 验证码获取限制：
   - 同一手机号每日最多获取10次
   - 同一IP每日最多获取50次
4. 错误处理：
   - 验证码错误：提示"验证码错误"
   - 验证码过期：提示"验证码已过期，请重新获取"

### 4.3 接口要求
- 获取验证码：POST /api/auth/sms-code
- 验证码登录：POST /api/auth/sms-login`,
    },
  ],
  "tp-1-3": [
    {
      id: "doc-3",
      name: "第三方集成接口文档",
      version: "v1.0",
      type: "API",
      updatedAt: "2024-01-05 16:20",
      content: `# 第三方登录集成文档

## 1. 微信登录

### 1.1 接入流程
1. 用户点击微信登录按钮
2. 跳转微信授权页面
3. 用户确认授权
4. 获取授权code
5. 服务端换取access_token
6. 获取用户信息并登录

### 1.2 接口说明
- 获取授权URL：GET /api/auth/wechat/authorize
- 微信回调处理：GET /api/auth/wechat/callback

## 2. 支付宝登录

### 2.1 接入流程
与微信登录流程类似，使用支付宝开放平台SDK。

### 2.2 接口说明
- 获取授权URL：GET /api/auth/alipay/authorize
- 支付宝回调处理：GET /api/auth/alipay/callback`,
    },
  ],
  "tp-2-1": [
    {
      id: "doc-4",
      name: "订单流程设计文档",
      version: "v3.0",
      type: "FSD",
      updatedAt: "2024-01-12 09:00",
      content: `# 订单流程设计文档

## 1. 订单创建

### 1.1 功能描述
用户可以将购物车中的商品提交生成订单。

### 1.2 业务规则
1. 订单创建前置条件：
   - 用户已登录
   - 购物车不为空
   - 商品库存充足
   - 收货地址已填写
2. 订单号生成规则：
   - 格式：yyyyMMddHHmmss + 6位随机数
   - 示例：20240115143025123456
3. 库存处理：
   - 创建订单时锁定库存
   - 支付成功后扣减库存
   - 取消订单后释放库存

### 1.3 订单状态
- 待支付 (pending)
- 已支付 (paid)
- 已发货 (shipped)
- 已完成 (completed)
- 已取消 (cancelled)`,
    },
  ],
  "tp-2-2": [
    {
      id: "doc-5",
      name: "支付模块接口文档",
      version: "v2.0",
      type: "API",
      updatedAt: "2024-01-11 11:30",
      content: `# 支付模块接口文档

## 1. 微信支付

### POST /api/payment/wechat/create
创建微信支付订单

**请求参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| orderId | string | 是 | 订单ID |
| amount | number | 是 | 支付金额（分） |

## 2. 支付宝支付

### POST /api/payment/alipay/create
创建支付宝支付订单

## 3. 支付回调

### POST /api/payment/notify
支付结果通知接口`,
    },
  ],
  "tp-2-3": [
    {
      id: "doc-4",
      name: "订单流程设计文档",
      version: "v3.0",
      type: "FSD",
      updatedAt: "2024-01-12 09:00",
      content: `# 订单流程设计文档

## 3. 订单取消

### 3.1 功能描述
用户可以在特定条件下取消订单。

### 3.2 业务规则
1. 取消条件：
   - 待支付订单：随时可取消
   - 已支付订单：发货前可申请取消
   - 已发货订单：不可取消，需走退货流程
2. 退款规则：
   - 原路退回
   - 退款时效：1-3个工作日

### 3.3 接口要求
- 取消订单：POST /api/order/cancel
- 参数：orderId, reason`,
    },
  ],
  "tp-3-1": [
    {
      id: "doc-6",
      name: "商品管理PRD",
      version: "v1.5",
      type: "PRD",
      updatedAt: "2024-01-09 15:45",
      content: `# 商品管理PRD

## 1. 商品列表

### 1.1 功能描述
展示商品列表，支持分页、筛选和排序。

### 1.2 列表字段
- 商品图片
- 商品名称
- 价格
- 销量
- 库存状态

### 1.3 筛选条件
- 商品分类
- 价格区间
- 库存状态
- 上架状态

### 1.4 排序方式
- 默认排序
- 销量优先
- 价格升序/降序
- 上新时间`,
    },
  ],
  "tp-3-2": [
    {
      id: "doc-6",
      name: "商品管理PRD",
      version: "v1.5",
      type: "PRD",
      updatedAt: "2024-01-09 15:45",
      content: `# 商品管理PRD

## 2. 商品详情

### 2.1 功能描述
展示商品详细信息，支持规格选择和加入购物车。

### 2.2 页面内容
1. 商品图片轮播
2. 商品基本信息
   - 名称
   - 价格
   - 促销信息
3. 规格选择
4. 商品描述
5. 用户评价

### 2.3 交互要求
- 图片支持缩放查看
- 规格选择后价格实时更新
- 库存不足时禁用购买按钮`,
    },
  ],
  "tp-3-3": [
    {
      id: "doc-7",
      name: "搜索功能设计文档",
      version: "v2.0",
      type: "FSD",
      updatedAt: "2024-01-07 14:00",
      content: `# 搜索功能设计文档

## 1. 商品搜索

### 1.1 功能描述
用户可以通过关键词搜索商品。

### 1.2 搜索规则
1. 支持字段：商品名称、描述、品牌、分类
2. 分词处理：使用中文分词器
3. 结果排序：相关度 + 销量权重

### 1.3 搜索建议
- 输入时实时展示搜索建议
- 展示热门搜索词
- 保存搜索历史（最近10条）

### 1.4 搜索历史
- 本地存储
- 支持清除历史
- 点击历史词直接搜索`,
    },
  ],
};

// 文档类型配置
const docTypeConfig: Record<string, { label: string; className: string }> = {
  FSD: { label: "功能规格", className: "bg-blue-500/10 text-blue-600 border-blue-200" },
  PRD: { label: "产品需求", className: "bg-purple-500/10 text-purple-600 border-purple-200" },
  API: { label: "接口文档", className: "bg-green-500/10 text-green-600 border-green-200" },
};

export default function TestReportSource() {
  const navigate = useNavigate();
  const { workspaceId, recordId, testPointId } = useParams();
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set());

  const info = testPointId ? testPointInfo[testPointId] : null;
  const documents = testPointId ? mockDocuments[testPointId] || [] : [];

  // 默认展开第一个文档
  useState(() => {
    if (documents.length > 0 && expandedDocs.size === 0) {
      setExpandedDocs(new Set([documents[0].id]));
    }
  });

  const toggleDoc = (docId: string) => {
    setExpandedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) {
        next.delete(docId);
      } else {
        next.add(docId);
      }
      return next;
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* 面包屑导航 */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <button 
          onClick={() => navigate(`/workspace/${workspaceId}/management/ai-cases`)}
          className="hover:text-foreground transition-colors"
        >
          智能用例设计
        </button>
        <ChevronRight className="w-4 h-4" />
        <button 
          onClick={() => navigate(`/workspace/${workspaceId}/management/ai-cases/${recordId}/report`)}
          className="hover:text-foreground transition-colors"
        >
          评审报告
        </button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground">来源文档</span>
      </div>

      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          来源文档
        </h1>
        <p className="text-muted-foreground mt-1">
          {info?.dimensionName} · {info?.name} · 共 {documents.length} 个关联文档
        </p>
      </div>

      {/* 文档列表 */}
      <div className="space-y-4">
        {documents.map((doc, index) => {
          const isExpanded = expandedDocs.has(doc.id) || (index === 0 && expandedDocs.size === 0);
          const typeConfig = docTypeConfig[doc.type] || docTypeConfig.FSD;

          return (
            <Card key={doc.id} className="overflow-hidden">
              <CardHeader 
                className="cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => toggleDoc(doc.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {doc.name}
                        <Badge variant="secondary" className="text-xs font-normal">
                          {doc.version}
                        </Badge>
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={cn("text-xs", typeConfig.className)}>
                          {typeConfig.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          更新于 {doc.updatedAt}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-muted-foreground">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent className="border-t bg-muted/10 pt-4">
                  <ScrollArea className="h-[400px]">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <pre className="whitespace-pre-wrap font-sans text-sm text-foreground bg-transparent p-0 m-0">
                        {doc.content}
                      </pre>
                    </div>
                  </ScrollArea>
                </CardContent>
              )}
            </Card>
          );
        })}

        {documents.length === 0 && (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <FileText className="w-12 h-12 mb-4 opacity-50" />
              <p>暂无关联文档</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
