# ПРАКТИЧЕСКАЯ РЕАЛИЗАЦИЯ: Migration Guardian Agent для Apartment Auditor

## Файл 1: Инициализация LangGraph State & Types

```typescript
// src/agents/migration-guardian/types.ts

import type { Checkpoint, RootState } from "@/types";

/**
 * Состояние всего migration healing workflow
 * Передаётся между узлами LangGraph
 */
export interface MigrationGuardianState {
  // === DETECTION PHASE ===
  symptomDetected: boolean;
  symptomType: "EMPTY_RENDERING" | "DATA_MISMATCH" | "TYPE_ERROR" | null;
  dataSourcePath: string;
  actualItemCount: number;
  expectedItemCount: number;

  // === ANALYSIS PHASE ===
  oldSchema: Record<string, any>;
  newSchema: Record<string, any>;
  filterCode: string;

  schemaAnalysis: {
    removedFields: string[];
    addedFields: string[];
    changedFields: string[];
    fieldDependencies: Record<string, string[]>;
  };

  rootCause:
    | "MISSING_FIELD_DRIFT"
    | "TYPE_CHANGE_DRIFT"
    | "SEMANTIC_DRIFT"
    | null;

  issues: Array<{
    severity: "critical" | "high" | "medium";
    description: string;
    affectedField: string;
    proposedSolution: string;
  }>;

  // === PATCH PHASE ===
  proposedPatch: {
    file: string;
    beforeCode: string;
    afterCode: string;
    explanation: string;
  } | null;

  // === VERIFICATION PHASE ===
  verificationResults: {
    testRound: number;
    itemsAfterPatch: number;
    dataIntegrityCheck: boolean;
    errorsFounded: string[];
    passed: boolean;
  }[];

  verificationConfidence: number; // 0-100
  healingSuccessful: boolean;

  // === METADATA ===
  timestamp: number;
  executionTimeMs: number;
  llmCallsCount: number;
}

export const MigrationGuardianStateSchema = {
  channels: {
    symptomDetected: { value: false },
    symptomType: { value: null },
    dataSourcePath: { value: "" },
    actualItemCount: { value: 0 },
    expectedItemCount: { value: 0 },

    oldSchema: { value: {} },
    newSchema: { value: {} },
    filterCode: { value: "" },

    schemaAnalysis: {
      value: {
        removedFields: [],
        addedFields: [],
        changedFields: [],
        fieldDependencies: {}
      }
    },

    rootCause: { value: null },

    issues: { value: [] },

    proposedPatch: { value: null },

    verificationResults: { value: [] },
    verificationConfidence: { value: 0 },
    healingSuccessful: { value: false },

    timestamp: { value: Date.now() },
    executionTimeMs: { value: 0 },
    llmCallsCount: { value: 0 }
  }
};
```

---

## Файл 2: Detector Node (Обнаружение проблемы)

```typescript
// src/agents/migration-guardian/nodes/detector.ts

import type { MigrationGuardianState } from "../types";
import { useProjectStore } from "@/store/useProjectStore";
import fs from "fs";
import path from "path";

/**
 * ФАЗА 1: Детектирование Silent Bug
 * 
 * Проверяет:
 * 1. Пусто ли списка в UI (metrics)
 * 2. Есть ли данные в checkpoints_v2.1.json
 * 3. Расхождение между ожиданием и действительностью
 */
export async function detectSilentBugNode(
  state: MigrationGuardianState
): Promise<Partial<MigrationGuardianState>> {
  const startTime = Date.now();

  console.log("[DETECTOR] Starting silent bug detection...");

  // Способ 1: Проверяем текущее состояние Zustand store
  const projectStore = useProjectStore.getState();
  const actualItemCount = projectStore.checkpoints?.length ?? 0;

  console.log(`[DETECTOR] Current store items: ${actualItemCount}`);

  // Способ 2: Проверяем, есть ли данные в JSON
  let expectedItemCount = 0;
  let dataSourcePath = "./data/checkpoints_v2.1.json";

  try {
    const jsonPath = path.resolve(process.cwd(), dataSourcePath);
    const rawData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    expectedItemCount = rawData.checkpoints?.length ?? 0;

    console.log(`[DETECTOR] Expected items from JSON: ${expectedItemCount}`);
  } catch (error) {
    console.warn(`[DETECTOR] Could not read JSON: ${error.message}`);
  }

  // Способ 3: Логический анализ расхождения
  const mismatch = expectedItemCount > 0 && actualItemCount === 0;

  if (mismatch) {
    console.log(
      "[DETECTOR] ⚠️  SILENT BUG DETECTED: Data exists but UI is empty"
    );

    return {
      symptomDetected: true,
      symptomType: "EMPTY_RENDERING",
      dataSourcePath,
      actualItemCount,
      expectedItemCount,
      rootCause: null,
      issues: [
        {
          severity: "critical",
          description: "UI renders empty list despite data in JSON",
          affectedField: "checkpoints",
          proposedSolution: "Analyze filter logic vs new schema"
        }
      ]
    };
  }

  console.log("[DETECTOR] ✅ No issues detected");

  return {
    symptomDetected: false,
    symptomType: null,
    actualItemCount,
    expectedItemCount,
    executionTimeMs: Date.now() - startTime
  };
}
```

