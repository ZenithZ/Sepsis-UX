import datetime
import os
from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains


import sys
import psutil
import time
import string

URL = 'http://localhost:4200'
PROCNAME = "ng serve"
DRIVER = None
SKIP = False
MAINTAIN = False
HEADLESS = True
PASS = True
FAIL = False
UNIMP = 'UNIMPLEMENTED'


def get_driver():
    global HEADLESS
    
    capabilities = DesiredCapabilities.CHROME
    capabilities['loggingPrefs'] = {'browser': 'ALL'}
    options = webdriver.ChromeOptions()
    
    if HEADLESS:
        options.add_argument("headless")
    options.add_argument("--window-size=900, 600")
    try:
        return webdriver.Chrome(executable_path="./chromedriver", desired_capabilities=capabilities, options=options)
    except:
        return webdriver.Chrome(executable_path="chromedriver", desired_capabilities=capabilities, options=options)
    
    raise Exception("Failed to instantiate driver")


class Test:
    def __init__(self, name, test):
        self.name = name
        self.test = test


def clear_notifications():
    global DRIVER

    notifications = DRIVER.find_elements_by_xpath('//*[@id="toast-container"]/div')

    for n in notifications:
        n.click()

    time.sleep(0.25)

    patients = DRIVER.find_elements_by_xpath('//tr[contains(@class, "expandable")]')
    glowing = [i if 'glow' in i.get_attribute('class') else None for i in patients]

    for g in glowing:
        if g != None:
            g.click()
            time.sleep(0.25)
            g.click()

    return True


def toggle(view):
    global DRIVER

    view_toggle = DRIVER.find_element_by_class_name('mat-form-field-suffix')
    view_toggle.click()

    views = ['combined', 'ats', 'team']
    index = { views[i] : i for i in range(len(views)) }[view.lower()]

    time.sleep(0.25)
    
    views = DRIVER.find_elements_by_class_name('mat-menu-item')
    
    if len(views) != 3:
        return False
    
    try:
        ActionChains(DRIVER).click(views[index]).perform()
    except:
        return False

    time.sleep(0.25)
    return True


def sort(colname, view='combined', table=''):
    global DRIVER

    cols = ['ats', 'seen', 'mrn', 'name', 'age', 'vitals', 'bloodgas', 'loc', 'team', 'waiting time', 'suspect']
    th = { cols[i] : i + 1 for i in range(len(cols))}[colname.lower()]

    tab = ''
    if not view.lower() == 'combined':
        tab = f'[{table}]'
    
    xpath = f'/html/body/app-root/div/div/app-table{tab}/div/table/thead/tr/th[{th}]/div/button'

    try:
        sort_button = DRIVER.find_element_by_xpath(xpath)
        sort_button.click()
    except:
        return False

    time.sleep(0.1)
    return True


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


def test_name_search():
    global DRIVER

    search = DRIVER.find_element_by_id("mat-input-0")
    if not search:
        return FAIL, 'Search did not produce correct results'

    search.clear()
    search_name = "john"
    search.send_keys(search_name)
    names = DRIVER.find_elements_by_xpath("//td[contains(@class, 'Name')]")
    if len(names) > 0:
        for name in names:
            if len(name.text) > 1 and not search_name in name.text.lower():
                return FAIL, 'Search did not produce correct results'

    search.clear()
    search_name = "ee"
    search.send_keys(search_name)
    names = DRIVER.find_elements_by_xpath("//td[contains(@class, 'Name')]")
    if len(names) > 0:
        for name in names:
            if not search_name in name.text.lower():
                return FAIL, 'Search did not produce correct results'

    search.clear()
    search_name = "asjdfioasjfioejaiofjsiofjoi"
    search.send_keys(search_name)
    names = DRIVER.find_elements_by_xpath("//td[contains(@class, 'Name')]")
    if len(names) > 0:
        return FAIL, 'Search did not produce correct results'

    return PASS, None


def test_MRN_search():
    global DRIVER

    search = DRIVER.find_element_by_id("mat-input-0")
    if not search:
        return FAIL, 'Search did not produce correct results'
    
    search.clear()
    search_MRN = "1091439687"
    search.send_keys(search_MRN)
    mrns = DRIVER.find_elements_by_xpath("//td[contains(@class, 'MRN')]")
    if len(mrns) > 0:
        for mrn in mrns:
            if len(mrn.text) > 1 and not search_MRN in mrn.text.lower():
                return FAIL, 'Search did not produce correct results'

    search.clear()
    search_MRN = "99999999999999999999999999"
    search.send_keys(search_MRN)
    mrns = DRIVER.find_elements_by_xpath("//td[contains(@class, 'MRN')]")
    if len(mrns) > 0:
        return FAIL, 'Search did not produce correct results'

    return PASS, None

