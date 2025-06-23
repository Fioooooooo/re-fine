<script setup lang="ts">
import type { SandboxRunCodeParams, SandboxRunCodeResult } from '~/libs/tools/types';
import { ref, computed, watch } from 'vue';

const props = defineProps<{
  args: SandboxRunCodeParams;
  result?: SandboxRunCodeResult;
}>();

const isLoading = ref(true);
const activeTab = ref('code'); // 'code' | 'result'

// 判断代码语言类型
const codeLanguage = computed(() => {
  // 从代码内容推断语言
  const code = props.args.code || '';

  if (
    code.includes('console.log') ||
    code.includes('function') ||
    code.includes('const ') ||
    code.includes('let ')
  ) {
    return 'javascript';
  }

  if (code.includes('import ') && code.includes('from ')) {
    return 'typescript';
  }

  if (code.includes('print(') || code.includes('def ') || code.includes('import ')) {
    return 'python';
  }

  if (
    code.includes('public class') ||
    code.includes('private ') ||
    code.includes('System.out.println')
  ) {
    return 'java';
  }

  return 'javascript'; // 默认为 JavaScript
});

// 判断结果状态
const resultStatus = computed(() => {
  if (!props.result) return 'pending';
  if (props.result.runtimeError) return 'error';
  return 'success';
});

