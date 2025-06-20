<script setup lang="ts">
import type { UIMessage } from 'ai';
import markdownit from 'markdown-it';
import hljs from 'highlight.js';

const emits = defineEmits(['showPreview']);

const md = markdownit({
  html: true,
  linkify: true,
  typographer: true,
  highlight: (str: string, lang: string, attrs: string): string => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre><code class="hljs">' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          '</code></pre>'
        );
      } catch (__) {
      }
    }

    return '<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>';
  },
});

const props = defineProps<{
  message: UIMessage;
}>();
</script>

<template>
  <div class="rounded-lg max-w-full space-y-4">
    <div v-for="(part, pIdx) in message.parts?.filter((p) => ['text', 'tool-invocation'].includes(p.type))"
         :key="pIdx"
         class="space-y-4"
    >
      <div v-if="part.type === 'text'" class="max-w-none">
        <div class="markdown-content" v-html="md.render(part.text)"></div>
      </div>
      <div
        v-if="part.type === 'tool-invocation'"
        class="bg-gray-100 p-2 rounded text-sm font-mono"
        @click="emits('showPreview', part.toolInvocation)"
      >
        <label
          :for="`tool-${part.toolInvocation.toolCallId}`"
          class="flex items-center cursor-pointer space-x-2"
        >
          <UIcon name="i-lucide-activity" class="size-4" />
          <span>工具调用</span>
          <span class="font-bold">{{ part?.toolInvocation?.toolName }}</span>
        </label>
      </div>
      <div v-if="part.type === 'tool-invocation'
        && part.toolInvocation.toolName === 'sandbox_read_file'
        && part.toolInvocation.state === 'result'
        && part.toolInvocation.result?.downloadUrl"
           class="text-sm grid grid-cols-3 gap-6 w-full"
      >
        <a class="block relative col-span-1 w-full overflow-hidden cursor-pointer border p-3 rounded-lg bg-elevated/50 hover:bg-elevated transition-colors duration-150"
           :href="part.toolInvocation.result.downloadUrl"
           target="_blank"
        >
          <div class="flex w-full overflow-hidden items-center">
            <UIcon name="i-lucide-file-text" class="w-8 h-8 mr-2 rounded-lg object-cover" />
            <div class="flex-1 min-w-0 overflow-hidden">
              <div class="font-semibold text-sm overflow-hidden whitespace-nowrap text-ellipsis">
                {{ part.toolInvocation.result.downloadUrl.split('/').pop() }}
              </div>
              <div class="text-xs text-gray-500 flex items-center w-full">
                点击下载
              </div>
            </div>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import url('highlight.js/styles/atom-one-dark.css');
@import url('~/assets/css/markdown.scss');
</style>

<style scoped lang="scss">
</style>
