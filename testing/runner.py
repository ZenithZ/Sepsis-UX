import sys
import test

GREEN = '\x1B[92m'
RED = '\x1B[91m'
YELLOW = '\x1B[93m'
BLUE = '\x1B[94m'
CYAN = '\x1B[36m'
WHITE = '\x1B[97m'
BOLD = '\x1B[1m'
DEFAULT = '\x1B[0m'

PASS = True
FAIL = False
UNIMP = 'UNIMPLEMENTED'

passes = 0
fails = 0
unimps = 0

def main():
    skip = False
    maintain = False
    headless = True
    if '--skip-build' in sys.argv:
        skip = True
    if '--no-quit' in sys.argv:
        maintain = True
    if '--visible' in sys.argv:
        headless = False

    try:
        test.before(skip=skip, maintain=maintain, headless=headless)
    except Exception as e:
        print(f'{BOLD}{RED}ERROR IN SETUP: {e}{DEFAULT}')
        test.after()
        exit()

    tests = test.get_testcases()
    for testcase in tests:
        try:
            run_test(testcase.name, testcase.test)
            test.after_test()
        except Exception as e:
            print(f'{BOLD}{RED}Error running test {testcase.name}: {e}{DEFAULT}')
            break
    
    test.after()
    
    print(f"\n{BOLD}{CYAN}TESTS COMPLETED:\n\t{GREEN}{passes} PASSED\n\t{RED}{fails} FAILED\n\t{YELLOW}{unimps} UNIMPLEMENTED\n{WHITE}{passes+fails+unimps} TESTS IN TOTAL\n{DEFAULT}")


def run_test(name, testcase):
    global passes
    global fails
    global unimps

    print(f'{BLUE}Running test: {BOLD}{CYAN}{name}{DEFAULT}')
    res, message = testcase()

    if res is PASS:
        print(f'{BOLD}{BLUE}TEST: {GREEN}PASS{DEFAULT}\n')
        passes += 1
    elif res is FAIL:
        print(f'{BOLD}{BLUE}TEST: {RED}FAIL\n{message}{DEFAULT}\n')
        fails += 1
    elif res == UNIMP:
        print(f'{BOLD}{BLUE}TEST: {YELLOW}NOT IMPLEMENTED\n{message}{DEFAULT}\n')
        unimps += 1

    return res

if __name__ == '__main__':
    main()