<script setup lang="ts">
import type { SearchWebParams, SearchWebResult } from '~/libs/tools/types';
import { ref, watch } from 'vue';

const props = defineProps<{
  args: SearchWebParams;
  result?: SearchWebResult;
}>();

const isLoading = ref(true);

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
  <div class="search-preview p-4">
    <!-- 搜索框区域 -->
    <div
      class="search-box bg-white rounded-full shadow-md border border-gray-200 flex items-center px-4 py-3 mb-6"
    >
      <div class="search-icon mr-3 flex items-center">
        <UIcon name="i-lucide-search" class="text-gray-400 w-5 h-5" mode="svg"></UIcon>
      </div>
      <div class="flex-1 font-medium text-gray-800">{{ args.query }}</div>
      <div v-if="args.domains && args.domains.length > 0" class="domain-pills flex gap-2">
        <div
          v-for="(domain, idx) in args.domains"
          :key="idx"
          class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
        >
          {{ domain }}
        </div>
      </div>
    </div>

    <!-- 加载动画 -->
    <div v-if="isLoading" class="loading-state">
      <div class="flex flex-col items-center justify-center py-8">
        <div class="search-loader mb-4">
          <div
            class="w-12 h-12 rounded-full border-4 border-gray-200 border-t-primary animate-spin"
          ></div>
        </div>
        <div class="text-gray-500 text-sm">正在搜索互联网...</div>

        <!-- 骨架屏 -->
        <div class="w-full mt-8 space-y-6">
          <div v-for="i in 3" :key="i" class="skeleton-result animate-pulse">
            <div class="h-5 bg-gray-200 rounded-md w-3/4 mb-2"></div>
            <div class="h-4 bg-gray-100 rounded-md w-full mb-1"></div>
            <div class="h-4 bg-gray-100 rounded-md w-5/6"></div>
            <div class="h-3 bg-gray-100 rounded-md w-1/2 mt-2"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div v-else-if="result?.results && result?.results?.length > 0" class="search-results">
      <div class="result-stats text-sm text-gray-500 mb-4">
        找到约 {{ result.results.length }} 条结果
      </div>

      <div
        v-for="(r, idx) in result.results"
        :key="idx"
        class="result-item mb-4 transform transition-all duration-150"
      >
        <div class="bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow">
          <a :href="r.url" target="_blank" class="block">
            <div class="text-primary font-medium text-lg hover:underline mb-1 line-clamp-1">
              {{ r.title }}
            </div>
            <div class="text-sm text-green-700 mb-2 line-clamp-1">{{ r.url }}</div>
            <div class="text-gray-600 text-sm line-clamp-3">{{ r.content }}</div>

            <div class="flex items-center mt-2 text-xs text-gray-500">
              <div class="flex items-center">
                <UIcon name="i-lucide-calendar" class="w-3 h-3 mr-1 -mt-0.5"></UIcon>
                <span>{{ r.publishedDate || '未知日期' }}</span>
              </div>
              <div class="ml-4 flex items-center">
                <UIcon name="i-lucide-bar-chart-2" class="w-3 h-3 mr-1"></UIcon>
                <span>相关度 {{ Math.round(r.score * 100) }}%</span>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>

    <!-- 无结果 -->
    <div
      v-else-if="result && (!result.results || result.results.length === 0)"
      class="no-results py-8 text-center"
    >
      <UIcon name="i-lucide-search-x" class="text-gray-400 w-16 h-16 mx-auto mb-4"></UIcon>
      <div class="text-lg font-medium text-gray-700 mb-2">未找到相关结果</div>
      <div class="text-gray-500">尝试使用不同的关键词或更广泛的搜索范围</div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="result?.error" class="error-state py-8 text-center">
      <UIcon name="i-lucide-alert-circle" class="text-red-500 w-16 h-16 mx-auto mb-4"></UIcon>
      <div class="text-lg font-medium text-red-600 mb-2">搜索出错</div>
      <div class="text-gray-600 bg-red-50 p-3 rounded-md inline-block">{{ result.error }}</div>
    </div>
  </div>
</template>

<style scoped>
.search-preview {
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
}

.search-box {
  transition: all 0.2s ease;
}

.search-box:hover {
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
</style>
