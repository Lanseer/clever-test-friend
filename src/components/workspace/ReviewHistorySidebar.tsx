import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ReviewHistoryRecord {
  timestamp: string;
  type: "status" | "content";
  before: string;
  after: string;
}

export interface ReviewHistoryData {
  id: string;
  scenarioName: string;
  records: ReviewHistoryRecord[];
}

interface ReviewHistorySidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  historyData: ReviewHistoryData | null;
}

const mockHistoryRecords: ReviewHistoryRecord[] = [
  {
    timestamp: "2026-01-06 14:30",
    type: "content",
    before: `Feature: 用户登录功能

Scenario: 用户使用凭证登录
  Given 用户在登录页面
  When 用户输入用户名
  And 用户点击登录
  Then 登录成功`,
    after: `Feature: 用户登录功能

Scenario: 用户使用有效的用户名和密码登录系统
  Given 用户已经注册并拥有有效的账户
  And 用户位于登录页面
  When 用户输入正确的用户名 "testuser"
  And 用户输入正确的密码 "Password123"
  And 用户点击登录按钮
  Then 系统应该验证用户凭证
  And 用户应该被重定向到主页
  And 系统应该显示欢迎消息`,
  },
  {
    timestamp: "2026-01-06 13:25",
    type: "status",
    before: "采纳",
    after: "需完善",
  },
  {
    timestamp: "2026-01-05 10:40",
    type: "status",
    before: "待审查",
    after: "采纳",
  },
];

export function ReviewHistorySidebar({ 
  open, 
  onOpenChange, 
  historyData 
}: ReviewHistorySidebarProps) {
  const records = historyData?.records?.length ? historyData.records : mockHistoryRecords;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[560px] sm:max-w-[560px] flex flex-col">
        <SheetHeader>
          <SheetTitle>审查记录详情</SheetTitle>
          {historyData && (
            <p className="text-sm text-muted-foreground">{historyData.scenarioName}</p>
          )}
        </SheetHeader>
        
        <ScrollArea className="flex-1 pr-4 mt-4">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />
            
            {/* Timeline items */}
            <div className="space-y-6">
              {records.map((record, index) => (
                <div key={index} className="relative pl-8">
                  {/* Timeline dot */}
                  <div className={cn(
                    "absolute left-1.5 top-1.5 w-3 h-3 rounded-full border-2 bg-background",
                    record.type === "status" ? "border-blue-500" : "border-purple-500"
                  )} />
                  
                  {/* Content */}
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{record.timestamp}</span>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[10px]",
                          record.type === "status" 
                            ? "bg-blue-500/10 text-blue-600 border-blue-200" 
                            : "bg-purple-500/10 text-purple-600 border-purple-200"
                        )}
                      >
                        {record.type === "status" ? "状态修改" : "内容修改"}
                      </Badge>
                    </div>
                    
                    {/* Before and After */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Before */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-medium text-muted-foreground">修改前</span>
                        {record.type === "status" ? (
                          <div className="px-3 py-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md">
                            <span className="text-sm text-red-600 dark:text-red-400">{record.before}</span>
                          </div>
                        ) : (
                          <div className="px-3 py-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md max-h-[200px] overflow-y-auto">
                            <pre className="text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap font-mono">{record.before}</pre>
                          </div>
                        )}
                      </div>
                      
                      {/* After */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-medium text-muted-foreground">修改后</span>
                        {record.type === "status" ? (
                          <div className="px-3 py-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-md">
                            <span className="text-sm text-green-600 dark:text-green-400">{record.after}</span>
                          </div>
                        ) : (
                          <div className="px-3 py-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-md max-h-[200px] overflow-y-auto">
                            <pre className="text-xs text-green-600 dark:text-green-400 whitespace-pre-wrap font-mono">{record.after}</pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
