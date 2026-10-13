<?php
require_once __DIR__ . '/config/db.php';
require_login();

$page_title = 'Dataset Manager | NanoAnalyzer';
$user_id = get_current_user_id();

$flash_success = $_SESSION['flash_success'] ?? '';
$flash_error = $_SESSION['flash_error'] ?? '';
unset($_SESSION['flash_success'], $_SESSION['flash_error']);

// Handle Traditional Server-Side Form Submissions (Non-API)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'create') {
        $name = trim($_POST['name'] ?? '');
        $core_material = trim($_POST['core_material'] ?? $_POST['material'] ?? '');
        $np_type = trim($_POST['nanoparticle_type'] ?? $_POST['type'] ?? $_POST['shape'] ?? 'Inorganic');
        $size_nm = isset($_POST['size_nm']) && $_POST['size_nm'] !== '' ? floatval($_POST['size_nm']) : 0;
        $charge_mv = isset($_POST['surface_charge_mv']) && $_POST['surface_charge_mv'] !== '' ? floatval($_POST['surface_charge_mv']) : (isset($_POST['charge_mv']) && $_POST['charge_mv'] !== '' ? floatval($_POST['charge_mv']) : 0);
        $cell_type = trim($_POST['cell_type'] ?? '');
        $uptake = isset($_POST['uptake_efficiency_percent']) && $_POST['uptake_efficiency_percent'] !== '' ? floatval($_POST['uptake_efficiency_percent']) : null;
        $toxicity = isset($_POST['toxicity_score']) && $_POST['toxicity_score'] !== '' ? floatval($_POST['toxicity_score']) : null;
        $notes = trim($_POST['notes'] ?? '');

        if (!empty($name) && !empty($core_material) && !empty($cell_type)) {
            if ($pdo instanceof PDO) {
                try {
                    $uuid = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
                        mt_rand(0, 0xffff),
                        mt_rand(0, 0x0fff) | 0x4000,
                        mt_rand(0, 0x3fff) | 0x8000,
                        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
                    );
                    $stmt = $pdo->prepare("INSERT INTO nanoparticle_datasets 
                        (id, user_id, dataset_name, name, shape, nanoparticle_type, material, core_material, charge, surface_charge_mv, nanoparticle_size, size_nm, cell_type, uptake_efficiency_percent, toxicity_score, notes) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                    $stmt->execute([
                        $uuid, $user_id, $name, $name, $np_type, $np_type, $core_material, $core_material,
                        $charge_mv, $charge_mv, $size_nm, $size_nm, $cell_type, $uptake, $toxicity, $notes
                    ]);
                    $_SESSION['flash_success'] = 'Dataset saved successfully to database.';
                } catch (Throwable $e) {
                    $_SESSION['flash_error'] = 'Failed to save dataset: ' . $e->getMessage();
                }
            }
        } else {
            $_SESSION['flash_error'] = 'Please fill out all required fields.';
        }
        header('Location: datasets.php');
        exit;
    } elseif ($action === 'delete') {
        $id = trim($_POST['id'] ?? '');
        if ($pdo instanceof PDO && !empty($id)) {
            try {
                $stmt = $pdo->prepare("DELETE FROM nanoparticle_datasets WHERE id = ? AND user_id = ?");
                $stmt->execute([$id, $user_id]);
                $_SESSION['flash_success'] = 'Dataset entry removed successfully.';
            } catch (Throwable $e) {
                $_SESSION['flash_error'] = 'Failed to delete dataset record.';
            }
        }
        header('Location: datasets.php');
        exit;
    }
}

$datasets = [];
if ($pdo instanceof PDO) {
    try {
        $stmt = $pdo->prepare("SELECT d.*, COALESCE(u.name, u.full_name) as full_name FROM nanoparticle_datasets d LEFT JOIN users u ON d.user_id = u.id WHERE d.user_id = ? ORDER BY d.created_at DESC");
        $stmt->execute([$user_id]);
        $datasets = $stmt->fetchAll() ?: [];
    } catch (Throwable $e) {
        $datasets = [];
    }
}

