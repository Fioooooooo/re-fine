import { tool as createTool } from 'ai';
import { z } from 'zod';
import type { SandboxPreviewResult } from '../types';
import { getSandbox } from '~/utils/sandboxUtil';

export default createTool({
  description: 'Get the preview url of the sandbox app, there you can access the app with public internet.',
  parameters: z.object({
    sandboxId: z.string()
      .describe('The sandbox id with the app started.'),
    port: z.string()
      .describe('The port of the app.'),
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