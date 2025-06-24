import type { CoreMessage } from 'ai';
import { generateText, streamText, tool as createTool, generateId } from 'ai';
import { z } from 'zod';
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { Sandbox } from '@e2b/desktop';
import { executeComputerAction, takeScreenshot } from './computer-use';
import type { ComputerUseParams, ComputerUseResult } from '../types';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

let desktop: Sandbox | undefined;
const DESKTOP_TIMEOUT = 60_000;
const RESOLUTION = [1024, 768];

const computerTool = anthropic.tools.computer_20241022({
  displayWidthPx: RESOLUTION[0],
  displayHeightPx: RESOLUTION[1],
  execute: async (options) => {
    console.log('options', options);
    switch (options.action) {
      case 'screenshot':
        return await takeScreenshot(desktop as Sandbox);
      default:
        await executeComputerAction(desktop as Sandbox, options);
        return await takeScreenshot(desktop as Sandbox);
    }
  },
  experimental_toToolResultContent(result) {
    return [{
      type: 'image',
      data: Buffer.from(result).toString('base64'),
      mimeType: 'image/png',
    }];
  },
});

const bashTool = anthropic.tools.bash_20241022({
  execute: async ({ command, restart }) => {
    console.log('command', command);
    try {
      const result = await desktop?.commands.run(command);
      await desktop?.setTimeout(DESKTOP_TIMEOUT);
      return result;
    } catch (error: Error | any) {
      return error.message;
    }
  },
  experimental_toToolResultContent(result) {
    return typeof result === 'string'
      ? [{ type: 'text', text: result }]
      : [{ type: 'text', text: JSON.stringify(result) }];
  },
});

const INSTRUCTIONS = `
You are Surf, a helpful assistant that can use a computer to help the user with their tasks.
You can use the computer to search the web, write code, and more.

Surf is built by E2B, which provides an open source isolated virtual computer in the cloud made for AI use cases.
This application integrates E2B's desktop sandbox with Anthropic's API to create an AI agent that can perform tasks
on a virtual computer through natural language instructions.

The screenshots that you receive are from a running sandbox instance, allowing you to see and interact with a real
virtual computer environment in real-time.

Since you are operating in a secure, isolated sandbox micro VM, you can execute most commands and operations without
worrying about security concerns. This environment is specifically designed for AI experimentation and task execution.

IMPORTANT NOTES:
1. You automatically receive a screenshot after each action you take. You DO NOT need to request screenshots separately.
2. When a user asks you to run a command in the terminal, ALWAYS press Enter immediately after typing the command.
3. When the user explicitly asks you to press any key (Enter, Tab, Ctrl+C, etc.) in any application or interface,
   you MUST do so immediately.
4. Remember: In terminal environments, commands DO NOT execute until Enter is pressed.
5. When working on complex tasks, continue to completion without stopping to ask for confirmation.
   Break down complex tasks into steps and execute them fully.

Please help the user effectively by observing the current state of the computer and taking appropriate actions.
`;

const execute = async ({ sandboxId, task }: ComputerUseParams): Promise<ComputerUseResult> => {
  console.log('sandboxId: ' + sandboxId + ', task: ', task);

  desktop = !!sandboxId
    ? await Sandbox.connect(sandboxId)
    : await Sandbox.create({ resolution: [RESOLUTION[0], RESOLUTION[1]], dpi: 96, timeoutMs: DESKTOP_TIMEOUT });

  try {
    await desktop.stream.start();
  } catch (error) {
    console.error(error);
  }

  const vncUrl = desktop.stream.getUrl();

  const messages: CoreMessage[] = [{ role: 'user', content: task }];

  const openRouter = createOpenRouter({
    apiKey: process.env.OR_API_KEY,
  });

  // setTimeout(async () => {
  const result = await generateText({
    model: openRouter.chat('anthropic/claude-3.5-sonnet'),
    system: INSTRUCTIONS,
    messages,
    maxSteps: 60,
    tools: {
      computer: computerTool,
      bash: bashTool,
    },
  });
console.log('result', result);
  for (const toolCall of result.toolCalls) {
    console.log('toolCall: ', toolCall);
  }
  // }, 100)

  return {
    sandboxId: desktop.sandboxId,
    vncUrl: vncUrl,
  };
};

export default createTool({
  description: '控制具有桌面环境的沙箱电脑来完成复杂任务。包括执行命令行指令、控制应用、操作鼠标、键盘、屏幕截图等。',
  parameters: z.object({
    sandboxId: z.string()
      .optional()
      .nullable()
      .describe('可选参数。如果要使用现有沙箱环境，请提供沙箱 ID。若不提供，将创建新的沙箱环境'),
    task: z.string()
      .describe('要在沙箱电脑中执行的任务描述，'),
  }),
  execute: execute,
});