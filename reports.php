<?php
require_once __DIR__ . '/config/db.php';
require_login();

$page_title = 'Reports Manager | NanoAnalyzer';
$user_id = get_current_user_id();

try {
    $stmt = $pdo->prepare("SELECT * FROM predictions WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$user_id]);
    $reports = $stmt->fetchAll();
} catch (PDOException $e) {
    $reports = [];
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
          <h2 class="text-white fw-bold mb-1">Analytical PDF Reports Center</h2>
          <p class="text-muted mb-0">Generate clinical and publication-ready simulation reports.</p>
        </div>
        <button onclick="window.print()" class="btn btn-glow-cyan"><i class="bi bi-printer-fill me-1"></i> Quick Print View</button>
      </div>

      <div class="row g-4">
        <?php if (count($reports) > 0): ?>
          <?php foreach ($reports as $rep): ?>
            <div class="col-md-6 col-lg-4">
              <div class="glass-panel p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="badge badge-tech cyan">PDF Report</span>
                    <small class="text-muted"><?php echo date('M d, Y', strtotime($rep['created_at'])); ?></small>
                  </div>
                  <h5 class="text-white fw-bold mb-2"><?php echo htmlspecialchars($rep['analysis_name']); ?></h5>
                  <div class="glass-card p-2 text-muted small mb-3">
                    <div>Material: <strong class="text-white"><?php echo htmlspecialchars($rep['core_material']); ?></strong></div>
                    <div>Predicted Uptake: <strong class="text-emerald"><?php echo $rep['predicted_uptake_percent']; ?>%</strong></div>
                    <div>Toxicity Score: <strong class="text-rose"><?php echo $rep['predicted_toxicity_index']; ?></strong></div>
                  </div>
                </div>
                <div class="d-flex gap-2">
                  <a href="results.php?id=<?php echo $rep['id']; ?>" class="btn btn-glow-cyan btn-sm flex-fill text-center"><i class="bi bi-file-earmark-pdf me-1"></i> Open & Export PDF</a>
                </div>
              </div>
            </div>
          <?php endforeach; ?>
        <?php else: ?>
          <div class="col-12"><div class="glass-panel p-4 text-center text-muted">No simulation reports available. Run a simulation first!</div></div>
        <?php endif; ?>
      </div>

    </div>
  </div>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>
