# NanoAnalyzer QA Test Case Data: Validation, Auth & User Isolation, Database Testing

from qa_data_p2 import add_tc, TEST_CASES

# ==========================================
# 4. VALIDATION TESTING (TC071 - TC085) - 15 Tests
# ==========================================
add_tc("TC071", "Validation", "Input Validation", "Size Lower Boundary Rejection", "Submit nanoparticle size < 1.0nm on predict.php and verify boundary rejection",
       "On predict.php", "1. Enter size = 0.2nm\n2. Submit simulation form",
       "Size: 0.2nm", "Validation error: 'Nanoparticle size must be between 1.0nm and 500.0nm'",
       "Passed: Form prevented submission with range validation message", "PASS", "High", "P1", "None", "Deployable", "Validation")

add_tc("TC072", "Validation", "Input Validation", "Size Upper Boundary Rejection", "Submit nanoparticle size > 500.0nm on predict.php and verify boundary rejection",
       "On predict.php", "1. Enter size = 750.0nm\n2. Submit simulation form",
       "Size: 750.0nm", "Validation error: 'Nanoparticle size must be between 1.0nm and 500.0nm'",
       "Passed: Form prevented submission exceeding physical microscale limit", "PASS", "High", "P1", "None", "Deployable", "Validation")

add_tc("TC073", "Validation", "Input Validation", "Surface Charge Boundary", "Submit surface charge beyond [-100mV, +100mV] and verify range rejection",
       "On predict.php", "1. Enter charge = +150.0mV\n2. Submit form",
       "Charge: +150.0mV", "Validation error: 'Surface charge must be between -100mV and +100mV'",
       "Passed: Form blocked extreme zeta potential input", "PASS", "High", "P1", "None", "Deployable", "Validation")

add_tc("TC074", "Validation", "Input Validation", "Exposure Time Zero / Negative", "Submit zero or negative exposure time (<=0h) and verify rejection",
       "On predict.php", "1. Enter exposure time = 0.0h\n2. Submit form",
       "Time: 0.0h", "Validation error: 'Exposure time must be greater than 0 hours'",
       "Passed: Non-positive time rejected with descriptive validation warning", "PASS", "High", "P1", "None", "Deployable", "Validation")

add_tc("TC075", "Validation", "Input Validation", "Exposure Time Upper Boundary", "Submit exposure time exceeding maximum study window (>72h)",
       "On predict.php", "1. Enter exposure time = 120.0h\n2. Submit form",
       "Time: 120.0h", "Validation error: 'Exposure time cannot exceed 72.0 hours'",
       "Passed: Time bounded to standard in-vitro cellular viability window", "PASS", "Medium", "P2", "None", "Deployable", "Validation")

add_tc("TC076", "Validation", "Input Validation", "Concentration Non-Positive Guard", "Submit concentration <= 0 ug/mL and verify validation rejection",
       "On predict.php", "1. Enter concentration = -5.0 ug/mL\n2. Submit form",
       "Concentration: -5.0 ug/mL", "Validation error: 'Concentration must be a positive value'",
       "Passed: Negative concentration blocked before model computation", "PASS", "High", "P1", "None", "Deployable", "Validation")

add_tc("TC077", "Validation", "Input Validation", "Invalid Email Format", "Submit improperly formatted email address on registration form",
       "On register.php", "1. Enter email 'invalid_email_format'\n2. Submit form",
       "Email: invalid_email_format", "Validation error: 'Please enter a valid email address'",
       "Passed: HTML5 pattern and filter_var(FILTER_VALIDATE_EMAIL) blocked submission", "PASS", "Medium", "P2", "None", "Deployable", "Validation")

add_tc("TC078", "Validation", "Input Validation", "Password Minimum Length", "Submit short password (<6 characters) on registration form",
       "On register.php", "1. Enter password '123'\n2. Submit form",
       "Password: 123", "Validation error: 'Password must be at least 6 characters'",
       "Passed: Form prevented weak password registration", "PASS", "High", "P1", "None", "Deployable", "Validation")

add_tc("TC079", "Validation", "Input Validation", "Non-Existent Cell Line", "Submit unlisted cellular line string in custom API payload",
       "API predict endpoint", "1. POST to api/predict.php with cell_type='AlienCells_99'\n2. Assert error",
       "Cell: AlienCells_99", "HTTP 400 Bad Request: 'Invalid target cell line'",
       "Passed: API validated cell line against whitelist of thermodynamic models", "PASS", "Medium", "P2", "None", "Deployable", "Validation")

