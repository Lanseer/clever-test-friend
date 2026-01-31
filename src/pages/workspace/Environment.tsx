import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Server, Database, CheckCircle, XCircle, RefreshCw } from "lucide-react";

type EnvType = "dev" | "test" | "staging" | "prod";
type DbType = "mysql" | "postgresql" | "oracle" | "sqlserver";

interface TestEnvironment {
  id: string;
  name: string;
  type: EnvType;
  host: string;
  port: string;
  username: string;
  status: "active" | "inactive";
  description: string;
}

interface DatabaseConfig {
  id: string;
  name: string;
  type: DbType;
  host: string;
  port: string;
  database: string;
  username: string;
  status: "connected" | "disconnected";
}

const mockEnvironments: TestEnvironment[] = [
  { id: "1", name: "开发环境", type: "dev", host: "192.168.1.10", port: "8080", username: "dev_admin", status: "active", description: "用于日常开发测试" },
  { id: "2", name: "测试环境", type: "test", host: "192.168.1.20", port: "8080", username: "test_user", status: "active", description: "用于功能测试" },
  { id: "3", name: "预发布环境", type: "staging", host: "192.168.1.30", port: "443", username: "staging_admin", status: "active", description: "用于上线前验证" },
  { id: "4", name: "生产环境", type: "prod", host: "10.0.0.100", port: "443", username: "prod_readonly", status: "inactive", description: "生产环境（只读）" },
];

const mockDatabases: DatabaseConfig[] = [
  { id: "1", name: "开发数据库", type: "mysql", host: "192.168.1.100", port: "3306", database: "test_dev", username: "dev_user", status: "connected" },
  { id: "2", name: "测试数据库", type: "postgresql", host: "192.168.1.101", port: "5432", database: "test_qa", username: "qa_user", status: "connected" },
  { id: "3", name: "Oracle测试库", type: "oracle", host: "192.168.1.102", port: "1521", database: "TESTDB", username: "test_admin", status: "disconnected" },
];

const envTypeLabels: Record<EnvType, string> = {
  dev: "开发",
  test: "测试",
  staging: "预发布",
  prod: "生产",
};

const dbTypeLabels: Record<DbType, string> = {
  mysql: "MySQL",
  postgresql: "PostgreSQL",
  oracle: "Oracle",
  sqlserver: "SQL Server",
};

interface EnvFormState {
  name: string;
  type: EnvType;
  host: string;
  port: string;
  username: string;
  password: string;
  description: string;
}

interface DbFormState {
  name: string;
  type: DbType;
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
}

