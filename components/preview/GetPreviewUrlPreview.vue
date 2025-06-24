<script setup lang="ts">
import type { SandboxPreviewParams, SandboxPreviewResult } from '~/libs/tools/types';
import { ref, computed, watch } from 'vue';

const props = defineProps<{
  args: SandboxPreviewParams;
  result?: SandboxPreviewResult;
}>();

const isLoading = ref(true);
const iframeLoaded = ref(false);
const showFullscreen = ref(false);

// 判断结果状态
const resultStatus = computed(() => {
  if (!props.result) return 'pending';
  if (props.result.error) return 'error';
  return 'success';
});

// 格式化URL（移除末尾的斜杠）
const formattedUrl = computed(() => {
  if (!props.result?.previewUrl) return '';
  return props.result.previewUrl.replace(/\/$/, '');
});

// 处理iframe加载完成
const handleIframeLoad = () => {
  iframeLoaded.value = true;
};

// 切换全屏预览
const toggleFullscreen = () => {
  showFullscreen.value = !showFullscreen.value;
};

// 监听结果变化
watch(
  () => props.result,
  newVal => {
    if (newVal) {
      isLoading.value = false;
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="preview-url-container p-4">
    <!-- 预览信息头部 -->
    <div
      class="preview-header bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6"
    >
      <div class="flex items-center p-4">
        <UIcon
          name="i-lucide-globe"
          class="w-10 h-10 text-purple-500 mr-4 p-1 bg-purple-50 rounded-lg"
          aria-hidden="true"
          mode="svg"
        ></UIcon>
        <div class="flex-1 min-w-0">
          <div class="text-lg font-medium text-gray-800">沙箱应用预览</div>
          <div class="flex flex-wrap items-center text-sm text-gray-500 mt-1">
            <div class="flex items-center mr-4">
              <UIcon name="i-lucide-box" class="w-4 h-4 mr-1"></UIcon>
              <span>沙箱 ID: {{ args.sandboxId || 'N/A' }}</span>
            </div>
            <div class="flex items-center">
              <UIcon name="i-lucide-network" class="w-4 h-4 mr-1"></UIcon>
              <span>端口: {{ args.port }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-state py-8 flex flex-col items-center justify-center">
      <div class="preview-loader mb-4">
        <div class="relative">
          <div
            class="w-16 h-16 border-4 border-gray-100 border-t-purple-500 rounded-full animate-spin"
          ></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <UIcon name="i-lucide-globe" class="w-6 h-6 text-purple-500" aria-hidden="true"></UIcon>
          </div>
        </div>
      </div>
      <div class="text-gray-600 mb-2">正在生成预览 URL...</div>
      <div class="text-xs text-gray-500">请稍候，正在为沙箱应用创建预览链接</div>
    </div>

    <!-- 错误状态 -->
    <div
      v-else-if="result?.error"
      class="error-state py-6 text-center bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
    >
      <UIcon name="i-lucide-alert-circle" class="w-16 h-16 text-red-500 mx-auto mb-4"></UIcon>
      <div class="text-lg font-medium text-red-600 mb-2">生成预览失败</div>
      <div class="text-gray-600 bg-red-50 p-4 rounded-md mx-auto max-w-lg">
        {{ result.error }}
      </div>
    </div>

    <!-- 成功状态 -->
    <div v-else-if="result?.previewUrl" class="success-state">
      <!-- URL信息卡片 -->
      <div
        class="url-card bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6"
      >
        <div class="border-b px-4 py-3 bg-gray-50 flex items-center">
          <UIcon name="i-lucide-link" class="w-5 h-5 text-purple-500 mr-2"></UIcon>
          <div class="font-medium text-gray-700">预览 URL</div>
        </div>

        <div class="p-4">
          <div
            class="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition-colors"
          >
            <UIcon name="i-lucide-globe" class="w-5 h-5 text-gray-500 mr-3 flex-shrink-0"></UIcon>
            <div class="flex-1 min-w-0 font-mono text-sm text-gray-700 truncate">
              {{ formattedUrl }}
            </div>
            <a
              :href="formattedUrl"
              target="_blank"
              class="ml-3 flex items-center text-xs text-purple-600 hover:text-purple-800 transition-colors bg-white px-2 py-1 rounded-md border border-purple-200 hover:border-purple-400"
            >
              <UIcon name="i-lucide-external-link" class="w-3.5 h-3.5 mr-1"></UIcon>
              打开
            </a>
          </div>

          <div class="flex justify-center mt-4">
            <UButton
              icon="i-lucide-external-link"
              color="primary"
              :to="formattedUrl"
              target="_blank"
              class="mr-2"
            >
              在新窗口中打开
            </UButton>

            <UButton
              :icon="showFullscreen ? 'i-lucide-minimize-2' : 'i-lucide-maximize-2'"
              color="secondary"
              @click="toggleFullscreen"
            >
              {{ showFullscreen ? '退出全屏' : '全屏预览' }}
            </UButton>
          </div>
        </div>
      </div>

      <!-- 应用预览 -->
      <div
        class="preview-frame bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden transition-all duration-300"
        :class="{ 'fixed inset-0 z-50 rounded-none': showFullscreen }"
      >
        <div class="border-b px-4 py-3 bg-gray-50 flex items-center justify-between">
          <div class="flex items-center">
            <UIcon name="i-lucide-layout" class="w-5 h-5 text-purple-500 mr-2"></UIcon>
            <div class="font-medium text-gray-700">应用预览</div>
          </div>

          <div v-if="showFullscreen" class="flex items-center">
            <button
              @click="toggleFullscreen"
              class="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <UIcon name="i-lucide-x" class="w-5 h-5"></UIcon>
            </button>
          </div>
        </div>

        <!-- 加载中提示 -->
        <div v-if="!iframeLoaded" class="relative">
          <div
            class="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-80 z-10"
          >
            <div class="flex flex-col items-center">
              <div
                class="w-10 h-10 border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin mb-3"
              ></div>
              <div class="text-sm text-gray-600">加载应用中...</div>
            </div>
          </div>
        </div>

        <!-- iframe预览 -->
        <iframe
          :src="formattedUrl"
          class="w-full border-0 transition-all duration-300"
          :class="showFullscreen ? 'h-[calc(100vh-56px)]' : 'h-[400px]'"
          title="沙箱应用预览"
          @load="handleIframeLoad"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<style scoped>
.preview-url-container {
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
}

/* 加载动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1.5s linear infinite;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 预览框架动画效果 */
.preview-frame {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 全屏模式下的预览框架 */
.preview-frame.fixed {
  animation: fadeIn 0.2s ease;
}

/* URL卡片悬停效果 */
.url-card {
  transition: all 0.2s ease;
}

.url-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* 文本溢出处理 */
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 按钮过渡效果 */
button {
  transition: all 0.2s ease;
}
</style>
