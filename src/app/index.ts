import { get, getLastPaginationIndex, getUrlsToParse, parse, write } from './utils';

import { HTTPS_URL, HTTP_URL } from '../constant';

const getProxies = async (type: string) => {
  const lastIndex = await getLastPaginationIndex(
    type === 's' ? HTTPS_URL : HTTP_URL
  );
  console.log('last index', lastIndex);
  const urls = getUrlsToParse(1, lastIndex, type);

  console.log('urls', urls);

  const proxies: Array<string[]> = [];
  for (const url of urls) {
    const res = await get(type === 's' ? HTTPS_URL : HTTP_URL);
    const current = parse(res);
    proxies.push(...current);
  }
  return proxies;
};

export const app = async () => {
  console.log('start');
  console.log('------------ https start ------------');
  const httpsProxies = await getProxies('s');
  console.log(`https`, httpsProxies);
  await write(httpsProxies, 'https');
  console.log('------------ https end ------------');
  console.log('------------ http start ------------');
  const httpProxies = await getProxies('h');
  console.log(`http`, httpProxies);
  await write(httpProxies, 'http');
  console.log('------------ http end ------------');
  console.log(`end`);
};
