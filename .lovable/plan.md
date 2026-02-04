
# 我的测试任务页面 - 增加发起外部评审按钮

## 概述
在"我的测试任务"页面的右侧面板标题区域增加一个"发起外部评审"按钮，点击后跳转到发起外部评审的流程页面。

## 当前页面结构
- **左侧面板**：任务列表（w-80）
- **右侧面板**：测试案例版本列表
  - 标题区域：显示当前选中任务名称
  - 内容区域：案例文件卡片列表

## 实现方案

### UI 设计
在右侧面板的标题栏（`p-4 border-b`）中，将任务名称和按钮放在同一行：
- 左侧：任务名称（保持原样）
- 右侧：新增「发起外部评审」按钮

```text
┌─────────────────────────────────────────────────────┐
│ 用户登录模块测试                    [发起外部评审] │
├─────────────────────────────────────────────────────┤
│ 案例文件卡片列表...                                 │
└─────────────────────────────────────────────────────┘
```

### 按钮样式
- 使用 `variant="outline"` 轮廓按钮样式
- 添加 `UserPlus` 图标（表示邀请外部人员）
- 按钮文字：「发起外部评审」

### 点击行为
点击按钮后，跳转到发起外部评审页面：
`/workspace/${workspaceId}/management/ai-cases/record-1/initiate-expert-review`

---

## 技术实现

### 修改文件
**src/pages/workspace/MyTestTasks.tsx**

1. **添加图标导入**
   - 导入 `UserPlus` 图标

2. **添加处理函数**
   ```typescript
   const handleInitiateExternalReview = () => {
     navigate(`/workspace/${workspaceId}/management/ai-cases/record-1/initiate-expert-review`);
   };
   ```

3. **修改右侧面板标题区域**
   将原有的简单标题改为 flex 布局，左侧显示任务名称，右侧显示按钮：
   ```tsx
   <div className="p-4 border-b flex items-center justify-between">
     <h2 className="text-lg font-medium">{selectedTask?.name || "测试案例"}</h2>
     <Button 
       variant="outline" 
       size="sm" 
       className="gap-1.5"
       onClick={handleInitiateExternalReview}
     >
       <UserPlus className="w-4 h-4" />
       发起外部评审
     </Button>
   </div>
   ```

## 预期效果
- 右侧面板标题栏右侧出现「发起外部评审」按钮
- 点击按钮跳转到发起外部评审流程页面
- 按钮样式与页面整体风格一致
