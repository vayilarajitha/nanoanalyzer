<?php
// NanoUptake Analyzer - REST API: User History Endpoint
// Mobile & Web application integration for activity log history

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/db.php';

$user_id = get_current_user_id();

try {
    if (!($pdo instanceof PDO)) {
        throw new Exception("Database connection unavailable.");
    }
    $stmt = $pdo->prepare("SELECT * FROM history WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$user_id]);
    $history = $stmt->fetchAll() ?: [];
    foreach ($history as &$h) {
        $h['created_at_formatted'] = format_app_datetime($h['created_at']);
        $h['timezone'] = 'Asia/Kolkata';
    }
    unset($h);
    echo json_encode(['status' => 'success', 'history' => $history]);
} catch (Throwable $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
