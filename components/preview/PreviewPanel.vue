<script setup lang="ts">
import SearchWebPreview from './SearchWebPreview.vue';

const emits = defineEmits(['close']);
const props = defineProps<{
  previewTool?: {
    toolCallId: string,
    toolName: string,
    args: unknown,
    result?: unknown,
    state?: '' | 'call' | 'result' | 'partial-call',
  }
}>();

</script>

<template>
  <div class="flex flex-col h-full">
    <div class="w-full p-2 grid grid-cols-3 items-center border-b bg-white">
      <div class="inline-flex">
        <UButton
          icon="i-lucide-chevrons-right"
          variant="ghost"
          color="neutral"
          class="h-9 w-9 rounded-md"
          @click="emits('close')"
        />
      </div>
      <div>
        <div class="font-semibold text-lg">
          {{ previewTool?.toolName }}
        </div>
      </div>
      <div>
        {{ previewTool?.state }}
      </div>
    </div>
    <div class="flex-1 overflow-y-auto">
      <SearchWebPreview
        v-if="previewTool?.toolName === 'search_web'"
        :args="previewTool?.args"
        :result="previewTool?.result"
      />
    </div>
  </div>
</template>

<style scoped>

</style>