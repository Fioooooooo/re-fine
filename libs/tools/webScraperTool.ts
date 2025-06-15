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
  description: 'Extract information from a webpage.',
  parameters: z.object({
    url: z.string()
      .describe('The URL of the webpage to scrape'),
    cleanHtml: z.boolean()
      .optional()
      .describe('Optional. Whether to clean the HTML of the webpage'),
  }),
  execute: execute,
});