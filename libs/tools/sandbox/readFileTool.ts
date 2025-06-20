import { tool as createTool } from 'ai';
import { z } from 'zod';
import { getSandbox } from '~/utils/e2b_sandbox.server';
import { ossPut } from '~/utils/oss.server';
import { Sandbox } from '@e2b/code-interpreter';
import fs from 'fs';
import path from 'path';
import type { SandboxReadFileParams, SandboxReadFileResult } from '../types';

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
  execute: async ({ sandboxId, filePath, download }: SandboxReadFileParams): Promise<SandboxReadFileResult> => {
    let sandbox : Sandbox | undefined;
    const fileName = filePath.split('/').pop() || 'unknown_file';

    try {
      sandbox = await getSandbox(sandboxId);

      let fileContent = await sandbox.files.read(filePath);
      let mimeType = '';
      try {
        const fileType = await sandbox.commands.run(`file --mime-type -b ${filePath}`);
        mimeType = fileType.stdout;
      } catch (error) {
        console.error('获取文件类型时出错:', error);
        mimeType = '';
      }

      let downloadUrl = '';
      if (!download) {
        return {
          sandboxId: sandbox?.sandboxId || '',
          filePath: filePath,
          content: fileContent,
          mimeType: mimeType,
          downloadUrl,
        };
      }

      const tmpDir = path.resolve('/tmp');
      const localFilePath = path.join(tmpDir, fileName);
      try {
        if (!fs.existsSync(tmpDir)) {
          fs.mkdirSync(tmpDir, { recursive: true });
        }

        // 写入文件
        fs.writeFileSync(localFilePath, fileContent);
        console.log(`文件已写入到: ${localFilePath}`);

        // 上传到 OSS
        downloadUrl = await ossPut(
          `chat/user_id/conversation_id/${fileName}`,
          localFilePath,
        );

        fileContent = '';

        return {
          sandboxId: sandbox?.sandboxId || '',
          filePath: filePath,
          content: fileContent,
          mimeType,
          downloadUrl,
        };
      } catch (err: Error | any) {
        console.error('写入文件或上传到 OSS 时出错:', err);
        return {
          sandboxId: sandbox?.sandboxId || '',
          filePath: filePath,
          content: fileContent,
          mimeType,
          downloadUrl,
          error: '生成下载链接失败, ' + err.message,
        };
      } finally {
        if (fs.existsSync(localFilePath)) {
          fs.unlinkSync(localFilePath);
        }
      }
    } catch (error: Error | any) {
      return {
        sandboxId: sandbox?.sandboxId || '',
        filePath: filePath,
        content: '',
        mimeType: '',
        downloadUrl: '',
        error: error.message,
      };
    }
  },
});
