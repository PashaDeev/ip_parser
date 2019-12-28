import { Builder, until, By, Capabilities } from 'selenium-webdriver';
import { join } from 'path';
import { stringify } from 'csv';
import { outputFile } from 'fs-extra';
import cheerio from 'cheerio';
// @ts-ignore
import proxy from 'selenium-webdriver/proxy';
import { range } from 'underscore';

import { PROXY_IN_PAGE } from '../constant';

const getHTML = async (
  url: string,
  ip: string
): Promise<CheerioStatic | null> => {
  let driver = await new Builder()
    .withCapabilities(Capabilities.firefox())
    .setProxy(proxy.manual({ https: ip }))
    .build();

  let str;
  try {
    await driver.get(url);
    await driver.wait(until.elementLocated(By.css('.pagination')), 20000);
    // await new Promise(res => setTimeout(res, 10000));
    str = await driver.findElement(By.css('body')).getAttribute('innerHTML');
  } finally {
    await driver.quit();
  }
  return str ? cheerio.load(str) : null;
};

function* proxyGenerator(): Generator<string> {
  let i = 0;
  while (true) {
    yield '87.255.70.183:8080';
  }
}

export const get = async (url: string): Promise<CheerioStatic | null> => {
  const getNextProxy = proxyGenerator();
  const IP = getNextProxy.next().value;

  const tries = 3;
  let res;
  let i = tries;

  while (!res && i >= 0) {
    res = await getHTML(url, IP);
    i--;
  }

  i = tries;
  return res;
};

export const getLastPaginationIndex = async (url: string) => {
  const $ = await get(url);
  return Number(
    $('.pagination ul li')
      .eq(-2)
      .text()
  );
};

export const getUrlsToParse = (
  count: number,
  lastIndex: number,
  type: string
) => {
  if (PROXY_IN_PAGE * count > lastIndex * PROXY_IN_PAGE) {
    count = lastIndex;
  }

  return range(0, count).map((item, index) => {
    return `https://hidemyna.me/ru/proxy-list/?type=${type}?start=${PROXY_IN_PAGE *
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
