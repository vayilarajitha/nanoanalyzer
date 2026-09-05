<?php
// NanoUptake Analyzer - REST API: Laboratory Experiments Endpoint
// Handles listing, creating, and deleting experiments strictly for the authenticated user

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-User-ID');

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

if ($method === 'GET') {
    try {
        if (!($pdo instanceof PDO)) throw new Exception("Database connection unavailable.");
        $stmt = $pdo->prepare("SELECT * FROM experiments WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$user_id]);
        $experiments = $stmt->fetchAll() ?: [];
        foreach ($experiments as &$exp) {
            $exp['created_at_formatted'] = format_app_datetime($exp['created_at']);
        }
        unset($exp);
        echo json_encode(['status' => 'success', 'experiments' => $experiments]);
    } catch (Throwable $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $title = trim($input['title'] ?? '');
    $description = trim($input['description'] ?? '');
    $np_type = trim($input['nanoparticle_type'] ?? 'Polymeric');
    $material = trim($input['core_material'] ?? 'Gold (Au)');
    $size = floatval($input['particle_size_nm'] ?? 45.0);
    $cell = trim($input['target_cell_line'] ?? 'HeLa');
    $status = trim($input['status'] ?? 'In Progress');

    if (empty($title) || empty($material)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Experiment title and core material are required.']);
        exit;
    }

    try {
        if (!($pdo instanceof PDO)) throw new Exception("Database connection unavailable.");
        $uuid = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );

        $stmt = $pdo->prepare("INSERT INTO experiments (id, user_id, title, description, nanoparticle_type, core_material, particle_size_nm, target_cell_line, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$uuid, $user_id, $title, $description, $np_type, $material, $size, $cell, $status]);

        echo json_encode(['status' => 'success', 'message' => 'Experiment created successfully.', 'id' => $uuid]);
    } catch (Throwable $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

if ($method === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_GET;
    $id = trim($input['id'] ?? '');

    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Experiment ID required for deletion.']);
        exit;
    }

    try {
        if (!($pdo instanceof PDO)) throw new Exception("Database connection unavailable.");
        $stmt = $pdo->prepare("DELETE FROM experiments WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $user_id]);
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Experiment not found or access denied.']);
        } else {
            echo json_encode(['status' => 'success', 'message' => 'Experiment deleted successfully.']);
        }
    } catch (Throwable $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}
