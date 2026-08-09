<?php
$user_name = $_SESSION['full_name'] ?? 'Dr. Researcher';
$user_role = $_SESSION['role'] ?? 'researcher';
?>
<div class="top-navbar">
  <div class="d-flex align-items-center gap-3">
    <button class="btn btn-glass p-2 d-flex align-items-center justify-content-center" id="sidebar-toggle-btn">
      <i class="bi bi-list fs-5"></i>
    </button>
      <span class="badge badge-tech primary px-3 py-2"><i class="bi bi-shield-check me-1"></i> Supabase Cloud Active</span>
  </div>

  <div class="d-flex align-items-center gap-3">
    <!-- Notifications Pill -->
    <a href="notifications.php" class="btn btn-glass position-relative p-2 d-flex align-items-center justify-content-center">
      <i class="bi bi-bell fs-5"></i>
      <span class="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-dark rounded-circle">
        <span class="visually-hidden">New alerts</span>
      </span>
    </a>

    <!-- User Profile Dropdown -->
    <div class="dropdown">
      <button class="btn btn-glass dropdown-toggle d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown">
        <div class="rounded-circle bg-gradient-primary d-flex align-items-center justify-content-center" style="width: 32px; height: 32px; background: #6366f1;">
          <i class="bi bi-person-fill text-white"></i>
        </div>
        <span class="d-none d-md-inline font-semibold"><?php echo htmlspecialchars($user_name); ?></span>
      </button>
      <ul class="dropdown-menu dropdown-menu-end glass-panel text-white mt-2 p-2">
        <li class="px-3 py-1 text-muted small border-bottom border-secondary mb-2">Role: <?php echo ucfirst($user_role); ?></li>
        <li><a class="dropdown-menu-item text-white text-decoration-none d-block px-3 py-1 hover-bg" href="profile.php"><i class="bi bi-person me-2"></i> Profile</a></li>
        <li><a class="dropdown-menu-item text-white text-decoration-none d-block px-3 py-1 hover-bg" href="settings.php"><i class="bi bi-gear me-2"></i> Settings</a></li>
        <li><hr class="dropdown-divider border-secondary"></li>
        <li><a class="dropdown-menu-item text-danger text-decoration-none d-block px-3 py-1" href="logout.php"><i class="bi bi-box-arrow-right me-2"></i> Logout</a></li>
      </ul>
    </div>
  </div>
</div>
