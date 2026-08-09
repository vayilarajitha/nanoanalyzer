<?php
require_once __DIR__ . '/../config/db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
    exit;
}

$user_id = get_current_user_id();
$full_name = trim($_POST['full_name'] ?? $_POST['name'] ?? '');
$institution = trim($_POST['institution'] ?? '');
$bio = trim($_POST['bio'] ?? '');

try {
    if (!$pdo) {
        throw new Exception("Supabase PostgreSQL DB connection unavailable.");
    }

    $stmt = $pdo->prepare("UPDATE users SET name = ?, full_name = ?, institution = ?, bio = ? WHERE id = ?");
    $stmt->execute([$full_name, $full_name, $institution, $bio, $user_id]);

    $_SESSION['full_name'] = $full_name;

    echo json_encode(['status' => 'success', 'message' => 'Profile details saved to Supabase.']);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
