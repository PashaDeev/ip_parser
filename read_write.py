
from pprint import pprint
import time
from csv import DictWriter, DictReader
from os.path import abspath

def write_to_csv(path, data, fieldnames):
    with open(path, 'w') as out_file:
        writer = DictWriter(out_file, delimiter=',', fieldnames=fieldnames)
        writer.writeheader()
        for row in data:
            writer.writerow(row)


def get_proxy_from_file(path):
    proxies = []
    try:
        with open(path) as file_obj:
                reader = DictReader(file_obj, delimiter=',')
                for line in reader:
                        proxies.append(line)
    except FileNotFoundError:
            return proxies

    return proxies
