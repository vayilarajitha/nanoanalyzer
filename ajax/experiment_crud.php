<?php
require_once __DIR__ . '/../config/db.php';

header('Content-Type: application/json');

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$user_id = get_current_user_id();

try {
    if (!$pdo) {
        throw new Exception("Supabase PostgreSQL DB connection unavailable.");
    }

    if ($action === 'create') {
        $title = trim($_POST['title'] ?? '');
        $description = trim($_POST['description'] ?? '');
        $np_type = trim($_POST['nanoparticle_type'] ?? 'Polymeric');
        $material = trim($_POST['core_material'] ?? 'Gold (Au)');
        $size = floatval($_POST['particle_size_nm'] ?? 45.0);
        $cell = trim($_POST['target_cell_line'] ?? 'HeLa');
        $status = trim($_POST['status'] ?? 'In Progress');

        if (empty($title) || empty($material)) {
            echo json_encode(['status' => 'error', 'message' => 'Experiment title and core material are required.']);
            exit;
        }

        $uuid = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );

        $stmt = $pdo->prepare("INSERT INTO experiments (id, user_id, title, description, nanoparticle_type, core_material, particle_size_nm, target_cell_line, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$uuid, $user_id, $title, $description, $np_type, $material, $size, $cell, $status]);

        echo json_encode(['status' => 'success', 'message' => 'Experiment protocol created in Supabase database.']);
        exit;
    }

    if ($action === 'delete') {
        $id = trim($_POST['id'] ?? '');
        $stmt = $pdo->prepare("DELETE FROM experiments WHERE id = ?");
        $stmt->execute([$id]);

        echo json_encode(['status' => 'success', 'message' => 'Experiment deleted successfully.']);
        exit;
    }

    if ($action === 'update_status') {
        $id = trim($_POST['id'] ?? '');
        $status = trim($_POST['status'] ?? 'Completed');
        $stmt = $pdo->prepare("UPDATE experiments SET status = ? WHERE id = ?");
        $stmt->execute([$status, $id]);

        echo json_encode(['status' => 'success', 'message' => 'Experiment status updated to ' . $status]);
        exit;
    }

    echo json_encode(['status' => 'error', 'message' => 'Invalid action.']);

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
