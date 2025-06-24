import { type CommandResult, ExecutionError, Result } from '@e2b/code-interpreter';
import type { Logs } from '@e2b/code-interpreter';
import type { EntryInfo } from 'e2b';

export interface SandboxRunCodeParams {
  sandboxId?: string | null; // 沙箱 ID
  code: string; // 代码
}

export interface SandboxRunCodeResult {
  sandboxId: string; // 沙箱 ID
  logs: Logs; // 日志
  runtimeError: ExecutionError | undefined; // 运行时错误
  results: Result[]; // 结果
}

export interface SandboxRunCommandParams {
  sandboxId?: string | null; // 沙箱 ID
  command: string; // 命令
  background: boolean; // 是否后台运行
}

export interface SandboxRunCommandResult {
  sandboxId: string; // 沙箱 ID
  exitCode: number | undefined; // 退出码
  stdout: string; // 标准输出
  stderr: string; // 标准错误
  error?: string; // 错误信息
}

export interface SandboxReadFileParams {
  sandboxId?: string | null; // 沙箱 ID
  filePath: string; // 文件路径
  download: boolean; // 是否下载
}

export interface SandboxReadFileResult {
  sandboxId: string; // 沙箱 ID
  filePath: string; // 文件路径
  content: string; // 文件内容
  mimeType: string; // MIME 类型
  downloadUrl: string; // 下载链接
  error?: string; // 错误信息
}

export interface SandboxWriteFileParams {
  sandboxId?: string | null; // 沙箱 ID
  entries: {
    filePath: string; // 文件路径
    content: string; // 文件内容
  }[];
}

export interface SandboxWriteFileResult {
  sandboxId: string; // 沙箱 ID
  entryInfo: EntryInfo[]; // 文件信息
  error?: string; // 错误信息
}

export interface SandboxReceiveFileParams {
  sandboxId?: string | null; // 沙箱 ID
  entries: {
    filePath: string; // 文件路径
    url: string; // 文件url
  }[];
}

export interface SandboxReceiveFileResult {
  sandboxId: string; // 沙箱 ID
  results?: {
    filePath: string; // 文件路径
    url: string; // 文件url
    commandResult: CommandResult; // 命令执行结果
  }[];
  error?: string; // 错误信息
}

export interface SandboxPreviewParams {
  sandboxId: string; // 沙箱 ID
  port: string; // 应用端口
}

export interface SandboxPreviewResult {
  sandboxId: string; // 沙箱 ID
  previewUrl: string; // 预览 URL
  error?: string | null | undefined; // 错误信息
}

export interface ScrapeWebParams {
  url: string; // 要访问的 url
  cleanHtml?: boolean; // 是否清洗 HTML
}

export interface ScrapeWebResult {
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

export interface SearchWebParams {
  query: string; // 搜索关键词
  domains?: string[]; // 搜索域名
}

export interface SearchWebResult {
  error?: string | null | undefined; // 错误信息
  results?: {
    title: string;
    url: string;
    content: string;
    rawContent?: string;
    score: number;
    publishedDate: string;
  }[] | null;   // 搜索结果
}

export interface ComputerUseParams {
  sandboxId?: string | null; // 沙箱 ID
  task: string; // 任务描述
}

export interface ComputerUseResult {
  sandboxId: string; // 沙箱 ID
  vncUrl: string; // VNC URL
  error?: string | null; // 错误信息
}