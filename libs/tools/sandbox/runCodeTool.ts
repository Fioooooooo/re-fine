import { tool as createTool } from 'ai';
import { z } from 'zod';
import { getSandbox } from '~/utils/sandboxUtil';
import type {SandboxRunCodeResult} from '../types';

export default createTool({
  description: 'Execute python code in a Jupyter notebook cell, will return execution result and current sandbox id which can be re-used to connect to the sandbox.',
  parameters: z.object({
    sandboxId: z.string()
      .optional()
      .nullable()
      .describe('Optional. If you want to use an existing sandbox, provide the sandbox id'),
    code: z.string()
      .describe('The python code to execute in a single cell'),
  }),
  execute: async ({ sandboxId, code }): Promise<SandboxRunCodeResult> => {
    const sandbox = await getSandbox(sandboxId);

    const { logs, error, results } = await sandbox.runCode(code);

    return {
      sandboxId: sandbox.sandboxId,
      logs: logs,
      runtimeError: error,
      results: results
    }
  },
});