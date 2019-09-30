import os
from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
import sys
import psutil

URL = 'http://localhost:4200'
PROCNAME = "ng serve"

class Test:
    def __init__(self, name, test, message):
        self.name = name
        self.test = test
        self.message = message

def test_build():
    stdout = os.dup(sys.stdout.fileno())
    stderr = os.dup(sys.stderr.fileno())

    file_loc = os.path.dirname(os.path.realpath(__file__))
    log_file = open(file_loc + '/tests.log', 'w+')
    
    file_no = log_file.fileno()
    os.dup2(file_no, sys.stdout.fileno())
    os.dup2(file_no, sys.stderr.fileno())

    os.chdir('..')
    pid = os.fork()
    if pid == 0:
        loc = '/bin/bash'
        os.execl(loc, 'bash', 'build')
    
    status = 0
    os.waitpid(pid, status)

    os.dup2(stdout, sys.stdout.fileno())
    os.dup2(stderr, sys.stderr.fileno())
    
    log_file.close()
    log_file = open(file_loc + '/tests.log')
    
    return ' successful' in log_file.readlines()[-1].lower()

def test_page_load():
    capabilities = DesiredCapabilities.CHROME
    capabilities['loggingPrefs'] = {'browser': 'ALL'}
    options = webdriver.ChromeOptions();
    options.add_argument("headless");
    options.add_argument("window-size=1200x600");
    driver = webdriver.Chrome(desired_capabilities=capabilities, options=options)
    driver.get(URL)
    errors = driver.get_log('browser')
    # for entry in errors:
        # print(entry)
    return len(errors) == 0

def before():
    loc = '/bin/bash'

    pid = os.fork()
    if pid == 0:
        os.execl(loc, 'bash', 'serve')

    return True

def after():
    for proc in psutil.process_iter():
        if PROCNAME in proc.name():
            proc.kill()

def get_testcases():
    tests = []
    tests.append(Test('Build', test_build, 'Build unsuccessful'))
    tests.append(Test('Test Page Load', test_page_load, 'Console errors present'))

    return tests