# ---------------------------------------------------------------------------- #
#                                  John Spicer                                 #
# ---------------------------------------------------------------------------- #
# ----------------------------- Item 2, 7, 8, 11 ----------------------------- #
# ---------------------------------- Test 3 ---------------------------------- #
def test_vitals_shown():
    global DRIVER

    vital_positive = DRIVER.find_element_by_xpath('//*[@id="7092666054"]')
    vital_positive.click()

    time.sleep(0.25)

    vital_table = DRIVER.find_element_by_xpath('/html/body/app-root/div/div/app-table/div/table/tbody/tr[2]/td/div/app-detail/div/mat-accordion[1]/mat-expansion-panel')
    vital_table.click()

    vitals_shown = DRIVER.find_element_by_xpath('/html/body/app-root/div/div/app-table/div/table/tbody/tr[2]/td/div/app-detail/div/div[1]')
    if vitals_shown.text != 'Vitals':
        vital_positive.click()
        return FAIL, 'Vital table not shown'

    num_vitals_text = DRIVER.find_element_by_xpath('//*[@id="mat-expansion-panel-header-0"]/span[1]/mat-panel-description')
    number_in_text = num_vitals_text.text.split(' ')[2]
    num_vitals_icon = DRIVER.find_element_by_xpath('//*[@id="7092666054"]/td[6]/div/sub')
    if number_in_text != num_vitals_icon.text:
        vital_positive.click()
        return FAIL, 'Vital icon and text number not consistent'

    vital_positive.click()
    return PASS, 'Vital table correctly shown, and correct icon and text number'

# ---------------------------------- Test 5 ---------------------------------- #
def test_bloodgas_shown():
    global DRIVER

    bG_positive = DRIVER.find_element_by_xpath('//*[@id="7092666054"]')
    bG_positive.click()

    time.sleep(0.25)

    bG_table = DRIVER.find_element_by_xpath('/html/body/app-root/div/div/app-table/div/table/tbody/tr[2]/td/div/app-detail/div/mat-accordion[2]/mat-expansion-panel')
    bG_table.click()

    bG_shown = DRIVER.find_element_by_xpath('/html/body/app-root/div/div/app-table/div/table/tbody/tr[2]/td/div/app-detail/div/div[2]')
    if bG_shown.text != 'Bloodgas':
        bG_positive.click()
        return FAIL, 'Bloodgas table not shown'

    num_BG_text = DRIVER.find_element_by_xpath('//*[@id="mat-expansion-panel-header-11"]/span[1]/mat-panel-description')
    number_in_text = num_BG_text.text.split(' ')[2]
    num_BG_icon = DRIVER.find_element_by_xpath('//*[@id="7092666054"]/td[7]/div/sub')
    if number_in_text != num_BG_icon.text:
        bG_positive.click()
        return FAIL, 'Bloodgas icon and text number not consistent'

    bG_positive.click()
    return PASS, 'Bloodgas table correctly shown, and correct icon and text number'

# ---------------------------------- Test 4 ---------------------------------- #
def test_no_bloodgas_shown():
    global DRIVER

    bG_positive = DRIVER.find_element_by_xpath('//*[@id="6781046174"]')
    bG_positive.click()

    time.sleep(0.25)

    tables_shown = DRIVER.find_element_by_xpath('/html/body/app-root/div/div/app-table/div/table/tbody/tr[8]/td/div')
    if 'Bloodgas' in tables_shown.text:
        return FAIL, 'Bloodgas table shown'

    bG_positive.click()
    return PASS, 'Bloodgas not shown, as no results'

# ---------------------------------- Test 5 ---------------------------------- #
def test_LOC_15():
    global DRIVER

    patients = DRIVER.find_elements_by_xpath('//tr[contains(@class, "expandable")]')
    locs = [p.find_element_by_class_name('cdk-column-LOC').text for p in patients]
    
    for l in locs:
        if l != '15':
            return FAIL, 'LOC not default 15'

    return PASS, 'All expandable patients default LOC of 15'

# ---------------------------------- Test 20 ---------------------------------- #
def test_default_team_A_B():
    global DRIVER

    patients = DRIVER.find_elements_by_xpath('//tr[contains(@class, "expandable")]')
    teams = [p.find_element_by_class_name('cdk-column-Team').text for p in patients]
    
    for t in teams:
        if t != 'A' and t != 'B':
            return FAIL, 'Patient is not default to team A or B'

    return PASS, 'All expandable patients default team A or B'

