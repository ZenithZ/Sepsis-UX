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

    DRIVER.refresh()

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

    DRIVER.refresh()

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

    DRIVER.refresh()

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

    DRIVER.refresh()

    patients = DRIVER.find_elements_by_xpath('//tr[contains(@class, "expandable")]')
    locs = [p.find_element_by_class_name('cdk-column-LOC').text for p in patients]
    
    for l in locs:
        if l != '15':
            return FAIL, 'LOC not default 15'

    return PASS, 'All expandable patients default LOC of 15'

# ---------------------------------- Test 20 ---------------------------------- #
def test_default_team_A_B():
    global DRIVER

    DRIVER.refresh()

    patients = DRIVER.find_elements_by_xpath('//tr[contains(@class, "expandable")]')
    teams = [p.find_element_by_class_name('cdk-column-Team').text for p in patients]
    
    for t in teams:
        if t != 'A' and t != 'B':
            return FAIL, 'Patient is not default to team A or B'

    return PASS, 'All expandable patients default team A or B'

# ---------------------------------- Test 21 ---------------------------------- #
def test_team_change():
    global DRIVER

    DRIVER.refresh()

    clear_notifications()
    toggle('team')

    allen = DRIVER.find_element_by_xpath('//*[@id="7092666054"]/td[9]/mat-form-field/div/div[1]/div')
    allen.click()

    time.sleep(0.125)

    B = DRIVER.find_element_by_xpath('//*[@id="mat-option-29"]/span')
    B.click()

    time.sleep(0.125)

    new_allen = DRIVER.find_element_by_xpath('/html/body/app-root/div/div/app-table[2]/div/table/tbody/tr[1]')
    if 'display' not in new_allen.get_attribute('class'):
        return FAIL, 'patient is not displayed in new team table'

    return PASS, 'patient team has been changed, and table updated appropriately'

# ---------------------------------- Test 32 ---------------------------------- #
def test_last_name():
    global DRIVER

    DRIVER.refresh()

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

    DRIVER.refresh()

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

    DRIVER.refresh()

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

# ---------------------------------------------------------------------------- #
#                                    Item 1                                    #
# ---------------------------------------------------------------------------- #

# ---------------------------------- Test 1 ---------------------------------- #

def test_columns_present():
    global DRIVER

    DRIVER.refresh()

    patients = DRIVER.find_elements_by_xpath('//tr[contains(@class, "expandable")]')
    for p in patients:
        cols = p.find_elements_by_tag_name('td')
        classes = [c.get_attribute('class') for c in cols]

        if len(classes) != 11:
            return FAIL, 'number of columns doesnt equal 11'

        if 'cdk-column-ATS' not in classes[0]:
            return FAIL, 'ATS column not detected'

        if 'cdk-column-Seen' not in classes[1]:
            return FAIL, 'Seen column not detected'

        if 'cdk-column-MRN' not in classes[2]:
            return FAIL, 'MRN column not detected'

        if 'cdk-column-Name' not in classes[3]:
            return FAIL, 'Name column not detected'

        if 'cdk-column-DOB' not in classes[4]:
            return FAIL, 'DOB column not detected'

        if 'cdk-column-Vitals' not in classes[5]:
            return FAIL, 'Vitals column not detected'

        if 'cdk-column-BG' not in classes[6]:
            return FAIL, 'BG column not detected'

        if 'cdk-column-LOC' not in classes[7]:
            return FAIL, 'LOC column not detected'

        if 'cdk-column-Team' not in classes[8]:
            return FAIL, 'Team column not detected'

        if 'cdk-column-Delta' not in classes[9]:
            return FAIL, 'Delta column not detected'

        if 'cdk-column-Sepsis' not in classes[10]:
            return FAIL, 'Sepsis column not detected'
    
    return PASS, 'all columns detected across all patients'

# ---------------------------------------------------------------------------- #
#                                    Item 4                                    #
# ---------------------------------------------------------------------------- #

