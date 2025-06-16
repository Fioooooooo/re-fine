import sandboxRunCodeTool from './sandbox/runCodeTool';
import sandboxRunCommandTool from './sandbox/runCommandTool';
import sandboxWriteFileTool from './sandbox/writeFileTool';
import sandboxReadFileTool from './sandbox/readFileTool';
import sandboxGetPreviewUrlTool from './sandbox/getPreviewUrlTool';
import scrapeWebTool from './scrapeWebTool';

export const chatTools = {
  sandbox_run_code: sandboxRunCodeTool,
  sandbox_run_command: sandboxRunCommandTool,
  sandbox_write_file: sandboxWriteFileTool,
  sandbox_read_file: sandboxReadFileTool,
  sandbox_get_preview_url: sandboxGetPreviewUrlTool,
  scrape_web: scrapeWebTool
};