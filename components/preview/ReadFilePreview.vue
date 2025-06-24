<script setup lang="ts">
import type { SandboxReadFileParams, SandboxReadFileResult } from '~/libs/tools/types';
import { ref, computed, watch } from 'vue';

const props = defineProps<{
  args: SandboxReadFileParams;
  result?: SandboxReadFileResult;
}>();

const isLoading = ref(true);

// 获取文件扩展名，同时处理隐藏文件（如 .bashrc）
const getFileExtension = (filePath: string) => {
  const fileName = filePath.split('/').pop() || '';

  // 处理隐藏文件（以点开头的文件）
  if (fileName.startsWith('.') && !fileName.includes('.', 1)) {
    return fileName.substring(1).toLowerCase();
  }

  // 常规文件处理
  const parts = fileName.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
};

const getFileName = (filePath: string) => {
  const parts = filePath.split('/');
  return parts[parts.length - 1];
};

const fileName = computed(() => getFileName(props.args.filePath));
const fileExtension = computed(() => getFileExtension(props.args.filePath));

// 获取文件图标
const fileIcon = computed(() => {
  const ext = fileExtension.value;

  // 图片文件
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) {
    return 'i-lucide-image';
  }

  // 文本文件
  if (['txt', 'md'].includes(ext)) {
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
  if (['csv', 'xml', 'json'].includes(ext)) {
    return 'i-lucide-database';
  }

  // PDF
  if (ext === 'pdf') {
    return 'i-lucide-file-type';
  }

  // 压缩文件
  if (['zip', 'rar', 'tar', 'gz', '7z'].includes(ext)) {
    return 'i-lucide-archive';
  }

  // 默认文件图标
  return 'i-lucide-file';
});

const isImage = computed(() => {
  const imgExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'];
  return imgExtensions.includes(fileExtension.value);
});

// 根据 MIME 类型判断是否为文本文件
const isText = computed(() => {
  // 如果有 MIME 类型，优先使用 MIME 类型判断
  if (props.result?.mimeType) {
    const mimeType = props.result.mimeType.toLowerCase();

    // 文本类型的 MIME 前缀
    const textMimeTypes = [
      'text/', // 所有文本类型
      'application/json', // JSON
      'application/xml', // XML
      'application/javascript', // JavaScript
      'application/typescript', // TypeScript
      'application/x-sh', // Shell 脚本
      'application/x-yaml', // YAML
      'application/x-toml', // TOML
    ];

    // 检查是否为文本类型的 MIME
    if (textMimeTypes.some(type => mimeType.startsWith(type))) {
      return true;
    }
  }

  // 如果没有 MIME 类型或不是文本 MIME 类型，回退到扩展名判断
  const textExtensions = [
    'txt',
    'md',
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
    'xml',
    'csv',
    'ini',
    'conf',
    'config',
    'toml',
    'properties',
    'rc',
    'jsx',
    'tsx',
    'vue',
    'svelte',
    'scss',
    'sass',
    'less',
    'php',
    'rb',
    'go',
    'rs',
    'lua',
    'pl',
    'sql',
    'bat',
    'ps1',
    'gitignore',
    'env',
  ];

  // 1. 检查已知的文本文件扩展名
  // 2. 对于隐藏文件（以点开头），默认视为文本配置文件
  return textExtensions.includes(fileExtension.value) || props.args.filePath.startsWith('.');
});

