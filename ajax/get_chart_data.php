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

    // 1. Particle Size vs Uptake Efficiency (Strictly from user's analysis_results / datasets)
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
    $rows1 = $stmt1 ? $stmt1->fetchAll() : [];

    if (empty($rows1)) {
        $stmt1_ds = $pdo->prepare("
            SELECT 
                COALESCE(size_nm, nanoparticle_size) as size_nm, 
                ROUND(AVG(uptake_efficiency_percent), 1) as uptake 
            FROM nanoparticle_datasets 
            WHERE user_id = ? AND (size_nm IS NOT NULL OR nanoparticle_size IS NOT NULL) AND uptake_efficiency_percent IS NOT NULL
            GROUP BY COALESCE(size_nm, nanoparticle_size) 
            ORDER BY size_nm ASC
        ");
        $stmt1_ds->execute([$user_id]);
        $rows1 = $stmt1_ds ? $stmt1_ds->fetchAll() : [];
    }

    $uptake_vs_size = [];
    foreach ($rows1 as $r) {
        if (isset($r['size_nm']) && isset($r['uptake'])) {
            $uptake_vs_size[] = [
                'size_nm' => (float)$r['size_nm'],
                'uptake' => (float)$r['uptake']
            ];
        }
    }

    // 2. Core Material Distribution (Strictly from user's analysis_results / datasets)
    $material_counts = [];

    // Fetch from analysis_results for user
    $stmt2_ar = $pdo->prepare("
        SELECT COALESCE(NULLIF(core_material, ''), 'Unspecified') as material, COUNT(*) as cnt 
        FROM analysis_results 
        WHERE user_id = ? 
        GROUP BY COALESCE(NULLIF(core_material, ''), 'Unspecified')
    ");
    $stmt2_ar->execute([$user_id]);
    if ($stmt2_ar) {
        foreach ($stmt2_ar->fetchAll() as $r) {
            $mat = (string)$r['material'];
            $material_counts[$mat] = ($material_counts[$mat] ?? 0) + (int)$r['cnt'];
        }
    }

    // Fetch from nanoparticle_datasets for user
    $stmt2_ds = $pdo->prepare("
        SELECT COALESCE(NULLIF(core_material, ''), NULLIF(material, ''), 'Unspecified') as material, COUNT(*) as cnt 
        FROM nanoparticle_datasets 
        WHERE user_id = ? 
        GROUP BY COALESCE(NULLIF(core_material, ''), NULLIF(material, ''), 'Unspecified')
    ");
    $stmt2_ds->execute([$user_id]);
    if ($stmt2_ds) {
        foreach ($stmt2_ds->fetchAll() as $r) {
            $mat = (string)$r['material'];
            $material_counts[$mat] = ($material_counts[$mat] ?? 0) + (int)$r['cnt'];
        }
    }

    $material_dist = [];
    foreach ($material_counts as $mat => $cnt) {
        $material_dist[] = [
            'material' => $mat,
            'count' => $cnt
        ];
    }
    usort($material_dist, function($a, $b) {
        return $b['count'] - $a['count'];
    });

    // 3. Average Toxicity Score by Core Material (Strictly from user's analysis_results / datasets)
    $stmt3_ar = $pdo->prepare("
        SELECT 
            COALESCE(NULLIF(core_material, ''), 'Unspecified') as material, 
            ROUND(AVG(COALESCE(predicted_toxicity_index, 0)), 1) as avg_toxicity 
        FROM analysis_results 
        WHERE user_id = ? AND predicted_toxicity_index IS NOT NULL
        GROUP BY COALESCE(NULLIF(core_material, ''), 'Unspecified')
    ");
    $stmt3_ar->execute([$user_id]);
    $rows3 = $stmt3_ar ? $stmt3_ar->fetchAll() : [];

    if (empty($rows3)) {
        $stmt3_ds = $pdo->prepare("
            SELECT 
                COALESCE(NULLIF(core_material, ''), NULLIF(material, ''), 'Unspecified') as material, 
                ROUND(AVG(COALESCE(toxicity_score, 0)), 1) as avg_toxicity 
            FROM nanoparticle_datasets 
            WHERE user_id = ? AND toxicity_score IS NOT NULL
            GROUP BY COALESCE(NULLIF(core_material, ''), NULLIF(material, ''), 'Unspecified')
        ");
        $stmt3_ds->execute([$user_id]);
        $rows3 = $stmt3_ds ? $stmt3_ds->fetchAll() : [];
    }

    $toxicity_by_material = [];
    foreach ($rows3 as $r) {
        $toxicity_by_material[] = [
            'material' => (string)$r['material'],
            'avg_toxicity' => (float)$r['avg_toxicity']
        ];
    }

    // 4. Uptake Efficiency by Target Cell Line (Strictly from user's analysis_results / datasets)
    $stmt4_ar = $pdo->prepare("
        SELECT 
            COALESCE(NULLIF(cell_type, ''), 'Unspecified') as cell_line, 
            ROUND(AVG(COALESCE(predicted_uptake_percent, uptake_percentage)), 1) as avg_uptake 
        FROM analysis_results 
        WHERE user_id = ? AND (predicted_uptake_percent IS NOT NULL OR uptake_percentage IS NOT NULL)
        GROUP BY COALESCE(NULLIF(cell_type, ''), 'Unspecified')
    ");
    $stmt4_ar->execute([$user_id]);
    $rows4 = $stmt4_ar ? $stmt4_ar->fetchAll() : [];

    if (empty($rows4)) {
        $stmt4_ds = $pdo->prepare("
            SELECT 
                COALESCE(NULLIF(cell_type, ''), 'Unspecified') as cell_line, 
                ROUND(AVG(COALESCE(uptake_efficiency_percent, 0)), 1) as avg_uptake 
            FROM nanoparticle_datasets 
            WHERE user_id = ? AND cell_type IS NOT NULL
            GROUP BY COALESCE(NULLIF(cell_type, ''), 'Unspecified')
        ");
        $stmt4_ds->execute([$user_id]);
        $rows4 = $stmt4_ds ? $stmt4_ds->fetchAll() : [];
    }

    $cell_line_uptake = [];
    foreach ($rows4 as $r) {
        $cell_line_uptake[] = [
            'cell_line' => (string)$r['cell_line'],
            'avg_uptake' => (float)$r['avg_uptake']
        ];
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
