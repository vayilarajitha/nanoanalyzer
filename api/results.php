<?php
// NanoUptake Analyzer - REST API: Analysis Results Endpoint
// Mobile & Web application integration for retrieving simulation results

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
$result_id = $_GET['id'] ?? null;

try {
    if (!($pdo instanceof PDO)) {
        throw new Exception("Database connection unavailable.");
    }

    if ($result_id) {
        $stmt = $pdo->prepare("SELECT * FROM analysis_results WHERE id = ? AND user_id = ?");
        $stmt->execute([$result_id, $user_id]);
        $result = $stmt->fetch();

        if ($result) {
            echo json_encode(['status' => 'success', 'data' => $result]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Result record not found.']);
        }
    } else {
        $stmt = $pdo->prepare("SELECT * FROM analysis_results WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$user_id]);
        $results = $stmt->fetchAll() ?: [];
        echo json_encode(['status' => 'success', 'results' => $results]);
    }
} catch (Throwable $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
