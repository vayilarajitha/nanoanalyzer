import os
import time
import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

FRONTEND_URL = os.environ.get('FRONTEND_URL', os.environ.get('BASE_URL', 'https://nanoanalyzer.onrender.com')).rstrip('/')
BACKEND_URL = os.environ.get('BACKEND_URL', os.environ.get('BASE_URL', 'https://nanoanalyzer.onrender.com')).rstrip('/')
BASE_URL = FRONTEND_URL

ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@nanoanalyzer.io')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')
RESEARCHER_EMAIL = os.environ.get('RESEARCHER_EMAIL', 'alex@nanoanalyzer.io')
RESEARCHER_PASSWORD = os.environ.get('RESEARCHER_PASSWORD', 'researcher123')

# Controlled Test Users for Data Isolation Verification (Step 4 & Step 8)
USER_A_EMAIL = os.environ.get('USER_A_EMAIL', 'selenium.user.a@example.com')
USER_A_PASSWORD = os.environ.get('USER_A_PASSWORD', 'SeleniumPassA123!')
USER_B_EMAIL = os.environ.get('USER_B_EMAIL', 'selenium.user.b@example.com')
USER_B_PASSWORD = os.environ.get('USER_B_PASSWORD', 'SeleniumPassB123!')

SCREENSHOTS_DIR = os.environ.get(
    'SCREENSHOTS_DIR',
    os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'test-results', 'screenshots')
)
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

def create_driver(headless=True):
    opts = Options()
    if headless:
        opts.add_argument('--headless=new')
    opts.add_argument('--disable-gpu')
    opts.add_argument('--no-sandbox')
    opts.add_argument('--disable-dev-shm-usage')
    opts.add_argument('--window-size=1920,1080')
    opts.add_argument('--disable-extensions')
    opts.add_argument('--disable-renderer-backgrounding')
    opts.add_argument('--disable-backgrounding-occluded-windows')
    opts.add_argument('--dns-prefetch-disable')
    opts.add_argument('--log-level=3')
    opts.page_load_strategy = 'normal'
    
    driver = webdriver.Chrome(options=opts)
    driver.set_page_load_timeout(40)
    driver.implicitly_wait(6)
    return driver

def capture_screenshot(driver, test_id):
    """Saves failure screenshot named TCxxx_failure.png as required by Step 6."""
    filename = f"{test_id}_failure.png"
    filepath = os.path.join(SCREENSHOTS_DIR, filename)
    try:
        driver.save_screenshot(filepath)
        return filepath
    except Exception:
        return ""

def login_user(driver, email=RESEARCHER_EMAIL, password=RESEARCHER_PASSWORD):
    driver.get(f"{BASE_URL}/login.php")
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.NAME, "email")))
    
    email_input = driver.find_element(By.NAME, "email")
    email_input.clear()
    email_input.send_keys(email)
    
    pass_input = driver.find_element(By.NAME, "password")
    pass_input.clear()
    pass_input.send_keys(password)
    
    submit_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
    submit_btn.click()
    
    WebDriverWait(driver, 10).until(lambda d: "dashboard.php" in d.current_url or "admin" in d.current_url)

def logout_user(driver):
    try:
        driver.get(f"{BASE_URL}/logout.php")
        WebDriverWait(driver, 10).until(lambda d: "login.php" in d.current_url)
    except Exception:
        try:
            driver.get(f"{BASE_URL}/login.php")
        except Exception:
            pass

def register_if_needed(driver, full_name, username, email, password, institution="Nanotech Lab"):
    """Ensures a controlled test user exists. If already registered, simply logs in."""
    driver.get(f"{BASE_URL}/register.php")
    try:
        WebDriverWait(driver, 6).until(EC.presence_of_element_located((By.NAME, "full_name")))
        driver.find_element(By.NAME, "full_name").send_keys(full_name)
        driver.find_element(By.NAME, "username").send_keys(username)
        driver.find_element(By.NAME, "institution").send_keys(institution)
        driver.find_element(By.NAME, "email").send_keys(email)
        driver.find_element(By.NAME, "password").send_keys(password)
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        WebDriverWait(driver, 8).until(lambda d: "dashboard.php" in d.current_url or "register.php" in d.current_url)
    except Exception:
        pass
    
    # If registration showed 'already registered', log in
    if "dashboard.php" not in driver.current_url:
        login_user(driver, email=email, password=password)
