import { streamText, smoothStream } from 'ai';
import type { Message } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { chatTools} from '~/libs/tools';
import { chatPrompt } from '~/libs/prompt';

// ai-sdk 的适配，移除无调用结果的 tool-call，否则会报错: 'ToolInvocation must have a result'
const removeUnfinishedToolCalls = (messages: Message[]): Message[] => {
    return messages.map((message) => ({
        ...message,
        parts: message.parts?.filter(
          (part) => part.type !== "tool-invocation" || part.toolInvocation.state === "result",
        ),
    }));
}

export default defineLazyEventHandler(async () => {
    const apiKey = process.env.QWEN_API_KEY;
    if (!apiKey) throw new Error('Missing API key!');

    const openai = createOpenAI({
        apiKey: apiKey,
        baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
    });

    return defineEventHandler(async (event: any) => {
        const { messages } = await readBody(event);
        console.log(JSON.stringify(messages));

        const result = streamText({
            model: openai('qwen-max'),
            messages: removeUnfinishedToolCalls(messages),
            tools: chatTools,
            system: chatPrompt,
            experimental_transform: smoothStream({
                chunking: /[\u4E00-\u9FFF]|\S+\s+/,
            }),
        });

        return result.toDataStreamResponse({
            getErrorMessage: error => {
                if (error instanceof Error) {
                    return error.message;
                }
                console.error(error);
                return 'An unknown error occurred.';
            },
        });
    });
});