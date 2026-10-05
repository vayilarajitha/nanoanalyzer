/**
 * Professional Dark-Themed HTML Test Execution Reporter
 * Reads real execution results and generates an interactive, high-fidelity dashboard.
 */

const fs = require('fs');
const path = require('path');

const CATEGORIES = [
  'Functional',
  'UI/UX',
  'Compatibility',
  'Performance',
  'Security',
  'API',
  'Database',
  'Accessibility',
  'Mobile-Specific',
  'Regression',
  'E2E'
];

function loadResults(resultsPath) {
  const jsonlFile = resultsPath || path.join(__dirname, '..', '.wdio-results.jsonl');
  if (!fs.existsSync(jsonlFile)) {
    return [];
  }

  const content = fs.readFileSync(jsonlFile, 'utf8');
  const lines = content.split('\n').filter(l => l.trim().length > 0);
  const results = [];

  for (const line of lines) {
    try {
      results.push(JSON.parse(line));
    } catch (e) {
      // Ignore corrupted lines
    }
  }

  return results;
}

function generateHtmlReport(customResults = null, outputPath = null) {
  const results = customResults || loadResults();
  const targetFile = outputPath || path.join(__dirname, '..', 'reports', 'execution-report.html');
  const targetDir = path.dirname(targetFile);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Calculate stats from actual test records
  const total = results.length;
  const passed = results.filter(r => (r.status || '').toUpperCase() === 'PASSED').length;
  const failed = results.filter(r => (r.status || '').toUpperCase() === 'FAILED').length;
  const blocked = results.filter(r => (r.status || '').toUpperCase() === 'BLOCKED').length;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(2) : '0.00';
  const totalDurationMs = results.reduce((acc, r) => acc + (r.duration || 0), 0);
  const totalDurationSec = (totalDurationMs / 1000).toFixed(2);
  const runTimestamp = new Date().toISOString();

  // Category stats
  const catStats = CATEGORIES.map(cat => {
    const tests = results.filter(r => (r.category || '').toLowerCase() === cat.toLowerCase());
    const cTotal = tests.length;
    const cPassed = tests.filter(r => (r.status || '').toUpperCase() === 'PASSED').length;
    const cFailed = tests.filter(r => (r.status || '').toUpperCase() === 'FAILED').length;
    const cRate = cTotal > 0 ? ((cPassed / cTotal) * 100).toFixed(1) : '0.0';
    const cDur = tests.reduce((acc, r) => acc + (r.duration || 0), 0);
    return { name: cat, total: cTotal, passed: cPassed, failed: cFailed, rate: cRate, duration: cDur };
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Brain Battle Appium E2E Automation - Execution Report</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-primary: #0f172a;
      --bg-secondary: #1e293b;
      --bg-card: #1e293b;
      --bg-card-hover: #334155;
      --border-color: #334155;
      --text-primary: #f8fafc;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
      --accent-primary: #38bdf8;
      --accent-glow: rgba(56, 189, 248, 0.15);
      --success: #10b981;
      --success-glow: rgba(16, 185, 129, 0.2);
      --danger: #ef4444;
      --danger-glow: rgba(239, 68, 68, 0.2);
      --warning: #f59e0b;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.5;
      padding: 2rem;
      min-height: 100vh;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-color);
      flex-wrap: wrap;
      gap: 1rem;
    }

    .header-left h1 {
      font-size: 1.75rem;
      font-weight: 700;
      letter-spacing: -0.025em;
      background: linear-gradient(135deg, #38bdf8, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .header-left p {
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin-top: 0.25rem;
    }

    .badge-live {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: var(--success);
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .pulse {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--success);
      box-shadow: 0 0 10px var(--success);
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2.5rem;
    }

    .metric-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1.5rem;
      transition: transform 0.2s ease, border-color 0.2s ease;
    }

    .metric-card:hover {
      transform: translateY(-2px);
      border-color: var(--accent-primary);
    }

    .metric-label {
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .metric-val {
      font-size: 2rem;
      font-weight: 700;
      margin-top: 0.5rem;
      color: var(--text-primary);
    }

    .metric-val.success { color: var(--success); text-shadow: 0 0 15px var(--success-glow); }
    .metric-val.danger { color: var(--danger); text-shadow: 0 0 15px var(--danger-glow); }
    .metric-val.accent { color: var(--accent-primary); }

    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
      margin-bottom: 2.5rem;
    }

    .category-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 1rem 1.25rem;
    }

    .category-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .category-name {
      font-weight: 600;
      font-size: 0.95rem;
    }

    .category-rate {
      font-size: 0.85rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 6px;
      background: rgba(56, 189, 248, 0.1);
      color: var(--accent-primary);
    }

    .progress-bar-bg {
      height: 6px;
      background: #334155;
      border-radius: 9999px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #38bdf8);
      border-radius: 9999px;
      transition: width 0.5s ease;
    }

    .category-stats-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .table-container {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      overflow: hidden;
    }

    .table-toolbar {
      padding: 1rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-color);
      flex-wrap: wrap;
      gap: 1rem;
    }

    .search-box {
      background: #0f172a;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 0.5rem 1rem;
      color: var(--text-primary);
      font-size: 0.9rem;
      outline: none;
      width: 300px;
    }

    .search-box:focus {
      border-color: var(--accent-primary);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.875rem;
    }

    th {
      background: #151f32;
      padding: 0.85rem 1rem;
      font-weight: 600;
      color: var(--text-secondary);
      border-bottom: 1px solid var(--border-color);
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
    }

    td {
      padding: 0.85rem 1rem;
      border-bottom: 1px solid var(--border-color);
      color: var(--text-primary);
    }

    tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }

    .badge {
      display: inline-block;
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .badge.passed {
      background: rgba(16, 185, 129, 0.15);
      color: var(--success);
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .badge.failed {
      background: rgba(239, 68, 68, 0.15);
      color: var(--danger);
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .badge.blocked {
      background: rgba(245, 158, 11, 0.15);
      color: var(--warning);
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .mono {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      color: var(--accent-primary);
    }

    footer {
      margin-top: 3rem;
      text-align: center;
      color: var(--text-muted);
      font-size: 0.85rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color);
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="header-left">
        <h1>Brain Battle Mobile Appium Automation</h1>
        <p>1,111 Mega Test Suite Execution Report &bull; Android Emulator Pipeline</p>
      </div>
      <div class="badge-live">
        <span class="pulse"></span>
        Report Generated: ${runTimestamp}
      </div>
    </header>

    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-label">Total Tests</div>
        <div class="metric-val accent">${total}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Passed</div>
        <div class="metric-val success">${passed}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Failed</div>
        <div class="metric-val danger">${failed}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Pass Rate</div>
        <div class="metric-val ${parseFloat(passRate) >= 95 ? 'success' : 'danger'}">${passRate}%</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Total Duration</div>
        <div class="metric-val">${totalDurationSec}s</div>
      </div>
    </div>

    <h2 class="section-title">Execution Breakdown by Category</h2>
    <div class="category-grid">
      ${catStats.map(cs => `
        <div class="category-card">
          <div class="category-head">
            <span class="category-name">${cs.name}</span>
            <span class="category-rate">${cs.rate}%</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${cs.rate}%;"></div>
          </div>
          <div class="category-stats-row">
            <span>Pass: ${cs.passed}/${cs.total}</span>
            <span>Duration: ${(cs.duration / 1000).toFixed(2)}s</span>
          </div>
        </div>
      `).join('')}
    </div>

    <h2 class="section-title">Detailed Test Cases Registry (${total})</h2>
    <div class="table-container">
      <div class="table-toolbar">
        <input type="text" id="searchInput" class="search-box" placeholder="Filter by Test ID, name, or status..." onkeyup="filterTable()">
        <span style="font-size: 0.85rem; color: var(--text-secondary);" id="tableCountDisplay">Showing all ${total} tests</span>
      </div>
      <div style="max-height: 600px; overflow-y: auto;">
        <table id="testTable">
          <thead>
            <tr>
              <th style="width: 140px;">Test ID</th>
              <th style="width: 130px;">Category</th>
              <th>Test Name</th>
              <th style="width: 100px;">Status</th>
              <th style="width: 110px;">Duration</th>
              <th>Error Details</th>
            </tr>
          </thead>
          <tbody>
            ${results.map(r => `
              <tr>
                <td class="mono">${r.testId || '-'}</td>
                <td>${r.category || '-'}</td>
                <td>${escapeHtml(r.testName || '')}</td>
                <td><span class="badge ${(r.status || 'passed').toLowerCase()}">${r.status || 'PASSED'}</span></td>
                <td>${r.duration || 0} ms</td>
                <td style="color: var(--danger); font-size: 0.8rem;">${escapeHtml(r.error || '-')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <footer>
      Brain Battle Mobile Appium E2E Automation Pipeline &bull; Automated CI Execution &bull; Android API 29 Nexus 6
    </footer>
  </div>

  <script>
    function filterTable() {
      const input = document.getElementById('searchInput');
      const filter = input.value.toLowerCase();
      const table = document.getElementById('testTable');
      const trs = table.getElementsByTagName('tr');
      let visible = 0;

      for (let i = 1; i < trs.length; i++) {
        const text = trs[i].textContent.toLowerCase();
        if (text.includes(filter)) {
          trs[i].style.display = '';
          visible++;
        } else {
          trs[i].style.display = 'none';
        }
      }
      document.getElementById('tableCountDisplay').innerText = 'Showing ' + visible + ' of ' + (trs.length - 1) + ' tests';
    }
  </script>
</body>
</html>`;

  fs.writeFileSync(targetFile, html, 'utf8');
  console.log(`[GenerateHtmlReport] HTML report saved to: ${targetFile}`);
  return targetFile;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = generateHtmlReport;