// 获取语法高亮类型
const syntaxType = computed(() => {
  // 1. 首先尝试从 MIME 类型判断
  if (props.result?.mimeType) {
    const mimeType = props.result.mimeType.toLowerCase();

    // MIME 类型到语法高亮的映射
    const mimeSyntaxMap: Record<string, string> = {
      'text/html': 'html',
      'text/css': 'css',
      'text/javascript': 'javascript',
      'application/javascript': 'javascript',
      'application/typescript': 'typescript',
      'application/json': 'json',
      'application/xml': 'xml',
      'text/xml': 'xml',
      'text/markdown': 'markdown',
      'text/x-python': 'python',
      'text/x-java': 'java',
      'text/x-c': 'c',
      'text/x-c++': 'cpp',
      'text/x-sh': 'bash',
      'application/x-sh': 'bash',
      'text/x-yaml': 'yaml',
      'application/x-yaml': 'yaml',
      'text/plain': 'plaintext',
    };

    // 尝试精确匹配
    if (mimeSyntaxMap[mimeType]) {
      return mimeSyntaxMap[mimeType];
    }

    // 尝试前缀匹配
    for (const [mimePrefix, syntax] of Object.entries(mimeSyntaxMap)) {
      if (mimeType.startsWith(mimePrefix)) {
        return syntax;
      }
    }
  }

  // 2. 如果 MIME 类型无法确定语法，尝试通过文件内容判断
  const ext = fileExtension.value;
  const fileName = props.args.filePath.split('/').pop() || '';

  // 根据文件内容判断类型（作为备选方案）
  const detectSyntaxByContent = (): string | null => {
    if (!props.result?.content) return null;
    const content = props.result.content.trim();

    // 检测 JSON 格式
    if (
      (content.startsWith('{') && content.endsWith('}')) ||
      (content.startsWith('[') && content.endsWith(']'))
    ) {
      try {
        JSON.parse(content);
        return 'json';
      } catch (e) {
        // 不是有效的 JSON
      }
    }

    // 检测 YAML 格式
    if (content.match(/^[\s]*([\w\s]+):[\s]*.*$/m)) {
      return 'yaml';
    }

    // 检测 Shell 脚本
    if (content.match(/^#![\s]*\/bin\/(?:ba|z|k|c)?sh/)) {
      return 'bash';
    }

    // 检测 HTML
    if (content.match(/<!DOCTYPE html>|<html[\s>]|<body[\s>]/i)) {
      return 'html';
    }

    return null;
  };

  // 尝试通过内容检测语法
  const contentSyntax = detectSyntaxByContent();
  if (contentSyntax) return contentSyntax;
  // 配置文件映射表 - 按文件名匹配
  const configFilePatterns: Record<string, string> = {
    // 常见配置文件类型
    rc$: 'bash', // 以 rc 结尾的文件通常是 shell 配置
    ignore$: 'plaintext', // 如 .gitignore, .npmignore 等
    config$: 'yaml', // 通常是 yaml 或 ini 格式
    conf$: 'ini', // 配置文件
    prettier: 'json', // prettier 配置通常是 JSON
    eslint: 'json', // eslint 配置通常是 JSON
    babel: 'json', // babel 配置通常是 JSON
    tsconfig: 'json', // TypeScript 配置
    'package.json': 'json', // npm 包配置
    dockerfile: 'dockerfile', // Docker 配置
    makefile: 'makefile', // Make 构建文件
    env: 'plaintext', // 环境变量文件
  };

  // 特定配置文件映射
  const specificConfigFiles: Record<string, string> = {
    '.bashrc': 'bash',
    '.zshrc': 'bash',
    '.gitconfig': 'gitconfig',
    '.gitignore': 'gitignore',
    '.prettierrc': 'json',
    '.eslintrc': 'json',
    '.babelrc': 'json',
    '.env': 'plaintext',
    Dockerfile: 'dockerfile',
    'docker-compose.yml': 'yaml',
    Makefile: 'makefile',
  };

  // 扩展名映射表
  const syntaxMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    html: 'html',
    css: 'css',
    json: 'json',
    md: 'markdown',
    yml: 'yaml',
    yaml: 'yaml',
    sh: 'bash',
    php: 'php',
    rb: 'ruby',
    go: 'go',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    cs: 'csharp',
    vue: 'vue',
    svelte: 'svelte',
  };

  // 1. 检查是否为特定配置文件
  if (specificConfigFiles[fileName]) {
    return specificConfigFiles[fileName];
  }

  // 2. 处理隐藏文件（以点开头）
  if (fileName.startsWith('.')) {
    // 如果隐藏文件有扩展名，按扩展名处理
    if (ext && syntaxMap[ext]) {
      return syntaxMap[ext];
    }

    // 对于没有扩展名的隐藏文件，默认使用 bash 高亮
    if (!fileName.includes('.', 1)) {
      return 'bash';
    }
  }

  // 3. 按扩展名处理
  return syntaxMap[ext] || 'plaintext';
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
</script>

<template>
  <div class="file-preview p-4">
    <!-- 文件信息头部 -->
    <div
      class="file-header bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6"
    >
      <div class="flex items-center p-4">
        <UIcon
          :name="fileIcon"
          class="w-10 h-10 text-blue-500 mr-4 p-1 bg-blue-50 rounded-lg"
          aria-hidden="true"
          mode="svg"
        />
        <div class="flex-1 min-w-0">
          <div class="text-lg font-medium text-gray-800 truncate">{{ fileName }}</div>
          <div class="flex items-center text-sm text-gray-500 mt-1">
            <div class="flex items-center mr-4">
              <UIcon name="i-lucide-folder" class="w-4 h-4 mr-1"></UIcon>
              <span class="truncate max-w-[200px]">{{ args.filePath }}</span>
            </div>
            <div v-if="fileExtension" class="flex items-center">
              <UIcon name="i-lucide-file-type" class="w-4 h-4 mr-1"></UIcon>
              <span class="uppercase">{{ fileExtension }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div
      v-if="isLoading"
      class="loading-state bg-white rounded-lg border border-gray-200 p-8 text-center"
    >
      <div class="flex flex-col items-center justify-center">
        <div class="file-loader mb-4">
          <div class="relative">
            <div
              class="w-16 h-16 border-4 border-gray-100 border-t-blue-500 rounded-full animate-spin"
            ></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <div :class="[fileIcon, 'w-6 h-6 text-blue-500']" aria-hidden="true"></div>
            </div>
          </div>
        </div>
        <div class="text-gray-600 mb-6">正在读取文件内容...</div>

        <!-- 文件信息 -->
        <div class="w-full max-w-md mx-auto bg-gray-50 rounded-lg p-4 text-left">
          <div class="flex items-center justify-between mb-2 text-sm">
            <div class="text-gray-500">沙箱 ID</div>
            <div class="text-gray-700 font-medium">{{ args.sandboxId || 'N/A' }}</div>
          </div>
          <div class="flex items-center justify-between text-sm">
            <div class="text-gray-500">下载选项</div>
            <div class="text-gray-700 font-medium">{{ args.download ? '是' : '否' }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div
      v-else-if="result?.error"
      class="error-state bg-white rounded-lg border border-red-200 p-6 text-center"
    >
      <UIcon name="i-lucide-alert-circle" class="w-16 h-16 text-red-500 mx-auto mb-4"></UIcon>
      <div class="text-lg font-medium text-red-600 mb-2">读取文件失败</div>
      <div class="text-gray-600 bg-red-50 p-4 rounded-md inline-block">
        {{ result.error }}
      </div>
    </div>

    <!-- 文件内容 -->
    <div
      v-else-if="result"
      class="file-content bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden"
    >
      <!-- 工具栏 -->
      <div class="file-toolbar flex items-center justify-between bg-gray-50 px-4 py-2 border-b">
        <div class="flex items-center">
          <UIcon :name="fileIcon" class="w-5 h-5 text-gray-600 mr-2" aria-hidden="true"></UIcon>
          <div class="font-medium text-gray-700">文件内容</div>
        </div>
        <div class="flex items-center space-x-2">
          <a
            v-if="result?.downloadUrl"
            :href="result.downloadUrl"
            target="_blank"
            class="flex items-center text-xs text-blue-500 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
          >
            <UIcon name="i-lucide-download" class="w-4 h-4 mr-1"></UIcon>
            下载文件
          </a>
        </div>
      </div>

      <!-- 图片内容 -->
      <div
        v-if="isImage && result?.downloadUrl"
        class="p-4 flex justify-center bg-gray-50 border-b"
      >
        <img
          :src="result.downloadUrl"
          class="max-w-full max-h-[500px] object-contain rounded-lg shadow-sm"
          alt="图片预览"
        />
      </div>

      <!-- 文本内容 -->
      <div v-else-if="isText && result?.content" class="p-0">
        <div class="relative">
          <div
            class="absolute top-0 right-0 z-10 p-2 bg-gray-50 rounded-bl-md border-l border-b border-gray-200"
          >
            <div class="text-xs text-gray-500">{{ syntaxType }}</div>
          </div>
          <pre
            class="p-4 bg-gray-50 whitespace-pre-wrap overflow-auto max-h-[500px] text-sm font-mono"
            >{{ result.content }}</pre
          >
        </div>
      </div>

      <!-- 二进制或不可预览文件 -->
      <div v-else class="p-8 text-center">
        <UIcon name="i-lucide-file-question" class="w-16 h-16 text-gray-400 mx-auto mb-4"></UIcon>
        <div class="text-lg font-medium text-gray-700 mb-2">二进制或不可预览的文件类型</div>
        <div class="text-gray-500 mb-4">此文件类型无法在浏览器中预览</div>
        <a
          v-if="result?.downloadUrl"
          :href="result.downloadUrl"
          target="_blank"
          class="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          <UIcon name="i-lucide-download" class="w-4 h-4 mr-2"></UIcon>
          下载文件
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.file-preview {
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
}

.file-header {
  transition: all 0.2s ease;
}

.file-header:hover {
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
</style>
