<?php
$current_page = basename($_SERVER['PHP_SELF']);
?>
<div id="sidebar-wrapper">
  <div class="sidebar-brand">
    <i class="bi bi-virus fs-3 text-cyan"></i>
    <span>Nano<span class="text-cyan">Analyzer</span></span>
  </div>
  
  <ul class="sidebar-nav">
    <li class="nav-heading">Core Engine</li>
    <li>
      <a href="dashboard.php" class="nav-link <?php echo $current_page == 'dashboard.php' ? 'active' : ''; ?>">
        <i class="bi bi-grid-1x2-fill"></i>
        <span>Dashboard</span>
      </a>
    </li>
    <li>
      <a href="predict.php" class="nav-link <?php echo $current_page == 'predict.php' ? 'active' : ''; ?>">
        <i class="bi bi-cpu-fill"></i>
        <span>New Analysis</span>
      </a>
    </li>
    <li>
      <a href="analytics.php" class="nav-link <?php echo $current_page == 'analytics.php' ? 'active' : ''; ?>">
        <i class="bi bi-bar-chart-line-fill"></i>
        <span>Visualization</span>
      </a>
    </li>
    <li>
      <a href="results.php" class="nav-link <?php echo $current_page == 'results.php' ? 'active' : ''; ?>">
        <i class="bi bi-file-earmark-medical-fill"></i>
        <span>Results</span>
      </a>
    </li>
    <li>
      <a href="history.php" class="nav-link <?php echo $current_page == 'history.php' ? 'active' : ''; ?>">
        <i class="bi bi-clock-history"></i>
        <span>Analysis History</span>
      </a>
    </li>

    <li class="nav-heading">Lab & Data Hub</li>
    <li>
      <a href="datasets.php" class="nav-link <?php echo $current_page == 'datasets.php' ? 'active' : ''; ?>">
        <i class="bi bi-database-fill"></i>
        <span>Dataset Manager</span>
      </a>
    </li>
    <li>
      <a href="experiments.php" class="nav-link <?php echo $current_page == 'experiments.php' ? 'active' : ''; ?>">
        <i class="bi bi-vial"></i>
        <span>Experiments</span>
      </a>
    </li>
    <li>
      <a href="reports.php" class="nav-link <?php echo $current_page == 'reports.php' ? 'active' : ''; ?>">
        <i class="bi bi-printer-fill"></i>
        <span>Reports</span>
      </a>
    </li>
    <li>
      <a href="javascript:void(0)" onclick="document.getElementById('chatbot-toggle-btn').click();" class="nav-link">
        <i class="bi bi-robot"></i>
        <span>AI Assistant</span>
      </a>
    </li>

    <li class="nav-heading">Account & System</li>
    <li>
      <a href="notifications.php" class="nav-link <?php echo $current_page == 'notifications.php' ? 'active' : ''; ?>">
        <i class="bi bi-bell-fill"></i>
        <span>Notifications</span>
      </a>
    </li>
    <li>
      <a href="profile.php" class="nav-link <?php echo $current_page == 'profile.php' ? 'active' : ''; ?>">
        <i class="bi bi-person-circle"></i>
        <span>Profile</span>
      </a>
    </li>
    <li>
      <a href="settings.php" class="nav-link <?php echo $current_page == 'settings.php' ? 'active' : ''; ?>">
        <i class="bi bi-gear-fill"></i>
        <span>Settings</span>
      </a>
    </li>
    <li>
      <a href="contact.php" class="nav-link <?php echo $current_page == 'contact.php' ? 'active' : ''; ?>">
        <i class="bi bi-envelope-fill"></i>
        <span>Contact</span>
      </a>
    </li>
    
    <?php if (isset($_SESSION['role']) && $_SESSION['role'] === 'admin'): ?>
    <li class="nav-heading">Administration</li>
    <li>
      <a href="admin/index.php" class="nav-link <?php echo strpos($_SERVER['PHP_SELF'], 'admin') !== false ? 'active' : ''; ?>">
        <i class="bi bi-shield-lock-fill"></i>
        <span>Admin Panel</span>
      </a>
    </li>
    <?php endif; ?>

    <li class="mt-3">
      <a href="logout.php" class="nav-link text-danger">
        <i class="bi bi-box-arrow-right text-danger"></i>
        <span>Logout</span>
      </a>
    </li>
  </ul>
</div>
