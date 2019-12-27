from pprint import pprint
from parse import get_html
from bs4 import BeautifulSoup
from read_write import get_proxy_from_file


if __name__ == '__main__':

    proxies = get_proxy_from_file('proxies-https.csv')


    for i in range(4):
        pprint(proxies[i])
        ip = 'empty'
        try:
            html = get_html('https://2ip.ru/', proxies[i], None, 'ip')
            ip = html.find(id='d_clip_button')
            pprint(proxies[i])
        except:
            print('Слишком долго')

        
        pprint(ip)

