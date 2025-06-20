<script setup lang="ts">
import SearchWebPreview from './SearchWebPreview.vue';
import ScrapeWebPreview from './ScrapeWebPreview.vue';
import RunCodePreview from './RunCodePreview.vue';
import RunCommandPreview from './RunCommandPreview.vue';
import ReadFilePreview from './ReadFilePreview.vue';
import WriteFilePreview from './WriteFilePreview.vue';
import ReceiveFilePreview from './ReceiveFilePreview.vue';
import GetPreviewUrlPreview from './GetPreviewUrlPreview.vue';
import type { SearchWebParams, SearchWebResult } from '~/libs/tools/types';
import type { ScrapeWebParams, ScrapeWebResult } from '~/libs/tools/types';
import type { SandboxRunCodeParams, SandboxRunCodeResult } from '~/libs/tools/types';
import type { SandboxRunCommandParams, SandboxRunCommandResult } from '~/libs/tools/types';
import type { SandboxReadFileParams, SandboxReadFileResult } from '~/libs/tools/types';
import type { SandboxWriteFileParams, SandboxWriteFileResult } from '~/libs/tools/types';
import type { SandboxReceiveFileParams, SandboxReceiveFileResult } from '~/libs/tools/types';
import type { SandboxPreviewParams, SandboxPreviewResult } from '~/libs/tools/types';

const emits = defineEmits(['close']);
const props = defineProps<{
  previewTool?: {
    toolCallId: string;
    toolName: string;
    args: unknown;
    result?: unknown;
    state?: string | undefined;
  };
}>();

// 计算工具状态对应的样式和显示信息
const toolStateInfo = computed(() => {
  const state = props.previewTool?.state;

  // 状态对应的背景和文字颜色
  let stateClass = 'bg-gray-100 text-gray-600';
  if (state === 'call' || state === 'partial-call') {
    stateClass = 'bg-amber-100 text-amber-700';
  } else if (state === 'result') {
    stateClass = 'bg-emerald-100 text-emerald-700';
  }

  // 状态对应的图标
  let iconName = 'i-lucide-clock';
  if (state === 'call' || state === 'partial-call') {
    iconName = 'i-lucide-loader';
  } else if (state === 'result') {
    iconName = 'i-lucide-check-circle';
  }

  // 是否显示加载动画
  const showSpinner = state === 'call' || state === 'partial-call';

  // 状态文本
  let statusText = '准备中';
  if (state === 'call' || state === 'partial-call') {
    statusText = '执行中';
  } else if (state === 'result') {
    statusText = '已完成';
  }

  return {
    stateClass,
    iconName,
    showSpinner,
    statusText,
  };
});

// 定义各工具的参数和结果类型
type ToolDefinitions = {
  search_web: {
    args: SearchWebParams;
    result: SearchWebResult;
  };
  scrape_web: {
    args: ScrapeWebParams;
    result: ScrapeWebResult;
  };
  sandbox_run_code: {
    args: SandboxRunCodeParams;
    result: SandboxRunCodeResult;
  };
  sandbox_run_command: {
    args: SandboxRunCommandParams;
    result: SandboxRunCommandResult;
  };
  sandbox_read_file: {
    args: SandboxReadFileParams;
    result: SandboxReadFileResult;
  };
  sandbox_write_file: {
    args: SandboxWriteFileParams;
    result: SandboxWriteFileResult;
  };
  sandbox_receive_file: {
    args: SandboxReceiveFileParams;
    result: SandboxReceiveFileResult;
  };
  sandbox_get_preview_url: {
    args: SandboxPreviewParams;
    result: SandboxPreviewResult;
  };
};

// 类型保护函数，用于安全地获取工具参数
function getToolArgs<T extends keyof ToolDefinitions>(toolName: T): ToolDefinitions[T]['args'] {
  if (!props.previewTool) return {} as ToolDefinitions[T]['args'];
  return props.previewTool.args as ToolDefinitions[T]['args'];
}

