<script setup lang="ts">
import type { SandboxReceiveFileParams, SandboxReceiveFileResult } from '~/libs/tools/types';
import { ref, computed, watch } from 'vue';

const props = defineProps<{
  args: SandboxReceiveFileParams;
  result?: SandboxReceiveFileResult;
}>();

const isLoading = ref(true);

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

// 检查是否为图片文件
const isImage = (filePath: string) => {
  const ext = getFileExtension(filePath);
  const imgExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'];
  return imgExtensions.includes(ext);
};

// 获取文件图标
const getFileIcon = (filePath: string) => {
  const ext = getFileExtension(filePath);

  // 图片文件
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) {
    return 'i-lucide-image';
  }

  // 文本文件
  if (['txt', 'md', 'rtf'].includes(ext)) {
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
    ].includes(ext)
  ) {
    return 'i-lucide-file-code';
  }

  // 数据文件
  if (['csv', 'xml', 'json', 'xls', 'xlsx'].includes(ext)) {
    return 'i-lucide-database';
  }

  // 文档文件
  if (['pdf', 'doc', 'docx', 'ppt', 'pptx'].includes(ext)) {
    return 'i-lucide-file-text';
  }

  // 压缩文件
  if (['zip', 'rar', 'tar', 'gz', '7z'].includes(ext)) {
    return 'i-lucide-archive';
  }

  // 默认文件图标
  return 'i-lucide-file';
};

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
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="file-receive-preview p-4">
    <!-- 文件接收信息头部 -->
    <div
      class="file-header bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6"
    >
      <div class="flex items-center p-4">
        <UIcon
          name="i-lucide-file-down"
          class="w-10 h-10 text-indigo-500 mr-4 p-1 bg-indigo-50 rounded-lg"
          aria-hidden="true"
        ></UIcon>
        <div class="flex-1 min-w-0">
          <div class="text-lg font-medium text-gray-800">文件接收操作</div>
          <div class="flex items-center text-sm text-gray-500 mt-1">
            <div class="flex items-center mr-4">
              <UIcon name="i-lucide-box" class="w-4 h-4 mr-1"></UIcon>
              <span>沙箱 ID: {{ args.sandboxId || 'N/A' }}</span>
            </div>
            <div class="flex items-center">
              <UIcon name="i-lucide-files" class="w-4 h-4 mr-1"></UIcon>
              <span>文件数量: {{ args.entries?.length || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-state py-8 flex flex-col items-center justify-center">
      <div class="file-receive-loader mb-4">
        <div class="relative">
          <div
            class="w-16 h-16 border-4 border-gray-100 border-t-indigo-500 rounded-full animate-spin"
          >
            <UIcon
              name="i-lucide-file-down"
              class="w-6 h-6 text-indigo-500"
              aria-hidden="true"
            ></UIcon>
          </div>
          <div class="absolute inset-0 flex items-center justify-center">
            <UIcon
              name="i-lucide-file-down"
              class="w-6 h-6 text-indigo-500"
              aria-hidden="true"
            ></UIcon>
          </div>
        </div>
      </div>
      <div class="text-gray-600 mb-2">正在接收文件...</div>
      <div class="text-xs text-gray-500">请稍候，文件正在传输到沙箱环境中</div>
    </div>

    <!-- 文件请求信息 -->
    <div
      v-else-if="!result && !isLoading"
      class="file-request bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6"
    >
      <div class="border-b px-4 py-3 bg-gray-50">
        <div class="font-medium text-gray-700">请求的文件</div>
      </div>
      <div class="p-4">
        <div v-if="args.entries && args.entries.length > 0" class="space-y-4">
          <div
            v-for="(file, idx) in args.entries"
            :key="idx"
            class="file-item bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
          >
            <div class="flex items-center mb-3">
              <UIcon :name="getFileIcon(file.filePath)" class="w-5 h-5 text-gray-700 mr-2"></UIcon>
              <div class="font-medium text-gray-800">{{ getFileName(file.filePath) }}</div>
            </div>

            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <div class="text-xs text-gray-500 mb-1">本地文件路径:</div>
                <div
                  class="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono overflow-auto max-h-[100px] break-all"
                >
                  {{ file.filePath }}
                </div>
              </div>

              <div>
                <div class="text-xs text-gray-500 mb-1">沙箱文件路径:</div>
                <div
                  class="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono overflow-auto max-h-[100px] break-all"
                >
                  {{ file.url || '等待处理...' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-6">
          <UIcon name="i-lucide-file-question" class="w-16 h-16 text-gray-300 mx-auto mb-4"></UIcon>
          <div class="text-lg font-medium text-gray-700 mb-2">没有文件</div>
          <div class="text-gray-500">没有提供任何文件信息</div>
        </div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div
      v-else-if="result?.error"
      class="error-state py-6 text-center bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
    >
      <UIcon name="i-lucide-alert-circle" class="w-16 h-16 text-red-500 mx-auto mb-4"></UIcon>
      <div class="text-lg font-medium text-red-600 mb-2">文件接收失败</div>
      <div class="text-gray-600 bg-red-50 p-4 rounded-md mx-auto max-w-lg">
        {{ result.error }}
      </div>
    </div>

    <!-- 成功状态 -->
    <div
      v-else-if="result"
      class="success-state bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
    >
      <div class="border-b px-4 py-3 bg-gray-50 flex items-center">
        <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-green-500 mr-2"></UIcon>
        <div class="font-medium text-gray-700">文件接收成功</div>
      </div>

      <div class="p-4">
        <div v-if="result.results && result.results.length > 0" class="space-y-6">
          <div
            v-for="(file, idx) in result.results"
            :key="idx"
            class="file-result bg-white border border-gray-200 rounded-lg overflow-hidden"
          >
            <!-- 文件信息头部 -->
            <div class="flex items-center p-3 border-b bg-gray-50">
              <UIcon :name="getFileIcon(file.filePath)" class="w-5 h-5 text-gray-700 mr-2"></UIcon>
              <div class="flex-1 min-w-0 font-medium text-gray-800 truncate">
                {{ getFileName(file.filePath) }}
              </div>
              <a
                v-if="file.url"
                :href="file.url"
                target="_blank"
                class="flex items-center text-xs text-indigo-600 hover:text-indigo-800 transition-colors bg-white px-2 py-1 rounded-md border border-indigo-200 hover:border-indigo-400"
              >
                <UIcon name="i-lucide-download" class="w-3.5 h-3.5 mr-1"></UIcon>
                下载文件
              </a>
            </div>

            <!-- 文件路径 -->
            <div class="px-4 py-3 border-b">
              <div class="text-xs text-gray-500 mb-1">文件路径:</div>
              <div class="text-sm text-gray-700 font-mono break-all">{{ file.filePath }}</div>
            </div>

            <!-- 图片预览 -->
            <div v-if="isImage(file.filePath) && file.url" class="p-4 border-b bg-gray-50">
              <div class="text-xs text-gray-500 mb-2">图片预览:</div>
              <div class="flex justify-center">
                <img
                  :src="file.url"
                  class="max-w-full max-h-[300px] border rounded-lg shadow-sm object-contain"
                  alt="文件预览"
                />
              </div>
            </div>

            <!-- 命令结果 -->
            <!-- <div v-if="file.commandResult" class="p-4">
              <div class="text-xs text-gray-500 mb-2">命令结果:</div>
              <pre
                class="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono overflow-auto max-h-[150px]"
                >{{ file.commandResult }}</pre
              >
            </div> -->
          </div>
        </div>

        <!-- 无结果 -->
        <div v-else class="text-center py-6">
          <UIcon name="i-lucide-check" class="w-12 h-12 text-green-500 mx-auto mb-3"></UIcon>
          <div class="text-lg font-medium text-green-700 mb-1">操作成功</div>
          <div class="text-green-600">文件已成功接收，但没有详细结果</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.file-receive-preview {
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

.file-item:hover {
  transform: translateY(-2px);
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

/* 文件内容预览区域 */
pre {
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

/* 文件结果卡片 */
.file-result {
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.file-result:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* 图片预览 */
.file-result img {
  transition: all 0.3s ease;
}

.file-result img:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
