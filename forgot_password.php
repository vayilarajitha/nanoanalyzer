<?php
require_once __DIR__ . '/config/db.php';
$page_title = 'Forgot Password | NanoAnalyzer';

$msg = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    if (!empty($email)) {
        try {
            if (!($pdo instanceof PDO)) {
                throw new Exception("Unable to establish connection to Supabase PostgreSQL database.");
            }
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email ILIKE ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch();
            if ($user) {
                $otp = rand(100000, 999999);
                $expires = date('Y-m-d H:i:s', strtotime('+15 minutes'));

                $stmt_otp = $pdo->prepare("INSERT INTO otp_codes (user_id, email, code, otp_code, expires_at) VALUES (?, ?, ?, ?, ?)");
                $stmt_otp->execute([$user['id'], $email, strval($otp), strval($otp), $expires]);

                $_SESSION['reset_email'] = $email;
                $_SESSION['demo_otp'] = $otp;

                header('Location: verify_otp.php');
                exit;
            } else {
                $error = 'Email address not found in our records.';
            }
        } catch (Throwable $e) {
            $error = $e->getMessage();
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
      <p class="text-muted small">Enter your email address to receive a 6-digit OTP code.</p>
    </div>

    <?php if ($error): ?>
      <div class="alert alert-danger glass-panel text-white border-danger small mb-3"><?php echo htmlspecialchars($error); ?></div>
    <?php endif; ?>

    <form method="POST" action="forgot_password.php">
      <div class="mb-3">
        <label class="form-label">Registered Email</label>
        <input type="email" name="email" class="form-control" placeholder="researcher@nanoanalyzer.io" required>
      </div>

      <button type="submit" class="btn btn-glow-cyan w-100 py-2.5 mb-3">
        <i class="bi bi-key-fill me-1"></i> Send OTP Verification Code
      </button>

      <div class="text-center text-muted small">
        Remembered password? <a href="login.php" class="text-cyan font-semibold">Back to Login</a>
      </div>
    </form>
  </div>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>
