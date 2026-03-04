

## Plan: Update "订单支付流程分析" (session-2) Mock Content

**Goal:** Change session-2's chat messages to show a detection prompt about existing generated cases, followed by a file list where each file has author/date metadata above it.

### Changes

**1. Update `sessionMessagesMap` in `AIGeneratedCases.tsx` (lines 160-163)**

Replace session-2 messages with:
- `s2-1`: Assistant greeting (keep)
- `s2-2`: Assistant message with text: "检查到文档存在已经生成的案例，请检查是否使用" followed by a list of file entries. Each file entry rendered as a generation-complete message with `generationData` and a new `authorInfo` field.

Since the `Message` interface doesn't support multiple file entries or author metadata natively, we need to:

**2. Extend `Message` interface in `SmartDesignChat.tsx`**

Add optional field to `Message`:
```ts
existingFiles?: Array<{
  fileName: string;
  author: string;
  date: string;
  scenarioCount: number;
  caseCount: number;
}>;
```

**3. Render existing files in `SmartDesignChat.tsx`**

In the message rendering section, after the `message.content` block, add a check for `message.existingFiles`. If present, render a vertical list of file cards, each showing:
- Small gray text above: `{author} 于 {date} 生成`
- File link card (same style as generation complete file links) with FileText icon and file name
- Clickable to trigger `onFileClick`

**4. Update session-2 mock data in `AIGeneratedCases.tsx`**

```ts
"session-2": [
  { id: "s2-1", role: "assistant", content: t('smartDesign.assistantGreeting'), timestamp: new Date() },
  { 
    id: "s2-2", role: "assistant", 
    content: "检查到文档存在已经生成的案例，请检查是否使用",
    timestamp: new Date(),
    existingFiles: [
      { fileName: "2026-02-06生成案例_V0.1", author: "Lanseer", date: "2026-02-06", scenarioCount: 12, caseCount: 36 },
      { fileName: "2026-02-07生成案例_V0.2", author: "Lanseer", date: "2026-02-07", scenarioCount: 15, caseCount: 42 },
    ]
  },
],
```

**5. Add i18n key** for the detection text in `zh.json` and `en.json`:
- `smartDesign.existingCasesDetected`: "检查到文档存在已经生成的案例，请检查是否使用" / "Existing generated cases detected for this document. Please check if you want to use them."
- `smartDesign.generatedBy`: "于" / "on" (for the author line pattern)