export default function Environment() {
  const [activeTab, setActiveTab] = useState("environment");
  const [environments, setEnvironments] = useState<TestEnvironment[]>(mockEnvironments);
  const [databases, setDatabases] = useState<DatabaseConfig[]>(mockDatabases);
  
  // Environment dialog state
  const [envDialogOpen, setEnvDialogOpen] = useState(false);
  const [editingEnv, setEditingEnv] = useState<TestEnvironment | null>(null);
  const [envForm, setEnvForm] = useState<EnvFormState>({ 
    name: "", type: "dev", host: "", port: "", username: "", password: "", description: "" 
  });
  
  // Database dialog state
  const [dbDialogOpen, setDbDialogOpen] = useState(false);
  const [editingDb, setEditingDb] = useState<DatabaseConfig | null>(null);
  const [dbForm, setDbForm] = useState<DbFormState>({ 
    name: "", type: "mysql", host: "", port: "", database: "", username: "", password: "" 
  });

  // Environment handlers
  const handleAddEnv = () => {
    setEditingEnv(null);
    setEnvForm({ name: "", type: "dev", host: "", port: "", username: "", password: "", description: "" });
    setEnvDialogOpen(true);
  };

  const handleEditEnv = (env: TestEnvironment) => {
    setEditingEnv(env);
    setEnvForm({ 
      name: env.name, 
      type: env.type, 
      host: env.host, 
      port: env.port, 
      username: env.username, 
      password: "", 
      description: env.description 
    });
    setEnvDialogOpen(true);
  };

  const handleSaveEnv = () => {
    if (editingEnv) {
      setEnvironments(environments.map(e => 
        e.id === editingEnv.id ? { 
          ...e, 
          name: envForm.name, 
          type: envForm.type, 
          host: envForm.host, 
          port: envForm.port, 
          username: envForm.username, 
          description: envForm.description 
        } : e
      ));
    } else {
      setEnvironments([...environments, {
        id: Date.now().toString(),
        name: envForm.name,
        type: envForm.type,
        host: envForm.host,
        port: envForm.port,
        username: envForm.username,
        description: envForm.description,
        status: "active"
      }]);
    }
    setEnvDialogOpen(false);
  };

  const handleDeleteEnv = (id: string) => {
    setEnvironments(environments.filter(e => e.id !== id));
  };

  const handleToggleEnvStatus = (id: string) => {
    setEnvironments(environments.map(e => 
      e.id === id ? { ...e, status: e.status === "active" ? "inactive" : "active" } : e
    ));
  };

  const handleTestEnvConnection = (id: string) => {
    setEnvironments(environments.map(e => 
      e.id === id ? { ...e, status: e.status === "active" ? "inactive" : "active" } : e
    ));
  };

  // Database handlers
  const handleAddDb = () => {
    setEditingDb(null);
    setDbForm({ name: "", type: "mysql", host: "", port: "", database: "", username: "", password: "" });
    setDbDialogOpen(true);
  };

  const handleEditDb = (db: DatabaseConfig) => {
    setEditingDb(db);
    setDbForm({ name: db.name, type: db.type, host: db.host, port: db.port, database: db.database, username: db.username, password: "" });
    setDbDialogOpen(true);
  };

  const handleSaveDb = () => {
    if (editingDb) {
      setDatabases(databases.map(d => 
        d.id === editingDb.id ? { ...d, name: dbForm.name, type: dbForm.type, host: dbForm.host, port: dbForm.port, database: dbForm.database, username: dbForm.username } : d
      ));
    } else {
      setDatabases([...databases, {
        id: Date.now().toString(),
        name: dbForm.name,
        type: dbForm.type,
        host: dbForm.host,
        port: dbForm.port,
        database: dbForm.database,
        username: dbForm.username,
        status: "disconnected"
      }]);
    }
    setDbDialogOpen(false);
  };

  const handleDeleteDb = (id: string) => {
    setDatabases(databases.filter(d => d.id !== id));
  };

  const handleTestConnection = (id: string) => {
    setDatabases(databases.map(d => 
      d.id === id ? { ...d, status: d.status === "connected" ? "disconnected" : "connected" } : d
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">环境管理</h1>
        <p className="text-muted-foreground">配置和管理测试环境与数据库连接</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="environment" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            测试环境配置
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            数据库配置
          </TabsTrigger>
        </TabsList>

        <TabsContent value="environment" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>测试环境列表</CardTitle>
                <CardDescription>管理不同的测试环境配置</CardDescription>
              </div>
              <Button onClick={handleAddEnv}>
                <Plus className="h-4 w-4 mr-2" />
                添加环境
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>环境名称</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>主机IP</TableHead>
                    <TableHead>端口</TableHead>
                    <TableHead>用户名</TableHead>
                    <TableHead>描述</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {environments.map((env) => (
                    <TableRow key={env.id}>
                      <TableCell className="font-medium">{env.name}</TableCell>
                      <TableCell>
                        <Badge variant={env.type === "prod" ? "destructive" : "secondary"}>
                          {envTypeLabels[env.type]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{env.host}</TableCell>
                      <TableCell className="text-muted-foreground">{env.port}</TableCell>
                      <TableCell className="text-muted-foreground">{env.username}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[150px] truncate">{env.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={env.status === "active"} 
                            onCheckedChange={() => handleToggleEnvStatus(env.id)}
                          />
                          <span className={env.status === "active" ? "text-green-600" : "text-muted-foreground"}>
                            {env.status === "active" ? "启用" : "禁用"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleTestEnvConnection(env.id)} title="测试连接">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEditEnv(env)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteEnv(env.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>数据库连接列表</CardTitle>
                <CardDescription>管理测试所需的数据库连接配置</CardDescription>
              </div>
              <Button onClick={handleAddDb}>
                <Plus className="h-4 w-4 mr-2" />
                添加数据库
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>连接名称</TableHead>
                    <TableHead>数据库类型</TableHead>
                    <TableHead>主机地址</TableHead>
                    <TableHead>端口</TableHead>
                    <TableHead>数据库名</TableHead>
                    <TableHead>用户名</TableHead>
                    <TableHead>连接状态</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {databases.map((db) => (
                    <TableRow key={db.id}>
                      <TableCell className="font-medium">{db.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{dbTypeLabels[db.type]}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{db.host}</TableCell>
                      <TableCell className="text-muted-foreground">{db.port}</TableCell>
                      <TableCell className="text-muted-foreground">{db.database}</TableCell>
                      <TableCell className="text-muted-foreground">{db.username}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {db.status === "connected" ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-green-600">已连接</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">未连接</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleTestConnection(db.id)} title="测试连接">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEditDb(db)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteDb(db.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Environment Dialog */}
      <Dialog open={envDialogOpen} onOpenChange={setEnvDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEnv ? "编辑环境" : "添加环境"}</DialogTitle>
            <DialogDescription>配置测试环境连接信息</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>环境名称</Label>
                <Input 
                  value={envForm.name} 
                  onChange={(e) => setEnvForm({ ...envForm, name: e.target.value })}
                  placeholder="输入环境名称"
                />
              </div>
              <div className="space-y-2">
                <Label>环境类型</Label>
                <Select value={envForm.type} onValueChange={(v: EnvType) => setEnvForm({ ...envForm, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dev">开发环境</SelectItem>
                    <SelectItem value="test">测试环境</SelectItem>
                    <SelectItem value="staging">预发布环境</SelectItem>
                    <SelectItem value="prod">生产环境</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>主机IP</Label>
                <Input 
                  value={envForm.host} 
                  onChange={(e) => setEnvForm({ ...envForm, host: e.target.value })}
                  placeholder="192.168.1.100"
                />
              </div>
              <div className="space-y-2">
                <Label>端口</Label>
                <Input 
                  value={envForm.port} 
                  onChange={(e) => setEnvForm({ ...envForm, port: e.target.value })}
                  placeholder="8080"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>用户名</Label>
                <Input 
                  value={envForm.username} 
                  onChange={(e) => setEnvForm({ ...envForm, username: e.target.value })}
                  placeholder="admin"
                />
              </div>
              <div className="space-y-2">
                <Label>密码</Label>
                <Input 
                  type="password"
                  value={envForm.password} 
                  onChange={(e) => setEnvForm({ ...envForm, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>描述</Label>
              <Input 
                value={envForm.description} 
                onChange={(e) => setEnvForm({ ...envForm, description: e.target.value })}
                placeholder="环境用途说明"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEnvDialogOpen(false)}>取消</Button>
            <Button onClick={handleSaveEnv}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Database Dialog */}
      <Dialog open={dbDialogOpen} onOpenChange={setDbDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDb ? "编辑数据库" : "添加数据库"}</DialogTitle>
            <DialogDescription>配置数据库连接信息</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>连接名称</Label>
              <Input 
                value={dbForm.name} 
                onChange={(e) => setDbForm({ ...dbForm, name: e.target.value })}
                placeholder="输入连接名称"
              />
            </div>
            <div className="space-y-2">
              <Label>数据库类型</Label>
              <Select value={dbForm.type} onValueChange={(v: DbType) => setDbForm({ ...dbForm, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mysql">MySQL</SelectItem>
                  <SelectItem value="postgresql">PostgreSQL</SelectItem>
                  <SelectItem value="oracle">Oracle</SelectItem>
                  <SelectItem value="sqlserver">SQL Server</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>主机地址</Label>
                <Input 
                  value={dbForm.host} 
                  onChange={(e) => setDbForm({ ...dbForm, host: e.target.value })}
                  placeholder="192.168.1.100"
                />
              </div>
              <div className="space-y-2">
                <Label>端口</Label>
                <Input 
                  value={dbForm.port} 
                  onChange={(e) => setDbForm({ ...dbForm, port: e.target.value })}
                  placeholder="3306"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>数据库名</Label>
              <Input 
                value={dbForm.database} 
                onChange={(e) => setDbForm({ ...dbForm, database: e.target.value })}
                placeholder="database_name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>用户名</Label>
                <Input 
                  value={dbForm.username} 
                  onChange={(e) => setDbForm({ ...dbForm, username: e.target.value })}
                  placeholder="username"
                />
              </div>
              <div className="space-y-2">
                <Label>密码</Label>
                <Input 
                  type="password"
                  value={dbForm.password} 
                  onChange={(e) => setDbForm({ ...dbForm, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDbDialogOpen(false)}>取消</Button>
            <Button onClick={handleSaveDb}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
