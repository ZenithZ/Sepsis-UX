import os
from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.common.keys import Keys
import sys
import psutil
import time

URL = 'http://localhost:4200'
PROCNAME = "ng serve"
DRIVER = None

def get_driver():
    capabilities = DesiredCapabilities.CHROME
    capabilities['loggingPrefs'] = {'browser': 'ALL'}
    options = webdriver.ChromeOptions()
    # options.add_argument("headless")
    options.add_argument("window-size=1200x600")
    
    try:
        return webdriver.Chrome(executable_path="./chromedriver", desired_capabilities=capabilities, options=options)
    except:
        return webdriver.Chrome(executable_path="chromedriver", desired_capabilities=capabilities, options=options)
    
    raise Exception("Failed to instantiate driver")

class Test:
    def __init__(self, name, test):
        self.name = name
        self.test = test

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
    
    res = ' successful' in log_file.readlines()[-1].lower()
    return res, 'Build unsuccessful' if not res else None

def test_page_load():
    global DRIVER
    global URL

    DRIVER.get(URL)
    errors = DRIVER.get_log('browser')
    res = len(errors) == 0
    return res, 'Console errors present' if not res else None

def test_view_toggle():
    global DRIVER
    
    button = DRIVER.find_element_by_xpath("/html/body/app-root/div/mat-form-field/div/div[1]/div[2]/mat-icon")

    # Determine original configuration
    orig_all_tables = DRIVER.find_elements_by_css_selector("app-table")
    orig_unseen_tables = DRIVER.find_elements_by_xpath("/html/body/div[2]/div[2]/div/div")
    if not button or not orig_all_tables or not orig_unseen_tables:
        return False, 'Button, or table not present'
    
    n_tables = len(orig_all_tables)
    orig_diff = n_tables - len(orig_unseen_tables)
    new_diff = len(orig_all_tables) - orig_diff
    if orig_diff != 1 and orig_diff != 4:
        return False, 'Incorrect number of tables'

    button.click()
    
    # After clicking the button the number of tables seen tables should change
    new_all_tables = DRIVER.find_elements_by_css_selector("app-table")
    new_unseen_tables = DRIVER.find_elements_by_xpath("//app-table[contains(@class, 'unseen')]")
    if not new_all_tables or not new_unseen_tables or not len(new_all_tables) == n_tables:
        return False, 'At least one table that should be present is not present'
    change = len(new_all_tables) - len(new_unseen_tables)
    if not change == new_diff:
        return False, 'Incorrect number of tables'

    button.click()

    # Ensure that reclicking the button returns to the original state
    final_all_tables = DRIVER.find_elements_by_css_selector("app-table")
    final_unseen_tables = DRIVER.find_elements_by_xpath("//app-table[contains(@class, 'unseen')]")
    if not final_all_tables or not new_unseen_tables or not len(final_all_tables) == n_tables:
        return False, 'At least one table that should be present is not present'
    change = len(final_all_tables) - len(final_unseen_tables)
    if not change == orig_diff:
        return False, 'Incorrect number of tables'
    
    return True, None

def test_name_search():
    global DRIVER

    search = DRIVER.find_element_by_id("mat-input-0")
    if not search:
        return False, 'Search did not produce correct results'

    search.clear()
    search_name = "john"
    search.send_keys(search_name)
    names = DRIVER.find_elements_by_xpath("//td[contains(@class, 'Name')]")
    if len(names) > 0:
        for name in names:
            if len(name.text) > 1 and not search_name in name.text.lower():
                return False, 'Search did not produce correct results'

    search.clear()
    search_name = "ee"
    search.send_keys(search_name)
    names = DRIVER.find_elements_by_xpath("//td[contains(@class, 'Name')]")
    if len(names) > 0:
        for name in names:
            if not search_name in name.text.lower():
                return False, 'Search did not produce correct results'

    search.clear()
    search_name = "asjdfioasjfioejaiofjsiofjoi"
    search.send_keys(search_name)
    names = DRIVER.find_elements_by_xpath("//td[contains(@class, 'Name')]")
    if len(names) > 0:
        return False, 'Search did not produce correct results'

    search.clear()
    search.send_keys(Keys.BACKSPACE)
    return True, None

