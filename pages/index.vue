<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useChat } from '@ai-sdk/vue';

import { createUserMessage, mapFinishReason } from '~/utils/message_helper.client';
import ChatHeader from '~/components/header/Header.vue';
import ChatMessages from '~/components/chat/ChatMessages.vue';
import ChatInput from '~/components/chat/ChatInput.vue';
import PreviewPanel from '~/components/preview/PreviewPanel.vue';
import type { UploadedFile } from '~/utils/file.client';
import type { ToolInvocation, ToolInvocationUIPart } from '@ai-sdk/ui-utils';
import type { ToolResult } from '@ai-sdk/provider-utils';

const { messages, status, append, reload, stop } = useChat({
  maxSteps: 60,
  onToolCall({ toolCall }) {
    console.log('onToolCall', toolCall);
    previewVisible.value = true;
    previewTool.toolName = toolCall.toolName;
    previewTool.toolCallId = toolCall.toolCallId;
    previewTool.args = toolCall.args;
    previewTool.state = 'call';
    previewTool.result = undefined;
  },
  onFinish(message, options) {
    console.log('onFinish message', message);
    console.log('onFinish options', options);
    const mapped = mapFinishReason(options.finishReason);
    canContinue.value = mapped.canContinue;
    finishReason.value = mapped.finishReason;

    if (options.finishReason === 'tool-calls') {
      const toolPart = message.parts
        ?.filter(p => p.type === 'tool-invocation'
          && p.toolInvocation.toolCallId === previewTool.toolCallId
          && p.toolInvocation.state === 'result'
        )[0] as ToolInvocationUIPart;
      if (toolPart) {
        const toolInvocation = toolPart.toolInvocation as ({
          state: 'result';
          step?: number;
        } & ToolResult<string, any, any>)
        previewTool.state = toolInvocation.state;
        previewTool.result = toolInvocation.result;
      }
    }
  },
  onError(error) {
    console.log('onError', error);
    errorMessage.value = error.message;
  },
});

const isLoading = computed(() => ['submitted', 'streaming'].includes(status.value));
const errorMessage = ref('');
const canContinue = ref(false);
const finishReason = ref('');

const previewVisible = ref(false);
const previewTool = reactive<{
  toolName: string,
  toolCallId: string,
  args: unknown,
  result: unknown,
  state:  '' | 'call' | 'result' | 'partial-call'
}>({
  toolName: '',
  toolCallId: '',
  args: undefined,
  result: undefined,
  state: ''
});

const onMessageSubmit = (userMessage: { text: string, files?: UploadedFile[] }) => {
  append(createUserMessage(userMessage));
};

const onRetry = () => {
  errorMessage.value = '';
  reload();
};

const onShowPreview = (toolInvocation: ToolInvocation) => {
  previewVisible.value = true;
  previewTool.toolName = toolInvocation.toolName;
  previewTool.toolCallId = toolInvocation.toolCallId;
  previewTool.args = toolInvocation.args;
  previewTool.state = toolInvocation.state;
  previewTool.result = toolInvocation.result;
};
</script>

<template>
  <div class="flex min-h-screen max-h-screen">
    <div class="grid w-full md:grid-cols-2">
      <div
        class="flex flex-col h-screen max-w-[800px] w-full mx-auto px-4"
        :class="[previewVisible ? 'col-span-1' : 'col-span-2']"
      >
        <ChatHeader />
        <ChatMessages
          class="flex-1"
          :messages="messages"
          :is-loading="isLoading"
          @show-preview="onShowPreview"
        />
        <ChatInput
          :is-loading="isLoading"
          :error-message="errorMessage"
          :can-continue="canContinue"
          :finish-reason="finishReason"
          @submit="onMessageSubmit"
          @retry="onRetry"
          @stop="stop"
          @cancel-continue="() => {
            canContinue = false;
            finishReason = '';
          }"
          @cancel-retry="() => {
            errorMessage = '';
          }"
        />
      </div>
      <div
        v-if="previewVisible"
        class="absolute md:relative z-10 top-0 left-0 shadow-2xl rounded-l-3xl border-l border-y h-full w-full overflow-auto bg-[#F5F5F5]"
      >
        <PreviewPanel @close="previewVisible = false" :preview-tool="previewTool" />
      </div>
    </div>
  </div>
</template>

<style>
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
  font-size: 14px;
}
</style>