# ---------------------------------- Test 8 ---------------------------------- #

def test_caution_icon():
    global DRIVER

    DRIVER.refresh()

    allen = DRIVER.find_element_by_xpath('//*[@id="7092666054"]')
    allen.click()

    vitals = DRIVER.find_element_by_xpath('/html/body/app-root/div/div/app-table/div/table/tbody/tr[2]/td/div/app-detail/div/mat-accordion[1]/mat-expansion-panel')
    vitals.click()

    table = DRIVER.find_element_by_xpath('//*[@id="cdk-accordion-child-0"]/div')
    values = table.find_elements_by_tag_name('tr')

    icons = values[1].find_elements_by_tag_name('mat-icon')
    if len(icons) > 0 or 'caution-icon' not in icons[0].get_attribute('class'):
        return FAIL, 'Body Temperature for Allen is not out of range'

    icons = values[2].find_elements_by_tag_name('mat-icon')
    if len(icons) < 1 or 'caution-icon' not in icons[0].get_attribute('class'):
        return FAIL, 'Pulse rate for Allen is out of range'

    return PASS, 'caution icons displayed correctly'

# ---------------------------------- Test 9 ---------------------------------- #

def test_warning_icon():
    global DRIVER

    DRIVER.refresh()

    allen = DRIVER.find_element_by_xpath('//*[@id="7092666054"]')
    allen.click()

    BG = DRIVER.find_element_by_xpath('/html/body/app-root/div/div/app-table/div/table/tbody/tr[2]/td/div/app-detail/div/mat-accordion[2]/mat-expansion-panel')
    BG.click()

    table = DRIVER.find_element_by_xpath('//*[@id="cdk-accordion-child-11"]/div')
    values = table.find_elements_by_tag_name('tr')

    icons = values[1].find_elements_by_tag_name('mat-icon')
    if len(icons) < 1 or 'warning-icon' not in icons[0].get_attribute('class'):
        return FAIL, 'BE for Allen is not out of range'

    icons = values[2].find_elements_by_tag_name('mat-icon')
    if len(icons) < 1 or 'caution-icon' not in icons[0].get_attribute('class'):
        return FAIL, 'Lactate for Allen is out of range'

    return PASS, 'Warning icons displayed correctly'

# ---------------------------------- Test 10 --------------------------------- #

def test_short_yellow():
    global DRIVER

    DRIVER.refresh()

    caution = DRIVER.find_element_by_xpath('//*[@id="7092666054"]/td[6]/div')
    if 'caution-icon' not in caution.get_attribute('class'):
        return FAIL, 'icon not yellow'

    return PASS, 'shorthand caution is displayed correctly'

# ---------------------------------- Test 11 --------------------------------- #

def test_short_red():
    global DRIVER

    DRIVER.refresh()

    caution = DRIVER.find_element_by_xpath('//*[@id="7092666054"]/td[7]/div')
    if 'warning-icon' not in caution.get_attribute('class'):
        return FAIL, 'icon not red'

    return PASS, 'shorthand warning is displayed correctly'

# ---------------------------------------------------------------------------- #
#                                    Item 5                                    #
# ---------------------------------------------------------------------------- #

# ---------------------------------- Test 12 --------------------------------- #

def test_left_border_warning():
    global DRIVER

    DRIVER.refresh()

    patients = DRIVER.find_elements_by_xpath('//tr[contains(@class, "expandable")]')
    for p in patients:
        risk = p.text.split()[-1]

        if risk == 'warning':
            if 'rgb(229, 57, 53)' not in p.find_elements_by_tag_name('td')[0].get_attribute('style'):
                return FAIL, 'red not in left border'
        else:
            if 'whitesmoke' not in p.find_elements_by_tag_name('td')[0].get_attribute('style'):
                return FAIL, 'whitesmoke not in left border'

    return PASS, 'caution left border correct'

