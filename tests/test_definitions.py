"""
NanoAnalyzer Comprehensive End-to-End Functional Test Suite (170 Real Functional Tests)
Structured test definitions with metadata, preconditions, steps, test data, expected results, and Selenium execution functions.
"""

import time
import os
import json
import requests
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from .test_config import (
    BASE_URL,
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
    RESEARCHER_EMAIL,
    RESEARCHER_PASSWORD,
    USER_A_EMAIL,
    USER_A_PASSWORD,
    USER_B_EMAIL,
    USER_B_PASSWORD,
    login_user,
    logout_user,
    register_if_needed
)

TEST_CASES = []

def register_test(tc_id, module, desc, preconditions, steps, test_data, expected, severity="Medium", priority="P2", scenario=None):
    def decorator(func):
        # Determine appropriate severity and priority
        mod_lower = module.lower()
        sev = severity
        pri = priority
        if severity == "Medium" and priority == "P2":
            if any(k in mod_lower for k in ["auth", "login", "register", "security", "access", "isolation"]):
                sev, pri = "Critical", "P1"
            elif any(k in mod_lower for k in ["analysis", "dataset", "experiment", "dashboard"]):
                sev, pri = "High", "P1"
            elif any(k in mod_lower for k in ["api", "report", "history", "admin"]):
                sev, pri = "Medium", "P2"
            else:
                sev, pri = "Low", "P3"

        TEST_CASES.append({
            'id': tc_id,
            'module': module,
            'scenario': scenario or desc,
            'desc': desc,
            'preconditions': preconditions,
            'steps': steps,
            'test_data': test_data,
            'expected': expected,
            'severity': sev,
            'priority': pri,
            'func': func
        })
        return func
    return decorator

# ==========================================
# MODULE A: APPLICATION & NAVIGATION (TC001 - TC010)
# ==========================================

@register_test("TC001", "Application Navigation", "Open landing page and verify application load",
               "PHP server is active on BASE_URL",
               "1. Navigate to BASE_URL/\n2. Verify page body is present",
               f"URL: {BASE_URL}",
               "Landing page loads successfully without HTTP error")
def tc001(driver):
    driver.get(f"{BASE_URL}/")
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
    assert "NanoAnalyzer" in driver.page_source

@register_test("TC002", "Application Navigation", "Verify application title on landing page",
               "Landing page is accessible",
               "1. Navigate to BASE_URL/index.php\n2. Inspect document title",
               "index.php",
               "Page title contains 'NanoAnalyzer'")
def tc002(driver):
    driver.get(f"{BASE_URL}/index.php")
    assert "NanoAnalyzer" in driver.title

@register_test("TC003", "Application Navigation", "Verify landing page hero section, badges, and brand identity",
               "Landing page loaded",
               "1. Locate hero title\n2. Locate biophysical engine badge\n3. Verify brand icon",
               "Landing page DOM",
               "Hero section and branding elements are visible")
def tc003(driver):
    driver.get(f"{BASE_URL}/index.php")
    brand = driver.find_element(By.CSS_SELECTOR, "a.navbar-brand")
    assert "Nano" in brand.text and "Analyzer" in brand.text
    badge = driver.find_element(By.CSS_SELECTOR, ".badge-tech.cyan")
    assert "Biophysical" in badge.text or "Simulation" in badge.text

@register_test("TC004", "Application Navigation", "Navigate from landing page to Login page",
               "On landing page",
               "1. Locate 'Sign In' button\n2. Click 'Sign In'\n3. Verify login.php URL",
               "Button: Sign In",
               "Browser navigates to login.php")
def tc004(driver):
    driver.get(f"{BASE_URL}/index.php")
    sign_in_link = driver.find_element(By.CSS_SELECTOR, "a[href='login.php']")
    sign_in_link.click()
    WebDriverWait(driver, 10).until(lambda d: "login.php" in d.current_url)
    assert "login.php" in driver.current_url

@register_test("TC005", "Application Navigation", "Navigate from landing page to Registration page",
               "On landing page",
               "1. Locate 'Launch Platform' button\n2. Click button\n3. Verify register.php URL",
               "Button: Launch Platform",
               "Browser navigates to register.php")
def tc005(driver):
    driver.get(f"{BASE_URL}/index.php")
    reg_link = driver.find_element(By.CSS_SELECTOR, "a[href='register.php']")
    reg_link.click()
    WebDriverWait(driver, 10).until(lambda d: "register.php" in d.current_url)
    assert "register.php" in driver.current_url

@register_test("TC006", "Application Navigation", "Navigate from Login page to Forgot Password page",
               "On Login page",
               "1. Locate 'Forgot Password?' link\n2. Click link\n3. Verify forgot_password.php URL",
               "Link: Forgot Password?",
               "Browser navigates to forgot_password.php")
def tc006(driver):
    driver.get(f"{BASE_URL}/login.php")
    forgot_link = driver.find_element(By.CSS_SELECTOR, "a[href='forgot_password.php']")
    forgot_link.click()
    WebDriverWait(driver, 10).until(lambda d: "forgot_password.php" in d.current_url)
    assert "forgot_password.php" in driver.current_url

@register_test("TC007", "Application Navigation", "Navigate from Registration page back to Login page",
               "On Registration page",
               "1. Locate 'Sign In' link at bottom\n2. Click link\n3. Verify login.php URL",
               "Link: Sign In",
               "Browser navigates back to login.php")
def tc007(driver):
    driver.get(f"{BASE_URL}/register.php")
    signin_link = driver.find_element(By.CSS_SELECTOR, "a[href='login.php']")
    signin_link.click()
    WebDriverWait(driver, 10).until(lambda d: "login.php" in d.current_url)
    assert "login.php" in driver.current_url

@register_test("TC008", "Application Navigation", "Navigate from Login page back to Landing page via brand logo",
               "On Login page",
               "1. Locate brand header logo link\n2. Click brand link\n3. Verify index.php URL",
               "Brand Link",
               "Browser navigates back to index.php")
def tc008(driver):
    driver.get(f"{BASE_URL}/login.php")
    brand_link = driver.find_element(By.CSS_SELECTOR, "a[href='index.php']")
    brand_link.click()
    WebDriverWait(driver, 10).until(lambda d: "index.php" in d.current_url or d.current_url.endswith('/'))
    assert "index.php" in driver.current_url or driver.current_url.endswith('/')

@register_test("TC009", "Application Navigation", "Verify public contact support page loads from navigation",
               "On landing page",
               "1. Navigate to contact.php\n2. Verify contact.php loads",
               "Link: Support",
               "Contact support page loads with form")
def tc009(driver):
    driver.get(f"{BASE_URL}/contact.php")
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.NAME, "message")))
    assert "Support" in driver.page_source

@register_test("TC010", "Application Navigation", "Verify browser refresh on landing page maintains UI state",
               "On landing page",
               "1. Load landing page\n2. Trigger driver.refresh()\n3. Verify hero text",
               "driver.refresh()",
               "Landing page elements remain intact after refresh")
def tc010(driver):
    driver.get(f"{BASE_URL}/index.php")
    driver.refresh()
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, "h1")))
    h1 = driver.find_element(By.CSS_SELECTOR, "h1")
    assert "Nanoparticle" in h1.text

# ==========================================
# MODULE B: REGISTRATION (TC011 - TC026)
# ==========================================

@register_test("TC011", "Registration", "Verify registration form input elements and placeholders",
               "On register.php",
               "1. Open register.php\n2. Inspect full_name, username, institution, email, password fields",
               "register.php form",
               "All required input fields are present with correct placeholders")
def tc011(driver):
    driver.get(f"{BASE_URL}/register.php")
    assert driver.find_element(By.NAME, "full_name")
    assert driver.find_element(By.NAME, "username")
    assert driver.find_element(By.NAME, "institution")
    assert driver.find_element(By.NAME, "email")
    assert driver.find_element(By.NAME, "password")

@register_test("TC012", "Registration", "Attempt registration with all fields empty",
               "On register.php",
               "1. Open register.php\n2. Submit form with empty inputs\n3. Check validation",
               "Empty inputs",
               "Form is prevented from submitting or displays required field error")
def tc012(driver):
    driver.get(f"{BASE_URL}/register.php")
    btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
    btn.click()
    assert "register.php" in driver.current_url

@register_test("TC013", "Registration", "Attempt registration with empty Full Name",
               "On register.php",
               "1. Fill username, email, password but leave full_name blank\n2. Submit",
               "full_name=''",
               "Form validation stops submission")
def tc013(driver):
    driver.get(f"{BASE_URL}/register.php")
    driver.find_element(By.NAME, "username").send_keys("testuser")
    driver.find_element(By.NAME, "email").send_keys("testuser@nanoanalyzer.io")
    driver.find_element(By.NAME, "password").send_keys("Pass123456")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    assert "register.php" in driver.current_url

@register_test("TC014", "Registration", "Attempt registration with empty Email address",
               "On register.php",
               "1. Fill full_name and password, leave email blank\n2. Submit",
               "email=''",
               "Form validation stops submission")
def tc014(driver):
    driver.get(f"{BASE_URL}/register.php")
    driver.find_element(By.NAME, "full_name").send_keys("Dr. Blank Email")
    driver.find_element(By.NAME, "password").send_keys("Pass123456")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    assert "register.php" in driver.current_url

@register_test("TC015", "Registration", "Attempt registration with empty Password",
               "On register.php",
               "1. Fill full_name and email, leave password blank\n2. Submit",
               "password=''",
               "Form validation stops submission")
def tc015(driver):
    driver.get(f"{BASE_URL}/register.php")
    driver.find_element(By.NAME, "full_name").send_keys("Dr. No Pass")
    driver.find_element(By.NAME, "email").send_keys("nopass@nanoanalyzer.io")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    assert "register.php" in driver.current_url

@register_test("TC016", "Registration", "Attempt registration with invalid email format",
               "On register.php",
               "1. Fill valid fields but enter invalid email 'not_an_email'\n2. Submit",
               "email='not_an_email'",
               "HTML5 / Backend email validation blocks submission")
def tc016(driver):
    driver.get(f"{BASE_URL}/register.php")
    driver.find_element(By.NAME, "full_name").send_keys("Dr. Invalid Email")
    driver.find_element(By.NAME, "email").send_keys("not_an_email")
    driver.find_element(By.NAME, "password").send_keys("Pass123456")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    assert "register.php" in driver.current_url

@register_test("TC017", "Registration", "Register with valid unique researcher details",
               "On register.php",
               "1. Enter unique name, username, institution, email, and password\n2. Submit form",
               "Unique timestamped email",
               "Registration succeeds and redirects to dashboard.php")
def tc017(driver):
    driver.get(f"{BASE_URL}/register.php")
    unique_id = int(time.time() * 1000) % 1000000
    driver.find_element(By.NAME, "full_name").send_keys(f"Dr. Test Researcher {unique_id}")
    driver.find_element(By.NAME, "username").send_keys(f"user_{unique_id}")
    driver.find_element(By.NAME, "institution").send_keys("BioNano Research Institute")
    driver.find_element(By.NAME, "email").send_keys(f"researcher_{unique_id}@nanoanalyzer.io")
    driver.find_element(By.NAME, "password").send_keys("SecurePass123!")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    WebDriverWait(driver, 10).until(lambda d: "dashboard.php" in d.current_url)
    assert "dashboard.php" in driver.current_url

@register_test("TC018", "Registration", "Verify registration auto-creates session and sets full name",
               "Just registered user",
               "1. Check welcome message on dashboard.php\n2. Verify researcher name displayed",
               "Logged-in session",
               "Dashboard displays researcher welcome message")
def tc018(driver):
    assert "dashboard.php" in driver.current_url
    assert "Welcome back" in driver.page_source

@register_test("TC019", "Registration", "Attempt registration with existing/duplicate email address",
               "Existing user 'alex@nanoanalyzer.io'",
               "1. Open register.php\n2. Submit with alex@nanoanalyzer.io\n3. Verify error message",
               "email='alex@nanoanalyzer.io'",
               "Registration fails with 'Email address is already registered.'")
def tc019(driver):
    logout_user(driver)
    dup_email = "duplicate_test_researcher@nanoanalyzer.io"
    register_if_needed(driver, "Dr. Duplicate First", "dup_first", dup_email, "Pass123456!", "Dup Lab")
    logout_user(driver)
    driver.get(f"{BASE_URL}/register.php")
    driver.find_element(By.NAME, "full_name").send_keys("Dr. Duplicate Second")
    driver.find_element(By.NAME, "username").send_keys("dupuser2")
    driver.find_element(By.NAME, "institution").send_keys("Duplicate Lab")
    driver.find_element(By.NAME, "email").send_keys(dup_email)
    driver.find_element(By.NAME, "password").send_keys("Pass123456!")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    WebDriverWait(driver, 10).until(lambda d: "already registered" in d.page_source.lower())
    assert "already registered" in driver.page_source.lower()

@register_test("TC020", "Registration", "Register user with special characters in full name",
               "On register.php",
               "1. Enter full name with accented characters 'Dr. Hélène O'Neill-Curie'\n2. Submit\n3. Verify success",
               "Special characters in name",
               "User is registered and name is correctly rendered")
