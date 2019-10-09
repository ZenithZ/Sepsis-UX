import test

green = '\x1B[92m'
red = '\x1B[91m'
blue = '\x1B[94m'
cyan = '\x1B[36m'
bold = '\x1B[1m'
default = '\x1B[0m'

def run_test(name, testcase, message):
    print(f'{blue}Running test: {bold}{cyan}{name}{default}')
    res = testcase()

    if res:
        print(f'{bold}{blue}TEST: {green}PASS{default}')
    else:
        print(f'{bold}{blue}TEST: {red}FAIL\n{message}{default}')

    return res

if __name__ == '__main__':
    try:
        test.before()
    except:
        tests.after()
        exit()

    tests = test.get_testcases()
    for testcase in tests:
        try:
            run_test(testcase.name, testcase.test, testcase.message)
        except:
            tests.after()
            exit()
    
    test.after()
    
    print(f"{bold}{blue}TESTS COMPLETED{default}")