# ---------------------------------- Test 13 --------------------------------- #

def test_left_border_caution():
    global DRIVER

    DRIVER.refresh()

    patients = DRIVER.find_elements_by_xpath('//tr[contains(@class, "expandable")]')
    for p in patients:
        risk = p.text.split()[-1]

        if risk == 'error':
            if 'rgb(254, 212, 76)' not in p.find_elements_by_tag_name('td')[0].get_attribute('style'):
                return FAIL, 'yellow not in left border'
        else:
            if 'whitesmoke' not in p.find_elements_by_tag_name('td')[0].get_attribute('style'):
                return FAIL, 'whitesmoke not in left border'

    return PASS, 'warning left border correct'

# ---------------------------------------------------------------------------- #
#                                    Item 6                                    #
# ---------------------------------------------------------------------------- #

# ---------------------------------- Test 14/16 --------------------------------- #
def test_waiting_caution():
    global DRIVER

    DRIVER.refresh()

    allen_exceeds = DRIVER.find_element_by_xpath('//*[@id="7092666054"]/td[10]')
    time = int(allen_exceeds.text.split(' ').split(':')[0])
    if time > 1:
        if 'error' not in allen_exceeds.text:
            return FAIL, 'caution icon not present'

    return PASS, 'caution icon present'

# ---------------------------------- Test 15 --------------------------------- #
def test_no_waiting_caution():
    global DRIVER

    DRIVER.refresh()

    allen_exceeds = DRIVER.find_element_by_xpath('//*[@id="7092666054"]/td[10]')
    time = int(allen_exceeds.text.split(' ').split(':')[0])
    if time < 1:
        if 'error' in allen_exceeds.text:
            return FAIL, 'caution icon present'

    return PASS, 'caution icon not present'

# ---------------------------------- Test 17 --------------------------------- #
def test_pause():
    global DRIVER

    DRIVER.refresh()

    search = DRIVER.find_element_by_id("mat-input-0")
    search.clear()

    search_name = " "
    search.send_keys(search_name)

    allen_time_before = DRIVER.find_element_by_xpath('//*[@id="7092666054"]/td[10]')
    allen_seen = DRIVER.find_element_by_xpath('//*[@id="mat-checkbox-1"]/label/div')
    allen_seen.click()
    time.sleep(61)
    allen_time_after = DRIVER.find_element_by_xpath('//*[@id="7092666054"]/td[10]')

    if allen_time_before.text != allen_time_after.text:
        return FAIL, 'time not the same, didnt pause'

    return PASS, 'time is the same after 1 minute, paused'

# ---------------------------------- Test 18 --------------------------------- #
def test_pause_icon():
    global DRIVER

    DRIVER.refresh()

    search = DRIVER.find_element_by_id("mat-input-0")
    search.clear()

    search_name = " "
    search.send_keys(search_name)

    allen_waittime = DRIVER.find_element_by_xpath('//*[@id="7092666054"]/td[10]')
    if 'pause_circle_outline' in allen_waittime:
        return FAIL, 'waittime should not be paused'
    allen_seen = DRIVER.find_element_by_xpath('//*[@id="mat-checkbox-1"]/label/div')
    allen_seen.click()
    allen_waittime = DRIVER.find_element_by_xpath('//*[@id="7092666054"]/td[10]')
    if 'pause_circle_outline' in allen_waittime:
        return FAIL, 'waittime should be paused'

    return PASS, 'waitime icon correctly shows after seen'


# ---------------------------------------------------------------------------- #
#                                    Item 9                                    #
# ---------------------------------------------------------------------------- #

# ---------------------------------- Test 22 --------------------------------- #



# Item 14: Patients can be sorted by their age
def comp_age(patients, comp):
    ages = [int(p.find_element_by_class_name('cdk-column-DOB').text) for p in patients]
    
    if len(ages) == 1:
        return True

    for i in range(len(ages) - 1):
        if not comp(ages[i], ages[i + 1]):
            return False

    return True
