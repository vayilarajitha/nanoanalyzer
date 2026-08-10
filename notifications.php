<?php
require_once __DIR__ . '/config/db.php';
require_login();

$page_title = 'Notifications Center | NanoAnalyzer';
$user_id = get_current_user_id();

$notifications = [];
if ($pdo instanceof PDO) {
    try {
        $stmt = $pdo->prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$user_id]);
        $notifications = $stmt->fetchAll() ?: [];
    } catch (Throwable $e) {
        $notifications = [];
    }
}

include __DIR__ . '/includes/header.php';
?>

<div id="wrapper">
  <?php include __DIR__ . '/includes/sidebar.php'; ?>

  <div id="page-content-wrapper">
    <?php include __DIR__ . '/includes/navbar.php'; ?>

    <div class="container-fluid p-4">
      <div class="mb-4">
        <h2 class="text-white fw-bold mb-1">Notifications Center</h2>
        <p class="text-muted mb-0">System alerts, simulation updates, and account messages.</p>
      </div>

      <div class="glass-panel p-4">
        <?php if (count($notifications) > 0): ?>
          <div class="list-group list-group-flush">
            <?php foreach ($notifications as $note): ?>
              <div class="list-group-item bg-transparent text-white border-secondary p-3">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <h6 class="fw-bold mb-0 text-cyan"><i class="bi bi-info-circle me-1"></i> <?php echo htmlspecialchars($note['title']); ?></h6>
                  <small class="text-muted"><?php echo date('Y-m-d H:i', strtotime($note['created_at'])); ?></small>
                </div>
                <p class="text-muted small mb-0"><?php echo htmlspecialchars($note['message']); ?></p>
              </div>
            <?php endforeach; ?>
          </div>
        <?php else: ?>
          <div class="text-center text-muted py-4">No notifications present.</div>
        <?php endif; ?>
      </div>

    </div>
  </div>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>
