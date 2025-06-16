import { tool as createTool } from 'ai';
import { z } from 'zod';
import type { SandboxWriteFileResult } from '../types';
import { getSandbox } from '~/utils/sandboxUtil';

export default createTool({
  description:
    '在沙箱环境中写入文件内容。该工具可以创建或修改指定路径的文件，支持同时写入多个文件。每次调用都会返回沙箱 ID，可用于后续操作中重复使用同一沙箱环境。',
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
            content: z.string().describe('要写入文件的内容，支持任何文本格式'),
          })
          .describe('单个文件的写入信息，包含路径和内容')
      )
      .describe('要写入的文件列表，可同时写入多个文件，每个文件需指定路径和内容'),
  }),
  execute: async ({ sandboxId, entries }): Promise<SandboxWriteFileResult> => {
    let sandbox;
    try {
      sandbox = await getSandbox(sandboxId);

      const writeEntries = entries.map(entry => {
        const { filePath, content } = entry;
        return {
          path: filePath,
          data: content,
        };
      });

      const entryInfos = await sandbox.files.write(writeEntries);

      return {
        sandboxId: sandbox?.sandboxId || '',
        entryInfo: entryInfos,
      };
    } catch (error: Error | any) {
      return {
        sandboxId: sandbox?.sandboxId || '',
        entryInfo: [],
        error: error.message,
      };
    }
  },
});
