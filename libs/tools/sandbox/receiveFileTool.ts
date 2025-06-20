import { tool as createTool } from 'ai';
import { z } from 'zod';
import type { SandboxReceiveFileParams, SandboxReceiveFileResult } from '../types';
import { Sandbox } from '@e2b/code-interpreter';
import { getSandbox } from '~/utils/e2b_sandbox.server';

export default createTool({
  description:
    '在沙箱环境中接收文件。该工具可以接收来自用户的文件内容，支持同时接收多个文件。每次调用都会返回沙箱 ID，可用于后续操作中重复使用同一沙箱环境。',
  parameters: z.object({
    sandboxId: z
      .string()
      .optional()
      .nullable()
      .describe('可选参数。如果要使用现有沙箱环境，请提供沙箱 ID。若不提供，将创建新的沙箱环境'),
    entries: z
      .array(
        z
          .object({
            filePath: z.string().describe('要写入的文件的绝对路径，例如 /home/user/file.txt'),
            url: z.string().describe('要写入文件的url，将会使用 wget 来下载文件'),
          })
          .describe('单个文件的写入信息，包含路径和url')
      )
      .describe('要写入的文件列表，可同时写入多个文件，每个文件需指定路径和内容'),
  }),
  execute: async ({ sandboxId, entries }: SandboxReceiveFileParams): Promise<SandboxReceiveFileResult> => {
    let sandbox: Sandbox | undefined;
    try {
      sandbox = await getSandbox(sandboxId);
      
      const results = await Promise.all(entries.map(async entry => {
        const { filePath, url } = entry;
        return sandbox!.commands.run(`wget -O ${filePath} ${url}`)
          .then(result => {
            return {
              filePath,
              url,
              commandResult: result
            };
          }).catch(e => {
            return {
              filePath,
              url,
              commandResult: {
                exitCode: 1,
                error: e.message,
                stdout: '',
                stderr: e.stderr || ''
              }
            }
          })
      }));

      return {
        sandboxId: sandbox?.sandboxId || '',
        results: results,
      };
    } catch (error: Error | any) {
      console.error(error);
      return {
        sandboxId: sandbox?.sandboxId || '',
        error: error.message,
      };
    }
  },
});
