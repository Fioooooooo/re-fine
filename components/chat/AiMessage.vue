<script setup lang="ts">
import type { UIMessage } from 'ai';
import markdownit from 'markdown-it';
import hljs from 'highlight.js';

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
      } catch (__) {}
    }

    return '<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>';
  },
});

const props = defineProps<{
  message: UIMessage;
}>();
</script>

<template>
  <div class="rounded-lg max-w-full space-y-2">
    <div v-for="(part, pIdx) in message.parts?.filter((p) => ['text', 'tool-invocation'].includes(p.type))"
         :key="pIdx"
         class="space-y-2"
    >
      <div v-if="part.type === 'text'" class="max-w-none">
        <div class="markdown-content" v-html="md.render(part.text)"></div>
      </div>
      <div
        v-if="part.type === 'tool-invocation'"
        class="bg-gray-100 p-2 rounded text-sm font-mono"
      >
        <label
          :for="`tool-${part.toolInvocation.toolCallId}`"
          class="flex items-center cursor-pointer space-x-2"
        >
          <UIcon name="i-lucide-activity" class="size-4" />
          <span>工具调用</span>
          <span class="font-bold">{{ part?.toolInvocation?.toolName }}</span>
          <span class="flex-1 overflow-hidden text-ellipsis line-clamp-1">{{ part?.toolInvocation?.args }}</span>
        </label>
      </div>
      <div v-if="part.type === 'tool-invocation'
        && part.toolInvocation.toolName === 'search_web'
        && part.toolInvocation.state === 'result'
        && part.toolInvocation.result?.results?.length > 0"
           class="bg-gray-100 py-2 rounded text-sm"
      >
        <div
          v-for="(result, idx) in part.toolInvocation.result.results"
          :key="idx"
          class="w-full overflow-hidden bg-gray-100 px-2 py-1 hover:bg-gray-200"
        >
          <a class="flex items-center" :href="result.url" target="_blank">
            <UIcon name="i-lucide-link" class="size-4 mr-2" />
            <span class="font-bold overflow-hidden text-ellipsis line-clamp-1">{{ result.title }}</span>
          </a>
        </div>
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