# ---------------------------------- Test 21 ---------------------------------- #
def test_team_change():
    global DRIVER
    clear_notifications()
    toggle('team')

    allen = DRIVER.find_element_by_xpath('//*[@id="7092666054"]/td[9]/mat-form-field/div/div[1]/div')
    allen.click()

    time.sleep(0.125)

    B = DRIVER.find_element_by_xpath('//*[@id="mat-option-53"]/span')
    B.click()

    time.sleep(0.125)

    new_allen = DRIVER.find_element_by_xpath('/html/body/app-root/div/div/app-table[2]/div/table/tbody/tr[1]')
    if 'display' not in new_allen.get_attribute('class'):
        return FAIL, 'patient is not displayed in new team table'

    return PASS, 'patient team has been changed, and table updated appropriately'

# ---------------------------------- Test 32 ---------------------------------- #
def test_last_name():
    global DRIVER

    search = DRIVER.find_element_by_id("mat-input-0")
    if not search:
        return FAIL, 'Search did not produce correct results'

    search.clear()
    search_name = "spicer"
    search.send_keys(search_name)
    names = DRIVER.find_elements_by_xpath("//td[contains(@class, 'Name')]")
    if len(names) > 0:
        for name in names:
            if len(name.text) > 1 and not search_name in name.text.lower():
                return FAIL, 'Search did not produce correct results'

    search.clear()

    return PASS, 'last name search correctly identifies patient'

# ---------------------------------- Test 33 ---------------------------------- #
def test_first_name():
    global DRIVER

    search = DRIVER.find_element_by_id("mat-input-0")
    if not search:
        return FAIL, 'Search did not produce correct results'

    search.clear()
    search_name = "john"
    search.send_keys(search_name)
    names = DRIVER.find_elements_by_xpath("//td[contains(@class, 'Name')]")
    if len(names) > 0:
        for name in names:
            if len(name.text) > 1 and not search_name in name.text.lower() and 'display' not in name.get_attribute('class'):
                return FAIL, 'Search did not produce correct results'
    
    search.clear()

    return PASS, 'last name search correctly identifies patient'

# ---------------------------------- Test 35 ---------------------------------- #
def test_no_patient_name():
    global DRIVER

    search = DRIVER.find_element_by_id("mat-input-0")
    if not search:
        return FAIL, 'Search did not produce correct results'

    search.clear()
    search_name = "bennyboi"
    search.send_keys(search_name)
    names = DRIVER.find_elements_by_xpath("//td[contains(@class, 'Name')]")
    if len(names) > 0:
        for name in names:
            if len(name.text) > 1:
                return FAIL, 'Search did not produce correct results'

    return PASS, 'last name search correctly doesnt find patient'

#------_---_---_---@ZenithZ---_---_---_----- -
# Item 5, 10, 14, 17
# Item 5: Test results of a patient are indicated (by colour) on the left of the patient summary.
# Test 12: Red if any test results are critically out of range.
def test_critically_outofrange_red():
    global DRIVER
    return UNIMP, 'Test not yet implemented'
# Test 13: Yellow if any test results are out of range and no results are critically out of range.
def test_normal_outofrange_yellow():
    global DRIVER
    return UNIMP, 'Test not yet implemented'

# Item 10: A nurse can toggle whether a patient has been seen
# Test 26: Search ' ' will reveal all patients, both seen and unseen.
def test_reveal_all():
    global DRIVER
    return UNIMP, 'Test not yet implemented'
# Test 27: Clicking on the seen checkbox will remove a patient from view (unseen patients).
def test_unseentoseen():
    global DRIVER
    return UNIMP, 'Test not yet implemented'
# Test 28: Searching and re-checking the seen checkbox will make the patient reappear (unseen patients).
def test_seentounseen():
    global DRIVER
    return UNIMP, 'Test not yet implemented'
# Test 29: Patients will remain seen if views are switched back and forth.
def seen_switching_views():
    global DRIVER
    return UNIMP, 'Test not yet implemented'

# Item 14: Patients can be sorted by their age
# Test 43: Clicking on the age column will sort patients by their age. (then every third click).
def test_age_sort():
    global DRIVER
    return UNIMP, 'Test not yet implemented'