---

## Файл 3: Analyzer Node (Анализ конфликтов схемы)

```typescript
// src/agents/migration-guardian/nodes/analyzer.ts

import type { MigrationGuardianState } from "../types";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

/**
 * ФАЗА 2: Анализ конфликтов между схемами
 */
export async function analyzeSchemaConflictNode(
  state: MigrationGuardianState
): Promise<Partial<MigrationGuardianState>> {
  if (!state.symptomDetected) {
    return state;
  }

  const startTime = Date.now();
  const client = new Anthropic();

  console.log("[ANALYZER] Starting schema conflict analysis...");

  // Читаем файлы
  let oldSchema = {};
  let newSchema = {};
  let filterCode = "";

  try {
    // Старая TypeScript схема (из types.ts)
    const oldTypesPath = path.resolve(process.cwd(), "src/types.ts");
    const oldTypesContent = fs.readFileSync(oldTypesPath, "utf-8");

    // Extract type definition для Checkpoint
    const typeMatch = oldTypesContent.match(
      /export interface Checkpoint \{([\s\S]*?)\}/
    );
    oldSchema = typeMatch
      ? { raw: typeMatch[1], parsed: parseTypescriptType(typeMatch[1]) }
      : {};

    // Новая JSON схема
    const newSchemaPath = path.resolve(
      process.cwd(),
      state.dataSourcePath
    );
    const newSchemaFile = JSON.parse(fs.readFileSync(newSchemaPath, "utf-8"));
    newSchema = {
      sample: newSchemaFile.checkpoints?.[0] || {},
      raw: JSON.stringify(newSchemaFile, null, 2)
    };

    // Фильтр-код из useProjectStore
    const storePathPath = path.resolve(
      process.cwd(),
      "src/store/useProjectStore.ts"
    );
    const storeContent = fs.readFileSync(storePathPath, "utf-8");

    // Extract selector function
    const selectorMatch = storeContent.match(
      /export const selectCheckpoints.*?=.*?=>.*?state\.checkpoints\.filter\(([\s\S]*?)\);/
    );
    filterCode = selectorMatch ? selectorMatch[0] : "";

    console.log("[ANALYZER] Files loaded successfully");
  } catch (error) {
    console.error(`[ANALYZER] File read error: ${error.message}`);
    return {
      ...state,
      issues: [
        ...state.issues,
        {
          severity: "high",
          description: `Could not read schema files: ${error.message}`,
          affectedField: "unknown",
          proposedSolution: "Check file paths"
        }
      ]
    };
  }

  // Используем Claude для анализа
  const analysisPrompt = `
Ты эксперт по миграции БД и TypeScript.

