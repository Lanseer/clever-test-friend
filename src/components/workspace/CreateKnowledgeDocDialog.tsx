import { useState } from "react";
import { Upload, FileUp, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateKnowledgeDocDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const documentTypes = [
  { value: "FSD", label: "FSD - 功能规格说明书" },
  { value: "PRD", label: "PRD - 产品需求文档" },
  { value: "API", label: "API - 接口文档" },
  { value: "Design", label: "设计文档" },
  { value: "Other", label: "其他" },
];

export function CreateKnowledgeDocDialog({ open, onOpenChange }: CreateKnowledgeDocDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    version: "v1.0.0",
  });
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 处理表单提交
    console.log("提交数据:", { ...formData, file });
    onOpenChange(false);
    // 重置表单
    setFormData({ name: "", type: "", version: "v1.0.0" });
    setFile(null);
  };

  const removeFile = () => {
    setFile(null);
  };

  const handleClose = () => {
    onOpenChange(false);
    // 重置表单
    setFormData({ name: "", type: "", version: "v1.0.0" });
    setFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>新建文档</DialogTitle>
          <DialogDescription>
            添加新的知识库文档，填写文档信息并上传文件
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">文档名称 *</Label>
              <Input
                id="name"
                placeholder="请输入文档名称"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">文档类型 *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="version">初始版本 *</Label>
                <Input
                  id="version"
                  placeholder="v1.0.0"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>上传文档 *</Label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {file ? (
                  <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <FileUp className="w-8 h-8 text-primary" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-foreground">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={removeFile}
                      className="h-8 w-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-foreground mb-1">拖拽文件至此处或点击上传</p>
                    <p className="text-xs text-muted-foreground">
                      支持 PDF、Word、Excel、Markdown 等格式
                    </p>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.md,.txt"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              取消
            </Button>
            <Button
              type="submit"
              className="gradient-primary text-primary-foreground"
              disabled={!formData.name || !formData.type || !formData.version || !file}
            >
              创建文档
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
