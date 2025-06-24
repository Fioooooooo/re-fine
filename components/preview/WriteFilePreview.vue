<script setup lang="ts">
import type { SandboxWriteFileParams, SandboxWriteFileResult } from '~/libs/tools/types';
import { ref, computed, watch } from 'vue';

const props = defineProps<{
  args: SandboxWriteFileParams;
  result?: SandboxWriteFileResult;
}>();

const isLoading = ref(true);
const activeTab = ref('files'); // 'files' | 'result'

// 获取第一个文件的内容（用于展示）
const firstEntry = computed(() => {
  return props.args.entries && props.args.entries.length > 0 ? props.args.entries[0] : null;
});

// 截断内容以便于显示
const truncatedContent = computed(() => {
  if (firstEntry.value?.content && firstEntry.value.content.length > 1000) {
    return firstEntry.value.content.substring(0, 1000) + '...';
  }
  return firstEntry.value?.content || '';
});

// 文件数量
const fileCount = computed(() => props.args.entries?.length || 0);

// 获取文件扩展名
const getFileExtension = (filePath: string) => {
  const parts = filePath.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
};

// 获取文件名
const getFileName = (filePath: string) => {
  const parts = filePath.split('/');
  return parts[parts.length - 1];
};

// 获取第一个文件的扩展名
const firstFileExtension = computed(() => {
  if (!firstEntry.value?.filePath) return '';
  return getFileExtension(firstEntry.value.filePath);
});

// 获取第一个文件的文件名
const firstFileName = computed(() => {
  if (!firstEntry.value?.filePath) return '';
  return getFileName(firstEntry.value.filePath);
});

// 获取文件图标
const getFileIcon = (extension: string) => {
  // 图片文件
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(extension)) {
    return 'i-lucide-image';
  }

  // 文本文件
  if (['txt', 'md'].includes(extension)) {
    return 'i-lucide-file-text';
  }

  // 代码文件
  if (
    [
      'js',
      'ts',
      'html',
      'css',
      'json',
      'py',
      'java',
      'c',
      'cpp',
      'h',
      'sh',
      'yaml',
      'yml',
    ].includes(extension)
  ) {
    return 'i-lucide-file-code';
  }

  // 数据文件
  if (['csv', 'xml', 'json'].includes(extension)) {
    return 'i-lucide-database';
  }

  // 默认文件图标
  return 'i-lucide-file';
};

// 获取第一个文件的图标
const firstFileIcon = computed(() => {
  return getFileIcon(firstFileExtension.value);
});