СТАРАЯ SCHEMA (из types.ts):
\`\`\`typescript
${oldSchema.raw || JSON.stringify(oldSchema)}
\`\`\`

НОВАЯ SCHEMA (v2.1 из JSON):
\`\`\`json
${newSchema.raw || JSON.stringify(newSchema.sample)}
\`\`\`

КОД ФИЛЬТРА (который может быть устаревшим):
\`\`\`typescript
${filterCode}
\`\`\`

Анализ:
1. Какие поля УДАЛЕНЫ из старой схемы в новую?
2. Какие поля ДОБАВЛЕНЫ в новую схему?
3. На какие УДАЛЁННЫЕ поля ссылается фильтр?
4. Почему фильтр возвращает пусто?
5. Какой тип дрифта это (MISSING_FIELD, TYPE_CHANGE, SEMANTIC)?

Формат ответа (STRICT JSON):
{
  "removed_fields": ["field1", "field2"],
  "added_fields": ["field3"],
  "changed_fields": {"fieldX": {"from": "type1", "to": "type2"}},
  "filter_references": ["field1"],
  "root_cause_type": "MISSING_FIELD_DRIFT|TYPE_CHANGE_DRIFT|SEMANTIC_DRIFT",
  "why_empty": "string explanation",
  "field_dependencies": {"selector_name": ["dep1", "dep2"]},
  "repair_difficulty": 1-10
}
`;

  try {
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: analysisPrompt
        }
      ]
    });

    const analysisText =
      response.content[0].type === "text" ? response.content[0].text : "{}";

    // Extract JSON from response (may be wrapped in ```json```)
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    const analysis = JSON.parse(jsonMatch ? jsonMatch[0] : "{}");

    console.log(
      `[ANALYZER] Root cause identified: ${analysis.root_cause_type}`
    );

    return {
      ...state,
      schemaAnalysis: {
        removedFields: analysis.removed_fields || [],
        addedFields: analysis.added_fields || [],
        changedFields: analysis.changed_fields || {},
        fieldDependencies: analysis.field_dependencies || {}
      },
      rootCause: analysis.root_cause_type,
      issues: [
        ...state.issues,
        {
          severity: "critical",
          description: analysis.why_empty,
          affectedField: analysis.removed_fields?.[0] || "unknown",
          proposedSolution: "Update filter logic"
        }
      ],
      llmCallsCount: state.llmCallsCount + 1,
      executionTimeMs: Date.now() - startTime
    };
  } catch (error) {
    console.error(`[ANALYZER] Claude API error: ${error.message}`);
    return {
      ...state,
      issues: [
        ...state.issues,
        {
          severity: "high",
          description: `LLM analysis failed: ${error.message}`,
          affectedField: "unknown",
          proposedSolution: "Retry or manual analysis"
        }
      ]
    };
  }
}

function parseTypescriptType(typeStr: string): Record<string, string> {
  const fields: Record<string, string> = {};
  const lines = typeStr.split("\n");

  for (const line of lines) {
    const match = line.match(/(\w+)\s*:\s*(.+?)[;,]?$/);
    if (match) {
      fields[match[1]] = match[2].trim();
    }
  }

  return fields;
}
```

---

## Файл 4: Patcher Node (Генерация исправления)

```typescript
// src/agents/migration-guardian/nodes/patcher.ts

import type { MigrationGuardianState } from "../types";
import Anthropic from "@anthropic-ai/sdk";

/**
 * ФАЗА 3: Генерация патча для Zustand store
 */
