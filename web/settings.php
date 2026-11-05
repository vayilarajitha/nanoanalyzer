<?php
require_once __DIR__ . '/config/db.php';
require_login();

$page_title = 'Settings & Preferences | NanoAnalyzer';
include __DIR__ . '/includes/header.php';
?>

<div id="wrapper">
  <?php include __DIR__ . '/includes/sidebar.php'; ?>

  <div id="page-content-wrapper">
    <?php include __DIR__ . '/includes/navbar.php'; ?>

    <div class="container-fluid p-4">
      <div class="mb-4">
        <h2 class="text-white fw-bold mb-1">Application Settings</h2>
        <p class="text-muted mb-0">Customize your simulation environment preferences.</p>
      </div>

      <div class="row g-4">
        <div class="col-lg-8">
          <div class="glass-panel p-4">
            <h5 class="text-white fw-bold mb-3">System Preferences</h5>
            
            <div class="d-flex align-items-center justify-content-between py-3 border-bottom border-secondary">
              <div>
                <div class="text-white font-semibold">Deterministic Algorithm Enforcement</div>
                <div class="text-muted small">Guarantee same input parameters yield exact same uptake calculations</div>
              </div>
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" checked disabled>
              </div>
            </div>

            <div class="d-flex align-items-center justify-content-between py-3 border-bottom border-secondary">
              <div>
                <div class="text-white font-semibold">Floating AI Chatbot Persistence</div>
                <div class="text-muted small">Log all chat conversations into Supabase PostgreSQL chatbot_logs table</div>
              </div>
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" checked disabled>
              </div>
            </div>

            <div class="d-flex align-items-center justify-content-between py-3">
              <div>
                <div class="text-white font-semibold">Automatic Database Auto-Migration</div>
                <div class="text-muted small">Cloud-native Supabase PostgreSQL database connection</div>
              </div>
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" checked disabled>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>
