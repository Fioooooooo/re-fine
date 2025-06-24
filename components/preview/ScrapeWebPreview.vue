<script setup lang="ts">
import type { ScrapeWebParams, ScrapeWebResult } from '~/libs/tools/types';
import { ref, watch, computed } from 'vue';

const props = defineProps<{
  args: ScrapeWebParams;
  result?: ScrapeWebResult;
}>();

const isLoading = ref(true);
const contentPreviewLength = ref(300);
const showFullContent = ref(false);

// 计算截断的内容预览
const contentPreview = computed(() => {
  if (!props.result?.content) return '';

  const content =
    typeof props.result.content === 'string'
      ? props.result.content
      : props.result.content.join('\n');

  if (showFullContent.value) return content;

  return content.length > contentPreviewLength.value
    ? `${content.substring(0, contentPreviewLength.value)}...`
    : content;
});

// 计算内容类型图标
const contentTypeIcon = computed(() => {
  const contentType = props.result?.metadata?.contentType || '';

  if (contentType.includes('html')) return 'i-lucide-file-code';
  if (contentType.includes('json')) return 'i-lucide-braces';
  if (contentType.includes('text')) return 'i-lucide-file-text';
  if (contentType.includes('image')) return 'i-lucide-image';

  return 'i-lucide-file';
});

watch(
  () => props.result,
  newVal => {
    if (newVal) {
      isLoading.value = false;
    }
  },
  { immediate: true }
);

function toggleFullContent() {
  showFullContent.value = !showFullContent.value;
}
</script>

<template>
  <div class="scrape-preview p-4">
    <!-- 网页信息卡片 -->
    <div
      class="website-card bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6"
    >
      <div class="website-header bg-gray-50 p-4 flex items-center">
        <div class="website-icon mr-3 bg-gray-100 rounded-lg p-2">
          <UIcon name="i-lucide-globe" class="w-6 h-6 text-gray-600" mode="svg"></UIcon>
        </div>
        <div class="flex-1 overflow-hidden">
          <div class="text-lg font-medium text-gray-800 truncate">{{ args.url }}</div>
          <div class="flex items-center text-xs text-gray-500 mt-1">
            <UIcon name="i-lucide-settings" class="w-3 h-3 mr-1"></UIcon>
            <span>清洗 HTML: {{ args.cleanHtml ? '是' : '否' }}</span>
          </div>
        </div>
        <a
          :href="args.url"
          target="_blank"
          class="ml-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          <UIcon name="i-lucide-external-link" class="w-5 h-5 text-gray-500"></UIcon>
        </a>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-state">
      <div class="flex flex-col items-center justify-center py-12">
        <div class="relative">
          <div
            class="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"
          ></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <UIcon name="i-lucide-download" class="w-6 h-6 text-blue-500 animate-pulse"></UIcon>
          </div>
        </div>
        <div class="mt-4 text-gray-600">正在抓取网页内容...</div>

        <!-- 进度指示器 -->
        <div class="w-64 h-2 bg-gray-200 rounded-full mt-6 overflow-hidden">
          <div class="h-full bg-blue-500 rounded-full animate-progress"></div>
        </div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div
      v-else-if="result?.error"
      class="error-state bg-white rounded-lg border border-red-200 p-6 text-center"
    >
      <UIcon name="i-lucide-x-circle" class="w-16 h-16 text-red-500 mx-auto mb-4"></UIcon>
      <div class="text-lg font-medium text-red-600 mb-2">抓取失败</div>
      <div class="text-gray-600 bg-red-50 p-4 rounded-md inline-block">
        {{ result.error.message }}
      </div>
      <div class="mt-6 text-sm text-gray-500">
        <UIcon name="i-lucide-info" class="w-4 h-4 inline-block mr-1 align-text-bottom"></UIcon>
        请检查 URL 是否正确或尝试稍后再试
      </div>
    </div>

    <!-- 结果显示 -->
    <div v-else-if="result" class="result-state">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <!-- 标题卡片 -->
        <div
          class="info-card bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div class="flex items-center mb-2">
            <UIcon name="i-lucide-heading-1" class="w-5 h-5 text-blue-500 mr-2"></UIcon>
            <div class="font-medium text-gray-700">网页标题</div>
          </div>
          <div class="text-gray-800 font-medium">{{ result.metadata.title || '无标题' }}</div>
        </div>

        <!-- URL卡片 -->
        <div
          class="info-card bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div class="flex items-center mb-2">
            <UIcon name="i-lucide-link" class="w-5 h-5 text-blue-500 mr-2"></UIcon>
            <div class="font-medium text-gray-700">最终 URL</div>
          </div>
          <a
            :href="result.metadata.url"
            target="_blank"
            class="text-blue-500 hover:underline truncate block"
          >
            {{ result.metadata.url }}
          </a>
        </div>

        <!-- 时间戳卡片 -->
        <div
          class="info-card bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div class="flex items-center mb-2">
            <UIcon name="i-lucide-clock" class="w-5 h-5 text-blue-500 mr-2"></UIcon>
            <div class="font-medium text-gray-700">抓取时间</div>
          </div>
          <div class="text-gray-800">
            {{ new Date(parseInt(result.metadata.timestamp)).toLocaleString() }}
          </div>
        </div>

        <!-- 内容类型卡片 -->
        <div
          class="info-card bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div class="flex items-center mb-2">
            <UIcon :name="contentTypeIcon" class="w-5 h-5 text-blue-500 mr-2"></UIcon>
            <div class="font-medium text-gray-700">内容类型</div>
          </div>
          <div class="text-gray-800">{{ result.metadata.contentType || '未知' }}</div>
        </div>
      </div>

      <!-- 内容显示区域 -->
      <div
        class="content-card bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden"
      >
        <div class="flex items-center justify-between bg-gray-50 px-4 py-3 border-b">
          <div class="flex items-center">
            <UIcon name="i-lucide-file-text" class="w-5 h-5 text-gray-600 mr-2"></UIcon>
            <div class="font-medium text-gray-700">网页内容</div>
          </div>
          <button
            v-if="
              typeof result.content === 'string' && result.content.length > contentPreviewLength
            "
            @click="toggleFullContent"
            class="text-xs text-blue-500 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
          >
            {{ showFullContent ? '收起' : '显示全部' }}
          </button>
        </div>

        <div class="p-4 content-area">
          <div v-if="args.cleanHtml" class="prose max-w-none" v-html="contentPreview"></div>
          <pre
            v-else
            class="whitespace-pre-wrap overflow-auto max-h-[500px] text-sm bg-gray-50 p-4 rounded-md"
            >{{ contentPreview }}</pre
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrape-preview {
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
}

.website-card {
  transition: all 0.2s ease;
}

.website-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.info-card {
  transition: all 0.2s ease;
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

@keyframes progress {
  0% {
    width: 0%;
    opacity: 1;
  }
  50% {
    width: 70%;
    opacity: 0.8;
  }
  70% {
    width: 76%;
    opacity: 0.7;
  }
  80% {
    width: 80%;
    opacity: 0.6;
  }
  95% {
    width: 85%;
    opacity: 0.5;
  }
  100% {
    width: 90%;
    opacity: 0.4;
  }
}

.animate-progress {
  animation: progress 3s ease-out forwards;
}

.content-area {
  max-height: 600px;
  overflow: auto;
}
</style>
