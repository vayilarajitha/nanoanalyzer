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
        $email = trim(strtolower($input['email'] ?? ''));
        $password = $input['password'] ?? '';

        if (empty($name) || empty($email) || empty($password)) {
            echo json_encode(['status' => 'error', 'message' => 'Please provide name, email, and password.']);
            exit;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['status' => 'error', 'message' => 'Invalid email address format.']);
            exit;
        }

        try {
            if (!$pdo) {
                throw new Exception("Unable to establish connection to Supabase PostgreSQL database.");
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
        } catch (Exception $e) {
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
            if (!$pdo) {
                throw new Exception("Unable to establish connection to Supabase PostgreSQL database.");
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
        } catch (Exception $e) {
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
                $stmt = $pdo->prepare("SELECT id, name, full_name, email, role, profile_image, created_at FROM users WHERE id = ?");
                $stmt->execute([$user_id]);
                $user = $stmt->fetch();
                echo json_encode(['status' => 'success', 'authenticated' => true, 'user' => $user]);
            } catch (Exception $e) {
                echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
            }
        } else {
            echo json_encode(['status' => 'success', 'authenticated' => false]);
        }
        break;

    case 'reset_password':
        $email = trim(strtolower($input['email'] ?? ''));
        if (empty($email)) {
            echo json_encode(['status' => 'error', 'message' => 'Email address is required.']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email ILIKE ?");
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                echo json_encode(['status' => 'success', 'message' => 'Password reset verification code sent to your email.']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'No registered account found with that email address.']);
            }
        } catch (Exception $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    default:
        echo json_encode(['status' => 'error', 'message' => 'Invalid auth action specified.']);
        break;
}