add_tc("TC080", "Validation", "Input Validation", "Non-Existent Core Material", "Submit unlisted core material in custom simulation request",
       "API predict endpoint", "1. POST with core_material='Unobtainium'\n2. Assert response",
       "Material: Unobtainium", "HTTP 400 Bad Request: 'Unsupported core nanomaterial'",
       "Passed: Whitelist validation blocked uncalibrated physical material", "PASS", "Medium", "P2", "None", "Deployable", "Validation")

add_tc("TC081", "Validation", "Input Validation", "Non-Numeric Size String", "Submit alphabetic string in numeric size input field",
       "On predict.php", "1. Enter size = 'fifty_nm'\n2. Submit form",
       "Size: 'fifty_nm'", "Browser numeric constraint blocks input or server casts safely to default",
       "Passed: Server validated is_numeric() and rejected alphabetic string", "PASS", "High", "P1", "None", "Deployable", "Validation")

add_tc("TC082", "Validation", "Security Validation", "SQL Injection in Login Field", "Submit classic SQL injection payload (' OR '1'='1' --) into email field",
       "On login.php", "1. Enter \"' OR '1'='1' --\" in email\n2. Enter dummy password\n3. Submit",
       "Payload: ' OR '1'='1' --", "Login fails gracefully with 'Invalid email or password'; no database crash",
       "Passed: PDO prepared statements parameterized input safely; injection prevented", "PASS", "Critical", "P1", "None", "Deployable", "Validation")

add_tc("TC083", "Validation", "Security Validation", "XSS Tag in Dataset Name", "Submit script tag in dataset title on datasets.php modal",
       "On datasets.php modal", "1. Enter name '<script>console.log('XSS')</script>'\n2. Submit",
       "Payload: <script> tag", "Dataset saved with HTML entities escaped on render; script does not execute",
       "Passed: htmlspecialchars() escaped script tags safely in rendered table", "PASS", "Critical", "P1", "None", "Deployable", "Validation")

add_tc("TC084", "Validation", "Input Validation", "Empty Title on Experiment Modal", "Submit experiment creation modal with empty title field",
       "On experiments.php modal", "1. Open modal\n2. Leave title empty\n3. Click submit",
       "Empty title", "Validation prevents submission; modal remains open; no record created",
       "Passed: Required title attribute blocked empty submission cleanly", "PASS", "High", "P1", "None", "Deployable", "Validation")

add_tc("TC085", "Validation", "Input Validation", "Invalid OTP Format Rejection", "Submit alphabetic string in 6-digit OTP field on verify_otp.php",
       "On verify_otp.php", "1. Enter 'ABCDEF'\n2. Click verify",
       "OTP: 'ABCDEF'", "Validation error: 'OTP must be 6 numeric digits'",
       "Passed: Non-numeric OTP rejected before database lookup", "PASS", "Medium", "P2", "None", "Deployable", "Validation")

# ==========================================
# 5. AUTHENTICATION & USER ISOLATION (TC086 - TC095) - 10 Tests
# ==========================================
add_tc("TC086", "User Isolation", "Data Isolation", "Cross-User Dataset Segregation", "Verify User B cannot see or access datasets created by User A",
       "User A created Selenium_Dataset_A; User B logged in", "1. Log in as User B\n2. Open datasets.php\n3. Inspect table rows",
       "Users: User A & User B", "Selenium_Dataset_A is not present in User B's dataset table",
       "Passed: Complete dataset isolation verified (WHERE user_id = ? enforced)", "PASS", "Critical", "P1", "None", "Deployable", "User Isolation")

add_tc("TC087", "User Isolation", "Data Isolation", "Cross-User History Segregation", "Verify User B cannot see or access simulation history records of User A",
       "User A ran simulation; User B logged in", "1. Log in as User B\n2. Open history.php\n3. Inspect audit rows",
       "History audit log", "User A's simulation records do not appear in User B's history table",
       "Passed: Historical simulation logs strictly scoped to authenticated user_id", "PASS", "Critical", "P1", "None", "Deployable", "User Isolation")

add_tc("TC088", "User Isolation", "Data Isolation", "Cross-User Experiment Segregation", "Verify User B cannot see or access experiment cards created by User A",
       "User A created experiment; User B logged in", "1. Log in as User B\n2. Open experiments.php\n3. Inspect cards",
       "Experiments board", "User A's experiment protocols are not visible to User B",
       "Passed: Experiment cards segregated by user_id filter in database query", "PASS", "Critical", "P1", "None", "Deployable", "User Isolation")

