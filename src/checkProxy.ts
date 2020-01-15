import { get, proxyGenerator } from './app/utils';

(async () => {
  await proxyGenerator.init();
  const $ = await get('https://2ip.ru');
  console.log(`-------------------------`);
  console.log(`$`, $);
  console.log(`-------------------------`);
  // $('');
})();

