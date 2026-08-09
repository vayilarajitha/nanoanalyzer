<?php
require_once __DIR__ . '/../config/db.php';

header('Content-Type: application/json');

$action = $_GET['action'] ?? $_POST['action'] ?? 'fetch';

if ($action === 'delete') {
    $id = trim($_POST['id'] ?? '');
    try {
        $stmt = $pdo->prepare("DELETE FROM analysis_results WHERE id = ? OR deterministic_hash = ?");
        $stmt->execute([$id, $id]);
        echo json_encode(['status' => 'success', 'message' => 'Analysis record removed from history.']);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

try {
    $user_id = get_current_user_id();
    $stmt = $pdo->prepare("SELECT * FROM predictions WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$user_id]);
    $history = $stmt->fetchAll();

    echo json_encode(['status' => 'success', 'data' => $history]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
