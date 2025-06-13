<script setup lang="ts">
import type { UIMessage } from 'ai';

const props = defineProps<{
  message: UIMessage;
}>();
</script>

<template>
  <div
    class="p-2 rounded-lg max-w-full"
    :class="{
      'bg-blue-50': message.role === 'user',
    }"
  >
    <div v-for="(part, pIdx) in message.parts" :key="pIdx">
      <div v-if="part.type === 'text'" class="prose prose-sm max-w-none">
        {{ part.text }}
      </div>
      <div
        v-if="part.type === 'tool-invocation'"
        class="bg-gray-100 p-2 rounded text-sm font-mono mb-2"
      >
        <input type="checkbox" :id="`tool-${part.toolInvocation.toolCallId}`" class="tool-toggle hidden" />
        <label :for="`tool-${part.toolInvocation.toolCallId}`" class="flex items-center cursor-pointer">
          <UIcon name="i-lucide-activity" class="size-4 mr-2" />
          <span>工具调用</span>
          <span class="ml-2 font-bold">{{ part?.toolInvocation?.toolName }}</span>
          <UIcon
            name="i-lucide-chevron-down"
            class="size-4 ml-auto toggle-icon transition-transform"
          />
        </label>
        <div class="tool-details mt-2 hidden">
          <div>
            <span class="font-medium">参数:</span>
            <span class="ml-1">{{ part?.toolInvocation?.args }}</span>
          </div>
          <div class="mt-1">
            <span class="font-medium">结果:</span>
            <span class="ml-1">{{ part?.toolInvocation?.result }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 工具调用展开/收起效果 */
.tool-toggle:checked + label .toggle-icon {
  transform: rotate(180deg);
}

.tool-toggle:checked ~ .tool-details {
  display: block;
}

.tool-details {
  overflow: hidden;
  transition: all 0.3s ease;
}
</style>
