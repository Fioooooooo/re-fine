import { tool as createTool } from 'ai';
import { z } from 'zod';
import type { SandboxReadFileResult } from '../types';
import { getSandbox } from '~/utils/sandboxUtil';
import { putBuffer } from '~/utils/ossUtil';

export default createTool({
  description:
    '在沙箱环境中读取文件内容。该工具可以读取指定路径的文件，并返回文件内容。如果需要，还可以生成文件的下载链接。每次调用都会返回沙箱 ID，可用于后续操作中重复使用同一沙箱环境。',
  parameters: z.object({
    sandboxId: z
      .string()
      .optional()
      .nullable()
      .describe('可选参数。如果要使用现有沙箱环境，请提供沙箱 ID。若不提供，将创建新的沙箱环境'),
    filePath: z.string().describe('要读取的文件的绝对路径，例如 /home/user/file.txt'),
    download: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        '是否生成文件下载链接。设置为 true 时，将不返回文件内容，而是提供下载链接。当用户需要下载文件时，必须在你的回答中展示此链接，以便用户可以下载文件'
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