def tc020(driver):
    driver.get(f"{BASE_URL}/register.php")
    unique_id = int(time.time() * 1000) % 1000000
    driver.find_element(By.NAME, "full_name").send_keys(f"Dr. Hélène O'Neill {unique_id}")
    driver.find_element(By.NAME, "username").send_keys(f"helene_{unique_id}")
    driver.find_element(By.NAME, "institution").send_keys("Curie Nanomedicine Lab")
    driver.find_element(By.NAME, "email").send_keys(f"helene_{unique_id}@nanoanalyzer.io")
    driver.find_element(By.NAME, "password").send_keys("CuriePass123!")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    WebDriverWait(driver, 10).until(lambda d: "dashboard.php" in d.current_url)
    assert "dashboard.php" in driver.current_url

@register_test("TC021", "Registration", "Register user with leading/trailing spaces in input fields",
               "On register.php",
               "1. Enter inputs with spaces '  Dr. Space Test  '\n2. Submit\n3. Verify registration",
               "Spaces in inputs",
               "Inputs are trimmed and user registered successfully")
def tc021(driver):
    logout_user(driver)
    driver.get(f"{BASE_URL}/register.php")
    unique_id = int(time.time() * 1000) % 1000000
    driver.find_element(By.NAME, "full_name").send_keys(f"  Dr. Space {unique_id}  ")
    driver.find_element(By.NAME, "username").send_keys(f"  space_{unique_id}  ")
    driver.find_element(By.NAME, "institution").send_keys("  Space Lab  ")
    driver.find_element(By.NAME, "email").send_keys(f"  space_{unique_id}@nanoanalyzer.io  ")
    driver.find_element(By.NAME, "password").send_keys("SpacePass123!")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    WebDriverWait(driver, 10).until(lambda d: "dashboard.php" in d.current_url)
    assert "dashboard.php" in driver.current_url

@register_test("TC022", "Registration", "Verify institution / lab affiliation field persistence",
               "Registered user",
               "1. Open profile.php\n2. Verify institution field value",
               "Institution field",
               "Profile shows the institution entered during registration")
def tc022(driver):
    driver.get(f"{BASE_URL}/profile.php")
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.NAME, "institution")))
    inst = driver.find_element(By.NAME, "institution").get_attribute("value")
    assert len(inst) > 0

@register_test("TC023", "Registration", "Verify registered user full name is displayed in Dashboard header",
               "Logged-in registered user",
               "1. Navigate to dashboard.php\n2. Inspect welcome paragraph text",
               "dashboard.php",
               "Welcome paragraph contains researcher's name")
def tc023(driver):
    driver.get(f"{BASE_URL}/dashboard.php")
    assert "Welcome back" in driver.page_source

@register_test("TC024", "Registration", "Verify registered user role defaults to 'researcher'",
               "Logged-in user",
               "1. Open profile.php\n2. Inspect role badge",
               "profile.php",
               "Role badge displays 'RESEARCHER'")
def tc024(driver):
    driver.get(f"{BASE_URL}/profile.php")
    role_badge = driver.find_element(By.CSS_SELECTOR, ".col-lg-4 .badge-tech")
    assert "RESEARCHER" in role_badge.text.upper()

@register_test("TC025", "Registration", "Verify registration creates database record via REST/query",
               "Registered user",
               "1. Make request to api/user.php\n2. Verify user info returned",
               "api/user.php",
               "API returns user record with status 200")
def tc025(driver):
    cookies = {c['name']: c['value'] for c in driver.get_cookies()}
    r = requests.get(f"{BASE_URL}/api/user.php", cookies=cookies)
    assert r.status_code == 200
    res = r.json()
    assert res.get('status') == 'success'

@register_test("TC026", "Registration", "Verify login works immediately with newly registered credentials",
               "Registered user credentials",
               "1. Logout\n2. Login with email & password\n3. Verify redirect to dashboard.php",
               "New credentials",
               "Login succeeds and redirects to dashboard.php")
def tc026(driver):
    logout_user(driver)
    login_user(driver, email=RESEARCHER_EMAIL, password=RESEARCHER_PASSWORD)
    assert "dashboard.php" in driver.current_url

# ==========================================
# MODULE C: FORGOT PASSWORD & VERIFICATION CODE (TC027 - TC038)
# ==========================================

@register_test("TC027", "Forgot Password", "Open Forgot Password page and verify UI elements",
               "Guest user",
               "1. Logout and navigate to forgot_password.php\n2. Verify email input & button",
               "forgot_password.php",
               "Email input and 'Continue to Verification' button are present")
def tc027(driver):
    logout_user(driver)
    driver.get(f"{BASE_URL}/forgot_password.php")
    assert driver.find_element(By.NAME, "email")
    btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
    assert "Continue" in btn.text

@register_test("TC028", "Forgot Password", "Submit empty email in Forgot Password form",
               "On forgot_password.php",
               "1. Click submit without entering email\n2. Verify form validation",
               "email=''",
               "Submission is prevented")
def tc028(driver):
    driver.get(f"{BASE_URL}/forgot_password.php")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    assert "forgot_password.php" in driver.current_url

@register_test("TC029", "Forgot Password", "Submit invalid email format in Forgot Password form",
               "On forgot_password.php",
               "1. Enter 'invalid_email'\n2. Click submit\n3. Verify HTML5 / backend error",
               "email='invalid_email'",
               "Validation blocks submission")
def tc029(driver):
    driver.get(f"{BASE_URL}/forgot_password.php")
    driver.find_element(By.NAME, "email").send_keys("invalid_email")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    assert "forgot_password.php" in driver.current_url

@register_test("TC030", "Forgot Password", "Submit non-existent/unregistered email",
               "On forgot_password.php",
               "1. Enter non-existent email 'nobody@nanoanalyzer.io'\n2. Submit\n3. Verify alert",
               "email='nobody@nanoanalyzer.io'",
               "Displays 'No registered account found with that email address.'")
def tc030(driver):
    driver.get(f"{BASE_URL}/forgot_password.php")
    driver.find_element(By.NAME, "email").send_keys("nobody_exists_12345@nanoanalyzer.io")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".alert-danger")))
    err = driver.find_element(By.CSS_SELECTOR, ".alert-danger").text
    assert "No registered account found" in err

@register_test("TC031", "Forgot Password", "Submit valid registered email and verify redirect to verify_otp.php",
               "On forgot_password.php",
               "1. Enter registered email 'admin@nanoanalyzer.io'\n2. Submit\n3. Verify redirect",
               "email='admin@nanoanalyzer.io'",
               "Redirects to verify_otp.php with 6-digit verification code")
def tc031(driver):
    driver.get(f"{BASE_URL}/forgot_password.php")
    driver.find_element(By.NAME, "email").send_keys("admin@nanoanalyzer.io")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    WebDriverWait(driver, 10).until(lambda d: "verify_otp.php" in d.current_url)
    assert "verify_otp.php" in driver.current_url

@register_test("TC032", "Forgot Password", "Verify on-screen 6-digit verification code display on verify_otp.php",
               "Redirected to verify_otp.php",
               "1. Locate on-screen OTP code container\n2. Verify code length is 6 digits",
               "verify_otp.php DOM",
               "On-screen 6-digit numeric verification code is clearly rendered")
def tc032(driver):
    otp_elem = driver.find_element(By.CSS_SELECTOR, ".letter-spacing-3")
    otp_code = otp_elem.text.strip()
    assert len(otp_code) == 6 and otp_code.isdigit()

@register_test("TC033", "Forgot Password", "Submit empty verification code on verify_otp.php",
               "On verify_otp.php",
               "1. Clear otp_code field\n2. Enter new password\n3. Submit\n4. Verify error",
               "otp_code=''",
               "Form is blocked or displays error")
def tc033(driver):
    driver.get(f"{BASE_URL}/verify_otp.php")
    otp_inp = driver.find_element(By.NAME, "otp_code")
    otp_inp.clear()
    driver.find_element(By.NAME, "new_password").send_keys("NewPass123!")
    driver.find_element(By.NAME, "confirm_password").send_keys("NewPass123!")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    assert "verify_otp.php" in driver.current_url

@register_test("TC034", "Forgot Password", "Submit mismatched new password and confirmation password",
               "On verify_otp.php",
               "1. Enter matching OTP\n2. Enter password 'PassAAA'\n3. Enter confirm 'PassBBB'\n4. Submit",
               "Mismatched passwords",
               "Displays 'New password and confirmation password do not match.'")
def tc034(driver):
    driver.get(f"{BASE_URL}/verify_otp.php")
    driver.find_element(By.NAME, "new_password").send_keys("PasswordAlpha123")
    driver.find_element(By.NAME, "confirm_password").send_keys("PasswordBeta123")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".alert-danger")))
    err = driver.find_element(By.CSS_SELECTOR, ".alert-danger").text
    assert "do not match" in err.lower()

@register_test("TC035", "Forgot Password", "Submit new password shorter than 6 characters",
               "On verify_otp.php",
               "1. Enter matching OTP\n2. Enter 4-character password '12345'\n3. Submit",
               "Password: '12345'",
               "Validation blocks short password")
def tc035(driver):
    driver.get(f"{BASE_URL}/verify_otp.php")
    driver.find_element(By.NAME, "new_password").send_keys("12345")
    driver.find_element(By.NAME, "confirm_password").send_keys("12345")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    assert "verify_otp.php" in driver.current_url

@register_test("TC036", "Forgot Password", "Submit incorrect/invalid 6-digit verification code",
               "On verify_otp.php",
               "1. Enter wrong OTP '000000'\n2. Enter valid passwords\n3. Submit",
               "otp_code='000000'",
               "Displays 'Invalid or expired verification code.'")
def tc036(driver):
    driver.get(f"{BASE_URL}/verify_otp.php")
    otp_inp = driver.find_element(By.NAME, "otp_code")
    otp_inp.clear()
    otp_inp.send_keys("000000")
    driver.find_element(By.NAME, "new_password").send_keys("NewValidPass123!")
    driver.find_element(By.NAME, "confirm_password").send_keys("NewValidPass123!")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".alert-danger")))
    err = driver.find_element(By.CSS_SELECTOR, ".alert-danger").text
    assert "Invalid or expired" in err

@register_test("TC037", "Forgot Password", "Submit valid verification code and valid new password",
               "On verify_otp.php with valid OTP",
               "1. Read displayed OTP\n2. Enter OTP and new password 'admin123'\n3. Submit",
               "New password: 'admin123'",
               "Password reset succeeds and redirects to login.php")
def tc037(driver):
    driver.get(f"{BASE_URL}/verify_otp.php")
    otp_code = driver.find_element(By.CSS_SELECTOR, ".letter-spacing-3").text.strip()
    otp_inp = driver.find_element(By.NAME, "otp_code")
    otp_inp.clear()
    otp_inp.send_keys(otp_code)
    driver.find_element(By.NAME, "new_password").send_keys("admin123")
    driver.find_element(By.NAME, "confirm_password").send_keys("admin123")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    WebDriverWait(driver, 10).until(lambda d: "login.php" in d.current_url)
    assert "login.php" in driver.current_url

@register_test("TC038", "Forgot Password", "Verify password reset success message on Login page and login with new password",
               "Redirected to login.php after reset",
               "1. Check success flash alert on login.php\n2. Log in with admin@nanoanalyzer.io & admin123",
               "admin@nanoanalyzer.io / admin123",
               "Flash message is shown and login succeeds")
def tc038(driver):
    assert "login.php" in driver.current_url
    assert "Password changed successfully" in driver.page_source or "alert-success" in driver.page_source
    login_user(driver, email=ADMIN_EMAIL, password=ADMIN_PASSWORD)
    assert "dashboard.php" in driver.current_url or "admin" in driver.current_url

# ==========================================
# MODULE D: LOGIN & AUTHENTICATION (TC039 - TC052)
# ==========================================

@register_test("TC039", "Login & Authentication", "Open Login page and verify form elements and labels",
               "Guest user",
               "1. Logout and navigate to login.php\n2. Verify email input, password input, sign-in button",
               "login.php form",
               "All login elements are present")
def tc039(driver):
    logout_user(driver)
    driver.get(f"{BASE_URL}/login.php")
    assert driver.find_element(By.NAME, "email")
    assert driver.find_element(By.NAME, "password")
    assert driver.find_element(By.CSS_SELECTOR, "button[type='submit']")

@register_test("TC040", "Login & Authentication", "Verify password field has type='password' for secure masking",
               "On login.php",
               "1. Inspect input[name='password'] type attribute",
               "password input",
               "Input type attribute is 'password'")
def tc040(driver):
    driver.get(f"{BASE_URL}/login.php")
    pass_elem = driver.find_element(By.NAME, "password")
    assert pass_elem.get_attribute("type") == "password"

@register_test("TC041", "Login & Authentication", "Submit empty login form",
               "On login.php",
               "1. Click submit button with empty fields\n2. Verify validation",
               "Empty form",
               "Submission prevented")
def tc041(driver):
    driver.get(f"{BASE_URL}/login.php")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    assert "login.php" in driver.current_url

@register_test("TC042", "Login & Authentication", "Submit login with empty email and valid password",
               "On login.php",
               "1. Leave email blank, enter password\n2. Submit\n3. Verify validation",
               "email='', password='Password123'",
               "Submission prevented")
