<?php
require_once __DIR__ . '/config/db.php';
require_login();

$page_title = 'Researcher Profile | NanoAnalyzer';
$user_id = get_current_user_id();

$flash_success = $_SESSION['flash_success'] ?? '';
$flash_error = $_SESSION['flash_error'] ?? '';
unset($_SESSION['flash_success'], $_SESSION['flash_error']);

// Handle Traditional Server-Side Profile Update (Non-API)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $full_name = trim($_POST['full_name'] ?? '');
    $institution = trim($_POST['institution'] ?? '');
    $bio = trim($_POST['bio'] ?? '');

    if (!empty($full_name) && !empty($institution)) {
        if ($pdo instanceof PDO && !empty($user_id)) {
            try {
                $stmt = $pdo->prepare("UPDATE users SET name = ?, full_name = ?, institution = ?, bio = ? WHERE id = ?");
                $stmt->execute([$full_name, $full_name, $institution, $bio, $user_id]);
                $_SESSION['full_name'] = $full_name;
                $_SESSION['flash_success'] = 'Profile details updated successfully.';
            } catch (Throwable $e) {
                $_SESSION['flash_error'] = 'Failed to update profile: ' . $e->getMessage();
            }
        }
    } else {
        $_SESSION['flash_error'] = 'Full Name and Institution cannot be empty.';
    }
    header('Location: profile.php');
    exit;
}

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
            <form id="profileForm" method="POST" action="profile.php">
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

<?php include __DIR__ . '/includes/footer.php'; ?>
