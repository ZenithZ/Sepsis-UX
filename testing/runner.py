import test

green = '\033[92m'
red = '\033[91m'
blue = '\033[94m'
cyan = '\033[36m'
bold = '\033[1m'
default = '\033[0m'

def run_test(name, testcase, message):
    print(f'{blue}Running test: {bold}{cyan}{name}{default}')
    res = testcase()

    if res:
        print(f'{bold}{blue}TEST: {green}PASS{default}')
    else:
        print(f'{bold}{blue}TEST: {red}FAIL\n{message}{default}')

    return res

if __name__ == '__main__':
    test.before()

    tests = test.get_testcases()
    for testcase in tests:
        run_test(testcase.name, testcase.test, testcase.message)
    
    test.after()
    
    print('done')
    