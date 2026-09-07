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
    // If not authenticated, return empty datasets array without demo/seed data
    if (empty($user_id)) {
        if (!empty($_GET['id'])) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Dataset not found or access denied.']);
            exit;
        }
        http_response_code(200);
        echo json_encode(['status' => 'success', 'datasets' => [], 'authenticated' => false]);
        exit;
    }

    // List datasets strictly for current user
    try {
        if (!($pdo instanceof PDO)) throw new Exception("Supabase PostgreSQL DB connection unavailable.");
        
        $single_id = $_GET['id'] ?? null;
        if (!empty($single_id)) {
            $stmt = $pdo->prepare("SELECT d.*, COALESCE(u.name, u.full_name) as full_name FROM nanoparticle_datasets d LEFT JOIN users u ON d.user_id = u.id WHERE d.id = ? AND d.user_id = ?");
            $stmt->execute([$single_id, $user_id]);
            $dataset = $stmt->fetch();
            if (!$dataset) {
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'Dataset not found or access denied.']);
                exit;
            }
            echo json_encode(['status' => 'success', 'dataset' => $dataset]);
            exit;
        }

        $stmt = $pdo->prepare("SELECT d.*, COALESCE(u.name, u.full_name) as full_name FROM nanoparticle_datasets d LEFT JOIN users u ON d.user_id = u.id WHERE d.user_id = ? ORDER BY d.created_at DESC");
        $stmt->execute([$user_id]);
        $datasets = $stmt->fetchAll() ?: [];
        echo json_encode(['status' => 'success', 'datasets' => $datasets]);
    } catch (Throwable $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

if ($method === 'POST') {
    if (empty($user_id)) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized: Authentication required.']);
        exit;
    }
    // Upload Dataset CSV & Metadata
    $dataset_name = trim($_POST['dataset_name'] ?? $_POST['name'] ?? '');
    $size = isset($_POST['nanoparticle_size']) && $_POST['nanoparticle_size'] !== '' ? floatval($_POST['nanoparticle_size']) : (isset($_POST['size_nm']) && $_POST['size_nm'] !== '' ? floatval($_POST['size_nm']) : null);
    $material = trim($_POST['material'] ?? $_POST['core_material'] ?? '');
    $shape = trim($_POST['shape'] ?? $_POST['nanoparticle_type'] ?? '');
    $charge = isset($_POST['charge']) && $_POST['charge'] !== '' ? floatval($_POST['charge']) : (isset($_POST['surface_charge_mv']) && $_POST['surface_charge_mv'] !== '' ? floatval($_POST['surface_charge_mv']) : null);
    $concentration = isset($_POST['concentration']) && $_POST['concentration'] !== '' ? floatval($_POST['concentration']) : null;
    $uploaded_file_url = '';

    if (empty($dataset_name) || empty($material) || empty($shape) || $size === null) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Please provide all required dataset parameters (dataset_name, material, shape, size).']);
        exit;
    }

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
        if (!($pdo instanceof PDO)) throw new Exception("Supabase PostgreSQL DB connection unavailable.");
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
    } catch (Throwable $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

if ($method === 'DELETE') {
    if (empty($user_id)) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized: Authentication required.']);
        exit;
    }
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? $_GET['id'] ?? null;

    if (!$id) {
        echo json_encode(['status' => 'error', 'message' => 'Dataset ID required for deletion.']);
        exit;
    }

    try {
        if (!($pdo instanceof PDO)) throw new Exception("Supabase PostgreSQL DB connection unavailable.");
        $stmt = $pdo->prepare("DELETE FROM nanoparticle_datasets WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $user_id]);
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Dataset not found or access denied.']);
        } else {
            echo json_encode(['status' => 'success', 'message' => 'Dataset deleted successfully.']);
        }
    } catch (Throwable $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}