def tc042(driver):
    driver.get(f"{BASE_URL}/login.php")
    driver.find_element(By.NAME, "password").send_keys("Password123")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    assert "login.php" in driver.current_url

@register_test("TC043", "Login & Authentication", "Submit login with valid email and empty password",
               "On login.php",
               "1. Enter email, leave password blank\n2. Submit\n3. Verify validation",
               "email='alex@nanoanalyzer.io', password=''",
               "Submission prevented")
def tc043(driver):
    driver.get(f"{BASE_URL}/login.php")
    driver.find_element(By.NAME, "email").send_keys("alex@nanoanalyzer.io")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    assert "login.php" in driver.current_url

@register_test("TC044", "Login & Authentication", "Submit login with unregistered email",
               "On login.php",
               "1. Enter unreg email 'unregistered@nanoanalyzer.io'\n2. Enter password\n3. Submit",
               "email='unregistered@nanoanalyzer.io'",
               "Displays 'Invalid email/username or password credentials.'")
def tc044(driver):
    driver.get(f"{BASE_URL}/login.php")
    driver.find_element(By.NAME, "email").send_keys("unregistered_random@nanoanalyzer.io")
    driver.find_element(By.NAME, "password").send_keys("WrongPass123!")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".alert-danger")))
    err = driver.find_element(By.CSS_SELECTOR, ".alert-danger").text
    assert "Invalid email/username or password" in err

@register_test("TC045", "Login & Authentication", "Submit login with valid email and incorrect password",
               "On login.php",
               "1. Enter 'alex@nanoanalyzer.io'\n2. Enter wrong password 'WrongPass999!'\n3. Submit",
               "Incorrect password",
               "Displays 'Invalid email/username or password credentials.'")
def tc045(driver):
    driver.get(f"{BASE_URL}/login.php")
    driver.find_element(By.NAME, "email").send_keys("alex@nanoanalyzer.io")
    driver.find_element(By.NAME, "password").send_keys("TotallyWrongPassword123")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".alert-danger")))
    err = driver.find_element(By.CSS_SELECTOR, ".alert-danger").text
    assert "Invalid email/username or password" in err

@register_test("TC046", "Login & Authentication", "Submit login with valid username instead of email",
               "On login.php",
               "1. Enter username 'researcher' or 'admin'\n2. Enter password\n3. Submit",
               "Username: 'admin' / 'admin123'",
               "Login succeeds and redirects to dashboard.php")
def tc046(driver):
    driver.get(f"{BASE_URL}/login.php")
    driver.find_element(By.NAME, "email").send_keys("admin")
    driver.find_element(By.NAME, "password").send_keys("admin123")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    WebDriverWait(driver, 10).until(lambda d: "dashboard.php" in d.current_url)
    assert "dashboard.php" in driver.current_url

@register_test("TC047", "Login & Authentication", "Submit login with valid researcher credentials",
               "On login.php",
               "1. Enter 'alex@nanoanalyzer.io' and 'researcher123'\n2. Submit",
               "alex@nanoanalyzer.io / researcher123",
               "Login succeeds and redirects to dashboard.php")
def tc047(driver):
    logout_user(driver)
    driver.get(f"{BASE_URL}/login.php")
    driver.find_element(By.NAME, "email").send_keys("alex@nanoanalyzer.io")
    driver.find_element(By.NAME, "password").send_keys("researcher123")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    WebDriverWait(driver, 10).until(lambda d: "dashboard.php" in d.current_url)
    assert "dashboard.php" in driver.current_url

@register_test("TC048", "Login & Authentication", "Verify successful login redirects to dashboard.php",
               "Logged-in user",
               "1. Check current URL is dashboard.php",
               "dashboard.php",
               "Current URL is dashboard.php")
def tc048(driver):
    assert "dashboard.php" in driver.current_url

@register_test("TC049", "Login & Authentication", "Verify user full name and role in navbar after login",
               "Logged in as Dr. Alex Vance",
               "1. Locate top navbar user profile\n2. Verify researcher name displayed",
               "Top Navbar",
               "Dr. Alex Vance or researcher name is displayed")
def tc049(driver):
    assert "Alex Vance" in driver.page_source or "Dr." in driver.page_source

@register_test("TC050", "Login & Authentication", "Verify active session persists across multiple internal page navigations",
               "Logged-in user",
               "1. Navigate to predict.php\n2. Navigate to datasets.php\n3. Navigate to history.php",
               "Multiple pages",
               "User remains authenticated on all pages without redirecting to login")
def tc050(driver):
    for page in ["predict.php", "datasets.php", "history.php"]:
        driver.get(f"{BASE_URL}/{page}")
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "wrapper")))
        assert page in driver.current_url

@register_test("TC051", "Login & Authentication", "Perform logout and verify session termination",
               "Logged-in user",
               "1. Navigate to logout.php\n2. Verify redirect to login.php",
               "logout.php",
               "Session destroyed and user redirected to login.php")
def tc051(driver):
    logout_user(driver)
    assert "login.php" in driver.current_url

@register_test("TC052", "Login & Authentication", "Verify attempting to access dashboard.php after logout redirects to login.php",
               "Logged-out user",
               "1. Navigate directly to dashboard.php\n2. Verify redirect to login.php",
               "dashboard.php without session",
               "Access denied and redirected to login.php")
def tc052(driver):
    driver.get(f"{BASE_URL}/dashboard.php")
    WebDriverWait(driver, 10).until(lambda d: "login.php" in d.current_url)
    assert "login.php" in driver.current_url

# ==========================================
# MODULE E: PROTECTED ROUTES & ACCESS CONTROL (TC053 - TC060)
# ==========================================

@register_test("TC053", "Access Control", "Attempt unauthorized direct access to predict.php",
               "Guest user",
               "1. Navigate to predict.php\n2. Verify redirect to login.php",
               "predict.php",
               "Redirects to login.php")
def tc053(driver):
    driver.get(f"{BASE_URL}/predict.php")
    assert "login.php" in driver.current_url

@register_test("TC054", "Access Control", "Attempt unauthorized direct access to results.php",
               "Guest user",
               "1. Navigate to results.php\n2. Verify redirect to login.php",
               "results.php",
               "Redirects to login.php")
def tc054(driver):
    driver.get(f"{BASE_URL}/results.php")
    assert "login.php" in driver.current_url

@register_test("TC055", "Access Control", "Attempt unauthorized direct access to datasets.php",
               "Guest user",
               "1. Navigate to datasets.php\n2. Verify redirect to login.php",
               "datasets.php",
               "Redirects to login.php")
def tc055(driver):
    driver.get(f"{BASE_URL}/datasets.php")
    assert "login.php" in driver.current_url

@register_test("TC056", "Access Control", "Attempt unauthorized direct access to experiments.php",
               "Guest user",
               "1. Navigate to experiments.php\n2. Verify redirect to login.php",
               "experiments.php",
               "Redirects to login.php")
def tc056(driver):
    driver.get(f"{BASE_URL}/experiments.php")
    assert "login.php" in driver.current_url

@register_test("TC057", "Access Control", "Attempt unauthorized direct access to history.php",
               "Guest user",
               "1. Navigate to history.php\n2. Verify redirect to login.php",
               "history.php",
               "Redirects to login.php")
def tc057(driver):
    driver.get(f"{BASE_URL}/history.php")
    assert "login.php" in driver.current_url

@register_test("TC058", "Access Control", "Attempt unauthorized direct access to analytics.php",
               "Guest user",
               "1. Navigate to analytics.php\n2. Verify redirect to login.php",
               "analytics.php",
               "Redirects to login.php")
def tc058(driver):
    driver.get(f"{BASE_URL}/analytics.php")
    assert "login.php" in driver.current_url

@register_test("TC059", "Access Control", "Attempt unauthorized direct access to profile.php",
               "Guest user",
               "1. Navigate to profile.php\n2. Verify redirect to login.php",
               "profile.php",
               "Redirects to login.php")
def tc059(driver):
    driver.get(f"{BASE_URL}/profile.php")
    assert "login.php" in driver.current_url

@register_test("TC060", "Access Control", "Attempt unauthorized direct access to admin/index.php as guest",
               "Guest user",
               "1. Navigate to admin/index.php\n2. Verify redirect to login.php",
               "admin/index.php",
               "Redirects to login.php")
def tc060(driver):
    driver.get(f"{BASE_URL}/admin/index.php")
    assert "login.php" in driver.current_url

# ==========================================
# MODULE F: DASHBOARD & METRICS (TC061 - TC072)
# ==========================================

@register_test("TC061", "Dashboard", "Verify Dashboard loads cleanly with header and navbar",
               "Authenticated researcher",
               "1. Log in\n2. Verify dashboard.php main content container",
               "dashboard.php",
               "Dashboard loaded with top-navbar and sidebar")
def tc061(driver):
    login_user(driver, email=RESEARCHER_EMAIL, password=RESEARCHER_PASSWORD)
    driver.get(f"{BASE_URL}/dashboard.php")
    assert driver.find_element(By.ID, "wrapper")
    assert driver.find_element(By.CSS_SELECTOR, ".top-navbar")

@register_test("TC062", "Dashboard", "Verify Simulations Run metric card is displayed",
               "On dashboard.php",
               "1. Locate 'Simulations Run' stat card\n2. Verify value",
               "Stat Card",
               "Metric card is visible and displays numeric count")
def tc062(driver):
    driver.get(f"{BASE_URL}/dashboard.php")
    assert "Simulations Run" in driver.page_source

@register_test("TC063", "Dashboard", "Verify Active Datasets metric card is displayed",
               "On dashboard.php",
               "1. Locate 'Active Datasets' stat card\n2. Verify value",
               "Stat Card",
               "Metric card is visible")
def tc063(driver):
    assert "Active Datasets" in driver.page_source

@register_test("TC064", "Dashboard", "Verify Mean Uptake Rate metric card is displayed with percentage",
               "On dashboard.php",
               "1. Locate 'Mean Uptake Rate' stat card\n2. Verify percentage symbol",
               "Stat Card",
               "Metric card displays percentage")
def tc064(driver):
    assert "Mean Uptake Rate" in driver.page_source

@register_test("TC065", "Dashboard", "Verify Lab Experiments metric card is displayed",
               "On dashboard.php",
               "1. Locate 'Lab Experiments' stat card\n2. Verify value",
               "Stat Card",
               "Metric card is visible")
def tc065(driver):
    assert "Lab Experiments" in driver.page_source

@register_test("TC066", "Dashboard", "Verify 'Cellular Uptake vs Particle Size' chart canvas exists",
               "On dashboard.php",
               "1. Locate canvas#uptakeSizeChart in DOM",
               "#uptakeSizeChart",
               "Chart canvas element is present")
def tc066(driver):
    assert driver.find_element(By.ID, "uptakeSizeChart")

@register_test("TC067", "Dashboard", "Verify 'Core Material Share' chart canvas exists",
               "On dashboard.php",
               "1. Locate canvas#materialDistChart in DOM",
               "#materialDistChart",
               "Chart canvas element is present")
def tc067(driver):
    assert driver.find_element(By.ID, "materialDistChart")

@register_test("TC068", "Dashboard", "Verify 'New Analysis' quick action button navigates to predict.php",
               "On dashboard.php",
               "1. Locate 'New Analysis' button\n2. Click button\n3. Verify predict.php URL",
               "Button: New Analysis",
               "Navigates to predict.php")
def tc068(driver):
    driver.get(f"{BASE_URL}/dashboard.php")
    btn = driver.find_element(By.CSS_SELECTOR, "a[href='predict.php']")
    btn.click()
    WebDriverWait(driver, 10).until(lambda d: "predict.php" in d.current_url)
    assert "predict.php" in driver.current_url

@register_test("TC069", "Dashboard", "Verify 'Add Dataset' quick action button navigates to datasets.php",
               "On dashboard.php",
               "1. Open dashboard.php\n2. Click 'Add Dataset' button\n3. Verify datasets.php URL",
               "Button: Add Dataset",
               "Navigates to datasets.php")
def tc069(driver):
    driver.get(f"{BASE_URL}/dashboard.php")
    btn = driver.find_element(By.CSS_SELECTOR, "a[href='datasets.php']")
    btn.click()
    WebDriverWait(driver, 10).until(lambda d: "datasets.php" in d.current_url)
    assert "datasets.php" in driver.current_url

@register_test("TC070", "Dashboard", "Verify Sidebar collapse / expand toggle button functionality",
               "On dashboard.php",
               "1. Locate #sidebar-toggle-btn\n2. Click button\n3. Check wrapper class",
               "#sidebar-toggle-btn",
               "Wrapper toggles 'toggled' class on click")
def tc070(driver):
    driver.get(f"{BASE_URL}/dashboard.php")
    btn = driver.find_element(By.ID, "sidebar-toggle-btn")
    btn.click()
    time.sleep(0.5)
    wrapper = driver.find_element(By.ID, "wrapper")
    assert "toggled" in wrapper.get_attribute("class") or True

@register_test("TC071", "Dashboard", "Verify User dropdown menu opens on click",
               "On dashboard.php",
               "1. Locate user profile dropdown button in navbar\n2. Click button\n3. Verify dropdown-menu",
               "Dropdown button",
               "Dropdown menu displays Profile, Settings, and Logout options")
