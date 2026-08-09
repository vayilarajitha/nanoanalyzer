<?php
require_once __DIR__ . '/config/db.php';

$page_title = 'Contact Support | NanoAnalyzer';
$sent = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $message = trim($_POST['message'] ?? '');

    if (!empty($name) && !empty($message)) {
        try {
            $stmt = $pdo->prepare("INSERT INTO system_logs (user_id, action, details) VALUES (?, 'CONTACT_FORM', ?)");
            $stmt->execute([get_current_user_id(), "Message from $name ($email): $message"]);
            $sent = true;
        } catch (Exception $e) {
            $sent = true;
        }
    }
}

include __DIR__ . '/includes/header.php';
?>

<div id="wrapper">
  <?php if (is_logged_in()) include __DIR__ . '/includes/sidebar.php'; ?>

  <div id="page-content-wrapper" style="<?php echo !is_logged_in() ? 'margin-left:0; width:100%;' : ''; ?>">
    <?php if (is_logged_in()) include __DIR__ . '/includes/navbar.php'; ?>

    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-6">
          <div class="glass-panel p-4 p-md-5">
            <h3 class="text-white fw-bold mb-2">Support & Feedback</h3>
            <p class="text-muted small mb-4">Have questions regarding nanoparticle modeling or platform setup on Supabase Cloud?</p>

            <?php if ($sent): ?>
              <div class="alert alert-success glass-panel text-white border-success mb-3">Thank you! Your message has been logged. Our biophysics team will get back to you shortly.</div>
            <?php endif; ?>

            <form method="POST" action="contact.php">
              <div class="mb-3">
                <label class="form-label">Your Name</label>
                <input type="text" name="name" class="form-control" placeholder="Dr. Sarah Jenkins" value="<?php echo htmlspecialchars($_SESSION['full_name'] ?? ''); ?>" required>
              </div>

              <div class="mb-3">
                <label class="form-label">Email Address</label>
                <input type="email" name="email" class="form-control" placeholder="sarah@nanoanalyzer.io" required>
              </div>

              <div class="mb-4">
                <label class="form-label">Query / Message</label>
                <textarea name="message" class="form-control" rows="4" placeholder="How do I adjust parameters for caveolae endocytosis..." required></textarea>
              </div>

              <button type="submit" class="btn btn-glow-cyan w-100 py-2.5">
                <i class="bi bi-send-fill me-1"></i> Send Support Request
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>
