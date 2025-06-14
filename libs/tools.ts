import { tool as createTool } from 'ai';
import { z } from 'zod';
import { Sandbox } from '@e2b/code-interpreter';

const runCodeTool = createTool({
  description: 'Execute python code in a Jupyter notebook cell and return result.',
  parameters: z.object({
    code: z.string()
      .describe('The code to run'),
  }),
  execute: async ({ code }) => {
    const sbx = await Sandbox.create();
    const { logs, error, results } = await sbx.runCode(code);
    return {
      stdout: logs.stdout,
      stderr: logs.stderr,
      runtimeError: error,
      cellResults: results
    }
  },
});

export const chatTools = {
  CodeRunner: runCodeTool,
};