# Test 43: Clicking on the age column will sort patients by their age. (then every third click).
def test_age_sort():
    global DRIVER

    if not sort('age'):
        return FAIL, 'Could not click age header'

    patients = DRIVER.find_elements_by_xpath('//tr[contains(@class, "expandable")]')
    
    comp = lambda x, y: x < y

    if not comp_age(patients, comp):
        return FAIL, 'Sorting by age not performed correctly'

    # Cycling through until back to ascending order
    for i in range(3):
        if not sort('age'):
            return FAIL, 'Could not click age header'
    
    patients = DRIVER.find_elements_by_xpath('//tr[contains(@class, "expandable")]')

    if not comp_age(patients, comp):
        return FAIL, 'Sorting by age not performed correctly'

    return PASS, None
# Test 44: Clicking on the age column twice will sort patients in reverse order by their age. (then every third click).
def test_age_reverse_sort():
    global DRIVER
    for i in range(2):
        if not sort('age'):
            return FAIL, 'Could not click age header'

    patients = DRIVER.find_elements_by_xpath('//tr[contains(@class, "expandable")]')
    
    comp = lambda x, y: x > y

    if not comp_age(patients, comp):
        return FAIL, 'Sorting by age not performed correctly'

    # Cycling through until back to ascending order
    for i in range(3):
        if not sort('age'):
            return FAIL, 'Could not click age header'
    
    patients = DRIVER.find_elements_by_xpath('//tr[contains(@class, "expandable")]')
    
    if not comp_age(patients, comp):
        return FAIL, 'Sorting by age not performed correctly'

    return PASS, None
# Test 45: Order is preserved when switching views.
def test_age_preserved_order():
    global DRIVER
    if not toggle('ats'):
        return FAIL, 'Could not toggle views'

    comp = lambda x, y: x < y

    num_tables = len(DRIVER.find_elements_by_css_selector('app-table')) + 1
    for i in range(1, num_tables):
        if not sort('age', 'ats', i):
            return FAIL, 'Could not sort table'

        patients = [p for p in DRIVER.find_elements_by_xpath(f'//app-table[{i}]//tr[contains(@class, "expandable")]') if len(p.text) > 0]

        if not comp_age(patients, comp):
            return FAIL, 'Sorting by age in ATS tables not performed correctly'

    return PASS, None

# Item 17: Patients can be sorted by their LOC
def comp_LOC(patients, comp):
    loc = [int(p.find_element_by_class_name('cdk-column-LOC').text) for p in patients]

    if len(loc) == 1:
        return True

    for i in range(len(loc) - 1):
        if not comp(loc[i], loc[i + 1]):
            return False

    return True
# Test 52: Clicking on the LOC column will sort patients by their LOC. (then every third click).
def test_LOC_sort():
    global DRIVER
    if not sort('loc'):
        return FAIL, 'Could not click loc header'

    patients = DRIVER.find_elements_by_xpath('//tr[contains(@class, "expandable")]')
    
    comp = lambda x, y: x == y

    if not comp_LOC(patients, comp):
        return FAIL, 'Sorting by loc not performed correctly'

    # Cycling through until back to ascending order
    for i in range(3):
        if not sort('loc'):
            return FAIL, 'Could not click loc header'
    
    patients = DRIVER.find_elements_by_xpath('//tr[contains(@class, "expandable")]')

    if not comp_LOC(patients, comp):
        return FAIL, 'Sorting by loc not performed correctly'

    return PASS, None
