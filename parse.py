

from selenium import webdriver
from selenium.webdriver.common.proxy import Proxy, ProxyType
from selenium.webdriver.firefox.options import Options
from bs4 import BeautifulSoup
import urllib.parse as urllib
from pprint import pprint

from time import sleep

PROXY_IN_PAGE = 64
BASE_URL = 'https://hidemyna.me'
IP_TITLES = ('ip', 'port')

options = Options()
options.set_headless()

def get_html(url, proxy, user_agent, need_element='*'):
    if proxy != None:
        # pprint(proxy['ip'] + ':' + proxy['port'])
        # webdriver.DesiredCapabilities.FIREFOX['proxy'] = {
        #     "httpProxy": proxy['ip'] + ':' + proxy['port'],
        #     "ftpProxy": proxy['ip'] + ':' + proxy['port'],
        #     "sslProxy": proxy['ip'] + ':' + proxy['port'],
        #     "noProxy": None,
        #     "proxyType": ProxyType.MANUAL,
        #     "class": "org.openqa.selenium.Proxy",
        #     "autodetect": False
        # }
        # pprint(proxy)
        profile = webdriver.FirefoxProfile()
        profile.set_preference('network.proxy.type', 1)
        profile.set_preference('network.proxy.http', proxy['ip'])
        profile.set_preference('network.proxy.http_port', int(proxy['port']))
        profile.set_preference("network.proxy.ssl", proxy['ip'])
        profile.set_preference("network.proxy.ssl_port", int(proxy['port']))
        # profile.set_preference("general.useragent.override", "Opera/9.80 (Macintosh; PPC Mac OS X; U; en) Presto/2.6 Version/10.63")
        profile.update_preferences()
        driver = webdriver.Firefox(firefox_profile=profile, options=options)
    else:
        driver = webdriver.Firefox(options=options)
    driver.set_page_load_timeout(10)
    driver.get(url)
    print(driver.find_element_by_tag_name('body').get_attribute('innerHTML'))
    # driver.implicitly_wait(60)
    sleep(60)
    driver.find_element_by_class_name(need_element)
    html = driver.find_element_by_tag_name('body')
    html = html.get_attribute('innerHTML')
    driver.close()
    return BeautifulSoup(html, 'lxml')



def get_last_pagination_index(soup):

    pagination = soup.find('div', {'class': 'proxy__pagination'})
    pagination = pagination.find('ul')

    last_pagination_element = pagination('li')[-1]

    last_pagination_url = urllib.urlparse(last_pagination_element.a['href'])

    query = urllib.parse_qs(last_pagination_url.query)
    return int(query['start'][0])


def get_proxy(soup):

    proxies = []
    table = soup.find('table', {'class': 'proxy__t'})
    strings = table.find_all('tr')


    for string in strings:
        ip = string.contents[0].string
        port = string.contents[1].string
        proxies.append({'ip': ip, 'port': port})
        # proxies.append(dict(zip(IP_TITLES, (ip.string, port.string))))
    # pprint(proxies)
    return proxies[1:]


def get_urls_to_parse(count, last_index, type='h'):
    urls = []

    if (PROXY_IN_PAGE * count < last_index - PROXY_IN_PAGE):
        count = last_index / PROXY_IN_PAGE

    for i in range(int(count)):
        if i == 0:
            new_url = 'https://hidemyna.me/ru/proxy-list/' + '?type=' + type + '#' + 'list'
            urls.append(new_url)
        else:
            new_url = 'https://hidemyna.me/ru/proxy-list/' + '?type=' + type + '?start=' + str(PROXY_IN_PAGE * i) + '#list'
            urls.append(new_url)
 
    return urls