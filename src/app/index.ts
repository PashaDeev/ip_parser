import pino from 'pino';
import {
  get,
  getLastPaginationIndex,
  getUrlsToParse,
  parse,
  write,
  proxyGenerator,
} from './utils';

import { SOCKS_URL } from '../constant';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const getProxies = async (pageLimit = 1) => {
  const lastIndex = await getLastPaginationIndex(SOCKS_URL);
  console.log('last index', lastIndex);
  const urls = getUrlsToParse(pageLimit, lastIndex);

  console.log('urls', urls);

  const proxies: Array<string[]> = [];
  for (const url of urls) {
    const res = await get(SOCKS_URL);
    const current = parse(res);
    proxies.push(...current);
  }
  return proxies;
};

export const app = async () => {
  logger.info('start');
  await proxyGenerator.init();
  logger.info('------------ socks start ------------');
  const httpsProxies = await getProxies(3);
  logger.info(`socks5 ${httpsProxies}`);
  await write(httpsProxies, 'socks5');
  logger.info('------------ socks end ------------');
  logger.info(`end`);
};