# Test 53: Clicking on the LOC column twice will sort patients in reverse order by their LOC. (then every third click).
def test_LOC_reverse_sort():
    global DRIVER
    for i in range(2):
        if not sort('loc'):
            return FAIL, 'Could not click loc header'

    patients = DRIVER.find_elements_by_xpath('//tr[contains(@class, "expandable")]')
    
    comp = lambda x, y: x == y

    if not comp_LOC(patients, comp):
        return FAIL, 'Sorting by loc not performed correctly'

    # Cycling through until back to ascending order
    for i in range(3):
        if not sort('loc'):
            return FAIL, 'Could not click loc header'
    
    patients = DRIVER.find_elements_by_xpath('//tr[contains(@class, "expandable")]')
    
    if not comp_LOC(patients, comp):
        return FAIL, 'Sorting by loc not performed correctly'

    return PASS, None
# Test 54: Order is preserved when switching views.
def test_LOC_preserved_order():
    global DRIVER
    if not toggle('ats'):
        return FAIL, 'Could not toggle views'

    comp = lambda x, y: x == y

    num_tables = len(DRIVER.find_elements_by_css_selector('app-table')) + 1
    for i in range(1, num_tables):
        if not sort('loc', 'ats', i):
            return FAIL, 'Could not sort table'

        patients = [p for p in DRIVER.find_elements_by_xpath(f'//app-table[{i}]//tr[contains(@class, "expandable")]') if len(p.text) > 0]

        if not comp_waiting_time(patients, comp):
            return FAIL, 'Sorting by loc in ATS tables not performed correctly'

    return PASS, None

#------_---_---_---@ZenithZ---_---_---_------

def comp_name(patients, comp, part):
    names = []
    for p in patients:
        full_name = p.find_element_by_class_name('cdk-column-Name').text.split()
        if part == 'last':
            names.append(full_name[1])
        if part == 'full':
            names.append(' '.join([full_name[1], full_name[0]]))

    if len(names) == 1:
        return True, 'One patient is correctly sorted by default'

    for i in range(len(names) - 1):
        if not comp(names[i], names[i + 1]):
            return False, f'Expected {names[i]} to be before {names[i + 1]}'

    return True, f'All patients correctly sorted by {part} name'


def test_sort_last_name():
    global DRIVER

    if not sort('name'):
        return FAIL, 'Could not click name header'

    patients = DRIVER.find_elements_by_xpath('//tr[contains(@class, "expandable")]')
    
    comp = lambda x, y: x <= y

    res, msg = comp_name(patients, comp, 'last')
    if not res:
        return FAIL, msg

    # Cycling through until back to ascending order
    for i in range(3):
        if not sort('name'):
            return FAIL, 'Could not click name time header'
    
    patients = DRIVER.find_elements_by_xpath('//tr[contains(@class, "expandable")]')

    res, msg = comp_name(patients, comp, 'last')
    if not res:
        return FAIL, msg

    return PASS, None


def test_sort_full_name():
    global DRIVER

    if not sort('name'):
        return FAIL, 'Could not click name header'

    patients = DRIVER.find_elements_by_xpath('//tr[contains(@class, "expandable")]')
    
    comp = lambda x, y: x < y

    res, msg = comp_name(patients, comp, 'full')
    if not res:
        return FAIL, msg

    # Cycling through until back to ascending order
    for i in range(3):
        if not sort('name'):
            return FAIL, 'Could not click name time header'
    
    patients = DRIVER.find_elements_by_xpath('//tr[contains(@class, "expandable")]')

    res, msg = comp_name(patients, comp, 'full')
    if not res:
        return FAIL, msg

    return PASS, None


def test_sort_last_name_reverse():
    global DRIVER

    for i in range(2):
        if not sort('name'):
            return FAIL, 'Could not click name header'

    patients = DRIVER.find_elements_by_xpath('//tr[contains(@class, "expandable")]')
    
    comp = lambda x, y: x >= y

    res, msg = comp_name(patients, comp, 'last')
    if not res:
        return FAIL, msg

    # Cycling through until back to ascending order
    for i in range(3):
        if not sort('name'):
            return FAIL, 'Could not click name time header'
    
    patients = DRIVER.find_elements_by_xpath('//tr[contains(@class, "expandable")]')

    res, msg = comp_name(patients, comp, 'last')
    if not res:
        return FAIL, msg

    return PASS, None


