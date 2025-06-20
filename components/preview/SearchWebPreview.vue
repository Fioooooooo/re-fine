<script setup lang="ts">
import type { SearchWebResult } from '~/libs/tools/types';

const props = defineProps<{
  args: { query: string, domains: string[] },
  result?: SearchWebResult,
}>();
</script>

<template>
  <div class="p-6">
    <div class="space-y-4">
    </div>
    <div v-if="result?.results && result?.results?.length > 0">
      <div class="font-bold mb-4">搜索结果</div>
      <div
        v-for="(r, idx) in result?.results"
        :key="idx"
        class="w-full overflow-hidden mb-4"
      >
        <div class="overflow-hidden border p-4 rounded-lg bg-white hover:bg-elevated/50 transition-colors duration-150">
          <div class="flex w-full overflow-hidden items-center">
            <div class="flex-1 min-w-0 overflow-hidden">
              <a class="font-semibold text-base overflow-hidden whitespace-nowrap text-ellipsis underline hover:text-primary transition-colors duration-150"
                 :href="r.url"
                 target="_blank"
              >
                {{ r.title }}
              </a>
              <div class="mt-2 text-base text-gray-500 overflow-hidden text-ellipsis line-clamp-2">
                {{ r.content }}
              </div>
              <div class="mt-2 text-sm text-gray-500 overflow-hidden text-ellipsis line-clamp-1">
                {{ r.url }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>