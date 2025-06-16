import type { Message } from 'ai';
import { generateId } from 'ai';

export const createUserMessage = (message: string): Message => {
  return {
    id: generateId(),
    role: 'user',
    content: message,
    parts: [
      { type: 'text', text: message },
    ],
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