def test_sort_last_name_toggle():
    global DRIVER

    if not toggle('ats'):
        return FAIL, 'Could not toggle views'

    comp = lambda x, y: x <= y

    num_tables = len(DRIVER.find_elements_by_css_selector('app-table')) + 1
    for i in range(1, num_tables):
        if not sort('name', 'ats', i):
            return FAIL, 'Could not sort table'

        patients = [p for p in DRIVER.find_elements_by_xpath(f'//app-table[{i}]//tr[contains(@class, "expandable")]') if len(p.text) > 0]

        if not comp_name(patients, comp, 'last'):
            return FAIL, 'Sorting by name in ATS tables not performed correctly'

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

def suspect_septic(mrn, new_cat=3, unsuspect=False):
    global DRIVER

    patient = DRIVER.find_element_by_id(mrn)
    if patient is None:
        return FAIL, 'Could not locate patient'
    
    if unsuspect:
        override = patient.find_element_by_class_name('cdk-column-Sepsis').find_elements_by_css_selector('mat-icon')[1]
    else:
        override = patient.find_element_by_class_name('cdk-column-Sepsis').find_element_by_css_selector('mat-icon')
    override.click()
    
    patient = DRIVER.find_element_by_id(mrn)
    if patient is None:
        return FAIL, 'Could not locate patient'
    
    new_ats = int(patient.find_element_by_class_name('cdk-column-ATS').text)
    if new_ats == new_cat:
        return PASS, None

    return FAIL, f'Incorrect ATS cat. Expected {new_cat} but was {new_ats}'


def test_ats_suspect_cat():
    global DRIVER

    # Testing with a patient in ATS cat 5
    res, msg = suspect_septic('1423017529')
    if not res:
        return res, msg 
    
    # Testing with a patient in ATS cat 4
    res, msg = suspect_septic('1091439687')
    if not res:
        return res, msg

    # Testing with a patient in ATS cat 3 (Boundary)
    res, msg = suspect_septic('3245321980')
    if not res:
        return res, msg

    # Testing with a patient in ATS cat 2 (Abnormal)
    res, msg = suspect_septic('7917279390', new_cat=2)
    if not res:
        return res, msg

    return PASS, 'Patients are in correct ATS cat'


def suspect_toggle(mrn, num, orig_cat, new_cat):
    for i in range(num):
        res, msg = suspect_septic(mrn, new_cat=new_cat)
        if not res:
            return res, msg

        res, msg = suspect_septic(mrn, unsuspect=True, new_cat=orig_cat)
        if not res:
            return res, msg

    return True, 'Patient cat behaves correctly'


def test_ats_suspect_toggle_cat():
    global DRIVER

    # Testing with a patient in ATS cat 5
    res, msg = suspect_toggle('1423017529', 2, 5, 3)

    # Testing with a patient in ATS cat 3 (Boundary)
    res, msg = suspect_toggle('3245321980', 2, 3, 3)
    if not res:
        return res, msg

    # Testing with a patient in ATS cat 2 (Abnormal)
    res, msg = suspect_toggle('7917279390', 2, 2, 2)
    if not res:
        return res, msg

    # Simulate indecisive user
    res, msg = suspect_toggle('1423017529', 50, 5, 3)
    if not res:
        return res, msg


    return PASS, 'Patients are in correct ATS cat'


def comp_waiting_time(patients, comp):
    wait_time = []
    for p in patients:
        waiting = p.find_element_by_class_name('cdk-column-Delta').text.split()[0]
        if 'd' in waiting:
            return False, 'Max possible waiting time was not upheld'
        hours = int(waiting.split(':')[0])
        mins = int(waiting.split(':')[1])
        wait_time.append(datetime.timedelta(hours=hours, minutes=mins))

    if len(wait_time) == 1:
        return True, 'One patient is correctly sorted by default'

    for i in range(len(wait_time) - 1):
        if not comp(wait_time[i], wait_time[i + 1]):
            return False, f'Expected {wait_time[i]} to be before {wait_time[i + 1]}'

    return True, 'All patients correctly sorted by time'


