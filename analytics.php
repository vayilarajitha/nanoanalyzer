<?php
require_once __DIR__ . '/config/db.php';
require_login();

$page_title = 'Analytics & Visualizations | NanoAnalyzer';
include __DIR__ . '/includes/header.php';
?>

<div id="wrapper">
  <?php include __DIR__ . '/includes/sidebar.php'; ?>

  <div id="page-content-wrapper">
    <?php include __DIR__ . '/includes/navbar.php'; ?>

    <div class="container-fluid p-4">
      <div class="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3">
        <div>
          <h2 class="text-white fw-bold mb-1">Advanced Analytics & Visualizations</h2>
          <p class="text-muted mb-0">Real-time biophysical statistics driven directly by Supabase PostgreSQL database records.</p>
        </div>
        <button onclick="location.reload()" class="btn btn-glass"><i class="bi bi-arrow-clockwise me-1"></i> Refresh Data</button>
      </div>

      <!-- Charts Grid -->
      <div class="row g-4 mb-4">
        <!-- 1. Size vs Uptake -->
        <div class="col-lg-6">
          <div class="glass-panel p-4">
            <h5 class="text-white fw-bold mb-3"><i class="bi bi-graph-up-arrow text-cyan me-2"></i> Cellular Uptake vs Size (nm)</h5>
            <div style="height: 300px;">
              <canvas id="uptakeSizeChart"></canvas>
            </div>
          </div>
        </div>

        <!-- 2. Material Share -->
        <div class="col-lg-6">
          <div class="glass-panel p-4">
            <h5 class="text-white fw-bold mb-3"><i class="bi bi-pie-chart-fill text-primary me-2"></i> Core Material Composition</h5>
            <div style="height: 300px;">
              <canvas id="materialDistChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <!-- 3. Toxicity Comparison -->
        <div class="col-lg-6">
          <div class="glass-panel p-4">
            <h5 class="text-white fw-bold mb-3"><i class="bi bi-bar-chart-fill text-rose me-2"></i> Mean Cytotoxicity Index by Material</h5>
            <div style="height: 300px;">
              <canvas id="toxicityChart"></canvas>
            </div>
          </div>
        </div>

        <!-- 4. Cell Line Internalisation -->
        <div class="col-lg-6">
          <div class="glass-panel p-4">
            <h5 class="text-white fw-bold mb-3"><i class="bi bi-activity text-emerald me-2"></i> Mean Internalisation by Cell Line</h5>
            <div style="height: 300px;">
              <canvas id="cellLineChart"></canvas>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>
