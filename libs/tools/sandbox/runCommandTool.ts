import { tool as createTool } from 'ai';
import { z } from 'zod';
import { getSandbox } from '~/utils/sandboxUtil';
import type { SandboxRunCodeResult, SandboxRunCommandResult } from '../types';

export default createTool({
  description: '在沙箱环境中执行命令行指令。该工具可以运行 Linux 命令并返回执行结果，包括标准输出、标准错误和退出码。支持后台运行模式。每次调用都会返回沙箱 ID，可用于后续操作中重复使用同一沙箱环境。',
  parameters: z.object({
    sandboxId: z.string()
      .optional()
      .nullable()
      .describe('可选参数。如果要使用现有沙箱环境，请提供沙箱 ID。若不提供，将创建新的沙箱环境'),
    command: z.string()
      .describe('要执行的命令行指令，例如 "ls -la" 或 "python script.py"'),
    background: z.boolean()
      .optional()
      .default(false)
      .describe('是否在后台运行命令。设置为 true 时，命令将异步执行，不会阻塞后续操作，适用于启动服务器等长时间运行的进程'),
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