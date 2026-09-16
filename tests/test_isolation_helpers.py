"""
NanoAnalyzer Data Isolation & Security Verification Helpers (Step 4 & Step 8)
Provides structured helpers for cross-user isolation verification,
ensuring User A and User B cannot view or tamper with each other's datasets,
predictions, history, or laboratory experiments.
"""

import time
import requests
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from .test_config import (
    BASE_URL,
    USER_A_EMAIL,
    USER_A_PASSWORD,
    USER_B_EMAIL,
    USER_B_PASSWORD,
    login_user,
    logout_user,
    register_if_needed
)

DATASET_A_NAME = "Selenium_Dataset_A"
DATASET_B_NAME = "Selenium_Dataset_B"

def ensure_user_a(driver):
    logout_user(driver)
    register_if_needed(driver, "Dr. Selenium User A", "sel_user_a", USER_A_EMAIL, USER_A_PASSWORD, "User A Institute")

def ensure_user_b(driver):
    logout_user(driver)
    register_if_needed(driver, "Dr. Selenium User B", "sel_user_b", USER_B_EMAIL, USER_B_PASSWORD, "User B Institute")

def create_dataset_via_api(driver, name, material="Gold (Au)", size=45.0, charge=15.0):
    cookies = {c['name']: c['value'] for c in driver.get_cookies()}
    r = requests.post(f"{BASE_URL}/ajax/dataset_crud.php", data={
        'action': 'create',
        'name': name,
        'core_material': material,
        'size_nm': size,
        'surface_charge_mv': charge
    }, cookies=cookies, timeout=10)
    return r.status_code == 200 and r.json().get('status') == 'success'

def get_user_dataset_names(driver):
    driver.get(f"{BASE_URL}/datasets.php")
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
    table_text = driver.find_element(By.TAG_NAME, "body").text
    return table_text
