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