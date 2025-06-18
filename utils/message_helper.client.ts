import type { Message } from 'ai';
import { generateId } from 'ai';
import type { UploadedFile } from '~/utils/file.client';

export const createUserMessage = (message: { text: string, files?: UploadedFile[] }): Message => {
  return {
    id: generateId(),
    role: 'user',
    content: message.text,
    parts: [
      { type: 'text', text: message.text },
    ],
    experimental_attachments: message.files?.map((file) => ({
      name: file.name,
      contentType: file.type,
      url: file.url,
    })),
  };
};

export const mapFinishReason = (reason: string) => {
  const map: Record<string, { canContinue: boolean, finishReason: string }> = {
    'length': {
      canContinue: true,
      finishReason: '达到最大字数限制，是否继续？',
    },
    // 'tool-calls': {
    //   canContinue: true,
    //   finishReason: '达到最大调用次数限制，是否继续？',
    // }
  };

  return map[reason] || {
    canContinue: false,
    finishReason: '',
  };
}