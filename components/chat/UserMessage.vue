<script setup lang="ts">
import type { UIMessage } from 'ai';

const props = defineProps<{
  message: UIMessage
}>();
</script>

<template>
  <div class="flex items-center">
    <div class="self-start mr-2 w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-xs">ME</div>
    <div
      class="p-2 space-y-2 rounded-lg max-w-full bg-blue-50"
    >
      <div v-for="(part, pIdx) in message.parts" :key="pIdx">
        <div v-if="part.type === 'text'" class="prose prose-sm max-w-none">
          {{ part.text }}
        </div>
      </div>
      <div v-if="message.experimental_attachments">
        <div class="grid grid-cols-3 gap-6 w-full">
          <UCard
            v-for="(attachment, idx) in message.experimental_attachments"
            :key="attachment.url"
            variant="outline"
            class="col-span-1 w-full overflow-hidden"
            :ui="{
            body: 'p-3 sm:p-3 relative max-w-full',
          }"
          >
            <div class="flex w-full overflow-hidden items-center">
              <img
                v-if="attachment.contentType?.startsWith('image/')"
                :src="attachment.url"
                :alt="attachment.name"
                class="w-10 h-10 mr-2 rounded-lg object-cover"
              />
              <UIcon v-else name="i-lucide-files" class="w-8 h-8 mr-2 rounded-lg object-cover" />
              <div class="flex-1 min-w-0 overflow-hidden">
                <div class="font-semibold text-sm overflow-hidden whitespace-nowrap text-ellipsis">
                  {{ attachment.name }}
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
