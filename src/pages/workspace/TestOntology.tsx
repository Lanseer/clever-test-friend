import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  Search,
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Target,
  Plus,
  FileText,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";

// 节点类型
type NodeType = "ontology" | "property" | "behavior";

interface OntologyNode {
  id: string;
  label: string;
  type: NodeType;
  x: number;
  y: number;
}

interface OntologyEdge {
  from: string;
  to: string;
}

interface OntologyData {
  id: string;
  name: string;
  nodes: OntologyNode[];
  edges: OntologyEdge[];
}

// 测试案例本体数据
const testCaseOntology: OntologyData = {
  id: "test-case",
  name: "测试案例本体",
  nodes: [
    // 核心本体节点
    { id: "test-case", label: "测试案例", type: "ontology", x: 400, y: 300 },
    { id: "test-scenario", label: "测试场景", type: "ontology", x: 650, y: 200 },
    // 属性节点
    { id: "case-id", label: "案例编号", type: "property", x: 200, y: 150 },
    { id: "case-name", label: "案例名称", type: "property", x: 300, y: 100 },
    { id: "priority", label: "优先级", type: "property", x: 150, y: 250 },
    { id: "precondition", label: "前置条件", type: "property", x: 200, y: 350 },
    { id: "test-steps", label: "测试步骤", type: "property", x: 250, y: 450 },
    { id: "expected-result", label: "预期结果", type: "property", x: 350, y: 500 },
    { id: "test-data", label: "测试数据", type: "property", x: 500, y: 480 },
    { id: "case-type", label: "案例类型", type: "property", x: 550, y: 400 },
    { id: "module", label: "所属模块", type: "property", x: 600, y: 100 },
    { id: "author", label: "编写人", type: "property", x: 700, y: 350 },
    // 行为节点
    { id: "execute", label: "执行案例", type: "behavior", x: 150, y: 400 },
    { id: "review", label: "评审案例", type: "behavior", x: 650, y: 450 },
    { id: "generate", label: "生成案例", type: "behavior", x: 750, y: 250 },
    { id: "import", label: "导入案例", type: "behavior", x: 500, y: 150 },
    { id: "export", label: "导出案例", type: "behavior", x: 300, y: 200 },
  ],
  edges: [
    { from: "test-case", to: "case-id" },
    { from: "test-case", to: "case-name" },
    { from: "test-case", to: "priority" },
    { from: "test-case", to: "precondition" },
    { from: "test-case", to: "test-steps" },
    { from: "test-case", to: "expected-result" },
    { from: "test-case", to: "test-data" },
    { from: "test-case", to: "case-type" },
    { from: "test-case", to: "test-scenario" },
    { from: "test-scenario", to: "module" },
    { from: "test-case", to: "author" },
    { from: "test-case", to: "execute" },
    { from: "test-case", to: "review" },
    { from: "test-case", to: "generate" },
    { from: "test-case", to: "import" },
    { from: "test-case", to: "export" },
  ],
};