// CSV Export Handler
if (isset($_GET['export']) && $_GET['export'] === 'csv') {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=nanoanalyzer_datasets_' . date('Y-m-d') . '.csv');
    $output = fopen('php://output', 'w');
    fputcsv($output, ['ID', 'Dataset Name', 'Type', 'Core Material', 'Surface Charge (mV)', 'Size (nm)', 'Cell Line', 'Uptake Efficiency (%)', 'Toxicity Score', 'Notes', 'Created At']);
    foreach ($datasets as $row) {
        fputcsv($output, [
            $row['id'], 
            $row['dataset_name'] ?? $row['name'], 
            $row['nanoparticle_type'] ?? $row['shape'], 
            $row['core_material'] ?? $row['material'], 
            $row['surface_charge_mv'] ?? $row['charge'], 
            $row['size_nm'] ?? $row['nanoparticle_size'], 
            $row['cell_type'], 
            $row['uptake_efficiency_percent'], 
            $row['toxicity_score'], 
            $row['notes'], 
            $row['created_at']
        ]);
    }
    fclose($output);
    exit;
}

include __DIR__ . '/includes/header.php';
?>

<div id="wrapper">
  <?php include __DIR__ . '/includes/sidebar.php'; ?>

  <div id="page-content-wrapper">
    <?php include __DIR__ . '/includes/navbar.php'; ?>

    <div class="container-fluid p-4">
      <div class="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
        <div>
          <h2 class="text-white fw-bold mb-1">Nanoparticle Dataset Manager</h2>
          <p class="text-muted mb-0">Curated experimental datasets stored in Supabase Cloud Database with full CRUD support.</p>
        </div>
        <div class="d-flex gap-2">
          <a href="datasets.php?export=csv" class="btn btn-glass"><i class="bi bi-download me-1"></i> Export CSV</a>
          <button class="btn btn-glow-cyan" data-bs-toggle="modal" data-bs-target="#addDatasetModal"><i class="bi bi-plus-lg me-1"></i> Add Dataset</button>
        </div>
      </div>

      <?php if (!empty($flash_success)): ?>
        <div class="alert alert-success glass-panel text-white border-success mb-3">
          <i class="bi bi-check-circle-fill me-1 text-success"></i> <?php echo htmlspecialchars($flash_success); ?>
        </div>
      <?php endif; ?>

      <?php if (!empty($flash_error)): ?>
        <div class="alert alert-danger glass-panel text-white border-danger mb-3">
          <i class="bi bi-exclamation-triangle-fill me-1 text-danger"></i> <?php echo htmlspecialchars($flash_error); ?>
        </div>
      <?php endif; ?>

      <div class="glass-panel p-4">
        <div class="table-responsive">
          <table class="table table-custom align-middle">
            <thead>
              <tr>
                <th>Dataset Name</th>
                <th>Material</th>
                <th>Category</th>
                <th>Size (nm)</th>
                <th>Charge (mV)</th>
                <th>Cell Line</th>
                <th>Uptake %</th>
                <th>Toxicity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <?php if (count($datasets) > 0): ?>
                <?php foreach ($datasets as $row): ?>
                  <?php 
                    $ds_name = htmlspecialchars($row['dataset_name'] ?? $row['name'] ?? '—');
                    $ds_material = htmlspecialchars($row['core_material'] ?? $row['material'] ?? '—');
                    $ds_type = htmlspecialchars($row['nanoparticle_type'] ?? $row['shape'] ?? '—');
                    $ds_size = isset($row['size_nm']) ? $row['size_nm'] : ($row['nanoparticle_size'] ?? '—');
                    $ds_charge = isset($row['surface_charge_mv']) ? $row['surface_charge_mv'] : ($row['charge'] ?? '—');
                  ?>
                  <tr>
                    <td class="fw-bold parameter-value"><?php echo $ds_name; ?></td>
                    <td><span class="badge badge-tech primary"><?php echo $ds_material; ?></span></td>
                    <td class="parameter-value"><?php echo $ds_type; ?></td>
                    <td class="parameter-value"><?php echo $ds_size !== '—' ? ($ds_size . ' nm') : '—'; ?></td>
                    <td class="parameter-value"><?php echo is_numeric($ds_charge) ? (($ds_charge > 0 ? '+' . $ds_charge : $ds_charge) . ' mV') : '—'; ?></td>
                    <td><span class="badge badge-tech cyan"><?php echo htmlspecialchars($row['cell_type'] ?? '—'); ?></span></td>
                    <td class="text-emerald fw-bold"><?php echo isset($row['uptake_efficiency_percent']) ? ($row['uptake_efficiency_percent'] . '%') : '—'; ?></td>
                    <td class="text-rose fw-bold"><?php echo isset($row['toxicity_score']) ? $row['toxicity_score'] : '—'; ?></td>
                    <td>
                      <form method="POST" action="datasets.php" style="display:inline;" onsubmit="return confirm('Delete this dataset entry?');">
                        <input type="hidden" name="action" value="delete">
                        <input type="hidden" name="id" value="<?php echo htmlspecialchars($row['id']); ?>">
                        <button type="submit" class="btn btn-sm btn-glass text-danger"><i class="bi bi-trash"></i></button>
                      </form>
                    </td>
                  </tr>
                <?php endforeach; ?>
              <?php else: ?>
                <tr><td colspan="9" class="text-center text-muted py-4">No datasets found in Supabase database.</td></tr>
              <?php endif; ?>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Add Dataset Modal -->