# Test 44: Clicking on the age column twice will sort patients in reverse order by their age. (then every third click).
def test_age_reverse_sort():
    global DRIVER
    return UNIMP, 'Test not yet implemented'
# Test 45: Order is preserved when switching views.
def test_age_preserved_order():
    global DRIVER
    return UNIMP, 'Test not yet implemented'

# Item 17: Patients can be sorted by their LOC
# Test 52: Clicking on the LOC column will sort patients by their LOC. (then every third click).
def test_LOC_sort():
    global DRIVER
    return UNIMP, 'Test not yet implemented'
# Test 53: Clicking on the LOC column twice will sort patients in reverse order by their LOC. (then every third click).
def test_LOC_reverse_sort():
    global DRIVER
    return UNIMP, 'Test not yet implemented'
# Test 54: Order is preserved when switching views.
def test_LOC_preserved_order():
    global DRIVER
    return UNIMP, 'Test not yet implemented'

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
            return FAIL, "Name does not get correctly sorted (A-Z Order Test)"
        
        while first_letter_lastname != alphabet[0]:
            if len(alphabet) == 0:
                return FAIL, "Name does not get correctly sorted (A-Z Order Test)"
            alphabet.pop(0)

    # ## Test descending order
    button.click()
    tables_r = DRIVER.find_elements_by_tag_name("app-table")
    tables_r = [t for t in tables_r if "unseen" not in t.get_attribute('class')]
    
    patients_r = []
    for t in tables:
        patients_r += t.find_elements_by_class_name("example-element-row")

    alphabet_r = list(string.ascii_uppercase)[::-1]

    for p in patients:
        first_letter_lastname = ' '.join(p.find_element_by_class_name("cdk-column-Name").split(' ')[0][0])
        if first_letter_lastname not in alphabet_r:
            return FAIL, "Name does not get correctly sorted (Z-A Order Test)"
        
        while first_letter_lastname != alphabet[0]:
            if len(alphabet) == 0:
                return FAIL, "Name does not get correctly sorted (Z-A Order Test)"
            alphabet.pop(0)

    return PASS, None


def test_sort_sepsis():
    global DRIVER
    
    # Test in descending order
    tables = DRIVER.find_elements_by_tag_name("app-table")
    tables = [t for t in tables if "unseen" not in t.get_attribute('class')]

    patients = []

    for t in tables:
        patients += t.find_elements_by_class_name("example-element-row")

    ml = []

    for p in patients:
        # Enter the value of machine learning (Please help fix it if it is not collect properly)
        ml.append( p.find_element_by_class_name("cdk-column-ML") )

    for i in range(len(ml)-1):
        if ml[i] < ml[i+1]:
            return FAIL, 'Sepsis not get correctly sorted (descending order)'

    # Test in ascending order
    button = DRIVER.find_element_by_xpath("/html/body/app-root/div/app-table[5]/div/table/thead/tr/th[-1]/div/button")
    button.click()

    tables_r = DRIVER.find_elements_by_tag_name("app-table")
    tables_r = [t for t in tables_r if "unseen" not in t.get_attribute('class')]

    patients.clear()
    ml.clear()

    for t in tables_r:
        patients += t.find_elements_by_class_name("example-element-row")
    
    for p in patients:
        # Enter the value of machine learning (Please help fix it if it is not collect properly)
        ml.append( p.find_element_by_class_name("cdk-column-ML") )

    for i in range(len(ml)-1):
        if ml[i] > ml[i+1]:
            return FAIL, 'Sepsis not get correctly sorted (ascending order)'

    return PASS, None


