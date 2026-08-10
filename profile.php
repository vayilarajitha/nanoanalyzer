<?php
require_once __DIR__ . '/config/db.php';
require_login();

$page_title = 'Researcher Profile | NanoAnalyzer';
$user_id = get_current_user_id();

$user = null;
if ($pdo instanceof PDO) {
    try {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ? LIMIT 1");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch() ?: null;
    } catch (Throwable $e) {
        $user = null;
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
        <h2 class="text-white fw-bold mb-1">Researcher Profile</h2>
        <p class="text-muted mb-0">Manage your institution details and account information.</p>
      </div>

      <div class="row g-4">
        <div class="col-lg-4">
          <div class="glass-panel p-4 text-center">
            <div class="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style="width: 90px; height: 90px; background: linear-gradient(135deg, #06b6d4 0%, #6366f1 100%);">
              <i class="bi bi-person-fill text-white fs-1"></i>
            </div>
            <h4 class="text-white fw-bold mb-1"><?php echo htmlspecialchars($user['full_name'] ?? 'Dr. Researcher'); ?></h4>
            <p class="text-cyan small mb-2"><?php echo htmlspecialchars($user['institution'] ?? 'Biomedical Lab'); ?></p>
            <span class="badge badge-tech primary"><?php echo strtoupper($user['role'] ?? 'RESEARCHER'); ?></span>
          </div>
        </div>

        <div class="col-lg-8">
          <div class="glass-panel p-4">
            <h5 class="text-white fw-bold mb-3">Edit Details</h5>
            <form id="profileForm">
              <div class="mb-3">
                <label class="form-label">Full Name</label>
                <input type="text" name="full_name" class="form-control" value="<?php echo htmlspecialchars($user['full_name'] ?? ''); ?>" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Institution / Organization</label>
                <input type="text" name="institution" class="form-control" value="<?php echo htmlspecialchars($user['institution'] ?? ''); ?>" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Biography / Research Scope</label>
                <textarea name="bio" class="form-control" rows="3"><?php echo htmlspecialchars($user['bio'] ?? ''); ?></textarea>
              </div>
              <button type="submit" class="btn btn-glow-cyan py-2.5 px-4"><i class="bi bi-save me-1"></i> Update Profile</button>
            </form>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>

<script>
document.getElementById('profileForm').addEventListener('submit', function(e) {
  e.preventDefault();
  fetch('ajax/profile_handler.php', {
    method: 'POST',
    body: new FormData(this)
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === 'success') {
      showToast(data.message, 'success');
      setTimeout(() => location.reload(), 800);
    }
  });
});
</script>

<?php include __DIR__ . '/includes/footer.php'; ?>
