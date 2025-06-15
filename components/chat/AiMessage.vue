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
  <div class="p-2 rounded-lg max-w-full">
    <div v-for="(part, pIdx) in message.parts" :key="pIdx">
      <div v-if="part.type === 'text'" class="max-w-none">
        <div class="markdown-content" v-html="md.render(part.text)"></div>
      </div>
      <div
        v-if="part.type === 'tool-invocation'"
        class="bg-gray-100 p-2 rounded text-sm font-mono my-2"
      >
        <input
          type="checkbox"
          :id="`tool-${part.toolInvocation.toolCallId}`"
          class="tool-toggle hidden"
        />
        <label
          :for="`tool-${part.toolInvocation.toolCallId}`"
          class="flex items-center cursor-pointer"
        >
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

<style lang="scss">
@import url('highlight.js/styles/atom-one-dark.css');
@import url('~/assets/css/markdown.scss');
</style>

<style scoped lang="scss">
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