// 类型保护函数，用于安全地获取工具结果
function getToolResult<T extends keyof ToolDefinitions>(
  toolName: T
): ToolDefinitions[T]['result'] | undefined {
  if (!props.previewTool?.result) return undefined;
  return props.previewTool.result as ToolDefinitions[T]['result'];
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="w-full px-4 py-2 grid grid-cols-3 items-center border-b bg-white">
      <div class="inline-flex col-span-1">
        <UButton
          icon="i-lucide-chevrons-right"
          variant="ghost"
          color="neutral"
          class="h-9 w-9 rounded-md"
          @click="emits('close')"
        />
      </div>
      <div class="inline-flex col-span-1 justify-center">
        <div class="font-semibold text-lg">
          {{ previewTool?.toolName }}
        </div>
      </div>
      <div class="inline-flex col-span-1 justify-end gap-2 items-center">
        <!-- 工具执行状态指示器 -->
        <div
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm"
          :class="toolStateInfo.stateClass"
        >
          <!-- 状态图标 -->
          <UIcon
            :name="toolStateInfo.iconName"
            :class="{ 'animate-spin': toolStateInfo.showSpinner }"
            class="w-4 h-4"
          />
          <!-- 状态文本 -->
          <span>{{ toolStateInfo.statusText }}</span>
        </div>
      </div>
    </div>
    <div class="flex-1 overflow-y-auto">
      <!-- 搜索网页工具 -->
      <SearchWebPreview
        v-if="previewTool?.toolName === 'search_web'"
        :args="getToolArgs('search_web')"
        :result="getToolResult('search_web')"
      />

      <!-- 抓取网页工具 -->
      <ScrapeWebPreview
        v-else-if="previewTool?.toolName === 'scrape_web'"
        :args="getToolArgs('scrape_web')"
        :result="getToolResult('scrape_web')"
      />

      <!-- 沙箱运行代码工具 -->
      <RunCodePreview
        v-else-if="previewTool?.toolName === 'sandbox_run_code'"
        :args="getToolArgs('sandbox_run_code')"
        :result="getToolResult('sandbox_run_code')"
      />

      <!-- 沙箱运行命令工具 -->
      <RunCommandPreview
        v-else-if="previewTool?.toolName === 'sandbox_run_command'"
        :args="getToolArgs('sandbox_run_command')"
        :result="getToolResult('sandbox_run_command')"
      />

      <!-- 沙箱读取文件工具 -->
      <ReadFilePreview
        v-else-if="previewTool?.toolName === 'sandbox_read_file'"
        :args="getToolArgs('sandbox_read_file')"
        :result="getToolResult('sandbox_read_file')"
      />

      <!-- 沙箱写入文件工具 -->
      <WriteFilePreview
        v-else-if="previewTool?.toolName === 'sandbox_write_file'"
        :args="getToolArgs('sandbox_write_file')"
        :result="getToolResult('sandbox_write_file')"
      />

      <!-- 沙箱接收文件工具 -->
      <ReceiveFilePreview
        v-else-if="previewTool?.toolName === 'sandbox_receive_file'"
        :args="getToolArgs('sandbox_receive_file')"
        :result="getToolResult('sandbox_receive_file')"
      />

      <!-- 沙箱获取预览URL工具 -->
      <GetPreviewUrlPreview
        v-else-if="previewTool?.toolName === 'sandbox_get_preview_url'"
        :args="getToolArgs('sandbox_get_preview_url')"
        :result="getToolResult('sandbox_get_preview_url')"
      />

      <!-- 未知工具类型的默认显示 -->
      <div v-else class="p-6">
        <div class="font-bold mb-4">工具调用信息</div>
        <div class="space-y-4">
          <div>
            <div class="font-semibold mb-2">工具名称:</div>
            <div class="p-4 bg-gray-50 border rounded-lg">{{ previewTool?.toolName }}</div>
          </div>

          <div>
            <div class="font-semibold mb-2">参数:</div>
            <pre
              class="p-4 bg-gray-50 border rounded-lg whitespace-pre-wrap overflow-auto max-h-60 text-sm"
              >{{ JSON.stringify(previewTool?.args, null, 2) }}</pre
            >
          </div>

          <div v-if="previewTool?.result">
            <div class="font-semibold mb-2">结果:</div>
            <pre
              class="p-4 bg-gray-50 border rounded-lg whitespace-pre-wrap overflow-auto max-h-60 text-sm"
              >{{ JSON.stringify(previewTool?.result, null, 2) }}</pre
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
