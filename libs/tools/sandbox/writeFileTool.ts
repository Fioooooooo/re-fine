import { tool as createTool } from 'ai';
import { z } from 'zod';
import type { SandboxWriteFileResult } from '../types';
import { getSandbox } from '~/utils/sandboxUtil';

export default createTool({
  description:
    'Write a content to a file in a sandbox environment, will return file content and current sandbox id which can be re-used to connect to the sandbox.',
  parameters: z.object({
    sandboxId: z
      .string()
      .optional()
      .nullable()
      .describe('Optional. If you want to use an existing sandbox, provide the sandbox id'),
    entries: z
      .array(
        z
          .object({
            filePath: z.string().describe('The absolute file path to read'),
            content: z.string().describe('The content to write'),
          })
          .describe('The entry to write')
      )
      .describe('The entries to write, you can write multiple entries at the same time'),
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