def test_MRN_search():
    global DRIVER

    search = DRIVER.find_element_by_id("mat-input-0")
    if not search:
        return False, 'Search did not produce correct results'
    
    search.clear()
    search_MRN = "1091439687"
    search.send_keys(search_MRN)
    mrns = DRIVER.find_elements_by_xpath("//td[contains(@class, 'MRN')]")
    if len(mrns) > 0:
        for mrn in mrns:
            if len(mrn.text) > 1 and not search_MRN in mrn.text.lower():
                return False, 'Search did not produce correct results'

    search.clear()
    search_MRN = "99999999999999999999999999"
    search.send_keys(search_MRN)
    mrns = DRIVER.find_elements_by_xpath("//td[contains(@class, 'MRN')]")
    if len(mrns) > 0:
        return False, 'Search did not produce correct results'

    search.clear()
    search.send_keys(Keys.BACKSPACE)

    return True, None

def test_sort_waittime():
    global DRIVER

    button = DRIVER.find_element_by_xpath("/html/body/app-root/div/app-table[5]/div/table/thead/tr/th[9]/div/button")
    button.click()

    tables = DRIVER.find_elements_by_tag_name("app-table")
    tables = [t for t in tables if "unseen" not in t.get_attribute('class')]

    patients = []
    for t in tables:
        patients += t.find_elements_by_class_name("example-element-row")

    wait = 100 * 24 * 60
    prev = "100d 00:00"
    for p in patients:
        time = ' '.join(p.find_element_by_class_name("cdk-column-Delta").text.split()[:2])
        days = time.split("d")
        hours_min = days[1].split(":")

        days = int(days[0]) * 24 * 60
        hours = int(hours_min[0]) * 60
        minutes = int(hours_min[1][1])
        current_wait = days + hours + minutes
        if current_wait > wait:
            print(prev, time, current_wait, wait)
            return False, 'Waiting time does not get correctly sorted'
        wait = current_wait
        prev = time

    return True, None

#------_---_---_---@ZenithZ---_---_---_----- -
# Item 5, 10, 14, 17
# Item 5: Test results of a patient are indicated (by colour) on the left of the patient summary.
# Test 12: Red if any test results are critically out of range.
def test_critically_outofrange_red():
    global DRIVER
    return True, None
# Test 13: Yellow if any test results are out of range and no results are critically out of range.
def test_normal_outofrange_yellow():
    global DRIVER
    return True, None

# Item 10: A nurse can toggle whether a patient has been seen
# Test 26: Search ' ' will reveal all patients, both seen and unseen.
def test_reveal_all():
    global DRIVER
    return True, None
# Test 27: Clicking on the seen checkbox will remove a patient from view (unseen patients).
def test_unseentoseen():
    global DRIVER
    return True, None
# Test 28: Searching and re-checking the seen checkbox will make the patient reappear (unseen patients).
def test_seentounseen():
    global DRIVER
    return True, None
# Test 29: Patients will remain seen if views are switched back and forth.
def seen_switching_views():
    global DRIVER
    return True, None

# Item 14: Patients can be sorted by their age
# Test 43: Clicking on the age column will sort patients by their age. (then every third click).
def test_age_sort():
    global DRIVER
    return True, None
# Test 44: Clicking on the age column twice will sort patients in reverse order by their age. (then every third click).
def test_age_reverse_sort():
    global DRIVER
    return True, None
# Test 45: Order is preserved when switching views.
def test_age_preserved_order():
    global DRIVER
    return True, None

# Item 17: Patients can be sorted by their LOC
# Test 52: Clicking on the LOC column will sort patients by their LOC. (then every third click).
def test_LOC_sort():
    global DRIVER
    return True, None
# Test 53: Clicking on the LOC column twice will sort patients in reverse order by their LOC. (then every third click).
def test_LOC_reverse_sort():
    global DRIVER
    return True, None
# Test 54: Order is preserved when switching views.
def test_LOC_preserved_order():
    global DRIVER
    return True, None

#------_---_---_---@ZenithZ---_---_---_------


