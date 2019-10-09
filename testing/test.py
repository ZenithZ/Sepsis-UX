import os
from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
import sys
import psutil
import time

URL = 'http://localhost:4200'
PROCNAME = "ng serve"

def get_driver():
    capabilities = DesiredCapabilities.CHROME
    capabilities['loggingPrefs'] = {'browser': 'ALL'}
    options = webdriver.ChromeOptions()
    options.add_argument("headless")
    options.add_argument("window-size=1200x600")
    return webdriver.Chrome(desired_capabilities=capabilities, options=options)

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
    driver = get_driver()
    driver.get(URL)
    errors = driver.get_log('browser')
    return len(errors) == 0

def test_view_toggle():
    driver = get_driver()
    driver.get(URL)
    
    button = driver.find_element_by_xpath("//button[contains(text(), 'Combined/Seperate View')]")

    # Determine original configuration
    orig_all_tables = driver.find_elements_by_css_selector("app-table")
    orig_unseen_tables = driver.find_elements_by_xpath("//app-table[contains(@class, 'unseen')]")
    if not button or not orig_all_tables or not orig_unseen_tables:
        return False
    
    n_tables = len(orig_all_tables)
    orig_diff = n_tables - len(orig_unseen_tables)
    new_diff = len(orig_all_tables) - orig_diff
    if orig_diff != 1 and orig_diff != 4:
        return False

    button.click()
    
    # After clicking the button the number of tables seen tables should change
    new_all_tables = driver.find_elements_by_css_selector("app-table")
    new_unseen_tables = driver.find_elements_by_xpath("//app-table[contains(@class, 'unseen')]")
    if not new_all_tables or not new_unseen_tables or not len(new_all_tables) == n_tables:
        return False
    change = len(new_all_tables) - len(new_unseen_tables)
    if not change == new_diff:
        return False

    button.click()

    # Ensure that reclicking the button returns to the original state
    final_all_tables = driver.find_elements_by_css_selector("app-table")
    final_unseen_tables = driver.find_elements_by_xpath("//app-table[contains(@class, 'unseen')]")
    if not final_all_tables or not new_unseen_tables or not len(final_all_tables) == n_tables:
        return False
    change = len(final_all_tables) - len(final_unseen_tables)
    if not change == orig_diff:
        return False
    
    return True

def test_name_search():
    driver = get_driver()
    driver.get(URL)

    search = driver.find_element_by_id("mat-input-0")
    if not search:
        return False

    search_name = "john"
    search.send_keys(search_name)
    names = driver.find_elements_by_xpath("//td[contains(@class, 'Name')]")
    if len(names) > 0:
        for name in names:
            if len(name.text) > 1 and not search_name in name.text.lower():
                print(name.text.lower())
                return False

    search.clear()
    search_name = "ee"
    search.send_keys(search_name)
    names = driver.find_elements_by_xpath("//td[contains(@class, 'Name')]")
    if len(names) > 0:
        print([n.text for n in names])
        for name in names:
            if not search_name in name.text.lower():
                print(name.text.lower())
                return False

    search.clear()
    search_name = "asjdfioasjfioejaiofjsiofjoi"
    search.send_keys(search_name)
    names = driver.find_elements_by_xpath("//td[contains(@class, 'Name')]")
    if len(names) > 0:
        print([n.text for n in names])
        print(len(names))
        return False

    return True

def before():
    loc = '/bin/bash'

    pid = os.fork()
    if pid == 0:
        os.execl(loc, 'bash', 'serve.sh')

    return True

def after():
    for proc in psutil.process_iter():
        if PROCNAME in proc.name():
            proc.kill()


def get_testcases():
    tests = []
    tests.append(Test('Build', test_build, 'Build unsuccessful'))
    tests.append(Test('Test Page Load', test_page_load, 'Console errors present'))
    tests.append(Test('Test Tables Toggle', test_view_toggle, 'Failed to toggle views'))
    tests.append(Test('Test Name Search', test_name_search, 'Search did not produce correct results'))

    return tests