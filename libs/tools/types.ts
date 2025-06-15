export interface WebScraperParams {
  url: string;                   // 要访问的 url
  cleanHtml?: boolean;           // 是否清洗 HTML
}

export interface WebScraperResult {
  content: string | string[];    // 提取的内容（文本或 HTML）
  metadata: {
    url: string;                 // 最终 URL（考虑重定向）
    title: string;               // 页面标题
    timestamp: string;           // 提取时间
    contentType?: string;        // 内容类型（text/html 等）
  };
  error?: null | undefined | {   // 错误信息
    message: string;             // 错误信息
  };
}