// 测试脚本本体数据
const testScriptOntology: OntologyData = {
  id: "test-script",
  name: "测试脚本本体",
  nodes: [
    // 核心本体节点
    { id: "test-script", label: "测试脚本", type: "ontology", x: 400, y: 300 },
    { id: "test-framework", label: "测试框架", type: "ontology", x: 650, y: 180 },
    // 属性节点
    { id: "script-id", label: "脚本编号", type: "property", x: 200, y: 150 },
    { id: "script-name", label: "脚本名称", type: "property", x: 300, y: 100 },
    { id: "language", label: "编程语言", type: "property", x: 150, y: 250 },
    { id: "dependencies", label: "依赖项", type: "property", x: 200, y: 380 },
    { id: "parameters", label: "参数配置", type: "property", x: 280, y: 450 },
    { id: "assertions", label: "断言规则", type: "property", x: 400, y: 480 },
    { id: "hooks", label: "生命周期钩子", type: "property", x: 520, y: 450 },
    { id: "report-config", label: "报告配置", type: "property", x: 600, y: 380 },
    { id: "timeout", label: "超时设置", type: "property", x: 700, y: 300 },
    { id: "retry-policy", label: "重试策略", type: "property", x: 750, y: 200 },
    // 行为节点
    { id: "run", label: "运行脚本", type: "behavior", x: 150, y: 350 },
    { id: "debug", label: "调试脚本", type: "behavior", x: 650, y: 450 },
    { id: "schedule", label: "定时执行", type: "behavior", x: 550, y: 150 },
    { id: "parallel-run", label: "并行执行", type: "behavior", x: 300, y: 180 },
    { id: "generate-report", label: "生成报告", type: "behavior", x: 500, y: 100 },
  ],
  edges: [
    { from: "test-script", to: "script-id" },
    { from: "test-script", to: "script-name" },
    { from: "test-script", to: "language" },
    { from: "test-script", to: "dependencies" },
    { from: "test-script", to: "parameters" },
    { from: "test-script", to: "assertions" },
    { from: "test-script", to: "hooks" },
    { from: "test-script", to: "report-config" },
    { from: "test-script", to: "test-framework" },
    { from: "test-framework", to: "timeout" },
    { from: "test-framework", to: "retry-policy" },
    { from: "test-script", to: "run" },
    { from: "test-script", to: "debug" },
    { from: "test-script", to: "schedule" },
    { from: "test-script", to: "parallel-run" },
    { from: "test-script", to: "generate-report" },
  ],
};

// 模拟文件列表
const mockFiles = [
  { id: "1", name: "用例设计规范_V2.0.docx", selected: true },
  { id: "2", name: "测试框架说明.xlsx", selected: false },
  { id: "3", name: "自动化脚本模板.ppt", selected: false },
  { id: "4", name: "测试数据规范.pdf", selected: false },
];

const nodeTypeConfig: Record<NodeType, { color: string; label: string; bgClass: string }> = {
  ontology: { color: "#8b5cf6", label: "本体", bgClass: "bg-violet-500" },
  property: { color: "#22c55e", label: "属性", bgClass: "bg-green-500" },
  behavior: { color: "#3b82f6", label: "动作", bgClass: "bg-blue-500" },
};

