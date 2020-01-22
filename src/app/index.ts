import { join } from 'path';
import pino from 'pino';
import { SeleniumSpider, ProxyHandler } from 'parser_core';
import {
  getUrlsToParse,
  parse,
  write,
} from './utils';

import { SOCKS_URL } from '../constant';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

export const app = async () => {
  const proxyHandler = new ProxyHandler(join(process.cwd(), 'socks5.csv'));
  const spider = new SeleniumSpider({
    urls: [SOCKS_URL],
    selector: '.pagination',
    requestLimit: 3,
    triesLimit: 3,
    proxyHandler,
  });

  const parser = async (pages: CheerioStatic[]) => {
    const [page] = pages;
    console.log(typeof page);
    const lastIndex = Number(
      page('.pagination ul li')
        .eq(-2)
        .text()
    );
    const urls = getUrlsToParse(3, lastIndex);

    console.log('urls', urls);
    const spider = new SeleniumSpider({
      urls,
      selector: '.pagination',
      requestLimit: 3,
      triesLimit: 3,
      proxyHandler,
    });

    const newParser = async (pages: CheerioStatic[]) => {
      const proxies = [];

      for (const page of pages) {
        const proxy = parse(page);
        proxies.push(...proxy);
      }

      await write(proxies, 'socks5');
    };
    await spider.start(newParser);
  };

  await spider.start(parser);
};