<div class="modal fade" id="addDatasetModal" tabindex="-1">
  <div class="modal-dialog modal-lg">
    <div class="modal-content glass-panel">
      <div class="modal-header border-secondary">
        <h5 class="modal-title fw-bold parameter-value">Add Nanoparticle Dataset</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>
      <form id="addDatasetForm" method="POST" action="datasets.php">
        <div class="modal-body">
          <input type="hidden" name="action" value="create">
          <div class="mb-3">
            <label class="form-label parameter-label">Dataset Name</label>
            <input type="text" name="name" class="form-control parameter-value" placeholder="e.g. Gold Nanoparticle In-Vitro Study" required>
          </div>
          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label class="form-label parameter-label">Core Material</label>
              <select name="core_material" class="form-select parameter-value" required>
                <option value="" disabled selected>Select Core Material...</option>
                <option value="Gold (Au)">Gold (Au)</option>
                <option value="Silica (SiO2)">Silica (SiO2)</option>
                <option value="PLGA Polymer">PLGA Polymer</option>
                <option value="Liposome">Liposome</option>
                <option value="Iron Oxide (Fe3O4)">Iron Oxide (Fe3O4)</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label parameter-label">Type</label>
              <select name="nanoparticle_type" class="form-select parameter-value" required>
                <option value="" disabled selected>Select Category / Type...</option>
                <option value="Polymeric">Polymeric</option>
                <option value="Inorganic">Inorganic</option>
                <option value="Lipid-based">Lipid-based</option>
                <option value="Metal Oxide">Metal Oxide</option>
              </select>
            </div>
          </div>
          <div class="row g-3 mb-3">
            <div class="col-md-4">
              <label class="form-label parameter-label">Size (nm)</label>
              <input type="number" step="0.1" name="size_nm" class="form-control parameter-value" placeholder="e.g. 45.0" required>
            </div>
            <div class="col-md-4">
              <label class="form-label parameter-label">Surface Charge (mV)</label>
              <input type="number" step="0.1" name="surface_charge_mv" class="form-control parameter-value" placeholder="e.g. 20.0" required>
            </div>
            <div class="col-md-4">
              <label class="form-label parameter-label">Cell Line</label>
              <input type="text" name="cell_type" class="form-control parameter-value" placeholder="e.g. HeLa" required>
            </div>
          </div>
          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label class="form-label parameter-label">Uptake Efficiency (%)</label>
              <input type="number" step="0.1" name="uptake_efficiency_percent" class="form-control parameter-value" placeholder="e.g. 85.0" required>
            </div>
            <div class="col-md-6">
              <label class="form-label parameter-label">Toxicity Score (0-100)</label>
              <input type="number" step="0.1" name="toxicity_score" class="form-control parameter-value" placeholder="e.g. 12.0" required>
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label parameter-label">Notes & Observations</label>
            <textarea name="notes" class="form-control parameter-value" rows="2" placeholder="Thermodynamic wrapping comments..."></textarea>
          </div>
        </div>
        <div class="modal-footer border-secondary">
          <button type="button" class="btn btn-glass" data-bs-dismiss="modal">Cancel</button>
          <button type="submit" class="btn btn-glow-cyan">Save Dataset to Supabase</button>
        </div>
      </form>
    </div>
  </div>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>
