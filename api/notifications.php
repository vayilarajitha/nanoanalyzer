<?php
// NanoUptake Analyzer - REST API: Notifications Endpoint
// Mobile & Web application integration for system notification feed

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-User-ID');

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
    $stmt = $pdo->prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$user_id]);
    $notifications = $stmt->fetchAll() ?: [];
    foreach ($notifications as &$note) {
        $note['created_at_formatted'] = format_app_datetime($note['created_at']);
    }
    unset($note);

    echo json_encode([
        'status' => 'success',
        'notifications' => $notifications
    ]);

} catch (Throwable $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'notifications' => []
    ]);
}
