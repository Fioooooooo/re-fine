<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui';

const emits = defineEmits(['close']);

const activeTab = ref('code');
const tabItems: TabsItem[] = [
  {
    label: 'Code',
    value: 'code',
  },
  {
    label: 'Preview',
    value: 'preview',
  },
];
</script>

<template>
  <div class="flex flex-col">
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
      <div class="flex justify-center">
        <UTabs
          v-model="activeTab"
          :items="tabItems"
          :content="false"
          class="w-full"
        />
      </div>
    </div>
    <div v-show="activeTab === 'code'">Code</div>
    <div v-show="activeTab === 'preview'">Preview</div>
  </div>
</template>

<style scoped>

</style>