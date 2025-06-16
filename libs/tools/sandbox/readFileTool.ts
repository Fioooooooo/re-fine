import { tool as createTool } from 'ai';
import { z } from 'zod';
import type { SandboxReadFileResult } from '../types';
import { getSandbox } from '~/utils/sandboxUtil';

export default createTool({
  description: 'Read a file in a sandbox environment, will return file content and current sandbox id which can be re-used to connect to the sandbox.',
  parameters: z.object({
    sandboxId: z.string()
      .optional()
      .nullable()
      .describe('Optional. If you want to use an existing sandbox, provide the sandbox id'),
    filePath: z.string()
      .describe('The file path to read'),
    download: z.boolean()
      .optional()
      .default(false)
      .describe('Optional. Whether to download the file'),
  }),
  execute: async ({ sandboxId, filePath, download }): Promise<SandboxReadFileResult> => {
    const sandbox = await getSandbox(sandboxId);

    const fileContent = await sandbox.files.read(filePath)

    return {
      sandboxId: sandbox.sandboxId,
      filePath: filePath,
      content: fileContent,
      downloaded: download
    }
  },
});