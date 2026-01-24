import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, FileText, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export function SmartDesignChat({ selectedTaskId, onNoTaskPrompt }: SmartDesignChatProps) {
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

    // Simulate AI response
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: selectedDocs.length > 0 
          ? `已收到您的请求，正在基于 ${selectedDocs.length} 个文档生成测试用例...\n\n✅ 正在解析文档结构\n✅ 识别功能模块\n✅ 生成BDD标准用例\n\n预计生成 24 条用例，请稍候...`
          : "好的，我理解了您的需求。请先选择知识库文档，然后我将为您生成相应的测试用例。",
        timestamp: new Date(),
      },
    ]);
    setIsProcessing(false);
    setSelectedDocs([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
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
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
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

      {/* Document Selection & Input */}
      <div className="border-t p-3 space-y-3 flex-shrink-0">
        {/* Selected Documents */}
        {selectedDocs.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedDocs.map((doc) => (
              <Badge
                key={doc.docId}
                variant="secondary"
                className="gap-1 pr-1"
              >
                <FileText className="w-3 h-3" />
                <span className="max-w-[120px] truncate">{doc.docName}</span>
                <span className="text-muted-foreground">({doc.versionName})</span>
                <button
                  className="ml-1 hover:bg-muted rounded-full p-0.5"
                  onClick={() => handleRemoveDocument(doc.docId)}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Document Selection Row */}
        <div className="flex gap-2 items-center">
          <Select
            value={currentDocId}
            onValueChange={(value) => {
              setCurrentDocId(value);
              setCurrentVersionId("");
            }}
          >
            <SelectTrigger className="w-[180px] h-8 text-xs">
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
            onValueChange={setCurrentVersionId}
            disabled={!currentDocId}
          >
            <SelectTrigger className="w-[80px] h-8 text-xs">
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

          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2"
            onClick={handleAddDocument}
            disabled={!currentDocId || !currentVersionId}
          >
            <Plus className="w-4 h-4" />
          </Button>

          <div className="flex-1" />

          <Badge variant="outline" className="text-xs bg-muted cursor-not-allowed">
            BDD标准模板
          </Badge>
        </div>

        {/* Input Row */}
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入您的需求，例如：帮我生成用户登录模块的测试用例..."
            disabled={isProcessing}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isProcessing}
            size="icon"
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
  );
}