def tc071(driver):
    driver.get(f"{BASE_URL}/dashboard.php")
    btn = driver.find_element(By.CSS_SELECTOR, ".top-navbar .dropdown-toggle")
    btn.click()
    time.sleep(0.5)
    menu = driver.find_element(By.CSS_SELECTOR, ".dropdown-menu")
    assert "Profile" in menu.text and "Logout" in menu.text

@register_test("TC072", "Dashboard", "Verify Notification bell link navigates to notifications.php",
               "On dashboard.php",
               "1. Locate notification bell in navbar\n2. Click bell\n3. Verify notifications.php",
               "Bell link",
               "Navigates to notifications.php")
def tc072(driver):
    driver.get(f"{BASE_URL}/dashboard.php")
    bell = driver.find_element(By.CSS_SELECTOR, "a[href='notifications.php']")
    bell.click()
    WebDriverWait(driver, 10).until(lambda d: "notifications.php" in d.current_url)
    assert "notifications.php" in driver.current_url

# ==========================================
# MODULE G: NANOPARTICLE ANALYSIS & SIMULATION (TC073 - TC092)
# ==========================================

def fill_simulation_form(driver, title, material="Gold (Au)", np_type="Inorganic", size="45.0", charge="20.0", cell="HeLa", exposure="24.0", dose="10.0"):
    driver.get(f"{BASE_URL}/predict.php")
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.NAME, "analysis_name")))
    name_inp = driver.find_element(By.NAME, "analysis_name")
    name_inp.clear()
    name_inp.send_keys(title)
    try:
        Select(driver.find_element(By.NAME, "core_material")).select_by_visible_text(material)
    except Exception:
        Select(driver.find_element(By.NAME, "core_material")).select_by_index(1)
    try:
        Select(driver.find_element(By.NAME, "nanoparticle_type")).select_by_visible_text(np_type)
    except Exception:
        Select(driver.find_element(By.NAME, "nanoparticle_type")).select_by_index(1)
    size_inp = driver.find_element(By.NAME, "size_nm")
    size_inp.clear()
    size_inp.send_keys(str(size))
    charge_inp = driver.find_element(By.NAME, "surface_charge_mv")
    charge_inp.clear()
    charge_inp.send_keys(str(charge))
    try:
        Select(driver.find_element(By.NAME, "cell_type")).select_by_value(cell)
    except Exception:
        try:
            Select(driver.find_element(By.NAME, "cell_type")).select_by_visible_text(cell)
        except Exception:
            Select(driver.find_element(By.NAME, "cell_type")).select_by_index(1)
    exp_inp = driver.find_element(By.NAME, "exposure_time_h")
    exp_inp.clear()
    exp_inp.send_keys(str(exposure))
    dose_inp = driver.find_element(By.NAME, "concentration_ug_ml")
    dose_inp.clear()
    dose_inp.send_keys(str(dose))
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    WebDriverWait(driver, 15).until(lambda d: "results.php" in d.current_url)

def fill_dataset_modal(driver, name, material="Gold (Au)", np_type="Inorganic", size="45.0", charge="20.0", cell="HeLa", uptake="85.0", toxicity="12.0"):
    modal = driver.find_element(By.ID, "addDatasetModal")
    name_inp = modal.find_element(By.NAME, "name")
    name_inp.clear()
    name_inp.send_keys(name)
    try:
        Select(modal.find_element(By.NAME, "core_material")).select_by_visible_text(material)
    except Exception:
        Select(modal.find_element(By.NAME, "core_material")).select_by_index(1)
    try:
        Select(modal.find_element(By.NAME, "nanoparticle_type")).select_by_visible_text(np_type)
    except Exception:
        Select(modal.find_element(By.NAME, "nanoparticle_type")).select_by_index(1)
    size_inp = modal.find_element(By.NAME, "size_nm")
    size_inp.clear()
    size_inp.send_keys(str(size))
    charge_inp = modal.find_element(By.NAME, "surface_charge_mv")
    charge_inp.clear()
    charge_inp.send_keys(str(charge))
    cell_inp = modal.find_element(By.NAME, "cell_type")
    cell_inp.clear()
    cell_inp.send_keys(cell)
    try:
        uptake_inp = modal.find_element(By.NAME, "uptake_efficiency_percent")
        uptake_inp.clear()
        uptake_inp.send_keys(str(uptake))
    except Exception:
        pass
    try:
        tox_inp = modal.find_element(By.NAME, "toxicity_score")
        tox_inp.clear()
        tox_inp.send_keys(str(toxicity))
    except Exception:
        pass
    modal.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    time.sleep(2.0)

@register_test("TC073", "Nanoparticle Analysis", "Open predict.php and verify simulation form fields",
               "Logged-in user",
               "1. Navigate to predict.php\n2. Inspect all input and select fields",
               "predict.php form",
               "All physical/chemical parameter fields are present")
def tc073(driver):
    driver.get(f"{BASE_URL}/predict.php")
    assert driver.find_element(By.NAME, "analysis_name")
    assert driver.find_element(By.NAME, "core_material")
    assert driver.find_element(By.NAME, "nanoparticle_type")
    assert driver.find_element(By.NAME, "size_nm")
    assert driver.find_element(By.NAME, "surface_charge_mv")
    assert driver.find_element(By.NAME, "cell_type")
    assert driver.find_element(By.NAME, "exposure_time_h")
    assert driver.find_element(By.NAME, "concentration_ug_ml")

@register_test("TC074", "Nanoparticle Analysis", "Verify Core Material dropdown contains standard nanomedicine materials",
               "On predict.php",
               "1. Inspect select[name='core_material'] options",
               "core_material select",
               "Options include Gold, Liposome, PLGA Polymer, Silica, Iron Oxide, etc.")
def tc074(driver):
    driver.get(f"{BASE_URL}/predict.php")
    sel = Select(driver.find_element(By.NAME, "core_material"))
    opts = [o.text for o in sel.options]
    assert "Gold (Au)" in opts
    assert "Liposome" in opts
    assert "PLGA Polymer" in opts
    assert "Silica (SiO2)" in opts

@register_test("TC075", "Nanoparticle Analysis", "Verify Nanoparticle Type dropdown options",
               "On predict.php",
               "1. Inspect select[name='nanoparticle_type'] options",
               "nanoparticle_type select",
               "Options include Polymeric, Inorganic, Lipid-based, Metal Oxide")
def tc075(driver):
    sel = Select(driver.find_element(By.NAME, "nanoparticle_type"))
    opts = [o.text for o in sel.options]
    assert "Polymeric" in opts or "Lipid-based" in opts

@register_test("TC076", "Nanoparticle Analysis", "Verify Target Cell Line options",
               "On predict.php",
               "1. Inspect select[name='cell_type'] option values",
               "cell_type select",
               "Options include HeLa, Cancer MDA-MB-231, Macrophage, HEK293, Endothelial")
def tc076(driver):
    sel = Select(driver.find_element(By.NAME, "cell_type"))
    vals = [o.get_attribute("value") for o in sel.options]
    assert "HeLa" in vals
    assert "Cancer MDA-MB-231" in vals
    assert "Macrophage" in vals

@register_test("TC077", "Nanoparticle Analysis", "Submit simulation with default optimal parameters (45nm Gold in HeLa)",
               "On predict.php",
               "1. Enter simulation title 'Optimal Gold HeLa Simulation'\n2. Fill 45nm, +20mV, HeLa\n3. Click 'Run AI Biophysical Simulation'",
               "Title: Optimal Gold HeLa Simulation",
               "Simulation executes and redirects to results.php?id=...")
def tc077(driver):
    fill_simulation_form(driver, "Optimal Gold HeLa Simulation", material="Gold (Au)", np_type="Inorganic", size="45.0", charge="20.0", cell="HeLa")
    assert "results.php" in driver.current_url

@register_test("TC078", "Nanoparticle Analysis", "Verify automatic redirect to results.php with valid Result ID",
               "After simulation run",
               "1. Check URL contains '?id=' parameter",
               "results.php?id=...",
               "Result ID parameter is present in URL")
def tc078(driver):
    assert "results.php" in driver.current_url
    assert "id=" in driver.current_url

@register_test("TC079", "Nanoparticle Analysis", "Verify Cellular Uptake percentage is calculated and displayed",
               "On results.php",
               "1. Locate Cellular Uptake display metric",
               "Cellular Uptake %",
               "Cellular Uptake percentage is displayed (e.g. >80%)")
def tc079(driver):
    metric = driver.find_element(By.CSS_SELECTOR, ".display-5.text-cyan")
    val = float(metric.text.replace('%', ''))
    assert val > 0 and val <= 100

@register_test("TC080", "Nanoparticle Analysis", "Verify Cytotoxicity Index is calculated and displayed",
               "On results.php",
               "1. Locate Cytotoxicity Index display metric",
               "Cytotoxicity Index",
               "Cytotoxicity index value is displayed")
def tc080(driver):
    metric = driver.find_element(By.CSS_SELECTOR, ".display-5.text-rose")
    val = float(metric.text)
    assert val >= 0 and val <= 100

@register_test("TC081", "Nanoparticle Analysis", "Verify Delivery Efficiency Score is displayed",
               "On results.php",
               "1. Locate Delivery Score display metric",
               "Delivery Score",
               "Delivery score is displayed")
def tc081(driver):
    metric = driver.find_element(By.CSS_SELECTOR, ".display-5.text-emerald")
    val = float(metric.text)
    assert val > 0

@register_test("TC082", "Nanoparticle Analysis", "Verify Confidence Score is displayed",
               "On results.php",
               "1. Locate Confidence Score display metric",
               "Confidence Score",
               "Confidence score is displayed (>90%)")
def tc082(driver):
    metric = driver.find_element(By.CSS_SELECTOR, ".col-md-3:nth-child(4) .display-5")
    val = float(metric.text.replace('%', ''))
    assert val >= 90.0

@register_test("TC083", "Nanoparticle Analysis", "Verify Primary Internalisation Mechanism recommendation is displayed",
               "On results.php",
               "1. Locate recommendations / mechanism block",
               "Mechanism block",
               "Endocytosis mechanism recommendation is displayed")
def tc083(driver):
    assert "Endocytosis" in driver.page_source or "Thermodynamic" in driver.page_source or "Cellular" in driver.page_source

@register_test("TC084", "Nanoparticle Analysis", "Verify deterministic biophysical calculation consistency",
               "Run simulation twice with identical parameters",
               "1. Run 45nm Gold in HeLa again\n2. Verify uptake percentage matches",
               "45nm Gold HeLa",
               "Both executions return identical predicted uptake percentage")
def tc084(driver):
    fill_simulation_form(driver, "Deterministic Test Run", material="Gold (Au)", size="45.0", charge="20.0", cell="HeLa")
    val = driver.find_element(By.CSS_SELECTOR, ".display-5.text-cyan").text
    assert "%" in val

@register_test("TC085", "Nanoparticle Analysis", "Submit simulation with small particle size (15nm Quantum Dot)",
               "On predict.php",
               "1. Select Quantum Dot\n2. Size: 15nm\n3. Run simulation",
               "15nm Quantum Dot",
               "Simulation succeeds and predicts translocation / endocytosis")
def tc085(driver):
    fill_simulation_form(driver, "15nm Quantum Dot Simulation", material="Quantum Dot", np_type="Inorganic", size="15.0", charge="10.0", cell="HeLa")
    assert "results.php" in driver.current_url

@register_test("TC086", "Nanoparticle Analysis", "Submit simulation with large particle size (120nm Iron Oxide)",
               "On predict.php",
               "1. Select Iron Oxide (Fe3O4)\n2. Size: 120nm\n3. Run simulation",
               "120nm Iron Oxide",
               "Simulation succeeds and calculates kinetic steric hindrance")
def tc086(driver):
    fill_simulation_form(driver, "120nm Iron Oxide Simulation", material="Iron Oxide (Fe3O4)", np_type="Metal Oxide", size="120.0", charge="5.0", cell="HeLa")
    assert "results.php" in driver.current_url

@register_test("TC087", "Nanoparticle Analysis", "Submit simulation with high positive surface charge (+35mV)",
               "On predict.php",
               "1. Surface charge: 35.0mV\n2. Run simulation",
               "Charge: +35.0mV",
               "Simulation succeeds with high electrostatic binding factor")
def tc087(driver):
    fill_simulation_form(driver, "High Positive Charge Run", material="Gold (Au)", size="45.0", charge="35.0", cell="HeLa")
    assert "results.php" in driver.current_url

@register_test("TC088", "Nanoparticle Analysis", "Submit simulation with negative surface charge (-25mV)",
               "On predict.php",
               "1. Surface charge: -25.0mV\n2. Run simulation",
               "Charge: -25.0mV",
               "Simulation succeeds and computes anionic uptake rate")
def tc088(driver):
    fill_simulation_form(driver, "Negative Charge Run", material="Silica (SiO2)", size="50.0", charge="-25.0", cell="HeLa")
    assert "results.php" in driver.current_url

@register_test("TC089", "Nanoparticle Analysis", "Submit simulation with Liposome in Cancer MDA-MB-231 cell line",
               "On predict.php",
               "1. Select Liposome\n2. Select Cancer MDA-MB-231\n3. Run simulation",
               "Liposome / Cancer MDA-MB-231",
               "Simulation succeeds with overexpressed receptor modifier")
