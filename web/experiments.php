<?php
require_once __DIR__ . '/config/db.php';
require_login();

$page_title = 'Lab Experiments | NanoAnalyzer';
$user_id = get_current_user_id();

$flash_success = $_SESSION['flash_success'] ?? '';
$flash_error = $_SESSION['flash_error'] ?? '';
unset($_SESSION['flash_success'], $_SESSION['flash_error']);

// Handle Traditional Server-Side Form Submissions (Non-API)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'create') {
        $title = trim($_POST['title'] ?? '');
        $core_material = trim($_POST['core_material'] ?? $_POST['material'] ?? '');
        $np_type = trim($_POST['nanoparticle_type'] ?? $_POST['category'] ?? 'General');
        $size_nm = isset($_POST['particle_size_nm']) && $_POST['particle_size_nm'] !== '' ? floatval($_POST['particle_size_nm']) : (isset($_POST['particle_size']) && $_POST['particle_size'] !== '' ? floatval($_POST['particle_size']) : (isset($_POST['size_nm']) ? floatval($_POST['size_nm']) : 0));
        $target_cell = trim($_POST['target_cell_line'] ?? $_POST['cell_line'] ?? $_POST['cell_type'] ?? '');
        $desc = trim($_POST['description'] ?? '');

        if (!empty($title) && !empty($core_material) && !empty($target_cell)) {
            if ($pdo instanceof PDO) {
                try {
                    $uuid = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
                        mt_rand(0, 0xffff),
                        mt_rand(0, 0x0fff) | 0x4000,
                        mt_rand(0, 0x3fff) | 0x8000,
                        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
                    );
                    $stmt = $pdo->prepare("INSERT INTO experiments (id, user_id, title, description, nanoparticle_type, core_material, particle_size_nm, target_cell_line, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Planned')");
                    $stmt->execute([$uuid, $user_id, $title, $desc, $np_type, $core_material, $size_nm, $target_cell]);
                    $_SESSION['flash_success'] = 'Laboratory experiment protocol created successfully.';
                } catch (Throwable $e) {
                    $_SESSION['flash_error'] = 'Failed to create experiment protocol: ' . $e->getMessage();
                }
            }
        } else {
            $_SESSION['flash_error'] = 'Please fill out all required fields.';
        }
        header('Location: experiments.php');
        exit;
    } elseif ($action === 'update_status') {
        $id = trim($_POST['id'] ?? '');
        $status = trim($_POST['status'] ?? '');
        if ($pdo instanceof PDO && !empty($id) && !empty($status)) {
            try {
                $stmt = $pdo->prepare("UPDATE experiments SET status = ? WHERE id = ? AND user_id = ?");
                $stmt->execute([$status, $id, $user_id]);
                $_SESSION['flash_success'] = 'Experiment status updated to ' . htmlspecialchars($status) . '.';
            } catch (Throwable $e) {
                $_SESSION['flash_error'] = 'Failed to update experiment status.';
            }
        }
        header('Location: experiments.php');
        exit;
    } elseif ($action === 'delete') {
        $id = trim($_POST['id'] ?? '');
        if ($pdo instanceof PDO && !empty($id)) {
            try {
                $stmt = $pdo->prepare("DELETE FROM experiments WHERE id = ? AND user_id = ?");
                $stmt->execute([$id, $user_id]);
                $_SESSION['flash_success'] = 'Laboratory experiment removed successfully.';
            } catch (Throwable $e) {
                $_SESSION['flash_error'] = 'Failed to remove experiment.';
            }
        }
        header('Location: experiments.php');
        exit;
    }
}

