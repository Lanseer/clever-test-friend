import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface SmartDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (description: string) => void;
}

export function SmartDataDialog({ open, onOpenChange, onGenerate }: SmartDataDialogProps) {
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!description.trim()) return;
    
    setIsGenerating(true);
    // Simulate AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsGenerating(false);
    
    onGenerate(description);
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            智能造数
          </DialogTitle>
          <DialogDescription>
            描述您需要生成的测试数据，AI将自动为您生成符合要求的数据
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="description">造数需求描述</Label>
            <Textarea
              id="description"
              placeholder="例如：生成10个有效的手机号码，格式为13x、15x、18x开头的11位数字..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>
          
          <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
            <p className="font-medium mb-1">提示：</p>
            <ul className="list-disc list-inside space-y-1">
              <li>描述数据类型、格式要求</li>
              <li>说明数据数量需求</li>
              <li>列出边界条件或特殊场景</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button 
            onClick={handleGenerate} 
            disabled={!description.trim() || isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                生成数据
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