// 判断结果状态
const resultStatus = computed(() => {
  if (!props.result) return 'pending';
  if (props.result.error) return 'error';
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
  <div class="file-write-preview p-4">
    <!-- 文件写入信息头部 -->
    <div
      class="file-header bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6"
    >
      <div class="flex items-center p-4">
        <UIcon
          name="i-lucide-file-plus"
          class="w-10 h-10 text-teal-500 mr-4 p-1 bg-teal-50 rounded-lg"
          aria-hidden="true"
          mode="svg"
        ></UIcon>
        <div class="flex-1 min-w-0">
          <div class="text-lg font-medium text-gray-800">文件写入操作</div>
          <div class="flex items-center text-sm text-gray-500 mt-1">
            <div class="flex items-center mr-4">
              <UIcon name="i-lucide-box" class="w-4 h-4 mr-1"></UIcon>
              <span>沙箱 ID: {{ args.sandboxId || 'N/A' }}</span>
            </div>
            <div class="flex items-center">
              <UIcon name="i-lucide-files" class="w-4 h-4 mr-1"></UIcon>
              <span>文件数量: {{ fileCount }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 文件和结果标签页 -->
    <div
      class="file-container bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden"
    >
      <!-- 标签切换 -->
      <div class="flex border-b">
        <button
          @click="activeTab = 'files'"
          :class="[
            'flex items-center px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'files'
              ? 'text-teal-600 border-b-2 border-teal-500'
              : 'text-gray-600 hover:text-teal-500',
          ]"
        >
          <UIcon name="i-lucide-files" class="w-4 h-4 mr-2"></UIcon>
          文件内容
        </button>
        <button
          @click="activeTab = 'result'"
          :class="[
            'flex items-center px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'result'
              ? 'text-teal-600 border-b-2 border-teal-500'
              : 'text-gray-600 hover:text-teal-500',
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
          />
          写入结果
        </button>
      </div>

      <!-- 文件内容标签页 -->
      <div v-show="activeTab === 'files'" class="p-4">
        <!-- 主文件内容 -->
        <div v-if="firstEntry" class="mb-6">
          <div class="flex items-center mb-3">
            <UIcon :name="firstFileIcon" class="w-5 h-5 text-gray-700 mr-2" />
            <div class="font-medium text-gray-800">{{ firstFileName }}</div>
          </div>

          <div class="file-path mb-2 flex items-center text-xs text-gray-500">
            <UIcon name="i-lucide-folder" class="w-4 h-4 mr-1" />
            <div class="truncate">{{ firstEntry.filePath }}</div>
          </div>

          <div class="file-content-preview">
            <pre
              class="p-4 bg-gray-50 border border-gray-200 rounded-lg whitespace-pre-wrap overflow-auto max-h-[300px] text-sm font-mono"
              >{{ truncatedContent }}</pre
            >
          </div>
        </div>

        <!-- 其他文件列表 -->
        <div v-if="fileCount > 1" class="other-files">
          <div class="flex items-center mb-3">
            <UIcon name="i-lucide-list" class="w-5 h-5 text-gray-700 mr-2" />
            <div class="font-medium text-gray-800">其他文件 ({{ fileCount - 1 }})</div>
          </div>

          <div class="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
            <div
              v-for="(entry, index) in args.entries.slice(1)"
              :key="index"
              class="file-item p-3 border-b last:border-b-0 hover:bg-gray-100 transition-colors"
            >
              <div class="flex items-center">
                <div
                  :class="[
                    getFileIcon(getFileExtension(entry.filePath)),
                    'w-5 h-5 text-gray-600 mr-2',
                  ]"
                ></div>
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-sm truncate">{{ getFileName(entry.filePath) }}</div>
                  <div class="text-xs text-gray-500 truncate">{{ entry.filePath }}</div>
                </div>
                <div class="text-xs text-gray-500 whitespace-nowrap">
                  {{ entry.content.length }} 字符
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 无文件状态 -->
        <div v-if="fileCount === 0" class="no-files py-8 text-center">
          <UIcon name="i-lucide-file-question" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <div class="text-lg font-medium text-gray-700 mb-2">没有文件</div>
          <div class="text-gray-500">没有提供任何文件内容</div>
        </div>
      </div>

      <!-- 结果内容标签页 -->
      <div v-show="activeTab === 'result'" class="p-4">
        <!-- 加载状态 -->
        <div v-if="isLoading" class="py-8 flex flex-col items-center justify-center">
          <div class="file-write-loader mb-4">
            <div class="relative">
              <div
                class="w-16 h-16 border-4 border-gray-100 border-t-teal-500 rounded-full animate-spin"
              ></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <UIcon name="i-lucide-file-plus" class="w-6 h-6 text-teal-500" aria-hidden="true" />
              </div>
            </div>
          </div>
          <div class="text-gray-600 mb-2">正在写入文件...</div>
          <div class="text-xs text-gray-500">请稍候，文件正在写入沙箱环境中</div>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="result?.error" class="error-state py-6 text-center">
          <UIcon name="i-lucide-alert-circle" class="w-16 h-16 text-red-500 mx-auto mb-4" />
          <div class="text-lg font-medium text-red-600 mb-2">写入失败</div>
          <div class="text-gray-600 bg-red-50 p-4 rounded-md inline-block">
            {{ result.error }}
          </div>
        </div>

        <!-- 成功状态 -->
        <div v-else-if="result" class="success-state">
          <!-- 成功标题 -->
          <div class="flex items-center mb-4">
            <UIcon name="i-lucide-check-circle" class="w-6 h-6 text-green-500 mr-2" />
            <div class="text-lg font-medium text-gray-800">文件写入成功</div>
          </div>

          <!-- 文件信息 -->
          <div
            v-if="result.entryInfo && result.entryInfo.length > 0"
            class="file-info-list space-y-3"
          >
            <div
              v-for="(entry, idx) in result.entryInfo"
              :key="idx"
              class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div class="flex items-center mb-2">
                <UIcon name="i-lucide-file-check" class="w-5 h-5 text-green-500 mr-2" />
                <div class="font-medium truncate">{{ getFileName(entry.path) }}</div>
              </div>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div class="flex items-center">
                  <div class="text-gray-500 mr-2">路径:</div>
                  <div class="text-gray-700 truncate">{{ entry.path }}</div>
                </div>
                <div class="flex items-center">
                  <div class="text-gray-500 mr-2">类型:</div>
                  <div class="text-gray-700">
                    <span class="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                      {{ entry.type }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 无详细信息 -->
          <div v-else class="text-center py-6 bg-green-50 rounded-lg border border-green-200">
            <UIcon name="i-lucide-check" class="w-12 h-12 text-green-500 mx-auto mb-3" />
            <div class="text-lg font-medium text-green-700 mb-1">操作成功</div>
            <div class="text-green-600">所有文件已成功写入</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.file-write-preview {
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
}

/* 文件项目悬停效果 */
.file-item {
  transition: all 0.2s ease;
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

/* 标签页切换动画 */
.file-container > div {
  animation: fadeIn 0.3s ease;
}

/* 文件内容预览区域 */
.file-content-preview pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  line-height: 1.5;
  tab-size: 2;
}

/* 文件路径溢出处理 */
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 文件信息卡片动画 */
.file-info-list > div {
  transition: all 0.2s ease;
}

.file-info-list > div:hover {
  transform: translateY(-2px);
}
</style>