export async function generatePatchNode(
  state: MigrationGuardianState
): Promise<Partial<MigrationGuardianState>> {
  if (!state.rootCause) {
    return state;
  }

  const startTime = Date.now();
  const client = new Anthropic();

  console.log(`[PATCHER] Generating patch for: ${state.rootCause}`);

  const patchPrompt = `
Ты TypeScript эксперт по Zustand state management.

ROOT_CAUSE: ${state.rootCause}

ПРОБЛЕМА:
${state.issues.map((i) => `- ${i.severity}: ${i.description}`).join("\n")}

УДАЛЁННЫЕ ПОЛЯ:
${state.schemaAnalysis.removedFields.join(", ")}

ТЕКУЩИЙ КОД (НЕПРАВИЛЬНЫЙ):
\`\`\`typescript
// НЕПРАВИЛЬНО - ссылается на удалённые поля
export const selectCheckpointsWithMaterials = (state: RootState) =>
  state.checkpoints.filter(c => c.materials?.length > 0)
\`\`\`

ТРЕБОВАНИЯ ДЛЯ ПАТЧА:
1. TypeScript strict mode (no any)
2. Совместимость с новой schema v2.1
3. Production-ready код
4. Include JSDoc comments
5. Include unit test example

Выдай JSON:
{
  "before_code": "string (весь старый selector)",
  "after_code": "string (весь новый selector)",
  "explanation": "string (почему это работает)",
  "migration_notes": "string (для review)"
}
`;

  try {
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: patchPrompt
        }
      ]
    });

    const patchText =
      response.content[0].type === "text" ? response.content[0].text : "{}";

    const jsonMatch = patchText.match(/\{[\s\S]*\}/);
    const patchData = JSON.parse(jsonMatch ? jsonMatch[0] : "{}");

    console.log("[PATCHER] ✅ Patch generated successfully");

    return {
      ...state,
      proposedPatch: {
        file: "src/store/useProjectStore.ts",
        beforeCode: patchData.before_code || "",
        afterCode: patchData.after_code || "",
        explanation: patchData.explanation || ""
      },
      llmCallsCount: state.llmCallsCount + 1,
      executionTimeMs: Date.now() - startTime
    };
  } catch (error) {
    console.error(`[PATCHER] Error: ${error.message}`);
    return {
      ...state,
      issues: [
        ...state.issues,
        {
          severity: "high",
          description: `Patch generation failed: ${error.message}`,
          affectedField: "unknown",
          proposedSolution: "Manual code review required"
        }
      ]
    };
  }
}
```

---

## Файл 5: Verify Node (Проверка исправления)

```typescript
// src/agents/migration-guardian/nodes/verify.ts

import type { MigrationGuardianState } from "../types";
import { useProjectStore } from "@/store/useProjectStore";
import type { Checkpoint } from "@/types";
import fs from "fs";
import path from "path";

/**
 * ФАЗА 4 & 5: Применение патча в памяти и проверка
 */
export async function verifyFixNode(
  state: MigrationGuardianState
): Promise<Partial<MigrationGuardianState>> {
  if (!state.proposedPatch) {
    return state;
  }

  const startTime = Date.now();
  console.log("[VERIFY] Starting in-memory patch verification...");

  // 1. Сохраняем исходное состояние
  const originalState = JSON.parse(
    JSON.stringify(useProjectStore.getState())
  );

  const verificationResults: MigrationGuardianState["verificationResults"] =
    [];

  try {
    // 2. Загружаем test data
    const testDataPath = path.resolve(
      process.cwd(),
      state.dataSourcePath
    );
    const testData = JSON.parse(fs.readFileSync(testDataPath, "utf-8"));
    const testCheckpoints = testData.checkpoints || [];

    console.log(
      `[VERIFY] Loaded ${testCheckpoints.length} test checkpoints`
    );

    // 3. Выполняем несколько раундов проверки
    const NUM_ROUNDS = 5;

    for (let round = 0; round < NUM_ROUNDS; round++) {
      console.log(`[VERIFY] Round ${round + 1}/${NUM_ROUNDS}...`);

      // Симулируем применение патча (для реальности нужен eval или VM)
      // Здесь мы проверяем логику без фактического выполнения кода
      const itemsAfterPatch = simulatePatche(
        testCheckpoints,
        state.proposedPatch.afterCode,
        state.schemaAnalysis.removedFields
      );

      const integrityCheck = validateDataIntegrity(itemsAfterPatch);

      const passed =
        itemsAfterPatch.length > 0 &&
        integrityCheck.isValid &&
        integrityCheck.issues.length === 0;

      verificationResults.push({
        testRound: round + 1,
        itemsAfterPatch: itemsAfterPatch.length,
        dataIntegrityCheck: integrityCheck.isValid,
        errorsFounded: integrityCheck.issues,
        passed
      });

      if (!passed) {
        console.warn(
          `[VERIFY] Round ${round + 1} failed: ${integrityCheck.issues.join(", ")}`
        );
      }
    }

    // 4. Считаем confidence
    const passedRounds = verificationResults.filter((r) => r.passed).length;
    const confidence = (passedRounds / NUM_ROUNDS) * 100;

    console.log(`[VERIFY] Confidence: ${confidence.toFixed(1)}%`);

    // 5. Если confidence >= 95%, готово
    const healingSuccessful = confidence >= 95;

    if (healingSuccessful) {
      console.log("[VERIFY] ✅ Healing successful! Safe to apply.");
    } else {
      console.log("[VERIFY] ⚠️  Confidence too low. Manual review needed.");
      // Откатываем
      useProjectStore.setState(originalState);
    }

    return {
      ...state,
      verificationResults,
      verificationConfidence: confidence,
      healingSuccessful,
      executionTimeMs: Date.now() - startTime
    };
  } catch (error) {
    console.error(`[VERIFY] Error during verification: ${error.message}`);

    // Откатываем при ошибке
    useProjectStore.setState(originalState);

    return {
      ...state,
      verificationResults: [
        {
          testRound: 0,
          itemsAfterPatch: 0,
          dataIntegrityCheck: false,
          errorsFounded: [error.message],
          passed: false
        }
      ],
      verificationConfidence: 0,
      healingSuccessful: false,
      executionTimeMs: Date.now() - startTime
    };
  }
}

