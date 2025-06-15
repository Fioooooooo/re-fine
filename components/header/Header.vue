<script setup lang="ts">
import ProfileMenu from './ProfileMenu.vue';
import ChatSelector from './ChatSelector.vue';
</script>

<template>
  <header class="bg-white py-3 px-2">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <h1 class="text-lg font-medium">
          <span style="color: var(--ui-primary)" class="font-bold mr-1">Re</span>
          <span>Fine</span>
        </h1>
      </div>

      <div class="flex items-center space-x-3">
        <UTooltip text="新对话">
          <UButton icon="i-lucide-plus" color="neutral" variant="ghost" />
        </UTooltip>
        <ChatSelector>
          <UTooltip text="对话历史">
            <UButton icon="i-lucide-clock" color="neutral" variant="ghost" />
          </UTooltip>
        </ChatSelector>
        <ProfileMenu>
          <UTooltip text="用户信息">
            <UButton icon="i-lucide-menu" color="neutral" variant="ghost" />
          </UTooltip>
        </ProfileMenu>
      </div>
    </div>
  </header>
</template>
