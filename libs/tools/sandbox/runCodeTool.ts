import { tool as createTool } from 'ai';
import { z } from 'zod';
import { getSandbox } from '~/utils/e2b_sandbox.server';
import type { SandboxRunCodeParams, SandboxRunCodeResult} from '../types';

export default createTool({
  description: '在沙箱环境的 Jupyter notebook 中执行 Python 代码。该工具会运行指定的代码并返回执行结果、日志和可能的错误信息。每次调用都会返回沙箱 ID，可用于后续操作中重复使用同一沙箱环境。',
  parameters: z.object({
    sandboxId: z.string()
      .optional()
      .nullable()
      .describe('可选参数。如果要使用现有沙箱环境，请提供沙箱 ID。若不提供，将创建新的沙箱环境'),
    code: z.string()
      .describe('要执行的 Python 代码。代码将在单个 Jupyter notebook 单元格中运行，支持多行代码'),
  }),
  execute: async ({ sandboxId, code }: SandboxRunCodeParams): Promise<SandboxRunCodeResult> => {
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