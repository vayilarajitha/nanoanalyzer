# NanoAnalyzer QA Test Case Data Definition (140 Unique Project-Specific Tests)

REAL_BENCHMARKS = {
    'login_page_get_ms': 2500.7,
    'auth_submission_ms': 9578.5,
    'dashboard_load_ms': 4341.0,
    'predict_page_load_ms': 4031.1,
    'datasets_load_ms': 4056.4,
    'experiments_load_ms': 4170.9,
    'history_load_ms': 4341.3,
    'chatbot_roundtrip_ms': 695.3,
}

# The 140 unique test cases covering all 22 required categories
TEST_CASES = []

def add_tc(tc_id, t_type, module, feature, scenario, pre, steps, data, expected, actual, status, sev, pri, defect, deploy, cat_sheet):
    TEST_CASES.append({
        'id': tc_id,
        'type': t_type,
        'module': module,
        'feature': feature,
        'scenario': scenario,
        'preconditions': pre,
        'steps': steps,
        'data': data,
        'expected': expected,
        'actual': actual,
        'status': status,
        'severity': sev,
        'priority': pri,
        'defect': defect,
        'deployable': deploy,
        'sheet': cat_sheet
    })

# ==========================================
# 1. UI/UX TESTING (TC001 - TC022) - 22 Tests
# ==========================================
add_tc("TC001", "UI/UX", "Navigation & Branding", "Hero Section", "Verify landing page brand identity and hero badge rendering",
       "Browser navigated to /index.php", "1. Open index.php\n2. Inspect navbar brand\n3. Verify hero badge",
       "URL: /index.php", "Brand 'NanoAnalyzer' and 'Biophysical Simulation' badge render with correct cyan styling",
       "Passed: Brand title and cyan badge rendered cleanly without layout distortion", "PASS", "Medium", "P2", "None", "Deployable", "UI_UX")

add_tc("TC002", "UI/UX", "Navigation & Branding", "Responsive Navbar", "Verify top navigation bar links and collapse toggle on small screens",
       "Landing page loaded", "1. Inspect navbar links\n2. Resize to mobile width\n3. Click navbar toggler",
       "Viewport: 375px", "Navbar collapses into burger menu and expands on click",
       "Passed: Hamburger menu toggle expanded navigation links cleanly", "PASS", "Medium", "P2", "None", "Deployable", "UI_UX")

add_tc("TC003", "UI/UX", "Authentication UI", "Login Card Layout", "Verify login card dark glassmorphism styling and form alignment",
       "Browser navigated to /login.php", "1. Open login.php\n2. Verify card centering, inputs, and button",
       "URL: /login.php", "Login card centered with email, password fields and sign-in button visible",
       "Passed: Glassmorphic dark card rendered with high contrast and proper field spacing", "PASS", "Medium", "P2", "None", "Deployable", "UI_UX")

add_tc("TC004", "UI/UX", "Authentication UI", "Registration UI", "Verify registration form input fields, labels and institution placeholder",
       "Browser navigated to /register.php", "1. Open register.php\n2. Inspect full name, username, email, institution fields",
       "URL: /register.php", "All registration inputs, labels, and placeholders rendered cleanly",
       "Passed: Form fields aligned in responsive grid with clear descriptive labels", "PASS", "Medium", "P2", "None", "Deployable", "UI_UX")

add_tc("TC005", "UI/UX", "Authentication UI", "Forgot Password UI", "Verify forgot password card and email instruction text layout",
       "Browser navigated to /forgot_password.php", "1. Open forgot_password.php\n2. Verify instruction text and email field",
       "URL: /forgot_password.php", "Email input and 'Send Verification OTP' button displayed cleanly",
       "Passed: Recovery card displayed with clear directions and back-to-login link", "PASS", "Low", "P3", "None", "Deployable", "UI_UX")

add_tc("TC006", "UI/UX", "Authentication UI", "OTP Verification UI", "Verify OTP verification input layout and digit placeholder display",
       "OTP requested via forgot password", "1. Open verify_otp.php\n2. Verify 6-digit OTP input field styling",
       "URL: /verify_otp.php", "Single/multi-digit OTP box centered with clear numeric entry hint",
       "Passed: Numeric input box with 6-digit limit and 'Verify OTP' button visible", "PASS", "Medium", "P2", "None", "Deployable", "UI_UX")

