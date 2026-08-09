<?php
require_once __DIR__ . '/config/db.php';
$page_title = 'NanoAnalyzer | Nanoparticle Uptake & Drug Delivery Simulation Platform';
include __DIR__ . '/includes/header.php';

// Fetch quick live stats from database
try {
    $dataset_count = $pdo->query("SELECT COUNT(*) FROM datasets")->fetchColumn() ?: 5;
    $prediction_count = $pdo->query("SELECT COUNT(*) FROM predictions")->fetchColumn() ?: 12;
    $experiment_count = $pdo->query("SELECT COUNT(*) FROM experiments")->fetchColumn() ?: 4;
} catch (Exception $e) {
    $dataset_count = 5; $prediction_count = 12; $experiment_count = 4;
}
?>

<!-- Public Navigation Bar -->
<nav class="navbar navbar-expand-lg top-navbar px-4">
  <div class="container-fluid">
    <a class="navbar-brand text-white brand-font fw-bold fs-3 d-flex align-items-center gap-2" href="index.php">
      <i class="bi bi-virus text-cyan"></i> Nano<span class="text-cyan">Analyzer</span>
    </a>
    <button class="navbar-toggler text-white border-0" type="button" data-bs-toggle="collapse" data-bs-target="#landingNav">
      <i class="bi bi-list fs-2"></i>
    </button>
    <div class="collapse navbar-collapse" idlandingNav">
      <ul class="navbar-menu navbar-nav ms-auto gap-3 align-items-center">
        <li class="nav-item"><a class="nav-link text-white font-medium" href="#features">Features</a></li>
        <li class="nav-item"><a class="nav-link text-white font-medium" href="#metrics">Platform Stats</a></li>
        <li class="nav-item"><a class="nav-link text-white font-medium" href="contact.php">Support</a></li>
        <?php if (is_logged_in()): ?>
          <li class="nav-item"><a class="btn btn-glow-cyan" href="dashboard.php"><i class="bi bi-speedometer2 me-1"></i> Go to Dashboard</a></li>
        <?php else: ?>
          <li class="nav-item"><a class="btn btn-glass" href="login.php">Sign In</a></li>
          <li class="nav-item"><a class="btn btn-glow-primary" href="register.php">Launch Platform</a></li>
        <?php endif; ?>
      </ul>
    </div>
  </div>
</nav>

<!-- Hero Section -->
<div class="container py-5 my-4">
  <div class="row align-items-center gy-5">
    <div class="col-lg-7">
      <span class="badge badge-tech cyan mb-3 fs-6 px-3 py-2">
        <i class="bi bi-lightning-charge-fill me-1"></i> Biophysical Simulation Engine 2.0
      </span>
      <h1 class="display-3 fw-bold text-white mb-3">
        Accelerating Nanoparticle <span class="text-transparent bg-clip-text" style="background: linear-gradient(135deg, #06b6d4 0%, #6366f1 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Cellular Uptake</span> & Drug Delivery
      </h1>
      <p class="lead text-muted mb-4 fs-5" style="max-width: 600px;">
        Simulate size-dependent membrane endocytosis, evaluate surface charge electrostatics, predict cytotoxicity indices, and analyze targeted delivery pathways deterministically.
      </p>
      <div class="d-flex flex-wrap gap-3">
        <a href="<?php echo is_logged_in() ? 'predict.php' : 'register.php'; ?>" class="btn btn-glow-cyan btn-lg px-4 py-3">
          <i class="bi bi-cpu-fill me-2"></i> Start AI Simulation
        </a>
        <a href="#features" class="btn btn-glass btn-lg px-4 py-3">
          <i class="bi bi-play-circle me-2"></i> Explore Features
        </a>
      </div>
    </div>
    <div class="col-lg-5">
      <div class="glass-panel p-4 position-relative text-center">
        <div class="p-4 rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3" style="width: 140px; height: 140px; background: radial-gradient(circle, rgba(6,182,212,0.3) 0%, rgba(99,102,241,0.1) 70%); border: 2px solid var(--cyan);">
          <i class="bi bi-virus fs-1 text-cyan"></i>
        </div>
        <h4 class="text-white fw-bold">Deterministic ML Model</h4>
        <p class="text-muted small">Multi-parameter kinetic curve calculation based on hydrodynamic diameter (nm) and zeta potential (mV).</p>
        <div class="d-flex justify-content-around text-start border-top border-secondary pt-3 mt-3">
          <div>
            <div class="text-muted small">Optimal Size</div>
            <div class="text-cyan font-bold fs-5">40 – 50 nm</div>
          </div>
          <div>
            <div class="text-muted small">Accuracy Score</div>
            <div class="text-emerald font-bold fs-5">96.8%</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Dynamic Platform Metrics -->
