<script setup lang="ts">
import type { SandboxRunCommandParams, SandboxRunCommandResult } from '~/libs/tools/types';
import { ref, onMounted, watch } from 'vue';

const props = defineProps<{
  args: SandboxRunCommandParams;
  result?: SandboxRunCommandResult;
}>();

const isLoading = ref(true);
const cursorBlinking = ref(true);

// 模拟终端光标闪烁效果
let cursorInterval: NodeJS.Timeout;

onMounted(() => {
  cursorInterval = setInterval(() => {
    cursorBlinking.value = !cursorBlinking.value;
  }, 500);
});

watch(() => props.result, (newVal) => {
  if (newVal) {
    isLoading.value = false;
    clearInterval(cursorInterval);
    cursorBlinking.value = true;
  }
}, { immediate: true });
</script>

<template>
  <div class="p-4">
    <!-- 终端窗口样式 -->
    <div class="terminal-window rounded-lg overflow-hidden border border-gray-200 shadow-md">
      <!-- 终端标题栏 -->
      <div class="terminal-header flex items-center px-4 py-2 bg-gray-800 text-white">
        <div class="flex space-x-2 mr-4">
          <div class="w-3 h-3 rounded-full bg-red-500"></div>
          <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div class="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div class="flex-1 text-center text-sm font-mono">{{ args.sandboxId || 'Terminal' }}</div>
        <div class="text-xs">bash</div>
      </div>
      
      <!-- 终端内容区域 -->
      <div class="terminal-body bg-gray-900 text-gray-200 p-4 font-mono text-sm overflow-auto max-h-[500px]">
        <!-- 命令提示符和命令 -->
        <div class="flex">
          <span class="text-green-400 mr-2">$</span>
          <span class="text-white">{{ args.command }}</span>
        </div>
        
        <!-- 加载动画 -->
        <div v-if="isLoading" class="my-2 flex items-center">
          <div class="loading-dots flex space-x-1">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-100"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-200"></div>
          </div>
          <span class="ml-2 text-gray-400 text-xs">执行中...</span>
          <span :class="{'opacity-0': !cursorBlinking}" class="ml-1 transition-opacity duration-100">_</span>
        </div>
        
        <!-- 执行结果 -->
        <div v-if="result" class="mt-2">
          <!-- 错误信息 -->
          <div v-if="result.error" class="text-red-400 mb-2 border-l-2 border-red-500 pl-2">
            <div class="font-bold">Error:</div>
            <pre class="whitespace-pre-wrap">{{ result.error }}</pre>
          </div>
          
          <!-- 标准输出 -->
          <div v-if="result.stdout" class="mb-2 text-gray-300">
            <pre class="whitespace-pre-wrap">{{ result.stdout }}</pre>
          </div>
          
          <!-- 标准错误 -->
          <div v-if="result.stderr" class="mb-2 text-red-400">
            <pre class="whitespace-pre-wrap">{{ result.stderr }}</pre>
          </div>
          
          <!-- 退出码 -->
          <div class="text-xs">
            <span class="text-gray-500">Exit code:</span>
            <span :class="{ 'text-red-400': result.exitCode !== 0, 'text-green-400': result.exitCode === 0 }">
              {{ result.exitCode }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.terminal-window {
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
}

.delay-100 {
  animation-delay: 100ms;
}

.delay-200 {
  animation-delay: 200ms;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

.animate-pulse {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
