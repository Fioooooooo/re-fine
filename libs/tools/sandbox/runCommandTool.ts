import { tool as createTool } from 'ai';
import { z } from 'zod';
import { getSandbox } from '~/utils/sandboxUtil';
import type { SandboxRunCodeResult, SandboxRunCommandResult } from '../types';

export default createTool({
  description: 'Run a command in a sandbox environment, will return execution result and current sandbox id which can be re-used to connect to the sandbox.',
  parameters: z.object({
    sandboxId: z.string()
      .optional()
      .nullable()
      .describe('Optional. If you want to use an existing sandbox, provide the sandbox id'),
    command: z.string()
      .describe('The command to run'),
    background: z.boolean()
      .optional()
      .default(false)
      .describe('Optional. Whether to run the command in the background'),
  }),
  execute: async ({ sandboxId, command, background }): Promise<SandboxRunCommandResult> => {
    const sandbox = await getSandbox(sandboxId);

    const result = await sandbox.commands.run(command, { background });

    return {
      sandboxId: sandbox.sandboxId,
      exitCode: result.exitCode,
      error: result.error,
      stdout: result.stdout,
      stderr: result.stderr,
    }
  },
});