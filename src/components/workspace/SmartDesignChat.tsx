import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, FileText, X, Check, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GenerationRecordsPopover } from "./GenerationRecordsPopover";

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
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
      content: "你好！我是智能设计助手。请上传需求文档附件，我将帮你自动生成测试用例。\n\n你可以：\n• 上传文档后发送，开始生成用例\n• 询问如何优化测试覆盖率\n• 了解BDD用例设计规范",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showConfirmTag, setShowConfirmTag] = useState(false);
  const [lastGeneratedCount, setLastGeneratedCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = Array.from(files).map((file) => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type || 'unknown',
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);
    
    // Reset input to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
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
        content: inputValue + (uploadedFiles.length > 0 ? `\n\n📎 附件: ${uploadedFiles.map(f => f.name).join(", ")}` : ""),
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
        content: uploadedFiles.length > 0 
          ? `正在基于 ${uploadedFiles.length} 个附件生成测试用例...\n\n✅ 正在解析文档结构\n⏳ 识别功能模块...\n⏳ 生成BDD标准用例...`
          : "正在生成测试用例...\n\n✅ 分析需求\n⏳ 生成用例...",
      };
      return newMessages;
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setMessages((prev) => {
      const newMessages = [...prev];
      newMessages[newMessages.length - 1] = {
        ...newMessages[newMessages.length - 1],
        content: uploadedFiles.length > 0 
          ? `正在基于 ${uploadedFiles.length} 个附件生成测试用例...\n\n✅ 正在解析文档结构\n✅ 识别功能模块\n⏳ 生成BDD标准用例...`
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
    setUploadedFiles([]);
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
        <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg overflow-hidden relative">
          {/* Uploaded Files - displayed above textarea */}
          {uploadedFiles.length > 0 && (
            <div className="px-3 pt-3 pb-1">
              <div className="flex flex-wrap gap-2">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs"
                  >
                    <FileText className="w-3 h-3" />
                    <span className="max-w-[150px] truncate">{file.name}</span>
                    <span className="text-primary/60">({file.size})</span>
                    <button
                      className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                      onClick={() => handleRemoveFile(file.id)}
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
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.md"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          {/* Bottom embedded controls */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2">
            <div className="flex items-center gap-2 flex-1">
              {/* Attachment Button */}
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs gap-1 bg-background/80 border-border/50"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                <Paperclip className="w-3.5 h-3.5" />
                附件
              </Button>

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