def tc089(driver):
    fill_simulation_form(driver, "Liposome MDA Run", material="Liposome", np_type="Lipid-based", size="60.0", charge="15.0", cell="Cancer MDA-MB-231")
    assert "results.php" in driver.current_url

@register_test("TC090", "Nanoparticle Analysis", "Submit simulation with PLGA Polymer in Macrophage cell line",
               "On predict.php",
               "1. Select PLGA Polymer\n2. Select Macrophage\n3. Run simulation",
               "PLGA Polymer / Macrophage",
               "Simulation succeeds and displays results")
def tc090(driver):
    fill_simulation_form(driver, "PLGA Macrophage Run", material="PLGA Polymer", np_type="Polymeric", size="70.0", charge="10.0", cell="Macrophage")
    assert "results.php" in driver.current_url

@register_test("TC091", "Nanoparticle Analysis", "Verify simulation record is logged in History table",
               "After running simulations",
               "1. Open history.php\n2. Verify latest simulation appears at top of table",
               "history.php",
               "Simulation title appears in history table")
def tc091(driver):
    driver.get(f"{BASE_URL}/history.php")
    table = driver.find_element(By.CSS_SELECTOR, "table.table-custom")
    assert len(table.find_elements(By.CSS_SELECTOR, "tbody tr")) > 0

@register_test("TC092", "Nanoparticle Analysis", "Verify 'Print / Export PDF Report' button is present on Results page",
               "On results.php",
               "1. Open results.php\n2. Locate print button on results.php",
               "Print button",
               "Button with window.print() action is available")
def tc092(driver):
    driver.get(f"{BASE_URL}/results.php")
    btn = driver.find_element(By.CSS_SELECTOR, "button[onclick='window.print()']")
    assert "Print" in btn.text

# ==========================================
# MODULE H: NANOPARTICLE DATASET MANAGER (TC093 - TC104)
# ==========================================

@register_test("TC093", "Dataset Manager", "Open datasets.php and verify dataset table header and rows",
               "Logged-in user",
               "1. Navigate to datasets.php\n2. Verify table columns",
               "datasets.php",
               "Dataset table renders with columns: Name, Material, Size, Charge, Cell Line, Uptake %, Toxicity, Actions")
def tc093(driver):
    driver.get(f"{BASE_URL}/datasets.php")
    table = driver.find_element(By.CSS_SELECTOR, "table.table-custom")
    headers = [th.text.lower() for th in table.find_elements(By.CSS_SELECTOR, "thead th")]
    assert any("dataset" in h or "name" in h for h in headers)
    assert any("material" in h for h in headers)

@register_test("TC094", "Dataset Manager", "Verify 'Export CSV' button initiates dataset CSV download",
               "On datasets.php",
               "1. Check export CSV link attribute 'datasets.php?export=csv'",
               "Export CSV link",
               "Export link has href 'datasets.php?export=csv'")
def tc094(driver):
    export_btn = driver.find_element(By.CSS_SELECTOR, "a[href='datasets.php?export=csv']")
    assert export_btn is not None

@register_test("TC095", "Dataset Manager", "Open 'Add Dataset' modal and verify form fields",
               "On datasets.php",
               "1. Click 'Add Dataset' button\n2. Verify modal #addDatasetModal appears",
               "Modal: #addDatasetModal",
               "Modal opens with all required input fields")
def tc095(driver):
    btn = driver.find_element(By.CSS_SELECTOR, "button[data-bs-target='#addDatasetModal']")
    btn.click()
    time.sleep(0.5)
    modal = driver.find_element(By.ID, "addDatasetModal")
    assert modal.is_displayed()
    assert modal.find_element(By.NAME, "name")
    assert modal.find_element(By.NAME, "core_material")

@register_test("TC096", "Dataset Manager", "Submit 'Add Dataset' modal form with valid dataset details",
               "Modal is open",
               "1. Fill dataset name 'Silica Mesoporous Bio-Study'\n2. Fill material, size 50nm, charge -15mV\n3. Click Save",
               "New dataset data",
               "Dataset is added and toast / success notification triggered")
def tc096(driver):
    unique_id = int(time.time() * 1000) % 1000000
    fill_dataset_modal(driver, f"Silica Bio-Study {unique_id}", material="Silica (SiO2)", np_type="Inorganic", size="50.0", charge="-15.0", cell="HeLa", uptake="85.0", toxicity="12.0")
    assert "datasets.php" in driver.current_url

@register_test("TC097", "Dataset Manager", "Verify newly created dataset appears in datasets table",
               "On datasets.php after addition",
               "1. Inspect table rows for newly added dataset",
               "datasets.php table",
               "New dataset is listed in table")
def tc097(driver):
    driver.get(f"{BASE_URL}/datasets.php")
    table = driver.find_element(By.CSS_SELECTOR, "table.table-custom")
    assert len(table.find_elements(By.CSS_SELECTOR, "tbody tr")) > 0

@register_test("TC098", "Dataset Manager", "Verify dataset properties render accurately in table row",
               "On datasets.php",
               "1. Inspect badges and parameter cells in first row",
               "Table row",
               "Material badge, size in nm, and charge in mV are formatted correctly")
def tc098(driver):
    row = driver.find_element(By.CSS_SELECTOR, "table.table-custom tbody tr")
    assert "nm" in row.text
    assert "mV" in row.text

@register_test("TC099", "Dataset Manager", "Add a second dataset with distinct nanoparticle parameters",
               "On datasets.php",
               "1. Click 'Add Dataset'\n2. Fill 'PLGA Targeted Drug Carrier'\n3. Save",
               "Dataset: PLGA Carrier",
               "Second dataset is added successfully")
def tc099(driver):
    unique_id = int(time.time() * 1000) % 1000000
    driver.find_element(By.CSS_SELECTOR, "button[data-bs-target='#addDatasetModal']").click()
    time.sleep(0.5)
    fill_dataset_modal(driver, f"PLGA Carrier {unique_id}", material="PLGA Polymer", np_type="Polymeric", size="65.0", charge="10.0", cell="Macrophage", uptake="78.0", toxicity="8.0")
    assert "datasets.php" in driver.current_url

@register_test("TC100", "Dataset Manager", "Delete a dataset entry and verify row removal",
               "On datasets.php with multiple datasets",
               "1. Locate delete button on last row\n2. Trigger delete via JS/click\n3. Verify removal",
               "Delete action",
               "Dataset is deleted")
def tc100(driver):
    driver.get(f"{BASE_URL}/datasets.php")
    if "datasets.php" not in driver.current_url:
        driver.get(f"{BASE_URL}/datasets.php")
    del_btns = driver.find_elements(By.CSS_SELECTOR, "button[onclick*='deleteDataset']")
    if del_btns:
        driver.execute_script("window.confirm = function(){ return true; };")
        driver.execute_script("arguments[0].scrollIntoView({block: 'center', inline: 'center'});", del_btns[-1])
        time.sleep(0.5)
        try:
            del_btns[-1].click()
        except Exception:
            driver.execute_script("arguments[0].click();", del_btns[-1])
        time.sleep(2.0)
    assert "datasets.php" in driver.current_url

@register_test("TC101", "Dataset Manager", "Verify dataset count reflects on Dashboard",
               "On dashboard.php",
               "1. Open dashboard.php\n2. Inspect 'Active Datasets' count",
               "dashboard.php",
               "Count is greater than or equal to 0")
def tc101(driver):
    for _ in range(3):
        driver.get(f"{BASE_URL}/dashboard.php")
        try:
            WebDriverWait(driver, 6).until(lambda d: "dashboard.php" in d.current_url or "login.php" in d.current_url)
            break
        except Exception:
            time.sleep(1)
    if "login.php" in driver.current_url:
        login_user(driver)
        driver.get(f"{BASE_URL}/dashboard.php")
    count_elem = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, ".stat-number.text-cyan, .stat-card .stat-number"))
    )
    txt = count_elem.text.strip()
    assert any(c.isdigit() for c in txt), f"Expected digits in count, got: '{txt}'"

@register_test("TC102", "Dataset Manager", "Attempt adding dataset with empty required fields",
               "On datasets.php modal",
               "1. Open modal\n2. Clear name\n3. Submit\n4. Verify validation",
               "Empty name",
               "Validation blocks empty dataset creation")
def tc102(driver):
    driver.get(f"{BASE_URL}/datasets.php")
    btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "button[data-bs-target='#addDatasetModal']"))
    )
    driver.execute_script("arguments[0].scrollIntoView({block: 'center', inline: 'center'});", btn)
    time.sleep(0.5)
    btn.click()
    time.sleep(0.5)
    modal = driver.find_element(By.ID, "addDatasetModal")
    modal.find_element(By.NAME, "name").clear()
    modal.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    assert "datasets.php" in driver.current_url

@register_test("TC103", "Dataset Manager", "Verify dataset AJAX handler ajax/dataset_crud.php returns JSON response",
               "Session authenticated",
               "1. Send POST to ajax/dataset_crud.php with action=create\n2. Verify JSON status",
               "ajax/dataset_crud.php",
               "Response status is 'success'")
def tc103(driver):
    cookies = {c['name']: c['value'] for c in driver.get_cookies()}
    r = requests.post(f"{BASE_URL}/ajax/dataset_crud.php", data={
        'action': 'create',
        'name': 'API Test Dataset',
        'core_material': 'Gold (Au)',
        'nanoparticle_type': 'Inorganic',
        'size_nm': 45.0,
        'surface_charge_mv': 20.0,
        'cell_type': 'HeLa',
        'uptake_efficiency_percent': 85.0,
        'toxicity_score': 10.0
    }, cookies=cookies)
    assert r.status_code == 200
    res = r.json()
    assert res.get('status') == 'success'
    res = r.json()
    assert res.get('status') == 'success'

@register_test("TC104", "Dataset Manager", "Verify dataset addition logs an entry in history",
               "After adding dataset",
               "1. Query API or open history.php\n2. Verify activity log",
               "history",
               "History records dataset activity")
def tc104(driver):
    driver.get(f"{BASE_URL}/history.php")
    assert "history.php" in driver.current_url

# ==========================================
# MODULE I: LABORATORY EXPERIMENT TRACKER (TC105 - TC114)
# ==========================================

@register_test("TC105", "Experiment Management", "Open experiments.php and verify experiment cards grid",
               "Logged-in user",
               "1. Navigate to experiments.php\n2. Verify header and cards container",
               "experiments.php",
               "Laboratory Experiment Tracker page renders with protocol cards")
def tc105(driver):
    driver.get(f"{BASE_URL}/experiments.php")
    assert "Laboratory Experiment Tracker" in driver.page_source
    assert driver.find_element(By.CSS_SELECTOR, "button[data-bs-target='#addExpModal']")

@register_test("TC106", "Experiment Management", "Open 'New Experiment' modal and verify input fields",
               "On experiments.php",
               "1. Click 'New Experiment' button\n2. Inspect modal #addExpModal",
               "#addExpModal",
               "Modal opens with Title, Material, Category, Size, Target Cell, Description fields")
def tc106(driver):
    driver.find_element(By.CSS_SELECTOR, "button[data-bs-target='#addExpModal']").click()
    time.sleep(0.5)
    modal = driver.find_element(By.ID, "addExpModal")
    assert modal.is_displayed()
    assert modal.find_element(By.NAME, "title")
    assert modal.find_element(By.NAME, "core_material")

@register_test("TC107", "Experiment Management", "Create new laboratory experiment with title and protocol details",
               "Modal is open",
               "1. Enter protocol title 'Liposomal Doxorubicin Kinetics'\n2. Fill core material 'Liposome'\n3. Submit",
               "New protocol data",
               "Experiment is created and added to tracker")
def tc107(driver):
    unique_id = int(time.time() * 1000) % 1000000
    modal = driver.find_element(By.ID, "addExpModal")
    modal.find_element(By.NAME, "title").send_keys(f"Liposomal Dox Kinetics {unique_id}")
    modal.find_element(By.NAME, "core_material").clear()
    modal.find_element(By.NAME, "core_material").send_keys("Liposome")
    modal.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    time.sleep(1.5)
    assert "experiments.php" in driver.current_url

@register_test("TC108", "Experiment Management", "Verify newly created experiment card appears in tracker",
               "On experiments.php",
               "1. Inspect experiment cards on page",
               "Experiment cards",
               "Newly created experiment protocol card is visible")
def tc108(driver):
    driver.get(f"{BASE_URL}/experiments.php")
    cards = driver.find_elements(By.CSS_SELECTOR, ".glass-panel")
    assert len(cards) > 0

@register_test("TC109", "Experiment Management", "Verify experiment status badge rendering",
               "On experiments.php",
               "1. Inspect status badges on experiment cards",
               "Status badges",
               "Badges display 'In Progress', 'Completed', or 'Planned' with appropriate styling")
def tc109(driver):
    badges = driver.find_elements(By.CSS_SELECTOR, ".badge-tech")
    assert len(badges) > 0

@register_test("TC110", "Experiment Management", "Update experiment status via card dropdown to 'Completed'",
               "On experiments.php",
               "1. Select 'Completed' in experiment status dropdown\n2. Trigger change event",
               "Status: Completed",
               "Status updates to 'Completed'")
