<?php
require_once __DIR__ . '/../config/db.php';
require_login();

if (!is_admin()) {
    die("<div style='font-family:sans-serif; padding:40px; text-align:center; background:#090d16; color:#fff;'>
        <h2 style='color:#f43f5e;'>Access Denied</h2>
        <p>You require Administrator privileges to access the NanoAnalyzer Admin Panel.</p>
        <a href='../dashboard.php' style='color:#06b6d4;'>Return to Dashboard</a>
    </div>");
}

$page_title = 'Admin Panel | NanoAnalyzer';

// Handle user role toggles or deletion
if (isset($_POST['action'])) {
    if ($_POST['action'] === 'toggle_role') {
        $target_id = trim($_POST['user_id'] ?? '');
        $new_role = ($_POST['role'] ?? '') === 'admin' ? 'researcher' : 'admin';
        $pdo->prepare("UPDATE users SET role = ? WHERE id = ?")->execute([$new_role, $target_id]);
    }
    if ($_POST['action'] === 'delete_user') {
        $target_id = trim($_POST['user_id'] ?? '');
        if ($target_id !== get_current_user_id()) {
            $pdo->prepare("DELETE FROM users WHERE id = ?")->execute([$target_id]);
        }
    }
    header('Location: index.php');
    exit;
}

// Fetch Admin Stats
try {
    $user_count = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
    $chat_log_count = $pdo->query("SELECT COUNT(*) FROM chatbot_logs")->fetchColumn();
    $pred_count = $pdo->query("SELECT COUNT(*) FROM analysis_results")->fetchColumn();
    
    // Users List
    $users_list = $pdo->query("SELECT * FROM users ORDER BY created_at ASC")->fetchAll();
    
    // Chatbot Logs List
    $chat_logs = $pdo->query("SELECT c.*, u.full_name FROM chatbot_logs c LEFT JOIN users u ON c.user_id = u.id ORDER BY c.created_at DESC LIMIT 20")->fetchAll();

} catch (PDOException $e) {
    $user_count = 0; $chat_log_count = 0; $pred_count = 0;
    $users_list = []; $chat_logs = [];
}

include __DIR__ . '/../includes/header.php';
?>

<div id="wrapper">
  <!-- Admin Sidebar -->
  <div id="sidebar-wrapper">
    <div class="sidebar-brand">
      <i class="bi bi-shield-lock-fill text-cyan fs-3"></i>
      <span>Admin<span class="text-cyan">Panel</span></span>
    </div>
    <ul class="sidebar-nav">
      <li><a href="../dashboard.php" class="nav-link"><i class="bi bi-speedometer2"></i> Main App Dashboard</a></li>
      <li><a href="index.php" class="nav-link active"><i class="bi bi-person-lines-fill"></i> User & System Mgmt</a></li>
      <li><a href="../logout.php" class="nav-link text-danger"><i class="bi bi-box-arrow-right text-danger"></i> Logout</a></li>
    </ul>
  </div>

  <div id="page-content-wrapper">
    <div class="top-navbar">
      <h5 class="text-white mb-0 font-bold"><i class="bi bi-shield-check text-cyan me-2"></i> NanoAnalyzer System Administration</h5>
      <span class="badge badge-tech primary">Root Access</span>
    </div>

    <div class="container-fluid p-4">
      <!-- Admin Metric Stat Cards -->
      <div class="row g-4 mb-4">
        <div class="col-md-4">
          <div class="glass-panel stat-card">
            <div class="stat-icon primary"><i class="bi bi-people-fill"></i></div>
            <div class="stat-number text-white"><?php echo $user_count; ?></div>
            <div class="text-muted font-semibold">Registered Researchers</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="glass-panel stat-card">
            <div class="stat-icon cyan"><i class="bi bi-robot"></i></div>
            <div class="stat-number text-cyan"><?php echo $chat_log_count; ?></div>
            <div class="text-muted font-semibold">Chatbot Logs Saved</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="glass-panel stat-card">
            <div class="stat-icon emerald"><i class="bi bi-cpu-fill"></i></div>
            <div class="stat-number text-emerald"><?php echo $pred_count; ?></div>
            <div class="text-muted font-semibold">Total AI Simulations</div>
          </div>
        </div>
      </div>

      <!-- User Management Table -->
      <div class="glass-panel p-4 mb-4">
        <h5 class="text-white fw-bold mb-3"><i class="bi bi-people me-2 text-cyan"></i> Registered User Management</h5>
        <div class="table-responsive">
          <table class="table table-custom">
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Username</th>
                <th>Email Address</th>
                <th>Institution</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <?php foreach ($users_list as $u): ?>
                  <tr>
                    <td><code><?php echo substr($u['id'], 0, 8); ?>...</code></td>
                  <td class="fw-bold text-white"><?php echo htmlspecialchars($u['full_name']); ?></td>
                  <td><code><?php echo htmlspecialchars($u['username']); ?></code></td>
                  <td><?php echo htmlspecialchars($u['email']); ?></td>
                  <td><?php echo htmlspecialchars($u['institution']); ?></td>
                  <td><span class="badge badge-tech <?php echo $u['role'] === 'admin' ? 'emerald' : 'primary'; ?>"><?php echo strtoupper($u['role']); ?></span></td>
                  <td>
                    <form method="POST" action="index.php" class="d-inline">
                      <input type="hidden" name="user_id" value="<?php echo $u['id']; ?>">
                      <input type="hidden" name="role" value="<?php echo $u['role']; ?>">
                      <input type="hidden" name="action" value="toggle_role">
                      <button type="submit" class="btn btn-sm btn-glass me-1">Toggle Role</button>
                    </form>
                    <?php if ($u['id'] !== get_current_user_id()): ?>
                      <form method="POST" action="index.php" class="d-inline" onsubmit="return confirm('Delete this user?');">
                        <input type="hidden" name="user_id" value="<?php echo $u['id']; ?>">
                        <input type="hidden" name="action" value="delete_user">
                        <button type="submit" class="btn btn-sm btn-glass text-danger">Delete</button>
                      </form>
                    <?php endif; ?>
                  </td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Chatbot Logs Table (Saved in chatbot_logs table) -->
      <div class="glass-panel p-4">
        <h5 class="text-white fw-bold mb-3"><i class="bi bi-chat-left-text me-2 text-cyan"></i> Floating AI Chatbot Conversations (chatbot_logs)</h5>
        <div class="table-responsive">
          <table class="table table-custom align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>User / Session</th>
                <th>User Prompt Message</th>
                <th>Bot AI Response</th>
                <th>Intent</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              <?php if (count($chat_logs) > 0): ?>
                <?php foreach ($chat_logs as $cl): ?>
                  <tr>
                    <td><code><?php echo substr($cl['id'], 0, 8); ?>...</code></td>
                    <td><strong class="text-white"><?php echo htmlspecialchars($cl['full_name'] ?: 'Guest'); ?></strong><br><small class="text-muted font-mono"><?php echo substr($cl['session_id'], 0, 10); ?>...</small></td>
                    <td class="text-cyan small" style="max-width: 250px;"><?php echo htmlspecialchars($cl['user_message']); ?></td>
                    <td class="text-muted small" style="max-width: 320px;"><?php echo htmlspecialchars($cl['bot_response']); ?></td>
                    <td><span class="badge badge-tech cyan"><?php echo htmlspecialchars($cl['intent']); ?></span></td>
                    <td class="text-muted small"><?php echo date('Y-m-d H:i', strtotime($cl['created_at'])); ?></td>
                  </tr>
                <?php endforeach; ?>
              <?php else: ?>
                <tr><td colspan="6" class="text-center text-muted py-3">No chatbot interaction logs recorded yet.</td></tr>
              <?php endif; ?>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</div>

<?php include __DIR__ . '/../includes/footer.php'; ?>
