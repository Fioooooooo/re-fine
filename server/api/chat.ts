import { streamText, smoothStream, Attachment } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import type { Message } from 'ai';
import { chatTools } from '~/libs/tools';
import { chatPrompt } from '~/libs/prompt';

// ai-sdk 的适配，移除无调用结果的 tool-call，否则会报错: 'ToolInvocation must have a result'
const removeUnfinishedToolCalls = (messages: Message[]): Message[] => {
  return messages.map((message) => ({
    ...message,
    parts: message.parts?.filter(
      (part) => part.type !== 'tool-invocation' || part.toolInvocation.state === 'result',
    ),
  }));
};

const useMultiModal = (message: Message): boolean => {
  // 必须是用户发出的消息
  const isUserMessage = message.role === 'user';
  if (!isUserMessage) return false;

  // 原始 attachments 有文件
  const attachments = message.experimental_attachments;
  return (attachments && attachments.length > 0) || false;
};

/**
 * 从用户消息中提取出一般文件
 * @param message
 */
const extractNormalAttachment = (message: Message): Attachment[] => {
  // 必须是用户发出的消息
  const isUserMessage = message.role === 'user';
  if (!isUserMessage) return [];

  // 原始 attachments 的文件
  const attachments = message.experimental_attachments;
  if (!attachments || attachments.length === 0) return [];

  // 多模态只允许 image、video、audio
  const isMultiModalAllowedFile = (file: Attachment) => {
    return file.contentType?.startsWith('image')
      || file.contentType?.startsWith('video')
      || file.contentType?.startsWith('audio');
  };

  const normalAttachments: Attachment[] = [];
  const multiModalAllowedFile: Attachment[] = [];
  attachments.forEach(attachment => {
    if (isMultiModalAllowedFile(attachment)) {
      multiModalAllowedFile.push(attachment);
    } else {
      normalAttachments.push(attachment);
    }
  });

  message.experimental_attachments = multiModalAllowedFile;

  return normalAttachments;
};

/**
 * 重组消息体
 */
const rebuildMessages = (messages: Message[]): Message[] => {
  // 移除没有结果的 tool-call
  const newMessages = removeUnfinishedToolCalls(messages);

  // 从 attachment 中提取多模态无法处理的文件，同时只保留多模态允许的文件
  // for (let message of newMessages) {
  //   const normalAttachments = extractNormalAttachment(message);
  //   if (normalAttachments && normalAttachments.length > 0) {
  //     message.content += `\n\n文件信息: ${JSON.stringify(normalAttachments)}`;
  //     const textParts = message.parts
  //       ?.filter(part => part.type === 'text')
  //       .map(part => part as TextUIPart);
  //     if (textParts && textParts.length > 0) {
  //       textParts[textParts.length - 1].text += `\n\n文件信息: ${JSON.stringify(normalAttachments)}`;
  //     }
  //   }
  // }

  return newMessages;
};

export default defineLazyEventHandler(async () => {
  const apiKey = process.env.OR_API_KEY;
  if (!apiKey) throw new Error('Missing API key!');

  const openRouter = createOpenRouter({
    apiKey: apiKey,
  });

  return defineEventHandler(async (event: any) => {
    const { messages: originalMessages } = await readBody(event);

    const messages = rebuildMessages(originalMessages);
    // const modelId = useMultiModal(messages[messages.length - 1]) ? 'qwen-omni-turbo' : 'qwen-max';

    console.log('messages', JSON.stringify(messages));

    const result = streamText({
      model: openRouter("anthropic/claude-sonnet-4"),
      messages: messages,
      tools: chatTools,
      system: chatPrompt,
      experimental_transform: smoothStream({
        chunking: /[\u4E00-\u9FFF]|\S+\s+/,
      }),
    });

    return result.toDataStreamResponse({
      getErrorMessage: error => {
        console.error(error);
        if (error instanceof Error) {
          return error.message;
        }
        return 'An unknown error occurred.';
      },
    });
  });
});