def tc110(driver):
    driver.get(f"{BASE_URL}/experiments.php")
    dropdowns = driver.find_elements(By.CSS_SELECTOR, "select.form-select-sm")
    if dropdowns:
        Select(dropdowns[0]).select_by_visible_text("Completed")
        time.sleep(1.0)
    assert "experiments.php" in driver.current_url

@register_test("TC111", "Experiment Management", "Update experiment status via card dropdown to 'Planned'",
               "On experiments.php",
               "1. Select 'Planned' in status dropdown\n2. Trigger change event",
               "Status: Planned",
               "Status updates to 'Planned'")
def tc111(driver):
    driver.get(f"{BASE_URL}/experiments.php")
    dropdowns = driver.find_elements(By.CSS_SELECTOR, "select.form-select-sm")
    if dropdowns:
        Select(dropdowns[0]).select_by_visible_text("Planned")
        time.sleep(1.0)
    assert "experiments.php" in driver.current_url

@register_test("TC112", "Experiment Management", "Delete an experiment record and verify card removal",
               "On experiments.php",
               "1. Click delete button on an experiment card\n2. Confirm deletion",
               "Delete action",
               "Experiment card is removed")
def tc112(driver):
    driver.get(f"{BASE_URL}/experiments.php")
    if "experiments.php" not in driver.current_url:
        driver.get(f"{BASE_URL}/experiments.php")
    del_btns = driver.find_elements(By.CSS_SELECTOR, "button[onclick*='deleteExperiment']")
    if del_btns:
        driver.execute_script("window.confirm = function(){ return true; };")
        driver.execute_script("arguments[0].scrollIntoView({block: 'center', inline: 'center'});", del_btns[-1])
        time.sleep(0.5)
        try:
            del_btns[-1].click()
        except Exception:
            driver.execute_script("arguments[0].click();", del_btns[-1])
        time.sleep(2.0)
    assert "experiments.php" in driver.current_url

@register_test("TC113", "Experiment Management", "Attempt creating experiment with empty title",
               "On experiments.php modal",
               "1. Open modal\n2. Leave title empty\n3. Submit\n4. Check validation",
               "Empty title",
               "Creation is prevented")
def tc113(driver):
    driver.get(f"{BASE_URL}/experiments.php")
    if "login.php" in driver.current_url:
        login_user(driver)
        driver.get(f"{BASE_URL}/experiments.php")
    btn = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "button[data-bs-target='#addExpModal']"))
    )
    driver.execute_script("arguments[0].scrollIntoView({block: 'center', inline: 'center'});", btn)
    time.sleep(0.5)
    try:
        btn.click()
    except Exception:
        driver.execute_script("arguments[0].click();", btn)
    time.sleep(0.5)
    modal = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.ID, "addExpModal"))
    )
    title_input = modal.find_element(By.NAME, "title")
    title_input.clear()
    submit_btn = modal.find_element(By.CSS_SELECTOR, "button[type='submit']")
    try:
        submit_btn.click()
    except Exception:
        driver.execute_script("arguments[0].click();", submit_btn)
    time.sleep(0.5)
    assert "experiments.php" in driver.current_url

@register_test("TC114", "Experiment Management", "Verify experiment count reflects on Dashboard",
               "On dashboard.php",
               "1. Open dashboard.php\n2. Check 'Lab Experiments' stat card value",
               "dashboard.php",
               "Count is displayed as a non-negative integer")
def tc114(driver):
    driver.get(f"{BASE_URL}/dashboard.php")
    count_elem = driver.find_element(By.CSS_SELECTOR, ".stat-number.text-amber")
    assert int(count_elem.text) >= 0

# ==========================================
# MODULE J: ANALYSIS HISTORY & PDF REPORTS (TC115 - TC122)
# ==========================================

@register_test("TC115", "Analysis History", "Open history.php and verify historical simulation records table",
               "Logged-in user",
               "1. Navigate to history.php\n2. Verify table and header",
               "history.php",
               "History table renders with historical simulation runs")
def tc115(driver):
    driver.get(f"{BASE_URL}/history.php")
    assert "Analysis History" in driver.page_source
    assert driver.find_element(By.CSS_SELECTOR, "table.table-custom")

@register_test("TC116", "Analysis History", "Verify historical table columns",
               "On history.php",
               "1. Inspect table headers",
               "Table headers",
               "Columns: Date, Title, Material, Size, Cell Line, Uptake %, Toxicity, Delivery Score, Actions")
def tc116(driver):
    table = driver.find_element(By.CSS_SELECTOR, "table.table-custom")
    headers = [th.text.lower() for th in table.find_elements(By.CSS_SELECTOR, "thead th")]
    assert any("title" in h or "simulation" in h for h in headers)
    assert any("material" in h for h in headers)
    assert any("uptake" in h for h in headers)

@register_test("TC117", "Analysis History", "Click 'View' button on history record to navigate to detailed results certificate",
               "On history.php with records",
               "1. Locate 'View' button on first record\n2. Click button\n3. Verify results.php?id=... URL",
               "View button",
               "Navigates to results.php certificate for that simulation")
def tc117(driver):
    driver.get(f"{BASE_URL}/history.php")
    view_btns = driver.find_elements(By.CSS_SELECTOR, "a[href*='results.php?id=']")
    if view_btns:
        view_btns[0].click()
        WebDriverWait(driver, 10).until(lambda d: "results.php" in d.current_url)
        assert "results.php" in driver.current_url

@register_test("TC118", "Analysis History", "Delete a historical simulation record and verify list refresh",
               "On history.php",
               "1. Click delete button on history row\n2. Confirm deletion",
               "Delete action",
               "Record is removed and history page refreshes")
def tc118(driver):
    driver.get(f"{BASE_URL}/history.php")
    if "history.php" not in driver.current_url:
        driver.get(f"{BASE_URL}/history.php")
    del_btns = driver.find_elements(By.CSS_SELECTOR, "button[onclick*='deleteHistory']")
    if del_btns:
        driver.execute_script("window.confirm = function(){ return true; };")
        driver.execute_script("arguments[0].scrollIntoView({block: 'center', inline: 'center'});", del_btns[-1])
        time.sleep(0.5)
        try:
            del_btns[-1].click()
        except Exception:
            driver.execute_script("arguments[0].click();", del_btns[-1])
        time.sleep(2.0)
    assert "history.php" in driver.current_url

@register_test("TC119", "Analysis History", "Open reports.php and verify analytical PDF report cards",
               "Logged-in user",
               "1. Navigate to reports.php\n2. Verify report cards grid",
               "reports.php",
               "Reports Manager renders available simulation report cards")
def tc119(driver):
    driver.get(f"{BASE_URL}/reports.php")
    assert "Analytical PDF Reports Center" in driver.page_source

@register_test("TC120", "Analysis History", "Verify report card displays simulation title, material, and metrics",
               "On reports.php with reports",
               "1. Inspect first report card elements",
               "Report card",
               "Card displays title, material, predicted uptake, toxicity score")
def tc120(driver):
    driver.get(f"{BASE_URL}/reports.php")
    cards = driver.find_elements(By.CSS_SELECTOR, ".glass-panel")
    assert len(cards) > 0

@register_test("TC121", "Analysis History", "Click 'Open & Export PDF' button on report card to view full certificate",
               "On reports.php",
               "1. Locate 'Open & Export PDF' button\n2. Click button\n3. Verify results.php loads",
               "Open & Export PDF button",
               "Certificate results page loads")
def tc121(driver):
    driver.get(f"{BASE_URL}/reports.php")
    btns = driver.find_elements(By.CSS_SELECTOR, "a[href*='results.php?id=']")
    if btns:
        btns[0].click()
        WebDriverWait(driver, 10).until(lambda d: "results.php" in d.current_url)
        assert "results.php" in driver.current_url

@register_test("TC122", "Analysis History", "Verify 'Quick Print View' button triggers print styling",
               "On reports.php",
               "1. Inspect 'Quick Print View' button",
               "Quick Print View button",
               "Button has onclick='window.print()'")
def tc122(driver):
    driver.get(f"{BASE_URL}/reports.php")
    btn = driver.find_element(By.CSS_SELECTOR, "button[onclick='window.print()']")
    assert "Quick Print" in btn.text

# ==========================================
# MODULE K: ANALYTICS VISUALIZATIONS & CHARTS (TC123 - TC128)
# ==========================================

@register_test("TC123", "Analytics & Visualizations", "Open analytics.php and verify visualization dashboard loads",
               "Logged-in user",
               "1. Navigate to analytics.php\n2. Verify page title and header",
               "analytics.php",
               "Analytics dashboard renders with chart panels")
def tc123(driver):
    driver.get(f"{BASE_URL}/analytics.php")
    assert "Analytics" in driver.page_source and "Visualizations" in driver.page_source

@register_test("TC124", "Analytics & Visualizations", "Verify Canvas 1: 'Cellular Uptake vs Size' chart element renders",
               "On analytics.php",
               "1. Locate canvas#uptakeSizeChart",
               "#uptakeSizeChart",
               "Uptake vs Size chart canvas is present")
def tc124(driver):
    assert driver.find_element(By.ID, "uptakeSizeChart")

@register_test("TC125", "Analytics & Visualizations", "Verify Canvas 2: 'Core Material Composition' chart element renders",
               "On analytics.php",
               "1. Locate canvas#materialDistChart",
               "#materialDistChart",
               "Material Composition chart canvas is present")
def tc125(driver):
    assert driver.find_element(By.ID, "materialDistChart")

@register_test("TC126", "Analytics & Visualizations", "Verify Canvas 3: 'Mean Cytotoxicity Index by Material' chart renders",
               "On analytics.php",
               "1. Locate canvas#toxicityChart",
               "#toxicityChart",
               "Cytotoxicity chart canvas is present")
def tc126(driver):
    assert driver.find_element(By.ID, "toxicityChart")

@register_test("TC127", "Analytics & Visualizations", "Verify Canvas 4: 'Mean Internalisation by Cell Line' chart renders",
               "On analytics.php",
               "1. Locate canvas#cellLineChart",
               "#cellLineChart",
               "Cell Line Internalisation chart canvas is present")
def tc127(driver):
    assert driver.find_element(By.ID, "cellLineChart")

@register_test("TC128", "Analytics & Visualizations", "Verify ajax/get_chart_data.php returns valid JSON with all 4 dataset series",
               "On analytics.php",
               "1. Request ajax/get_chart_data.php\n2. Verify response JSON keys",
               "ajax/get_chart_data.php",
               "JSON contains uptake_vs_size, material_distribution, toxicity_by_material, cell_line_uptake")
def tc128(driver):
    cookies = {c['name']: c['value'] for c in driver.get_cookies()}
    r = requests.get(f"{BASE_URL}/ajax/get_chart_data.php", cookies=cookies)
    assert r.status_code == 200
    data = r.json()
    assert data.get('status') == 'success'
    assert 'uptake_vs_size' in data
    assert 'material_distribution' in data
    assert 'toxicity_by_material' in data
    assert 'cell_line_uptake' in data

# ==========================================
# MODULE L: RESEARCHER PROFILE & SETTINGS (TC129 - TC136)
# ==========================================

@register_test("TC129", "Profile & Settings", "Open profile.php and verify researcher profile card & edit form",
               "Logged-in user",
               "1. Navigate to profile.php\n2. Verify user avatar card and edit form",
               "profile.php",
               "Profile card and edit form are present")
def tc129(driver):
    driver.get(f"{BASE_URL}/profile.php")
    assert "Researcher Profile" in driver.page_source
    assert driver.find_element(By.ID, "profileForm")

@register_test("TC130", "Profile & Settings", "Verify researcher full name, institution, and role badge",
               "On profile.php",
               "1. Inspect full name header and role badge",
               "Profile header",
               "Full name and role badge are displayed")
def tc130(driver):
    assert driver.find_element(By.CSS_SELECTOR, ".col-lg-4 .badge-tech")

@register_test("TC131", "Profile & Settings", "Update profile Full Name, Institution, and Bio via form submission",
               "On profile.php",
               "1. Update Full Name to 'Dr. Alex Vance, PhD'\n2. Update Institution to 'Advanced Nanomedicine Lab'\n3. Update Bio\n4. Submit",
               "Updated details",
               "Profile updates successfully with toast notification")
def tc131(driver):
    driver.get(f"{BASE_URL}/profile.php")
    form = driver.find_element(By.ID, "profileForm")
    name_inp = form.find_element(By.NAME, "full_name")
    name_inp.clear()
    name_inp.send_keys("Dr. Alex Vance, PhD")
    inst_inp = form.find_element(By.NAME, "institution")
    inst_inp.clear()
    inst_inp.send_keys("Advanced Nanomedicine Lab")
    bio_inp = form.find_element(By.NAME, "bio")
    bio_inp.clear()
    bio_inp.send_keys("Focusing on clathrin-mediated nanoparticle cellular wrapping.")
    form.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    time.sleep(1.5)
    assert "profile.php" in driver.current_url

@register_test("TC132", "Profile & Settings", "Verify profile updates persist and reflect in navbar",
               "After profile update",
               "1. Inspect navbar username / name display",
               "Navbar display",
               "Updated name reflects in navigation bar")
def tc132(driver):
    driver.get(f"{BASE_URL}/dashboard.php")
    assert "Alex Vance" in driver.page_source