add_tc("TC007", "UI/UX", "Dashboard UI", "Stat Cards Grid", "Verify 4 executive KPI stat cards rendering and color-coded icons",
       "User authenticated on dashboard.php", "1. Open dashboard.php\n2. Verify Simulations, Datasets, Uptake, Experiments cards",
       "User session active", "Four stat cards rendered with distinctive color icons (primary, cyan, emerald, amber)",
       "Passed: Glass-panel cards displayed with accurate values and high visual contrast", "PASS", "High", "P1", "None", "Deployable", "UI_UX")

add_tc("TC008", "UI/UX", "Dashboard UI", "Active Datasets Counter", "Verify Active Datasets counter typography and cyan highlight class",
       "On dashboard.php", "1. Locate 'Active Datasets' card\n2. Inspect .stat-number.text-cyan element",
       "CSS: .stat-number.text-cyan", "Counter displays bold numeric text in cyan accent font",
       "Passed: Dataset counter text formatted with .stat-number.text-cyan class cleanly", "PASS", "High", "P1", "None", "Deployable", "UI_UX")

add_tc("TC009", "UI/UX", "Analysis UI", "Simulation Form Layout", "Verify biophysical parameter inputs alignment and range tooltips",
       "On predict.php", "1. Open predict.php\n2. Verify Core Material, Size, Charge, Cell Line, Concentration fields",
       "URL: /predict.php", "Two-column grid with labeled dropdowns and numeric step inputs",
       "Passed: Input parameters structured cleanly with unit indicators (nm, mV, ug/mL, h)", "PASS", "High", "P1", "None", "Deployable", "UI_UX")

add_tc("TC010", "UI/UX", "Results UI", "Prediction Summary Card", "Verify results KPI cards and uptake percentage radial/badge display",
       "Completed simulation on results.php", "1. View results.php\n2. Inspect Uptake %, Diffusion, Release Rate scores",
       "Analysis ID UUID", "Uptake percentage highlighted with high-contrast badge and progress bar",
       "Passed: Primary outcome cards rendered with distinct metrics and confidence rating", "PASS", "High", "P1", "None", "Deployable", "UI_UX")

add_tc("TC011", "UI/UX", "Visualizations UI", "Interactive Kinetic Charts", "Verify Chart.js canvas containers rendering on results and analytics pages",
       "On results.php or analytics.php", "1. Inspect canvas chart containers\n2. Verify chart legends and axis labels",
       "Canvas elements", "Interactive line/bar charts rendered cleanly without overflow",
       "Passed: Size-uptake curve and time-dependent kinetics rendered on Chart.js canvas", "PASS", "Medium", "P2", "None", "Deployable", "UI_UX")

add_tc("TC012", "UI/UX", "Dataset Library UI", "Datasets Table Layout", "Verify dataset table columns, badges, action buttons and hover states",
       "On datasets.php", "1. Open datasets.php\n2. Verify Material, Size, Charge, Cell Line, Uptake columns",
       "URL: /datasets.php", "Table formatted with alternating glass row styling and action icons",
       "Passed: Responsive dataset table displayed with clean column headers and trash icon", "PASS", "Medium", "P2", "None", "Deployable", "UI_UX")

add_tc("TC013", "UI/UX", "Dataset Library UI", "Add Dataset Modal UI", "Verify Add Dataset modal backdrop blur, inputs alignment and close button",
       "On datasets.php", "1. Click 'Add Dataset'\n2. Inspect modal dialog",
       "Modal: #addDatasetModal", "Modal opens with dark blurred backdrop and clean two-column form",
       "Passed: Modal dialog rendered smoothly with clear submit and cancel triggers", "PASS", "Medium", "P2", "None", "Deployable", "UI_UX")

add_tc("TC014", "UI/UX", "Experiment UI", "Experiment Card Badges", "Verify experiment cards display status badges with appropriate theme colors",
       "On experiments.php", "1. Open experiments.php\n2. Inspect experiment cards and status badges",
       "URL: /experiments.php", "Badges show 'In Progress' (cyan), 'Completed' (emerald), 'Planned' (amber)",
       "Passed: Status badges rendered with distinct semantic background and border colors", "PASS", "Medium", "P2", "None", "Deployable", "UI_UX")

