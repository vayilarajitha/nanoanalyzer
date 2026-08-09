<?php
require_once __DIR__ . '/config/db.php';
require_login();

$page_title = 'Dataset Manager | NanoAnalyzer';
$user_id = get_current_user_id();

try {
    if (!$pdo) throw new Exception("Supabase DB not connected.");
    $stmt = $pdo->prepare("SELECT d.*, COALESCE(u.name, u.full_name) as full_name FROM nanoparticle_datasets d LEFT JOIN users u ON d.user_id = u.id WHERE d.user_id = ? ORDER BY d.created_at DESC");
    $stmt->execute([$user_id]);
    $datasets = $stmt->fetchAll();
    if (empty($datasets)) {
        $stmt_all = $pdo->query("SELECT d.*, COALESCE(u.name, u.full_name) as full_name FROM nanoparticle_datasets d LEFT JOIN users u ON d.user_id = u.id ORDER BY d.created_at DESC");
        $datasets = $stmt_all->fetchAll();
    }
} catch (Exception $e) {
    $datasets = [];
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
                    $ds_name = htmlspecialchars($row['dataset_name'] ?? $row['name'] ?? 'Dataset');
                    $ds_material = htmlspecialchars($row['core_material'] ?? $row['material'] ?? 'Polymeric');
                    $ds_type = htmlspecialchars($row['nanoparticle_type'] ?? $row['shape'] ?? 'Spherical');
                    $ds_size = $row['size_nm'] ?? $row['nanoparticle_size'] ?? 45.0;
                    $ds_charge = $row['surface_charge_mv'] ?? $row['charge'] ?? 20.0;
                  ?>
                  <tr>
                    <td class="fw-bold parameter-value"><?php echo $ds_name; ?></td>
                    <td><span class="badge badge-tech primary"><?php echo $ds_material; ?></span></td>
                    <td class="parameter-value"><?php echo $ds_type; ?></td>
                    <td class="parameter-value"><?php echo $ds_size; ?> nm</td>
                    <td class="parameter-value"><?php echo $ds_charge > 0 ? '+' . $ds_charge : $ds_charge; ?> mV</td>
                    <td><span class="badge badge-tech cyan"><?php echo htmlspecialchars($row['cell_type'] ?? 'HeLa'); ?></span></td>
                    <td class="text-emerald fw-bold"><?php echo $row['uptake_efficiency_percent'] ?? 85.0; ?>%</td>
                    <td class="text-rose fw-bold"><?php echo $row['toxicity_score'] ?? 12.0; ?></td>
                    <td>
                      <button onclick="deleteDataset('<?php echo $row['id']; ?>')" class="btn btn-sm btn-glass text-danger"><i class="bi bi-trash"></i></button>
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
      <form id="addDatasetForm">
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
              <input type="number" step="0.1" name="size_nm" class="form-control parameter-value" value="45.0" required>
            </div>
            <div class="col-md-4">
              <label class="form-label parameter-label">Surface Charge (mV)</label>
              <input type="number" step="0.1" name="surface_charge_mv" class="form-control parameter-value" value="20.0" required>
            </div>
            <div class="col-md-4">
              <label class="form-label parameter-label">Cell Line</label>
              <input type="text" name="cell_type" class="form-control parameter-value" value="HeLa" required>
            </div>
          </div>
          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label class="form-label parameter-label">Uptake Efficiency (%)</label>
              <input type="number" step="0.1" name="uptake_efficiency_percent" class="form-control parameter-value" value="85.0" required>
            </div>
            <div class="col-md-6">
              <label class="form-label parameter-label">Toxicity Score (0-100)</label>
              <input type="number" step="0.1" name="toxicity_score" class="form-control parameter-value" value="12.0" required>
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

<script>
document.getElementById('addDatasetForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const formData = new FormData(this);
  fetch('ajax/dataset_crud.php', {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === 'success') {
      showToast(data.message, 'success');
      setTimeout(() => location.reload(), 800);
    } else {
      showToast(data.message, 'error');
    }
  });
});

function deleteDataset(id) {
  if (!confirm('Delete this dataset entry?')) return;
  const formData = new FormData();
  formData.append('action', 'delete');
  formData.append('id', id);
  fetch('ajax/dataset_crud.php', {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === 'success') {
      showToast(data.message, 'success');
      setTimeout(() => location.reload(), 800);
    } else {
      showToast(data.message, 'error');
    }
  });
}
</script>

<?php include __DIR__ . '/includes/footer.php'; ?>