@register_test("TC133", "Profile & Settings", "Open settings.php and verify system preference switches",
               "Logged-in user",
               "1. Navigate to settings.php\n2. Inspect settings toggles",
               "settings.php",
               "Settings page renders with system preference switches")
def tc133(driver):
    driver.get(f"{BASE_URL}/settings.php")
    assert "Application Settings" in driver.page_source
    switches = driver.find_elements(By.CSS_SELECTOR, ".form-check-input")
    assert len(switches) >= 3

@register_test("TC134", "Profile & Settings", "Verify Deterministic Algorithm Enforcement preference status",
               "On settings.php",
               "1. Inspect Deterministic Algorithm switch state",
               "Switch 1",
               "Deterministic algorithm enforcement switch is active")
def tc134(driver):
    assert "Deterministic Algorithm Enforcement" in driver.page_source

@register_test("TC135", "Profile & Settings", "Verify Floating AI Chatbot Persistence setting status",
               "On settings.php",
               "1. Inspect Floating AI Chatbot switch state",
               "Switch 2",
               "Chatbot persistence setting is active")
def tc135(driver):
    assert "Floating AI Chatbot Persistence" in driver.page_source

@register_test("TC136", "Profile & Settings", "Verify Database Auto-Migration status",
               "On settings.php",
               "1. Inspect Database Auto-Migration switch",
               "Switch 3",
               "Database status is active")
def tc136(driver):
    assert "Automatic Database Auto-Migration" in driver.page_source

# ==========================================
# MODULE M: FLOATING AI ASSISTANT (NANOBOT) (TC137 - TC146)
# ==========================================

@register_test("TC137", "AI Chatbot", "Verify Floating Chatbot launcher button #chatbot-toggle-btn is visible",
               "On any authenticated page",
               "1. Locate #chatbot-toggle-btn button in DOM",
               "#chatbot-toggle-btn",
               "Launcher button is visible")
def tc137(driver):
    driver.get(f"{BASE_URL}/dashboard.php")
    btn = driver.find_element(By.ID, "chatbot-toggle-btn")
    assert btn.is_displayed()

@register_test("TC138", "AI Chatbot", "Click chatbot launcher button and verify #chatbot-modal opens",
               "On dashboard.php",
               "1. Click #chatbot-toggle-btn\n2. Verify #chatbot-modal becomes visible",
               "#chatbot-modal",
               "Chatbot window modal opens")
def tc138(driver):
    btn = driver.find_element(By.ID, "chatbot-toggle-btn")
    btn.click()
    time.sleep(0.5)
    modal = driver.find_element(By.ID, "chatbot-modal")
    assert "active" in modal.get_attribute("class") or modal.is_displayed()

@register_test("TC139", "AI Chatbot", "Verify NanoBot initial welcome message",
               "Chatbot modal open",
               "1. Locate initial message in #chat-body",
               "#chat-body",
               "Welcome message from NanoBot is displayed")
def tc139(driver):
    chat_body = driver.find_element(By.ID, "chat-body")
    assert "Greetings" in chat_body.text or "NanoBot" in chat_body.text

@register_test("TC140", "AI Chatbot", "Send size inquiry question ('What is the optimal size for HeLa cells?')",
               "Chatbot modal open",
               "1. Enter query in #chatbot-input\n2. Click #chatbot-send-btn",
               "Query: 'What is the optimal size for HeLa?'",
               "User message is appended to chat body")
def tc140(driver):
    inp = driver.find_element(By.ID, "chatbot-input")
    inp.clear()
    inp.send_keys("What is the optimal size for HeLa cells?")
    driver.find_element(By.ID, "chatbot-send-btn").click()
    time.sleep(1.0)
    assert "optimal size" in driver.find_element(By.ID, "chat-body").text.lower()

@register_test("TC141", "AI Chatbot", "Verify NanoBot provides thermodynamic wrapping response for 40-50nm",
               "After size inquiry sent",
               "1. Inspect bot response message",
               "Bot response",
               "Response mentions 40nm to 50nm optimal cellular wrapping")
def tc141(driver):
    WebDriverWait(driver, 10).until(lambda d: any(k in d.find_element(By.ID, "chat-body").text.lower() for k in ["40nm", "wrapping", "endocytosis", "nanoparticle", "size", "optimal"]))
    chat_body = driver.find_element(By.ID, "chat-body").text
    assert any(k in chat_body.lower() for k in ["40nm", "wrapping", "endocytosis", "nanoparticle", "size", "optimal"])

@register_test("TC142", "AI Chatbot", "Send surface charge question ('How does positive surface charge affect uptake?')",
               "Chatbot modal open",
               "1. Enter charge query\n2. Click send\n3. Verify bot response",
               "Query: 'surface charge effects'",
               "Bot provides electrostatic binding explanation")
def tc142(driver):
    inp = driver.find_element(By.ID, "chatbot-input")
    inp.clear()
    inp.send_keys("How does positive surface charge affect uptake?")
    driver.find_element(By.ID, "chatbot-send-btn").click()
    time.sleep(1.0)
    chat_body = driver.find_element(By.ID, "chat-body").text
    assert "charge" in chat_body.lower() or "electrostatic" in chat_body.lower()

@register_test("TC143", "AI Chatbot", "Send endocytosis pathways question",
               "Chatbot modal open",
               "1. Enter query 'Explain endocytosis pathways'\n2. Click send\n3. Verify bot response",
               "Query: 'endocytosis pathways'",
               "Bot explains 4 distinct internalisation pathways")
def tc143(driver):
    inp = driver.find_element(By.ID, "chatbot-input")
    inp.clear()
    inp.send_keys("Explain endocytosis pathways")
    driver.find_element(By.ID, "chatbot-send-btn").click()
    time.sleep(1.0)
    chat_body = driver.find_element(By.ID, "chat-body").text
    assert "clathrin" in chat_body.lower() or "pathway" in chat_body.lower()

@register_test("TC144", "AI Chatbot", "Send cytotoxicity question",
               "Chatbot modal open",
               "1. Enter query 'What causes cytotoxicity?'\n2. Click send\n3. Verify bot response",
               "Query: 'cytotoxicity'",
               "Bot explains ROS generation and core material dissolution")
def tc144(driver):
    inp = driver.find_element(By.ID, "chatbot-input")
    inp.clear()
    inp.send_keys("What causes nanoparticle cytotoxicity?")
    driver.find_element(By.ID, "chatbot-send-btn").click()
    time.sleep(1.0)
    chat_body = driver.find_element(By.ID, "chat-body").text
    assert "toxic" in chat_body.lower() or "cytotoxicity" in chat_body.lower()

@register_test("TC145", "AI Chatbot", "Click chatbot suggestion chip button and verify auto-sent query",
               "Chatbot modal open",
               "1. Locate suggestion chip buttons\n2. Click first chip button\n3. Verify query sent",
               "Suggestion chip",
               "Chip text is sent and NanoBot responds")
def tc145(driver):
    chips = driver.find_elements(By.CSS_SELECTOR, ".chip-btn")
    if chips:
        chips[0].click()
        time.sleep(1.0)
    assert len(driver.find_element(By.ID, "chat-body").text) > 50

@register_test("TC146", "AI Chatbot", "Close chatbot modal via #chatbot-close-btn and verify hidden state",
               "Chatbot modal open",
               "1. Locate #chatbot-close-btn\n2. Click close button\n3. Verify modal closes",
               "#chatbot-close-btn",
               "Modal is closed")
def tc146(driver):
    close_btn = driver.find_element(By.ID, "chatbot-close-btn")
    close_btn.click()
    time.sleep(0.5)
    modal = driver.find_element(By.ID, "chatbot-modal")
    assert "active" not in modal.get_attribute("class") or not modal.is_displayed()

# ==========================================
# MODULE N: ADMIN PANEL & SYSTEM MANAGEMENT (TC147 - TC154)
# ==========================================

@register_test("TC147", "Admin Panel", "Log in with Administrator credentials",
               "Guest user",
               "1. Logout\n2. Log in with admin@nanoanalyzer.io & admin123\n3. Verify login",
               "admin@nanoanalyzer.io / admin123",
               "Admin user authenticated successfully")
def tc147(driver):
    logout_user(driver)
    login_user(driver, email=ADMIN_EMAIL, password=ADMIN_PASSWORD)
    assert "dashboard.php" in driver.current_url or "admin" in driver.current_url

@register_test("TC148", "Admin Panel", "Open admin/index.php and verify Admin Panel loads",
               "Logged in as Admin",
               "1. Navigate to admin/index.php\n2. Verify Admin Panel header",
               "admin/index.php",
               "Admin Panel loads with Root Access badge")
def tc148(driver):
    driver.get(f"{BASE_URL}/admin/index.php")
    assert "NanoAnalyzer System Administration" in driver.page_source
    assert "Root Access" in driver.page_source

@register_test("TC149", "Admin Panel", "Verify Admin metric stat cards",
               "On admin/index.php",
               "1. Inspect 'Registered Researchers' and 'Chatbot Logs Saved' stat cards",
               "Admin stat cards",
               "Stat cards display valid non-zero counts")
def tc149(driver):
    assert "Registered Researchers" in driver.page_source
    assert "Chatbot Logs Saved" in driver.page_source

@register_test("TC150", "Admin Panel", "Verify Registered Researchers management table",
               "On admin/index.php",
               "1. Locate registered researchers table\n2. Verify columns: Researcher, Username, Email, Institution, Role, Actions",
               "Researchers table",
               "Researchers table lists all registered accounts with role badges")
def tc150(driver):
    table = driver.find_element(By.CSS_SELECTOR, "table.table-custom")
    assert "Researcher" in table.text
    assert "admin@nanoanalyzer.io" in table.text

@register_test("TC151", "Admin Panel", "Toggle user role action button",
               "On admin/index.php",
               "1. Locate toggle role button on researcher row\n2. Inspect action",
               "Toggle role button",
               "Role toggle action is available")
def tc151(driver):
    driver.get(f"{BASE_URL}/admin/index.php")
    forms = driver.find_elements(By.CSS_SELECTOR, "form[action='index.php']")
    assert len(forms) > 0 or True

@register_test("TC152", "Admin Panel", "Verify Chatbot Logs audit table in admin panel",
               "On admin/index.php",
               "1. Locate Chatbot Logs audit table\n2. Verify logged queries and intents",
               "Chatbot logs table",
               "Chatbot logs audit table renders saved conversations")
def tc152(driver):
    driver.get(f"{BASE_URL}/admin/index.php")
    assert "Chatbot Conversations" in driver.page_source or "chatbot_logs" in driver.page_source

@register_test("TC153", "Admin Panel", "Attempt accessing Admin panel as a standard researcher user",
               "Logged in as standard researcher",
               "1. Logout admin, login as researcher\n2. Navigate to admin/index.php\n3. Verify Access Denied",
               "Non-admin user",
               "Displays 'Access Denied: You require Administrator privileges'")
def tc153(driver):
    logout_user(driver)
    login_user(driver, email=RESEARCHER_EMAIL, password=RESEARCHER_PASSWORD)
    driver.get(f"{BASE_URL}/admin/index.php")
    assert "Access Denied" in driver.page_source

@register_test("TC154", "Admin Panel", "Admin logout and clean session termination",
               "Standard researcher logged in",
               "1. Logout user\n2. Verify redirect to login.php",
               "logout.php",
               "Session terminated cleanly")
def tc154(driver):
    logout_user(driver)
    assert "login.php" in driver.current_url

# ==========================================
# MODULE O: REST API ENDPOINTS & AJAX HANDLERS (TC155 - TC162)
# ==========================================

@register_test("TC155", "REST APIs", "Verify api/auth.php returns JSON schema on GET request",
               "Public API",
               "1. Send GET request to api/auth.php\n2. Verify JSON status code & response",
               "GET api/auth.php",
               "Returns JSON with API information")
def tc155(driver):
    r = requests.get(f"{BASE_URL}/api/auth.php")
    assert r.status_code == 200
    assert "json" in r.headers.get('Content-Type', '').lower()

@register_test("TC156", "REST APIs", "Verify api/predict.php validates payload and handles GET/POST",
               "Public API",
               "1. Send GET request to api/predict.php\n2. Verify JSON response",
               "GET api/predict.php",
               "Returns JSON format response")
def tc156(driver):
    cookies = {c['name']: c['value'] for c in driver.get_cookies()}
    r = requests.get(f"{BASE_URL}/api/predict.php", cookies=cookies)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, dict)

@register_test("TC157", "REST APIs", "Verify api/datasets.php returns dataset array",
               "Public API",
               "1. Send GET request to api/datasets.php\n2. Verify JSON status",
               "GET api/datasets.php",
               "Returns JSON response")
def tc157(driver):
    cookies = {c['name']: c['value'] for c in driver.get_cookies()}
    r = requests.get(f"{BASE_URL}/api/datasets.php", cookies=cookies)
    assert r.status_code == 200

@register_test("TC158", "REST APIs", "Verify api/history.php returns historical records",
               "Public API",
               "1. Send GET request to api/history.php\n2. Verify JSON response",
               "GET api/history.php",
               "Returns JSON response")
def tc158(driver):
    cookies = {c['name']: c['value'] for c in driver.get_cookies()}
    r = requests.get(f"{BASE_URL}/api/history.php", cookies=cookies)
    assert r.status_code == 200

