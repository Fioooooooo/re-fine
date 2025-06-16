<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '发生了错误',
  },
  finishReason: {
    type: String,
    default: '',
  },
  canContinue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['submit', 'retry', 'stop', 'cancelRetry', 'cancelContinue']);

const inputValue = ref('');
const isComposing = ref(false); // 跟踪输入法组合状态

const handleSubmit = () => {
  if (inputValue.value.trim() && !props.isLoading && !isComposing.value) {
    emit('submit', inputValue.value);
    inputValue.value = '';
  }
};

const handleRetry = () => {
  emit('retry');
};

const handleContinue = () => {
  inputValue.value = '继续';
  handleSubmit();
}

const handleStop = () => {
  emit('stop');
};
</script>

<template>
  <div class="w-full">
    <div
      v-if="errorMessage"
      class="flex items-center p-1.5 text-sm font-medium mx-4 mb-2 rounded-xl bg-red-400/10 text-red-400"
    >
      <span class="flex-1 px-1.5">{{ errorMessage }}</span>
      <UButton color="error" variant="soft" @click="handleRetry">重试</UButton>
      <UButton icon="i-lucide-x" size="xs" color="error" variant="link" @click="emit('cancelRetry')" />
    </div>
    <div
      v-if="canContinue && finishReason"
      class="flex items-center p-1.5 text-sm font-medium mx-4 mb-2 rounded-xl bg-orange-400/10 text-orange-400"
    >
      <span class="flex-1 px-1.5">{{ finishReason }}</span>
      <UButton color="error" variant="soft" @click="handleContinue">继续</UButton>
      <UButton icon="i-lucide-x" size="xs" color="error" variant="link" @click="emit('cancelContinue')" />
    </div>
    <div class="mb-4 bg-white py-3 px-4 rounded-lg shadow-md border border-gray-100">
      <form @submit.prevent="handleSubmit" class="relative">
        <UTextarea
          v-model="inputValue"
          placeholder="有什么任务需要我来执行的？"
          class="chat-input w-full resize-none"
          color="neutral"
          variant="none"
          :disabled="isLoading"
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
              :disabled="true"
            />
          </div>
          <div v-if="!isLoading">
            <UTooltip text="发送">
              <UButton
                icon="i-lucide-arrow-up"
                color="neutral"
                variant="solid"
                size="xl"
                @click="handleSubmit"
              />
            </UTooltip>
          </div>
          <div v-else>
            <UTooltip text="停止">
              <UButton
                v-if="isLoading"
                icon="i-lucide-square"
                color="neutral"
                variant="solid"
                size="xl"
                @click="handleStop"
              />
            </UTooltip>
          </div>
        </div>
      </form>
    </div>
    <!--    <div class="my-2 text-xs text-gray-500 flex justify-end">-->
    <!--      <div>由 CI 提供支持</div>-->
    <!--    </div>-->
  </div>
</template>

<style lang="scss"></style>
