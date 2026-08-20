<?php
require_once __DIR__ . '/../config/db.php';

if (!headers_sent()) {
    header('Content-Type: application/json');
}

try {
    if (!($pdo instanceof PDO)) {
        throw new Exception("Database connection unavailable.");
    }

    $user_id = get_current_user_id();

    // 1. Particle Size vs Uptake Efficiency (Sorted by size) from actual analysis data
    $stmt1 = $pdo->prepare("
        SELECT 
            size_nm, 
            ROUND(AVG(COALESCE(predicted_uptake_percent, uptake_percentage)), 1) as uptake 
        FROM analysis_results 
        WHERE user_id = ? AND size_nm IS NOT NULL AND (predicted_uptake_percent IS NOT NULL OR uptake_percentage IS NOT NULL)
        GROUP BY size_nm 
        ORDER BY size_nm ASC
    ");
    $stmt1->execute([$user_id]);
    $uptake_vs_size = [];
    if ($stmt1) {
        $rows1 = $stmt1->fetchAll();
        foreach ($rows1 as $r) {
            $uptake_vs_size[] = [
                'size_nm' => (float)$r['size_nm'],
                'uptake' => (float)$r['uptake']
            ];
        }
    }

    // 2. Material Distribution from actual datasets
    $stmt2 = $pdo->prepare("
        SELECT 
            COALESCE(NULLIF(core_material, ''), NULLIF(material, ''), 'Unspecified') as material, 
            COUNT(*) as count 
        FROM nanoparticle_datasets 
        WHERE user_id = ?
        GROUP BY COALESCE(NULLIF(core_material, ''), NULLIF(material, ''), 'Unspecified') 
        ORDER BY count DESC
    ");
    $stmt2->execute([$user_id]);
    $material_dist = [];
    if ($stmt2) {
        $rows2 = $stmt2->fetchAll();
        foreach ($rows2 as $r) {
            $material_dist[] = [
                'material' => (string)$r['material'],
                'count' => (int)$r['count']
            ];
        }
    }

    // 3. Average Toxicity Score by Core Material from actual datasets
    $stmt3 = $pdo->prepare("
        SELECT 
            COALESCE(NULLIF(core_material, ''), NULLIF(material, ''), 'Unspecified') as material, 
            ROUND(AVG(COALESCE(toxicity_score, 0)), 1) as avg_toxicity 
        FROM nanoparticle_datasets 
        WHERE user_id = ? AND toxicity_score IS NOT NULL
        GROUP BY COALESCE(NULLIF(core_material, ''), NULLIF(material, ''), 'Unspecified')
    ");
    $stmt3->execute([$user_id]);
    $toxicity_by_material = [];
    if ($stmt3) {
        $rows3 = $stmt3->fetchAll();
        foreach ($rows3 as $r) {
            $toxicity_by_material[] = [
                'material' => (string)$r['material'],
                'avg_toxicity' => (float)$r['avg_toxicity']
            ];
        }
    }

    // 4. Uptake Efficiency by Target Cell Line from actual datasets
    $stmt4 = $pdo->prepare("
        SELECT 
            COALESCE(NULLIF(cell_type, ''), 'Unspecified') as cell_line, 
            ROUND(AVG(COALESCE(uptake_efficiency_percent, 0)), 1) as avg_uptake 
        FROM nanoparticle_datasets 
        WHERE user_id = ? AND cell_type IS NOT NULL
        GROUP BY COALESCE(NULLIF(cell_type, ''), 'Unspecified')
    ");
    $stmt4->execute([$user_id]);
    $cell_line_uptake = [];
    if ($stmt4) {
        $rows4 = $stmt4->fetchAll();
        foreach ($rows4 as $r) {
            $cell_line_uptake[] = [
                'cell_line' => (string)$r['cell_line'],
                'avg_uptake' => (float)$r['avg_uptake']
            ];
        }
    }

    echo json_encode([
        'status' => 'success',
        'uptake_vs_size' => $uptake_vs_size,
        'material_distribution' => $material_dist,
        'toxicity_by_material' => $toxicity_by_material,
        'cell_line_uptake' => $cell_line_uptake
    ]);

} catch (Throwable $e) {
    echo json_encode([
        'status' => 'success',
        'uptake_vs_size' => [],
        'material_distribution' => [],
        'toxicity_by_material' => [],
        'cell_line_uptake' => []
    ]);
}
