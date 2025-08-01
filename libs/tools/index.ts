import sandboxRunCodeTool from './sandbox/runCodeTool';
import sandboxRunCommandTool from './sandbox/runCommandTool';
import sandboxWriteFileTool from './sandbox/writeFileTool';
import sandboxReadFileTool from './sandbox/readFileTool';
import sandboxGetPreviewUrlTool from './sandbox/getPreviewUrlTool';
import sandboxReceiveFileTool from './sandbox/receiveFileTool';
import scrapeWebTool from './scrapeWebTool';
import searchWebTool from './searchWebTool';
import computerUseTool from './desktop/computer-use/computerUseTool';
import browserUseTool from './desktop/browser-use/browserUseTool';

export const chatTools = {
  sandbox_run_code: sandboxRunCodeTool,
  sandbox_run_command: sandboxRunCommandTool,
  sandbox_write_file: sandboxWriteFileTool,
  sandbox_read_file: sandboxReadFileTool,
  sandbox_get_preview_url: sandboxGetPreviewUrlTool,
  sandbox_receive_file: sandboxReceiveFileTool,
  scrape_web: scrapeWebTool,
  search_web: searchWebTool,
  computer_use: computerUseTool,
  browser_use: browserUseTool
};
