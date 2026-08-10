<?php
require_once __DIR__ . '/config/db.php';
require_login();

$page_title = 'Analysis History | NanoAnalyzer';
$user_id = get_current_user_id();

$history_rows = [];
if ($pdo instanceof PDO) {
    try {
        $stmt = $pdo->prepare("SELECT * FROM analysis_results WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$user_id]);
        $history_rows = $stmt->fetchAll() ?: [];
    } catch (Throwable $e) {
        $history_rows = [];
    }
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
          <h2 class="text-white fw-bold mb-1">Analysis History</h2>
          <p class="text-muted mb-0">Full record of deterministic nanoparticle simulation executions.</p>
        </div>
        <a href="predict.php" class="btn btn-glow-cyan"><i class="bi bi-plus-lg me-1"></i> New Simulation</a>
      </div>

      <div class="glass-panel p-4">
        <div class="table-responsive">
          <table class="table table-custom align-middle">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Simulation Title</th>
                <th>Core Material</th>
                <th>Size (nm)</th>
                <th>Cell Line</th>
                <th>Uptake %</th>
                <th>Toxicity</th>
                <th>Delivery Score</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <?php if (count($history_rows) > 0): ?>
                <?php foreach ($history_rows as $row): ?>
                  <tr>
                    <td class="text-secondary-custom small"><?php echo date('Y-m-d H:i', strtotime($row['created_at'])); ?></td>
                    <td class="fw-bold parameter-value"><?php echo htmlspecialchars($row['analysis_name']); ?></td>
                    <td><span class="badge badge-tech primary"><?php echo htmlspecialchars($row['core_material']); ?></span></td>
                    <td class="parameter-value"><?php echo $row['size_nm']; ?> nm</td>
                    <td><span class="badge badge-tech cyan"><?php echo htmlspecialchars($row['cell_type']); ?></span></td>
                    <td class="text-emerald fw-bold"><?php echo $row['predicted_uptake_percent']; ?>%</td>
                    <td class="text-rose fw-bold"><?php echo $row['predicted_toxicity_index']; ?></td>
                    <td class="text-cyan fw-bold"><?php echo $row['delivery_efficiency_score']; ?></td>
                    <td>
                      <a href="results.php?id=<?php echo $row['id']; ?>" class="btn btn-sm btn-glass me-1"><i class="bi bi-eye"></i> View</a>
                      <button onclick="deleteHistory('<?php echo $row['id']; ?>')" class="btn btn-sm btn-glass text-danger"><i class="bi bi-trash"></i></button>
                    </td>
                  </tr>
                <?php endforeach; ?>
              <?php else: ?>
                <tr>
                  <td colspan="9" class="text-center text-muted py-4">No simulation history recorded yet.</td>
                </tr>
              <?php endif; ?>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
function deleteHistory(id) {
  if (!confirm('Are you sure you want to remove this record from your history?')) return;
  fetch('ajax/history_handler.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ action: 'delete', id: id })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === 'success') {
      showToast(data.message, 'success');
      setTimeout(() => location.reload(), 800);
    }
  });
}
</script>

<?php include __DIR__ . '/includes/footer.php'; ?>
