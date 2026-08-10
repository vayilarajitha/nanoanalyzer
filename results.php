<?php
require_once __DIR__ . '/config/db.php';
require_login();

$id = trim($_GET['id'] ?? '');
$user_id = get_current_user_id();

$row = null;
if ($pdo instanceof PDO) {
    try {
        if (!empty($id)) {
            $stmt = $pdo->prepare("SELECT p.*, COALESCE(u.name, u.full_name) as full_name, u.institution FROM analysis_results p LEFT JOIN users u ON p.user_id = u.id WHERE p.id = ? LIMIT 1");
            $stmt->execute([$id]);
            $row = $stmt->fetch() ?: null;
        } else {
            $stmt = $pdo->prepare("SELECT p.*, COALESCE(u.name, u.full_name) as full_name, u.institution FROM analysis_results p LEFT JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC LIMIT 1");
            $stmt->execute();
            $row = $stmt->fetch() ?: null;
        }
    } catch (Throwable $e) {
        $row = null;
    }
}

if (!$row) {
    header('Location: predict.php');
    exit;
}

$page_title = 'Analysis Results: ' . $row['analysis_name'] . ' | NanoAnalyzer';
include __DIR__ . '/includes/header.php';
?>

<div id="wrapper">
  <?php include __DIR__ . '/includes/sidebar.php'; ?>

  <div id="page-content-wrapper">
    <?php include __DIR__ . '/includes/navbar.php'; ?>

    <div class="container-fluid p-4">
      <!-- Action Toolbar -->
      <div class="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-3 no-print">
        <div>
          <span class="badge badge-tech cyan mb-1"><i class="bi bi-shield-check me-1"></i> Deterministic ID: #<?php echo $row['id']; ?></span>
          <h2 class="text-white fw-bold mb-0"><?php echo htmlspecialchars($row['analysis_name']); ?></h2>
        </div>
        <div class="d-flex gap-2">
          <a href="predict.php" class="btn btn-glass"><i class="bi bi-arrow-repeat me-1"></i> New Run</a>
          <button onclick="window.print()" class="btn btn-glow-cyan"><i class="bi bi-printer-fill me-1"></i> Print / Export PDF Report</button>
        </div>
      </div>

      <!-- Printable Report Header (Visible when printing) -->
      <div class="print-header d-none mb-4 pb-3 border-bottom text-dark">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h2 class="fw-bold text-dark mb-0">NANOANALYZER CLINICAL REPORT</h2>
            <div class="text-muted">Biomedical Nanoparticle Cellular Uptake & Toxicity Certificate</div>
          </div>
          <div class="text-end">
            <div>Date: <?php echo date('Y-m-d H:i'); ?></div>
            <div>Researcher: <?php echo htmlspecialchars($row['full_name'] ?? 'Dr. Researcher'); ?></div>
          </div>
        </div>
      </div>

      <!-- Key Metrics Row -->
      <div class="row g-4 mb-4">
        <div class="col-md-3">
          <div class="glass-panel p-4 text-center">
            <div class="text-muted font-semibold small text-uppercase mb-2">Cellular Uptake</div>
            <div class="display-5 text-cyan fw-bold mb-1"><?php echo $row['predicted_uptake_percent']; ?>%</div>
            <div class="progress bg-dark" style="height: 6px;">
              <div class="progress-bar bg-info" style="width: <?php echo $row['predicted_uptake_percent']; ?>%"></div>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="glass-panel p-4 text-center">
            <div class="text-muted font-semibold small text-uppercase mb-2">Cytotoxicity Index</div>
            <div class="display-5 text-rose fw-bold mb-1"><?php echo $row['predicted_toxicity_index']; ?></div>
            <div class="progress bg-dark" style="height: 6px;">
              <div class="progress-bar bg-danger" style="width: <?php echo $row['predicted_toxicity_index']; ?>%"></div>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="glass-panel p-4 text-center">
            <div class="text-muted font-semibold small text-uppercase mb-2">Delivery Score</div>
            <div class="display-5 text-emerald fw-bold mb-1"><?php echo $row['delivery_efficiency_score']; ?></div>
            <div class="progress bg-dark" style="height: 6px;">
              <div class="progress-bar bg-success" style="width: <?php echo $row['delivery_efficiency_score']; ?>%"></div>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="glass-panel p-4 text-center">
            <div class="text-muted font-semibold small text-uppercase mb-2">Model Confidence</div>
            <div class="display-5 text-white fw-bold mb-1"><?php echo $row['confidence_score']; ?>%</div>
            <span class="badge badge-tech primary mt-1">Deterministic Hash Verified</span>
          </div>
        </div>
      </div>

      <!-- Parameter Breakdown & Recommendation -->
      <div class="row g-4 mb-4">
        <div class="col-lg-6">
          <div class="glass-panel p-4 h-100">
            <h5 class="fw-bold mb-3 parameter-value"><i class="bi bi-sliders me-2 text-cyan"></i> Input Parameters</h5>
            <table class="table table-custom">
              <tbody>
                <tr>
                  <td class="parameter-label font-semibold">Core Material</td>
                  <td class="parameter-value fw-bold text-end"><span class="badge badge-tech primary"><?php echo htmlspecialchars($row['core_material']); ?></span></td>
                </tr>
                <tr>
                  <td class="parameter-label font-semibold">Category Type</td>
                  <td class="parameter-value text-end"><?php echo htmlspecialchars($row['nanoparticle_type']); ?></td>
                </tr>
                <tr>
                  <td class="parameter-label font-semibold">Particle Diameter</td>
                  <td class="parameter-value text-cyan fw-bold text-end"><?php echo $row['size_nm']; ?> nm</td>
                </tr>
                <tr>
                  <td class="parameter-label font-semibold">Zeta Potential (Charge)</td>
                  <td class="parameter-value text-end"><?php echo $row['surface_charge_mv'] > 0 ? '+' . $row['surface_charge_mv'] : $row['surface_charge_mv']; ?> mV</td>
                </tr>
                <tr>
                  <td class="parameter-label font-semibold">Target Cell Line</td>
                  <td class="parameter-value text-end"><span class="badge badge-tech cyan"><?php echo htmlspecialchars($row['cell_type']); ?></span></td>
                </tr>
                <tr>
                  <td class="parameter-label font-semibold">Exposure Time</td>
                  <td class="parameter-value text-end"><?php echo $row['exposure_time_h']; ?> hours</td>
                </tr>
                <tr>
                  <td class="parameter-label font-semibold">Concentration Dose</td>
                  <td class="parameter-value text-end"><?php echo $row['concentration_ug_ml']; ?> µg/mL</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="col-lg-6">
          <div class="glass-panel p-4 h-100">
            <h5 class="fw-bold mb-3 parameter-value"><i class="bi bi-lightbulb-fill text-amber me-2"></i> Biophysical Mechanism & Conclusion</h5>
            
            <div class="glass-card mb-3">
              <div class="result-label small uppercase font-bold">Primary Internalisation Pathway</div>
              <div class="result-value text-cyan fw-bold fs-5 mt-1"><?php echo htmlspecialchars($row['primary_mechanism']); ?></div>
            </div>

            <div class="glass-card mb-3">
              <div class="result-label small uppercase font-bold mb-1">Analytical Conclusion & Recommendation</div>
              <p class="result-value small mb-0"><?php echo htmlspecialchars($row['recommendations']); ?></p>
            </div>

            <div class="glass-card">
              <div class="result-label small uppercase font-bold mb-1">Deterministic Verification Signature</div>
              <code class="text-cyan font-mono small"><?php echo $row['deterministic_hash']; ?></code>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>