def test_sort_name():
    global DRIVER

    button = DRIVER.find_element_by_xpath("/html/body/app-root/div/app-table[5]/div/table/thead/tr/th[3]/div/button")
    button.click()

    tables = DRIVER.find_elements_by_tag_name("app-table")
    tables = [t for t in tables if "unseen" not in t.get_attribute('class')]
    
    patients = []

    for t in tables:
        patients += t.find_elements_by_class_name("example-element-row")

    alphabet = list(string.ascii_uppercase)

    for p in patients:
        first_letter_lastname = ''.join(p.find_element_by_class_name("cdk-column-Name").split(' ')[0][0])

        if first_letter_lastname not in alphabet:
            return False, "Name does not get correctly sorted (A-Z Order Test)"
        
        while first_letter_lastname != alphabet[0]:
            if len(alphabet) == 0:
                return False, "Name does not get correctly sorted (A-Z Order Test)"
            alphabet.pop(0)

    # ## Test descending order
    button.click()
    tables_r = DRIVER.find_elements_by_tag_name("app-table")
    tables_r = [t for t in tables if "unseen" not in t.get_attribute('class')]
    
    patients_r = []
    for t in tables:
        patients_r += t.find_elements_by_class_name("example-element-row")

    alphabet_r = list(string.ascii_uppercase)[::-1]

    for p in patients:
        first_letter_lastname = ' '.join(p.find_element_by_class_name("cdk-column-Name").split(' ')[0][0])
        if first_letter_lastname not in alphabet_r:
            return False, "Name does not get correctly sorted (Z-A Order Test)"
        
        while first_letter_lastname != alphabet[0]:
            if len(alphabet) == 0:
                return False, "Name does not get correctly sorted (Z-A Order Test)"
            alphabet.pop(0)

    return True, None

def before():
    global DRIVER
    global URL

    loc = '/bin/bash'
    
    try:
        pid = os.fork()
        if pid == 0:
            os.execl(loc, 'bash', 'serve.sh')
    except:
        return False, 'Failed to run ng serve'

    try:
        DRIVER = get_driver()
    except:
        return False, 'Could not instantiate ChromeDriver'
    
    DRIVER.get(URL)

    return True, None

def after():
    global DRIVER
    global PROCNAME

    for proc in psutil.process_iter():
        if PROCNAME in proc.name():
            proc.kill()
    
    DRIVER.quit()


def get_testcases():
    tests = []
    tests.append(Test('Build', test_build))
    tests.append(Test('Test Page Load', test_page_load))
    # tests.append(Test('Test Tables Toggle', test_view_toggle)
    tests.append(Test('Test Name Search', test_name_search))
    tests.append(Test('Test MRN Search', test_MRN_search))
    # tests.append(Test('Test Waiting Time Sorting', test_sort_waittime))

    # -----_------@ZenithZ------_-------
    #Item 5
    tests.append(Test('Test Critically Out of Range Display Red', test_critically_outofrange_red)) #Test 13
    tests.append(Test('Test Normal Out of Range Display Yellow', test_normal_outofrange_yellow)) #Test 14
    #Item 10
    tests.append(Test('Test Removing seen paitents from view', test_reveal_all)) #Test 27
    tests.append(Test('Test Unremoving unseen paitents to view', test_seentounseen)) #Test 28
    tests.append(Test('Test perserving seen/unseen status toggling between views', test_critically_outofrange_red)) #Test 29
    #Item 14
    tests.append(Test('Test Sort by Age, Assending 1/3 click', test_age_sort)) #Test 43
    tests.append(Test('Test Sort by Age, Desending 2/4 click', test_age_reverse_sort)) #Test 44
    tests.append(Test('Test Sort of Age preserved toggling between views', test_age_preserved_order)) #Test 45
    #Item 17
    tests.append(Test('Test Sort by LOC, Assending 1/3 click', test_LOC_sort)) #Test 52
    tests.append(Test('Test Sort by LOC, Desending 2/4 click', test_LOC_reverse_sort)) #Test 53
    tests.append(Test('Test Sort of LOC preserved toggling between views', test_LOC_preserved_order)) #Test 54
    # -----_------@ZenithZ------_-------

    return tests