import { tool as createTool } from 'ai';
import { z } from 'zod';

const getWeatherTool = createTool({
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
});


const celsiusConverterTool = createTool({
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
});

export const chatTools = {
  getWeather: getWeatherTool,
  celsiusConverter: celsiusConverterTool,
}