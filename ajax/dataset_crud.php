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
        throw new Exception("Supabase PostgreSQL database connection unavailable.");
    }

    if ($action === 'create') {
        $name = trim($_POST['name'] ?? $_POST['dataset_name'] ?? '');
        $np_type = trim($_POST['nanoparticle_type'] ?? $_POST['shape'] ?? '');
        $material = trim($_POST['core_material'] ?? $_POST['material'] ?? '');
        $charge = isset($_POST['surface_charge_mv']) && $_POST['surface_charge_mv'] !== '' ? floatval($_POST['surface_charge_mv']) : (isset($_POST['charge']) && $_POST['charge'] !== '' ? floatval($_POST['charge']) : null);
        $size = isset($_POST['size_nm']) && $_POST['size_nm'] !== '' ? floatval($_POST['size_nm']) : (isset($_POST['nanoparticle_size']) && $_POST['nanoparticle_size'] !== '' ? floatval($_POST['nanoparticle_size']) : null);
        $concentration = isset($_POST['concentration']) && $_POST['concentration'] !== '' ? floatval($_POST['concentration']) : null;
        $cell_type = trim($_POST['cell_type'] ?? '');
        $uptake_eff = isset($_POST['uptake_efficiency_percent']) && $_POST['uptake_efficiency_percent'] !== '' ? floatval($_POST['uptake_efficiency_percent']) : null;
        $toxicity = isset($_POST['toxicity_score']) && $_POST['toxicity_score'] !== '' ? floatval($_POST['toxicity_score']) : null;
        $notes = trim($_POST['notes'] ?? '');

        if (empty($name) || empty($material) || empty($np_type) || $size === null || empty($cell_type)) {
            echo json_encode(['status' => 'error', 'message' => 'Please provide all required dataset fields (Name, Material, Type, Size, Cell Line).']);
            exit;
        }

        $uuid = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );

        $stmt = $pdo->prepare("INSERT INTO nanoparticle_datasets 
            (id, user_id, dataset_name, name, shape, nanoparticle_type, material, core_material, charge, surface_charge_mv, nanoparticle_size, size_nm, concentration, cell_type, uptake_efficiency_percent, toxicity_score, notes) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $uuid, $user_id, $name, $name, $np_type, $np_type, $material, $material, $charge, $charge, $size, $size, $concentration, $cell_type, $uptake_eff, $toxicity, $notes
        ]);

        // Log history
        $hist = $pdo->prepare("INSERT INTO history (user_id, activity) VALUES (?, ?)");
        $hist->execute([$user_id, "Created dataset: {$name}"]);

        echo json_encode(['status' => 'success', 'message' => 'Dataset entry added successfully to Supabase database.']);
        exit;
    }

    if ($action === 'update') {
        $id = trim($_POST['id'] ?? '');
        $name = trim($_POST['name'] ?? $_POST['dataset_name'] ?? '');
        $material = trim($_POST['core_material'] ?? $_POST['material'] ?? '');
        $charge = floatval($_POST['surface_charge_mv'] ?? $_POST['charge'] ?? 0);
        $size = floatval($_POST['size_nm'] ?? $_POST['nanoparticle_size'] ?? 0);

        $stmt = $pdo->prepare("UPDATE nanoparticle_datasets SET dataset_name=?, name=?, material=?, core_material=?, charge=?, surface_charge_mv=?, nanoparticle_size=?, size_nm=? WHERE id=? AND user_id=?");
        $stmt->execute([$name, $name, $material, $material, $charge, $charge, $size, $size, $id, $user_id]);

        echo json_encode(['status' => 'success', 'message' => 'Dataset entry updated successfully.']);
        exit;
    }

    if ($action === 'delete') {
        $id = trim($_POST['id'] ?? '');
        $stmt = $pdo->prepare("DELETE FROM nanoparticle_datasets WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $user_id]);

        echo json_encode(['status' => 'success', 'message' => 'Dataset entry deleted.']);
        exit;
    }

    echo json_encode(['status' => 'error', 'message' => 'Invalid action.']);

} catch (Throwable $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
