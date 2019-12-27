from math import fabs

# min_n = 100000
# max_n = 500000
min_n = 500000
max_n = 900000
# max_n = 200000

start = 10
end = 35

days = 30
try_count = 5

n_dict = {}

def my_round(x): 
    curr = x
    direction = True
    i = 1

    while curr % 3 != 0:
        if direction:
            curr = x + i
            direction = False
        else:
            if x - 1 > 0:
                curr = x - i
            i += 1
            direction = False
        
        if i > 10:
            break
    
    return curr;


def test(n, x):
    res = int(my_round(round(n / (days * try_count * x)))
)
    y = res * x * try_count * days;
    mod = fabs(n - y) 
    n_dict[n].append(mod)


for n in range(min_n, max_n):
    n_dict[n] = []
    for x in range(start, end):
        test(n, x)
    
    res = {}
    res['diff'] = max(n_dict[n])
    perc = n / 100;
    res['perc'] = res['diff'] / perc
    res['number'] = n
    n_dict[n] = res;
    print(f'num: {n}')
# print(round(239))

minimum_rs = {
    'number': None,
    'diff': None,
    'perc': 100
}


for curr_num in range(min_n, max_n):
    print(n_dict[curr_num])
    print(minimum_rs)
    if n_dict[curr_num]['perc'] < minimum_rs['perc']:
        minimum_rs = n_dict[curr_num]

print('res', minimum_rs)