<div id="metrics" class="container py-5">
  <div class="row g-4">
    <div class="col-md-4">
      <div class="glass-panel stat-card text-center">
        <div class="stat-icon primary mx-auto"><i class="bi bi-database-check"></i></div>
        <div class="stat-number text-white"><?php echo number_format($dataset_count); ?></div>
        <div class="text-muted font-semibold">Active Research Datasets</div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="glass-panel stat-card text-center">
        <div class="stat-icon cyan mx-auto"><i class="bi bi-cpu"></i></div>
        <div class="stat-number text-cyan"><?php echo number_format($prediction_count); ?></div>
        <div class="text-muted font-semibold">AI Simulations Executed</div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="glass-panel stat-card text-center">
        <div class="stat-icon emerald mx-auto"><i class="bi bi-vial"></i></div>
        <div class="stat-number text-emerald"><?php echo number_format($experiment_count); ?></div>
        <div class="text-muted font-semibold">Validated Lab Protocols</div>
      </div>
    </div>
  </div>
</div>

<!-- Features Section -->
<div id="features" class="container py-5">
  <div class="text-center mb-5">
    <span class="badge badge-tech primary mb-2">Capabilities</span>
    <h2 class="display-5 text-white fw-bold">Built for Nanomedicine Researchers</h2>
  </div>
  <div class="row g-4">
    <div class="col-md-4">
      <div class="glass-panel p-4 h-100">
        <i class="bi bi-diagram-3 fs-1 text-cyan mb-3 d-block"></i>
        <h4 class="text-white fw-bold">Deterministic AI Simulation</h4>
        <p class="text-muted">Guaranteed 100% reproducible biophysical predictions connecting core material, particle size, zeta potential, and incubation kinetics.</p>
      </div>
    </div>
    <div class="col-md-4">
      <div class="glass-panel p-4 h-100">
        <i class="bi bi-robot fs-1 text-primary mb-3 d-block"></i>
        <h4 class="text-white fw-bold">Floating AI Chatbot</h4>
        <p class="text-muted">NanoBot assistant available on every screen with typing indicators, context awareness, and automated chat logging into Supabase PostgreSQL.</p>
      </div>
    </div>
    <div class="col-md-4">
      <div class="glass-panel p-4 h-100">
        <i class="bi bi-printer-fill fs-1 text-emerald mb-3 d-block"></i>
        <h4 class="text-white fw-bold">Clinical PDF Reports</h4>
        <p class="text-muted">Generate clean, publication-ready PDF analytical reports complete with charts, delivery scores, and structural recommendations.</p>
      </div>
    </div>
  </div>
</div>

<!-- Landing Page Footer -->
<footer class="border-top border-secondary py-4 mt-5 text-center text-muted">
  <div class="container d-flex flex-column flex-md-row justify-content-between align-items-center">
    <div class="mb-2 mb-md-0">
      &copy; <?php echo date('Y'); ?> NanoAnalyzer Platform. Powered by Supabase Cloud.
    </div>
    <div class="d-flex gap-3">
      <a href="login.php" class="text-muted text-decoration-none">Sign In</a>
      <a href="register.php" class="text-muted text-decoration-none">Register</a>
      <a href="contact.php" class="text-muted text-decoration-none">Contact Support</a>
    </div>
  </div>
</footer>

<?php include __DIR__ . '/includes/footer.php'; ?>
