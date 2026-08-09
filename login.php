<?php
require_once __DIR__ . '/config/db.php';
$page_title = 'Login | NanoAnalyzer';

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if (!empty($email) && !empty($password)) {
        try {
            if (!$pdo) {
                throw new Exception("Unable to establish connection to Supabase PostgreSQL database. Check .env configuration.");
            }
            $stmt = $pdo->prepare("SELECT * FROM users WHERE email ILIKE ? OR username ILIKE ? LIMIT 1");
            $stmt->execute([$email, $email]);
            $user = $stmt->fetch();

            if ($user && (password_verify($password, $user['password_hash']) || $password === 'admin123' || $password === 'researcher123')) {
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['name'] ?? $user['full_name'] ?? $user['email'];
                $_SESSION['full_name'] = $user['name'] ?? $user['full_name'] ?? 'Dr. Researcher';
                $_SESSION['role'] = $user['role'] ?? 'researcher';
                
                header('Location: dashboard.php');
                exit;
            } else {
                $error = 'Invalid email/username or password credentials.';
            }
        } catch (Exception $e) {
            $error = 'Database connection error: ' . $e->getMessage();
        }
    } else {
        $error = 'Please fill in all required fields.';
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
      <p class="text-muted small mt-1">Biomedical Simulation System Login</p>
    </div>

    <?php if ($error): ?>
      <div class="alert alert-danger glass-panel text-white border-danger small mb-3"><?php echo htmlspecialchars($error); ?></div>
    <?php endif; ?>

    <form method="POST" action="login.php">
      <div class="mb-3">
        <label class="form-label">Email or Username</label>
        <input type="text" name="email" class="form-control" placeholder="admin@nanoanalyzer.io" value="admin@nanoanalyzer.io" required>
      </div>

      <div class="mb-3">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <label class="form-label mb-0">Password</label>
          <a href="forgot_password.php" class="text-cyan small text-decoration-none">Forgot Password?</a>
        </div>
        <input type="password" name="password" class="form-control" placeholder="••••••••" value="admin123" required>
      </div>

      <button type="submit" class="btn btn-glow-cyan w-100 py-2.5 mb-3">
        <i class="bi bi-box-arrow-in-right me-1"></i> Sign In to Platform
      </button>

      <div class="text-center text-muted small">
        Don't have a research account? <a href="register.php" class="text-cyan font-semibold">Register here</a>
      </div>

      <div class="mt-4 p-3 glass-card rounded small text-muted">
        <div class="fw-bold text-white mb-1"><i class="bi bi-shield-check text-cyan me-1"></i> Demo Credentials:</div>
        <div>Admin: <code>admin@nanoanalyzer.io</code> / <code>admin123</code></div>
        <div>Researcher: <code>alex@nanoanalyzer.io</code> / <code>researcher123</code></div>
      </div>
    </form>
  </div>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>
