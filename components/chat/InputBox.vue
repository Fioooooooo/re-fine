<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({
  isSubmitting: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['submit']);

const inputValue = ref('');

const handleSubmit = () => {
  if (inputValue.value.trim() && !props.isSubmitting) {
    emit('submit', inputValue.value);
    inputValue.value = '';
  }
};
</script>

<template>
  <div class="border-t border-gray-200 bg-white py-3 px-4 fixed bottom-0 left-0 right-0">
    <div class="max-w-3xl mx-auto">
      <form @submit.prevent="handleSubmit" class="relative">
        <input
          v-model="inputValue"
          type="text"
          placeholder="发送消息给 Claude..."
          class="w-full border border-gray-300 rounded-lg py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          :disabled="isSubmitting"
        />
        <button
          type="submit"
          class="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-600 hover:text-purple-800 disabled:text-gray-400"
          :disabled="!inputValue.trim() || isSubmitting"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
      <div class="mt-2 text-xs text-gray-500 flex justify-between">
        <div>Claude 可以制作创意内容，回答问题，提供帮助</div>
        <div>由 Anthropic 提供支持</div>
      </div>
    </div>
  </div>
</template>
