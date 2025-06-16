import { tool as createTool } from 'ai';
import { z } from 'zod';
import type { SandboxReadFileResult } from '../types';
import { getSandbox } from '~/utils/sandboxUtil';
import { putBuffer } from '~/utils/ossUtil';

export default createTool({
  description:
    'Read a file in a sandbox environment (you can download it if the user requires), will return file content and current sandbox id which can be re-used to connect to the sandbox.',
  parameters: z.object({
    sandboxId: z
      .string()
      .optional()
      .nullable()
      .describe('Optional. If you want to use an existing sandbox, provide the sandbox id'),
    filePath: z.string().describe('The absolute file path to read'),
    download: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        'Optional. Whether to download the file, if the user requires to download, you must show the downloadUrl.'
      ),
  }),
  execute: async ({ sandboxId, filePath, download }): Promise<SandboxReadFileResult> => {
    let sandbox;
    try {
      sandbox = await getSandbox(sandboxId);

      let fileContent = await sandbox.files.read(filePath);

      let downloadUrl = '';
      if (download) {
        const fileName = filePath.split('/').pop();
        downloadUrl = await putBuffer(
          `chat/user_id/conversation_id/${fileName}`,
          Buffer.from(fileContent)
        );
        fileContent = '';
      }

      return {
        sandboxId: sandbox?.sandboxId || '',
        filePath: filePath,
        content: fileContent,
        downloadUrl,
      };
    } catch (error: Error | any) {
      return {
        sandboxId: sandbox?.sandboxId || '',
        filePath: filePath,
        content: '',
        downloadUrl: '',
        error: error.message,
      };
    }
  },
});
