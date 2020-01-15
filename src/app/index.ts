import {
  get,
  getLastPaginationIndex,
  getUrlsToParse,
  parse,
  write,
  proxyGenerator,
} from './utils';

import { SOCKS_URL } from '../constant';

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
  console.log('start');
  await proxyGenerator.init();
  console.log('------------ socks start ------------');
  const httpsProxies = await getProxies(3);
  console.log(`socks5`, httpsProxies);
  await write(httpsProxies, 'socks5');
  console.log('------------ socks end ------------');
  // console.log('------------ http start ------------');
  // const httpProxies = await getProxies('h', 3);
  // console.log(`http`, httpProxies);
  // await write(httpProxies, 'http');
  // console.log('------------ http end ------------');
  console.log(`end`);
};
