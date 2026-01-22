import { useState, useEffect } from "react";
import { Plus, X, FileText, Tag, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

interface Document {
  id: string;
  name: string;
  versions: { id: string; name: string; date: string }[];
}

interface SelectedDocument {
  docId: string;
  docName: string;
  versionId: string;
  versionName: string;
}

interface FormData {
  name: string;
  documents: SelectedDocument[];
  tags: string[];
  testActivity: string;
  testPhase: string;
  testCategory: string;
  caseTemplate: string;
  testOntology: string;
  prompt: string;
}

interface AIGenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "regenerate";
  initialData?: {
    name: string;
    documents: SelectedDocument[];
    tags: string[];
  };
  onConfirm: (data: FormData) => void;
}

// 模拟知识库文档数据
const mockDocuments: Document[] = [
  {
    id: "doc-1",
    name: "用户管理功能规格说明书",
    versions: [
      { id: "v1-1", name: "v1.0", date: "2024-01-10" },
      { id: "v1-2", name: "v1.1", date: "2024-01-12" },
      { id: "v1-3", name: "v1.2", date: "2024-01-15" },
    ],
  },
  {
    id: "doc-2",
    name: "支付模块接口文档",
    versions: [
      { id: "v2-1", name: "v1.0", date: "2024-01-08" },
      { id: "v2-2", name: "v2.0", date: "2024-01-14" },
    ],
  },
  {
    id: "doc-3",
    name: "订单流程设计文档",
    versions: [
      { id: "v3-1", name: "v1.0", date: "2024-01-05" },
      { id: "v3-2", name: "v1.1", date: "2024-01-11" },
      { id: "v3-3", name: "v2.0", date: "2024-01-13" },
    ],
  },
  {
    id: "doc-4",
    name: "商品管理PRD",
    versions: [
      { id: "v4-1", name: "v1.0", date: "2024-01-06" },
    ],
  },
  {
    id: "doc-5",
    name: "权限控制设计方案",
    versions: [
      { id: "v5-1", name: "v1.0", date: "2024-01-09" },
      { id: "v5-2", name: "v1.1", date: "2024-01-12" },
    ],
  },
];

const availableTags = ["冒烟测试", "回归测试", "功能测试", "接口测试", "性能测试", "安全测试"];

const caseTemplates = [
  { id: "tpl-1", name: "BDD标准模板", type: "BDD" },
  { id: "tpl-2", name: "API接口测试模板", type: "API" },
  { id: "tpl-3", name: "UI自动化模板", type: "UI" },
  { id: "tpl-4", name: "性能测试模板", type: "Performance" },
];

const testOntologies = [
  { id: "onto-1", name: "银行核心系统测试本体" },
  { id: "onto-2", name: "支付系统测试本体" },
  { id: "onto-3", name: "用户管理测试本体" },
  { id: "onto-4", name: "交易系统测试本体" },
];

const testPhases = ["单元测试", "集成测试", "SIT测试", "UAT测试", "投产测试"];
const testCategories = ["功能测试", "数据测试", "专项测试"];

