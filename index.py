from pprint import pprint
import time
from sys import argv

from parse import get_html, get_proxy, get_last_pagination_index, get_urls_to_parse
from read_write import write_to_csv, get_proxy_from_file

from pymongo import MongoClient

args = argv[1:]

IP_TITLES = ('ip', 'port')

HTTP_URL = 'https://hidemyna.me/ru/proxy-list/?type=h#list'
HTTPS_URL = 'https://hidemyna.me/ru/proxy-list/?type=s#list'

if len(args) > 0 and args[0] == 'https': 
    CURRENT_URL = HTTPS_URL
else:
    CURRENT_URL = HTTPS_URL







if __name__ == '__main__':
    html = get_html(CURRENT_URL, None, None, 'proxy__t')


    page_count = input('сколько страниц парсить? ==> ')

    # pprint(html)

    last_index = get_last_pagination_index(html)

    urls_http = get_urls_to_parse(int(page_count), last_index, 'h')
    urls_https = get_urls_to_parse(int(page_count), last_index, 's')

    # if len(args) > 0 and args[0] == 'https':
    #     urls = get_urls_to_parse(int(page_count), last_index, 's')
    # else:
    #     urls = get_urls_to_parse(int(page_count), last_index, 'h')


    # proxies = get_proxy_from_file('proxies_https.csv')

    http_proxies = []
    https_proxies = []

    for i in range(int(page_count)):
        time.sleep(3)       
        if len(http_proxies) >= 0:
            html = get_html(urls_http[i], None, None, 'proxy__t')
        else:
            html = get_html(urls_http[i], None, None, 'proxy__t')
        new_proxies = get_proxy(html)
        http_proxies = http_proxies + new_proxies

    
    for i in range(int(page_count)):
        time.sleep(3)       
        if len(https_proxies) >= 0:
            html = get_html(urls_https[i], None, None, 'proxy__t')
        else:
            html = get_html(urls_https[i], None, None, 'proxy__t')
        new_proxies = get_proxy(html)
        https_proxies = https_proxies + new_proxies

    # pprint(all_proxies)

    mongo_connect = MongoClient('mongodb://localhost:27017/')

    proxy_data_base = mongo_connect['proxy_database']

    proxy_data_base_collection_names = proxy_data_base.list_collection_names()

    if 'https_proxy_collection' in proxy_data_base_collection_names:
        coll = proxy_data_base['https_proxy_collection']
        content = coll.find({});
        print('https')
        for line in content:
            pprint(line)
        coll.drop()

    https_collection = proxy_data_base['https_proxy_collection']
    print('proxies')
    pprint(https_proxies)
    https_collection.insert_many(https_proxies)

    if 'http_proxy_collection' in proxy_data_base_collection_names:
        coll = proxy_data_base['http_proxy_collection']
        content = coll.find({});
        print('http')
        for line in content:
            pprint(line)
        coll.drop()

    http_collection = proxy_data_base['http_proxy_collection']
    http_collection.insert_many(http_proxies)
        # write_to_csv('proxies-http.csv', all_proxies, IP_TITLES)