<?php
require_once __DIR__ . '/config/db.php';
$page_title = 'Password Recovery | NanoAnalyzer';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    if (!empty($email)) {
        try {
            if (!($pdo instanceof PDO)) {
                $db_err = get_db_error();
                throw new Exception("Unable to establish connection to Supabase PostgreSQL database. " . ($db_err ? "Details: {$db_err}" : "Please check Render environment variables."));
            }
            $stmt = $pdo->prepare("SELECT id, email, name, full_name FROM users WHERE email ILIKE ? LIMIT 1");
            $stmt->execute([$email]);
            $user = $stmt->fetch();
            if ($user) {
                $otp = sprintf('%06d', mt_rand(100000, 999999));
                $expires = date('Y-m-d H:i:s', strtotime('+15 minutes'));

                // Store in database otp_codes table
                $stmt_otp = $pdo->prepare("INSERT INTO otp_codes (user_id, email, code, otp_code, expires_at, used) VALUES (?, ?, ?, ?, ?, false)");
                $stmt_otp->execute([$user['id'], $email, strval($otp), strval($otp), $expires]);

                // Store in session for on-screen verification
                $_SESSION['reset_email'] = $email;
                $_SESSION['reset_user_id'] = $user['id'];
                $_SESSION['otp_code'] = $otp;
                $_SESSION['otp_expires'] = time() + (15 * 60);

                header('Location: verify_otp.php');
                exit;
            } else {
                $error = 'No registered account found with that email address.';
            }
        } catch (Throwable $e) {
            $error = 'Unable to process password recovery request. Please try again.';
        }
    } else {
        $error = 'Please enter your registered email address.';
    }
}

include __DIR__ . '/includes/header.php';
?>

<div class="container d-flex align-items-center justify-content-center min-vh-100 py-5">
  <div class="glass-panel p-4 p-md-5" style="width: 100%; max-width: 440px;">
    <div class="text-center mb-4">
      <a href="index.php" class="text-decoration-none text-white brand-font fw-bold fs-3 d-inline-flex align-items-center gap-2">
        <i class="bi bi-virus text-cyan"></i> Nano<span class="text-cyan">Analyzer</span>
      </a>
      <h5 class="text-white mt-2">Password Recovery</h5>
      <p class="text-muted small">Enter your registered email address to receive your 6-digit verification code.</p>
    </div>

    <?php if ($error): ?>
      <div class="alert alert-danger glass-panel text-white border-danger small mb-3"><?php echo htmlspecialchars($error); ?></div>
    <?php endif; ?>

    <form method="POST" action="forgot_password.php">
      <div class="mb-3">
        <label class="form-label">Email Address</label>
        <input type="email" name="email" class="form-control" placeholder="Enter your registered email address" required autofocus>
      </div>

      <button type="submit" class="btn btn-glow-cyan w-100 py-2.5 mb-3">
        <i class="bi bi-shield-check me-1"></i> Continue to Verification
      </button>

      <div class="text-center text-muted small">
        Remembered password? <a href="login.php" class="text-cyan font-semibold">Back to Login</a>
      </div>
    </form>
  </div>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>
