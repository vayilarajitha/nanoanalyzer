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
    $stmt = $pdo->prepare("SELECT * FROM history WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$user_id]);
    $history = $stmt->fetchAll();
    echo json_encode(['status' => 'success', 'history' => $history]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