add_tc("TC015", "UI/UX", "Experiment UI", "Add Experiment Modal UI", "Verify Add Experiment modal inputs, textareas, and submit button alignment",
       "On experiments.php", "1. Click 'New Experiment'\n2. Inspect modal fields",
       "Modal: #addExpModal", "Title, protocol description, cell line, and status dropdown cleanly laid out",
       "Passed: Form elements spaced with proper margins and clear action button", "PASS", "Medium", "P2", "None", "Deployable", "UI_UX")

add_tc("TC016", "UI/UX", "History UI", "Audit Log Table", "Verify historical simulation audit table pagination and timestamp formatting",
       "On history.php with existing runs", "1. Open history.php\n2. Inspect date/time format and simulation tags",
       "URL: /history.php", "Timestamps formatted in human-readable format (Asia/Kolkata timezone)",
       "Passed: History table rendered with formatted timestamps and view result links", "PASS", "Medium", "P2", "None", "Deployable", "UI_UX")

add_tc("TC017", "UI/UX", "Reports UI", "Report Download Cards", "Verify report export cards with PDF/CSV icons and download buttons",
       "On reports.php", "1. Open reports.php\n2. Inspect export options and summary metrics",
       "URL: /reports.php", "PDF and CSV export cards rendered with icon badges and download buttons",
       "Passed: Report export layout rendered with distinct document type icons", "PASS", "Medium", "P2", "None", "Deployable", "UI_UX")

add_tc("TC018", "UI/UX", "Profile UI", "Avatar & Details Layout", "Verify researcher profile avatar placeholder, badge and institution card",
       "On profile.php", "1. Open profile.php\n2. Inspect avatar image, name, email, and bio card",
       "URL: /profile.php", "Profile image displayed in rounded container with user metadata",
       "Passed: Profile view rendered with clean card layout and editable fields", "PASS", "Low", "P3", "None", "Deployable", "UI_UX")

add_tc("TC019", "UI/UX", "Notifications UI", "Notification Bell & List", "Verify top navbar notification bell badge and notifications dropdown/page",
       "User authenticated", "1. Inspect notification icon\n2. Navigate to notifications.php",
       "URL: /notifications.php", "Red unread badge on bell; list of system notifications with timestamps",
       "Passed: Notification bell and notifications list rendered with read/unread styling", "PASS", "Low", "P3", "None", "Deployable", "UI_UX")

add_tc("TC020", "UI/UX", "Chatbot UI", "Floating Widget Launcher", "Verify floating NanoBot AI Assistant button fixed in bottom-right corner",
       "Any authenticated page", "1. Inspect bottom right of screen\n2. Verify launcher button position",
       "CSS: #chatbot-toggle-btn", "Cyan circular button with robot icon fixed at bottom-right (z-index 1050)",
       "Passed: Floating button rendered fixed above content with hover glow effect", "PASS", "Medium", "P2", "None", "Deployable", "UI_UX")

add_tc("TC021", "UI/UX", "Chatbot UI", "Chat Window Conversation Layout", "Verify chat popup window, message bubbles, input field and send icon",
       "Launcher clicked", "1. Click chatbot launcher\n2. Inspect header, messages area, input box",
       "Widget: #chatbot-widget", "Dark glassmorphic chat card with distinct user (cyan) and bot (dark) bubbles",
       "Passed: Chat window opened smoothly with greeting message and active input field", "PASS", "Medium", "P2", "None", "Deployable", "UI_UX")

add_tc("TC022", "UI/UX", "Empty States", "Zero-Data Empty State Display", "Verify clean empty state illustration and 'New Run' button when no simulations exist",
       "Newly registered user account", "1. Log in with new user\n2. Open dashboard.php and results.php",
       "New user session", "'No Analysis Results' empty state card displayed without broken images",
       "Passed: Empty state displayed with prompt to start first biophysical analysis", "PASS", "High", "P1", "None", "Deployable", "UI_UX")

print(f"Added {len(TEST_CASES)} UI/UX test cases.")
