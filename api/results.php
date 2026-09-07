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
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'DELETE') {
    if (empty($user_id)) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized: Authentication required.']);
        exit;
    }
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Result ID required for deletion.']);
        exit;
    }
    try {
        if (!($pdo instanceof PDO)) throw new Exception("Database connection unavailable.");
        $stmt = $pdo->prepare("DELETE FROM analysis_results WHERE (id = ? OR deterministic_hash = ?) AND user_id = ?");
        $stmt->execute([$id, $id, $user_id]);
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Result not found or access denied.']);
        } else {
            // Also clean from history table
            $h_stmt = $pdo->prepare("DELETE FROM history WHERE result_id = ? AND user_id = ?");
            $h_stmt->execute([$id, $user_id]);
            echo json_encode(['status' => 'success', 'message' => 'Analysis result deleted successfully.']);
        }
    } catch (Throwable $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

$result_id = $_GET['id'] ?? null;

if (empty($user_id)) {
    if ($result_id) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Result record not found or access denied.']);
        exit;
    }
    http_response_code(200);
    echo json_encode(['status' => 'success', 'results' => [], 'authenticated' => false]);
    exit;
}

try {
    if (!($pdo instanceof PDO)) {
        throw new Exception("Database connection unavailable.");
    }

    if ($result_id) {
        $stmt = $pdo->prepare("SELECT * FROM analysis_results WHERE id = ? AND user_id = ?");
        $stmt->execute([$result_id, $user_id]);
        $result = $stmt->fetch();

        if ($result) {
            $result['created_at_formatted'] = format_app_datetime($result['created_at']);
            $result['timezone'] = 'Asia/Kolkata';
            echo json_encode(['status' => 'success', 'data' => $result]);
        } else {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Result record not found or access denied.']);
        }
    } else {
        $stmt = $pdo->prepare("SELECT * FROM analysis_results WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$user_id]);
        $results = $stmt->fetchAll() ?: [];
        foreach ($results as &$res) {
            $res['created_at_formatted'] = format_app_datetime($res['created_at']);
            $res['timezone'] = 'Asia/Kolkata';
        }
        unset($res);
        echo json_encode(['status' => 'success', 'results' => $results]);
    }
} catch (Throwable $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
