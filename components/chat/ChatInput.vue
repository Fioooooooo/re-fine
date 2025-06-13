<script setup lang="ts">
import { ref, nextTick } from 'vue';

const props = defineProps({
  isSubmitting: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['submit']);

const inputValue = ref('');

const handleSubmit = () => {
  if (inputValue.value.trim() && !props.isSubmitting) {
    emit('submit', inputValue.value);
    inputValue.value = '';
    // 重置文本区高度
    nextTick(() => {
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.style.height = 'auto';
      }
    });
  }
};

// 自动调整文本区高度
const autoResize = (e: Event) => {
  const textarea = e.target as HTMLTextAreaElement;
  textarea.style.height = 'auto';
  textarea.style.height = `${textarea.scrollHeight}px`;
};
</script>

<template>
  <div class="w-full">
    <div class="mb-2 bg-white py-3 px-4 rounded-lg shadow">
      <form @submit.prevent="handleSubmit" class="relative">
        <textarea
          v-model="inputValue"
          placeholder="有什么任务需要我来执行的？"
          class="w-full border border-gray-300 rounded-lg py-3 pl-4 pr-12 focus:outline-none resize-none min-h-[50px] max-h-[150px] overflow-y-auto"
          :disabled="isSubmitting"
          rows="3"
          @keydown.enter.prevent="!isSubmitting && inputValue.trim() && handleSubmit()"
          @input="autoResize"
        ></textarea>
        <button
          type="submit"
          class="absolute right-2 bottom-2 transform -translate-y-1/2 text-purple-600 hover:text-purple-800 disabled:text-gray-400"
          :disabled="!inputValue.trim() || isSubmitting"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </form>
    </div>
<!--    <div class="my-2 text-xs text-gray-500 flex justify-end">-->
<!--      <div>由 CI 提供支持</div>-->
<!--    </div>-->
  </div>
</template>
