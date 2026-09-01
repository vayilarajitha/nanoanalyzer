<?php
// NanoUptake Analyzer - REST API: Dashboard Summary & Metrics Endpoint
// Mobile & Web application integration for research dashboard metrics and charts

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-User-ID');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/db.php';

$user_id = get_current_user_id();

try {
    if (!($pdo instanceof PDO)) {
        throw new Exception("Database connection unavailable.");
    }

    // 1. Stat cards counts
    $stmt_pr = $pdo->prepare("SELECT COUNT(*) FROM analysis_results WHERE user_id = ?");
    $stmt_pr->execute([$user_id]);
    $total_predictions = (int)($stmt_pr->fetchColumn() ?: 0);

    $stmt_ds = $pdo->prepare("SELECT COUNT(*) FROM nanoparticle_datasets WHERE user_id = ?");
    $stmt_ds->execute([$user_id]);
    $total_datasets = (int)($stmt_ds->fetchColumn() ?: 0);

    $stmt_ex = $pdo->prepare("SELECT COUNT(*) FROM history WHERE user_id = ?");
    $stmt_ex->execute([$user_id]);
    $total_experiments = (int)($stmt_ex->fetchColumn() ?: 0);

    // 2. Mean Uptake Rate
    $stmt_up = $pdo->prepare("SELECT ROUND(AVG(COALESCE(predicted_uptake_percent, uptake_percentage)), 1) FROM analysis_results WHERE user_id = ?");
    $stmt_up->execute([$user_id]);
    $val_up = $stmt_up->fetchColumn();

    if ($val_up === false || $val_up === null || $val_up === '') {
        $stmt_up_ds = $pdo->prepare("SELECT ROUND(AVG(uptake_efficiency_percent), 1) FROM nanoparticle_datasets WHERE user_id = ? AND uptake_efficiency_percent IS NOT NULL");
        $stmt_up_ds->execute([$user_id]);
        $val_up = $stmt_up_ds->fetchColumn();
    }

    $avg_uptake = ($val_up !== false && $val_up !== null && $val_up !== '') ? (float)$val_up : null;

    // 3. Recent Simulation Runs
    $stmt_recent = $pdo->prepare("SELECT * FROM analysis_results WHERE user_id = ? ORDER BY created_at DESC LIMIT 5");
    $stmt_recent->execute([$user_id]);
    $recent_predictions = $stmt_recent->fetchAll() ?: [];
    foreach ($recent_predictions as &$row) {
        $row['created_at_formatted'] = format_app_datetime($row['created_at']);
    }
    unset($row);

    // 4. Chart: Uptake vs Size
    $stmt_chart1 = $pdo->prepare("
        SELECT size_nm, ROUND(AVG(COALESCE(predicted_uptake_percent, uptake_percentage)), 1) as uptake 
        FROM analysis_results 
        WHERE user_id = ? AND size_nm IS NOT NULL
        GROUP BY size_nm 
        ORDER BY size_nm ASC
    ");
    $stmt_chart1->execute([$user_id]);
    $rows1 = $stmt_chart1->fetchAll() ?: [];
    $uptake_vs_size = [];
    foreach ($rows1 as $r) {
        $uptake_vs_size[] = ['size_nm' => (float)$r['size_nm'], 'uptake' => (float)$r['uptake']];
    }

    // 5. Chart: Material Distribution
    $material_counts = [];
    $stmt_chart2 = $pdo->prepare("
        SELECT COALESCE(NULLIF(core_material, ''), 'Unspecified') as material, COUNT(*) as cnt 
        FROM analysis_results 
        WHERE user_id = ? 
        GROUP BY COALESCE(NULLIF(core_material, ''), 'Unspecified')
    ");
    $stmt_chart2->execute([$user_id]);
    foreach ($stmt_chart2->fetchAll() as $r) {
        $mat = (string)$r['material'];
        $material_counts[$mat] = ($material_counts[$mat] ?? 0) + (int)$r['cnt'];
    }

    $material_distribution = [];
    foreach ($material_counts as $mat => $cnt) {
        $material_distribution[] = ['material' => $mat, 'count' => $cnt];
    }

    echo json_encode([
        'status' => 'success',
        'metrics' => [
            'total_predictions' => $total_predictions,
            'total_datasets' => $total_datasets,
            'total_experiments' => $total_experiments,
            'avg_uptake' => $avg_uptake
        ],
        'recent_predictions' => $recent_predictions,
        'charts' => [
            'uptake_vs_size' => $uptake_vs_size,
            'material_distribution' => $material_distribution
        ]
    ]);

} catch (Throwable $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'metrics' => [
            'total_predictions' => 0,
            'total_datasets' => 0,
            'total_experiments' => 0,
            'avg_uptake' => null
        ],
        'recent_predictions' => [],
        'charts' => [
            'uptake_vs_size' => [],
            'material_distribution' => []
        ]
    ]);
}