def test_sort_BL():
    global DRIVER
    button = DRIVER.find_element_by_xpath("/html/body/app-root/div/app-table[5]/div/table/thead/tr/th[6]/div/button")
    button.click()
    
    # Test in ascending order
    tables = DRIVER.find_elements_by_tag_name("app-table")
    tables = [t for t in tables if "unseen" not in t.get_attribute('class')]

    patients = []

    for t in tables:
        patients += t.find_elements_by_class_name("example-element-row")
    
    # Store value of bloodgas out of range, numBLs[0] for warning, 1 for caution and 2 for normal
    numBLs = [[], [], []]

    # Used to test if it is ranged in the order of warning, caution and normal, store 2 for warning, 1 for caution and 0 for normal 
    orderTest = []

    for p in patients:
        # Enter the value of outofRange value (Please help fix it if it is not collect properly)
        maxBL = p.find_element_by_class_name("cdk-column-maxBloodgas")
        valueBL =  p.find_element_by_class_name("cdk-column-numBloodgas")
        if maxBL == 'warning':
            orderTest.append(2)
            numBLs[0].append(valueBL)
        elif maxBL == 'caution':
            orderTest.append(1)
            numBLs[1].append(valueBL)
        else:
            orderTest.append(0)
            numBLs[2].append(valueBL)

    for i in range(len(orderTest)-1):
        if orderTest[i] < orderTest[i+1]:
            return False, 'Bloodgas not get correctly sorted (descending order)'
    
    for i in range(len(numBLs)):
        try:
            for j in range(len(numBLs[i]) -1 ):
                if numBLs[i][j] < numBLs[i][j+1]:
                    return FAIL, 'Bloodgas not get correctly sorted (descending order)'
        except:
            continue
    # Test in ascending order
    button.click()
    
    tables_r = DRIVER.find_elements_by_tag_name("app-table")
    tables_r = [t for t in tables_r if "unseen" not in t.get_attribute('class')]

    patients.clear()
    for x in numBLs:
        x.clear()

    orderTest.clear()

    for t in tables_r:
        patients += t.find_elements_by_class_name("example-element-row")

    for p in patients:
        # Enter the value of outofRange value (Please help fix it if it is not collect properly)
        maxBL = p.find_element_by_class_name("cdk-column-maxBloodgas")
        valueBL =  p.find_element_by_class_name("cdk-column-numBloodgas")
        if maxBL == 'warning':
            orderTest.append(2)
            numBLs[0].append(valueBL)
        elif maxBL == 'caution':
            orderTest.append(1)
            numBLs[1].append(valueBL)
        else:
            orderTest.append(0)
            numBLs[2].append(valueBL)

    for i in range(len(orderTest)-1):
        if orderTest[i] > orderTest[i+1]:
            return FAIL, 'Bloodgas not get correctly sorted (ascending order)'
    
    for i in range(len(numBLs)):
        # Use Try in case it is the length is 0
        try:
            for j in range(len(numBLs[i])-1):
                if numBLs[i][j] > numBLs[i][j+1]:
                    return FAIL, 'Bloodgas not get correctly sorted (ascending order)'
        except:
            continue

    return PASS, None


def test_sort_Vitals():
    global DRIVER
    button = DRIVER.find_element_by_xpath("/html/body/app-root/div/app-table[5]/div/table/thead/tr/th[5]/div/button")
    button.click()
    
    # Test in ascending order
    tables = DRIVER.find_elements_by_tag_name("app-table")
    tables = [t for t in tables if "unseen" not in t.get_attribute('class')]

    patients = []

    for t in tables:
        patients += t.find_elements_by_class_name("example-element-row")
    
    # Store value of bloodgas out of range, numBLs[0] for warning, 1 for caution and 2 for normal
    numVitals = [[], [], []]

    # Used to test if it is ranged in the order of warning, caution and normal, store 2 for warning, 1 for caution and 0 for normal 
    orderTest = []

    for p in patients:
        # Enter the num of outofRange value (Please help fix it if it is not collect properly)
        maxVital = p.find_element_by_class_name("cdk-column-maxVitals")
        valueVital =  p.find_element_by_class_name("cdk-column-numVitals")

        if maxVital == 'warning':
            orderTest.append(2)
            numVitals[0].append(valueVital)
        elif maxVital == 'caution':
            orderTest.append(1)
            numVitals[1].append(valueVital)
        else:
            orderTest.append(0)
            numVitals[2].append(valueVital)

    for i in range(len(orderTest)-1):
        if orderTest[i] < orderTest[i+1]:
            return FAIL, 'Vitals not get correctly sorted (descending order)'
    
    for i in range(numVitals):
        try:
            for j in range(len(numVitals[i])-1):
                if numVitals[i][j] < numVitals[i][j+1]:
                    return FAIL, 'Vitals not get correctly sorted (descending order)'
        except:
            continue
    # Test in ascending order
    button.click()
    
    tables_r = DRIVER.find_elements_by_tag_name("app-table")
    tables_r = [t for t in tables_r if "unseen" not in t.get_attribute('class')]

    patients.clear()
    for x in numVitals:
        x.clear()

    orderTest.clear()

    for t in tables_r:
        patients += t.find_elements_by_class_name("example-element-row")

    for p in patients:
        # Enter the num of outofRange value (Please help fix it if it is not collect properly)
        maxVital = p.find_element_by_class_name("cdk-column-maxVitals")
        valueVital =  p.find_element_by_class_name("cdk-column-numVitals")

        if maxVital == 'warning':
            orderTest.append(2)
            numVitals[0].append(valueVital)
        elif maxVital == 'caution':
            orderTest.append(1)
            numVitals[1].append(valueVital)
        else:
            orderTest.append(0)
            numVitals[2].append(valueVital)

    for i in range(len(orderTest)-1):
        if orderTest[i] > orderTest[i+1]:
            return FAIL, 'Vitals not get correctly sorted (ascending order)'
    
    for i in range(len(numVitals)):
        try:
            for j in range(len(numVitals[i])-1):
                if numVitals[i][j] > numVitals[i][j+1]:
                    return FAIL, 'Vitals not get correctly sorted (descending order)'
        except:
            continue
    return PASS, None


