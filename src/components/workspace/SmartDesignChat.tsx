import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, FileText, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GenerationRecordsPopover } from "./GenerationRecordsPopover";

interface SelectedDocument {
  docId: string;
  docName: string;
  versionId: string;
  versionName: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface GenerationRecord {
  id: string;
  count: number;
  createdAt: string;
  status: "pending_confirm" | "confirmed";
}

interface SmartDesignChatProps {
  selectedTaskId: string | null;
  selectedTaskName: string | null;
  records: GenerationRecord[];
  onNoTaskPrompt: () => void;
  onGenerationComplete: () => void;
  onConfirmResult: (recordId: string) => void;
  onViewCases: (recordId: string) => void;
}

// Mock documents - versions ordered from oldest to newest (last is latest)
const mockDocuments = [
  {
    id: "doc-1",
    name: "用户管理功能规格说明书",
    versions: [
      { id: "v1-1", name: "v1.0" },
      { id: "v1-2", name: "v1.1" },
      { id: "v1-3", name: "v1.2" },
    ],
  },
  {
    id: "doc-2",
    name: "支付模块接口文档",
    versions: [
      { id: "v2-1", name: "v1.0" },
      { id: "v2-2", name: "v2.0" },
      { id: "v2-3", name: "v2.1" },
    ],
  },
  {
    id: "doc-3",
    name: "订单流程设计文档",
    versions: [
      { id: "v3-1", name: "v1.0" },
      { id: "v3-2", name: "v2.0" },
    ],
  },
];

export function SmartDesignChat({ 
  selectedTaskId, 
  selectedTaskName,
  records,
  onNoTaskPrompt, 
  onGenerationComplete,
  onConfirmResult,
  onViewCases,
}: SmartDesignChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content: "你好！我是智能设计助手。请选择知识库文档，我将帮你自动生成测试用例。\n\n你可以：\n• 选择文档后发送，开始生成用例\n• 询问如何优化测试覆盖率\n• 了解BDD用例设计规范",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<SelectedDocument[]>([]);
  const [currentDocId, setCurrentDocId] = useState("");
  const [currentVersionId, setCurrentVersionId] = useState("");
  const [showConfirmTag, setShowConfirmTag] = useState(false);
  const [lastGeneratedCount, setLastGeneratedCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const currentDocVersions = mockDocuments.find((d) => d.id === currentDocId)?.versions || [];
  const availableDocuments = mockDocuments.filter(
    (doc) => !selectedDocs.some((sd) => sd.docId === doc.id)
  );

  const upsertSelectedDoc = (docId: string, versionId: string, isNewDoc: boolean = false) => {
    const doc = mockDocuments.find((d) => d.id === docId);
    const version = doc?.versions.find((v) => v.id === versionId);
    if (!doc || !version) return;

    setSelectedDocs((prev) => {
      const exists = prev.some((d) => d.docId === docId);
      if (!exists) {
        return [
          ...prev,
          {
            docId: doc.id,
            docName: doc.name,
            versionId: version.id,
            versionName: version.name,
          },
        ];
      }

      return prev.map((d) =>
        d.docId === docId
          ? {
              ...d,
              versionId: version.id,
              versionName: version.name,
            }
          : d
      );
    });

    // Reset dropdowns after adding a new document so user can select another
    if (isNewDoc) {
      setCurrentDocId("");
      setCurrentVersionId("");
    }
  };

  const handleRemoveDocument = (docId: string) => {
    setSelectedDocs(selectedDocs.filter((d) => d.docId !== docId));
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    // Check if there's no selected task
    if (!selectedTaskId) {
      onNoTaskPrompt();
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "user",
        content: inputValue + (selectedDocs.length > 0 ? `\n\n📎 已选文档: ${selectedDocs.map(d => d.docName).join(", ")}` : ""),
        timestamp: new Date(),
      },
    ]);
    setInputValue("");
    setIsProcessing(true);

    // Simulate AI generation process
    setMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "正在分析您的需求...",
        timestamp: new Date(),
      },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 800));

    setMessages((prev) => {
      const newMessages = [...prev];
      newMessages[newMessages.length - 1] = {
        ...newMessages[newMessages.length - 1],
        content: selectedDocs.length > 0 
          ? `正在基于 ${selectedDocs.length} 个文档生成测试用例...\n\n✅ 正在解析文档结构\n⏳ 识别功能模块...\n⏳ 生成BDD标准用例...`
          : "正在生成测试用例...\n\n✅ 分析需求\n⏳ 生成用例...",
      };
      return newMessages;
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setMessages((prev) => {
      const newMessages = [...prev];
      newMessages[newMessages.length - 1] = {
        ...newMessages[newMessages.length - 1],
        content: selectedDocs.length > 0 
          ? `正在基于 ${selectedDocs.length} 个文档生成测试用例...\n\n✅ 正在解析文档结构\n✅ 识别功能模块\n⏳ 生成BDD标准用例...`
          : "正在生成测试用例...\n\n✅ 分析需求\n✅ 识别测试点\n⏳ 生成用例...",
      };
      return newMessages;
    });

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const caseCount = Math.floor(Math.random() * 20) + 15;
    setLastGeneratedCount(caseCount);
    setMessages((prev) => {
      const newMessages = [...prev];
      newMessages[newMessages.length - 1] = {
        ...newMessages[newMessages.length - 1],
        content: `生成完成！🎉\n\n✅ 文档解析完成\n✅ 功能模块识别完成\n✅ BDD用例生成完成`,
      };
      return newMessages;
    });

    setIsProcessing(false);
    setSelectedDocs([]);
    setShowConfirmTag(true);
    onGenerationComplete();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/30 dark:bg-background/30 backdrop-blur-sm">
      {/* Header with centered task name and records button */}
      <div className="px-4 py-3 border-b border-sky-200/50 dark:border-sky-800/30 flex items-center justify-between flex-shrink-0">
        <div className="w-24" /> {/* Spacer for centering */}
        <h2 className="font-semibold text-base text-sky-900 dark:text-sky-100 truncate max-w-[60%]">
          {selectedTaskName || "请选择任务"}
        </h2>
        <GenerationRecordsPopover
          records={records}
          onConfirmResult={onConfirmResult}
          onViewCases={onViewCases}
        />
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-xl p-3 ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20"
                    : "bg-card/80 backdrop-blur-sm border border-border/50 shadow-sm"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          
          {/* Confirm Tag after generation */}
          {showConfirmTag && (
            <div className="flex justify-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-xl p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-amber-800 dark:text-amber-200">
                    本次共生成 <span className="font-semibold">{lastGeneratedCount}</span> 条用例
                  </span>
                  <Button
                    size="sm"
                    className="h-7 text-xs bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={() => {
                      const pendingRecord = records.find(r => r.status === "pending_confirm");
                      if (pendingRecord) {
                        onConfirmResult(pendingRecord.id);
                      }
                      setShowConfirmTag(false);
                    }}
                  >
                    <Check className="w-3 h-3 mr-1" />
                    确认结果
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area with embedded controls */}
      <div className="p-3 flex-shrink-0">
        <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg overflow-hidden">
          {/* Selected Documents - displayed above textarea */}
          {selectedDocs.length > 0 && (
            <div className="px-3 pt-3 pb-1">
              <div className="flex flex-wrap gap-2">
                {selectedDocs.map((doc) => (
                  <div
                    key={doc.docId}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs"
                  >
                    <FileText className="w-3 h-3" />
                    <span className="max-w-[120px] truncate">{doc.docName}</span>
                    <span className="text-primary/70">({doc.versionName})</span>
                    <button
                      className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                      onClick={() => handleRemoveDocument(doc.docId)}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入您的需求，例如：帮我生成用户登录模块的测试用例..."
            disabled={isProcessing}
            className="min-h-[80px] max-h-[120px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 pb-12 pr-12"
          />
          
          {/* Bottom embedded controls */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2">
            {/* Document Selection */}
            <div className="flex items-center gap-2 flex-1">
              <Select
                value={currentDocId}
                onValueChange={(value) => {
                  // Auto-select latest version when document is selected
                  const doc = mockDocuments.find((d) => d.id === value);
                  if (doc && doc.versions.length > 0) {
                    const latestVersion = doc.versions[doc.versions.length - 1];
                    // Add doc with latest version and reset dropdowns
                    upsertSelectedDoc(value, latestVersion.id, true);
                  }
                }}
              >
                <SelectTrigger className="w-[140px] h-7 text-xs bg-muted/50 border-border/50">
                  <SelectValue placeholder="选择文档" />
                </SelectTrigger>
                <SelectContent>
                  {availableDocuments.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id} className="text-xs">
                      {doc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={currentVersionId}
                onValueChange={(val) => {
                  setCurrentVersionId(val);
                  // If the doc is already selected, switching version updates it
                  if (currentDocId) upsertSelectedDoc(currentDocId, val);
                }}
                disabled={!currentDocId}
              >
                <SelectTrigger className="w-[70px] h-7 text-xs bg-muted/50 border-border/50">
                  <SelectValue placeholder="版本" />
                </SelectTrigger>
                <SelectContent>
                  {currentDocVersions.map((version) => (
                    <SelectItem key={version.id} value={version.id} className="text-xs">
                      {version.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Fixed BDD Template Badge */}
              <Badge variant="outline" className="text-xs bg-muted/50 border-border/50 text-muted-foreground">
                BDD标准模板
              </Badge>
              
              <div className="flex-1" />
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isProcessing}
              size="icon"
              className="h-7 w-7 rounded-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