// 监听结果变化
watch(
  () => props.result,
  newVal => {
    if (newVal) {
      isLoading.value = false;
      activeTab.value = 'result'; // 自动切换到结果标签
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="code-preview p-4">
    <!-- 代码执行环境信息 -->
    <div
      class="code-header bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6"
    >
      <div class="flex items-center p-4">
        <UIcon
          name="i-lucide-code-2"
          class="w-10 h-10 text-indigo-500 mr-4 p-1 bg-indigo-50 rounded-lg"
        />
        <div class="flex-1 min-w-0">
          <div class="text-lg font-medium text-gray-800">代码执行环境</div>
          <div class="flex items-center text-sm text-gray-500 mt-1">
            <div class="flex items-center mr-4">
              <UIcon name="i-lucide-box" class="w-4 h-4 mr-1" />
              <span>沙箱 ID: {{ args.sandboxId || 'N/A' }}</span>
            </div>
            <div class="flex items-center">
              <UIcon name="i-lucide-code" class="w-4 h-4 mr-1" />
              <span>语言: {{ codeLanguage }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 代码和结果标签页 -->
    <div
      class="code-container bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden"
    >
      <!-- 标签切换 -->
      <div class="flex border-b">
        <button
          @click="activeTab = 'code'"
          :class="[
            'flex items-center px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'code'
              ? 'text-indigo-600 border-b-2 border-indigo-500'
              : 'text-gray-600 hover:text-indigo-500',
          ]"
        >
          <UIcon name="i-lucide-code" class="w-4 h-4 mr-2"></UIcon>
          源代码
        </button>
        <button
          @click="activeTab = 'result'"
          :class="[
            'flex items-center px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'result'
              ? 'text-indigo-600 border-b-2 border-indigo-500'
              : 'text-gray-600 hover:text-indigo-500',
          ]"
        >
          <UIcon
            :name="
              resultStatus === 'pending'
                ? 'i-lucide-loader'
                : resultStatus === 'error'
                  ? 'i-lucide-alert-circle'
                  : 'i-lucide-check-circle'
            "
            class="w-4 h-4 mr-2"
            :class="[
              resultStatus === 'pending'
                ? 'animate-spin'
                : resultStatus === 'error'
                  ? 'text-red-500'
                  : 'text-green-500',
            ]"
          ></UIcon>
          执行结果
        </button>
      </div>

      <!-- 代码内容 -->
      <div v-show="activeTab === 'code'" class="p-0">
        <div class="relative">
          <div
            class="absolute top-0 right-0 z-10 p-2 bg-gray-50 rounded-bl-md border-l border-b border-gray-200"
          >
            <div class="text-xs text-gray-500">{{ codeLanguage }}</div>
          </div>
          <pre
            class="p-4 bg-gray-50 whitespace-pre-wrap overflow-auto max-h-[500px] text-sm font-mono"
            >{{ args.code }}</pre
          >
        </div>
      </div>

      <!-- 结果内容 -->
      <div v-show="activeTab === 'result'" class="p-4">
        <!-- 加载状态 -->
        <div v-if="isLoading" class="py-8 flex flex-col items-center justify-center">
          <div class="code-execution-loader mb-4">
            <div class="relative">
              <div
                class="w-16 h-16 border-4 border-gray-100 border-t-indigo-500 rounded-full animate-spin"
              ></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <UIcon
                  name="i-lucide-terminal"
                  class="w-6 h-6 text-indigo-500"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
          <div class="text-gray-600 mb-2">正在执行代码...</div>
          <div class="text-xs text-gray-500">请稍候，代码正在沙箱环境中运行</div>
        </div>

        <!-- 执行结果 -->
        <div v-else class="space-y-6">
          <!-- 运行时错误 -->
          <div v-if="result?.runtimeError" class="error-panel">
            <div class="flex items-center mb-3">
              <UIcon name="i-lucide-alert-triangle" class="w-5 h-5 text-red-500 mr-2" />
              <div class="font-medium text-red-600">运行时错误</div>
            </div>
            <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
              <pre class="whitespace-pre-wrap text-sm font-mono text-red-700">{{
                result.runtimeError && typeof result.runtimeError === 'object'
                  ? (result.runtimeError as any).message ||
                    JSON.stringify(result.runtimeError, null, 2)
                  : String(result.runtimeError)
              }}</pre>
            </div>
          </div>

          <!-- 日志输出 -->
          <div v-if="result?.logs && Object.keys(result.logs).length > 0" class="logs-panel">
            <div class="flex items-center mb-3">
              <UIcon name="i-lucide-terminal" class="w-5 h-5 text-gray-700 mr-2" />
              <div class="font-medium text-gray-700">控制台输出</div>
            </div>
            <div class="p-4 bg-gray-800 border border-gray-700 rounded-lg text-white">
              <div v-for="(entries, type) in result.logs" :key="type" class="mb-3">
                <div
                  class="font-medium mb-1 text-xs uppercase tracking-wider"
                  :class="{
                    'text-blue-300': type.toString() === 'log',
                    'text-yellow-300': type.toString() === 'warn',
                    'text-red-300': type.toString() === 'error',
                    'text-gray-300': type.toString() === 'info',
                  }"
                >
                  {{ type }}:
                </div>
                <div v-for="(entry, idx) in entries" :key="idx" class="mb-2">
                  <pre class="whitespace-pre-wrap text-sm font-mono">{{ entry }}</pre>
                </div>
              </div>
            </div>
          </div>

          <!-- 返回结果 -->
          <div v-if="result?.results && result.results.length > 0" class="results-panel">
            <div class="flex items-center mb-3">
              <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-green-500 mr-2" />
              <div class="font-medium text-gray-700">返回结果</div>
            </div>
            <div class="space-y-3">
              <div
                v-for="(res, idx) in result.results"
                :key="idx"
                class="p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <pre class="whitespace-pre-wrap text-sm font-mono text-green-800">{{
                  res && typeof res === 'object'
                    ? (res as any).value || JSON.stringify(res, null, 2)
                    : String(res)
                }}</pre>
              </div>
            </div>
          </div>

          <!-- 无结果状态 -->
          <div
            v-if="
              !result?.runtimeError &&
              (!result?.results || result.results.length === 0) &&
              (!result?.logs || Object.keys(result.logs).length === 0)
            "
            class="text-center py-6"
          >
            <UIcon name="i-lucide-check" class="w-12 h-12 text-green-500 mx-auto mb-3" />
            <div class="text-lg font-medium text-gray-700 mb-1">代码执行成功</div>
            <div class="text-gray-500">代码已成功执行，但没有返回任何结果或日志输出</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.code-preview {
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
}

.code-header {
  transition: all 0.2s ease;
}

.code-header:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1.5s linear infinite;
}

/* 代码高亮相关样式 */
.font-mono {
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
    monospace;
}
</style>