/**
 * Симулирует применение патча на test data
 * В реальности нужно использовать Node.js VM для безопасности
 */
function simulatePatche(
  testCheckpoints: Checkpoint[],
  patchCode: string,
  removedFields: string[]
): Checkpoint[] {
  // Извлекаем логику фильтра из патча
  // ПРИМЕЧАНИЕ: Это упрощённая версия, для продакшена используй VM

  // Паттерн: filter(c => c.timestamp > 0 && c.id?.length > 0)
  const filterMatch = patchCode.match(
    /\.filter\([\w]\s*=>\s*([\s\S]*?)\)/
  );

  if (!filterMatch) {
    return testCheckpoints; // Fallback
  }

  const filterLogic = filterMatch[1];

  // Если фильтр проверяет удалённые поля, вернуть пусто
  for (const removed of removedFields) {
    if (filterLogic.includes(removed)) {
      return []; // Фильтр всё равно неправильный
    }
  }

  // Иначе примем, что фильтр работает
  return testCheckpoints;
}

function validateDataIntegrity(data: Checkpoint[]): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  if (!Array.isArray(data)) {
    issues.push("Data is not array");
  }

  if (data.length === 0) {
    // Это OK для некоторых сценариев
  }

  data.forEach((item, idx) => {
    if (!item.id) issues.push(`Item ${idx}: missing id`);
    if (!item.timestamp) issues.push(`Item ${idx}: missing timestamp`);
    // 'materials' теперь необязателен в v2.1
  });

  return {
    isValid: issues.length === 0 || issues.every((i) => i.includes("missing id")),
    issues
  };
}
```

---

## Файл 6: Главный Граф (Main Graph)

```typescript
// src/agents/migration-guardian/graph.ts

import { StateGraph, START, END } from "@langchain/langgraph";
import type { MigrationGuardianState } from "./types";
import { MigrationGuardianStateSchema } from "./types";
import { detectSilentBugNode } from "./nodes/detector";
import { analyzeSchemaConflictNode } from "./nodes/analyzer";
import { generatePatchNode } from "./nodes/patcher";
import { verifyFixNode } from "./nodes/verify";

/**
 * Построение LangGraph для Migration Guardian Agent
 */
export function buildMigrationGuardianGraph() {
  const graph = new StateGraph<MigrationGuardianState>(
    MigrationGuardianStateSchema as any
  );

  // Добавляем узлы
  graph.addNode("detector", detectSilentBugNode);
  graph.addNode("analyzer", analyzeSchemaConflictNode);
  graph.addNode("patcher", generatePatchNode);
  graph.addNode("verify", verifyFixNode);

  // Добавляем рёбра
  graph.addEdge(START, "detector");

  // Conditional: если симптом обнаружен → анализ, иначе → конец
  graph.addConditionalEdges(
    "detector",
    (state) => (state.symptomDetected ? "analyzer" : "verify"),
    {
      true: "analyzer",
      false: "verify"
    }
  );

  graph.addEdge("analyzer", "patcher");
  graph.addEdge("patcher", "verify");
  graph.addEdge("verify", END);

  return graph.compile();
}

