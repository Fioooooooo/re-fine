import { tool as createTool } from 'ai';
import { z } from 'zod';
import { tavily } from '@tavily/core';
import type { SearchWebResult } from './types';

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

export default createTool({
  description: '根据给定的搜索关键信息执行 web 搜索，可选 domains 参数限制搜索结果的来源网站。返回 web 搜索结果。',
  parameters: z.object({
    query: z.string()
      .describe('需要web搜索的关键信息'),
    domains: z.array(z.string())
      .optional()
      .default([])
      .describe('可选参数，用于限制搜索结果的来源网站域名，支持正则，如 `*.com`。默认为空，表示不限制。使用时最好域名数量最小化，大量的域名会导致结果不够精准且搜索时间过长'),
  }),
  execute: async ({ query, domains }): Promise<SearchWebResult> => {
    return tvly.search(query, {
      topic: 'general',
      maxResults: 6,
      searchDepth: 'advanced',
      chunksPerSource: 3,
      includeRawContent: false,
      includeDomains: domains,
    }).then(result => {
      return { error: null, results: result.results, };
    }).catch(error => {
      return { error: error.message, results: null, };
    });
  },
});