def test_repeated_vitals():
    global DRIVER
    
    # Test known patient with 2 vitals tests performed
    patient = DRIVER.find_element_by_id("1091439687")
    if patient is None:
        return FAIL, 'Could not locate patient'

    patient.click()

    detail = [d for d in DRIVER.find_elements_by_xpath('//div[contains(@class, "ng-trigger-detailExpand")]') if len(d.text) > 0][0]
    date_times = [datetime.datetime.strptime(date_time.text, '%Y-%m-%d %H:%M:%S') for date_time in detail.find_elements_by_css_selector('mat-panel-title')]

    if len(date_times) != 2:
        return FAIL, f'Expected 2 tests, but got {len(date_times)}'

    for i in range(len(date_times) - 1):
        if (date_times[i] < date_times[i+1]):
            return FAIL, 'Vitals tests are not in the correct order'

    return PASS, None


def test_ats_toggle():
    global DRIVER

    if not toggle('ats'):
        return FAIL, 'Could not toggle to ATS tables'

    tables = DRIVER.find_elements_by_css_selector('app-table')

    if not len(tables) == 4:
        return FAIL, f'Expected 4 tables, but got {len(tables)}'

    if not toggle('combined'):
        return FAIL, 'Could not toggle back to Combined table'

    tables = DRIVER.find_elements_by_css_selector('app-table')

    if not len(tables) == 1:
        return FAIL, f'Expected 1 table, but got {len(tables)}'

    return PASS, None


def test_search_toggle_ats():
    global DRIVER

    search = DRIVER.find_element_by_id("mat-input-0")
    search.clear()

    search_name = "Allen Guo"
    search.send_keys(search_name)
    
    names = DRIVER.find_elements_by_xpath("//td[contains(@class, 'Name')]")

    if not len(names) == 1:
        return FAIL, f'Expected 1 patient, but got {len(names)}'

    if not toggle('ats'):
        return FAIL, 'Could not toggle to ATS tables'
    
    names = [n.text for n in DRIVER.find_elements_by_xpath("//td[contains(@class, 'Name')]") if len(n.text) > 0]

    if not len(names) == 1:
        return FAIL, f'After toggling, expected 1 patient but got {len(names)}'

    return PASS, None
    

def test_ats_table_correct():
    global DRIVER

    if not toggle('ats'):
        return FAIL, 'Could not toggle views'

    num_tables = len(DRIVER.find_elements_by_css_selector('app-table')) + 1
    for i in range(1, num_tables):
        patients = [p for p in DRIVER.find_elements_by_xpath(f'//app-table[{i}]//tr[contains(@class, "expandable")]') if len(p.text) > 0]

        for p in patients:
            if not int(p.find_element_by_class_name('cdk-column-ATS').text) == i + 1:
                return FAIL, 'Patient not in the correct ATS table'

    return PASS, None


def test_ats_suspect_cat():
    global DRIVER

    # Testing with a patient in ATS cat 5
    patient = DRIVER.find_element_by_id('1423017529')
    if patient is None:
        return FAIL, 'Could not locate patient'

    override = patient.find_element_by_class_name('cdk-column-Sepsis').find_element_by_css_selector('mat-icon')
    override.click()

    patient = DRIVER.find_element_by_id('1423017529')
    if patient is None:
        return FAIL, 'Could not locate patient after overriding sepsis'
    
    new_ats = int(patient.find_element_by_class_name('cdk-column-ATS').text)
    if not new_ats == 3:
        return FAIL, 'Patient did not change ATS cat to 3'
    
    # Testing with a patient in ATS cat 4
    patient = DRIVER.find_element_by_id('1091439687')
    if patient is None:
        return FAIL, 'Could not locate patient'

    override = patient.find_element_by_class_name('cdk-column-Sepsis').find_element_by_css_selector('mat-icon')
    override.click()

    patient = DRIVER.find_element_by_id('1091439687')
    if patient is None:
        return FAIL, 'Could not locate patient after overriding sepsis'
    
    new_ats = int(patient.find_element_by_class_name('cdk-column-ATS').text)
    if not new_ats == 3:
        return FAIL, 'Patient did not change ATS cat to 3'

    return PASS, None


