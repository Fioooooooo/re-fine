import { ExecutionError, Result } from '@e2b/code-interpreter';
import type { Logs } from '@e2b/code-interpreter';
import type { EntryInfo } from 'e2b';

export interface SandboxRunCodeResult {
  sandboxId: string; // 沙箱 ID
  logs: Logs; // 日志
  runtimeError: ExecutionError | undefined; // 运行时错误
  results: Result[]; // 结果
}

export interface SandboxRunCommandResult {
  sandboxId: string; // 沙箱 ID
  exitCode: number | undefined; // 退出码
  stdout: string; // 标准输出
  stderr: string; // 标准错误
  error?: string; // 错误信息
}

export interface SandboxReadFileResult {
  sandboxId: string; // 沙箱 ID
  filePath: string; // 文件路径
  content: string; // 文件内容
  downloadUrl: string; // 下载链接
  error?: string; // 错误信息
}

export interface SandboxWriteFileResult {
  sandboxId: string; // 沙箱 ID
  entryInfo: EntryInfo[]; // 文件信息
  error?: string; // 错误信息
}

export interface SandboxPreviewResult {
  sandboxId: string; // 沙箱 ID
  previewUrl: string; // 预览 URL
  error?: string | null | undefined; // 错误信息
}

export interface WebScraperParams {
  url: string; // 要访问的 url
  cleanHtml?: boolean; // 是否清洗 HTML
}

export interface WebScraperResult {
  content: string | string[]; // 提取的内容（文本或 HTML）
  metadata: {
    url: string; // 最终 URL（考虑重定向）
    title: string; // 页面标题
    timestamp: string; // 提取时间
    contentType?: string; // 内容类型（text/html 等）
  };
  error?:
    | null
    | undefined
    | {
        // 错误信息
        message: string; // 错误信息
      };
}
