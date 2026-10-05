/**
 * GitHub Actions Step Summary Generator
 * Appends markdown tables and status badges to $GITHUB_STEP_SUMMARY.
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
      // Ignore
    }
  }

  return results;
}

function generateSummary(customResults = null, outputPath = null) {
  const results = customResults || loadResults();
  const summaryFile = outputPath || process.env.GITHUB_STEP_SUMMARY || path.join(__dirname, '..', 'reports', 'summary.md');
  const targetDir = path.dirname(summaryFile);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const total = results.length;
  const passed = results.filter(r => (r.status || '').toUpperCase() === 'PASSED').length;
  const failed = results.filter(r => (r.status || '').toUpperCase() === 'FAILED').length;
  const blocked = results.filter(r => (r.status || '').toUpperCase() === 'BLOCKED').length;
  const notExecuted = results.filter(r => (r.status || '').toUpperCase() === 'SKIPPED' || (r.status || '').toUpperCase() === 'NOT_EXECUTED').length;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(2) : '0.00';
  const totalDurationMs = results.reduce((acc, r) => acc + (r.duration || 0), 0);
  const totalDurationSec = (totalDurationMs / 1000).toFixed(2);
  const isCompleteSuccess = total > 0 && failed === 0 && blocked === 0;

  let md = '';
  md += `## 🚀 PerioTwin Android App (Appium) - E2E Automation Run Summary\n\n`;
  md += `**Status:** ${isCompleteSuccess ? '✅ **PASSED (100% Success)**' : '❌ **FAILED OR INCOMPLETE**'}\n\n`;
  md += `### 📊 High-Level Metrics\n\n`;
  md += `| Metric | Count | Percentage |\n`;
  md += `| :--- | :---: | :---: |\n`;
  md += `| **Total Tests** | ${total} | 100.00% |\n`;
  md += `| **Passed** | ${passed} | ${passRate}% |\n`;
  md += `| **Failed** | ${failed} | ${total > 0 ? ((failed / total) * 100).toFixed(2) : '0.00'}% |\n`;
  md += `| **Blocked** | ${blocked} | ${total > 0 ? ((blocked / total) * 100).toFixed(2) : '0.00'}% |\n`;
  md += `| **Not Executed** | ${notExecuted} | ${total > 0 ? ((notExecuted / total) * 100).toFixed(2) : '0.00'}% |\n`;
  md += `| **Total Duration** | ${totalDurationSec}s (${totalDurationMs} ms) | - |\n\n`;

  md += `### 📁 Category Breakdown\n\n`;
  md += `| Category | Total | Passed | Failed | Pass Rate | Duration |\n`;
  md += `| :--- | :---: | :---: | :---: | :---: | :---: |\n`;

  CATEGORIES.forEach(cat => {
    const tests = results.filter(r => (r.category || '').toLowerCase() === cat.toLowerCase());
    const cTotal = tests.length;
    const cPassed = tests.filter(r => (r.status || '').toUpperCase() === 'PASSED').length;
    const cFailed = tests.filter(r => (r.status || '').toUpperCase() === 'FAILED').length;
    const cRate = cTotal > 0 ? ((cPassed / cTotal) * 100).toFixed(1) + '%' : '0.0%';
    const cDur = (tests.reduce((acc, r) => acc + (r.duration || 0), 0) / 1000).toFixed(2) + 's';
    md += `| **${cat}** | ${cTotal} | ${cPassed} | ${cFailed} | ${cRate} | ${cDur} |\n`;
  });

  md += `\n---\n*Report generated on ${new Date().toISOString()} via PerioTwinAppium E2E Automation Pipeline*\n`;

  fs.appendFileSync(summaryFile, md, 'utf8');
  console.log(`[GenerateSummary] Summary written to: ${summaryFile}`);
  return summaryFile;
}

module.exports = generateSummary;
