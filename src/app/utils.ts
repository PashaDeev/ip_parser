import { Builder, until, By, Capabilities } from 'selenium-webdriver';
import pino from 'pino';
import { join } from 'path';
import { stringify, parse as csvParse } from 'csv';
import { outputFile, readFile } from 'fs-extra';
import cheerio from 'cheerio';
// @ts-ignore
import proxy from 'selenium-webdriver/proxy';
import { Options } from 'selenium-webdriver/firefox';
import { range } from 'underscore';

import { PROXY_IN_PAGE } from '../constant';

const logger = pino({level: process.env.LOG_LEVEL || 'info'});

const getHTML = async (
  url: string,
  ip: string
): Promise<CheerioStatic | null> => {
  const driver = await new Builder()
    .withCapabilities(Capabilities.firefox())
    .setFirefoxOptions(new Options().headless())
    // .setProxy(proxy.manual({ https: ip }))
    .setProxy(proxy.socks(ip, 5))
    .build();

  let str;
  try {
    logger.info('page getting ...');
    await driver.get(url);
    await driver.wait(until.elementLocated(By.css('.pagination')), 20000);
    logger.info('html getting ...');
    str = await driver.findElement(By.css('body')).getAttribute('innerHTML');
  } catch (err) {
    if (err.name !== 'TimeoutError') {
      logger.info(err);
    }
  } finally {
    await driver.quit();
  }
  return str ? cheerio.load(str) : null;
};

class ProxyGenerator {
  currentIndex: number;
  proxies: Array<string[]>;

  constructor() {
    this.currentIndex = 0;
    this.proxies = [];
  }

  public async init() {
    const file = await readFile(join(process.cwd(), 'socks5.csv'));
    let res: Function;
    const promise = new Promise(r => (res = r));
    csvParse(file, (err, output) => {
      this.proxies.push(...output);
      res();
    });
    await promise;
  }

  public get(): string {
    return this.proxies[this.currentIndex].join(':');
  }

  public next() {
    this.currentIndex += 1;
  }
}

export const proxyGenerator = new ProxyGenerator();

export const get = async (url: string): Promise<CheerioStatic | null> => {
  const tries = 3;
  let res;
  let i = 0;

  while (!res && i < proxyGenerator.proxies.length) {
    const IP = proxyGenerator.get();
    if (!IP) {
      res = null;
      break;
    }
    // logger.listenerCount(`try`);
    logger.info('try with ip', IP);
    res = await getHTML(url, IP);
    if (!res) {
      proxyGenerator.next();
    }
    i++;
  }

  i = tries;
  return res;
};

export const getLastPaginationIndex = async (url: string) => {
  const $ = await get(url);
};

export const getUrlsToParse = (
  count: number,
  lastIndex: number,
) => {
  if (PROXY_IN_PAGE * count > lastIndex * PROXY_IN_PAGE) {
    count = lastIndex;
  }

  return range(0, count).map((item, index) => {
    return `https://hidemyna.me/ru/proxy-list/?type=5?start=${PROXY_IN_PAGE *
      index}#list`;
  });
};

export const parse = ($: CheerioStatic): Array<string[]> => {
  const rows = $('tbody tr')
    .map((i, el) => {
      const [ip, port] = $(el)
        .contents()
        .get();
      return `${$(ip).text()}|${$(port).text()}`;
    })
    .get();
  return rows.map(item => {
    return item.split('|');
  });
};

export const write = (proxies: Array<string[]>, name: string) => {
  stringify(proxies, async (err, output) => {
    await outputFile(join(process.cwd(), `${name}.csv`), output);
  });
};