export function AIGenerateDialog({
  open,
  onOpenChange,
  mode,
  initialData,
  onConfirm,
}: AIGenerateDialogProps) {
  const [name, setName] = useState("");
  const [selectedDocs, setSelectedDocs] = useState<SelectedDocument[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentDocId, setCurrentDocId] = useState<string>("");
  const [currentVersionId, setCurrentVersionId] = useState<string>("");
  const [initMethod, setInitMethod] = useState<"smart" | "upload">("smart");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [testPhase, setTestPhase] = useState<string>("");
  const [testCategory, setTestCategory] = useState<string>("");
  const [testOntology, setTestOntology] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");

  const isRegenerate = mode === "regenerate";

  useEffect(() => {
    if (open) {
      if (initialData) {
        setName(initialData.name);
        setSelectedDocs(initialData.documents);
        setSelectedTags(initialData.tags);
      } else {
        setName("");
        setSelectedDocs([]);
        setSelectedTags([]);
      }
      setCurrentDocId("");
      setCurrentVersionId("");
      setInitMethod("smart");
      setUploadedFile(null);
      setSelectedTemplate("");
      setTestPhase("");
      setTestCategory("");
      setTestOntology("");
      setPrompt("");
    }
  }, [open, initialData]);

  const availableDocuments = mockDocuments.filter(
    (doc) => !selectedDocs.some((sd) => sd.docId === doc.id)
  );

  const currentDocVersions = mockDocuments.find((d) => d.id === currentDocId)?.versions || [];

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

  const handleToggleTag = (tag: string) => {
    if (isRegenerate) return;
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleConfirm = () => {
    onConfirm({
      name,
      documents: selectedDocs,
      tags: selectedTags,
      testActivity: "测试案例设计",
      testPhase,
      testCategory,
      caseTemplate: selectedTemplate,
      testOntology,
      prompt,
    });
    onOpenChange(false);
  };

  const isValid = name.trim() && selectedDocs.length > 0 && testPhase && testCategory && (initMethod === "upload" ? uploadedFile !== null : true);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {isRegenerate ? "再次生成用例" : "新增任务"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6 py-4">
            {/* 基础信息 Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full" />
                <h3 className="font-semibold text-sm">基础信息</h3>
              </div>

              {/* 名称 */}
              <div className="space-y-2">
                <Label htmlFor="name">名称</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="请输入生成任务名称"
                  disabled={isRegenerate}
                  className={isRegenerate ? "bg-muted" : ""}
                />
              </div>

              {/* 测试活动 */}
              <div className="space-y-2">
                <Label>测试活动</Label>
                <Input
                  value="测试案例设计"
                  disabled
                  className="bg-muted"
                />
              </div>

              {/* 测试阶段 */}
              <div className="space-y-2">
                <Label>测试阶段</Label>
                <Select
                  value={testPhase}
                  onValueChange={setTestPhase}
                  disabled={isRegenerate}
                >
                  <SelectTrigger className={isRegenerate ? "bg-muted" : ""}>
                    <SelectValue placeholder="请选择测试阶段" />
                  </SelectTrigger>
                  <SelectContent>
                    {testPhases.map((phase) => (
                      <SelectItem key={phase} value={phase}>
                        {phase}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 测试大类 */}
              <div className="space-y-2">
                <Label>测试大类</Label>
                <Select
                  value={testCategory}
                  onValueChange={setTestCategory}
                  disabled={isRegenerate}
                >
                  <SelectTrigger className={isRegenerate ? "bg-muted" : ""}>
                    <SelectValue placeholder="请选择测试大类" />
                  </SelectTrigger>
                  <SelectContent>
                    {testCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 选择标签 */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  选择标签
                </Label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className={`cursor-pointer transition-colors ${
                        isRegenerate ? "cursor-not-allowed opacity-60" : "hover:bg-primary/80"
                      }`}
                      onClick={() => handleToggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                {isRegenerate && (
                  <p className="text-xs text-muted-foreground">
                    再次生成时不可修改标签
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* 智能设计 Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full" />
                <h3 className="font-semibold text-sm">智能设计</h3>
              </div>

              {/* 选择文档和版本 */}
              <div className="space-y-2">
                <Label>知识库文档</Label>
                <div className="flex gap-2">
                  <Select
                    value={currentDocId}
                    onValueChange={(value) => {
                      setCurrentDocId(value);
                      setCurrentVersionId("");
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="选择文档" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDocuments.map((doc) => (
                        <SelectItem key={doc.id} value={doc.id}>
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
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="选择版本" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentDocVersions.map((version) => (
                        <SelectItem key={version.id} value={version.id}>
                          {version.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleAddDocument}
                    disabled={!currentDocId || !currentVersionId}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* 已选文档列表 */}
                {selectedDocs.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {selectedDocs.map((doc) => (
                      <div
                        key={doc.docId}
                        className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{doc.docName}</span>
                          <Badge variant="secondary" className="text-xs">
                            {doc.versionName}
                          </Badge>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleRemoveDocument(doc.docId)}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {selectedDocs.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    请选择至少一个文档
                  </p>
                )}
              </div>

              {/* 初始化用例方式 */}
              {!isRegenerate && (
                <div className="space-y-3">
                  <Label>初始化用例方式</Label>
                  <RadioGroup
                    value={initMethod}
                    onValueChange={(value) => {
                      setInitMethod(value as "smart" | "upload");
                      if (value === "upload") {
                        setSelectedTemplate("");
                      }
                    }}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="smart" id="smart" />
                      <Label htmlFor="smart" className="cursor-pointer font-normal">智能生成</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="upload" id="upload" />
                      <Label htmlFor="upload" className="cursor-pointer font-normal">本地上传</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {/* 选择用例模板 - 智能生成时显示，本地上传时隐藏 */}
              {initMethod === "smart" && !isRegenerate && (
                <div className="space-y-2">
                  <Label>案例模板</Label>
                  <Select
                    value={selectedTemplate}
                    onValueChange={setSelectedTemplate}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="请选择案例模板（可选）" />
                    </SelectTrigger>
                    <SelectContent>
                      {caseTemplates.map((tpl) => (
                        <SelectItem key={tpl.id} value={tpl.id}>
                          {tpl.name} ({tpl.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* 测试本体 - 智能生成时显示，本地上传时隐藏 */}
              {initMethod === "smart" && !isRegenerate && (
                <div className="space-y-2">
                  <Label>测试本体</Label>
                  <Select
                    value={testOntology}
                    onValueChange={setTestOntology}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="请选择测试本体（可选）" />
                    </SelectTrigger>
                    <SelectContent>
                      {testOntologies.map((onto) => (
                        <SelectItem key={onto.id} value={onto.id}>
                          {onto.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* 提示词 - 智能生成时显示，本地上传时隐藏 */}
              {initMethod === "smart" && !isRegenerate && (
                <div className="space-y-2">
                  <Label>提示词</Label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="请输入提示词，用于指导AI生成测试用例（可选）"
                    className="min-h-[80px]"
                  />
                </div>
              )}

              {/* 本地上传文件 */}
              {initMethod === "upload" && !isRegenerate && (
                <div className="space-y-2">
                  <Label>上传文件</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setUploadedFile(file);
                      }}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      {uploadedFile ? (
                        <div className="flex items-center justify-center gap-2">
                          <FileText className="w-5 h-5 text-primary" />
                          <span className="text-sm font-medium">{uploadedFile.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={(e) => {
                              e.preventDefault();
                              setUploadedFile(null);
                            }}
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            点击或拖拽文件到此处上传
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            支持 xlsx, xls, csv 格式
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={!isValid}>
            确认生成
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
