<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({
  isSubmitting: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['submit']);

const inputValue = ref('');
const isComposing = ref(false); // 跟踪输入法组合状态

const handleSubmit = () => {
  if (inputValue.value.trim() && !props.isSubmitting && !isComposing.value) {
    emit('submit', inputValue.value);
    inputValue.value = '';
  }
};
</script>

<template>
  <div class="w-full">
    <div class="mb-4 bg-white py-3 px-4 rounded-lg shadow-md border border-gray-100">
      <form @submit.prevent="handleSubmit" class="relative">
        <UTextarea
          v-model="inputValue"
          placeholder="有什么任务需要我来执行的？"
          class="chat-input w-full resize-none"
          color="neutral"
          variant="none"
          :disabled="isSubmitting"
          :rows="3"
          :max-rows="6"
          autoresize
          :ui="{
            base: 'p-0 text-base',
          }"
          @keydown.enter.prevent="handleSubmit"
          @compositionstart="isComposing = true"
          @compositionend="isComposing = false"
        />
        <div class="flex items-center">
          <div class="flex-1 gap-2 flex items-center">
            <UButton
              icon="i-lucide-paperclip"
              color="neutral"
              variant="outline"
              size="xl"
              :disabled="!inputValue.trim() || isSubmitting"
              @click="handleSubmit"
            />
          </div>
          <UButton
            icon="i-lucide-arrow-up"
            color="neutral"
            variant="solid"
            size="xl"
            :disabled="!inputValue.trim() || isSubmitting"
            @click="handleSubmit"
          />
        </div>
      </form>
    </div>
    <!--    <div class="my-2 text-xs text-gray-500 flex justify-end">-->
    <!--      <div>由 CI 提供支持</div>-->
    <!--    </div>-->
  </div>
</template>

<style lang="scss"></style>
