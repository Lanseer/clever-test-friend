import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Sparkles, Upload, X, Tag, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SmartDataDialog } from "@/components/workspace/SmartDataDialog";
import { useToast } from "@/hooks/use-toast";

interface DataEntry {
  id: string;
  key: string;
  value: string;
  valueType: "direct" | "smart";
}

interface UploadedFile {
  id: string;
  name: string;
  size: string;
}

export default function TestDataCreate() {
  const navigate = useNavigate();
  const { workspaceId } = useParams();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [dataEntries, setDataEntries] = useState<DataEntry[]>([
    { id: "1", key: "", value: "", valueType: "direct" },
  ]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [smartDialogOpen, setSmartDialogOpen] = useState(false);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);

  const handleBack = () => {
    navigate(`/workspace/${workspaceId}/data`);
  };

  const addDataEntry = () => {
    setDataEntries([
      ...dataEntries,
      { id: Date.now().toString(), key: "", value: "", valueType: "direct" },
    ]);
  };

  const removeDataEntry = (id: string) => {
    if (dataEntries.length > 1) {
      setDataEntries(dataEntries.filter((entry) => entry.id !== id));
    }
  };

  const updateDataEntry = (id: string, field: keyof DataEntry, value: string) => {
    setDataEntries(
      dataEntries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const handleValueTypeChange = (id: string, type: "direct" | "smart") => {
    if (type === "smart") {
      setCurrentEntryId(id);
      setSmartDialogOpen(true);
    } else {
      updateDataEntry(id, "valueType", type);
    }
  };

  const handleSmartGenerate = (description: string) => {
    if (currentEntryId) {
      // Simulate AI-generated value
      const generatedValue = `[AI生成] ${description.slice(0, 50)}...`;
      setDataEntries(
        dataEntries.map((entry) =>
          entry.id === currentEntryId
            ? { ...entry, value: generatedValue, valueType: "smart" }
            : entry
        )
      );
      toast({
        title: "数据生成成功",
        description: "AI已根据您的描述生成测试数据",
      });
    }
    setCurrentEntryId(null);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles: UploadedFile[] = Array.from(files).map((file) => ({
        id: Date.now().toString() + file.name,
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
      }));
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(uploadedFiles.filter((f) => f.id !== id));
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: "请输入数据名称",
        variant: "destructive",
      });
      return;
    }

    // Save logic here
    toast({
      title: "保存成功",
      description: "测试数据已保存",
    });
    navigate(`/workspace/${workspaceId}/data`);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">新增测试数据</h1>
          <p className="text-muted-foreground mt-1">创建新的测试数据集</p>
        </div>
        <Button variant="outline" onClick={handleBack}>
          取消
        </Button>
        <Button onClick={handleSave}>保存</Button>
      </div>

      {/* Data Name */}
      <div className="mb-6">
        <Label htmlFor="name" className="text-base font-medium">
          数据名称
        </Label>
        <Input
          id="name"
          placeholder="输入测试数据名称..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-2 max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Data Editor */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center justify-between">
                数据编辑
                <Button size="sm" variant="outline" onClick={addDataEntry} className="gap-1">
                  <Plus className="w-4 h-4" />
                  添加字段
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dataEntries.map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 p-4 rounded-lg border bg-muted/20"
                >
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Key</Label>
                      <Input
                        placeholder="字段名称"
                        value={entry.key}
                        onChange={(e) => updateDataEntry(entry.id, "key", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">Value</Label>
                        <Select
                          value={entry.valueType}
                          onValueChange={(value: "direct" | "smart") =>
                            handleValueTypeChange(entry.id, value)
                          }
                        >
                          <SelectTrigger className="h-6 w-24 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="direct">直接填写</SelectItem>
                            <SelectItem value="smart">
                              <span className="flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                智能造数
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Input
                        placeholder={
                          entry.valueType === "smart" ? "AI生成的数据..." : "字段值"
                        }
                        value={entry.value}
                        onChange={(e) => updateDataEntry(entry.id, "value", e.target.value)}
                        className={entry.valueType === "smart" ? "bg-primary/5" : ""}
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeDataEntry(entry.id)}
                    disabled={dataEntries.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Tags & Files */}
        <div className="space-y-6">
          {/* Tags Configuration */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Tag className="w-4 h-4" />
                配置标签
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="输入标签..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTag()}
                />
                <Button variant="outline" size="icon" onClick={addTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {tags.length === 0 && (
                  <p className="text-sm text-muted-foreground">暂无标签</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="w-4 h-4" />
                上传文件
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  multiple
                  onChange={handleFileUpload}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    点击或拖拽文件到此处上传
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    支持 CSV, JSON, Excel 等格式
                  </p>
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium truncate max-w-[150px]">
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{file.size}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeFile(file.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <SmartDataDialog
        open={smartDialogOpen}
        onOpenChange={setSmartDialogOpen}
        onGenerate={handleSmartGenerate}
      />
    </div>
  );
}