export default function TestOntology() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<"files" | "datasource">("files");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedOntology, setSelectedOntology] = useState<OntologyData>(testCaseOntology);
  const [nodeFilters, setNodeFilters] = useState<Record<NodeType, boolean>>({
    ontology: true,
    property: true,
    behavior: true,
  });
  const [displayCount, setDisplayCount] = useState("10");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const filteredNodes = selectedOntology.nodes.filter(node => nodeFilters[node.type]);
  const filteredEdges = selectedOntology.edges.filter(edge => {
    const fromNode = selectedOntology.nodes.find(n => n.id === edge.from);
    const toNode = selectedOntology.nodes.find(n => n.id === edge.to);
    return fromNode && toNode && nodeFilters[fromNode.type] && nodeFilters[toNode.type];
  });

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.4));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  const handleCenter = () => {
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const getNodePosition = (nodeId: string) => {
    const node = selectedOntology.nodes.find(n => n.id === nodeId);
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  };

  const ontologyOptions = [
    { value: "test-case", label: "测试案例本体", data: testCaseOntology },
    { value: "test-script", label: "测试脚本本体", data: testScriptOntology },
  ];

  const handleOntologyChange = (value: string) => {
    const selected = ontologyOptions.find(o => o.value === value);
    if (selected) {
      setSelectedOntology(selected.data);
    }
  };

  const nodeTypeCounts = {
    ontology: filteredNodes.filter(n => n.type === "ontology").length,
    property: filteredNodes.filter(n => n.type === "property").length,
    behavior: filteredNodes.filter(n => n.type === "behavior").length,
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex">
      {/* Left Sidebar */}
      <div 
        className={cn(
          "border-r bg-card transition-all duration-300 flex flex-col",
          sidebarCollapsed ? "w-0 overflow-hidden" : "w-64"
        )}
      >
        <div className="p-3 border-b flex items-center justify-between">
          <span className="font-medium text-sm">资源</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setSidebarCollapsed(true)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-3 border-b">
          <Button variant="outline" size="sm" className="w-full gap-2">
            <Upload className="h-4 w-4" />
            上传文件
          </Button>
        </div>

        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="输入关键字..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="pl-9 h-8 text-sm"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "files" | "datasource")} className="flex-1 flex flex-col">
          <TabsList className="mx-3 mt-2 grid w-auto grid-cols-2">
            <TabsTrigger value="files" className="text-xs gap-1">
              <FileText className="h-3 w-3" />
              文件
            </TabsTrigger>
            <TabsTrigger value="datasource" className="text-xs gap-1">
              <Database className="h-3 w-3" />
              数据源
            </TabsTrigger>
          </TabsList>
          
          <ScrollArea className="flex-1 p-3">
            {mockFiles.map(file => (
              <div 
                key={file.id}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg text-sm cursor-pointer transition-colors",
                  file.selected 
                    ? "bg-primary/10 text-primary" 
                    : "hover:bg-muted"
                )}
              >
                <FileText className="h-4 w-4 flex-shrink-0" />
                <span className="truncate flex-1">{file.name}</span>
                {file.selected && (
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                )}
              </div>
            ))}
          </ScrollArea>
        </Tabs>
      </div>

      {/* Collapsed Sidebar Toggle */}
      {sidebarCollapsed && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-card border shadow-sm"
          onClick={() => setSidebarCollapsed(false)}
        >
          <ChevronLeft className="h-4 w-4 rotate-180" />
        </Button>
      )}

      {/* Main Graph Area */}
      <div className="flex-1 flex flex-col bg-muted/30 relative">
        {/* Toolbar */}
        <div className="p-3 border-b bg-card flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Select value={selectedOntology.id} onValueChange={handleOntologyChange}>
              <SelectTrigger className="w-48 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ontologyOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>属性显示数:</span>
              <Select value={displayCount} onValueChange={setDisplayCount}>
                <SelectTrigger className="w-16 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCenter}>
              <Target className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground ml-2">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" className="h-8 w-8 ml-2">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Graph Canvas */}
        <div 
          className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <svg
            ref={svgRef}
            className="w-full h-full"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "center center",
            }}
          >
            {/* Edges */}
            {filteredEdges.map((edge, idx) => {
              const from = getNodePosition(edge.from);
              const to = getNodePosition(edge.to);
              return (
                <line
                  key={idx}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={1.5}
                  opacity={0.4}
                />
              );
            })}
            
            {/* Nodes */}
            {filteredNodes.map(node => (
              <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                <circle
                  r={node.type === "ontology" ? 45 : 35}
                  fill={nodeTypeConfig[node.type].color}
                  className="cursor-pointer transition-all hover:opacity-80"
                  style={{
                    filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))",
                  }}
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize={node.type === "ontology" ? 14 : 12}
                  fontWeight={node.type === "ontology" ? 600 : 500}
                  className="pointer-events-none select-none"
                >
                  {node.label.length > 6 ? node.label.slice(0, 5) + "..." : node.label}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Node Type Legend */}
        <div className="absolute right-4 top-20 bg-card border rounded-lg p-3 shadow-lg">
          <div className="text-sm font-medium mb-3">节点类型</div>
          <div className="space-y-2">
            {(Object.keys(nodeTypeConfig) as NodeType[]).map(type => (
              <div key={type} className="flex items-center gap-2">
                <Checkbox
                  id={type}
                  checked={nodeFilters[type]}
                  onCheckedChange={(checked) => 
                    setNodeFilters(prev => ({ ...prev, [type]: !!checked }))
                  }
                />
                <div 
                  className={cn(
                    "w-3 h-3 rounded-full",
                    nodeTypeConfig[type].bgClass
                  )}
                />
                <label htmlFor={type} className="text-sm cursor-pointer">
                  {nodeTypeConfig[type].label}({nodeTypeCounts[type]})
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
