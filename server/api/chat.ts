import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { chatTools} from '~/libs/tools';

export default defineLazyEventHandler(async () => {
    const apiKey = useRuntimeConfig().qwenApiKey;
    if (!apiKey) throw new Error('Missing API key!');

    const openai = createOpenAI({
        apiKey: apiKey,
        baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
    });

    return defineEventHandler(async (event: any) => {
        const { messages } = await readBody(event);
        console.log(JSON.stringify(messages));

        const result = streamText({
            model: openai('qwen-turbo'),
            messages,
            tools: chatTools,
        });

        return result.toDataStreamResponse();
    });
});