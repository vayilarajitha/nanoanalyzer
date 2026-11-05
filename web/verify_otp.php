<?php
require_once __DIR__ . '/config/db.php';
$page_title = 'Verification Code & Password Reset | NanoAnalyzer';

$email = $_SESSION['reset_email'] ?? '';
$display_otp = $_SESSION['otp_code'] ?? '';
$otp_expires = $_SESSION['otp_expires'] ?? 0;

if (empty($email) || empty($display_otp)) {
    header('Location: forgot_password.php');
    exit;
}

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $otp_input = trim($_POST['otp_code'] ?? '');
    $new_password = trim($_POST['new_password'] ?? '');
    $confirm_password = trim($_POST['confirm_password'] ?? '');

    if (empty($otp_input) || empty($new_password) || empty($confirm_password)) {
        $error = 'Please fill in all required fields.';
    } elseif ($new_password !== $confirm_password) {
        $error = 'New password and confirmation password do not match.';
    } elseif (strlen($new_password) < 6) {
        $error = 'Password must be at least 6 characters long.';
    } else {
        try {
            if (!($pdo instanceof PDO)) {
                $db_err = get_db_error();
                throw new Exception("Unable to establish connection to Supabase PostgreSQL database. " . ($db_err ? "Details: {$db_err}" : "Please check Render environment variables."));
            }

            // Check database otp_codes table
            $stmt = $pdo->prepare("SELECT id FROM otp_codes WHERE email ILIKE ? AND (code = ? OR otp_code = ?) AND (used = false OR used IS NULL) AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1");
            $stmt->execute([$email, $otp_input, $otp_input]);
            $row = $stmt->fetch();

            $is_session_valid = ($otp_input === strval($display_otp) && time() <= $otp_expires);

            if ($row || $is_session_valid) {
                // Update password hash in users table
                $new_hash = password_hash($new_password, PASSWORD_BCRYPT);
                $update_user = $pdo->prepare("UPDATE users SET password_hash = ? WHERE email ILIKE ?");
                $update_user->execute([$new_hash, $email]);

                // Invalidate/mark OTP used in database
                $update_otp = $pdo->prepare("UPDATE otp_codes SET used = true WHERE email ILIKE ? AND (code = ? OR otp_code = ?)");
                $update_otp->execute([$email, $otp_input, $otp_input]);

                // Invalidate session keys immediately
                unset($_SESSION['otp_code'], $_SESSION['reset_email'], $_SESSION['reset_user_id'], $_SESSION['otp_expires']);

                // Set flash message and redirect to login
                $_SESSION['flash_success'] = 'Password changed successfully. You can now log in.';
                header('Location: login.php');
                exit;
            } else {
                $error = 'Invalid or expired verification code. Please check the code and try again.';
            }
        } catch (Throwable $e) {
            $error = 'Password reset could not be completed. Please try again.';
        }
    }
}

include __DIR__ . '/includes/header.php';
?>

<div class="container d-flex align-items-center justify-content-center min-vh-100 py-5">
  <div class="glass-panel p-4 p-md-5" style="width: 100%; max-width: 460px;">
    <div class="text-center mb-4">
      <a href="index.php" class="text-decoration-none text-white brand-font fw-bold fs-3 d-inline-flex align-items-center gap-2">
        <i class="bi bi-virus text-cyan"></i> Nano<span class="text-cyan">Analyzer</span>
      </a>
      <h5 class="text-white mt-2">Verification Code & Password Reset</h5>
      <p class="text-muted small">Enter the 6-digit verification code below to set your new password.</p>
    </div>

    <!-- Clean, On-Screen Verification Code Display Section -->
    <div class="p-3 mb-4 rounded-3 text-center" style="background: rgba(6, 182, 212, 0.08); border: 1px solid rgba(6, 182, 212, 0.25);">
      <div class="text-muted small mb-1 fw-semibold"><i class="bi bi-shield-lock text-cyan me-1"></i> Verification Code</div>
      <div class="fs-1 fw-bold font-monospace text-cyan letter-spacing-3 my-1 user-select-all"><?php echo htmlspecialchars($display_otp); ?></div>
      <div class="text-muted small">Account: <strong><?php echo htmlspecialchars($email); ?></strong> (Valid for 15 minutes)</div>
    </div>

    <?php if ($error): ?>
      <div class="alert alert-danger glass-panel text-white border-danger small mb-3"><?php echo htmlspecialchars($error); ?></div>
    <?php endif; ?>

    <form method="POST" action="verify_otp.php">
      <div class="mb-3">
        <label class="form-label">Verification Code</label>
        <input type="text" name="otp_code" class="form-control text-center fs-4 font-monospace letter-spacing-2" placeholder="000000" maxlength="6" value="<?php echo htmlspecialchars($display_otp); ?>" required autofocus>
      </div>

      <div class="mb-3">
        <label class="form-label">New Password</label>
        <input type="password" name="new_password" class="form-control" placeholder="Enter new password (min. 6 characters)" minlength="6" required>
      </div>

      <div class="mb-3">
        <label class="form-label">Confirm New Password</label>
        <input type="password" name="confirm_password" class="form-control" placeholder="Confirm your new password" minlength="6" required>
      </div>

      <button type="submit" class="btn btn-glow-primary w-100 py-2.5 mb-3">
        <i class="bi bi-check-circle-fill me-1"></i> Change Password
      </button>

      <div class="text-center text-muted small">
        <a href="forgot_password.php" class="text-muted text-decoration-none">Generate New Code</a> &bull; <a href="login.php" class="text-cyan font-semibold">Back to Login</a>
      </div>
    </form>
  </div>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>