$experiments = [];
if ($pdo instanceof PDO) {
    try {
        $stmt = $pdo->prepare("SELECT e.*, COALESCE(u.name, u.full_name) as full_name FROM experiments e LEFT JOIN users u ON e.user_id = u.id WHERE e.user_id = ? ORDER BY e.created_at DESC");
        $stmt->execute([$user_id]);
        $experiments = $stmt->fetchAll() ?: [];
    } catch (Throwable $e) {
        $experiments = [];
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
          <h2 class="text-white fw-bold mb-1">Laboratory Experiment Tracker</h2>
          <p class="text-muted mb-0">Track real in-vitro and in-vivo nanoparticle protocol validations in Supabase Cloud Database.</p>
        </div>
        <button class="btn btn-glow-cyan" data-bs-toggle="modal" data-bs-target="#addExpModal"><i class="bi bi-plus-lg me-1"></i> New Experiment</button>
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

      <div class="row g-4">
        <?php if (count($experiments) > 0): ?>
          <?php foreach ($experiments as $exp): ?>
            <div class="col-md-6 col-lg-4">
              <div class="glass-panel p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <span class="badge badge-tech <?php echo $exp['status'] === 'Completed' ? 'emerald' : ($exp['status'] === 'In Progress' ? 'cyan' : 'primary'); ?>">
                      <?php echo htmlspecialchars($exp['status']); ?>
                    </span>
                    <small class="text-muted font-mono"><?php echo format_app_datetime($exp['created_at']); ?></small>
                  </div>
                  <h5 class="text-white fw-bold mb-2"><?php echo htmlspecialchars($exp['title']); ?></h5>
                  <p class="text-muted small mb-3"><?php echo htmlspecialchars($exp['description'] ?: 'No detailed protocol description attached.'); ?></p>

                  <div class="glass-card mb-3 p-2 text-muted small">
                    <div>Material: <strong class="text-white"><?php echo htmlspecialchars($exp['core_material']); ?></strong></div>
                    <div>Particle Size: <strong class="text-cyan"><?php echo $exp['particle_size_nm']; ?> nm</strong></div>
                    <div>Target Cell Line: <strong class="text-white"><?php echo htmlspecialchars($exp['target_cell_line']); ?></strong></div>
                  </div>
                </div>

                <div class="d-flex justify-content-between align-items-center pt-3 border-top border-secondary">
                  <form method="POST" action="experiments.php" style="display:inline;">
                    <input type="hidden" name="action" value="update_status">
                    <input type="hidden" name="id" value="<?php echo htmlspecialchars($exp['id']); ?>">
                    <select name="status" onchange="this.form.submit()" class="form-select form-select-sm" style="width: auto;">
                      <option value="Planned" <?php echo $exp['status'] === 'Planned' ? 'selected' : ''; ?>>Planned</option>
                      <option value="In Progress" <?php echo $exp['status'] === 'In Progress' ? 'selected' : ''; ?>>In Progress</option>
                      <option value="Completed" <?php echo $exp['status'] === 'Completed' ? 'selected' : ''; ?>>Completed</option>
                      <option value="Archived" <?php echo $exp['status'] === 'Archived' ? 'selected' : ''; ?>>Archived</option>
                    </select>
                  </form>
                  <form method="POST" action="experiments.php" style="display:inline;" onsubmit="return confirm('Are you sure you want to delete this experiment?');">
                    <input type="hidden" name="action" value="delete">
                    <input type="hidden" name="id" value="<?php echo htmlspecialchars($exp['id']); ?>">
                    <button type="submit" class="btn btn-sm btn-glass text-danger"><i class="bi bi-trash"></i></button>
                  </form>
                </div>
              </div>
            </div>
          <?php endforeach; ?>
        <?php else: ?>
          <div class="col-12"><div class="glass-panel p-4 text-center text-muted">No lab experiments recorded yet.</div></div>
        <?php endif; ?>
      </div>
    </div>
  </div>
</div>

<!-- Add Experiment Modal -->
<div class="modal fade" id="addExpModal" tabindex="-1">
  <div class="modal-dialog">
    <div class="modal-content glass-panel text-white">
      <div class="modal-header border-secondary">
        <h5 class="modal-title fw-bold">New Laboratory Protocol</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>
      <form id="addExpForm" method="POST" action="experiments.php">
        <div class="modal-body">
          <input type="hidden" name="action" value="create">
          <div class="mb-3">
            <label class="form-label">Protocol Title</label>
            <input type="text" name="title" class="form-control" placeholder="e.g. Liposomal Paclitaxel HeLa Kinetic Study" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Core Material</label>
            <input type="text" name="core_material" class="form-control" placeholder="e.g. Gold (Au)" required>
          </div>
          <div class="row g-2 mb-3">
            <div class="col-6">
              <label class="form-label">Category</label>
              <input type="text" name="nanoparticle_type" class="form-control" placeholder="e.g. Polymeric" required>
            </div>
            <div class="col-6">
              <label class="form-label">Size (nm)</label>
              <input type="number" step="0.1" name="particle_size_nm" class="form-control" placeholder="e.g. 45.0" required>
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Target Cell Line</label>
            <input type="text" name="target_cell_line" class="form-control" placeholder="e.g. HeLa" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Protocol Description</label>
            <textarea name="description" class="form-control" rows="3" placeholder="Incubation time, dosing, and assay details..."></textarea>
          </div>
        </div>
        <div class="modal-footer border-secondary">
          <button type="button" class="btn btn-glass" data-bs-dismiss="modal">Cancel</button>
          <button type="submit" class="btn btn-glow-cyan">Create Experiment</button>
        </div>
      </form>
    </div>
  </div>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>
