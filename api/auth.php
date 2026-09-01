<?php
// NanoUptake Analyzer - REST API: Authentication Endpoint
// Mobile & Web application integration for login, registration, logout & session

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/db.php';

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$action = $input['action'] ?? $_GET['action'] ?? '';

switch ($action) {
    case 'register':
        $name = trim($input['name'] ?? '');
        $raw_email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';

        if (empty($name) || empty($raw_email) || empty($password)) {
            echo json_encode(['status' => 'error', 'message' => 'Please provide name, email, and password.']);
            exit;
        }

        if (preg_match('/[A-Z]/', $raw_email)) {
            echo json_encode(['status' => 'error', 'message' => 'Email address must be in lowercase.']);
            exit;
        }

        $email = $raw_email;

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['status' => 'error', 'message' => 'Invalid email address format.']);
            exit;
        }

        try {
            if (!($pdo instanceof PDO)) {
                $db_err = get_db_error();
                throw new Exception("Unable to establish connection to Supabase PostgreSQL database. " . ($db_err ? "Details: {$db_err}" : "Please check Render environment variables."));
            }
            // Check existing user
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email ILIKE ?");
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                echo json_encode(['status' => 'error', 'message' => 'An account with this email already exists.']);
                exit;
            }

            $password_hash = password_hash($password, PASSWORD_BCRYPT);
            
            $uuid = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                mt_rand(0, 0xffff), mt_rand(0, 0xffff),
                mt_rand(0, 0xffff),
                mt_rand(0, 0x0fff) | 0x4000,
                mt_rand(0, 0x3fff) | 0x8000,
                mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
            );

            $stmt = $pdo->prepare("INSERT INTO users (id, name, full_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$uuid, $name, $name, $email, $password_hash, 'researcher']);

            $_SESSION['user_id'] = $uuid;
            $_SESSION['user_name'] = $name;
            $_SESSION['full_name'] = $name;
            $_SESSION['email'] = $email;
            $_SESSION['role'] = 'researcher';

            echo json_encode([
                'status' => 'success',
                'message' => 'Registration successful.',
                'user' => [
                    'id' => $uuid,
                    'name' => $name,
                    'email' => $email,
                    'role' => 'researcher'
                ]
            ]);
        } catch (Throwable $e) {
            echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    case 'login':
        $email = trim(strtolower($input['email'] ?? ''));
        $password = $input['password'] ?? '';

        if (empty($email) || empty($password)) {
            echo json_encode(['status' => 'error', 'message' => 'Email and password are required.']);
            exit;
        }

        try {
            if (!($pdo instanceof PDO)) {
                $db_err = get_db_error();
                throw new Exception("Unable to establish connection to Supabase PostgreSQL database. " . ($db_err ? "Details: {$db_err}" : "Please check Render environment variables."));
            }
            $stmt = $pdo->prepare("SELECT * FROM users WHERE email ILIKE ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if ($user && password_verify($password, $user['password_hash'])) {
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['user_name'] = $user['name'] ?? $user['full_name'] ?? 'Researcher';
                $_SESSION['full_name'] = $user['full_name'] ?? $user['name'] ?? 'Researcher';
                $_SESSION['email'] = $user['email'];
                $_SESSION['role'] = $user['role'] ?? 'researcher';

                echo json_encode([
                    'status' => 'success',
                    'message' => 'Login successful.',
                    'user' => [
                        'id' => $user['id'],
                        'name' => $user['name'] ?? $user['full_name'] ?? 'Researcher',
                        'email' => $user['email'],
                        'role' => $user['role'] ?? 'researcher',
                        'profile_image' => $user['profile_image'] ?? $user['avatar_url'] ?? ''
                    ]
                ]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Invalid email or password.']);
            }
        } catch (Throwable $e) {
            echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    case 'logout':
        session_unset();
        session_destroy();
        echo json_encode(['status' => 'success', 'message' => 'Logged out successfully.']);
        break;

    case 'session':
    case 'me':
        if (is_logged_in()) {
            $user_id = get_current_user_id();
            try {
                if (!($pdo instanceof PDO)) {
                    throw new Exception("Database connection unavailable.");
                }
                $stmt = $pdo->prepare("SELECT id, name, full_name, email, role, profile_image, created_at FROM users WHERE id = ?");
                $stmt->execute([$user_id]);
                $user = $stmt->fetch();
                echo json_encode(['status' => 'success', 'authenticated' => true, 'user' => $user]);
            } catch (Throwable $e) {
                echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
            }
        } else {
            echo json_encode(['status' => 'success', 'authenticated' => false]);
        }
        break;

    case 'forgot_password':
    case 'reset_password':
        $email = trim(strtolower($input['email'] ?? ''));
        if (empty($email)) {
            echo json_encode(['status' => 'error', 'message' => 'Email address is required.']);
            exit;
        }

        try {
            if (!($pdo instanceof PDO)) {
                throw new Exception("Database connection unavailable.");
            }
            $stmt = $pdo->prepare("SELECT id, email FROM users WHERE email ILIKE ? LIMIT 1");
            $stmt->execute([$email]);
            $user = $stmt->fetch();
            if ($user) {
                $otp = sprintf('%06d', mt_rand(100000, 999999));
                $expires = date('Y-m-d H:i:s', strtotime('+15 minutes'));

                $stmt_otp = $pdo->prepare("INSERT INTO otp_codes (user_id, email, code, otp_code, expires_at, used) VALUES (?, ?, ?, ?, ?, false)");
                $stmt_otp->execute([$user['id'], $user['email'], strval($otp), strval($otp), $expires]);

                echo json_encode([
                    'status' => 'success',
                    'message' => 'Verification code generated successfully.',
                    'otp_code' => $otp,
                    'email' => $user['email']
                ]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'No registered account found with that email address.']);
            }
        } catch (Throwable $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    case 'verify_otp':
        $email = trim(strtolower($input['email'] ?? ''));
        $otp_code = trim($input['otp_code'] ?? $input['code'] ?? '');

        if (empty($email) || empty($otp_code)) {
            echo json_encode(['status' => 'error', 'message' => 'Email and OTP code are required.']);
            exit;
        }

        try {
            if (!($pdo instanceof PDO)) throw new Exception("Database connection unavailable.");

            $stmt = $pdo->prepare("SELECT id FROM otp_codes WHERE email ILIKE ? AND (code = ? OR otp_code = ?) AND (used = false OR used IS NULL) AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1");
            $stmt->execute([$email, $otp_code, $otp_code]);
            $row = $stmt->fetch();

            if ($row) {
                echo json_encode(['status' => 'success', 'message' => 'Verification code verified successfully.']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Invalid or expired verification code.']);
            }
        } catch (Throwable $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    case 'confirm_reset_password':
    case 'update_password':
        $email = trim(strtolower($input['email'] ?? ''));
        $otp_code = trim($input['otp_code'] ?? $input['code'] ?? '');
        $new_password = $input['new_password'] ?? $input['password'] ?? '';

        if (empty($email) || empty($otp_code) || empty($new_password)) {
            echo json_encode(['status' => 'error', 'message' => 'Email, OTP code, and new password are required.']);
            exit;
        }

        if (strlen($new_password) < 6) {
            echo json_encode(['status' => 'error', 'message' => 'Password must be at least 6 characters.']);
            exit;
        }

        try {
            if (!($pdo instanceof PDO)) throw new Exception("Database connection unavailable.");

            $stmt = $pdo->prepare("SELECT id FROM otp_codes WHERE email ILIKE ? AND (code = ? OR otp_code = ?) AND (used = false OR used IS NULL) AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1");
            $stmt->execute([$email, $otp_code, $otp_code]);
            $row = $stmt->fetch();

            if ($row) {
                $new_hash = password_hash($new_password, PASSWORD_BCRYPT);
                $update_user = $pdo->prepare("UPDATE users SET password_hash = ? WHERE email ILIKE ?");
                $update_user->execute([$new_hash, $email]);

                $update_otp = $pdo->prepare("UPDATE otp_codes SET used = true WHERE email ILIKE ? AND (code = ? OR otp_code = ?)");
                $update_otp->execute([$email, $otp_code, $otp_code]);

                echo json_encode(['status' => 'success', 'message' => 'Password updated successfully. You can now log in.']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Invalid or expired verification code.']);
            }
        } catch (Throwable $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    default:
        echo json_encode(['status' => 'error', 'message' => 'Invalid auth action specified.']);
        break;
}
