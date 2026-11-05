<?php
require_once __DIR__ . '/config/db.php';
$page_title = 'Register Account | NanoAnalyzer';

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $full_name = trim($_POST['full_name'] ?? '');
    $username = trim($_POST['username'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $institution = trim($_POST['institution'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if (!empty($full_name) && !empty($email) && !empty($password)) {
        if (preg_match('/[A-Z]/', $email)) {
            $error = 'Email address must be in lowercase.';
        } else {
            try {
                if (!($pdo instanceof PDO)) {
                    $db_err = get_db_error();
                    throw new Exception("Unable to establish connection to Supabase PostgreSQL database. " . ($db_err ? "Details: {$db_err}" : "Please check Render environment variables."));
                }
                // Check existing email
                $check = $pdo->prepare("SELECT id FROM users WHERE email ILIKE ?");
                $check->execute([$email]);
                if ($check->fetch()) {
                    $error = 'Email address is already registered.';
                } else {
                    $hash = password_hash($password, PASSWORD_BCRYPT);
                    $uuid = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
                        mt_rand(0, 0xffff),
                        mt_rand(0, 0x0fff) | 0x4000,
                        mt_rand(0, 0x3fff) | 0x8000,
                        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
                    );
                    
                    $stmt = $pdo->prepare("INSERT INTO users (id, name, full_name, username, email, password_hash, institution, role) VALUES (?, ?, ?, ?, ?, ?, ?, 'researcher')");
                    $stmt->execute([$uuid, $full_name, $full_name, $username, $email, $hash, $institution]);
                    
                    $_SESSION['user_id'] = $uuid;
                    $_SESSION['username'] = $username ?: $full_name;
                    $_SESSION['full_name'] = $full_name;
                    $_SESSION['role'] = 'researcher';

                    header('Location: dashboard.php');
                    exit;
                }
            } catch (Throwable $e) {
                $error = 'Registration error: ' . $e->getMessage();
            }
        }
    } else {
        $error = 'Please fill out all required fields.';
    }
}

include __DIR__ . '/includes/header.php';
?>

<div class="container d-flex align-items-center justify-content-center min-vh-100 py-5">
  <div class="glass-panel p-4 p-md-5" style="width: 100%; max-width: 480px;">
    <div class="text-center mb-4">
      <a href="index.php" class="text-decoration-none text-white brand-font fw-bold fs-3 d-inline-flex align-items-center gap-2">
        <i class="bi bi-virus text-cyan"></i> Nano<span class="text-cyan">Analyzer</span>
      </a>
      <p class="text-muted small mt-1">Create Researcher Account</p>
    </div>

    <div id="emailJsError" class="alert alert-danger glass-panel text-white border-danger small mb-3" style="display: none;">Email address must be in lowercase.</div>

    <?php if ($error): ?>
      <div class="alert alert-danger glass-panel text-white border-danger small mb-3"><?php echo htmlspecialchars($error); ?></div>
    <?php endif; ?>

    <form method="POST" action="register.php" id="registerForm">
      <div class="mb-3">
        <label class="form-label">Full Name</label>
        <input type="text" name="full_name" class="form-control" placeholder="Enter your full name" required>
      </div>

      <div class="row g-2 mb-3">
        <div class="col-md-6">
          <label class="form-label">Username</label>
          <input type="text" name="username" class="form-control" placeholder="Choose a username" required>
        </div>
        <div class="col-md-6">
          <label class="form-label">Institution / Lab</label>
          <input type="text" name="institution" class="form-control" placeholder="Institution / Laboratory" required>
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">Email Address</label>
        <input type="email" name="email" class="form-control" placeholder="Enter your email address" required pattern="^[^A-Z]+$" title="Email address must be in lowercase.">
      </div>

      <div class="mb-3">
        <label class="form-label">Password</label>
        <input type="password" name="password" class="form-control" placeholder="Enter a secure password" required>
      </div>

      <button type="submit" class="btn btn-glow-primary w-100 py-2.5 mb-3">
        <i class="bi bi-person-plus-fill me-1"></i> Register Account
      </button>

      <div class="text-center text-muted small">
        Already have an account? <a href="login.php" class="text-cyan font-semibold">Sign In</a>
      </div>
    </form>
  </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  const registerForm = document.getElementById('registerForm');
  const emailInput = registerForm ? registerForm.querySelector('input[name="email"]') : null;
  const emailJsError = document.getElementById('emailJsError');

  if (registerForm && emailInput) {
    registerForm.addEventListener('submit', function(e) {
      const emailVal = emailInput.value.trim();
      if (/[A-Z]/.test(emailVal)) {
        e.preventDefault();
        e.stopPropagation();
        if (emailJsError) {
          emailJsError.style.display = 'block';
        }
        emailInput.focus();
        return false;
      } else {
        if (emailJsError) {
          emailJsError.style.display = 'none';
        }
      }
    });

    emailInput.addEventListener('input', function() {
      if (/[A-Z]/.test(this.value.trim())) {
        if (emailJsError) {
          emailJsError.style.display = 'block';
        }
      } else {
        if (emailJsError) {
          emailJsError.style.display = 'none';
        }
      }
    });
  }
});
</script>

<?php include __DIR__ . '/includes/footer.php'; ?>
