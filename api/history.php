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
if (empty($user_id)) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized: Authentication required.']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'DELETE' || ($method === 'POST' && ($_POST['action'] ?? '') === 'delete')) {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $id = trim($input['id'] ?? $_GET['id'] ?? '');

    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Record ID required for deletion.']);
        exit;
    }

    try {
        if (!($pdo instanceof PDO)) throw new Exception("Database connection unavailable.");
        $stmt = $pdo->prepare("DELETE FROM analysis_results WHERE (id = ? OR deterministic_hash = ?) AND user_id = ?");
        $stmt->execute([$id, $id, $user_id]);
        $deleted1 = $stmt->rowCount();

        $stmt2 = $pdo->prepare("DELETE FROM history WHERE (result_id = ? OR id::text = ?) AND user_id = ?");
        $stmt2->execute([$id, $id, $user_id]);
        $deleted2 = $stmt2->rowCount();

        if ($deleted1 === 0 && $deleted2 === 0) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'History record not found or access denied.']);
        } else {
            echo json_encode(['status' => 'success', 'message' => 'History record removed successfully.']);
        }
    } catch (Throwable $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

try {
    if (!($pdo instanceof PDO)) {
        throw new Exception("Database connection unavailable.");
    }
    $stmt = $pdo->prepare("SELECT * FROM analysis_results WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$user_id]);
    $results = $stmt->fetchAll() ?: [];
    foreach ($results as &$h) {
        $h['created_at_formatted'] = format_app_datetime($h['created_at']);
        $h['timezone'] = 'Asia/Kolkata';
    }
    unset($h);

    $stmt_act = $pdo->prepare("SELECT * FROM history WHERE user_id = ? ORDER BY created_at DESC");
    $stmt_act->execute([$user_id]);
    $activities = $stmt_act->fetchAll() ?: [];
    foreach ($activities as &$act) {
        $act['created_at_formatted'] = format_app_datetime($act['created_at']);
        $act['timezone'] = 'Asia/Kolkata';
    }
    unset($act);

    echo json_encode([
        'status' => 'success',
        'history' => $results,
        'results' => $results,
        'activities' => $activities
    ]);
} catch (Throwable $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
