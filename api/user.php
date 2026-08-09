<?php
// NanoUptake Analyzer - REST API: User Profile Endpoint
// Mobile & Web application integration for user profile and avatar upload

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/db.php';

$user_id = get_current_user_id();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        if (!$pdo) throw new Exception("Supabase DB connection not configured.");
        $stmt = $pdo->prepare("SELECT id, name, full_name, email, role, profile_image, avatar_url, institution, bio, created_at FROM users WHERE id = ?");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch();
        echo json_encode(['status' => 'success', 'user' => $user]);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

if ($method === 'POST') {
    $name = trim($_POST['name'] ?? $_POST['full_name'] ?? '');
    $institution = trim($_POST['institution'] ?? '');
    $bio = trim($_POST['bio'] ?? '');
    $profile_image_url = null;

    if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['avatar'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $filename = 'avatar_' . time() . '_' . mt_rand(1000, 9999) . '.' . $ext;
        $file_content = file_get_contents($file['tmp_name']);

        if (supabase()->isConfigured()) {
            $storageResult = supabase()->uploadFile('avatars', $filename, $file['type'], $file_content);
            $profile_image_url = $storageResult['public_url'] ?? $filename;
        } else {
            $upload_dir = __DIR__ . '/../uploads/avatars/';
            if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);
            move_uploaded_file($file['tmp_name'], $upload_dir . $filename);
            $profile_image_url = 'uploads/avatars/' . $filename;
        }
    }

    try {
        if (!$pdo) throw new Exception("Supabase DB connection not configured.");
        if ($profile_image_url) {
            $stmt = $pdo->prepare("UPDATE users SET name = ?, full_name = ?, institution = ?, bio = ?, profile_image = ?, avatar_url = ? WHERE id = ?");
            $stmt->execute([$name, $name, $institution, $bio, $profile_image_url, $profile_image_url, $user_id]);
        } else {
            $stmt = $pdo->prepare("UPDATE users SET name = ?, full_name = ?, institution = ?, bio = ? WHERE id = ?");
            $stmt->execute([$name, $name, $institution, $bio, $user_id]);
        }

        $_SESSION['full_name'] = $name;

        echo json_encode([
            'status' => 'success',
            'message' => 'Profile updated successfully.',
            'profile_image' => $profile_image_url
        ]);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}
