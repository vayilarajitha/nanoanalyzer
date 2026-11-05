<?php
require_once __DIR__ . '/config/db.php';
require_login();

$page_title = 'Analysis History | NanoAnalyzer';
$user_id = get_current_user_id();

$flash_success = $_SESSION['flash_success'] ?? '';
$flash_error = $_SESSION['flash_error'] ?? '';
unset($_SESSION['flash_success'], $_SESSION['flash_error']);

// Handle Traditional Server-Side Deletion (Non-API)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    if ($action === 'delete') {
        $id = trim($_POST['id'] ?? '');
        if ($pdo instanceof PDO && !empty($id)) {
            try {
                $stmt = $pdo->prepare("DELETE FROM analysis_results WHERE id = ? AND user_id = ?");
                $stmt->execute([$id, $user_id]);
                $_SESSION['flash_success'] = 'Simulation record removed from history.';
            } catch (Throwable $e) {
                $_SESSION['flash_error'] = 'Failed to remove simulation record.';
            }
        }
        header('Location: history.php');
        exit;
    }
}

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
                    <td class="text-secondary-custom small font-mono"><?php echo format_app_datetime($row['created_at']); ?></td>
                    <td class="fw-bold parameter-value"><?php echo htmlspecialchars($row['analysis_name']); ?></td>
                    <td><span class="badge badge-tech primary"><?php echo htmlspecialchars($row['core_material']); ?></span></td>
                    <td class="parameter-value"><?php echo $row['size_nm']; ?> nm</td>
                    <td><span class="badge badge-tech cyan"><?php echo htmlspecialchars($row['cell_type']); ?></span></td>
                    <td class="text-emerald fw-bold"><?php echo $row['predicted_uptake_percent']; ?>%</td>
                    <td class="text-rose fw-bold"><?php echo $row['predicted_toxicity_index']; ?></td>
                    <td class="text-cyan fw-bold"><?php echo $row['delivery_efficiency_score']; ?></td>
                    <td>
                      <a href="results.php?id=<?php echo $row['id']; ?>" class="btn btn-sm btn-glass me-1"><i class="bi bi-eye"></i> View</a>
                      <form method="POST" action="history.php" style="display:inline;" onsubmit="return confirm('Are you sure you want to remove this record from your history?');">
                        <input type="hidden" name="action" value="delete">
                        <input type="hidden" name="id" value="<?php echo htmlspecialchars($row['id']); ?>">
                        <button type="submit" class="btn btn-sm btn-glass text-danger"><i class="bi bi-trash"></i></button>
                      </form>
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

<?php include __DIR__ . '/includes/footer.php'; ?>
