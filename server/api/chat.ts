import { streamText, tool } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';

export default defineLazyEventHandler(async () => {
    const apiKey = useRuntimeConfig().qwenApiKey;
    if (!apiKey) throw new Error('Missing API key!');

    const openai = createOpenAI({
        apiKey: apiKey,
        baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
    });

    return defineEventHandler(async (event: any) => {
        const { messages } = await readBody(event);

        const result = streamText({
            model: openai('qwen-turbo'),
            messages,
            tools: {
                weather: tool({
                    description: 'Get the weather in a location (fahrenheit)',
                    parameters: z.object({
                        location: z
                          .string()
                          .describe('The location to get the weather for'),
                    }),
                    execute: async ({ location }) => {
                        const temperature = Math.round(Math.random() * (90 - 32) + 32);
                        return {
                            location,
                            temperature,
                        };
                    },
                }),
                convertFahrenheitToCelsius: tool({
                    description: 'Convert a temperature in fahrenheit to celsius',
                    parameters: z.object({
                        temperature: z
                          .number()
                          .describe('The temperature in fahrenheit to convert'),
                    }),
                    execute: async ({ temperature }) => {
                        const celsius = Math.round((temperature - 32) * (5 / 9));
                        return {
                            celsius,
                        };
                    },
                }),
            },
        });

        return result.toDataStreamResponse();
    });
});