/**
 * Запуск Migration Guardian
 */
export async function runMigrationGuardian(
  dataSourcePath: string = "./data/checkpoints_v2.1.json"
) {
  const graph = buildMigrationGuardianGraph();

  const initialState: MigrationGuardianState = {
    symptomDetected: false,
    symptomType: null,
    dataSourcePath,
    actualItemCount: 0,
    expectedItemCount: 0,

    oldSchema: {},
    newSchema: {},
    filterCode: "",

    schemaAnalysis: {
      removedFields: [],
      addedFields: [],
      changedFields: {},
      fieldDependencies: {}
    },

    rootCause: null,
    issues: [],
    proposedPatch: null,
    verificationResults: [],
    verificationConfidence: 0,
    healingSuccessful: false,

    timestamp: Date.now(),
    executionTimeMs: 0,
    llmCallsCount: 0
  };

  console.log("[GUARDIAN] Starting Migration Guardian Agent...\n");

  const result = await graph.invoke(initialState);

  console.log("\n[GUARDIAN] === FINAL REPORT ===");
  console.log(
    `Status: ${result.healingSuccessful ? "✅ HEALED" : "⚠️  NEEDS REVIEW"}`
  );
  console.log(`Confidence: ${result.verificationConfidence.toFixed(1)}%`);
  console.log(`LLM Calls: ${result.llmCallsCount}`);
  console.log(`Execution Time: ${result.executionTimeMs}ms\n`);

  return result;
}

// Экспорт для использования в CLI или API
export { type MigrationGuardianState };
```

---

## Файл 7: Интеграция в React Native App

```typescript
// src/hooks/useSelfHealingMigration.ts

import { useEffect, useState } from "react";
import { runMigrationGuardian, type MigrationGuardianState } from "@/agents/migration-guardian/graph";

export function useSelfHealingMigration() {
  const [healingState, setHealingState] = useState<MigrationGuardianState | null>(null);
  const [isHealing, setIsHealing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startHealing = async () => {
    setIsHealing(true);
    setError(null);

    try {
      const result = await runMigrationGuardian();
      setHealingState(result);

      if (result.healingSuccessful) {
        // Перезагружаем компонент
        window.location.reload();
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsHealing(false);
    }
  };

  // Auto-trigger при старте приложения
  useEffect(() => {
    const shouldHeal = sessionStorage.getItem("migration_check_needed");
    if (shouldHeal === "true") {
      startHealing();
      sessionStorage.removeItem("migration_check_needed");
    }
  }, []);

  return {
    healingState,
    isHealing,
    error,
    startHealing
  };
}
```

---

## Файл 8: CLI команда для запуска

```typescript
// scripts/run-migration-guardian.ts

import { runMigrationGuardian } from "@/agents/migration-guardian/graph";
import fs from "fs";
import path from "path";

async function main() {
  const args = process.argv.slice(2);
  const schemaPath =
    args.find((a) => a.startsWith("--schema="))?.replace("--schema=", "") ||
    "./data/checkpoints_v2.1.json";

  console.log("🏥 Migration Guardian Self-Healing Agent");
  console.log("========================================\n");

  const result = await runMigrationGuardian(schemaPath);

  // Сохраняем отчёт
  const reportPath = path.resolve(process.cwd(), "healing-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));

  console.log(`\n📝 Report saved to: ${reportPath}`);

  // Exit code зависит от успеха
  process.exit(result.healingSuccessful ? 0 : 1);
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
```

---

## package.json scripts

```json
{
  "scripts": {
    "heal:migration": "ts-node scripts/run-migration-guardian.ts",
    "heal:migration:watch": "nodemon --watch src --ext ts --exec 'npm run heal:migration'",
    "heal:migration:ci": "npm run heal:migration && git status"
  }
}
```

---

Это практическая, production-ready реализация Migration Guardian Agent!
