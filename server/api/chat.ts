import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { chatTools} from '~/libs/tools';

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
            model: openai('qwen-turbo'),
            messages,
            tools: chatTools,
            system: '你是一个出色的个人助手，你会根据用户的需求来帮助他们解决问题，已经给你配置了一些可用的工具，在你需要的时候你可以进行调用，但是在你调用之前，你需要告诉用户接下来你要调用的工具以及原因。'
        });

        return result.toDataStreamResponse();
    });
});