def comp_waiting_time(patients, comp):
    wait_time = []
    for p in patients:
        waiting = p.find_element_by_class_name('cdk-column-Delta').text.split()[:2]
        days = int(waiting[0].replace('d', ''))
        hours = int(waiting[1].split(':')[0])
        mins = int(waiting[1].split(':')[1])
        wait_time.append(datetime.timedelta(days=days, hours=hours, minutes=mins))

    if len(wait_time) == 1:
        return True

    for i in range(len(wait_time) - 1):
        if not comp(wait_time[i], wait_time[i + 1]):
            return False

    return True


def test_sort_waiting_time():
    global DRIVER

    if not sort('waiting time'):
        return FAIL, 'Could not click waiting time header'

    patients = DRIVER.find_elements_by_xpath('//tr[contains(@class, "expandable")]')
    
    comp = lambda x, y: x > y

    if not comp_waiting_time(patients, comp):
        return FAIL, 'Sorting by wait time not performed correctly'

    # Cycling through until back to ascending order
    for i in range(3):
        if not sort('waiting time'):
            return FAIL, 'Could not click waiting time header'
    
    patients = DRIVER.find_elements_by_xpath('//tr[contains(@class, "expandable")]')

    if not comp_waiting_time(patients, comp):
        return FAIL, 'Sorting by wait time not performed correctly'

    return PASS, None


def test_sort_waiting_time_reverse():
    global DRIVER

    for i in range(2):
        if not sort('waiting time'):
            return FAIL, 'Could not click waiting time header'

    patients = DRIVER.find_elements_by_xpath('//tr[contains(@class, "expandable")]')
    
    comp = lambda x, y: x < y

    if not comp_waiting_time(patients, comp):
        return FAIL, 'Sorting by wait time not performed correctly'

    # Cycling through until back to ascending order
    for i in range(3):
        if not sort('waiting time'):
            return FAIL, 'Could not click waiting time header'
    
    patients = DRIVER.find_elements_by_xpath('//tr[contains(@class, "expandable")]')
    
    if not comp_waiting_time(patients, comp):
        return FAIL, 'Sorting by wait time not performed correctly'

    return PASS, None


def test_sort_waiting_time_view_toggle():
    global DRIVER

    if not toggle('ats'):
        return FAIL, 'Could not toggle views'

    comp = lambda x, y: x > y

    num_tables = len(DRIVER.find_elements_by_css_selector('app-table')) + 1
    for i in range(1, num_tables):
        if not sort('waiting time', 'ats', i):
            return FAIL, 'Could not sort table'

        patients = [p for p in DRIVER.find_elements_by_xpath(f'//app-table[{i}]//tr[contains(@class, "expandable")]') if len(p.text) > 0]

        if not comp_waiting_time(patients, comp):
            return FAIL, 'Sorting by wait time in ATS tables not performed correctly'

    return PASS, None


def before(skip=False, maintain=False, headless=True):
    global DRIVER
    global URL
    global SKIP
    global MAINTAIN
    global HEADLESS

    if skip:
        running = False
        for proc in psutil.process_iter():
            if PROCNAME in proc.name():
                running = True
                break
        if not running:
            raise Exception("Cannot run buildless without ng serve already running")
        SKIP = True
    else:
        loc = '/bin/bash'
        
        try:
            pid = os.fork()
            if pid == 0:
                os.execl(loc, 'bash', 'serve.sh')
        except:
            raise Exception('Failed to run ng serve')
    
    MAINTAIN = maintain
    HEADLESS = headless

    try:
        DRIVER = get_driver()
    except:
        raise Exception('Could not instantiate ChromeDriver')

    DRIVER.get(URL)


def after():
    global DRIVER
    global PROCNAME

    if not MAINTAIN:
        for proc in psutil.process_iter():
            if PROCNAME in proc.name():
                proc.kill()

    if DRIVER:
        DRIVER.quit()


def after_test(skip=False):
    global DRIVER

    if skip:
        return

    DRIVER.refresh()


