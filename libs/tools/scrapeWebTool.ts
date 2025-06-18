import { tool as createTool } from 'ai';
import { z } from 'zod';
import type { LaunchOptions } from 'playwright';
import { chromium } from 'playwright';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import sanitizeHtml from 'sanitize-html';
import type { WebScraperParams, WebScraperResult } from './types';

const getProxyConfig = () => {
  if (process.env.USE_PROXY && process.env.USE_PROXY === 'true') {
    return {
      server: process.env.PROXY_URL || '',
    };
  } else {
    return undefined;
  }
};

const cleanHtml = (html: string): string => {
  const dom = new JSDOM(html);
  const reader = new Readability(dom.window.document);
  const content = reader.parse()?.content || '';

  return sanitizeHtml(content, {
    allowedTags: ['h1', 'h2', 'h3', 'h4', 'p', 'a', 'ul', 'ol', 'li', 'b', 'strong', 'i', 'em'],
    allowedAttributes: {
      'a': ['href'],
    },
  });
};

const buildLaunchOptions = (params: WebScraperParams): LaunchOptions => {
  const options: LaunchOptions = {};

  const proxyConfig = getProxyConfig();
  if (proxyConfig !== undefined) {
    options.proxy = proxyConfig;
  }

  return options;
};

const execute = async (params: WebScraperParams): Promise<WebScraperResult> => {
  const options = buildLaunchOptions(params);
  const browser = await chromium.launch(options);

  try {
    const page = await browser.newPage();
    await page.goto(params.url);
    await page.waitForLoadState('networkidle');

    let content = await page.content();
    const url = page.url();
    const title = await page.title();

    if (params.cleanHtml) {
      content = cleanHtml(content);
    }

    return {
      content,
      metadata: {
        url: url,
        title: title,
        timestamp: new Date().getTime() + '',
        contentType: 'text/html',
      },
      error: null,
    };
  } catch (error) {
    return {
      content: '',
      metadata: {
        url: '',
        title: '',
        timestamp: '',
        contentType: '',
      },
      error: {
        message: (error as Error).message,
      },
    };
  } finally {
    await browser.close();
  }
};

export default createTool({
  description: '从网页提取信息。该工具可以访问指定 URL，获取网页的 HTML 内容，并可选择性地清理 HTML 结构，提取主要文本内容。此工具不适用于下载文件',
  parameters: z.object({
    url: z.string()
      .describe('需要访问的网页 URL，必须是完整的网址，包含 http:// 或 https:// 前缀'),
    cleanHtml: z.boolean()
      .optional()
      .describe('是否清理 HTML 并提取主要文本内容。设置为 true 时，将使用 Readability 算法提取正文，并移除多余的 HTML 标签'),
  }),
  execute: execute,
});