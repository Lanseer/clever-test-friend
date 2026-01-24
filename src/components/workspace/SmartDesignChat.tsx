import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, FileText, X, ChevronDown } from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

interface SmartDesignChatProps {
  selectedTaskId: string | null;
  onNoTaskPrompt: () => void;
  onGenerationComplete: () => void;
}

// Mock documents
const mockDocuments = [
  {
    id: "doc-1",
    name: "用户管理功能规格说明书",
    versions: [
      { id: "v1-1", name: "v1.0" },
      { id: "v1-2", name: "v1.1" },
    ],
  },
  {
    id: "doc-2",
    name: "支付模块接口文档",
    versions: [
      { id: "v2-1", name: "v1.0" },
      { id: "v2-2", name: "v2.0" },
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

export function SmartDesignChat({ selectedTaskId, onNoTaskPrompt, onGenerationComplete }: SmartDesignChatProps) {
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
  const [docsPopoverOpen, setDocsPopoverOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const currentDocVersions = mockDocuments.find((d) => d.id === currentDocId)?.versions || [];
  const availableDocuments = mockDocuments.filter(
    (doc) => !selectedDocs.some((sd) => sd.docId === doc.id)
  );

  const handleAddDocument = () => {
    if (!currentDocId || !currentVersionId) return;
    const doc = mockDocuments.find((d) => d.id === currentDocId);
    const version = doc?.versions.find((v) => v.id === currentVersionId);
    if (doc && version) {
      setSelectedDocs([
        ...selectedDocs,
        {
          docId: doc.id,
          docName: doc.name,
          versionId: version.id,
          versionName: version.name,
        },
      ]);
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
    setMessages((prev) => {
      const newMessages = [...prev];
      newMessages[newMessages.length - 1] = {
        ...newMessages[newMessages.length - 1],
        content: `生成完成！🎉\n\n✅ 文档解析完成\n✅ 功能模块识别完成\n✅ BDD用例生成完成\n\n本次共生成 ${caseCount} 条测试用例，请在左侧生成记录中确认结果。`,
      };
      return newMessages;
    });

    setIsProcessing(false);
    setSelectedDocs([]);
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
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area with embedded controls */}
      <div className="p-3 flex-shrink-0">
        <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg overflow-hidden">
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
                  setCurrentDocId(value);
                  setCurrentVersionId("");
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
                  // Auto-add when version selected
                  setTimeout(() => {
                    if (currentDocId && val) {
                      handleAddDocument();
                    }
                  }, 0);
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

              {/* Selected docs count with popover */}
              {selectedDocs.length > 0 && (
                <Popover open={docsPopoverOpen} onOpenChange={setDocsPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-7 text-xs gap-1 bg-primary/10 hover:bg-primary/20 text-primary"
                    >
                      <FileText className="w-3 h-3" />
                      {selectedDocs.length} 个文档
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-2" align="start">
                    <div className="space-y-1">
                      {selectedDocs.map((doc) => (
                        <div
                          key={doc.docId}
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <FileText className="w-3 h-3 flex-shrink-0 text-muted-foreground" />
                            <span className="truncate">{doc.docName}</span>
                            <span className="text-muted-foreground">({doc.versionName})</span>
                          </div>
                          <button
                            className="ml-2 hover:bg-destructive/10 rounded-full p-1 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveDocument(doc.docId)}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              {/* Fixed BDD Template Badge - left aligned */}
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
