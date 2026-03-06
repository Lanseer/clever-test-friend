import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface TestPoint {
  id: string;
  code: string;
  name: string;
  scenarioCategory?: string;
}

interface MindMapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dimensionName: string;
  testPoints: TestPoint[];
}

export function MindMapDialog({ open, onOpenChange, dimensionName, testPoints }: MindMapDialogProps) {
  // Group test points by scenario category
  const grouped = testPoints.reduce<Record<string, TestPoint[]>>((acc, tp) => {
    const category = tp.scenarioCategory || "未分类";
    if (!acc[category]) acc[category] = [];
    acc[category].push(tp);
    return acc;
  }, {});

  const categories = Object.keys(grouped);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">思维导图 - {dimensionName}</DialogTitle>
        </DialogHeader>

        <div className="mt-4 flex justify-center">
          <div className="inline-flex items-start gap-0">
            {/* Root node */}
            <div className="flex items-center">
              <div className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm whitespace-nowrap">
                {dimensionName}
              </div>
            </div>

            {/* Connector to categories */}
            <div className="flex flex-col justify-center relative" style={{ minHeight: categories.length * 80 }}>
              {/* Horizontal line from root */}
              <div className="absolute left-0 top-1/2 w-8 h-px bg-border" />
              {/* Vertical spine */}
              {categories.length > 1 && (
                <div
                  className="absolute left-8 bg-border"
                  style={{
                    width: 1,
                    top: `${100 / (categories.length * 2)}%`,
                    bottom: `${100 / (categories.length * 2)}%`,
                  }}
                />
              )}

              {/* Category branches */}
              <div className="ml-8 flex flex-col gap-4 py-4">
                {categories.map((category) => {
                  const items = grouped[category];
                  return (
                    <div key={category} className="flex items-start gap-0">
                      {/* Horizontal connector */}
                      <div className="w-6 h-px bg-border mt-4" />
                      
                      {/* Category node */}
                      <div className="flex items-start gap-0">
                        <div className="px-3 py-1.5 rounded-md bg-accent text-accent-foreground text-sm font-medium whitespace-nowrap border">
                          {category}
                        </div>

                        {/* Connector to scenarios */}
                        <div className="flex flex-col relative" style={{ minHeight: items.length * 36 }}>
                          <div className="absolute left-0 top-1/2 w-6 h-px bg-border" />
                          {items.length > 1 && (
                            <div
                              className="absolute left-6 bg-border"
                              style={{
                                width: 1,
                                top: `${100 / (items.length * 2)}%`,
                                bottom: `${100 / (items.length * 2)}%`,
                              }}
                            />
                          )}
                          
                          {/* Scenario nodes */}
                          <div className="ml-6 flex flex-col gap-1.5 py-1">
                            {items.map((tp) => (
                              <div key={tp.id} className="flex items-center gap-0">
                                <div className="w-4 h-px bg-border" />
                                <div className="px-2.5 py-1 rounded border bg-card text-xs whitespace-nowrap flex items-center gap-1.5">
                                  <span className="text-muted-foreground font-mono">{tp.code}</span>
                                  <span>{tp.name}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