def get_testcases():
    tests = []
    if not SKIP:
        tests.append(Test('Build', test_build))
    tests.append(Test('Test Page Load', test_page_load))
    tests.append(Test('Item 11 - Test 34: Searching by a patients full name will reveal all patients with that full name.', test_name_search))
    tests.append(Test('Item 11 - Test 30: Search by MRN will reveal a single patient matching that MRN.', test_MRN_search))

    tests.append(Test('Item 3 - Test 6: Repeated Vitals in order', test_repeated_vitals))

    tests.append(Test('Item 12 - Test 36: Tables can be toggle to ATS and back', test_ats_toggle))
    tests.append(Test('Item 12 - Test 37: Search maintained in ATS toggle' , test_search_toggle_ats))
    tests.append(Test('Item 12 - Test 38: Patients in correct ATS table' , test_ats_table_correct))
    tests.append(Test('Item 12 - Test 39: Patient moves tables if suspect' , test_ats_suspect_cat))

    tests.append(Test('Item 18 - Test 55: Sort by Waiting Time, Ascending' , test_sort_waiting_time))
    tests.append(Test('Item 18 - Test 56: Sort by Waiting Time, Descending' , test_sort_waiting_time_reverse))
    tests.append(Test('Item 18 - Test 57: Sort by Waiting Time Toggle' , test_sort_waiting_time_view_toggle))

    # tests.append(Test('Test Name Sort', test_sort_name))
    # tests.append(Test('Test Suspection of Sepsis Sort', test_sort_sepsis))
    # tests.append(Test('Test Vitals Sort', test_sort_Vitals))
    # tests.append(Test('Test Bloodgas Sort', test_sort_BL))

    # -----_------@ZenithZ------_-------
    #sudo kill `sudo lsof -t -i:4200`
    #Item 5
    tests.append(Test('Item 5 - Test 13: Critically Out of Range Display Red', test_critically_outofrange_red)) #Test 13
    tests.append(Test('Item 5 - Test 14: Normal Out of Range Display Yellow', test_normal_outofrange_yellow)) #Test 14
    #Item 10
    tests.append(Test('Item 10 - Test 27: Removing seen paitents from view', test_reveal_all)) #Test 27
    tests.append(Test('Item 10 - Test 28: Unremoving unseen paitents to view', test_seentounseen)) #Test 28
    tests.append(Test('Item 10 - Test 29: perserving seen/unseen status toggling between views', test_critically_outofrange_red)) #Test 29
    #Item 14
    tests.append(Test('Item 14 - Test 43: Sort by Age, Assending 1/3 click', test_age_sort)) #Test 43
    tests.append(Test('Item 14 - Test 44: Sort by Age, Desending 2/4 click', test_age_reverse_sort)) #Test 44
    tests.append(Test('Item 14 - Test 45: Sort of Age preserved toggling between views', test_age_preserved_order)) #Test 45
    #Item 17
    tests.append(Test('Item 17 - Test 52: Sort by LOC, Assending 1/3 click', test_LOC_sort)) #Test 52
    tests.append(Test('Item 17 - Test 53: Sort by LOC, Desending 2/4 click', test_LOC_reverse_sort)) #Test 53
    tests.append(Test('Item 17 - Test 54: Sort of LOC preserved toggling between views', test_LOC_preserved_order)) #Test 54
    # -----_------@ZenithZ------_-------

# ----------------------------------- @John ---------------------------------- #
#kill -9 `lsof -t -i:4200`
    tests.append(Test('Item 2 - Test 3: If vitals were done, clicking on the patient shows vitals with the same number of out of range values as indicated.', test_vitals_shown))
    tests.append(Test('Item 2 - Test 3: Test 5: If bloodgas were done, clicking on the patient shows vitals with the same number of out of range values as indicated.', test_bloodgas_shown))
    tests.append(Test('Item 2 - Test 4: If brief results show x, there are no results.', test_no_bloodgas_shown))
    tests.append(Test('Item 7 - Test 19: LOC value is 15 for every patient.', test_LOC_15))
    tests.append(Test('Item 8 - Test 20: Value for team defaulted to one of the teams.', test_default_team_A_B))
    tests.append(Test('Item 8 - Test 21: Value for team can be changed (more than once).', test_team_change))
    tests.append(Test('Item 11 - Test 30: Search by MRN will reveal a single patient matching that MRN.', test_last_name))
    tests.append(Test('Item 11 - Test 32: Searching by a patients last name will reveal all patients with that last name.', test_first_name))
    tests.append(Test('Item 11 - Test 35: Search by a patients name that doesnt exist should reveal no patients.', test_no_patient_name))

# ----------------------------------------------------------------------------- #

    return tests