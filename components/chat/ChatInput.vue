<script setup lang="ts">
import { ref, watch } from 'vue';
import { formatBytes, isNewFile, putOssFiles } from '~/utils/file.client';
import type { UploadedFile } from '~/utils/file.client';

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
const filesValue = ref<Array<File>>([]);
const uploadedFiles = ref<Array<UploadedFile>>([]);
const isComposing = ref(false); // 跟踪输入法组合状态
const textareaRef = ref(null);

const textareaFocus = () => {
  setTimeout(() => {
    const textarea = document.querySelector('.chat-input textarea') as HTMLTextAreaElement;
    if (textarea) {
      textarea.focus();
    }
  }, 0);
};

const handleSubmit = () => {
  if (inputValue.value.trim() && !props.isLoading && !isComposing.value) {
    emit('submit', {
      text: inputValue.value,
      files: uploadedFiles.value,
    });

    inputValue.value = '';
    uploadedFiles.value = [];
    filesValue.value = [];
    const fileInput = document.getElementById('multimodal') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }

    textareaFocus();
  }
};

const handleRetry = () => {
  emit('retry');
};

const handleContinue = () => {
  inputValue.value = '继续';
  handleSubmit();
};

const handleStop = () => {
  emit('stop');
};

watch(
  () => props.isLoading,
  loading => {
    if (!loading) {
      textareaFocus();
    }
  }
);

const onClickUpload = (e: Event) => {
  e.preventDefault();
  const fileInput = document.getElementById('multimodal') as HTMLInputElement;
  if (fileInput) {
    fileInput.click();
  }
};

const handleFileChange = async (e: Event) => {
  e.preventDefault();
  const files = (e.target as HTMLInputElement).files;

  if (files && files.length > 0) {
    const newFiles = Array.from(files).filter(f => isNewFile(f, filesValue.value));
    filesValue.value = [...filesValue.value, ...newFiles];

    await putOssFiles(newFiles, (uploadedFile: UploadedFile) => {
      uploadedFiles.value.push(uploadedFile);
    });
  }
};

const handleFileRemove = (index: number) => {
  uploadedFiles.value.splice(index, 1);
  filesValue.value = filesValue.value.splice(index, 1);
};
</script>

<template>
  <div class="w-full">
    <div
      v-if="errorMessage"
      class="flex items-center p-1.5 text-sm font-medium mx-4 mb-2 rounded-xl bg-red-400/10 text-red-400"
    >
      <span class="flex-1 px-1.5">{{ errorMessage }}</span>
      <UButton color="error" variant="soft" @click="handleRetry" class="rounded-xl">重试</UButton>
      <UButton
        icon="i-lucide-x"
        size="xs"
        color="error"
        variant="link"
        @click="emit('cancelRetry')"
      />
    </div>
    <div
      v-if="finishReason && canContinue"
      class="flex items-center p-1.5 text-sm font-medium mx-4 mb-2 rounded-xl bg-orange-400/10 text-orange-400"
    >
      <span class="flex-1 px-1.5">{{ finishReason }}</span>
      <UButton color="error" variant="soft" @click="handleContinue" class="rounded-xl">
        继续
      </UButton>
      <UButton
        icon="i-lucide-x"
        size="xs"
        color="error"
        variant="link"
        @click="emit('cancelContinue')"
      />
    </div>
    <div
      v-show="uploadedFiles.length > 0"
      class="bg-white py-3 px-4 pb-8 -mb-5 rounded-t-2xl shadow-md border border-gray-100"
    >
      <div class="grid grid-cols-3 gap-6 w-full">
        <UCard
          v-for="(file, idx) in uploadedFiles"
          :key="file.url"
          variant="subtle"
          class="col-span-1 w-full overflow-hidden"
          :ui="{
            body: 'p-3 sm:p-3 relative max-w-full',
          }"
        >
          <div class="flex w-full overflow-hidden">
            <img
              v-if="file.type.startsWith('image/')"
              :src="file.url"
              :alt="file.name"
              class="w-10 h-10 mr-2 rounded-lg object-cover"
            />
            <UIcon v-else name="i-lucide-files" class="w-8 h-8 mr-2 rounded-lg object-cover" />
            <div class="flex-1 min-w-0 overflow-hidden">
              <div class="font-semibold text-sm overflow-hidden whitespace-nowrap text-ellipsis">
                {{ file.name }}
              </div>
              <div class="text-xs text-gray-500 flex items-center w-full">
                <div class="flex-1 min-w-0 overflow-hidden whitespace-nowrap text-ellipsis mr-1">
                  {{ file.type }}
                </div>
                <div class="flex-shrink-0">{{ formatBytes(file.size) }}</div>
              </div>
            </div>
          </div>
          <div
            class="absolute top-1 right-1 cursor-pointer size-4 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-500"
            @click="handleFileRemove(idx)"
          >
            <UIcon name="i-lucide-x" class="size-3 text-white" />
          </div>
        </UCard>
      </div>
    </div>
    <div class="mb-4 bg-white py-3 px-4 rounded-2xl shadow-md border border-gray-100">
      <form @submit.prevent="handleSubmit" class="relative">
        <UTextarea
          ref="textareaRef"
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
          autofocus
        />
        <div class="flex items-center">
          <div class="flex-1 gap-2 flex items-center">
            <div class="upload">
              <input
                type="file"
                id="multimodal"
                name="multimodal"
                accept="*"
                :multiple="true"
                class="hidden"
                @change="handleFileChange"
              />
              <UButton
                icon="i-lucide-paperclip"
                color="neutral"
                variant="outline"
                size="xl"
                class="rounded-xl"
                @click="onClickUpload"
              />
            </div>
          </div>
          <div v-if="!isLoading">
            <UTooltip text="发送">
              <UButton
                icon="i-lucide-arrow-up"
                color="neutral"
                variant="solid"
                size="xl"
                @click="handleSubmit"
                class="rounded-xl"
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
                class="rounded-xl"
              />
            </UTooltip>
          </div>
        </div>
      </form>
    </div>
    <div class="my-2 text-xs text-gray-500 flex justify-center">
      <div>以上内容均由AI生成, 仅供参考和借鉴</div>
    </div>
  </div>
</template>

<style lang="scss"></style>
