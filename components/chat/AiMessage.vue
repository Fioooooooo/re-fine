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
    </div>
  </div>
</template>

<style lang="scss">
@import url('highlight.js/styles/atom-one-dark.css');
@import url('~/assets/css/markdown.scss');
</style>

<style scoped lang="scss">
</style>
