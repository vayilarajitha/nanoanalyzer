<?php
require_once __DIR__ . '/../config/db.php';

header('Content-Type: application/json');

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$user_id = get_current_user_id();
if (empty($user_id)) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized: Authentication required.']);
    exit;
}

try {
    if (!($pdo instanceof PDO)) {
        throw new Exception("Supabase PostgreSQL DB connection unavailable.");
    }

    if ($action === 'create') {
        $title = trim($_POST['title'] ?? '');
        $description = trim($_POST['description'] ?? '');
        $np_type = trim($_POST['nanoparticle_type'] ?? '');
        $material = trim($_POST['core_material'] ?? '');
        $size = isset($_POST['particle_size_nm']) && $_POST['particle_size_nm'] !== '' ? floatval($_POST['particle_size_nm']) : null;
        $cell = trim($_POST['target_cell_line'] ?? '');
        $status = trim($_POST['status'] ?? 'In Progress');

        if (empty($title) || empty($material) || empty($np_type) || $size === null || empty($cell)) {
            echo json_encode(['status' => 'error', 'message' => 'Please fill in all required experiment fields (Title, Material, Category, Size, Target Cell Line).']);
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
        $stmt = $pdo->prepare("DELETE FROM experiments WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $user_id]);

        echo json_encode(['status' => 'success', 'message' => 'Experiment deleted successfully.']);
        exit;
    }

    if ($action === 'update_status') {
        $id = trim($_POST['id'] ?? '');
        $status = trim($_POST['status'] ?? 'Completed');
        $stmt = $pdo->prepare("UPDATE experiments SET status = ? WHERE id = ? AND user_id = ?");
        $stmt->execute([$status, $id, $user_id]);

        echo json_encode(['status' => 'success', 'message' => 'Experiment status updated to ' . $status]);
        exit;
    }

    echo json_encode(['status' => 'error', 'message' => 'Invalid action.']);

} catch (Throwable $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
