import { tool as createTool } from 'ai';
import { z } from 'zod';
import { Sandbox } from '@e2b/desktop';

const browserUseCode = (task: string) => {
  return `
import asyncio
from dotenv import load_dotenv
from browser_use import BrowserSession, Agent
from langchain_openai import ChatOpenAI

load_dotenv()


async def main():
    agent = Agent(
        task=\"${task}\",
        browser_session=BrowserSession(
            headless=False,
            viewport={"width": 1280, "height": 720},
            executable_path="/opt/playwright-browsers/chromium-1169/chrome-linux/chrome",
        ),
        llm=ChatOpenAI(base_url="https://openrouter.ai/api/v1", model="openai/gpt-4o"),
    )
    await agent.run()

asyncio.run(main())
    `;
}

export default createTool({
  description: '这个工具只作为演示用，除非用户指明使用 browser-use tool，否则不要使用。使用 browser-use 打开浏览器执行指定的操作，例如打开网页、搜索等。',
  parameters: z.object({
    sandboxId: z
      .string()
      .optional()
      .nullable()
      .describe('可选参数。如果要使用现有沙箱环境，请提供沙箱 ID。若不提供，将创建新的沙箱环境'),
    task: z.string().describe('**英文描述** 要执行的操作，例如打开网页、搜索等'),
  }),
  execute: async ({ sandboxId, task }): Promise<{
    sandboxId: string| undefined,
    vncUrl: string
    error?: string
  }> => {
    let sandbox: Sandbox | undefined;

    try {
      sandbox = !!sandboxId ? await Sandbox.connect(sandboxId) : await Sandbox.create('o4k4iv9uvhgounm03l7d')
      await sandbox.setTimeout(10 * 60_000);

      await sandbox.stream.start();
      const vncUrl = sandbox.stream.getUrl();

      const scriptPath = '/home/user/script.py'

      await sandbox.files.write(scriptPath, browserUseCode(task))

      const envFile = `OPENAI_API_KEY=${process.env.OR_API_KEY}`
      await sandbox.files.write('.env', envFile)

      await sandbox.commands.run(`python3 ${scriptPath} & echo $! > /tmp/script_pid.txt`, {background: true})

      return {
        sandboxId: sandbox?.sandboxId,
        vncUrl
      }
    } catch (error: Error | any) {
      return {
        sandboxId: sandbox?.sandboxId,
        vncUrl: '',
        error: error.message
      }
    }
  },
});