add_tc("TC089", "User Isolation", "Access Control", "Direct URL Foreign Result Access", "Attempt accessing another user's simulation result directly via results.php?id=<foreign_uuid>",
       "User B logged in; User A result UUID known", "1. Navigate to results.php?id=<user_a_result_id>\n2. Verify response",
       "Foreign Result UUID", "System denies access or displays clean empty state without leaking data",
       "Passed: Unauthorized result access blocked by user ownership check in query", "PASS", "Critical", "P1", "None", "Deployable", "User Isolation")

add_tc("TC090", "User Isolation", "Access Control", "Direct API Foreign Dataset Query", "Send API request to api/datasets.php requesting dataset owned by another user",
       "User B session active", "1. GET /api/datasets.php?id=<user_a_dataset_id>\n2. Assert HTTP status",
       "Foreign Dataset UUID", "HTTP 403 Forbidden or 404 Not Found returned; no dataset leaked",
       "Passed: REST API enforced user ownership boundaries on individual records", "PASS", "Critical", "P1", "None", "Deployable", "User Isolation")

add_tc("TC091", "User Isolation", "Access Control", "Direct API Foreign Experiment Deletion", "Attempt deleting another user's experiment via POST ajax/experiment_crud.php",
       "User B session active", "1. POST action=delete and id=<user_a_exp_id>\n2. Assert response",
       "Foreign Exp ID", "Request fails with error: 'Record not found or access denied'",
       "Passed: Deletion query requires user_id match; unauthorized deletion blocked", "PASS", "Critical", "P1", "None", "Deployable", "User Isolation")

add_tc("TC092", "User Isolation", "Dashboard Isolation", "New User Clean Dashboard State", "Verify newly registered user sees 0 datasets, 0 simulations on Dashboard",
       "Newly registered user account", "1. Log in with new account\n2. Inspect dashboard stat cards",
       "Fresh account session", "Simulations Run = 0, Active Datasets = 0, Mean Uptake = '—'",
       "Passed: No default/foreign statistics shown; clean zero-state displayed", "PASS", "High", "P1", "None", "Deployable", "User Isolation")

add_tc("TC093", "User Isolation", "History Isolation", "New User Clean History State", "Verify newly registered user sees empty history state without previous user runs",
       "Newly registered user account", "1. Log in with new account\n2. Open history.php",
       "Fresh account session", "'No simulation history found' empty state card displayed",
       "Passed: Zero historical records displayed for fresh user account", "PASS", "High", "P1", "None", "Deployable", "User Isolation")

add_tc("TC094", "Authentication", "Access Control", "Unauthenticated Dashboard Access Guard", "Attempt navigating to dashboard.php without an active session",
       "Browser in private/incognito mode without session", "1. Clear cookies\n2. Navigate to /dashboard.php",
       "URL: /dashboard.php", "Redirected immediately to /login.php with return redirect parameter",
       "Passed: require_login() blocked unauthenticated page access and redirected", "PASS", "Critical", "P1", "None", "Deployable", "Authentication")

add_tc("TC095", "Authentication", "Access Control", "Unauthenticated Simulation Engine Guard", "Attempt navigating to predict.php without an active session",
       "No active session", "1. Navigate directly to /predict.php\n2. Verify redirect",
       "URL: /predict.php", "Redirected to /login.php; simulation engine inaccessible",
       "Passed: Unauthenticated access blocked; protected biophysical engine secured", "PASS", "Critical", "P1", "None", "Deployable", "Authentication")

# ==========================================
# 6. DATABASE TESTING (TC096 - TC105) - 10 Tests
# ==========================================
add_tc("TC096", "Database", "Schema & Integrity", "User Insertion & UUID Generation", "Verify inserting a new user record generates valid UUIDv4 primary key in public.users",
       "Database connection active", "1. Insert user with name, email, password_hash\n2. Retrieve generated id",
       "User record", "Record created with non-null UUID matching regex ^[0-9a-f-]{36}$",
       "Passed: PostgreSQL gen_random_uuid() generated RFC 4122 compliant UUID", "PASS", "Critical", "P1", "None", "Deployable", "Database")

