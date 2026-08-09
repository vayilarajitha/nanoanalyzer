<?php
// NanoUptake Analyzer - REST API: Datasets Endpoint
// Handles listing, uploading (CSV files), and deleting nanoparticle datasets in Supabase

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/db.php';

$user_id = get_current_user_id();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // List datasets
    try {
        if (!$pdo) throw new Exception("Supabase PostgreSQL DB connection unavailable.");
        $stmt = $pdo->prepare("SELECT * FROM nanoparticle_datasets WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$user_id]);
        $datasets = $stmt->fetchAll();
        echo json_encode(['status' => 'success', 'datasets' => $datasets]);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

if ($method === 'POST') {
    // Upload Dataset CSV & Metadata
    $dataset_name = trim($_POST['dataset_name'] ?? $_POST['name'] ?? 'Nanoparticle Experiment Set');
    $size = floatval($_POST['nanoparticle_size'] ?? $_POST['size_nm'] ?? 45.0);
    $material = trim($_POST['material'] ?? $_POST['core_material'] ?? 'Polymeric');
    $shape = trim($_POST['shape'] ?? $_POST['nanoparticle_type'] ?? 'Spherical');
    $charge = floatval($_POST['charge'] ?? $_POST['surface_charge_mv'] ?? 20.0);
    $concentration = floatval($_POST['concentration'] ?? 50.0);
    $uploaded_file_url = '';

    // Handle CSV File upload
    if (isset($_FILES['csv_file']) && $_FILES['csv_file']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['csv_file'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        
        if (!in_array($ext, ['csv', 'txt', 'xlsx'])) {
            echo json_encode(['status' => 'error', 'message' => 'Only CSV, TXT, or XLSX dataset files are supported.']);
            exit;
        }

        $filename = 'dataset_' . time() . '_' . mt_rand(1000, 9999) . '.' . $ext;
        $file_content = file_get_contents($file['tmp_name']);

        // Upload to Supabase Storage if configured
        if (supabase()->isConfigured()) {
            $storageResult = supabase()->uploadFile('datasets', $filename, 'text/csv', $file_content);
            $uploaded_file_url = $storageResult['public_url'] ?? $filename;
        } else {
            $upload_dir = __DIR__ . '/../uploads/';
            if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);
            move_uploaded_file($file['tmp_name'], $upload_dir . $filename);
            $uploaded_file_url = 'uploads/' . $filename;
        }
    }

    try {
        if (!$pdo) throw new Exception("Supabase PostgreSQL DB connection unavailable.");
        $uuid = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );

        $stmt = $pdo->prepare("INSERT INTO nanoparticle_datasets 
            (id, user_id, dataset_name, name, nanoparticle_size, size_nm, material, core_material, shape, nanoparticle_type, charge, surface_charge_mv, concentration, uploaded_file) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        $stmt->execute([
            $uuid, $user_id, $dataset_name, $dataset_name, $size, $size, $material, $material, $shape, $shape, $charge, $charge, $concentration, $uploaded_file_url
        ]);

        // Record history
        $hist_stmt = $pdo->prepare("INSERT INTO history (user_id, activity) VALUES (?, ?)");
        $hist_stmt->execute([$user_id, "Uploaded dataset: {$dataset_name}"]);

        echo json_encode([
            'status' => 'success',
            'message' => 'Dataset uploaded successfully to Supabase.',
            'dataset' => [
                'id' => $uuid,
                'dataset_name' => $dataset_name,
                'uploaded_file' => $uploaded_file_url
            ]
        ]);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

if ($method === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? $_GET['id'] ?? null;

    if (!$id) {
        echo json_encode(['status' => 'error', 'message' => 'Dataset ID required for deletion.']);
        exit;
    }

    try {
        if (!$pdo) throw new Exception("Supabase PostgreSQL DB connection unavailable.");
        $stmt = $pdo->prepare("DELETE FROM nanoparticle_datasets WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $user_id]);
        echo json_encode(['status' => 'success', 'message' => 'Dataset deleted successfully.']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}
