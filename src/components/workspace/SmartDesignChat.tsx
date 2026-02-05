import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, FileText, X, Paperclip, Eye, ChevronDown, FolderOpen, Download, Lightbulb, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GenerationRecordItem } from "./GenerationRecordsPanel";
 import { useTranslation } from "react-i18next";

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isGenerationComplete?: boolean;
  generationData?: {
    scenarioCount: number;
    caseCount: number;
    fileName?: string;
  };
}

interface SmartDesignTask {
  id: string;
  name: string;
  testPhase?: string;
  testCategory?: string;
}

interface GeneratedFile {
  id: string;
  name: string;
  scenarioCount: number;
  caseCount: number;
  createdAt: string;
}

interface SmartDesignChatProps {
  selectedTaskId: string | null;
  selectedTask: SmartDesignTask | null;
  records: GenerationRecordItem[];
  messages: Message[];
  onMessagesChange: (messages: Message[]) => void;
  onNoTaskPrompt: () => void;
  onGenerationComplete: (scenarioCount: number, caseCount: number) => void;
  onViewGenerationResult: () => void;
  onStartReview: () => void;
  onFileClick?: (file: GeneratedFile) => void;
  generatedFiles?: GeneratedFile[];
}

export function SmartDesignChat({ 
  selectedTaskId, 
  selectedTask,
  records,
  messages,
  onMessagesChange,
  onNoTaskPrompt, 
  onGenerationComplete,
  onViewGenerationResult,
  onStartReview,
  onFileClick,
  generatedFiles = [],
}: SmartDesignChatProps) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [promptLibrary, setPromptLibrary] = useState<string[]>([
    "生成用户登录模块的完整测试案例，包括正向和负向场景",
    "基于BDD格式生成支付流程的端到端测试案例",
    "生成边界值和等价类测试案例",
    "生成接口自动化测试案例",
    "补充异常处理和错误码验证测试案例",
  ]);
  const [isAddingPrompt, setIsAddingPrompt] = useState(false);
  const [newPromptValue, setNewPromptValue] = useState("");
  const [promptPopoverOpen, setPromptPopoverOpen] = useState(false);
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
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const generateFileName = () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const version = `V0.${generatedFiles.length + 1}`;
    return `${dateStr}生成案例_${version}`;
  };

  const handleAddPrompt = () => {
    if (!newPromptValue.trim()) return;
    setPromptLibrary(prev => [...prev, newPromptValue.trim()]);
    setNewPromptValue("");
    setIsAddingPrompt(false);
    toast.success(t('smartDesign.promptSaved'));
  };

  const handleSelectPrompt = (prompt: string) => {
    setInputValue(prompt);
    setPromptPopoverOpen(false);
  };

  const truncateText = (text: string, maxLength: number = 20) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    if (!selectedTaskId) {
      onNoTaskPrompt();
      return;
    }

    onMessagesChange([
      ...messages,
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
    const updatedMessages = [
      ...messages,
      {
        id: Date.now().toString(),
        role: "user" as const,
        content: inputValue + (uploadedFiles.length > 0 ? `\n\n📎 附件: ${uploadedFiles.map(f => f.name).join(", ")}` : ""),
        timestamp: new Date(),
      },
      {
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        content: "正在分析您的需求...",
        timestamp: new Date(),
      },
    ];
    onMessagesChange(updatedMessages);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const step1Messages = [...updatedMessages];
    step1Messages[step1Messages.length - 1] = {
      ...step1Messages[step1Messages.length - 1],
      content: uploadedFiles.length > 0 
        ? `正在基于 ${uploadedFiles.length} 个附件生成测试案例...\n\n✅ 正在解析文档结构\n⏳ 识别功能模块...\n⏳ 生成BDD标准案例...`
        : "正在生成测试案例...\n\n✅ 分析需求\n⏳ 生成案例...",
    };
    onMessagesChange(step1Messages);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const step2Messages = [...step1Messages];
    step2Messages[step2Messages.length - 1] = {
      ...step2Messages[step2Messages.length - 1],
      content: uploadedFiles.length > 0 
        ? `正在基于 ${uploadedFiles.length} 个附件生成测试案例...\n\n✅ 正在解析文档结构\n✅ 识别功能模块\n⏳ 生成BDD标准案例...`
        : "正在生成测试案例...\n\n✅ 分析需求\n✅ 识别测试点\n⏳ 生成案例...",
    };
    onMessagesChange(step2Messages);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const scenarioCount = Math.floor(Math.random() * 10) + 5;
    const caseCount = Math.floor(Math.random() * 20) + 15;
    const fileName = generateFileName();
    
    const finalMessages = [...step2Messages];
    finalMessages[finalMessages.length - 1] = {
      ...finalMessages[finalMessages.length - 1],
      content: `生成完成！🎉\n\n✅ 文档解析完成\n✅ 功能模块识别完成\n✅ BDD案例生成完成`,
      isGenerationComplete: true,
      generationData: { scenarioCount, caseCount, fileName },
    };
    onMessagesChange(finalMessages);

    setIsProcessing(false);
    setUploadedFiles([]);
    onGenerationComplete(scenarioCount, caseCount);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const selectedRecordForDropdown = records.find(r => r.id === selectedRecordId);

  return (
    <div className="flex flex-col h-full bg-white/30 dark:bg-background/30 backdrop-blur-sm relative">
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
                
                {/* Generation Complete - Show file link only */}
                {message.isGenerationComplete && message.generationData && (
                  <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                    <div className="text-sm">
                      案例已经生成完成，相较于V0.3版本场景总数增加 <span className="font-semibold text-primary">{message.generationData.scenarioCount}</span> 个，案例增加 <span className="font-semibold text-primary">{message.generationData.caseCount}</span> 条
                    </div>
                    
                    {/* File Link */}
                    <div 
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-50 border border-sky-200 cursor-pointer hover:bg-sky-100 transition-colors"
                      onClick={() => {
                        const file: GeneratedFile = {
                          id: `file-${Date.now()}`,
                          name: message.generationData!.fileName || generateFileName(),
                          scenarioCount: message.generationData!.scenarioCount,
                          caseCount: message.generationData!.caseCount,
                          createdAt: new Date().toISOString(),
                        };
                        onFileClick?.(file);
                      }}
                    >
                      <FileText className="w-4 h-4 text-sky-600" />
                      <span className="text-sm font-medium text-sky-700">
                        {message.generationData.fileName || generateFileName()}
                      </span>
                    </div>
                  </div>
                )}
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
        {/* Prompt Library and Test Cases Buttons - positioned right above the chat input */}
        <div className="flex justify-end gap-2 mb-2">
          {/* Prompt Library Button */}
          <Popover open={promptPopoverOpen} onOpenChange={setPromptPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 bg-white/80 border-amber-200 hover:bg-amber-50/50 text-amber-700"
              >
                <Lightbulb className="w-4 h-4" />
               {t('smartDesign.promptLibrary')}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between px-2 py-1.5 border-b">
                 <span className="text-xs font-medium text-muted-foreground">{t('smartDesign.promptLibrary')}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs gap-1"
                    onClick={() => setIsAddingPrompt(true)}
                  >
                    <Plus className="w-3 h-3" />
                   {t('common.new')}
                  </Button>
                </div>
                
                {isAddingPrompt && (
                  <div className="p-2 space-y-2 border rounded-lg bg-muted/30">
                    <Textarea
                      value={newPromptValue}
                      onChange={(e) => setNewPromptValue(e.target.value)}
                     placeholder={t('smartDesign.enterNewPrompt')}
                      className="min-h-[60px] text-sm resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => {
                          setIsAddingPrompt(false);
                          setNewPromptValue("");
                        }}
                      >
                       {t('common.cancel')}
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 px-3 text-xs"
                        onClick={handleAddPrompt}
                        disabled={!newPromptValue.trim()}
                      >
                       {t('common.save')}
                      </Button>
                    </div>
                  </div>
                )}
                
                <ScrollArea className="max-h-[200px]">
                  <div className="flex flex-wrap gap-1.5 p-1">
                    {promptLibrary.map((prompt, index) => (
                      <Tooltip key={index}>
                        <TooltipTrigger asChild>
                          <Badge
                            variant="secondary"
                            className="cursor-pointer hover:bg-primary/20 transition-colors text-xs py-1 px-2"
                            onClick={() => handleSelectPrompt(prompt)}
                          >
                            {truncateText(prompt, 20)}
                          </Badge>
                        </TooltipTrigger>
                        {prompt.length > 20 && (
                          <TooltipContent side="bottom" className="max-w-[300px]">
                            <p className="text-xs">{prompt}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 bg-white/80 border-sky-200 hover:bg-sky-50/50 text-sky-700"
              >
                <FolderOpen className="w-4 h-4" />
             {t('smartDesign.testCases')}
                {generatedFiles.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                    {generatedFiles.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 p-2">
              <div className="space-y-1">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-b mb-1">
               {t('smartDesign.testCaseList')}
                </div>
                {generatedFiles.length === 0 ? (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                 {t('smartDesign.noTestCases')}
                  </div>
                ) : (
                  generatedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-muted cursor-pointer transition-colors group"
                      onClick={() => onFileClick?.(file)}
                    >
                      <FileText className="w-4 h-4 text-sky-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{file.name}</div>
                        <div className="text-[10px] text-muted-foreground">
                       {file.scenarioCount} {t('smartDesign.scenarios')} · {file.caseCount} {t('smartDesign.cases')}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                         toast.success(t('smartDesign.startDownload'));
                        }}
                      >
                        <Download className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

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
            placeholder="输入您的需求，例如：帮我生成用户登录模块的测试案例..."
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

              {/* History Cases Selector - renamed from 交付物 */}
              {records.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs gap-1 bg-background/80 border-border/50"
                      disabled={isProcessing}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {selectedRecordForDropdown 
                        ? selectedRecordForDropdown.deliverableName || `${selectedTask?.name || '任务'}_V0.${selectedRecordForDropdown.batchNumber}` 
                        : "历史案例"
                      }
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuItem onClick={() => setSelectedRecordId(null)}>
                      <span className="text-xs text-muted-foreground">不选择</span>
                    </DropdownMenuItem>
                    {records.map((record) => (
                      <DropdownMenuItem
                        key={record.id}
                        onClick={() => setSelectedRecordId(record.id)}
                      >
                        <span className="text-xs">{record.deliverableName || `${selectedTask?.name || '任务'}_V0.${record.batchNumber}`}</span>
                        <Badge variant="outline" className="ml-auto text-[10px]">
                          {record.scenarioCount} 场景
                        </Badge>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
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