add_tc("TC097", "Database", "Schema & Integrity", "Email Unique Constraint", "Verify database rejects duplicate email insertion at SQL constraint level",
       "Database connection active", "1. Execute INSERT into users with existing email\n2. Catch PDOException",
       "Duplicate email SQL", "PDOException thrown with SQLSTATE 23505 (unique_violation)",
       "Passed: Database enforced UNIQUE (email) integrity constraint strictly", "PASS", "High", "P1", "None", "Deployable", "Database")

add_tc("TC098", "Database", "Schema & Integrity", "Dataset Foreign Key Validation", "Verify nanoparticle_datasets table enforces foreign key reference to public.users(id)",
       "Database connection active", "1. Attempt INSERT into nanoparticle_datasets with non-existent user_id\n2. Catch exception",
       "Foreign user_id: random UUID", "PDOException thrown with SQLSTATE 23503 (foreign_key_violation)",
       "Passed: Foreign key constraint enforced; orphaned datasets prevented", "PASS", "High", "P1", "None", "Deployable", "Database")

add_tc("TC099", "Database", "Schema & Integrity", "Cascade Delete on User Removal", "Verify deleting a user cascades and deletes all associated datasets, runs, and experiments",
       "Test user with datasets & runs", "1. DELETE FROM users WHERE id = test_user_id\n2. Query child tables",
       "Cascade delete test", "Child records in datasets, analysis_results, experiments cascade deleted",
       "Passed: ON DELETE CASCADE cleaned up all child records without orphan retention", "PASS", "High", "P1", "None", "Deployable", "Database")

add_tc("TC100", "Database", "Schema & Integrity", "JSONB Results Storage", "Verify public.analysis_results stores comprehensive kinetic results in JSONB column",
       "Simulation completed", "1. Query prediction_result column from analysis_results\n2. Validate JSON structure",
       "JSONB column", "Valid JSON object retrieved containing time_series, uptake_curve, metrics",
       "Passed: JSONB data retrieved and parsed into structured associative array", "PASS", "High", "P1", "None", "Deployable", "Database")

add_tc("TC101", "Database", "Schema & Integrity", "History FK to Analysis Results", "Verify public.history table result_id references public.analysis_results(id) ON DELETE SET NULL",
       "History record linked to result", "1. DELETE record from analysis_results\n2. Check history row result_id",
       "Foreign result ID", "History record preserved with result_id set to NULL gracefully",
       "Passed: ON DELETE SET NULL preserved audit trail when raw run was pruned", "PASS", "Medium", "P2", "None", "Deployable", "Database")

add_tc("TC102", "Database", "Schema & Integrity", "OTP Expiration Timestamp Query", "Verify query selecting valid OTP filters WHERE used=FALSE AND expires_at > NOW()",
       "OTP record active", "1. Insert expired OTP\n2. Query for active OTP with expires_at > NOW()",
       "Expired OTP code", "Expired OTP excluded from query results; not matched",
       "Passed: Temporal expiration logic verified against Supabase current_timestamp", "PASS", "High", "P1", "None", "Deployable", "Database")

add_tc("TC103", "Database", "Schema & Integrity", "Chatbot Logs Persistence", "Verify chatbot inquiry and response inserted into public.chatbot_logs with session_id",
       "Chat message sent", "1. Query chatbot_logs where session_id = test_session\n2. Verify fields",
       "Chatbot log entry", "Row exists with user_message, bot_response, and intent metadata",
       "Passed: Conversation logging verified in database table", "PASS", "Low", "P3", "None", "Deployable", "Database")

add_tc("TC104", "Database", "Transactions", "Simulation Batch Transaction Integrity", "Verify simulation persistence, history insertion, and notification run in transaction",
       "Simulation run", "1. Begin PDO transaction\n2. Insert run, history, notification\n3. Commit",
       "PDO transaction", "All 3 records committed simultaneously; rollback on failure verified",
       "Passed: Multi-table simulation batch executed with atomic consistency", "PASS", "High", "P1", "None", "Deployable", "Database")

add_tc("TC105", "Database", "Timezone & Locality", "Database IST Timezone Synchronization", "Verify database connection synchronizes timezone to 'Asia/Kolkata' upon initialization",
       "Active connection", "1. Execute 'SHOW timezone' or 'SELECT NOW()'\n2. Assert UTC+05:30 offset",
       "Session timezone query", "Connection timezone set to 'Asia/Kolkata'",
       "Passed: @$conn->exec(\"SET timezone TO 'Asia/Kolkata'\") verified on connection", "PASS", "Medium", "P2", "None", "Deployable", "Database")

print(f"Total test cases now: {len(TEST_CASES)}.")