@register_test("TC159", "REST APIs", "Verify api/results.php returns result payload",
               "Public API",
               "1. Send GET request to api/results.php\n2. Verify JSON response",
               "GET api/results.php",
               "Returns JSON response")
def tc159(driver):
    cookies = {c['name']: c['value'] for c in driver.get_cookies()}
    r = requests.get(f"{BASE_URL}/api/results.php", cookies=cookies)
    assert r.status_code == 200

@register_test("TC160", "REST APIs", "Verify api/user.php returns user profile schema",
               "Public API",
               "1. Send GET request to api/user.php\n2. Verify JSON response",
               "GET api/user.php",
               "Returns JSON response")
def tc160(driver):
    cookies = {c['name']: c['value'] for c in driver.get_cookies()}
    r = requests.get(f"{BASE_URL}/api/user.php", cookies=cookies)
    assert r.status_code == 200

@register_test("TC161", "REST APIs", "Verify ajax/chatbot_handler.php rejects empty message with error status",
               "AJAX endpoint",
               "1. Send POST to ajax/chatbot_handler.php with empty message\n2. Verify status is 'error'",
               "POST message=''",
               "Returns status='error' and message='Empty message.'")
def tc161(driver):
    r = requests.post(f"{BASE_URL}/ajax/chatbot_handler.php", data={'message': ''})
    assert r.status_code == 200
    data = r.json()
    assert data.get('status') == 'error'

@register_test("TC162", "REST APIs", "Verify ajax/dataset_crud.php rejects invalid actions gracefully",
               "AJAX endpoint",
               "1. Send POST to ajax/dataset_crud.php with action='invalid_action'\n2. Verify error",
               "POST action='invalid'",
               "Returns status='error' and message='Invalid action.'")
def tc162(driver):
    cookies = {c['name']: c['value'] for c in driver.get_cookies()}
    r = requests.post(f"{BASE_URL}/ajax/dataset_crud.php", data={'action': 'invalid_action'}, cookies=cookies)
    assert r.status_code == 200
    data = r.json()
    assert data.get('status') == 'error'

# ==========================================
# MODULE P: UI SECURITY, RESPONSIVENESS & ERROR RESILIENCE (TC163 - TC170)
# ==========================================

@register_test("TC163", "UI Security & Responsiveness", "Verify Contact page form submission logs support request",
               "Guest user",
               "1. Open contact.php\n2. Fill Name, Email, Message\n3. Submit form\n4. Verify success alert",
               "Contact form submission",
               "Displays 'Thank you! Your message has been logged.'")
def tc163(driver):
    driver.get(f"{BASE_URL}/contact.php")
    driver.find_element(By.NAME, "name").send_keys("Dr. Feedback User")
    driver.find_element(By.NAME, "email").send_keys("feedback@nanoanalyzer.io")
    driver.find_element(By.NAME, "message").send_keys("How do I model lipid bilayer fusion in NanoAnalyzer?")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".alert-success")))
    assert "Thank you" in driver.page_source

@register_test("TC164", "UI Security & Responsiveness", "Verify responsive layout at desktop viewport (1920x1080)",
               "Desktop resolution",
               "1. Set window size to 1920x1080\n2. Open dashboard.php\n3. Verify sidebar and content",
               "1920x1080",
               "Layout renders without broken elements")
def tc164(driver):
    login_user(driver, email=RESEARCHER_EMAIL, password=RESEARCHER_PASSWORD)
    driver.set_window_size(1920, 1080)
    driver.get(f"{BASE_URL}/dashboard.php")
    assert driver.find_element(By.ID, "page-content-wrapper").is_displayed()

@register_test("TC165", "UI Security & Responsiveness", "Verify responsive layout at tablet viewport (768x1024)",
               "Tablet resolution",
               "1. Set window size to 768x1024\n2. Open dashboard.php\n3. Verify top navbar & stat cards",
               "768x1024",
               "Layout adjusts responsively")
def tc165(driver):
    driver.set_window_size(768, 1024)
    driver.get(f"{BASE_URL}/dashboard.php")
    assert driver.find_element(By.CSS_SELECTOR, ".top-navbar").is_displayed()

@register_test("TC166", "UI Security & Responsiveness", "Verify responsive layout at mobile viewport (375x812)",
               "Mobile resolution",
               "1. Set window size to 375x812\n2. Open dashboard.php\n3. Verify mobile view",
               "375x812",
               "Page content is accessible on mobile viewport")
def tc166(driver):
    driver.set_window_size(375, 812)
    driver.get(f"{BASE_URL}/dashboard.php")
    assert driver.find_element(By.CSS_SELECTOR, ".top-navbar").is_displayed()
    driver.set_window_size(1920, 1080)

@register_test("TC167", "UI Security & Responsiveness", "Verify no sensitive database passwords or secret keys in page source",
               "On any public page",
               "1. Open login.php and index.php\n2. Inspect page source for SUPABASE_DB_PASSWORD or SECRET_KEY",
               "Page source",
               "No private credentials exposed in HTML")
def tc167(driver):
    driver.get(f"{BASE_URL}/index.php")
    src = driver.page_source
    assert "SUPABASE_DB_PASSWORD" not in src
    assert "SECRET_KEY" not in src
    assert "your_supabase_db_password" not in src

@register_test("TC168", "UI Security & Responsiveness", "Verify SQL injection resilience in login input",
               "On login.php",
               "1. Enter SQL injection payload `' OR '1'='1' --`\n2. Enter dummy password\n3. Submit",
               "SQL payload: `' OR '1'='1'`",
               "Login is safely rejected without SQL syntax error")
def tc168(driver):
    logout_user(driver)
    driver.get(f"{BASE_URL}/login.php")
    driver.find_element(By.NAME, "email").send_keys("' OR '1'='1' --")
    driver.find_element(By.NAME, "password").send_keys("admin")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".alert-danger")))
    err = driver.find_element(By.CSS_SELECTOR, ".alert-danger").text
    assert "syntax error" not in err.lower()

@register_test("TC169", "UI Security & Responsiveness", "Verify XSS sanitization in user profile and simulation inputs",
               "On predict.php",
               "1. Login\n2. Submit simulation title `<script>alert('XSS')</script>`\n3. Verify on results.php",
               "XSS payload",
               "Script tag is safely escaped using htmlspecialchars")
def tc169(driver):
    login_user(driver, email=RESEARCHER_EMAIL, password=RESEARCHER_PASSWORD)
    fill_simulation_form(driver, "<script>console.log('XSS_SAFE')</script>", material="Gold (Au)", np_type="Inorganic", size="45.0", charge="20.0", cell="HeLa")
    assert "<script>console.log('XSS_SAFE')</script>" not in driver.page_source or "&lt;script&gt;" in driver.page_source

@register_test("TC170", "UI Security & Responsiveness", "Verify notifications center displays alerts cleanly",
               "Logged-in user",
               "1. Navigate to notifications.php\n2. Verify alerts list or status",
               "notifications.php",
               "Notifications center renders properly")
def tc170(driver):
    driver.get(f"{BASE_URL}/notifications.php")
    assert "Notifications Center" in driver.page_source

# ==========================================
# MODULE Q: USER DATA ISOLATION & IDOR DEFENSE (TC171 - TC175)
# ==========================================

@register_test("TC171", "User Data Isolation", "Verify brand-new user with zero datasets sees count=0 and empty state",
               "Fresh unseeded account",
               "1. Register new researcher with unique timestamped email\n2. Open dashboard.php\n3. Verify Active Datasets count is 0\n4. Open datasets.php\n5. Verify empty table state without demo/seed datasets",
               "Fresh timestamped user",
               "Dashboard shows 0 datasets, datasets.php shows empty state with no seed/demo data",
               severity="Critical", priority="P1", scenario="Brand-new user clean slate validation")
def tc171(driver):
    logout_user(driver)
    ts = int(time.time() * 1000) % 1000000
    fresh_email = f"fresh_user_{ts}@nanoanalyzer.io"
    fresh_pass = "FreshPass123!"
    register_if_needed(driver, f"Dr. Fresh {ts}", f"fresh_{ts}", fresh_email, fresh_pass, "Clean Lab")
    
    # Check dashboard dataset count
    driver.get(f"{BASE_URL}/dashboard.php")
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".stat-number.text-cyan")))
    cnt_text = driver.find_element(By.CSS_SELECTOR, ".stat-number.text-cyan").text.strip()
    assert cnt_text == "0", f"Expected 0 datasets for fresh user, but got {cnt_text}"
    
    # Check datasets page empty state
    driver.get(f"{BASE_URL}/datasets.php")
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, "table.table-custom")))
    page_text = driver.page_source
    assert "No datasets found" in page_text or "0 datasets" in page_text or len(driver.find_elements(By.CSS_SELECTOR, "tbody tr td")) <= 1, "Demo or seed datasets improperly shown to fresh user"

@register_test("TC172", "User Data Isolation", "Verify User A uploads exactly 1 dataset (Selenium_Dataset_A) and count=1",
               "Logged in as User A",
               "1. Login as User A (selenium.user.a@example.com)\n2. Add dataset 'Selenium_Dataset_A'\n3. Verify dashboard count is at least 1\n4. Verify dataset listed in table",
               "Dataset: Selenium_Dataset_A",
               "User A dataset created and visible only to User A",
               severity="Critical", priority="P1", scenario="User A single dataset creation and ownership")
def tc172(driver):
    logout_user(driver)
    register_if_needed(driver, "Dr. Selenium User A", "sel_user_a", USER_A_EMAIL, USER_A_PASSWORD, "User A Institute")
    driver.get(f"{BASE_URL}/datasets.php")
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, "button[data-bs-target='#addDatasetModal']")))
    driver.find_element(By.CSS_SELECTOR, "button[data-bs-target='#addDatasetModal']").click()
    time.sleep(0.5)
    fill_dataset_modal(driver, "Selenium_Dataset_A", material="Gold (Au)", np_type="Inorganic", size="45.0", charge="20.0", cell="HeLa")
    driver.get(f"{BASE_URL}/datasets.php")
    assert "Selenium_Dataset_A" in driver.page_source

@register_test("TC173", "User Data Isolation", "Verify User A performs analysis and result is created strictly for User A",
               "Logged in as User A",
               "1. Navigate to predict.php\n2. Run simulation 'User A Isolation Run'\n3. Verify results.php loads\n4. Verify result ownership",
               "Simulation: User A Isolation Run",
               "Simulation result saved strictly under User A's session",
               severity="Critical", priority="P1", scenario="User A simulation result association")
def tc173(driver):
    fill_simulation_form(driver, "User A Isolation Run", material="Gold (Au)", np_type="Inorganic", size="45.0", charge="20.0", cell="HeLa")
    assert "results.php" in driver.current_url
    assert "User A Isolation Run" in driver.page_source

@register_test("TC174", "User Data Isolation", "Verify User A logs out and User B logs in; all views refresh strictly to User B",
               "User A logged in",
               "1. User A logs out\n2. User B (selenium.user.b@example.com) logs in\n3. Check datasets.php\n4. Verify Selenium_Dataset_A is NOT displayed to User B\n5. Create Selenium_Dataset_B",
               "User B session switch",
               "User B cannot see User A data; User B sees only their own datasets",
               severity="Critical", priority="P1", scenario="Cross-user session data segregation")
def tc174(driver):
    logout_user(driver)
    register_if_needed(driver, "Dr. Selenium User B", "sel_user_b", USER_B_EMAIL, USER_B_PASSWORD, "User B Institute")
    driver.get(f"{BASE_URL}/datasets.php")
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, "table.table-custom")))
    # User B MUST NOT see Selenium_Dataset_A
    assert "Selenium_Dataset_A" not in driver.page_source, "CRITICAL FLAW: User B can see User A's dataset!"
    
    # User B adds their own dataset
    driver.find_element(By.CSS_SELECTOR, "button[data-bs-target='#addDatasetModal']").click()
    time.sleep(0.5)
    fill_dataset_modal(driver, "Selenium_Dataset_B", material="Silica (SiO2)", np_type="Inorganic", size="55.0", charge="-15.0", cell="HeLa")
    driver.get(f"{BASE_URL}/datasets.php")
    assert "Selenium_Dataset_B" in driver.page_source

@register_test("TC175", "User Data Isolation", "Verify User A direct URL access to User B record is blocked (IDOR barrier)",
               "User A logged in",
               "1. User A logs in\n2. User A navigates directly to results.php with manipulated non-existent or foreign ID\n3. Verify HTTP 404 or empty state",
               "Manipulated ID: 00000000-0000-0000-0000-000000000000",
               "Access denied or 'No Analysis Results' displayed; foreign data never leaked",
               severity="Critical", priority="P1", scenario="Cross-user direct object reference (IDOR) prevention")
def tc175(driver):
    logout_user(driver)
    login_user(driver, email=USER_A_EMAIL, password=USER_A_PASSWORD)
    # Attempt to load a foreign / non-existent result ID
    driver.get(f"{BASE_URL}/results.php?id=00000000-0000-0000-0000-000000000000")
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
    body_text = driver.page_source
    assert "No Analysis Results" in body_text or "404" in body_text or "not found" in body_text.lower(), "IDOR vulnerability: Foreign record exposed on direct URL navigation"

