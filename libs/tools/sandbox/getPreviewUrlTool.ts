import { tool as createTool } from 'ai';
import { z } from 'zod';
import type { SandboxPreviewResult } from '../types';
import { getSandbox } from '~/utils/e2b_sandbox.server';

export default createTool({
  description: '获取沙箱应用的公开预览 URL。该工具可以为在沙箱中运行的 Web 应用生成一个可通过公共互联网访问的链接，使用户能够在浏览器中查看和交互应用。',
  parameters: z.object({
    sandboxId: z.string()
      .describe('已启动应用的沙箱 ID，必须提供有效的沙箱标识符'),
    port: z.string()
      .describe('应用监听的端口号，例如 "3000" 或 "8080"。必须与应用实际使用的端口一致'),
  }),
  execute: async ({ sandboxId, port }): Promise<SandboxPreviewResult> => {
    try {
      const sandbox = await getSandbox(sandboxId, false);
      const host = sandbox.getHost(Number.parseFloat(port));

      return {
        sandboxId: sandbox.sandboxId,
        previewUrl: `https://${host}`
      }
    } catch (error: Error | any) {
      return {
        sandboxId: sandboxId,
        previewUrl: '',
        error: error.message
      }
    }
  },
});