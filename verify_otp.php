<?php
require_once __DIR__ . '/config/db.php';
$page_title = 'Verify OTP Code | NanoAnalyzer';

$email = $_SESSION['reset_email'] ?? '';
$demo_otp = $_SESSION['demo_otp'] ?? '123456';
$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $otp_input = trim($_POST['otp_code'] ?? '');
    $new_password = trim($_POST['new_password'] ?? '');

    if (!empty($otp_input) && !empty($new_password)) {
        try {
            if (!($pdo instanceof PDO)) {
                throw new Exception("Unable to establish connection to Supabase PostgreSQL database.");
            }
            $stmt = $pdo->prepare("SELECT * FROM otp_codes WHERE email ILIKE ? AND (code = ? OR otp_code = ?) AND (used = false OR used IS NULL) AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1");
            $stmt->execute([$email, $otp_input, $otp_input]);
            $row = $stmt->fetch();

            if ($row || $otp_input === strval($demo_otp)) {
                // Update password
                $new_hash = password_hash($new_password, PASSWORD_BCRYPT);
                $update_user = $pdo->prepare("UPDATE users SET password_hash = ? WHERE email ILIKE ?");
                $update_user->execute([$new_hash, $email]);

                // Mark OTP used
                if ($row) {
                    $pdo->prepare("UPDATE otp_codes SET used = true WHERE id = ?")->execute([$row['id']]);
                }

                $success = 'Password reset successfully! You can now log in with your new password.';
            } else {
                $error = 'Invalid or expired OTP code.';
            }
        } catch (Throwable $e) {
            $error = $e->getMessage();
        }
    } else {
        $error = 'Please enter both OTP code and new password.';
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
      <h5 class="text-white mt-2">Verify OTP & Reset Password</h5>
      <p class="text-muted small">Email: <strong><?php echo htmlspecialchars($email ?: 'researcher@nanoanalyzer.io'); ?></strong></p>
    </div>

    <?php if ($demo_otp): ?>
      <div class="alert alert-info glass-panel border-info small text-white mb-3">
        <i class="bi bi-info-circle me-1"></i> Demo Mode OTP Code: <strong><?php echo $demo_otp; ?></strong>
      </div>
    <?php endif; ?>

    <?php if ($error): ?>
      <div class="alert alert-danger glass-panel text-white border-danger small mb-3"><?php echo htmlspecialchars($error); ?></div>
    <?php endif; ?>

    <?php if ($success): ?>
      <div class="alert alert-success glass-panel text-white border-success small mb-3"><?php echo htmlspecialchars($success); ?></div>
      <a href="login.php" class="btn btn-glow-cyan w-100 py-2.5">Proceed to Login</a>
    <?php else: ?>
      <form method="POST" action="verify_otp.php">
        <div class="mb-3">
          <label class="form-label">6-Digit OTP Code</label>
          <input type="text" name="otp_code" class="form-control text-center fs-4 letter-spacing-2" placeholder="123456" maxlength="6" required>
        </div>

        <div class="mb-3">
          <label class="form-label">New Password</label>
          <input type="password" name="new_password" class="form-control" placeholder="••••••••" required>
        </div>

        <button type="submit" class="btn btn-glow-primary w-100 py-2.5 mb-3">
          <i class="bi bi-check-circle-fill me-1"></i> Confirm Password Reset
        </button>

        <div class="text-center text-muted small">
          Back to <a href="login.php" class="text-cyan font-semibold">Sign In</a>
        </div>
      </form>
    <?php endif; ?>
  </div>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>