def test_sort_waiting_time():
    global DRIVER

    if not sort('waiting time'):
        return FAIL, 'Could not click waiting time header'

    patients = DRIVER.find_elements_by_xpath('//tr[contains(@class, "expandable")]')
    
    comp = lambda x, y: x > y

    res, msg = comp_waiting_time(patients, comp)
    if not res:
        return FAIL, msg

    # Cycling through until back to ascending order
    for i in range(3):
        if not sort('waiting time'):
            return FAIL, 'Could not click waiting time header'
    
    patients = DRIVER.find_elements_by_xpath('//tr[contains(@class, "expandable")]')

    res, msg = comp_waiting_time(patients, comp)
    if not res:
        return FAIL, msg

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
    tests.append(Test('Item 12 - Test 39a: Patient cat toggles if suspect changes', test_ats_suspect_toggle_cat))

    tests.append(Test('Item 18 - Test 55: Sort by Waiting Time, Ascending' , test_sort_waiting_time))
    tests.append(Test('Item 18 - Test 56: Sort by Waiting Time, Descending' , test_sort_waiting_time_reverse))
    tests.append(Test('Item 18 - Test 57: Sort by Waiting Time Toggle' , test_sort_waiting_time_view_toggle))

# ----------------------------------- @John ---------------------------------- #
#kill -9 `lsof -t -i:4200`
    tests.append(Test('Item 2 - Test 3: If vitals were done, clicking on the patient shows vitals with the same number of out of range values as indicated.', test_vitals_shown))
    tests.append(Test('Item 2 - Test 5: If bloodgas were done, clicking on the patient shows vitals with the same number of out of range values as indicated.', test_bloodgas_shown))
    tests.append(Test('Item 2 - Test 4: If brief results show x, there are no results.', test_no_bloodgas_shown))
    tests.append(Test('Item 7 - Test 19: LOC value is 15 for every patient.', test_LOC_15))
    tests.append(Test('Item 8 - Test 20: Value for team defaulted to one of the teams.', test_default_team_A_B))
    tests.append(Test('Item 8 - Test 21: Value for team can be changed (more than once).', test_team_change))
    tests.append(Test('Item 11 - Test 30: Search by MRN will reveal /a single patient matching that MRN.', test_last_name))
    tests.append(Test('Item 11 - Test 33: Searching by a patients last name will reveal all patients with that last name.', test_first_name))
    tests.append(Test('Item 11 - Test 35: Search by a patients name that doesnt exist should reveal no patients.', test_no_patient_name))

    tests.append(Test('Item 1 - Test 1: Columns, present', test_columns_present))
    tests.append(Test('Item 4 - Test 8: caution lab icons present', test_caution_icon))
    tests.append(Test('Item 4 - Test 9: warning lab icons present', test_warning_icon))
    tests.append(Test('Item 4 - Test 10: shorthand yellow icon row', test_short_yellow))
    tests.append(Test('Item 4 - Test 11: shorthand red icon row', test_short_red))
    tests.append(Test('Item 5 - Test 12: left border warning present', test_left_border_warning))
    tests.append(Test('Item 5 - Test 13: left border caution present', test_left_border_caution))
    tests.append(Test('Item 6 - Test 14/16: waittime caution present', test_waiting_caution))
    tests.append(Test('Item 6 - Test 15: waittime no caution present', test_no_waiting_caution))
    tests.append(Test('Item 6 - Test 17: pauses correctly', test_pause))
    tests.append(Test('Item 6 - Test 18: pause icon appears correctly', test_pause_icon))

# ----------------------------------------------------------------------------- #

    return tests